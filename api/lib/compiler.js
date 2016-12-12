// @flow weak


const fs = require('fs-extra')
const crypto = require('crypto')
const { compileToString } = require('node-elm-compiler')


const util = require('./util')
const prettifyError = require('./prettify-error')
const { runElmFormat } = require('./formatter')
const { htmlTemplate , errorTemplate } = require('./templates')

const noop = () => null

const checksum = object => {
  return crypto
  .createHash('md5')
  .update(JSON.stringify(object || {}))
  .digest('hex')
}

const stat = path => {
  try {
    // disgusting
    fs.accessSync(path)
    return true
  } catch (e) {}
}

const readFile = file => fs.readFileSync(file).toString()



const createCompiler = ({ snippetById, snippetFolder, }) => {


  const compile = id => {
    const folder = snippetFolder + id

    return snippetById(id)
    .then(data => {
      if (!data) return null

      fs.ensureDirSync(folder)

      const check = {
        files: checksum(data.files),
        packages: checksum(data.dependencies),
      }

      const target = folder + 'index.html'
      const checksumFile = folder + 'checksum.json'

      if (stat(checksumFile)) {
        const currentCheck = fs.readJsonSync(checksumFile)

        if (check.packages !== currentCheck.packages) {
          fs.removeSync(folder + 'elm-stuff')
          fs.removeSync(target)
        }

        if (
          check.files === currentCheck.files &&
          stat(target)
        ) {
          return Promise.resolve(readFile(target))
        }
      }


      data.files.map(file => {
        fs.writeFileSync(folder + file.filename, file.content)
      })

      const elmjson = util.createElmPackageJson(data)
      fs.writeFileSync(`${folder}elm-package.json`, JSON.stringify(elmjson))

      const main = `${folder}Main.elm`
      const options = {
        yes: true,
        cwd: folder,
        output: 'file.js',
        pathToMake: '/src/elm/elm-0.18.0/dist_binaries/elm-make',
      }

      const writeFiles = fn => result => {
        const html = fn(result)
        fs.writeFileSync(target, html)
        fs.writeJsonSync(checksumFile, check)
        return html
      }

      const createHtml = result => {
        const js = result.toString()
        const title = (data.title || 'Untitled') + ` | runelm.io`
        return htmlTemplate({ js, title, stylesheets: data.stylesheets })
      }

      return compileToString([main], options)
      .then(writeFiles(createHtml))
      .catch(writeFiles(error => {
        const message = prettifyError(error.toString())
        return errorTemplate({ title: 'Error', message })
      }))
    })
    .catch(console.log)
  }


  return { compile }
}



module.exports = createCompiler
