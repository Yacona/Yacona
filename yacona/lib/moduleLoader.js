const path = require( 'path' )

const moduleLoader = name => {
  let target = path.resolve( __dirname, '../modules', name )
  try {
    return require( target )
  } catch( error ){
    return {}
  }
}

module.exports = moduleLoader
