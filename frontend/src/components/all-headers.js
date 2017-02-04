import React from 'react'

import Header from './header'
import * as util from '../lib/util'

const runButton = {
  text: 'Run',
  title: '⌘S'
}

const GithubSignIn = props => {
  const isLoggedIn = props.user && props.user.id
  if (!isLoggedIn) {
    return (
      <a href={props.githubLoginUrl} className="f6 link br2 ba ph3 pv2 dib white bg-blue">
        Sign in with Github
      </a>
    )
  }

  return (
    <a href="/profile" className="f6 link underline-hover pv2 dib blue">
      {props.user.id}
    </a>
  )
}

const EditOnRunElm = props => {
  return (
    <a href={props.url} className="f6 link br2 ba ph3 pv2 dib white bg-blue" target="_blank">
      Edit on runelm.io
    </a>
  )
}

const SplitChooserButton = ({ onClick, selected, children, }) =>
  <button
    className={`relative outline-0 f6 pointer ba ph3 pv2 dib black bg-white ${selected && 'selected'}`}
    onClick={onClick}>
  {children}
  </button>


const toggleVisiblePane = (dispatch, pane) => e =>
  e.preventDefault() & dispatch({ type: 'toggle-visible-pane', pane, })

export const ownerHeader = ({
  isCodeBeingEdited,
  dispatch,
  loading,
  githubLoginUrl,
  user,
  title,
  onSaveAction,
}) => {
  const runCode = {
    ...runButton,
    onClick: onSaveAction,
  }

  const saveSettings = {
    text: 'Save Settings',
    onClick: () => dispatch({ type: 'save-settings' })
  }

  const showSettings = {
    text: 'Settings',
    onClick: () => dispatch({ type: 'show-settings' })
  }

  const hideSettings = {
    text: 'Back',
    onClick: () => dispatch({ type: 'hide-settings' })
  }

  const buttons = [
    isCodeBeingEdited ? runCode : saveSettings,
  ]

  const links = [
    isCodeBeingEdited ? showSettings : hideSettings,
  ]

  const rightSide = <GithubSignIn
    githubLoginUrl={githubLoginUrl}
    dispatch={dispatch}
    user={user}
  />

  return <Header
    links={links}
    buttons={buttons}
    rightSide={rightSide}
    title={title}
    loading={loading} />
}

export const viewerHeader = ({
  loading,
  isCodeBeingEdited,
  dispatch,
  githubLoginUrl,
  user,
  title,
  onSaveAction,
}) => {
  const runCode = {
    ...runButton,
    onClick: onSaveAction,
  }

  const buttons = isCodeBeingEdited ? [runCode] : []

  const rightSide = <GithubSignIn
    githubLoginUrl={githubLoginUrl}
    dispatch={dispatch}
    user={user}
  />

  return <Header buttons={buttons} rightSide={rightSide} loading={loading} title={title} />
}


export const embeddedHeader = ({
  onSaveAction,
  isSplitPane,
  snippetUrl,
  loading,
  title,
  dispatch,
  visiblePanes,
  allowTogglePane,
}) => {

  const leftSide =
    <span className="mr3 embedded-split-chooser">
      <SplitChooserButton
        onClick={toggleVisiblePane(dispatch, 'editor')}
        selected={util.isPaneVisible(visiblePanes, 'editor')}>
        Code
      </SplitChooserButton>

      <SplitChooserButton
        onClick={toggleVisiblePane(dispatch, 'preview')}
        selected={util.isPaneVisible(visiblePanes, 'preview')}>
        Result
      </SplitChooserButton>
    </span>

  const runCode = {
    text: allowTogglePane ? 'Run' : 'Run Again',
    onClick: onSaveAction,
    className: 'header-run-button',
  }

  const buttons = [runCode]
  const rightSide = <EditOnRunElm url={snippetUrl} />

  return <Header
    buttons={buttons}
    leftSide={allowTogglePane ? leftSide : null}
    rightSide={rightSide}
    loading={loading}
    title={title}
    headerType={`embedded-header ${allowTogglePane && 'allow-toggle-pane'}`} />
}


export const noHeader = () => null
