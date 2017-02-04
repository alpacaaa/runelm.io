import React from 'react'

export default ({ app, onClick }) => {
  const { snippet, user, snippetInfoVisible } = app

  const arrowRotation = snippetInfoVisible ? 'rotate90' : 'pr1 rotate270'

  return (
    <span className="p-all">
      <span onClick={onClick || (() => null)} className="pointer user-select-none" title="View snippet info">
        {snippet.title || 'Untitled'}
        <div className={`dib ml2 ${arrowRotation}`}>❮</div>
      </span>
      {false && user && user.id && `by ${user.id}`}
    </span>
  )
}
