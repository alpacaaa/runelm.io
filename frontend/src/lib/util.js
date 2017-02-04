import { combineReducers } from 'redux'

import appReducer from '../reducers/app'

export const reducer = combineReducers({
  app: appReducer,
})

export const githubLoginUrl = app => app.apiEndpoint + 'github-login?token=' + app.authToken

export const onSaveAction = ({
  isOwner,
  isEmbedded,
  isPristine,
}) => dispatch => () => {
  if (isPristine) {
    return dispatch({ type: 'recompile-snippet' })
  }

  if (isOwner) {
    return dispatch({ type: 'save-snippet-files' })
  }

  return dispatch({ type: 'create-snippet', createAsTemporary: isEmbedded })
}

export const isPaneVisible = (visiblePanes, pane) =>
  visiblePanes.indexOf(pane) > -1
