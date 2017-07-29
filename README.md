# Yacona

Yet another controller/conductor of Node.js application.

```bash
$ npm install yacona
```

## Example

```
.
├── sample
│   ├── app.js
│   └── public
│       └── index.html
├── server.js
├── node_module
└── package.json
```
server.js
```javascript
const Yacona = require( 'yacona' ).Yacona

const server = new Yacona( {
  prefix: 'sample',
  port  : 3000,
  chdir : __dirname
} )

const sample = server.attachApp( './sample' )

sample.launch()
```
package.json
```json
{
  "main": "server",
  "dependencies": {
    "yacona": "^17.7.30"
  }
}
```
sample/app.js
```javascript
// localhost:3000/sample/

module.exports.launch = controller => {
  controller.addStaticRoute( './public' )

  controller.addWebSocket( socket => {
    socket.on( 'message', message => {
      console.log( socket.id, message )
      socket.emit( 'message', 'Hello !' )
    } )
  } )

  controller.createWindow( {
    width : 800,
    height: 600
  } ).then( window => {
    window.openDevTools()
  } )
}

```
sample/package.json
```json
{
  "name": "sample",
  "main": "app"
}
```
sample/public/index.html
```html
<script src="/modules/websocket"></script>
<script>
  socket.emit( 'message', 'Hello World !' )
  socket.on( 'message', console.log )
</script>

```
