const Yacona = require( '../yacona' ).Yacona

const yacona = new Yacona( {
  port: 3000,
  prefix: 'sample',
  chdir : __dirname
} )

console.log( Yacona.loadModule( 'utility' ) )

const app  = yacona.attachApp( './app' )
const app2 = yacona.attachApp( './app2' )

app.launch()
app2.launch()

app.addListener( 'Hello', ( m1, m2 ) => {
  return 'Hello ,' + m1 + m2
} )

console.log( 'app', app2.callListener( 'app/Hello', 'a', 'b' ) )

console.log( yacona.getApps() )

setTimeout( function(){
  yacona.detachApp( app )
  setTimeout( () => {
    console.log( yacona.getApps() )
  } )
}, 3000 )
