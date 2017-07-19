module.exports.launch = controller => {
  controller.addStaticRoute( './public' )

  controller.addSocket( 'message', ( socket, value ) => {
    console.log( 'Message : ' + value.value )
    socket.emit( 'message', { message: 'reply' } )
  } )

  controller.createWindow().then( window => {
    window.openDevTools()
  } )
}
