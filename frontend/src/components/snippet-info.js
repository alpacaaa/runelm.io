import React from 'react'
import jsonFormatter from 'format-json'
import Link from './link'

const ShowFormatted = ({ title, data }) => {
  if (!data || !data.length) return null

  return (
    <div>
      <h5>{title}</h5>
      <pre>
        {jsonFormatter.plain(data)}
      </pre>
    </div>
  )
}

export default props => {
  const { snippet, visible, moreInfo, overlayClicked } = props

  const hiddenclass = visible ? '' : 'hidden'
  const username = (snippet.owner && snippet.owner.id)
  ? <Link href={`https://github.com/${snippet.owner.id}`}>{snippet.owner.id}</Link>
  : `anonymous`

  return (
    <div>
      {visible && <div onClick={overlayClicked} className="fixed z-1 w-100 h-100"></div>}

      <div className="relative">
        <div className={`pa3 pt0 w-100 f6 bg-white z-5 absolute snippet-info ${hiddenclass}`}>
          <h4 className="mb1">{snippet.title} <span className="normal gray">by {username}</span></h4>
          <span className="gray">{snippet.description}</span>

          <p className="pt4 pb3">
            <a href={props.downloadUrl} className="f6 link br2 ba ph3 pv2 white bg-blue">
              Download as .zip
            </a>
            <span className="ml2">Works with <code>elm-reactor</code></span>
          </p>

          {moreInfo && visible && <div>
            <ShowFormatted title="Dependencies" data={snippet.dependencies} />
            <ShowFormatted title="Stylesheets" data={snippet.stylesheets} />
          </div>}
        </div>
      </div>
    </div>
  )
}
