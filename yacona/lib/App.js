// --- Modules --- //

const Controller = require( './Controller' ).Controller

const moduleLoader = require( './moduleLoader' )

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

		if( self.instance !== null && self.instance.launch )
			self.instance.launch( self.controller )

		return self.controller
  }

  close(){
		if( self.isRunning ){
			if( self.instance !== null && self.instance.close )
				self.instance.close()
			self.isRunning = false
			return true
		}

    // ここで electron と express，socket.io の kill を行う必要がある
    // また Yacona 側の self.apps からの参照を delete する

    // そのためにはメソッドを経由して登録したものを補足しておく必要がある

		return false
	}

  // --- Wrap --- //

  // --- Socket --- //

  addSocket( name, callback ){
    name = this.getName() + '/' + name
    store.get( this ).sockets.push( name )
    return store.get( this ).yacona.addSocket( name, callback )
  }

  removeSocket( name ){
    name = this.getName() + '/' + name

    const self = store.get( this )

    let index = self.sockets.indexOf( name )
    if( index !== -1 )
      self.sockets.splice( index, 1 )

    return store.get( this ).yacona.removeSocket( name )
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
    args[0] = '/' + this.getName() + args[0]
    const self = store.get( this )
    self.routes.get.push( args[0] )
    return self.yacona.get.apply( self.yacona, args )
  }

  post( ...args ){
    args[0] = '/' + this.getName() + args[0]
    const self = store.get( this )
    self.routes.post.push( args[0] )
    return self.yacona.post.apply( self.yacona, args )
  }

  put( ...args ){
    args[0] = '/' + this.getName() + args[0]
    const self = store.get( this )
    self.routes.put.push( args[0] )
    return self.yacona.put.apply( self.yacona, args )
  }

  delete( ...args ){
    args[0] = '/' + this.getName() + args[0]
    const self = store.get( this )
    self.routes.delete.push( args[0] )
    return self.yacona.delete.apply( self.yacona, args )
  }

  removeGet( route ){
    route = '/' + this.getName() + route
    const self = store.get( this )

    let index = self.routes.get.indexOf( route )
    if( index !== -1 )
      self.routes.get.splice( index, 1 )

    return self.yacona.removeGet( route )
  }

  removePost( route ){
    route = '/' + this.getName() + route
    const self = store.get( this )

    let index = self.routes.post.indexOf( route )
    if( index !== -1 )
      self.routes.post.splice( index, 1 )

    return self.yacona.removePost( route )
  }

  removePut( route ){
    route = '/' + this.getName() + route
    const self = store.get( this )

    let index = self.routes.put.indexOf( route )
    if( index !== -1 )
      self.routes.put.splice( index, 1 )

    return self.yacona.removePut( route )
  }

  removeDelete( route ){
    route = '/' + this.getName() + route
    const self = store.get( this )

    let index = self.routes.delete.indexOf( route )
    if( index !== -1 )
      self.routes.delete.splice( index, 1 )

    return self.yacona.removeDelete( route )
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
