// @flow weak

const Promise = require('bluebird')

const util = require('./util')
const Dependencies = require('./dependencies')
const { runElmFormat } = require('./formatter')

const createResolvers = ({
  snippetById,
  userById,
  insertSnippet,
  updateSnippet,
  snippetsByUser,
  auth,
  compile,
}) => {


  const resolvers = {
    Query: {
      snippet(root, { id }) {
        return snippetById(id)
      },

      me(root, args, context) {
        const user = auth.githubUser(context)
        if (!user) return null

        return userById(user)
      },

      findDependencies(root, { dependencies }) {
        return Dependencies.findMissing(dependencies)
      },

      formatCode(root, { code }) {
        return runElmFormat(code)
      },
    },

    Mutation: {
      compile(root, { id }) {
        return compile(id)
        .then(data => true)
      },

      createSnippet(root, args, context) {
        const defaultSnippet = {
          temporary: false,
          private: false,
          parent: null,
          user: null,
          title: "Untitled",
          description: "",
          dependencies: {
            "elm-lang/core": "5.0.0 <= v < 6.0.0",
            "elm-lang/html": "2.0.0 <= v < 3.0.0",
          },
        }

        const user = auth.githubUser(context)
        if (user) {
          defaultSnippet.user = user
        }

        return util.newSnippetId()
        .then(id => {
          const data = Object.assign(
            {},
            defaultSnippet,
            args,
            { id }
          )

          if (!data.parent) return data

          return snippetById(data.parent)
          .then(parent => {
            if (!parent) throw new Error('Parent does not exist')

            data.files = parent.files
            data.title = parent.title
            data.dependencies = parent.dependencies
            data.description = `Fork of runelm.io/c/${parent.id}`
            if (parent.stylesheets) {
              data.stylesheets = parent.stylesheets
            }

            return data
          })
        })
        .then(data => {
          const insert = insertSnippet(data)

          return Promise.props({
            id: data.id,
            insert,
          })
        })
        .then(data => ({ id: data.id }))
      },

      saveSnippetFiles: auth.ensureOwner((root, args) => {
        return Promise.all(args.files.map(f => {
          return Promise.props({
            filename: f.filename,
            content: runElmFormat(f.content),
          })
        }))
        .then(files => {
          const data = Object.assign({}, args, { files })

          return updateSnippet(data)
          .then(() => snippetById(data.id))
        })
      }),

      saveSnippetInfo: auth.ensureOwner((root, args) => {
        return updateSnippet(args)
        .then(() => snippetById(args.id))
      }),
    },


    Snippet: {
      dependencies({ dependencies }) {
        return util.objectToDeps(dependencies)
      },

      isOwner({ id }, args, context) {
        return auth.hasAccessToSnippet(context, id)
      },

      owner({ user }) {
        return user ? userById(user) : null
      },
    },

    IDWithToken: {
      token({ id }, args, context) {
        const withAccess = auth.accessToSnippets(context)
        const snippets = [...withAccess, id]
        return auth.createJWT({ snippets }, context)
      }
    },

    User: {
      snippets({ id }, args, context) {
        return snippetsByUser(id)
      }
    },
  }


  return resolvers

}


module.exports = createResolvers
