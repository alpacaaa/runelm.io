// @flow weak

const Promise = require('bluebird')
const request = require('request-promise')
const jsonFormatter = require('format-json')

const util = require('./util')
const fs = require('fs-extra')
// $FlowFixMe
const url = require('url')

const ratioHelp = (width, height) => {
  return {
    width: Math.floor(width),
    height: Math.floor(height)
  }
}

const ratio = (w, h, defaultWidth) => {
  if (w && !h) return ratioHelp(w, w / 16 * 12)
  if (h && !w) return ratioHelp(h / 12 * 16, h)
  if (w && h) return ratioHelp(w, h)

  return ratioHelp(defaultWidth, defaultWidth / 16 * 12)
}

const createRoutes = ({
  insertUser,
  snippetById,
  auth,
  compile,
  createAuthUri,
  decodeAccessToken,
  authFinishedRedirect,
}) => {


  const snippetResult = (req, res) => {
    compile(req.params.snippet)
    .then(html => res.send(html))
  }

  const githubLogin = (req, res) => {
    const { token } = req.query

    const authorizationUri = createAuthUri(token)
    res.redirect(authorizationUri)
  }

  const githubOAuthCallback = (req, res, next) => {
    const { code, state } = req.query

    decodeAccessToken(code)
    .then(data => {
      const { access_token } = data.token

      const options = {
        uri: 'https://api.github.com/user',
        qs: { access_token },
        headers: { 'User-Agent': 'runelm' },
        json: true,
      }

      return request(options)
    })
    .then(res => {
      const user = {
        id: res.login,
        name: res.name,
        email: res.email,
        avatarUrl: res.avatar_url,
      }

      const insert = insertUser(user)

      return Promise.props({
        id: user.id,
        insert,
      })
    })
    .then(({ id }) => {
      let current
      try {
        current = JSON.parse(state)
      }
      catch (e) {
        current = {}
      }

      const context = {
        auth: auth.decodeAuthorization('Bearer ' + current.currentToken)
      }

      return Promise.props({
        id,
        assign: auth.assignCurrentSnippets(context, id),
      })
    })
    .then(({ id }) => {
      const token = auth.createJWT({ github: id })
      res.redirect(authFinishedRedirect(token))
    })
  }


  const snippetDownload = (req, res) => {
    snippetById(req.params.snippet)
    .then(data => {
      if (!data) return res.status(404).end()

      const target = `runelm-snippet-${data.id}`
      const folder = `/tmp/archive-${(new Date()).getTime()}/${target}/`
      fs.ensureDirSync(folder)

      data.files.map(file => {
        fs.writeFileSync(folder + file.filename, file.content)
      })

      const elmjson = util.createElmPackageJson(data)
      fs.writeFileSync(`${folder}elm-package.json`, jsonFormatter.plain(elmjson))

      const { spawn } = require('child_process')

      const zipName = target + '.zip'
      const zip = spawn('zip', ['-r', zipName, target], { cwd: folder + '..' })

      zip.on('exit', code => {
        if (code === 0) {
          res.download(folder + '../' + zipName, zipName)
        }
        else {
          res.status(500).end()
        }

        fs.removeSync(folder)
      })
    })
  }


  const snippetEmbed = (req, res) => {
    const notFound = () =>
      res.sendStatus(404)

    const toParse = req.query.url
    if (!toParse) return notFound()

    const data = url.parse(toParse, true)

    if (data.hostname.indexOf('runelm.io') === -1)
      return notFound()

    const path = data.pathname || ''
    const { width, height } = ratio(req.query.width, req.query.height, 800)
    const [user, id] = path.substr(1).split('/')

    snippetById(id)
    .then(snippet => {
      if (!snippet) return notFound()

      return res.json({
        type: 'rich',
        version: '1.0',
        title: snippet.title || 'Untitled',
        provider_name: 'runelm.io',
        provider_url: 'https://runelm.io',
        width,
        height,
        html: `
<iframe
  src="https://runelm.io/c/${snippet.id}"
  width="${width}"
  height="${height}"
  frameBorder="0"
  allowtransparency="true">
</iframe>`.split('\n').join('')
      })
    })
  }


  return {
    githubLogin,
    githubOAuthCallback,
    snippetResult,
    snippetDownload,
    snippetEmbed,
  }
}




module.exports = createRoutes
