import React from 'react'
import CodeMirror from 'react-codemirror'
import debounce from 'lodash.debounce'

export const createEditor = params => {
  return props => {
    const save = props.onSave || (() => null)

    const options = {
      lineNumbers: props.lineNumbers,
      lineWrapping: true,
      theme: 'mbo',
      language: params.language,
      // theme: 'elegant',
      readOnly: props.readOnly,
      extraKeys: {
        Tab(cm) {
          const spaces = Array(cm.getOption("indentUnit") + 1).join(" ")
          cm.replaceSelection(spaces)
        },
        "Ctrl-S": save,
        "Cmd-S": save,
      }
    }

    const visible = props.visible != null ? props.visible : true

    return (
      <PatchedCodeMirror
        value={props.value}
        onChange={props.onChange}
        options={options}
        className={visible ? '' : 'vih'}
      />
    )
  }
}

export const CodeEditor = createEditor({
  language: 'elm',
})

export const SettingsEditor = createEditor({
  language: 'json',
})


// https://github.com/JedWatson/react-codemirror/pull/68
class PatchedCodeMirror extends CodeMirror {
  constructor() {
    super()
    this.handleUpdate = debounce(function(nextProps) {
      if (this.codeMirror && nextProps.value !== undefined && this.codeMirror.getValue() !== nextProps.value) {
        this.codeMirror.setValue(nextProps.value)
      }
      if (typeof nextProps.options === 'object') {
        for (let optionName in nextProps.options) {
          if (nextProps.options.hasOwnProperty(optionName)) {
            this.codeMirror.setOption(optionName, nextProps.options[optionName])
          }
        }
      }
    }, 0)
  }

  componentWillReceiveProps(nextProps) {
    this.handleUpdate(nextProps)
  }
}
