const moduleLoader = require( '../support/moduleLoader' )

// --- Modules --- //

const fs = require( 'fs' )
const os = require( 'os' )

const utility = moduleLoader( 'utility' )
const file    = moduleLoader( 'file' )
const network = moduleLoader( 'network' )

const debug = message => {
  return utility.debug( 'yellow', 'manager', message )
}

// --- Store : Declare private member and method --- //

const store = new WeakMap()

// --- Functions --- //

const download = network.download
const unzip    = file.unzip

const remote = ( from, to ) => {
  const tmp = os.tmpdir()
  return download( from, tmp ).then( filePath => {
    to = utility.absPath( to, filePath.split( /\/|\\/ ).pop().split( '.' )[0] )
    return unzip( filePath, to )
  } )
}

const local = ( from, to ) => {
  to = utility.absPath( to, from.split( /\/|\\/ ).pop().split( '.' )[0] )
  return unzip( from, to )
}

// --- Manager Class --- //

class Manager {

  constructor( options ){
    const prefix = options.prefix || './'

    const electron = ( process.argv0 !== 'node' )
                       ? require( 'electron' )
                       : null

    const directory = utility.absPath(
      ( ( electron !== null )
        ? electron.app.getPath( 'documents' )
        : utility.absPath( options.directory, 'documents' ) )
      , options.prefix, 'applications' )

    if( utility.exists( directory ) === false )
      file.mkdir( directory )

    let applications = []

    fs.readdirSync( directory ).forEach( path => {
      let appPath = utility.absPath( directory, path )
      if( fs.statSync( appPath ).isDirectory() && utility.exists( utility.absPath( appPath, 'package.json' ) ) ){
        applications.push( path )
      }
    } )

    store.set( this, {
      electron    : electron,
      prefix      : prefix,
      directory   : directory,
      applications: applications
    } )
  }

  getAllApps(){
    let applications = []
    let directory = store.get( this ).directory

    fs.readdirSync( directory ).forEach( path => {
      let appPath = utility.absPath( directory, path )
      if( fs.statSync( appPath ).isDirectory() && utility.exists( utility.absPath( appPath, 'package.json' ) ) )
        applications.push( path )
    } )

    let s = store.get( this )
    s.applications = applications

    store.set( this, s )

    return applications
  }

  getAppPath( name ){
    if( name === undefined )
      return null

    const applications = this.getAllApps()
    if( applications.indexOf( name ) !== -1 )
      return utility.absPath( store.get( this ).directory, name )
    return null
  }

  add( url ){
    return new Promise( ( resolve, reject ) => {
      if( url === undefined ){
        debug( 'Error : Path must be a string. Received undefined' )
        reject( new Error( 'Path must be a string. Received undefined' ) )
      }

      const directory = store.get( this ).directory

      if( url.match( /https?\:\/\// ) !== null ){
        remote( url, directory ).then( appPath => {
          debug( 'Added app on ' + appPath )
          resolve( appPath )
        } ).catch( reject )
      } else {
        if( utility.isAbsPath( url ) === true ){
          local( url, directory ).then( appPath => {
            debug( 'Added app on ' + appPath )
            resolve( appPath )
          } ).catch( reject )
        } else {
          debug( 'Error : Path must be absolute' )
          reject( new Error( 'Path must be absolute' ) )
        }
      }
    } )
  }

  remove( name ){
    if( name === undefined )
      return false

    const path = this.getAppPath( name )
    if( path !== null ){
      file.rmdir( path )
      debug( 'Remove app ' + name + ' (' + path + ')' )
      return true
    } else {
      return false
    }
  }

}

module.exports.Manager = Manager
