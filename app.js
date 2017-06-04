const yaml    = require( './yaml' )
const utility = require( './utility' )
const Controller = require( './controller' )

const generateAppId = () => Math.random().toString( 36 ).slice( -8 )

class App {

	constructor( directory ){
		if( directory === undefined )
			directory = './'

		this.directory = directory
		this.id = generateAppId()

		let packageJson = utility.getAbsolutePath( directory, 'yacona-package.json' )
		this.package = utility.isExist( packageJson )
			? JSON.parse( utility.read( packageJson ) )
			: {}

		this.name = this.package.name !== undefined ? this.package.name : ''
		this.controller = new Controller( this.name )
		this.app = null
		this.isRunning = false

		if( this.package.main === undefined )
			this.package.main = 'app'
	}

	launch(){
		if( this.isRunning )
			return false
		this.isRunning = true
		this.app = require( utility.getAbsolutePath( this.directory, this.package.main ) )
		if( this.app !== null && this.app.launch )
			this.app.launch( this.controller )
		return true
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

module.exports = App
