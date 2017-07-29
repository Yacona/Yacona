// --- Modules --- //

const moduleLoader = require( './support/moduleLoader' )

const utility = moduleLoader( 'utility' )

const Server  = require( './class/Server' ).Server
const App     = require( './class/App' ).App
const GUI     = require( './class/GUI' ).GUI
const Storage = require( './class/Storage' ).Storage
const Manager = require( './class/Manager' ).Manager

// --- Functions --- //

const debug = message => {
  return utility.debug( 'magenta', 'yacona', message )
}

// --- Store : Declare private member and method --- //

const store = new WeakMap()

// --- Yacona Class --- //

class Yacona {

  constructor( options ){
    options = options || {}

    const server = new Server( {
      port: options.port
    } )

    let socketFunctions = {}

    const io = require( 'socket.io' )( server.getServer() )

    // --- Store --- //

    const chdir  = options.chdir || process.cwd()
    const prefix = options.prefix || null

    store.set( this, {
      server         : server,
      chdir          : chdir,
      prefix         : prefix,
      io             : io,
      modules        : {},
      clientModules  : {},
      apps           : {},
      socketFunctions: {},
      listeners      : {},
      connected      : {},
      on             : {}, // connected
      gui            : new GUI( prefix ),
      storage        : new Storage( {
        prefix   : prefix,
        directory: chdir
      } ),
      appManager     : new Manager( {
        prefix   : prefix,
        directory: chdir
      } )
    } )

    const self = store.get( this )
    debug( 'Prefix : ' + self.prefix )
    debug( 'Working directory : ' + self.chdir )
    debug( 'Port : ' + self.server.getPort() )

    // /modules/websocket
    this.addClientModule( 'websocket', utility.absPath( __dirname, 'support/client/websocket.js' ) )
  }

  getPrefix(){
    return store.get( this ).prefix
  }

  getChdir(){
    return store.get( this ).chdir
  }

  getApps(){
    return store.get( this ).apps
  }

  // --- Support Modules --- //

  addModule( name, place ){
    if( name === undefined || place === undefined )
      return false

    const self = store.get( this )

    if( place[0] !== '/' )
      place = utility.absPath( self.chdir, place )
    self.modules[name] = place
    return true
  }

  removeModule( name ){
    if( name === undefined )
      return false

    const self = store.get( this )

    delete self.modules[name]
    return true
  }

  loadModule( name ){
    const self = store.get( this )
    if( name === undefined || self.modules[name] === undefined )
      return moduleLoader( name )
    return require( self.modules[name] )
  }

  // --- Support Client Modules --- //

  addClientModule( name, place ){
    if( name === undefined || place === undefined )
      return false

    const self = store.get( this )

    if( place[0] !== '/' )
      place = utility.absPath( self.chdir, place )

    self.clientModules[name] = place
    self.server.get( '/modules/' + name
                   , ( _, response ) => response.sendFile( self.clientModules[name] ) )
    return true
  }

  removeClientModule( name ){
    if( name === undefined )
      return false

    const self = store.get( this )

    delete self.clientModules[name]
    self.server.removeGet( '/modules/' + name )
    return true
  }

  // --- Socket --- //

  addWebSocket( name, callback ){
    console.log( name, callback )
    if( name === undefined || callback === undefined )
      return false

    const self = store.get( this )

    self.io.of( name ).on( 'connection', callback )

    debug( 'Add socket namespace : ' + name )
    self.socketFunctions[name] = callback

    return true
  }

  removeWebSocket( name ){
    if( name === undefined )
      return false

    const self = store.get( this )

    const io = self.io

    const namespace = self.io.of( name )
    const connected = Object.keys( namespace.connected )
    connected.forEach( socketId => {
      namespace.connected[socketId].disconnect()
    } )

    namespace.removeAllListeners()
    delete self.io.nsps[name]

    debug( 'Remove socket namespace : ' + name )
    delete self.socketFunctions[name]
    return true
  }

  // --- Documents --- //

  saveDocument( filePath, content ){
    const self = store.get( this )
    return self.storage.saveDocument( filePath, content )
  }

  loadDocument( filePath ){
    const self = store.get( this )
    return self.storage.loadDocument( filePath )
  }

  saveAppData( filePath, content ){
    const self = store.get( this )
    return self.storage.saveAppData( filePath, content )
  }

  loadAppData( filePath ){
    const self = store.get( this )
    return self.storage.loadAppData( filePath )
  }

  // --- Express --- //

  use( ...args ){
    const self = store.get( this )
    return self.server.use.apply( self.server, args )
  }

  get( ...args ){
    const self = store.get( this )
    return self.server.get.apply( self.server, args )
  }

