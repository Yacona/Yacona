const url   = require( 'url' )
const http  = require( 'http' )
const https = require( 'https' )
const fs    = require( 'fs' )
const path  = require( 'path' )

// http.get on error => Reject
// response.statusCode < 200 || 299 < response.statusCode => Reject
// Write Stream on error => Reject

// Ok => Resolve( filePath )

const download = ( from, to ) => {
  return new Promise( ( resolve, reject ) => {
    const parsed   = url.parse( from )
    const fileName = path.basename( parsed.pathname )

    const h = parsed.protocol === 'https:' ? https : http

    h.get( from, response => {
      if( response.statusCode < 200 || 299 < response.statusCode ){
        reject( response )
      } else {
        let filePath = path.resolve( to, fileName )
        let output   = fs.createWriteStream( filePath )
        output.on( 'error', reject )
        output.on( 'finish', () => resolve( filePath ) )
        response.pipe( output )
        response.on( 'end', () => output.close() )
      }
    } ).on( 'error', reject )
  } )
}

module.exports = download
