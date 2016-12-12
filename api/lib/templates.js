// @flow weak

const htmlTemplate = params => {
  const stylesheets = (params.stylesheets || [])
  .map(s => `<link rel="stylesheet" href="${s}" />`)

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${params.title}</title>
    ${stylesheets.join("\n")}
  </head>
  <body>
    <div>
      <h3>Loading...</h3>
    </div>
    <script type="text/javascript">
      ${params.js}
      while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
      }
      Elm.Main.fullscreen()
    </script>
  </body>
</html>
`
}

const errorTemplate = params => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${params.title}</title>
  </head>
  <body style="width: 100%; min-height: 100%; margin: 0; background-color: rgb(44, 44, 44);
    color: rgb(233, 235, 235); font-family: monospace; overflow-x: scroll;">
    <div style="display: block; white-space: pre; padding: 2em;">
${params.message}
    </div>
  </body>
</html>
`

module.exports = {
  htmlTemplate,
  errorTemplate,
}
