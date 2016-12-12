// @flow weak


const crypto = require('crypto')

const depsToObject = dependencies => {
  return dependencies.reduce((acc, item) => {
    return Object.assign({}, acc, {
      [item.name]: item.version,
    })
  }, {})
}

const objectToDeps = dependencies => {
  return Object.keys(dependencies).map(name => ({
    name,
    version: dependencies[name],
  }))
}

const createElmPackageJson = data => {
  return {
    "version": "1.0.0",
    "summary": "Snippet created with runelm.io",
    "license": "BSD3",
    "repository": "https://github.com/thereisno/repository.git",
    "source-directories": ["."],
    "exposed-modules": [],
    "dependencies": data.dependencies,
    "elm-version": "0.18.0 <= v < 0.19.0"
  }
}

const newSnippetId = () => {
  const hash = crypto.randomBytes(10)
  .toString('base64').replace(/[^a-z0-9]/g, '')
  return Promise.resolve(hash.substr(0, 3))
}

module.exports = {
  depsToObject,
  objectToDeps,
  newSnippetId,
  createElmPackageJson,
}
