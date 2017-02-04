import Raven from 'raven-js'

import {
  PUSH,
  LOCATION_CHANGED,
} from 'redux-little-router'

import { createApi } from './api'

const isProduction = process.env.NODE_ENV === 'production'
const noop = () => null

const redirect = url => ({
  type: PUSH,
  payload: url
})

const INFO_FRAGMENT = `
  title
  description
  isOwner
  dependencies {
    name
    version
  }
  stylesheets
  owner {
    id
  }
`

const defaultCode = `module Main exposing (..)

import Html exposing (Html, text)


main : Html msg
main =
    text "Hello World!"

`

const withErrors = (dispatch, fn) => res => {
  if (res.errors && res.errors.length) {
    dispatch({ type: 'graphql-error', errors: res.errors })
    Raven.captureException(res.errors)

    return res
  }

  return fn(res)
}

const localStorageAvailable = () => {
  try {
    const x = '__storage_test__'
    localStorage.setItem(x, x)
    localStorage.removeItem(x)
    return true
  }
  catch(e) {
    return false
  }
}

const storage = (() => {
  if (localStorageAvailable())
    return () => localStorage

  const fakeStorage = {
    setItem() {},
    getItem() {},
    removeItem() {},
  }

  return () => fakeStorage
})()


const recompile = (id, api, reload = true) => originalData => {
  const query = `
    mutation compile($id: ID!){
      compile(id: $id)
    }
  `

  return api.fetch(query, { id })
  .then(data => {
    const iframe = document.getElementById('result-iframe')
    if (reload && iframe) iframe.src = iframe.src // only God can judge me

    return originalData
  })
}


const findMissingDependencies = (api, dispatch, dependencies) => {
  const missing = dependencies
  .filter(pkg => pkg.version === '')
  .map(pkg => pkg.name)

  if (!missing.length) return Promise.resolve(dependencies)

  const query = `
    query findDependencies($dependencies: [DependencyInput]){
      findDependencies(dependencies: $dependencies) {
        name
        version
      }
    }
  `

  return api.fetch(query, { dependencies })
  .then(withErrors(dispatch, res => {
    return res.data.findDependencies
  }))
}


const saveSnippetFiles = (state, action, dispatch, api) => {
  const query = `
    mutation saveSnippetFiles($id: ID! $files: [FileInput!]) {
      saveSnippetFiles(id: $id files: $files) {
        id
      }
    }
  `

  const data = {
    id: state.app.snippet.id,
    files: state.app.snippet.files,
  }

  api.fetch(query, data)
  .then(recompile(state.app.snippet.id, api))
  .then(withErrors(dispatch, () => {
    dispatch({ type: 'save-snippet-files-complete' })

    // make sure we're on the edit page
    if (action.redirect) {
      dispatch(redirect(action.redirect))
    }
  }))
}


const formatCode = (state, action, dispatch, api) => {
  const query = `
    query formatCode($code: String!){
      formatCode(code: $code)
    }
  `

  const code = state.app.snippet.files[0].content
  api.fetch(query, { code })
  .then(withErrors(dispatch, res => {
    const data = res.data.formatCode
    if (data === code) return false

    // cover your eyes 🙈
    const editor = document.getElementsByClassName('CodeMirror')[0].CodeMirror
    const doc = editor.getDoc()

    const cursor = doc.getCursor()
    const pos = editor.getScrollInfo()

    dispatch({ type: 'update-code', data })

    setTimeout(() => {
      doc.setCursor(cursor)
      editor.scrollTo(pos.left, pos.top)
    }, 0)
    // all right, keep going 🐵
  }))
}


const fetchProfile = (state, action, dispatch, api) => {
  const query = `
    query {
      me {
        snippets {
          id
          title
          description
        }
      }
    }
  `

  api.fetch(query)
  .then(withErrors(dispatch, res => {
    dispatch({ type: 'update-user', data: res.data.me })
  }))
}


