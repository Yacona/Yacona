const fs = require( 'fs' )

const unzip = ( from, to ) => {
  return new Promise( ( resolve, reject ) => {
    let output  = fs.createReadStream( from )
    let extract = require( 'unzip' ).Extract( { path: to } )

    extract.on( 'close', () => resolve( to ) )
    extract.on( 'error', reject )

    output.on( 'error', reject )

    output.pipe( extract )
  } )
}

module.exports = unzip
