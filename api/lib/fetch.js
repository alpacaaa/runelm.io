// @flow weak

const util = require('./util')

const fetchWithDb = ({ db: r }) => ({

  snippetById(id) {
    return r.table('snippet')
    .get(id)
    .run()
  },

  userById(id) {
    return r.table('user')
    .get(id)
    .run()
  },

  updateUserInSnippets(user, snippets) {
    return r.table('snippet')
    .filter(doc => r.expr(snippets).contains(doc('id')))
    .update({ user })
    .run()
  },

  insertSnippet(data) {
    return r.table('snippet')
    .insert(data)
    .run()
  },

  updateSnippet(data) {
    const updated = Object.assign({}, data)

    if (data.dependencies && data.dependencies instanceof Array) {
      const dependencies = util.depsToObject(data.dependencies)
      updated.dependencies = r.literal(dependencies)
    }

    return r.table('snippet')
    .get(data.id)
    .update(updated)
    .run()
  },

  snippetsByUser(user) {
    return r.table('snippet')
    .filter({ user })
    .run()
  },

  insertUser(user) {
    return r.table('user')
    .insert(user, { conflict: 'update' })
    .run()
  },

  deleteSnippet(id) {
    return r.table('snippet')
    .get(id)
    .delete()
    .run()
  },
})


module.exports = fetchWithDb
