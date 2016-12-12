// @flow weak

const jwt = require('jsonwebtoken')

const createAuth = ({
  snippetById,
  updateUserInSnippets,
  jwtSecret,
}) => {


  const decodeAuthorization = auth => {
    if (!auth) return null

    const parts = auth.split(' ')

    if (parts.length !== 2) return null

    const [scheme, token] = parts
    if (!/^Bearer$/i.test(scheme)) return null

    try {
      return jwt.verify(token, jwtSecret)
    } catch(e) {
      return null
    }
  }

  const accessToSnippets = context => {
    if (context.auth && context.auth.s) {
      return context.auth.s
    }

    return []
  }

  const hasAccessToSnippet = (context, id) => {
    const withAccess = accessToSnippets(context)
    if (withAccess.indexOf(id) > -1) {
      return Promise.resolve(true)
    }

    return snippetById(id)
    .then(data => {
      if (!data || !data.user) return false

      return data.user === githubUser(context)
    })
  }

  const ensureOwner = fn => (root, args, context) => {
    return hasAccessToSnippet(context, args.id)
    .then(isOwner => {
      return isOwner ? fn(root, args, context) : null
    })
  }

  const createJWT = (args, context = {}) => {
    const data = {
      snippets: args.snippets || accessToSnippets(context),
      username: args.github || (context.auth && context.auth.g),
    }

    return jwt.sign({ s: data.snippets, g: data.username }, jwtSecret)
  }

  const githubUser = context => context.auth && context.auth.g

  const assignCurrentSnippets = (context, user) => {
    const snippets = accessToSnippets(context)
    if (!snippets.length) {
      return Promise.resolve()
    }

    return updateUserInSnippets(user, snippets)
  }

  return {
    decodeAuthorization,
    accessToSnippets,
    hasAccessToSnippet,
    ensureOwner,
    createJWT,
    githubUser,
    assignCurrentSnippets,
  }

}


module.exports = createAuth
