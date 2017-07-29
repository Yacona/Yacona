const moduleLoader = require( '../support/moduleLoader' )

// --- Modules --- //

const fs = require( 'fs' )
const os = require( 'os' )

const utility = moduleLoader( 'utility' )
const file    = moduleLoader( 'file' )
const network = moduleLoader( 'network' )

// --- Store : Declare private member and method --- //

const store = new WeakMap()

// --- Functions --- //

const download = network.download
const extract  = file.unzip

const remote_install = ( from, to, tmp ) => {
  let tmpFile
  return download( from, tmp ).then( p => {
    tmpFile = p
    return extract( p, utility.absPath( to, p.split( '/' ).pop().split( '.' )[0] ) )
  } ).then( proc => proc ).then( () => {
    fs.unlinkSync( tmpFile )
  } )
}

const local_install = ( from, to ) => {
  let dir = from.split( /\/|\\/ )
  let target = dir[dir.length-1]
  return extract( from, utility.absPath( to, target.split( '.' )[0] ) )
}

// --- Manager Class --- //

class Manager {

  constructor( options ){
    const prefix = options.prefix || './'

    const electron = ( process.title.split( /\\|\// ).pop().toLowerCase() === 'electron' || ( ( require( 'os' ).platform() === 'win32' && process.title.indexOf( 'electron' ) !== -1 ) ) )
                       ? require( 'electron' )
                       : null

    console.log( options )

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
      if( fs.statSync( appPath ).isDirectory() && utility.exists( utility.absPath( appPath, 'package.json' ) ) ){
        applications.push( path )
      }
    } )

    let s = store.get( this )
    s.applications = applications

    store.set( this, s )

    return applications
  }

  getPath( name ){
    const applications = this.getAllApps()
    if( applications.indexOf( name ) !== -1 )
      return utility.absPath( store.get( this ).directory, name )
    return null
  }

  add( url ){
    if( url === undefined )
      return false

    if( url.match( /https?\:\/\// ) !== null ){
      return remote_install( url, store.get( this ).directory, os.tmpdir() )
    } else {
      // Please absolute path !
      if( utility.absPath( url ) === url )
        return local_install( url, store.get( this ).directory )
      else
        return false
    }
  }

  remove( name ){
    const path = this.getPath( name )
    if( path !== null ){
      file.rmdir( path )
      return true
    } else {
      return false
    }
  }

}

module.exports.Manager = Manager
