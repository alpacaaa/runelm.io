import React from 'react'
import Link from '../components/link'
import Header from '../components/header'

export default props => {
  return (
    <div>
      <Header />

      <div className="w-50 center pa3">
        <p>
          Any feedback is more than welcome! Found a bug? Ping me <Link href="https://twitter.com/_alpacaaa">on Twitter</Link> and {`we'll`} sort it out.
        </p>
        <p>
          You can sign in using Github so you can keep a history of your snippets and be able to edit them later on.
        </p>
        <p>
          If you are new to Elm, you can find more information at <Link href="http://elm-lang.org">elm-lang.org</Link>.
        </p>
        <p className="pt4">
          A project by <Link href="https://alpacaaa.net">@alpacaaa</Link>.
        </p>
      </div>
    </div>
  )
}
