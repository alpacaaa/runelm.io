// @flow weak


const fs = require('fs-extra')
const crypto = require('crypto')
const { compileToString } = require('node-elm-compiler')


const util = require('./util')
const prettifyError = require('./prettify-error')
const { runElmFormat } = require('./formatter')
const { htmlTemplate , errorTemplate } = require('./templates')

const noop = () => null

const checksum = (...objects) => {
  return objects.map(o =>
    crypto
    .createHash('md5')
    .update(JSON.stringify(o || {}))
    .digest('hex')
  )
  .join('')
}

const stat = path => {
  try {
    // disgusting
    fs.accessSync(path)
    return true
  } catch (e) {}
}

const readFile = file => fs.readFileSync(file).toString()


const elmMakeExploded = error => {
  return error.indexOf('unsatisified constraints') > -1
}


const createCompiler = ({ snippetById, snippetFolder, }) => {


  const compile = id => {
    const folder = snippetFolder + id + '/'
    const target = folder + 'index.html'
    const checksumFile = folder + 'checksum.json'

    return snippetById(id)
    .then(data => {
      if (!data) return null

      fs.ensureDirSync(folder)

      const check = {
        files: checksum(data.files, data.stylesheets),
        packages: checksum(data.dependencies),
      }

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

      const handleCompileErrors = error => {
        const string = error.toString()
        if (elmMakeExploded(string)) {
          fs.removeSync(folder + 'elm-stuff')
          fs.removeSync(target)

          // retry
          return compile(id)
        }

        const message = prettifyError(string)
        return errorTemplate({ title: 'Error', message })
      }

      return compileToString([main], options)
      .then(writeFiles(createHtml))
      .catch(writeFiles(handleCompileErrors))
    })
    .catch(console.log)
  }


  return { compile }
}



module.exports = createCompiler