const listeners = {
  'app-init': (state, action, dispatch) => {
    const token = state.router.query.token || storage().getItem('authToken')
    dispatch({ type: 'update-auth-token', token })

    isProduction && window.ga('create', 'UA-88162674-1', 'auto')
  },

  'update-auth-token': (state, { token }, dispatch, api) => {
    if (token) {
      storage().setItem('authToken', token)
    }
    else {
      storage().removeItem('authToken')
    }

    const query = `
      query {
        me {
          id
          avatarUrl
        }
      }
    `

    api.fetch(query)
    .then(withErrors(dispatch, res => {
      dispatch({ type: 'update-user', data: res.data.me })
    }))
  },

  'create-snippet': (state, action, dispatch, api) => {
    const query = `
      mutation createSnippet($parent: ID $temporary: Boolean) {
        createSnippet(parent: $parent temporary: $temporary) {
          id
          token
        }
      }
    `

    const data = {
      parent: state.app.snippet.id,
      temporary: action.createAsTemporary,
    }

    api.fetch(query, data)
    .then(withErrors(dispatch, res => {
      const { id, token } = res.data.createSnippet
      const snippetUrl = `/c/${id}`

      dispatch({ type: 'update-auth-token', token })
      dispatch({ type: 'update-snippet', snippet: { id } })
      dispatch({ type: 'save-snippet-files', redirect: snippetUrl })
    }))
  },

  'save-snippet-files': (state, action, dispatch, api) => {
    saveSnippetFiles(state, action, dispatch, api)
    formatCode(state, action, dispatch, api)
  },


  'save-settings': (state, action, dispatch, api) => {
    const settings = state.app.settings.data
    let jsonData

    try {
      jsonData = JSON.parse(settings)
    }
    catch (e) {
      alert('You have invalid JSON')
      return dispatch({ type: 'settings-malformed' })
    }

    const deps = jsonData.dependencies
    const tempDeps = Object.keys(deps).map(name => ({
      name,
      version: deps[name],
    }))

    // Look for missing dependencies
    return findMissingDependencies(api, dispatch, tempDeps)
    .then(dependencies => {
      const query = `
        mutation saveSnippetInfo(
          $id: ID!
          $title: String
        	$description: String
        	$private: Boolean
          $dependencies: [DependencyInput]
          $stylesheets: [String]
        ) {
          saveSnippetInfo(
            id: $id
            title: $title
          	description: $description
          	private: $private
            dependencies: $dependencies
            stylesheets: $stylesheets
          ) {
            id
            ${INFO_FRAGMENT}
          }
        }
      `

      const data = {
        id: state.app.snippet.id,
        title: jsonData.title,
        description: jsonData.description,
        private: jsonData.private,
        dependencies,
      }

      if (jsonData.stylesheets) {
        data.stylesheets = jsonData.stylesheets
      }

      return api.fetch(query, data)
    })
    .then(recompile(state.app.snippet.id, api))
    .then(withErrors(dispatch, res => {
      dispatch({ type: 'settings-saved' })
      dispatch({ type: 'update-snippet', snippet: res.data.saveSnippetInfo })
    }))
  },


  'recompile-snippet': (state, action, dispatch, api) => {
    return recompile(state.app.snippet.id, api)()
  },


  'delete-snippet': (state, action, dispatch, api) => {
    const query = `
      mutation deleteSnippet($id: ID!) {
        deleteSnippet(id: $id)
      }
    `

    const data = {
      id: action.id,
    }

    api.fetch(query, data)
    .then(withErrors(dispatch, res => {
      fetchProfile(state, action, dispatch, api)
    }))
  },


  [LOCATION_CHANGED]: () => {
    isProduction && window.ga('send', 'pageview')
  },
}


const routeListeners = {
  '/c/:id': (state, action, dispatch, api) => {
    const { id } = action.payload.params

    const query = `
      query snippet($id: ID!){
        snippet(id: $id) {
          id
          files {
            filename
            content
          }
          ${INFO_FRAGMENT}
        }
      }
    `

    // set lastSeen to allow redirect
    // when logging in with github
    storage().setItem('lastSeenSnippet', id)

    api.fetch(query, { id })
    .then(withErrors(dispatch, res => {
      dispatch({ type: 'load-snippet', snippet: res.data.snippet })
    }))
  },

  '/': (state, action, dispatch) => {
    dispatch({ type: 'update-code', data: defaultCode })
  },

  '/new': (state, action, dispatch) => {
    dispatch(redirect('/'))
  },

  '/set-auth-token': (state, action, dispatch) => {
    const lastSeen = storage().getItem('lastSeenSnippet')
    const url = lastSeen ? '/c/' + lastSeen : '/'

    dispatch(redirect(url))
  },

  '/profile': fetchProfile,
}

export const sideEffectsMiddleware = ({ getState, dispatch }) => {
  const api = createApi(getState().app.apiEndpoint + 'graphql')

  return next => action => {
    next(action)
    const state = getState()

    const token = state.app.authToken
    api.setHeaders({
      Authorization: token ? 'Bearer ' + token : ''
    })

    let functions = []

    if (action.type === LOCATION_CHANGED) {
      functions.push(routeListeners[action.payload.route] || noop)
    }

    if (listeners[action.type]) {
      functions.push(listeners[action.type])
    }

    functions.map(fn => fn(state, action, dispatch, api))
  }
}
