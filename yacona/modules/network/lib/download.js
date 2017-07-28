const http = require( 'http' )
const fs   = require( 'fs' )
const url  = require( 'url' )

const download = ( from, to ) => {
  return new Promise( ( resolve, reject ) => {
    let filename = url.parse( from ).pathname

    http.get( from, response => {
      if( response.statusCode < 200 || 299 < response.statusCode )
        reject( response )
      else {
        let output = fs.createWriteStream( path.resolve( to, path.basename( filename ) ) )
        output.on( 'error', reject )
        response.pipe( output )
        response.on( 'end', e => {
          output.close()
          resolve( path.basename( filename ) )
        } )
      }
    } ).on( 'error', reject )
  } )
}

module.exports = download
