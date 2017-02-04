import React from 'react'
import SplitPane from 'react-split-pane'

const getVisiblePaneClass = visiblePane => {
  if (visiblePane === 'preview') return 'second-pane-visible'
  if (visiblePane === 'editor') return 'first-pane-visible'
}

export default props => {
  const { editor, preview, visiblePane } = props

  const splitPane = (
    <SplitPane
      split="vertical"
      defaultSize="50%"
      paneStyle={{ height: '100%' }}
      {...props.splitPaneProps}
      >

      {editor}

      <div className="h-100">
        {preview}
      </div>
    </SplitPane>
  )

  if (visiblePane === 'splitPane') {
    return (
      <div className="h-100 relative">
        {splitPane}
      </div>
    )
  }

  const className = getVisiblePaneClass(visiblePane)

  return (
    <div className={`h-100 relative flex ${className}`}>
      {editor}
      {preview}
    </div>
  )
}
