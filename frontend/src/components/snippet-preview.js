import React from 'react'

const SnippetPreview = props => {

  return (
    <div className="w-100 h-100">
      <div id="result-overlay" className="w-100 h-100 o-0 absolute dn"></div>
      <iframe
        src={props.url}
        className="w-100 h-100"
        frameBorder="0"
        id="result-iframe"
        sandbox="allow-forms allow-popups allow-scripts allow-same-origin allow-modals">
      </iframe>
    </div>
  )
}

SnippetPreview.show = () => document.getElementById('result-overlay').style.display = 'block'
SnippetPreview.hide = () => document.getElementById('result-overlay').style.display = 'none'

export default SnippetPreview
