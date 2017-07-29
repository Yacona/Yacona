const path = require( 'path' )
const fs   = require( 'fs' )

const utility = require( '../../utility' )

const mkdir = path => {
  if( utility.isAbsPath( path ) === false )
    return false

  let directories = path.split( /\/|\\/ )
  directories.shift()

  try {
    directories.forEach( ( _, index ) => {
      let directory = '/' + directories.slice( 0, index + 1 ).join( '/' )
      if( utility.exists( directory ) === false )
        fs.mkdirSync( directory )
    } )
  } catch( error ){
    throw error
    return false
  }

  return true
}

module.exports = mkdir
