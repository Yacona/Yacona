const path = require( 'path' )
const fs   = require( 'fs' )

// Create a new path from arguments.
const getAbsolutePath = ( ...args ) => path.resolve( path.join.apply( null, args ) )
const isExist = filePath => {
  try {
    fs.statSync( path.resolve( filePath ) )
    return true
  } catch( error ){
    return false
  }
}

const read  = filePath => fs.readFileSync( filePath, 'utf-8' )
const write = ( filePath, content ) => fs.writeFileSync( filePath, content )

module.exports = {
  getAbsolutePath: getAbsolutePath,
  isExist        : isExist,
  read           : read,
  write          : write
}
