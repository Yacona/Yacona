const fs   = require( 'fs' )
const path = require( 'path' )

const exists = filePath => {
  try {
    fs.statSync( path.resolve( filePath ) )
    return true
  } catch( error ){
    return false
  }
}

// Is node.js rmdir recursive ? Will it work on non empty directories?
// https://stackoverflow.com/questions/12627586/is-node-js-rmdir-recursive-will-it-work-on-non-empty-directories
const deleteFolderRecursive = path => {
  let files = []
  if( exists( path ) === true ) {
    files = fs.readdirSync( path )
    files.forEach( ( file, index ) => {
      let curPath = path + '/' + file
      if( fs.lstatSync( curPath ).isDirectory() ){
        deleteFolderRecursive( curPath )
      } else {
        fs.unlinkSync( curPath )
      }
    } )
    fs.rmdirSync( path )
  }
}

module.exports = deleteFolderRecursive
