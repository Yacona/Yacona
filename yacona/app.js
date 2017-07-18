// --- Debug --- //

const debug = console.log

// --- Modules --- //

const path = require( 'path' )
const fs   = require( 'fs' )

const Controller = require( './controller' ).Controller

// --- Support Functions --- //

const absPath = path.resolve

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

const generateAppId = () => Math.random().toString( 36 ).slice( -8 )

// --- App class --- //

class App {

  constructor( server, directory ){
    this.server     = server 

		this.directory  = directory
		this.id         = generateAppId()

		let src = absPath( directory, 'package.json' )
		this.package    = isExist( src )
			? JSON.parse( read( src ) )
			: {}

		this.name       = this.package.name || directory.split( '/' ).pop()

		this.app        = null
		this.isRunning  = false

    this.controller = null

		if( this.package.main === undefined )
			this.package.main = 'app'
  }

  getName(){
    return this.name
  }

  launch(){
    if( this.isRunning )
			return false

		this.isRunning  = true
		this.app        = require( absPath( this.directory, this.package.main ) )
    this.controller = new Controller( this )

		if( this.app !== null && this.app.launch )
			this.app.launch( this.controller )

		return this.controller
  }

  close(){
		if( this.isRunning ){
			if( this.app !== null && this.app.close )
				this.app.close()
			this.isRunning = false
			return true
		}
		return false
	}

}

module.exports.App = App
