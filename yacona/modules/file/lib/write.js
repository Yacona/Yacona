const fs = require( 'fs' )

const utility = require( '../../utility' )

const write = ( filePath, content ) => {
  try {
    fs.writeFileSync( filePath, content )
    return utility.status()
  } catch( error ){
    return utility.status( error )
  }
}

module.exports = write
