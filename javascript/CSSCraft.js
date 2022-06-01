var Game = (function() {
	
	var TILE_SIZE = 100;
	
	var camera = {
		position : { cubeX: 0, cubeY: 0, cubeZ: 0, x: 21050, y: -11500, z: -21050 },
		angle : { x : 0, y: 0 }
	};
	
	var hasPointerLock = false;
	
	var containerElem;

	function init() {
		updateCameraCubePosition ();
		
		containerElem = $('#viewport')[0];
		
		$('#btn-pointer-lock').fadeOut(0);
		
		if ("onpointerlockchange" in document) 
			$(document).on('pointerlockchange', pointerLockChanged);
		else if ("onmozpointerlockchange" in document)
			$(document).on('mozpointerlockchange', pointerLockChanged);
		
		$('#btn-pointer-lock').click(function () {
			$('#position')[0].requestPointerLock();
		});
		
		$('#position')[0].requestPointerLock = $('#position')[0].requestPointerLock ||
					$('#position')[0].mozRequestPointerLock ||
					$('#position')[0].webkitRequestPointerLock;
		
		
		containerElem.requestFullscreen = containerElem.requestFullscreen 
			|| containerElem.webkitRequestFullscreen 
			|| containerElem.mozRequestFullScreen
			|| containerElem.msRequestFullscreen;
		
		document.exitFullscreen  = containerElem.exitFullscreen  
			|| document.webkitExitFullscreen 
			|| document.mozCancelFullScreen 
			|| document.msExitFullscreen;
		
		
		if ($('#position')[0].requestPointerLock)
			hasPointerLock = true;
	}
  
	function start() {		
		// Start the game loop
		loop();
	}
	
	function requestPointerLock() {
		if (hasPointerLock)
			$('#position')[0].requestPointerLock();	
	}
	
	function toggleFullscreen() {

		if (document.fullscreenElement ||
			document.webkitCurrentFullScreenElement  ||
			document.mozFullScreenElement ||
		    document.msFullscreenElement) 
		{
			document.exitFullscreen();
		}
		else
		{
			containerElem.requestFullscreen();
		}
	}
	
	function pointerLockChanged() {
		console.log('pointer lock changed');
		
		if (document.pointerLockElement == null) {
			$('#btn-pointer-lock').fadeIn(150);
		} else {
			$('#btn-pointer-lock').fadeOut(150);
		}
	}

  document.addEventListener('mousemove',function(event){


	   if (event.movementX || event.movementY)
	   {
			var multiplierX = 360 / window.innerWidth;
			var mouseX = event.movementX * multiplierX;

			var multiplierY = 180 / window.innerHeight;
			var mouseY = event.movementY * multiplierY;

		if (document.pointerLockElement == null && hasPointerLock)
			return;
		      
		console.log('mouse move');
		// find the changes in mousex/y positions and calculate the angles of the level.
		Game.LevelManager.rotation.y += mouseX;
		// ensure that angle x is within bounds before allowing changes.
		if ((Game.LevelManager.rotation.x < 90 && mouseY > 0) || (Game.LevelManager.rotation.x > -90  && mouseY < 0)) 
				Game.LevelManager.rotation.x+= mouseY;
	   }
	});

	// Calculates the block position of the camera based on its world world position
	function updateCameraCubePosition () {
		camera.position.cubeX = Math.floor(Math.abs(camera.position.x) / TILE_SIZE);
		camera.position.cubeY = Math.floor(Math.abs(camera.position.y) / TILE_SIZE);
		camera.position.cubeZ = Math.floor(Math.abs(camera.position.z) / TILE_SIZE);
	}

	var demoSpeed = { x:5, z:-5};
	
	var previousTime;
	
	var loop = function(timestamp){

		if (!previousTime)
			previousTime = timestamp;
		
		var delta = (timestamp - previousTime) / 1000;
		
		update(delta);	
		
		previousTime = timestamp;

		window.requestAnimationFrame(loop);
	}

	function update(delta) {
		
		updateCameraCubePosition();
		
		var destinationZCube = Math.floor(Math.abs(camera.position.cubeZ+5));
		var destinationXCube = Math.floor(Math.abs(camera.position.cubeX+5));
		var collisionZ = Game.LevelManager.getBlock(camera.position.cubeX,camera.position.cubeY+3,destinationZCube) > 0;
		var collisionX = Game.LevelManager.getBlock(destinationXCube,camera.position.cubeY+3,camera.position.cubeZ) > 0;

		var previousY = camera.position.y;

		if (collisionZ || collisionX) {
			camera.position.y = Math.lerp(camera.position.y, -(camera.position.cubeY-1)*Game.TILE_SIZE, 0.02);
		} else {
			camera.position.y = Math.lerp(camera.position.y, -(camera.position.cubeY+2)*Game.TILE_SIZE, 0.02);
		}

		var anglularChange = noise.perlin2(camera.position.x*0.0008,camera.position.y*0.0008);

		camera.position.x += demoSpeed.x + anglularChange;
		camera.position.z += demoSpeed.z - anglularChange;	
		
		if (document.pointerLockElement == null)
			Game.LevelManager.rotation = { x : 30, y: 135 +  anglularChange * 50};
		
		camera.angle.y = 180 - Game.LevelManager.rotation.y;
		camera.angle.x = Game.LevelManager.rotation.x *-1;
		
		Game.LevelManager.updateLevel();	
	}
	
	return {
		TILE_SIZE : TILE_SIZE,
		init : init,
		start : start,
		camera : camera,
		toggleFullscreen : toggleFullscreen,
		requestPointerLock : requestPointerLock
	}

})();