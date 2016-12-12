
module.exports = {
  db: {
    host: 'db',
    port: 28015,
    db: 'runelm'
    // user: null,
    // password: null,
  },
  jwtSecret: 'obama likes donuts',
  github: {
    client: {
      id: 'client id',
      secret: 'client secret'
    }
  },
  urls: {
    website: 'http://localhost:3000/',
    api: 'http://192.168.99.100:3000/',
  },
  sentry: {
    url: null
  },
}
