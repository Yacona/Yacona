// --- Modules --- //

const express = require( 'express' )

const moduleLoader = require( '../moduleLoader' )

const utility = moduleLoader( 'utility' )

// --- Functions --- //

const debug = message => {
  return utility.debug( 'cyan', 'server', message )
}

// --- Store : Declare private member and method --- //

const store = new WeakMap()

// --- Server Class --- //

class Server {

  constructor( options ){
    options = options || {}

    const app = express()

    const server = app.listen( options.port, () => {
      debug( 'Running app on 127.0.0.1:' + String( server.address().port ) )
    } )

    const remove = ( method, path ) => {
      let stack  = app._router.stack
      let result
      for( let i=0; i<stack.length; i++ ){
        if( stack[i].route && stack[i].route.path && stack[i].route.path === path && stack[i].route.methods[method] === true ){
          result = stack.splice( i, 1 )
          break
        }
      }
      return result
    }

    store.set( this, {
      port  : server.address().port,
      server: server,
      app   : app,
      remove: remove
    } )
  }

  use( ...args ){
    const app = store.get( this ).app
    debug( 'Add USE : ' + args[0] )
    return app.use.apply( app, args )
  }

  // app.get( route, function )
  get( ...args ){
    const app = store.get( this ).app
    debug( 'Add GET : ' + args[0] )
    return app.get.apply( app, args )
  }

  // app.post( route, function )
  post( ...args ){
    const app = store.get( this ).app
    debug( 'Add POST : ' + args[0] )
    return app.post.apply( app, args )
  }

  // app.put( route, function )
  put( ...args ){
    const app = store.get( this ).app
    debug( 'Add PUT : ' + args[0] )
    return app.put.apply( app, args )
  }

  // app.delete( route, function )
  delete( ...args ){
    const app = store.get( this ).app
    debug( 'Add DELETE : ' + args[0] )
    return app.delete.apply( app, args )
  }

  removeGet( route ){
    debug( 'Remove GET : ' + route )
    return store.get( this ).remove( 'get', route )
  }

  removePost( route ){
    debug( 'Remove POST : ' + route )
    return store.get( this ).remove( 'post', route )
  }

  removePut( route ){
    debug( 'Remove PUT : ' + route )
    return store.get( this ).remove( 'put', route )
  }

  removeDelete( route ){
    debug( 'Remove DELETE : ' + route )
    return store.get( this ).remove( 'delete', route )
  }

  getPort(){
    return store.get( this ).port
  }

  getUrl(){
    return '127.0.0.1:' + String( this.getPort() )
  }

  getServer(){
    return store.get( this ).server
  }

}

// --- Export --- //

module.exports.Server = Server
