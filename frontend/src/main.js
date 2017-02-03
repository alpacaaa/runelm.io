import React from 'react'
import { connect } from 'react-redux'
import { RelativeFragment as Fragment } from 'redux-little-router'

import '../node_modules/tachyons/css/tachyons.min.css'
import 'react-progress-bar-plus/lib/progress-bar.css'

import '../node_modules/codemirror/lib/codemirror.css'
import '../node_modules/codemirror/theme/mbo.css'
import '../node_modules/codemirror/theme/elegant.css'

import 'codemirror/mode/elm/elm'

import './assets/App.css'

import NewPage from './pages/new'
import EditPage from './pages/edit'
import HelpPage from './pages/help'
import ProfilePage from './pages/profile'


const getVisiblePane = ({ router, app }, isEmbedded) => {
  if (router.query.pane) {
    return router.query.pane
  }

  if (!isEmbedded) return 'splitPane'

  return window.innerWidth > 850 ? 'splitPane' : app.visiblePanes[0]
}

const Main = props => {

  const isEmbedded = window.location !== window.parent.location
  const visiblePane = getVisiblePane(props, isEmbedded)
  const hideOverflow = visiblePane !== 'splitPane' ? 'overflow-hidden' : ''
  const allowTogglePane = !props.router.query.pane

  return (
    <div className={`root ${hideOverflow}`}>
      <Fragment forRoute={'/'} withConditions={location => location.route === '/'}>
        <NewPage {...props} />
      </Fragment>

      <Fragment forRoute={'/c/:id'}>
        <EditPage
          {...props}
          visiblePane={visiblePane}
          isEmbedded={isEmbedded}
          allowTogglePane={allowTogglePane} />
      </Fragment>

      <Fragment forRoute={'/help'}>
        <HelpPage {...props} />
      </Fragment>

      <Fragment forRoute={'/profile'}>
        <ProfilePage {...props} />
      </Fragment>
    </div>
  )
}

export default connect(state => state)(Main)
