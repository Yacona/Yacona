// --- Debug --- //

const debug = console.log

// --- Modules --- //

const path = require( 'path' )
const fs   = require( 'fs' )

const express = require( 'express' )

const App = require( './app' ).App

// --- Functions --- //

// Support Functions

const absPath = path.resolve

const createServer = port => {
  let app = express()

  let server = app.listen( port, () => {
    debug( 'Running app on 127.0.0.1:' + String( server.address().port ) )
  } )

  return {
    server: server,
    app   : app
  }
}

const removeRoute = ( app, path ) => {
  let stack = app._router.stack
  for( let i=0; i<stack.length; i++ ){
    if( stack[i].route && stack[i].route.path && stack[i].route.path === path ){
      stack.splice( i, 1 )
      break
    }
  }
}

// Data Store

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

// Use documents or appData path created by electron when we use electron command.
// Use the current directory path when we use node command.
// node
// saveDocument ./documents/path/to/file
// saveAppdata  ./appData/path/to/file
// electron
// saveDocument electron.app.getPath( 'documents' ) + /path/to/file
// saveAppdata  electron.app.getPath( 'appData' ) + /path/to/file
const savaData = ( isElectron, type, chdir, prefix, filePath, content ) => {
  let basePath = chdir

  if( prefix !== null )
    filePath = prefix + '/' + filePath

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
      let directory = absPath( basePath, filePaths.concat().splice( 0, index + 1 ).join( '/' ) )
      if( isExist( directory ) === false )
        fs.mkdirSync( directory )
    } )
    write(
      absPath( basePath, filePath ),
      content
    )
  } catch( error ){
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
const loadData = ( isElectron, type, chdir, prefix, filePath ) => {
  let basePath = chdir

  if( prefix !== null )
    filePath = prefix + '/' + filePath

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

  let path = absPath( basePath, filePath )
  if( isExist( path ) )
    return read( path )
  return false
}

// --- Server class --- //

class Server {

  // Options
  // port   : Int
  // chdir  : String
  // prefix : String
  constructor( options ){
    options = options || {}

    let s = createServer( options.port )

    this.server        = s.server
    this.app           = s.app
    this.port          = this.server.address().port
    this.url           = '127.0.0.1:' + String( this.port )

    this.electron      = null
    if( process.title.split( '/' ).pop().toLowerCase() === 'electron' ){
      this.electron    = require( 'electron' )
      this.windowQueue = []
    }

    // Socket.io
    this.ioFunctions   = {}

    this.io            = require( 'socket.io' )( this.server )
    this.io.use( require( 'socketio-wildcard' )() )
    this.io.sockets.on( 'connection', socket => {
      socket.on( '*', value => {
        let appName = socket.handshake.headers.referer
                        .replace( /http:\/\//, '' )
                        .replace( RegExp( socket.handshake.headers.host ), '' )
                        .split( '/' )[1]
        let fn
        if( fn = this.ioFunctions[appName + '/' + value.data[0]] )
          fn( socket, value.data[1] )
      } )
    } )

    // Working directory
    this.chdir         = options.chdir || process.env.PWD

    // Prefix
    this.prefix        = options.prefix || null

    // Modules
    this.modules       = {}
    this.clientModules = {}

    // App
    this.apps          = {}
  }

  // --- Support config --- //

  getPrefix(){
    return this.prefix
  }

  setPrefix( prefix ){
    if( prefix !== undefined && typeof prefix === 'string' )
      this.prefix = prefix
    return this.prefix
  }

  getChdir(){
    return this.chdir
  }

  setChdir( chdir ){
    if( chdir !== undefined && typeof chdir === 'string' )
      this.chdir = chdir
    return this.chdir
  }

  // --- Support modules --- //

  addModule( name, place ){
    if( name === undefined || place === undefined )
      return false
    if( place[0] !== '/' )
      place = absPath( this.chdir, place )
    this.modules[name] = place
    return true
  }

  removeModule( name ){
    if( name === undefined )
      return false
    delete this.modules[name]
    return true
  }

  loadModule( name ){
    if( name === undefined || this.modules[name] === undefined )
      return {}
    return require( this.modules[name] )
  }

  // --- Support client modules --- //

  addClientModule( name, place ){
    if( name === undefined || place === undefined )
      return false
    if( place[0] !== '/' )
      place = absPath( this.chdir, place )
    this.clientModules[name] = place
    this.addRoute( 'get'
                 , '/modules/' + name
                 , ( _, response ) => response.sendFile( this.clientModules[name] ) )
    return true
  }

  removeClientModule( name ){
    if( name === undefined )
      return false
    delete this.clientModules[name]
    removeRoute( this.app, '/modules/' + name )
    return true
  }

  // --- Create new App --- //

  attachApp( place ){
    if( place === undefined )
      place = './'

    if( place[0] !== '/' )
      place = absPath( this.chdir, place )

    let app = new App( this, place )
    if( this.apps[app.name] === undefined )
      return this.apps[app.name] = app

    return false
  }

  // detachApp(){
  //
  // }

  // --- Routing --- //

  addRoute( type, href, fn ){
    if( href === undefined || fn === undefined )
      return false

    // GET to get, POST to post, etc
    type = type.toLowerCase()

    this.app[type]( href, fn )

    return true
  }

  removeRoute( href ){
    if( href === undefined )
      return false
    removeRoute( this.app, href )
    return true
  }

  // --- Socket --- //

  addSocket( name, callback ){
    if( name === undefined || callback === undefined )
      return false
    this.ioFunctions[name] = callback
    return true
  }

  removeSocket( name ){
    if( name === undefined )
      return false
    delete this.ioFunctions[name]
    return true
  }

  // --- Electron --- //

  createWindow( url, options, closeFn, callback ){
    if( this.electron === null )
      return false

    if( this.electron.app.isReady() === false ){
      this.windowQueue.push( { url: url, options: options, closeFn: closeFn, callback: callback } )
      this.electron.app.on( 'ready', () => {
        if( this.windowQueue.length !== 0 )
          for( let request; request = this.windowQueue.shift(); )
            this.createWindow( request.url, request.options, request.closeFn, request.callback )
      } )
      return true
    }

    this.electron.app.on( 'window-all-closed', this.electron.app.quit )

    if( typeof options === 'function' ){
      closeFn = options
      options = {}
    }

    if( options === undefined ) options = {}

    options.show = false

    let fixWidth = 0
    if( require( 'os' ).type().toLowerCase().match( /windows/ ) !== null )
        fixWidth = 15

    if( options.width === undefined )
        options.width = 800

    options.width += fixWidth

    let main = new this.electron.BrowserWindow( options )

    main.loadURL( url.indexOf( 'http' ) !== -1 ? url : 'http://' + url )
    if( options.setResizable === false ) main.setResizable( false )
    if( options.setMaximumSize ) main.setMaximumSize( options.setMaximumSize.width + fixWidth, options.setMaximumSize.height )
    if( options.setMinimumSize ) main.setMinimumSize( options.setMinimumSize.width + fixWidth, options.setMinimumSize.height )
    if( options.setMaxListeners ) main.setMaxListeners( options.setMaxListeners )
    if( options.setMenu === null ) main.setMenu( null )
    if( options.openDevTools ) main.openDevTools()

    // --- Application events --- //

    main.on( 'closed', function(){
      main = null
      if( closeFn ) closeFn()
    } )

    // Ready
    main.show()

    if( callback !== undefined ) callback( main )

    return true
  }

  // --- Documents --- //

  saveDocument( filePath, content ){
    return savaData( this.electron !== null, 'documents', this.chdir, this.prefix, filePath, content )
  }

  loadDocument( filePath ){
    return loadData( this.electron !== null, 'documents', this.chdir, this.prefix, filePath )
  }

  saveAppData( filePath, content ){
    return savaData( this.electron !== null, 'appData', this.chdir, this.prefix, filePath, content )
  }

  loadAppData( filePath ){
    return loadData( this.electron !== null, 'appData', this.chdir, this.prefix, filePath )
  }

}

module.exports.Server = Server
