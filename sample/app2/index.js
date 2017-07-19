module.exports.launch = controller => {
  controller.addStaticRoute( './public' )

  controller.addSocket( 'message', ( socket, value ) => {
    console.log( 'Message : ' + value.value )
    socket.emit( 'message', { message: 'reply123123' } )
  } )

  controller.createWindow().then( window => {
    window.openDevTools()
  } )

  controller.createWindow().then( window => {
    console.log( 'Windows get' )
    controller.destroyWindow( window )
  } )
}
