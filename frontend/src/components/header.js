import React from 'react'
import ProgressBar from 'react-progress-bar-plus'

const elmLogo = require('../assets/elm-logo.svg')

const preventDefault = onClick => e => {
  if (onClick) {
    e.preventDefault()
    onClick(e)
  }
}

export default props => {
  const links = props.links || []
  const buttons = props.buttons || []

  return (
    <header className={`pa3 w-100 ${props.headerType}`}>
      <ProgressBar
        percent={props.loading ? 30 : -1}
        autoIncrement={true}
        spinner={false} />

      <div className="flex justify-between relative">
        <div className="relative z-1 bg-white header-actions">
          {<a href="/" className="link v-mid mr4 elm-logo">
            <img src={elmLogo} alt="Elm logo" className="w1" />
            <h4 className="mv0 dib ml2 black-90">run<span className="red">elm</span>.io</h4>
          </a>}

          {props.leftSide}

          {buttons.map(b =>
            <button
              title={b.title}
              className={`f6 pointer br2 ba ph3 pv2 mr3 dib black bg-white ${b.className}`}
              onClick={b.onClick} key={b.text} disabled={props.loading}>
              {b.text}
            </button>
          )}

          {links.map(l =>
            <a
              className="f6 link underline-hover mr3 pv2 pointer black"
              href={l.href || '#'}
              target={l.href ? "_blank" : '_self'}
              onClick={preventDefault(l.onClick)} key={l.text}>
              {l.text}
            </a>
          )}
        </div>

        <div className="f6 pv2 gray absolute z-0 absolute--fill p-none w-100 tc header-title">
          {props.title}
        </div>

        <div className="relative z-1">
          {props.rightSide}
        </div>
      </div>
    </header>
  )
}
