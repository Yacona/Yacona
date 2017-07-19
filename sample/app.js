const Yacona = require( '../yacona' ).Yacona

const yacona = new Yacona( {
  port: 3000,
  prefix: 'sample'
} )

console.log( Yacona.loadModule( 'utility' ) )

const app = yacona.attachApp( './app' )
app.launch()