  post( ...args ){
    const self = store.get( this )
    return self.server.post.apply( self.server, args )
  }

  put( ...args ){
    const self = store.get( this )
    return self.server.put.apply( self.server, args )
  }

  delete( ...args ){
    const self = store.get( this )
    return self.server.delete.apply( self.server, args )
  }

  removeGet( route ){
    const self = store.get( this )
    return self.server.removeGet( route )
  }

  removePost( route ){
    const self = store.get( this )
    return self.server.removePost( route )
  }

  removePut( route ){
    const self = store.get( this )
    return self.server.removePut( route )
  }

  removeDelete( route ){
    const self = store.get( this )
    return self.server.removeDelete( route )
  }

  getPort(){
    return store.get( this ).server.getPort()
  }

  getUrl(){
    return '127.0.0.1:' + String( this.getPort() )
  }

  // --- App --- //

  attachApp( place ){
    if( place === undefined )
      return false

    const self = store.get( this )

    if( place[0] !== '/' )
      place = utility.absPath( self.chdir, place )

    let app  = new App( this, place )
    let name = app.getName()

    if( self.apps[name] !== undefined ){
      app = undefined
      return false
    }

    self.apps[name] = app

    return app
  }

  detachApp( appName ){
    const self = store.get( this )
    let app

    if( typeof appName === 'string' )
      app = self.apps[appName]
    else if( typeof appName === 'object' && appName instanceof App )
      app = appName // App Instance Object

    appName = app.getName()

    app.close()

    delete self.apps[appName]

    return true
  }

  // --- Other Instance --- //

  connect( yacona ){
    if( yacona === undefined || yacona instanceof Yacona === false )
      return false

    const self = store.get( this )
    const name = yacona.getPrefix()

    if( self.connected[name] !== undefined )
      return false

    self.connected[name] = yacona
    yacona.connect( this )

    debug( 'Connected to ' + yacona.getPrefix() )

    return true
  }

  disconnect( yacona ){
    if( yacona === undefined || yacona instanceof Yacona === false )
      return false

    const self = store.get( this )
    const name = yacona.getPrefix()

    if( self.connected[name] === undefined )
      return false

    delete self.connected[name]
    yacona.disconnect( this )

    debug( 'Disconnected to ' + yacona.getPrefix() )

    return true
  }

  broadcast( name, data ){
    if( name === undefined )
      return false

    const self = store.get( this )

    for( let target in self.connected ){
      this.emit( target, name, data )
    }

    return true
  }

  emit( target, name, data ){
    if( typeof target !== 'string' )
      return false

    const self = store.get( this )

    if( self.connected[target] === undefined )
      return false

    self.connected[target].on( {
      signature: this.getPrefix(),
      name     : name,
      data     : data
    } )

    return true
  }

  // on( name, callback )
  // on( data )
  on( name, callback ){
    const self = store.get( this )

    if( typeof name === 'string' ){
      self.on[name] = callback
      return true
    }

    if( callback !== undefined || typeof name !== 'object' ){
      return false
    }

    let message = name

    if( message.signature === undefined || message.name === undefined ){
      return false
    }

    let fn = self.on[message.name]

    if( fn === undefined ){
      return false
    }

    fn( message.signature, message.data )

    return true
  }

  // --- Electron --- //

  createWindow( options ){
    return store.get( this ).gui.createWindow( options )
  }

  // appId => String
  // appId => Object ( Instance of BrowserWindow )
  destroyWindow( appId ){
    return store.get( this ).gui.destroyWindow( appId )
  }

  // --- On, Emit --- //

  addListener( name, callback ){
    const self = store.get( this )
    if( self.listeners[name] === undefined ){
      self.listeners[name] = callback
      return true
    }
    return false
  }

  // args : Array
  callListener( name, ...args ){
    const self = store.get( this )
    if( self.listeners[name] !== undefined ){
      return utility.status( undefined, self.listeners[name].apply( self.listeners[name], args ) )
    }
    return utility.status( false, undefined )
  }

  removeListener( name ){
    const self = store.get( this )
    if( self.listeners[name] !== undefined ){
      delete self.listeners[name]
      return true
    }
    return false
  }

  // --- App Manager --- //

  addApp( url ){
    return store.get( this ).appManager.add( url )
  }

  removeApp( name ){
    return store.get( this ).appManager.remove( name )
  }

  runApp( name ){
    let p = store.get( this ).appManager.getPath( name )
    if( p === null )
      return false

    const app = this.attachApp( p )
    app.launch()

    return app
  }

  // --- Static --- //

  static loadModule( name ){
    return moduleLoader( name )
  }

}

module.exports.Yacona = Yacona
