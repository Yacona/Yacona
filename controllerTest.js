let App = require( './app' );
let app = new App(); 

app.launch()

app.controller.document.save( 'x/y/z', 'text' )
