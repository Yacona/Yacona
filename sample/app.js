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

setTimeout( () => {
  app.close()
  setTimeout( () => {
    console.log( 'launch' )
    app.launch()
  }, 2000 )
}, 3000 )
