const yacona = require( '../yacona/yacona' )

const server = new yacona.Server( {
  port: 3000,
  prefix: 'sample'
} )

const app = server.attachApp( './app' )
app.launch()
