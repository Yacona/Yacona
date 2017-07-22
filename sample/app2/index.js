module.exports.launch = controller => {
  controller.addStaticRoute( './public' )

  controller.getSocketIO( ( socket ) => {
    socket.on( 'message', value => {
      console.log( value )
      socket.disconnect()
    } )
  } )

  controller.createWindow().then( window => {
    window.openDevTools()
  } )

  setTimeout( function(){
    controller.getA()
  }, 3000 )

  // console.log( 'app', controller.callListener( 'app/Hello', 'a', 'b' ) )
}
