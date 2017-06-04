const express = require( 'express' )
const http    = require( 'http' )

const path = require( 'path' )
const getAbsolutePath = ( ...args ) => path.resolve( path.join.apply( this, args ) )

const removeRoute = ( app, path ) => {
  let stack = app._router.stack
  for( let i=0; i<stack.length; i++ ){
    if( stack[i].route && stack[i].route.path && stack[i].route.path === path ){
      stack.splice( i, 1 )
      break
    }
  }
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
