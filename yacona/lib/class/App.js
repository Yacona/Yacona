// --- Modules --- //

const Controller = require( './Controller' ).Controller

const moduleLoader = require( '../support/moduleLoader' )

const utility = moduleLoader( 'utility' )
const file    = moduleLoader( 'file' )

// --- Functions --- //

const debug = ( name, message ) => {
  return utility.debug( 'red', 'app (' + name + ')', message )
}

const generateAppId = () => Math.random().toString( 36 ).slice( -8 )

// --- Store : Declare private member and method --- //

const store = new WeakMap()

// --- App Class --- /

class App {

  constructor( yacona, chdir ){
    const src = utility.absPath( chdir, 'package.json' )
		const packageJson = utility.exists( src )
			? JSON.parse( file.read( src ).result )
			: {}

    if( packageJson.main === undefined )
  		packageJson.main = 'app'

    const name = packageJson.name || chdir.split( '/' ).pop()

    store.set( this, {
      yacona    : yacona,
      chdir     : chdir,
      id        : generateAppId(),
      name      : name,
      package   : packageJson,
      isRunning : false,
      controller: null,
      instance  : null,

      // This params using on close event
      routes    : { get: [], post: [], put: [], delete: [] },
      windows   : [],
      sockets   : []
    } )
  }

  getName(){
    return store.get( this ).name
  }

  getChdir(){
    return store.get( this ).chdir
  }

  getId(){
    return store.get( this ).id
  }

  getPackage(){
    return JSON.parse( JSON.stringify( store.get( this ).package ) )
  }

  getController(){
    return store.get( this ).controller
  }

  isRunning(){
    return store.get( this ).isRunning
  }

  launch(){
    const self = store.get( this )

    if( self.isRunning )
			return false

		self.isRunning  = true
		self.instance   = require( utility.absPath( self.chdir, self.package.main ) )
    self.controller = new Controller( this )

		if( self.instance !== null && self.instance.launch ){
			self.instance.launch( self.controller )
    }

		return self.controller
  }

  close(){
    const self = store.get( this )

		if( self.isRunning === true ){
			self.isRunning = false

      // Express

      self.routes.get.forEach( route => this.removeGet( route ) )
      self.routes.post.forEach( route => this.removePost( route ) )
      self.routes.put.forEach( route => this.removePut( route ) )
      self.routes.delete.forEach( route => this.removeDelete( route ) )

      // Socket.io

      self.sockets.forEach( socket => this.removeSocket( socket ) )

      // Electron
      // GUI Class

      store.get( this ).yacona.destroyWindow( this.getId() )

      self.windows = []

      // Close

      self.instance   = undefined
      self.controller = undefined

			return true
		}

		return false
	}

  // --- Wrap --- //

  // --- Socket --- //

  addSocket( name, callback ){
    store.get( this ).sockets.push( name )
    return store.get( this ).yacona.addSocket( this.getName() + '/' + name, callback )
  }

  removeSocket( name ){
    const self = store.get( this )

    let index = self.sockets.indexOf( name )
    if( index !== -1 )
      self.sockets.splice( index, 1 )

    return store.get( this ).yacona.removeSocket( this.getName() + '/' + name )
  }

  // --- Documents --- //

  saveDocument( filePath, content ){
    return store.get( this ).yacona.saveDocument( this.getName() + '/' + filePath, content )
  }

  loadDocument( filePath ){
    return store.get( this ).yacona.loadDocument( this.getName() + '/' + filePath )
  }

  saveAppData( filePath, content ){
    return store.get( this ).yacona.saveAppData( this.getName() + '/' + filePath, content )
  }

  loadAppData( filePath ){
    return store.get( this ).yacona.loadAppData( this.getName() + '/' + filePath )
  }

  // --- Express --- //

  get( ...args ){
    let route = args[0]
    args[0] = '/' + this.getName() + args[0]
    const self = store.get( this )
    self.routes.get.push( route )
    return self.yacona.get.apply( self.yacona, args )
  }

  post( ...args ){
    let route = args[0]
    args[0] = '/' + this.getName() + args[0]
    const self = store.get( this )
    self.routes.post.push( route )
    return self.yacona.post.apply( self.yacona, args )
  }

  put( ...args ){
    let route = args[0]
    args[0] = '/' + this.getName() + args[0]
    const self = store.get( this )
    self.routes.put.push( route )
    return self.yacona.put.apply( self.yacona, args )
  }

  delete( ...args ){
    let route = args[0]
    args[0] = '/' + this.getName() + args[0]
    const self = store.get( this )
    self.routes.delete.push( route )
    return self.yacona.delete.apply( self.yacona, args )
  }

  removeGet( route ){
    const self = store.get( this )

    let index = self.routes.get.indexOf( route )
    if( index !== -1 )
      self.routes.get.splice( index, 1 )

    return self.yacona.removeGet( '/' + this.getName() + route )
  }

  removePost( route ){
    const self = store.get( this )

    let index = self.routes.post.indexOf( route )
    if( index !== -1 )
      self.routes.post.splice( index, 1 )

    return self.yacona.removePost( '/' + this.getName() + route )
  }

  removePut( route ){
    const self = store.get( this )

    let index = self.routes.put.indexOf( route )
    if( index !== -1 )
      self.routes.put.splice( index, 1 )

    return self.yacona.removePut( '/' + this.getName() + route )
  }

  removeDelete( route ){
    const self = store.get( this )

    let index = self.routes.delete.indexOf( route )
    if( index !== -1 )
      self.routes.delete.splice( index, 1 )

    return self.yacona.removeDelete( '/' + this.getName() + route )
  }

  getPort(){
    return store.get( this ).yacona.getPort()
  }

  getUrl(){
    return '127.0.0.1:' + String( this.getPort() ) + '/' + this.getName()
  }

  // --- Create Window --- //

  createWindow( options ){
    const self = store.get( this )

    return new Promise( ( resolve, reject ) => {
      self.yacona.createWindow( options )
        .then( main => {
          main.app = this
          debug( this.getName() + ':' + this.getId(), 'loadURL => ' + 'http://' + this.getUrl() )
          self.windows.push( main )

          main.loadURL( 'http://' + this.getUrl() + '/' )
          resolve( main )
        } )
        .catch( reject )
    } )
  }

}

module.exports.App = App
