const fs       = require( 'fs' )
const electron = require( 'electron' )

const utility = require( './utility' )

const getDocumentPath = () => electron.app.getPath( 'documents' )
const getDataPath     = () => electron.app.getPath( 'appData' )

let events = {}

const document = {}
const appData  = {}

const save = ( basePath, name, filePath, content ) => {
  filePath = name + '/' + filePath
  let filePaths = filePath.split( /\/|\\/ )
  filePaths.pop()

  try {
    filePaths.forEach( ( _, index ) => {
      let directory = utility.getAbsolutePath( basePath, filePaths.concat().splice( 0, index + 1 ).join( '/' ) )
      if( utility.isExist( directory ) === false )
        fs.mkdirSync( directory )
    } )
    utility.write(
      utility.getAbsolutePath( basePath, filePath ),
      content
    )
  } catch( error ){
    return false
  }

  return true
}

const load = ( basePath, name, filePath ) => {
  basePath = utility.getAbsolutePath( basePath, name )
  let path = utility.getAbsolutePath( basePath, filePath )
  if( utility.isExist( path ) )
    return utility.read( path )
  return false
}

document.save = ( name, filePath, content ) => save( getDocumentPath(), name, filePath, content )
document.load = ( name, filePath ) => load( getDocumentPath(), name, filePath )
appData.save  = ( name, filePath, content ) => save( getDataPath(), name, filePath, content )
appData.load  = ( name, filePath ) => load( getDataPath(), name, filePath )

class Controller {

  constructor( name ){
    this.name = name
    this.document = {
      save: ( filePath, content ) => document.save( this.name, filePath, content ),
      load: filePath => document.load( this.name, filePath )
    }
    this.appData = {
      save: ( filePath, content ) => appData.save( this.name, filePath, content ),
      load: filePath => appData.load( this.name, filePath )
    }
  }

  on( name, func ){
    if( events[this.name] === undefined )
      events[this.name] = {}
    events[this.name][name] = func
  }

  emit( target, args ){
    console.log( 'events' )
    console.log( events )
    let options = target
    if( typeof target === 'string' ){
      options = {}
      target = target.split( '/' )
      options.app = target[0]
      options.event = target.splice( 1 ).join( '/' )
    }
    return events[options.app][options.event].apply( null, args )
  }

}

module.exports = Controller
