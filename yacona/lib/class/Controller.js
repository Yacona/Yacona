// --- Modules --- //

const url     = require( 'url' )

const moduleLoader = require( '../support/moduleLoader' )

const utility = moduleLoader( 'utility' )

// --- Store : Declare private member and method --- //

const store = new WeakMap()

// --- Controller Class --- //

class Controller {

  constructor( app ){
    store.set( this, {
      app: app
    } )
  }

  getApp(){
    return store.get( this ).app
  }

  getA(){
    return store.get( this ).app.removeSocketIO()
  }

  getUrl(){
    return store.get( this ).app.getUrl()
  }

  getPort(){
    return store.get( this ).app.getPort()
  }

  createWindow( options ){
    return store.get( this ).app.createWindow( options )
  }

  destroyWindow( window ){
    return store.get( this ).app.destroyWindow( window )
  }

  saveDocument( filePath, content ){
    const self = store.get( this )
    return self.app.saveDocument( filePath, content )
  }

  loadDocument( filePath ){
    const self = store.get( this )
    return self.app.loadDocument( filePath )
  }

  saveAppData( filePath, content ){
    const self = store.get( this )
    return self.app.saveAppData( filePath, content )
  }

  loadAppData( filePath ){
    const self = store.get( this )
    return self.app.loadAppData( filePath )
  }

  // --- Routes --- //

  addStaticRoute( src ){
    if( src === undefined )
      return false

    const self = store.get( this )

    if( src[0] !== '/' )
      src = utility.absPath( self.app.getChdir(), src )

    self.app.get( '/*', ( request, response ) => {
      let url = request.url.split( '/' )

      url.shift()
      url.shift()

      // if directory root
      if( url[url.length-1] === '' ) url[url.length-1] = 'index.html'

      response.sendFile(
        utility.absPath( src, url.join( '/' ) )
      )
    } )
  }

  removeStaticRoute(){
    const self = store.get( this )
    self.app.removeGet( '/*' )
  }

  get( ...args ){
    const self = store.get( this )
    return self.app.get.apply( self.app, args )
  }

  post( ...args ){
    const self = store.get( this )
    return self.app.post.apply( self.app, args )
  }

  put( ...args ){
    const self = store.get( this )
    return self.app.put.apply( self.app, args )
  }

  delete( ...args ){
    const self = store.get( this )
    return self.app.delete.apply( self.app, args )
  }

  removeGet( route ){
    const self = store.get( this )
    return self.app.removeGet( route )
  }

  removePost( route ){
    const self = store.get( this )
    return self.app.removePost( route )
  }

  removePut( route ){
    const self = store.get( this )
    return self.app.removePut( route )
  }

  removeDelete( route ){
    const self = store.get( this )
    return self.app.removeDelete( route )
  }

  // --- Socket Functions --- //

  getSocketIO( func ){
    return store.get( this ).app.getSocketIO( func )
  }

  // --- Event --- //

  addListener( name, callback ){
    const self = store.get( this )
    return self.app.addListener( name, callback )
  }

  callListener( name, ...args ){
    const self = store.get( this )
    return self.app.callListener.apply( self.app, [name].concat( args ) )
  }

  removeListener( name ){
    const self = store.get( this )
    return self.app.removeListener( name )
  }

}

module.exports.Controller = Controller
