import React from 'react'

import Footer from '../components/footer'
import { viewerHeader } from '../components/all-headers'
import Layout from '../components/layout-fullpage'
import Loading from '../components/compile-loader'
import { CodeEditor } from '../components/code-editor'
import NewSnippetHelp from '../components/new-snippet-help'
import EditorAndPreview from '../components/editor-preview'

import * as util from '../lib/util'


export default props => {
  const { app, isEmbedded, } = props

  const onSaveAction = util.onSaveAction({
    isEmbedded,
    isOwner: false,
    isPristine: false,
  })(props.dispatch)

  const editor = (
    <CodeEditor
      lineNumbers={true}
      onSave={onSaveAction}
      value={app.snippet.files[0].content}
      onChange={data => props.dispatch({ type: 'update-code', data })} />
  )

  const header = viewerHeader({
    isCodeBeingEdited: true,
    isPristine: false,
    dispatch: props.dispatch,
    loading: app.loading,
    githubLoginUrl: util.githubLoginUrl(app),
    user: app.user,
    onSaveAction,
  })

  return (
    <Layout>
      {header}

      <EditorAndPreview
        editor={editor}
        preview={<NewSnippetHelp />} />

      <Footer />

      {app.isCompiling && <Loading />}
    </Layout>
  )
}
