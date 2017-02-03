
import {
  LOCATION_CHANGED,
} from 'redux-little-router'

import jsonFormatter from 'format-json'


const initialState = {
  apiEndpoint: process.env.REACT_APP_API_ENDPOINT || 'http://192.168.99.100:3000/',
  loading: false,
  isCompiling: false,
  isPristine: true, // code not touched yet
  snippetInfoVisible: false,
  visiblePanes: ['editor'],
  settings: {
    visible: false,
    data: '',
  },
  authToken: null,
  snippet: { files: [{ filename: 'Main.elm', content: '' }] },
  user: null,
  dummyValue: null, // needed to make the UI react to window resizes
}

export default (state = initialState, action) => {

  if (action.type === 'update-code') {
    const snippet = { ...state.snippet }
    snippet.files[0].content = action.data
    return { ...state, isPristine: false, snippet }
  }

  if (action.type === 'load-snippet') {
    return { ...state, snippet: action.snippet, loading: false, isCompiling: false, }
  }

  if (action.type === 'update-snippet') {
    return { ...state, snippet: { ...state.snippet, ...action.snippet } }
  }

  if (action.type === 'create-snippet') {
    return { ...state, isCompiling: true }
  }

  if (action.type === 'show-settings') {
    const { snippet } = state

    const packageData = {
      title: snippet.title,
      description: snippet.description,
      dependencies: depsToObject(snippet.dependencies),
    }

    if (snippet.stylesheets) {
      packageData.stylesheets = snippet.stylesheets
    }

    const settings = {
      ...state.settings,
      visible: true,
      data: jsonFormatter.plain(packageData),
    }

    return { ...state, snippetInfoVisible: false, settings }
  }

  if (action.type === 'hide-settings') {
    const settings = {
      ...state.settings,
      visible: false,
      data: '',
    }

    return { ...state, settings }
  }

  if (action.type === 'toggle-snippet-info-visible') {
    return { ...state, snippetInfoVisible: !state.snippetInfoVisible }
  }

  if (action.type === 'update-settings') {
    return { ...state, settings: { ...state.settings, data: action.data } }
  }

  if (action.type === 'save-settings') {
    return { ...state, loading: true }
  }

  if (action.type === 'settings-malformed') {
    return { ...state, loading: false }
  }

  if (action.type === 'settings-saved') {
    const settings = {
      ...state.settings,
      visible: false,
      originalData: null,
    }

    return { ...state, loading: false, settings }
  }

  if (action.type === 'save-snippet-files') {
    return { ...state, loading: true }
  }

  if (action.type === 'save-snippet-files-complete') {
    return { ...state, visiblePanes: ['preview'], loading: false }
  }

  if (action.type === 'update-auth-token') {
    return { ...state, authToken: action.token }
  }

  if (action.type === 'update-user') {
    if (!action.data) return { ...state, user: null }

    const user = state.user || {}
    const newUser = {
      ...user,
      ...action.data
    }

    return { ...state, user: newUser }
  }

  if (action.type === 'toggle-visible-pane') {
    return { ...state, visiblePanes: [action.pane] }
  }

  if (action.type === 'recompile-snippet') {
    return { ...state, visiblePanes: ['preview'] }
  }

  if (action.type === 'window-resize') {
    return { ...state, dummyValue: action.width }
  }


  if (action.type === LOCATION_CHANGED) {
    const { result } = action.payload
    if (result && result.showLoader) {
      return { ...state, loading: true }
    }
  }

  return state
}



function depsToObject(dependencies) {
  return dependencies.reduce((acc, item) => {
    return {
      ...acc,
      [item.name]: item.version,
    }
  }, {})
}
