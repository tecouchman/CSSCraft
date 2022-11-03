// Method to generate the terrain of a level
function generateChunk(chunkX, chunkY, chunkZ, chunkDimensions) {

	// Create an array to hold the chunk
	let data = [];

	for (let x = 0; x < chunkDimensions.width; x++) {
		data[x] = [];

		for (let y = 0; y < chunkDimensions.height; y++) {
			data[x][y] = [];

			for (let z = 0; z < chunkDimensions.depth; z++) {

				let worldX = x + chunkX * chunkDimensions.width;
				let worldY = y + chunkY * chunkDimensions.height;
				let worldZ = z + chunkZ * chunkDimensions.depth;

				data[x][y][z] = 0;

				let cave = Math.round(
					noise.perlin3(
						0.3 + worldX * 0.04,
						0.3 + worldY * 0.08,
						0.3 + (worldZ) * 0.03)
				)
					;

				if (cave == 1) {
					data[x][y][z] = 0;
					continue;
				}

				let gravel = (noise.perlin2(
					worldX * 0.05,
					worldZ * 0.05,
				) * 25) + 3

				if (worldY > gravel) {
					data[x][y][z] = 3;
				}
				else {
					let grass = (noise.perlin2(
						worldX * 0.038 + 100,
						worldZ * 0.038
					) * 7) + (noise.perlin2(
						worldX * 0.01 + 100,
						worldZ * 0.01
					) * 5);

					if (worldY > grass) {
						data[x][y][z] = 1;
					} else {
						let stone = (noise.perlin2(
							worldX * 0.038,
							worldZ * 0.038
						) * 25) + (noise.perlin2(
							worldX * 0.01,
							worldZ * 0.01
						) * 15);

						if (worldY > stone) {
							data[x][y][z] = 4;
						}
					}
				}
			}
		}
	}

	let chunk = {
		x: chunkX,
		y: chunkY,
		z: chunkZ,
		data: data
	};

	return chunk;
}

export default generateChunk

