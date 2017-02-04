import React from 'react'

import {
  ownerHeader,
  viewerHeader,
  embeddedHeader,
} from '../components/all-headers'
import Footer from '../components/footer'
import Layout from '../components/layout-fullpage'
import SnippetInfo from '../components/snippet-info'
import SnippetTitle from '../components/snippet-title'
import SettingsHelp from '../components/settings-help'
import SnippetPreview from '../components/snippet-preview'
import EditorAndPreview from '../components/editor-preview'
import { CodeEditor, SettingsEditor } from '../components/code-editor'

import * as util from '../lib/util'

const makeOnChange = (type, dispatch) => data => dispatch({ type, data })


const getCorrectHeader = props => {
  const { isEmbedded, isOwner } = props

  if (!isEmbedded) {
    return isOwner
    ? ownerHeader(props)
    : viewerHeader(props)
  }

  return embeddedHeader(props)
}


export default props => {
  const { app, router, visiblePane, isEmbedded, allowTogglePane } = props

  const isCodeBeingEdited = !app.settings.visible
  const isOwner = app.snippet.isOwner
  const isSplitPane = visiblePane === 'splitPane'
  const showLineNumbers = router.query.lineNumbers !== 'false'

  const { content : code } = app.snippet.files[0]

  const splitPaneProps = {
    onChange: SnippetPreview.show,
    onDragFinished: SnippetPreview.hide,
  }

  const onSaveAction = util.onSaveAction({
    isOwner,
    isEmbedded,
    isPristine: app.isPristine,
  })(props.dispatch)

  const toggleSnippetInfoVisibility = () =>
    props.dispatch({ type: 'toggle-snippet-info-visible' })

  const editor = (
    <div className={isSplitPane ? 'h-100' : 'flex w-100'}>
      <CodeEditor
        value={code}
        visible={isCodeBeingEdited}
        lineNumbers={showLineNumbers}
        onSave={onSaveAction}
        onChange={makeOnChange('update-code', props.dispatch)} />

      <SettingsEditor
        value={app.settings.data}
        visible={!isCodeBeingEdited}
        readOnly={!isOwner}
        onSave={() => props.dispatch({ type: 'save-settings' })}
        onChange={makeOnChange('update-settings', props.dispatch)} />
    </div>
  )

  const headerProps = {
    isOwner,
    isEmbedded,
    isSplitPane,
    isCodeBeingEdited,
    isEditor: visiblePane === 'editor',
    dispatch: props.dispatch,
    loading: app.loading,
    isPristine: app.isPristine,
    createAsTemporary: isEmbedded,
    user: app.user,
    githubLoginUrl: util.githubLoginUrl(app),
    snippetUrl: `/c/` + app.snippet.id,
    title: <SnippetTitle app={app} onClick={toggleSnippetInfoVisibility} />,
    onSaveAction,
    visiblePanes: app.visiblePanes,
    allowTogglePane,
  }

  const header = getCorrectHeader(headerProps)

  const preview = (
    <SnippetPreview url={`${app.apiEndpoint}c/${app.snippet.id}/result`} />
  )

  return (
    <div>
      <Layout>
        {header}

        <SnippetInfo
          snippet={app.snippet}
          visible={app.snippetInfoVisible}
          moreInfo={!isEmbedded && isSplitPane}
          downloadUrl={`${app.apiEndpoint}c/${app.snippet.id}/download`}
          overlayClicked={toggleSnippetInfoVisibility} />

        <EditorAndPreview
          visiblePane={visiblePane}
          splitPaneProps={isCodeBeingEdited ? splitPaneProps : {}}
          editor={editor}
          preview={isCodeBeingEdited ? preview : <SettingsHelp />}
        />

        <Footer isEmbedded={isEmbedded} />
      </Layout>
    </div>
  )
}
