const moduleLoader = require( '../support/moduleLoader' )

const utility = moduleLoader( 'utility' )
const file    = moduleLoader( 'file' )

// --- Methods --- //

const save = ( basePath, filePath, content ) => {
  if( filePath === undefined )
    return false

  const absolutePath  = utility.absPath( basePath, filePath )
  const directoryPath = absolutePath.split( /\/|\\/ ).slice( 0, -1 ).join( '/' )

  if( file.mkdir( directoryPath ) === true ){
    file.write( absolutePath, content )
    return true
  }

  return false
}

const load = ( basePath, filePath ) => {
  if( filePath === undefined )
    return null

  const absolutePath = utility.absPath( basePath, filePath )
  const response = file.read( absolutePath )

  if( response.error === undefined )
    return response.result

  return null
}

// --- Store : Declare private member and method --- //

const store = new WeakMap()

// --- Storage Class --- //

class Storage {

  constructor( options ){
    options = options || {}

    options.prefix    = options.prefix || './'
    options.directory = options.directory || process.cwd()

    // Target the local directory
    options.local     = options.local !== undefined

    if( options.directory[0].match( /\/|\\/ ) !== null )
      options.directory = utility.absPath( process.cwd(), options.directory )

    const electron = ( process.title.split( /\\|\// ).pop().toLowerCase() !== 'node' && options.local === false )
                       ? require( 'electron' )
                       : null

    store.set( this, {
      prefix   : options.prefix,
      directory: options.directory,

      electron : electron,

      path     : {
        appData  : utility.absPath(
                     ( ( electron !== null )
                       ? electron.app.getPath( 'appData' )
                       : utility.absPath( options.directory, 'appData' ) )
                     , options.prefix ),
        documents: utility.absPath(
                     ( ( electron !== null )
                       ? electron.app.getPath( 'documents' )
                       : utility.absPath( options.directory, 'documents' ) )
                     , options.prefix ),
      }
    } )
  }

  saveDocument( filePath, content ){
    return save( store.get( this ).path.documents, filePath, content )
  }

  loadDocument( filePath ){
    return load( store.get( this ).path.documents, filePath )
  }

  saveAppData( filePath, content ){
    return save( store.get( this ).path.appData, filePath, content )
  }

  loadAppData( filePath ){
    return load( store.get( this ).path.appData, filePath )
  }

}

// --- Export --- //

module.exports.Storage = Storage
