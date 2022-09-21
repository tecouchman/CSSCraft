
Game.init();
Game.start();

document.getElementById('start').onclick = function() {
	Game.requestPointerLock();
	Game.play();
	
	document.getElementById('start-screen').classList.add('fade-out');
	document.getElementById('viewport').classList.remove('blur');
};

document.getElementById('btn-options-fullscreen').onclick = function() {
	Game.toggleFullscreen();
};