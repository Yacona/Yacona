const Yacona = require( '../yacona' ).Yacona

const server1 = new Yacona( {
  port: 8000,
  prefix: 'server1',
  chdir: __dirname
} )

const app1 = server1.attachApp( './app' )

app1.launch()

const server2 = new Yacona( {
  port  : 3000,
  prefix: 'server2',
  chdir : __dirname
} )

const app2 = server2.attachApp( './app2' )

app2.launch()

server1.connect( server2 )

console.log( 'server1', server1.c() )
console.log( 'server2', server2.c() )

server1.disconnect( server2 )

console.log( 'server1 disconnected', server1.c() )
console.log( 'server2 disconnected', server2.c() )
