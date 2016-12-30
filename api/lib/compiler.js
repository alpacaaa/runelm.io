// @flow weak

const fs = require('fs-extra')
const crypto = require('crypto')
const Promise = require('bluebird')
const ReadWriteLock = require('rwlock')
const NodeElmCompiler = require('node-elm-compiler')


const util = require('./util')
const prettifyError = require('./prettify-error')
const { runElmFormat } = require('./formatter')
const { htmlTemplate , errorTemplate } = require('./templates')

const noop = () => null
const lock = new ReadWriteLock()

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


const compileToString = (...args) => {
  return new Promise((resolve, reject) => {
    NodeElmCompiler.compileToString(...args)
    .then(data => resolve({ type: 'ok', data }))
    .catch(data => resolve({ type: 'error', data }))
  })
}


const createCompiler = ({ snippetById, snippetFolder, }) => {

  const compile = (id, retry = false) => {
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

      const writeFiles = html => {
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

        if (retry) {
          // exit if we retried already
          return writeFiles(
            `<h3>Something awful happened</h3>
             <p>Try editing your code and run again.</p>
            `
          )
        }

        if (elmMakeExploded(string)) {
          fs.removeSync(folder + 'elm-stuff')
          fs.removeSync(target)

          return compile(id, true)
        }

        const message = prettifyError(string)
        const template = errorTemplate({ title: 'Error', message })
        return writeFiles(template)
      }

      return compileToString([main], options)
      .then(result => {
        if (result.type === 'ok') {
          return writeFiles(createHtml(result.data))
        }

        return handleCompileErrors(result.data)
      })
    })
    .catch(console.log)
  }


  return {
    compile(id) {
      return new Promise((resolve, reject) => {
        lock.writeLock('compile-' + id, release => {
          compile(id)
          .then(data => {
            release()
            resolve(data)
            return null
          })
          .catch(reject)
        })
      })
    }
  }
}



module.exports = createCompiler
