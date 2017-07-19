// --- Modules --- //

const path = require( 'path' )
const fs   = require( 'fs' )

// --- Functions --- //

// Debug

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

// Status

const status = ( error, result ) => {
  return {
    error : error,
    result: result
  }
}

// File Control

const absPath = path.resolve

const exists = filePath => {
  try {
    fs.statSync( absPath( filePath ) )
    return true
  } catch( error ){
    return false
  }
}

// Plz absolute path !
const mkdir = path => {
  if( path[0] !== '/' )
    return false

  let directories = path.split( /\/|\\/ )
  directories.shift()

  try {
    directories.forEach( ( _, index ) => {
      let directory = '/' + directories.slice( 0, index + 1 ).join( '/' )
      if( exists( directory ) === false )
        fs.mkdirSync( directory )
    } )
  } catch( error ){
    throw error
    return false
  }

  return true
}

// read :: String -> Status
const read  = filePath => {
  try {
    return status( undefined, fs.readFileSync( filePath, 'utf-8' ) )
  } catch( error ){
    return status( error )
  }
}

// write :: String -> String -> Status
const write = ( filePath, content ) => {
  try {
    fs.writeFileSync( filePath, content )
    return status()
  } catch( error ){
    return status( error )
  }
}

// --- Exports --- //

module.exports = {
  // Debug
  debug  : debug,

  // status
  status : status,

  // absPath( [path] )
  absPath: absPath,
  // exists( absolute path || local path )
  exists : exists,

  // mkdir( absolute path )
  mkdir  : mkdir,

  // read( absolute path || local path )
  read   : read,
  // write( absolute path || local path )
  write  : write
}
