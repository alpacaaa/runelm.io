// @flow weak

const fs = require('fs-extra')
const Promise = require('bluebird')
const exec = Promise.promisify(require('child_process').exec)

const util = require('./util')

const isValidDepName = name => {
  const parts = name.split('/')
  if (parts.length !== 2) return false
  return parts.every(str => str.match(/[A-Za-z0-9_.-]/g))
}


const findMissing = dependencies => {
  const missing = dependencies
  .filter(pkg => pkg.version === '')
  .map(pkg => pkg.name)

  if (!missing.length) return Promise.resolve(dependencies)

  if (!missing.every(isValidDepName))
    return Promise.resolve()

  const knownDependencies = util.depsToObject(
    dependencies
    .filter(pkg => pkg.version !== '')
  )

  const elmjson = util.createElmPackageJson({
    dependencies: knownDependencies,
  })

  const folder = `/tmp/deps-${(new Date().getTime())}/`
  const packageJson = folder + 'elm-package.json'

  fs.ensureDirSync(folder)
  fs.writeJsonSync(packageJson, elmjson)

  const installPackage = (ignore, pkg) => {
    const bin = '/src/elm/elm-0.18.0/dist_binaries/elm-package'
    const cmd = bin + ' install --yes ' + pkg
    const options = {
      cwd: folder,
    }

    return exec(cmd, options)
  }

  const cleanup = () => fs.remove(folder, () => null)

  return Promise.reduce(missing, installPackage, null)
  .then(result => {
    cleanup()

    const newDependencies = fs.readJsonSync(packageJson).dependencies
    return util.objectToDeps(newDependencies)
  })
  .catch(cleanup)
}



module.exports = {
  findMissing,
}
