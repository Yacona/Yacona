const Yacona = require( '../yacona' ).Yacona

const yacona = new Yacona( {
  port: 3000,
  prefix: 'sample'
} )

console.log( Yacona.loadModule( 'utility' ) )

const app  = yacona.attachApp( './app' )
const app2 = yacona.attachApp( './app2' )

app.launch()
app2.launch()

console.log( yacona.getApps() )

setTimeout( function(){
  yacona.detachApp( app )
  setTimeout( () => {
    console.log( yacona.getApps() )
  } )
}, 3000 )
