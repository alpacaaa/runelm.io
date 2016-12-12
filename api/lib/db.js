// @flow weak

module.exports = connection => {
  const db = require('rethinkdbdash')(connection)
  require('rethinkdbdash-timestampable').default(db)

  const importDb = require('../test/utils/import-db')
  db.importDb = importDb(db, __dirname + '/../test/fixtures/', connection.db)

  return db
}
