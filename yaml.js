const fs   = require( 'fs' )
const yaml = require( 'js-yaml' )

const parse = raw => yaml.safeLoad( raw )
const dump  = json => yaml.safeDump( json )

const read  = filePath => fs.readFileSync( filePath )
const write = ( filePath, content ) => fs.writeFileSync( filePath, content )

const save = ( filePath, json ) => write( filePath, dump( json ) )
const load = filePath => parse( read( filePath ) )

module.exports = {
  parse: parse,
  dump : dump,
  read : read,
  write: write,
  save : save,
  load : load
}
