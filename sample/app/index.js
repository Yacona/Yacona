module.exports.launch = controller => {
  controller.addStaticRoute( './public' )

  controller.createWindow().then( window => {
    window.openDevTools()
  } )
  controller.createWindow().then( window => {
    window.openDevTools()
  } )
  controller.createWindow().then( window => {
    window.openDevTools()
  } )

  controller.addListener( 'Hello', ( m1, m2 ) => {
    return 'Hello ,' + m1 + m2
  } )
}
