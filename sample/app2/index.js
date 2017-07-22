module.exports.launch = controller => {
  controller.addStaticRoute( './public' )

  controller.addWebSocket( ( socket ) => {
    socket.on( 'message', value => {
      console.log( value )
      socket.disconnect()
    } )
  } )

  controller.createWindow().then( window => {
    window.openDevTools()
  } )

  // console.log( 'app', controller.callListener( 'app/Hello', 'a', 'b' ) )
}
