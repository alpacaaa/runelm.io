import React from 'react'

const SettingsItem = ({ property, type, children }) => {
  return (
    <li className="pb4">
      <code className="blue pr3">{property}</code>
      <code className="f6">{type}</code>
      <div className="f6 mv1">{children}</div>
    </li>
  )
}

export default props => {
  return (
    <div className="pa3 h-100 overflow-y-auto">
      <h3>Settings</h3>

      <p>Edit the JSON on the left using the following rules:</p>

      <ul className="list pl3 pt3">
        <SettingsItem property="dependencies" type="Dict String String">
          A Dict of the packages you want to install.<br/>
          You can install any package available at <a className="link blue undlerline" href="http://package.elm-lang.org/">elm packages</a>.
          Example:
          <pre>{`
"dependencies": {
  "elm-lang/core": "5.0.0 <= v < 6.0.0",
  "elm-lang/http": "1.0.0 <= v < 2.0.0",

  # Leave the version field blank
  # to auto select the most up to date version

  "elm-community/list-extra": ""
}
`}
          </pre>
        </SettingsItem>

        <SettingsItem property="stylesheets" type="[String]">
          A list of urls pointing to css files, if you want to add external styles to your code.
          Example:
          <pre>{`
"stylesheets": [
  "https://fonts.googleapis.com/css?family=Open+Sans"
]
`}
        </pre>
        </SettingsItem>

        <SettingsItem property="title" type="String"></SettingsItem>
        <SettingsItem property="description" type="String"></SettingsItem>
      </ul>
    </div>
  )
}
