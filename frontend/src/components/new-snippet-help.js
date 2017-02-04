import React from 'react'
import Link from '../components/link'

export default props => {
  return (
    <div className="pa3">
      <h3 className="f5 lh-copy">
        <Link href="https://runelm.io">runelm.io</Link> – a place to share and run elm code.
      </h3>

      <p>
        You can install any package, add custom stylesheets, {` `}
        <Link href="https://alpacaaa.net/blog/post/elm-memory-game-from-scratch/">embed runnable snippets</Link>
        {` `}on your website and download your work as a package ready to be used with <code className="f6">elm-reactor</code>.
      </p>

      <p>
        Code is formatted with <Link href="https://github.com/avh4/elm-format">elm-format</Link> automatically. Use <code className="f6">⌘S / CTRL-S</code> for faster editing.
        Sign in with your Github account to keep a history of your snippets and be able to edit them later on.
      </p>

      <p className="pt4">
        These two templates are available to get you started right away with the Elm Architecture
      </p>

      <ul className="pb4">
        <li>
          <Link href="/c/beginner-program">beginnerProgram</Link> – based on <code>Html.beginnerProgram</code>
        </li>
        <li>
          <Link href="/c/program">program</Link> – based on <code>Html.program</code>, with commands and subscriptions
        </li>
      </ul>

      <p>
        If you are having problems or want to provide feedback, <Link href="https://github.com/alpacaaa/runelm.io/issues">open an issue</Link> or <Link href="https://twitter.com/_alpacaaa">tweet me</Link>.
      </p>
    </div>
  )
}
