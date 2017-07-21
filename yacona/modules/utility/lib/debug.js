const colors = {
  black  : '\u001b[30m',
  red    : '\u001b[31m',
  green  : '\u001b[32m',
  yellow : '\u001b[33m',
  blue   : '\u001b[34m',
  magenta: '\u001b[35m',
  cyan   : '\u001b[36m',
  white  : '\u001b[37m'
}

const debug = ( type, app, message ) => {
  const d    = new Date()
  const time = d.getFullYear() + '/' + ( d.getMonth() + 1 ) + '/' + d.getDay() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()

  console.log( colors[type] + '[' + time + '] yacona:' + app + ' - ' + '\u001b[0m' + message )
}

module.exports = debug
