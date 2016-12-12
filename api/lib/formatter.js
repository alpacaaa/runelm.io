// @flow weak


const fs = require('fs-extra')
const Promise = require('bluebird')
const spawn = require('child_process').spawn


const runElmFormat = code => {
  const bin = '/src/elm/elm-format'

  return new Promise((resolve, reject) => {
    let output = []
    const child = spawn(bin, ['--stdin'])

    child.stdout.on('data', c => output.push(c.toString()))

    child.stdin.write(code)
    child.stdin.end()

    child.on('close', exitCode => {
      return resolve(exitCode ? code : output.join(''))
    })
  })
}

module.exports = {
  runElmFormat,
}
