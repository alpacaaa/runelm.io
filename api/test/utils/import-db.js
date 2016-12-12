// @flow weak

const fs = require('fs')
const Promise = require('bluebird')

const createTables = (r, tables) => {
  return Promise.map(tables, (t) => r.tableCreate(t).run())
}

const importData = (r, list) => {
  return Promise.map(list, ({ table, data }) => r.table(table).insert(data).run())
}

const tableName = (f) => f.split('.').shift()

const createIndexes = (r) => {
  const indexes = {
  }

  const tables = Object.keys(indexes)

  return Promise.map(tables, (t) => {
    const array = indexes[t] instanceof Array ? indexes[t] : [indexes[t]]
    return Promise.map(array, i => r.table(t).indexCreate(i).run())
  })
  .then(() => Promise.map(tables, (t) => r.table(t).indexWait().run()))
}



module.exports = (r, fixtures_path, db_name) => {

  return () => {
    if (process.env.NODE_ENV === 'production') {
      console.log(`I don't feel comfortable.`)
      return Promise.resolve()
    }

    const files = fs.readdirSync(fixtures_path)
    const tables = files.map(tableName)
    const data = files.reduce((acc, f) => {
      return [
        ...acc,
        {
          table: tableName(f),
          // $FlowFixMe: no other way around this
          data:  require(fixtures_path + f),
        }
      ]
    }, [])

    return r.branch(r.dbList().contains(db_name), r.dbDrop(db_name), null).run()
    .then(() => r.dbCreate(db_name).run())
    .then(() => createTables(r, tables))
    .then(() => createIndexes(r))
    .then(() => importData(r, data))
    .then(() => console.log("  Imported test data"))
  }
}
