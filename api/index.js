// @flow

const cors = require('cors')
const raven = require('raven')
const config = require('config')
const express = require('express')
const { graphql } = require('graphql')
const simpleOAuth = require('simple-oauth2')
const graphqlHTTP = require('express-graphql')
const { makeExecutableSchema } = require('graphql-tools')

const db = require('./lib/db')(config.get('db'))
const schemaDef = require('./lib/schema-def')

const URLS = config.get('urls')
const SENTRY_URL = config.get('sentry.url')

const {
  snippetById,
  userById,
  insertSnippet,
  updateSnippet,
  snippetsByUser,
  updateUserInSnippets,
  insertUser,
} = require('./lib/fetch')({ db })

const auth = require('./lib/auth')({
  snippetById,
  updateUserInSnippets,
  jwtSecret: config.get('jwtSecret'),
})

const { compile } = require('./lib/compiler')({
  snippetById,
  snippetFolder: '/src/cache/',
})

const routes = require('./lib/routes')({
  insertUser,
  snippetById,
  auth,
  compile,
  createAuthUri(token) {
    return oauth2.authorizationCode.authorizeURL({
      redirect_uri: URLS.api + 'oauth-callback',
      state: JSON.stringify({ currentToken: token }),
    })
  },
  decodeAccessToken(code) {
    return oauth2.authorizationCode.getToken({ code })
    .then(result => oauth2.accessToken.create(result))
  },
  authFinishedRedirect: token => `${URLS.website}set-auth-token?token=${token}`,
})

const resolvers = require('./lib/graphql-resolvers')({
  snippetById,
  userById,
  insertSnippet,
  updateSnippet,
  snippetsByUser,
  auth,
  compile,
})


const schema = makeExecutableSchema({
  typeDefs: schemaDef,
  resolvers,
})

const oauth2 = simpleOAuth.create({
  client: config.get('github.client'),
  auth: {
    tokenHost: 'https://github.com',
    tokenPath: '/login/oauth/access_token',
    authorizePath: '/login/oauth/authorize',
  },
})


const app = express()

SENTRY_URL && app.use(raven.middleware.express.requestHandler(SENTRY_URL))

app.use(cors())

app.use('/graphql', (req, res, next) => {
  const context = {
    auth: auth.decodeAuthorization(req.headers.authorization)
  }

  const graphqlMiddleware = graphqlHTTP({
    schema,
    context,
    graphiql: true,
  })

  graphqlMiddleware(req, res, next)
})


app.get('/github-login', routes.githubLogin)
app.get('/oauth-callback', routes.githubOAuthCallback)
app.get('/:user/:snippet/result', routes.snippetResult)
app.get('/:user/:snippet/download', routes.snippetDownload)


SENTRY_URL && app.use(raven.middleware.express.errorHandler(SENTRY_URL))

if (SENTRY_URL) {
  (new raven.Client(SENTRY_URL)).patchGlobal()
}

if (process.env.NUKE_DATA === '1') {
  db.importDb()
}

const PORT = 3000
app.listen(PORT, () => console.log('Server listening on port ' + PORT))
