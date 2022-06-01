
Game.init();
Game.start();

$('#start').click(function() {
	Game.requestPointerLock();
	
	$('#start-screen').fadeOut(800, function() {
		$('#viewport').removeClass('blur');
	});
})

$('#btn-options-fullscreen').click(function() {
	Game.toggleFullscreen();
});