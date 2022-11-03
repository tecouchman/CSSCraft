/* The textures for the various blocks types */
let blockTypes = [
	{},
	{ texture: 'grass', },
	{ texture: 'dirt' },
	{ texture: 'gravel' },
	{ texture: 'stone' }
];

function renderChunk(level, chunk) {

	let worldPos = level.chunkToWorldPosition(chunk.x, chunk.y, chunk.z);
	let blocks = [];

	let currBlock;
	for (let x = 0; x < level.chunkDimensions.width; x++) {
		for (let y = 0; y < level.chunkDimensions.height; y++) {
			for (let z = 0; z < level.chunkDimensions.depth; z++) {
				currBlock = createBlock(level, chunk, x, y, z);
				if (currBlock)
					blocks.push(currBlock);
			}
		}
	}

	let mesh = document.createElement('div');
	chunk.mesh = mesh;

	if (blocks)
		mesh.append(...blocks);

	mesh.classList.add('chunk', 'move-in');
	mesh.style.transform = 'translate3d(' + (worldPos.x * level.tileSize) + 'px,' + (worldPos.y * level.tileSize) + 'px,' + (worldPos.z * level.tileSize) + 'px)';

	level.scene.append(mesh);
}

function createBlock(level, chunk, x, y, z) {

	let blockId = level.getChunkBlock(chunk, x, y, z);

	if (blockId <= 0)
		return;

	let neighbours = [
		level.getChunkBlock(chunk, x, y - 1, z) == 0, // top
		level.getChunkBlock(chunk, x, y + 1, z) == 0, // bottom
		level.getChunkBlock(chunk, x - 1, y, z) == 0, // right
		level.getChunkBlock(chunk, x + 1, y, z) == 0, // left
		level.getChunkBlock(chunk, x, y, z - 1) == 0, // back
		level.getChunkBlock(chunk, x, y, z + 1) == 0  // front
	]

	let faceClasses = ['tp', 'bm', 'rt', 'lt', 'bk', 'ft'];

	let block;
	let texture;

	texture = blockTypes[blockId].texture;

	if (neighbours.some(neighbour => neighbour)) {
		block = document.createElement('div');
		block.classList.add('block', texture);
		block.style.transform = 'translate3d(' + Math.floor(x * level.tileSize) + 'px,' + Math.floor(y * level.tileSize) + 'px,' + Math.floor(z * level.tileSize) + 'px)';

		block.id = 'cube' + level.generateKey((chunk.x * level.chunkDimensions.width + x), (chunk.y * level.chunkDimensions.height + y), (chunk.z * level.chunkDimensions.depth + z));
	} else {
		return;
	}

	for (let i = 0; i < neighbours.length; i++) {
		if (neighbours[i])
			block.appendChild(makeFace(faceClasses[i]));
	}

	return block;
}

function makeFace(className) {
	let face = document.createElement('div');
	face.classList.add('face', className);
	return face;
}

export default renderChunk;