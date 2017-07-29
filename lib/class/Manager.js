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
const extract  = file.unzip

const remote_install = ( from, to, tmp ) => {
  let tmpFile, putDir
  return download( from, tmp ).then( p => {
    tmpFile = p

    putDir = utility.absPath( to, p.split( '/' ).pop().split( '.' )[0] )

    if( utility.exists( putDir ) === true )
      file.rmdir( putDir )

    return extract( p, putDir )
  } ).then( proc => proc ).then( () => {
    fs.unlinkSync( tmpFile )
    return Promise.resolve( putDir )
  } )
}

const local_install = ( from, to ) => {
  let dir = from.split( /\/|\\/ )
  let target = dir[dir.length-1]

  let putDir = utility.absPath( to, target.split( '.' )[0] )

  if( utility.exists( putDir ) === true )
    file.rmdir( putDir )

  return extract( from, putDir ).then( () => Promise.resolve( putDir ) )
}

// --- Manager Class --- //

class Manager {

  constructor( options ){
    const prefix = options.prefix || './'

    const electron = ( process.title.split( /\\|\// ).pop().toLowerCase() === 'electron' || ( ( require( 'os' ).platform() === 'win32' && process.title.indexOf( 'electron' ) !== -1 ) ) )
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
    return new Promise( ( resolve, reject ) => {
      if( url === undefined )
        reject( { statusText: 'Path must be a string. Received undefined' } )

      if( url.match( /https?\:\/\// ) !== null ){
        debug( 'Add app from remote (' + url + ')' )
        return remote_install( url, store.get( this ).directory, os.tmpdir() ).catch( reject ).then( p => {
          debug( 'Added app (' + p + ')' )
          resolve( p )
        } )
      } else {
        // Please absolute path !
        if( utility.absPath( url ) === url ){
          if( utility.exists( url ) === false )
            reject( { statusText: 'File not found' } )
          debug( 'Add app from local (' + url + ')' )
          return local_install( url, store.get( this ).directory ).catch( reject ).then( p => {
            debug( 'Added app (' + p + ')' )
            resolve( p )
          } )
        } else
          reject( { statusText: 'Absolute path requirement' } )
      }
    } )
  }

  remove( name ){
    const path = this.getPath( name )
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
