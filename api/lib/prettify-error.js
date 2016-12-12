// @flow weak

// this is a poor and ugly conversion
// of the equivalent code on try.elm-lang.org

module.exports = message => {
  return message.split("\n")
  .map(addColorToLine)
  .join("<br>")
}

function dropRight(n, str)
{
	return n < 1 ? str : str.slice(0, -n);
}

function dropLeft(n, str)
{
	return n < 1 ? str : str.slice(n);
}

function repeat(n, str)
{
	var result = '';
	while (n > 0)
	{
		if (n & 1)
		{
			result += str;
		}
		n >>= 1, str += str;
	}
	return result;
}

function left(n, str)
{
	return n < 1 ? '' : str.slice(0, n);
}

const all = fn => line => {
  const array = line.split('')
  return array.filter(fn).length === array.length
}

const colorful = (color, msg) => {
  return `<span style="color: ${color}">${msg}</span>`
}

const isBreaker = line => {
  return line.indexOf("-- ") === 0
  && line.indexOf("----------") > -1
}

const isBigBreaker = line => line.indexOf("===============") === 0
const isUnderline = all(c => c === ' ' || c === '^')

const isLineNumber = all(c => c == ' ' || c.match(/^[0-9]+$/))

const processLine = line => {
  const split = line.split('|')

  if (split.length === 1) {
    return line
  }

  const [starter, ...rest] = split
  if (!isLineNumber(starter)) {
    return line
  }

  const restOfLine = rest.join('|')
  const marker = left(1, restOfLine) === '>'
    ? colorful("#D5200C",">")
    : ' '

  return colorful("#9A9A9A", starter + "|") +
    marker +
    colorful("#9A9A9A", dropLeft(1, restOfLine))
}

const addColorToLine = line => {
  if (isBreaker(line)) {
    return colorful("#00a8c6", "\n\n" + dropRight(40, line) + repeat(40, "-"))
  }

  if (isBigBreaker(line)) {
    return colorful("rgb(211, 56, 211)", line)
  }

  if (isUnderline(line)) {
    return colorful("#D5200C", line)
  }

  if (line.indexOf("    ") === 0) {
    return colorful("#9A9A9A", line)
  }

  return processLine(line)
}
