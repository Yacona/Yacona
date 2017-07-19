const yacona = require( '../yacona/yacona' )

const server = new yacona.Yacona( {
  port: 3000,
  prefix: 'sample'
} )

const app = server.attachApp( './app' )
app.launch()
