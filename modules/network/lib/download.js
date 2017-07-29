const http = require( 'http' )
const fs   = require( 'fs' )
const url  = require( 'url' )
const path = require( 'path' )

const download = ( from, to ) => {
  return new Promise( ( resolve, reject ) => {
    let filename = url.parse( from ).pathname

    http.get( from, response => {
      if( response.statusCode < 200 || 299 < response.statusCode )
        reject( response )
      else {
        let p      = path.resolve( to, path.basename( filename ) )
        let output = fs.createWriteStream( p )
        output.on( 'error', reject )
        response.pipe( output )
        output.on( 'finish', () => {
          resolve( p )
        } )
        response.on( 'end', e => {
          output.close()
        } )
      }
    } ).on( 'error', reject )
  } )
}

module.exports = download
