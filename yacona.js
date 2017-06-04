let isElectron = false
if( process.argv[0].split( '/' ).pop().toLowerCase() === 'electron' )
  isElectron = true

const express = require( 'express' )
const http    = require( 'http' )

const path = require( 'path' )
const getAbsolutePath = ( ...args ) => path.resolve( path.join.apply( this, args ) )
const isExist = filePath => {
  try {
    fs.statSync( path.resolve( filePath ) )
    return true
  } catch( error ){
    return false
  }
}

const fs = require( 'fs' )
const read  = filePath => fs.readFileSync( filePath, 'utf-8' )
const write = ( filePath, content ) => fs.writeFileSync( filePath, content )

const removeRoute = ( app, path ) => {
  let stack = app._router.stack
  for( let i=0; i<stack.length; i++ ){
    if( stack[i].route && stack[i].route.path && stack[i].route.path === path ){
      stack.splice( i, 1 )
      break
    }
  }
}

// Use documents or appData path created by electron when we use electron command.
// Use the current directory path when we use node command.
// node
// saveDocument ./documents/path/to/file
// saveAppdata  ./appData/path/to/file
// electron
// saveDocument electron.app.getPath( 'documents' ) + /path/to/file
// saveAppdata  electron.app.getPath( 'appData' ) + /path/to/file
const savaData = ( type, chdir, filePath, content ) => {
  let basePath = chdir

  if( isElectron ){
    const electron = require( 'electron' )

    if( type === 'documents' )
      basePath = electron.app.getPath( 'documents' )
    else if( type === 'appData' )
      basePath = electron.app.getPath( 'appData' )
  } else {
    if( type === 'documents' )
      filePath = 'documents/' + filePath
    else if( type === 'appData' )
      filePath = 'appData/' + filePath
  }

  let filePaths = filePath.split( /\/|\\/ )
  filePaths.pop()

  try {
    filePaths.forEach( ( _, index ) => {
      let directory = getAbsolutePath( basePath, filePaths.concat().splice( 0, index + 1 ).join( '/' ) )
      if( isExist( directory ) === false )
        fs.mkdirSync( directory )
    } )
    write(
      getAbsolutePath( basePath, filePath ),
      content
    )
  } catch( error ){
    console.log( error )
    return false
  }

  return true
}

// Use documents or appData path created by electron when we use electron command.
// Use the current directory path when we use node command.
// node
// loadDocument ./documents/path/to/file
// loadAppdata  ./appData/path/to/file
// electron
// loadDocument electron.app.getPath( 'documents' ) + /path/to/file
// loadAppdata  electron.app.getPath( 'appData' ) + /path/to/file
const loadData = ( type, chdir, filePath ) => {
  let basePath = chdir

  if( isElectron ){
    const electron = require( 'electron' )

    if( type === 'documents' )
      basePath = electron.app.getPath( 'documents' )
    else if( type === 'appData' )
      basePath = electron.app.getPath( 'appData' )
  } else {
    if( type === 'documents' )
      filePath = 'documents/' + filePath
    else if( type === 'appData' )
      filePath = 'appData/' + filePath
  }

  let path = getAbsolutePath( basePath, filePath )
  if( isExist( path ) )
    return read( path )
  return false
}

const createServer = port => {
  let app    = express(),
      server = http.Server( app )

  let listen = ( port === undefined )
    ? server.listen()
    : server.listen( port )

  return server
}

class Yacona {

  constructor(){
    this.server = createServer()
    this.port   = this.server.address().port
    this.url    = '127.0.0.1:' + this.port
    // Instance of express located at server._events.request
    // Use this method when routing
    // Get request .get / Post request .post / Delete request .delete
    // server._events.request.get( path, function )
    this.route  = this.server._events.request

    // Modules
    this.modules = {}
    this.clientModules = {}

    this.currentDirectory = __dirname
    this.prefix = null
  }

  prefix( prefix ){
    if( prefix !== undefined )
      this.prefix = prefix
    return this.prefix
  }

  chdir( chdir ){
    if( chdir !== undefined )
      this.currentDirectory = chdir
    return this.currentDirectory
  }

  saveDocument( filePath, content ){
    return savaData( 'documents', this.currentDirectory, filePath, content )
  }

  loadDocument( filePath ){
    return loadData( 'documents', this.currentDirectory, filePath )
  }

  saveAppData(){
    return savaData( 'appData', this.currentDirectory, filePath, content )
  }

  loadAppData( filePath ){
    return loadData( 'appData', this.currentDirectory, filePath )
  }

  addClientModule( name, path ){
    if( name === undefined || path === undefined )
      return false
    if( path[0] !== '/' )
      path = getAbsolutePath( this.currentDirectory, path )
    this.clientModules[name] = path
    this.route.get( '/' + name, ( _, response ) => response.sendFile( this.clientModules[name] ) )
    return true
  }

  removeClientModule( name ){
    if( name === undefined )
      return false
    delete this.clientModules[name]
    removeRoute( this.server._events.request, '/' + name )
    return true
  }

  loadModule( name ){
    if( name === undefined || this.modules[name] === undefined )
      return {}
    return require( this.modules[name] )
  }

  addModule( name, path ){
    if( name === undefined || path === undefined )
      return false
    if( path[0] !== '/' )
      path = getAbsolutePath( this.currentDirectory, path )
    this.modules[name] = path
    return true
  }

  removeModule( name ){
    if( name === undefined )
      return false
    delete this.modules[name]
    return true
  }

}

module.exports = Yacona
