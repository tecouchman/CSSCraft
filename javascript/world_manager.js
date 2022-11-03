import generateChunk from "./terrain_generator.js";
import renderChunk from "./renderer.js";

let _camera, _tileSize, _rotation, _scene, level;

function init(camera, tileSize, scene, rotation) {
	_camera = camera;
	_tileSize = tileSize;
	_scene = scene;
	_rotation = rotation;
	level = new Level(_scene, _tileSize, chunkDimensions);
}

let generateDistance = { x: 3, y: 2, z: 3 };
let spawnOffset = Math.floor(generateDistance.x * 3.5);
let lastRender = 0.1;

noise.seed(24601);

const buildDelay = 0.1;

let chunkDimensions = {
	height: 5,
	width: 3,
	depth: 3
};

function getRenderDistance() {
	return generateDistance.x;
}

function setRenderDistance(distance) {
	generateDistance.x = generateDistance.z = distance;
	spawnOffset = Math.floor(distance * 3.5);
}

/* Object that holds the level data */
function Level(scene, tileSize, chunkDimensions) {
	this.scene = scene;
	this.tileSize = tileSize;
	this.chunkDimensions = chunkDimensions;
	this.data = {};
	this.getChunk = function (x, y, z) {
		return level.data[this.generateKey(x, y, z)];
	}
	this.generateKey = function (x, y, z) {
		return x + '_' + y + '_' + z;
	}
	this.worldToLocalPosition = function (worldX, worldY, worldZ) {
		let chunkPos = {
			x: ((worldX % this.chunkDimensions.width) +
				this.chunkDimensions.width) % this.chunkDimensions.width,
			y: ((worldY % chunkDimensions.height) +
				this.chunkDimensions.height) % this.chunkDimensions.height,
			z: ((worldZ % chunkDimensions.depth) +
				this.chunkDimensions.depth) % this.chunkDimensions.depth
		}

		return chunkPos;
	}
	this.worldCubeToChunkPosition = function (worldX, worldY, worldZ) {
		let chunkPos = {
			x: Math.floor(worldX / this.chunkDimensions.width),
			y: Math.floor(worldY / this.chunkDimensions.height),
			z: Math.floor(worldZ / this.chunkDimensions.depth)
		}

		return chunkPos;
	}
	this.chunkToWorldPosition = function (chunkX, chunkY, chunkZ) {
		let worldPos = {
			x: chunkX * this.chunkDimensions.width,
			y: chunkY * this.chunkDimensions.height,
			z: chunkZ * this.chunkDimensions.depth
		}

		return worldPos;
	}
	this.getChunkBlock = function (chunk, x, y, z) {

		if (!chunk || !chunk.data)
			return 0;

		if (x < 0 || y < 0 || z < 0 || x >= this.chunkDimensions.width || y >= this.chunkDimensions.height || z >= this.chunkDimensions.depth) {
			return this.getBlock(chunk.x * this.chunkDimensions.width + x, chunk.y * this.chunkDimensions.height + y, chunk.z * this.chunkDimensions.depth + z);
		}
		return chunk.data[x][y][z] || 0;
	}
	this.getBlock = function (worldX, worldY, worldZ) {

		let chunkPos = this.worldCubeToChunkPosition(worldX, worldY, worldZ);
		let chunk = this.getChunk(chunkPos.x, chunkPos.y, chunkPos.z);

		if (!chunk || !chunk.data)
			return 0;

		let pos = this.worldToLocalPosition(worldX, worldY, worldZ);

		return chunk.data[pos.x][pos.y][pos.z];
	}
};


/* Builds the divs to display the level in 3D */
function render() {
	let chunkPos = level.worldCubeToChunkPosition(_camera.spawnCubePosition.x, _camera.spawnCubePosition.y, _camera.spawnCubePosition.z);
	let chunk = null;
	for (let x = chunkPos.x - generateDistance.x; x <= chunkPos.x + generateDistance.x; x++) {
		for (let y = chunkPos.y - generateDistance.y; y <= chunkPos.y + generateDistance.y; y++) {
			for (let z = chunkPos.z - generateDistance.z; z <= chunkPos.z + generateDistance.z; z++) {
				chunk = level.getChunk(x, y, z);
				if (!chunk.mesh) {
					renderChunk(level, chunk);
				}
			}
		}
	}
}

function updateLevel(delta) {
	// map positions on x axis are inverted, i.e. moving forward into map results in negative position
	// so to calculate map x coord need to negate the player position. Also offset by the size of a tile
	// to ensure the user feels like the are directly on the tile.
	let xPos = 0 - (_camera.worldPosition.x - (_tileSize / 2));
	let zPos = _camera.worldPosition.z + (_tileSize / 2);

	_scene.style.transform = 'translate3d(' + xPos + 'px, ' + _camera.worldPosition.y + 'px, ' + zPos + 'px)';

	// Set the world _rotation
	_rotation.style.transform = 'translate3d(0, 0, 500px) rotateX(-' + (_camera.rotation.x + 360) + 'deg) rotateY(' + _camera.rotation.y + 'deg) rotateZ(0deg)';

	let playerPos = _camera.spawnCubePosition;

	if (!isNaN(delta))
		lastRender += delta;

	if (lastRender > buildDelay) {

		let currChunk = level.worldCubeToChunkPosition(_camera.spawnCubePosition.x, _camera.spawnCubePosition.y, _camera.spawnCubePosition.z);

		for (let chunk of Object.values(level.data)) {
			
			if (chunk.x < currChunk.x - generateDistance.x - 2 ||
				chunk.y < currChunk.y - generateDistance.y - 2 ||
				chunk.z < currChunk.z - generateDistance.z - 2 ||
				chunk.x > currChunk.x + generateDistance.x + 2 ||
				chunk.y > currChunk.y + generateDistance.y + 2 ||
				chunk.z > currChunk.z + generateDistance.z + 2) {

				chunk.mesh?.remove();
				let key = level.generateKey(chunk.x, chunk.y, chunk.z);
				delete level.data[key];
			}
		}

		for (let chunkX = currChunk.x - generateDistance.x - 1; chunkX <= currChunk.x + generateDistance.x + 1; chunkX++) {
			for (let chunkY = currChunk.y - generateDistance.y - 1; chunkY <= currChunk.y + generateDistance.y + 1; chunkY++) {
				for (let chunkZ = currChunk.z - generateDistance.z - 1; chunkZ <= currChunk.z + generateDistance.z + 1; chunkZ++) {
					let key = level.generateKey(chunkX, chunkY, chunkZ);
					if (!(key in level.data)) {
						let chunk = generateChunk(chunkX, chunkY, chunkZ, chunkDimensions);
						level.data[key] = chunk;
					}
				}
			}
		}

		render();
		lastRender = 0;
	}
}


export { init, spawnOffset, updateLevel, level, generateDistance, getRenderDistance, setRenderDistance };
