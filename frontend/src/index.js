import React from 'react'
import ReactDOM from 'react-dom'
import Raven from 'raven-js'

if (process.env.NODE_ENV === 'production') {
  Raven.config('https://271cab0d443e493785cf6df8cf460839@sentry.io/117226').install()
}

import { createStore, compose, applyMiddleware, } from 'redux'
import {
  RouterProvider,
  routerForBrowser,
  initializeCurrentLocation,
} from 'redux-little-router'

import { Provider } from 'react-redux'

import Main from './main'
import routes from './lib/routes'
import { reducer } from './lib/util'
import { sideEffectsMiddleware } from './lib/side-effects'


const {
  routerEnhancer,
  routerMiddleware,
} = routerForBrowser({ routes })


const store = createStore(
  reducer,
  {},
  compose(
    routerEnhancer,
    applyMiddleware(routerMiddleware, sideEffectsMiddleware),
  )
)

store.dispatch({ type: 'app-init' })

const initialLocation = store.getState().router
store.dispatch(initializeCurrentLocation(initialLocation))

const windowResize = () => store.dispatch({
  type: 'window-resize', width: window.innerWidth
})

window.addEventListener("resize", windowResize)
windowResize()

const App = props =>
  <Provider store={store}>
    <RouterProvider store={store}>
      <Main />
    </RouterProvider>
  </Provider>

ReactDOM.render(
  <App />,
  document.getElementById('root')
)
