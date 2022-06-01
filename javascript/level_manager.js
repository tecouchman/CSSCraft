/* builds the divs to represent the level */
Game.LevelManager = (function() {

	var renderDistance;
	setRenderDistance(15);
	
	var $rotation = $('#rotation'),
		$position = $('#position'),
		$water = $('#water'),
		$renderDistance = $('#render-distance input');
	
	noise.seed(24601);
	
	var prevXRange, prevYRange, prevZRange;
	
	var mesh = $('.level');
	
	function delayedAppend(block) {		
		setTimeout(function() {
			mesh.append(block);
		}, 5);
	}
	
	$renderDistance.val(renderDistance);
	
	$renderDistance.change(function() {
		setRenderDistance($renderDistance.val());
	});
	
	function setRenderDistance(distance) {
		renderDistance = distance;
		$('#render-distance label').text(renderDistance);
	}
	
	return {
		/* Array that holds the level data */
		level : [],
		rotation : { 
			y : 0, 
			x : 0
		},

		/* The collections of divs that are used to display the level */
		// Creates a top level element to hold the rest of the chunk */
		mesh : mesh,
		meshes: {},
		chunkDimensions : {
			height : 15,
			width : 15,
			depth : 15
		},
		/* The textures for the various blocks types */
		blockTypes : [
			{ texture : '' },
			{ texture : 'grass' },
			{ texture : 'dirt' },
			{ texture : 'gravel' },
			{ texture : 'stone' }
		],
		renderChunk : function(chunkPos) {
			// var chunkPos = this.worldToChunkPosition(worldX, worldY, worldZ);
			
			var chunk = this.getChunk(chunkPos.x,chunkPos.y,chunkPos.z);

			var blocks = [];
			for (var x = 0; x <= this.chunkDimensions.x; x++) {
				for (var y = 0; y <= this.chunkDimensions.y; y++) {
					for (var z =0; z <= this.chunkDimensions.z; z++) {

						var block = this.createBlock(x,y,z, true);
						if (block) {
							blocks.push(block);	
						}
					}
				}
			}
			
			// if (blocks.length > 100) {
			// 	for (var b of blocks) {
			// 		delayedAppend(b);
			// 	}
			// } else {
					
			// }
			let mesh = document.createElement('div');
			mesh.append(blocks);
			this.meshes[x+'-'+y+'-'+z] = mesh;

			this.mesh.append(mesh);
		},

		/* Builds the divs to display the level in 3D */
		render : function(){
			
			if (this.level.length == 0)
				return;
			
			var halfRenderDistance = Math.floor(renderDistance/2);
			
			var pointHorizontal = Math.pointOnCircle(halfRenderDistance * Game.TILE_SIZE, this.rotation.y);
			var midRenderX = Math.floor(Math.abs(Game.camera.position.x + pointHorizontal.x) / Game.TILE_SIZE);
			var midRenderZ = Math.floor(Math.abs(Game.camera.position.z + pointHorizontal.z) / Game.TILE_SIZE);
			
			var pointVertical = Math.pointOnCircle(halfRenderDistance * Game.TILE_SIZE, -(this.rotation.x +60));
			var midRenderY = Math.floor(Math.abs(Game.camera.position.y + pointVertical.z) / Game.TILE_SIZE);
			
			var xRange = {
				start: midRenderX - halfRenderDistance,
				end : midRenderX + halfRenderDistance
			};
			var yRange = {
				start: midRenderY - halfRenderDistance,
				end: midRenderY + halfRenderDistance
			};
			var zRange = {
				start: midRenderZ - halfRenderDistance,
				end: midRenderZ + halfRenderDistance
			};
	
			var blocks = [];
			
			for (var x = xRange.start; x <= xRange.end; x++) {
				for (var y = yRange.start; y <= yRange.end; y++) {
					for (var z = zRange.start; z <= zRange.end; z++) {
						if (!prevXRange ||
							x < prevXRange.start || x > prevXRange.end ||
						 	y < prevYRange.start || y > prevYRange.end ||
							z < prevZRange.start || z > prevZRange.end) {
						
							var block = this.createBlock(x,y,z, true);
							if (block) {
								blocks.push(block);	
							}
						}
					}
				}
			}
			
			if (blocks.length > 100) {
				for (var b of blocks) {
					delayedAppend(b);
				}
			} else {
				this.mesh.append(blocks);	
			}
			
			if (prevXRange) {
				for (var i = prevXRange.start; i < xRange.start; i++) {
					this.removeElemsBySelector('[id^="'+i+'-"]');
					// this.removeElemsBySelector('[data-x="' + i + '"]');
				}
				for (var i = xRange.end + 1; i <= prevXRange.end; i++) {
					this.removeElemsBySelector('[id^="'+i+'-"]');
					// this.removeElemsBySelector('[data-x="' + i + '"]');
				}
				// for (var i = prevYRange.start; i < yRange.start; i++) {
				// 	this.removeElemsBySelector('[id*="-'+i+'-"]');
				// }
				// for (var i = yRange.end + 1; i <= prevYRange.end; i++) {
				// 	this.removeElemsBySelector('[id*="-'+i+'-"]');
				// }
				for (var i = prevZRange.start; i < zRange.start; i++) {
					this.removeElemsBySelector('[id$="-'+i+'"]');
					// this.removeElemsBySelector('[data-z="' + i + '"]');
				}
				for (var i = zRange.end + 1; i <= prevZRange.end; i++) {
					this.removeElemsBySelector('[id$="-'+i+'"]');
					// this.removeElemsBySelector('[data-z="' + i + '"]');
				}
			}

			prevXRange = xRange;
			prevYRange = yRange;
			prevZRange = zRange;
		},
		
		removeElemsBySelector : function(selector) {
			$position.find(selector).remove();	
			// var el =  $position[0].querySelector(selector);	
			// if (el)
			// 	el.parentNode.removeChild(el);
			// fadeOut(150,function(){
			// 	this.remove();	
			// });
		},
		
		createBlock : function(worldX, worldY, worldZ, fadeIn) {
			var texture;
			
			if (worldX < 0 || worldY < 0 || worldZ < 0)
				return;
			
			var blockId = this.getBlock(worldX, worldY, worldZ);
			
			if (blockId == 0)
				return;
			
			var bottom, top, left, right, back, front;
			
			top = this.getBlock(worldX, worldY - 1, worldZ) == 0;
			bottom = this.getBlock(worldX, worldY + 1, worldZ) == 0;
			right = this.getBlock(worldX - 1, worldY, worldZ) == 0;
			left = this.getBlock(worldX + 1, worldY, worldZ) == 0;
			back = this.getBlock(worldX, worldY, worldZ - 1) == 0;
			front = this.getBlock(worldX, worldY, worldZ + 1) == 0;

			var block;

			if (blockId == 1 && top == false) {
				texture = this.blockTypes[2].texture;	
			} else {
				texture = this.blockTypes[blockId].texture;
			}
			
			if (top || bottom || left || right || back || front) {
				block = document.createElement('div');
				block.classList.add('shape', 'cuboid-1', 'block', texture);
				block.style.cssText = 'transform: translate3d(' + Math.floor(worldX*Game.TILE_SIZE) + 'px,' + Math.floor(worldY*Game.TILE_SIZE) + 'px,' + Math.floor(worldZ*Game.TILE_SIZE) + 'px)';
				block.data = { x: worldX, y: worldY, z: worldZ };
				block.id = worldX+'-'+worldY+'-'+worldZ;
				// block = $('<div class="shape cuboid-1 block ' + texture + '" style="transform: translate3d(' + Math.floor(worldX*Game.TILE_SIZE) + 'px,' + Math.floor(worldY*Game.TILE_SIZE) + 'px,' + Math.floor(worldZ*Game.TILE_SIZE) + 'px)" />');
				// block.data('x',worldX).data('y',worldY).data('z',worldZ);
				// block.attr('id', worldX+'-'+worldY+'-'+worldZ);
			} else {
				return;
			}

			if (front) {
				// var ft = $('<div class="face " />');
				var ft = document.createElement('div');
				ft.classList.add('face', 'ft');
				block.appendChild(ft);
			}
			if (back) {
				// var bk = $('<div class="face bk" />');
				var bk = document.createElement('div');
				bk.classList.add('face', 'bk');
				block.appendChild(bk);
			}
			if (right) {
				// var rt = $('<div class="face rt" />');
				var rt = document.createElement('div');
				rt.classList.add('face', 'rt');
				block.appendChild(rt);
			}
			if (left) {
				// var lt = $('<div class="face lt" />');
				var lt = document.createElement('div');
				lt.classList.add('face', 'lt');
				block.appendChild(lt);
			}
			if (bottom) {
				// var bm = $('<div class="face bm" />');
				var bm = document.createElement('div');
				bm.classList.add('face', 'bm');
				block.appendChild(bm);
				//divCount++;
			}
			if (top) {
				// var tp = $('<div class="face tp" />');
				var tp = document.createElement('div');
				tp.classList.add('face', 'tp');
				block.appendChild(tp);
			}
			
		// if (fadeIn) {
		// 	block.addClass('fade-in');	
		// }
			
			return block;
		},
		
		removeBlock : function (worldX, worldY, worldZ) {			
			var elem = $position.find('#'+worldX+'-'+worldY+'-'+worldZ);
			
			if (elem) {
				elem.remove();	
			}
		},
		
		getChunk : function(x, y, z) {

			for (var chunk of this.level) {
				if (chunk.x == x && chunk.y == y && chunk.z == z) {
					return chunk;	
				}
			}
					
			return null;
		},
		worldToLocalPosition : function(worldX, worldY, worldZ) {
			var chunkPos = {
				x : ((worldX % this.chunkDimensions.width) + 
					 this.chunkDimensions.width) % this.chunkDimensions.width,
				y : ((worldY % this.chunkDimensions.height) + 
					 this.chunkDimensions.height) % this.chunkDimensions.height,
				z : ((worldZ % this.chunkDimensions.depth) + 
					 this.chunkDimensions.depth) % this.chunkDimensions.depth
			}
			
			return chunkPos;
		},
		worldToChunkPosition : function(worldX, worldY, worldZ) {
			var chunkPos = {
				x : Math.floor(worldX / this.chunkDimensions.width),
				y : Math.floor(worldY / this.chunkDimensions.height),
				z : Math.floor(worldZ / this.chunkDimensions.depth)
			}
			
			return chunkPos;
		},

		getBlock : function(worldX, worldY, worldZ) {
	
			var chunkPos = this.worldToChunkPosition(worldX, worldY, worldZ);
			
			var chunk = this.getChunk(chunkPos.x,chunkPos.y,chunkPos.z);

			if (!chunk || !chunk.data)
				return 0;
			
			var pos = this.worldToLocalPosition(worldX, worldY, worldZ);

			if (chunk.data[pos.x] != null 
				&& chunk.data[pos.x][pos.y] != null  
				&& chunk.data[pos.x][pos.y][pos.z] != null ) {
				
				return chunk.data[pos.x][pos.y][pos.z];
				
			} else {
				return 0;	
			}
		},
		
		updateLevel : function()
		{

			// map positions on x axis are inverted, i.e. moving forward into map results in negative position
			// so to calculate map x coord need to negate the player position. Also offset by the size of a tile
			// to ensure the user feels like the are directly on the tile.
			var xPos = 0-(Game.camera.position.x - (Game.TILE_SIZE / 2));
			var zPos = Game.camera.position.z + (Game.TILE_SIZE / 2);

			$position.css('transform','translate3d(' + xPos  + 'px, ' + Game.camera.position.y + 'px, ' + zPos + 'px)');

			// Set the world rotation
			$rotation.css('transform','translateZ(500px) rotateX(-' + (this.rotation.x + 360) + 'deg) rotateY(' + (this.rotation.y + 360) + 'deg) rotateZ(0deg)');
			
			var playerPos = Game.camera.position;
			
			var requiredChunks = [];
			
			var currChunk = this.worldToChunkPosition(playerPos.cubeX, playerPos.cubeY, playerPos.cubeZ);
		
			
			for (var chunkX = currChunk.x - 2; chunkX < currChunk.x + Math.ceil(renderDistance / this.chunkDimensions.width) + 1; chunkX++)
			{
				for (var chunkY = currChunk.y - 2; chunkY < currChunk.y + Math.ceil(renderDistance / this.chunkDimensions.height) + 1; chunkY++)
				{
					for (var chunkZ = currChunk.z - 2; chunkZ < currChunk.z + Math.ceil(renderDistance / this.chunkDimensions.depth) + 1; chunkZ++)
					{

						requiredChunks.push({
							x: chunkX,
							y: chunkY,
							z: chunkZ
						});

					}	
				}
			}
			
			
			for (var i = this.level.length -1; i >=0 ; i--) {
				var required = false;
				
				var chunk = this.level[i];
				for (var j = requiredChunks.length -1; j >=0 ; j--) {
					var pos = requiredChunks[j];
				
					if (chunk.x == pos.x
						&& chunk.y == pos.y
						&& chunk.z == pos.z) {
						required = true;
						requiredChunks.splice(j, 1);
					}
				}
				if (!required) {
				 	this.level.splice(i, 1);	
				}
			}

			for (var pos of requiredChunks) {
				var chunk = Game.LevelGenerator.generateChunk(pos.x, pos.y, pos.z);
				this.level.push(chunk);
			}
			
			this.render();
		}
	}

})();
