const Yacona = require( '../yacona' ).Yacona

const server1 = new Yacona( {
  port: 8000,
  prefix: 'server1',
  chdir: __dirname
} )

server1.addApp( 'http://izetta.me/app.zip' ).then( () => {
  const app = server1.runApp( 'app' )
} )

/*
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

server1.on( 'reply', ( target, data ) => {
  console.log( 'reply', data )
} )

server2.on( 'message', ( target, data ) => {
  server2.broadcast( 'reply', {
    message: 'Hello ' + data.name + ' !'
  } )
} )

server1.emit( 'server2', 'message', {
  name: 'Calmery',
  message: 'Hello !'
} )
*/
