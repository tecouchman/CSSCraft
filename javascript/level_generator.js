Game.LevelGenerator = (function() {
    
	// Method to generate the terrain of a level
	function generateChunk(xChunkOffet, yChunkOffset, zChunkOffset) {

		xOffset = xChunkOffet * Game.LevelManager.chunkDimensions.width;
		yOffset = yChunkOffset * Game.LevelManager.chunkDimensions.height;
		zOffset = zChunkOffset * Game.LevelManager.chunkDimensions.depth;

		// Create an array to hold the chunk
		var data = [];

		for (var x = 0; x < Game.LevelManager.chunkDimensions.width; x++) {
			data[x] = [];

			for (var y = 0; y < Game.LevelManager.chunkDimensions.height; y++) {
				data[x][y] = [];

				for (var z = 0; z < Game.LevelManager.chunkDimensions.depth; z++) {

					var worldX = x+Math.abs(xOffset);
					var worldY = y+Math.abs(yOffset);
					var worldZ = z+Math.abs(zOffset);

					var cave = Math.round(Math.abs(
								noise.perlin3(
									0.3+worldX*0.04,
									0.3+worldY*0.08,
									0.3+(z+zOffset)*0.04)
								)
							);

					if (cave == 1) {
						data[x][y][z] = 0;
						continue;
					}


					var gravel = 118 - (Math.abs(noise.perlin2(
						worldX*0.05,
						worldZ*0.05
					)) * 15) + (Math.abs(noise.perlin2(
						worldX*0.01,
						worldZ*0.01
					))*10);

					if (worldY > gravel) {
						data[x][y][z] = 3;
					}
					else 
					{
						var grass = 115 - (Math.abs(noise.perlin2(
							worldX*0.038+100,
							worldZ*0.038
						)) * 16) + (Math.abs(noise.perlin2(
							worldX*0.01+100,
							worldZ*0.01
						))*10);

						if (worldY >  grass) {
							data[x][y][z] = 1;
						} else {
							var stone = 126 - (Math.abs(noise.perlin2(
							worldX*0.05+200,
							worldZ*0.05
						)) * 25) + (Math.abs(noise.perlin2(
							worldX*0.01+80,
							worldZ*0.01
						))*10);

							if (worldY > stone) {
								data[x][y][z] = 4;
							}
						}
					}
				}
			}
		}

		var chunk = {
			x: xChunkOffet,
			y: yChunkOffset,
			z: zChunkOffset,
			data: data
		};

		return chunk;
	}
	
	return {
		generateChunk : generateChunk
	}
})();

