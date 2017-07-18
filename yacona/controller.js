const path = require( 'path' )

// --- Support Functions --- //

const absPath = path.resolve

// --- Controller class --- //

class Controller {

  constructor( app ){
    this.app = app
    this.url = this.app.server.url + '/' + this.app.name + '/'
  }

  addRoute( src ){
    if( src === undefined )
      return false

    if( src[0] !== '/' )
      src = absPath( this.app.directory, src )

    this.app.server.addRoute( 'get', '/' + this.app.name + '/*', ( request, response ) => {
      let url = request.url.split( '/' )

      url.shift()
      url.shift()

      // if directory root
      if( url[url.length-1] === '' ) url[url.length-1] = 'index.html'

      response.sendFile(
        absPath( src, url.join( '/' ) )
      )
    } )
  }

  removeRoute(){
    this.app.server.removeRoute( '/' + this.app.name + '/*' )
    return true
  }

  // --- Socket Functions --- //

  addSocket( name, callback ){
    return this.app.server.addSocket( this.app.name + '/' + name, callback )
  }

  removeSocket( name ){
    return this.app.server.removeSocket( this.app.name + '/' + name )
  }

  // --- Create Window --- //

  createWindow( options ){
    options = options || {}
    if( options.url === undefined )
      options.url = this.url
    return this.app.server.createWindow( options.url, options.options, options.close, options.callback )
  }

  // --- Documents --- //

  saveDocument( filePath, content ){
    return this.app.server.saveDocument( this.app.name + '/' + filePath, content )
  }

  loadDocument( filePath ){
    return this.app.server.loadDocument( this.app.name + '/' + filePath )
  }

  saveAppData( filePath, content ){
    return this.app.server.saveAppData( this.app.name + '/' + filePath, content )
  }

  loadAppData( filePath ){
    return this.app.server.loadAppData( this.app.name + '/' + this.chdir, filePath )
  }

}

module.exports.Controller = Controller
