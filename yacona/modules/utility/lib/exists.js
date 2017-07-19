const fs = require( 'fs' )

const absPath = require( './absPath' )

const exists = filePath => {
  try {
    fs.statSync( absPath( filePath ) )
    return true
  } catch( error ){
    return false
  }
}

module.exports = exists
