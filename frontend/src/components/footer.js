import React from 'react'

export default ({ isEmbedded }) => {
  const Link = ({ href, className, children }) =>
    <a href={href} className={`link white ${className}`} target={isEmbedded ? '_blank' : '_self'}>
      {children}
    </a>

  return (
    <footer className="w-100 relative ph3 pv2 white flex justify-between items-center main-footer">
      <div>
        <Link href="https://runelm.io">runelm.io</Link>{` `}
        – a place to share and run elm code.
      </div>
      {!isEmbedded && <div>
        <Link href="https://twitter.com/_alpacaaa" className="mr2">say hello!</Link>
        /
        <Link href="https://github.com/alpacaaa/runelm.io/issues" className="ml2">help</Link>
      </div>}
    </footer>
  )
}
