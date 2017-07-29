const fs    = require( 'fs' )
const path  = require( 'path' )

// A method to extract zip file
const unzip = ( from, to ) => {
  return new Promise( ( resolve, reject ) => {
    fs.createReadStream( from ).pipe( require( 'unzip' ).Extract( {
      path: to
    } ).on( 'close', resolve ).on( 'error', reject ) )
  } )
}

const fileType = require( 'file-type' )

// A method to check if a file exist
const exists = file => {
  try {
    fs.statSync( path.resolve( file ) )
    return true
  } catch( error ){
    return false
  }
}

const read = path => fs.readFileSync( path )
const type = path => fileType( read( path ) )

// A method to check compressed file
const isCompressed = path => {
  if( exists( path ) === false )
    return false

  const extension = type( path )
  if( extension === null )
    return false

  // Only zip
  switch( extension.ext ){
    case 'zip' :
      return true
  }

  return false
}

const extract = ( from, to ) => {
  return new Promise( ( resolve, reject ) => {
    if( isCompressed( from ) === true ){
      resolve( unzip( from, to ) )
      return
    }
    reject()
  } )
}

module.exports = extract
