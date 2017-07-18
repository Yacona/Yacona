module.exports.launch = controller => {
  controller.addRoute( './public' )
  // controller.removeRoute()
  console.log( controller.url )

  controller.addSocket( 'message', ( socket, value ) => {
    console.log( value )
    socket.emit( 'message', 'Return message' )
  } )

  controller.createWindow()

  console.log( controller.saveDocument( './message', 'Hello World' ) )
}
