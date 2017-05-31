const yaml    = require( './yaml' )
const utility = require( './utility' )

class App {

	constructor( directory ){
		this.directory = directory
		this.package   = utility.getAbsolutePath( directory, 'yacona-package.json' )
	}

}

module.exports = App
