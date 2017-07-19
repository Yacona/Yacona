const fs = require( 'fs' )

const utility = require( '../../utility' )

const read  = filePath => {
  try {
    return utility.status( undefined, fs.readFileSync( filePath, 'utf-8' ) )
  } catch( error ){
    return utility.status( error )
  }
}

module.exports = read
