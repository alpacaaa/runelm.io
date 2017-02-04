import React from 'react'

export default props => {
  return (
    <div className="fixed z-max w-100 h-100 bg-black-70">
      <article className="mw7 center mv3  ph3 ph5-ns tc br2 pv5 bg-white black mb5">
        <h1 className="fw6 f3 f2-ns lh-title mt0 mb3">
          Getting ready.
        </h1>
        <h2 className="fw2 f4 lh-copy mt0 mb3">
          Your Elm stuff is compiling. Should be done in a second.
        </h2>
        <p className="fw1 f5 mt0 mb3">
          Did you know you can install any module available at {` `}
          <a className="link blue" href="https://package.elm-lang.org">{`https://package.elm-lang.org`}</a>?
        </p>
      </article>
    </div>
  )
}
