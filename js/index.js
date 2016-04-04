// Tetrads
class Piece {
	constructor(gameBoard) {
		this.GB = gameBoard;
		this.blockPos = [0, 0, 0, 0, 0, 0, 0, 0];
		this.blockPos[0] = Math.floor(this.GB.canvas.width / this.GB.bw / 2);
		this.currentRotation = 0;
		this.deltaPos = [ [], [], [], [] ];
	}
	move(x, y, bool) { // Move will return array of true on either a successful move or no move, or false on collision
		var fCollision = this.checkFrameCollision(this.blockPos);
		var bCollision = this.checkBlockCollision(this.blockPos);
		var success = [!x, !y]; // If not moving, set true, if moving set false. Numbers other than 0 are truthy.
		if(bool) { // Bool allows for forced movement, no matter the collision
			this.blockPos[0] += x;
			this.blockPos[1] += y;
			this.updateBCD(this.blockPos[0], this.blockPos[1]);
			return [true, true];
		}

		// If not colliding with the bottom or another piece:
		if (!fCollision[2] && !bCollision[2]) {
			this.blockPos[1] += y; // Move Down
			success[1] = true;
		} else {
			// Bottom Collision or Piece-on-Piece Collision
			success[1] = false;
		}
		if (x > 0 && !fCollision[1] && !bCollision[1]) { // If not colliding with the right wall or a piece to the right
			this.blockPos[0] += x; // Move Right
			success[0] = true;
		} else if (x < 0 && !fCollision[0] && !bCollision[0]) { // If not colliding with the left wall or a piece to the left
			this.blockPos[0] += x; // Move Left
			success[0] = true;
		}
		this.updateBCD(this.blockPos[0], this.blockPos[1]);
		return success;
	}
	// Iterate through the rotation states
	rotate(direction) {
		var originalRotation = this.currentRotation;

		if (direction) {
			// Rotate clockwise
			this.currentRotation < 3 ? this.currentRotation++ : this.currentRotation = 0;
			this.updateBCD(this.blockPos[0], this.blockPos[1]);
			if(this.checkBlockClipping(this.blockPos)) { // Check if normal rotation gave a good result
				// If it didn't...kick to the right
				this.move(1,0,true);
				this.updateBCD(this.blockPos[0], this.blockPos[1]);
				if(this.checkBlockClipping(this.blockPos)) { // Check if kicking to the right gives a good result
					// If that didn't...kick to the left
					this.move(-2,0,true);
					this.updateBCD(this.blockPos[0], this.blockPos[1]);
				}if(this.checkBlockClipping(this.blockPos)) { // Check if kicking to the left gives a good result
					// If that didn't...move back to the original rotation, don't rotate.
					this.move(1,0,true);
					this.currentRotation = originalRotation;
					this.updateBCD(this.blockPos[0], this.blockPos[1]);
				}
			}
		} else {
			// Rotate counterclockwise
			this.currentRotation > 0 ? this.currentRotation-- : this.currentRotation = 3;
			this.updateBCD(this.blockPos[0], this.blockPos[1]);
			if(this.checkBlockClipping(this.blockPos)) { // Check if normal rotation gave a good result
				// If it didn't...kick to the right
				this.move(1,0,true);
				this.updateBCD(this.blockPos[0], this.blockPos[1]);
				if(this.checkBlockClipping(this.blockPos)) { // Check if kicking to the right gives a good result
					// If that didn't...kick to the left
					this.move(-2,0,true);
					this.updateBCD(this.blockPos[0], this.blockPos[1]);
				}if(this.checkBlockClipping(this.blockPos)) { // Check if kicking to the left gives a good result
					// If that didn't...move back to the original rotation, don't rotate.
					this.move(1,0,true);
					this.currentRotation = originalRotation;
					this.updateBCD(this.blockPos[0], this.blockPos[1]);
				}
			}
		}
	}
	// Update the bcd-block positions based on the a-block position
	updateBCD(x, y) {
		for (var i = 2; i < this.blockPos.length; i++) {
			this.blockPos[i] = x + this.deltaPos[this.currentRotation][i - 2];
			i++;
			this.blockPos[i] = y + this.deltaPos[this.currentRotation][i - 2];
		}
	}
	checkFrameCollision(pos) {
		var collision = [false, false, false];
		var canvas = this.GB.canvas;
		var bw = this.GB.bw;
		for (var i = 0; i < pos.length; i++) {
			// Run X collision
			!collision[0] ? collision[0] = pos[i] <= 0 : ""; // Collides with Left Wall
			!collision[1] ? collision[1] = pos[i] >= (canvas.width / bw - 1) : ""; // Collides with Right Wall
			i++; //Must go here so it always increments
			// Run Y collision
			!collision[2] ? collision[2] = pos[i] >= (canvas.height / bw - 1) : ""; // Collides with Floor
		}
		return collision;
	}
	checkBlockCollision(pos) {
		var collision = [false, false, false];
		var blockGrid = this.GB.blockGrid;
		for (var i = 0; i < pos.length; i++) {
			if(pos[i+1] >= 0) {
				!collision[0] ? collision[0] = blockGrid[pos[i + 1]].indexOf(pos[i] - 1) != -1 : ""; // Collision Left; If there is a block to the left(x-1)
				!collision[1] ? collision[1] = blockGrid[pos[i + 1]].indexOf(pos[i] + 1) != -1 : ""; // Collision Right; If there is a block to the right(x+1)
				var row;
				blockGrid[pos[i + 1] + 1] != undefined ? row = blockGrid[pos[i + 1] + 1] : row = [];
				!collision[2] ? collision[2] = row.indexOf(pos[i]) != -1 : ""; // Collision Bottom; If there is a block below(y+1, x)
			}
			i++;
		}
		return collision;
	}
	checkBlockClipping(pos) { // Checks to see if the Piece is occupying the same space as other blocks
		var blockGrid = this.GB.blockGrid;
		var canvas = this.GB.canvas;
		var bw = this.GB.bw;
		for(var i=0; i< pos.length; i++) {
			var top = pos[i+1]<0;
			var block;
			top ? block = false : block = blockGrid[pos[i+1]].indexOf(pos[i]) != -1;
			var leftWall = pos[i] < 0
			var rightWall = pos[i] >= canvas.width/bw;
			if((!top && block) || leftWall || rightWall) {
				return true; // If clipping with block, leftframe, or right rame, return true, else continue checking
			}
			i++;
		}
		return false;
	}
	render() {
		for (var i = 0; i < this.blockPos.length; i++) {
			this.GB.drawCell(this.blockPos[i++], this.blockPos[i]);
		}
	}
}
class Line extends Piece {
	constructor(gameBoard) {
		super(gameBoard);
		this.deltaPos = [
			[-2,0,-1,0,1,0],
			[0,2,0,1,0,-1],
			[2,0,1,0,-1,0],
			[0,-2,0,-1,0,1]
		];
		// Start Piece in the 2nd rotation position
		this.currentRotation = 0;
		//update the rest of the squares
		this.updateBCD(this.blockPos[0], this.blockPos[1]);
	}
	// Iterate through the rotation states
	rotate(direction) {
		var originalRotation = this.currentRotation;

		if (direction) {
			// Rotate clockwise
			this.currentRotation < 3 ? this.currentRotation++ : this.currentRotation = 0;
			this.updateBlockPos(2);
			this.updateBCD(this.blockPos[0], this.blockPos[1]);
			if(this.checkBlockClipping(this.blockPos)) { // Check if normal rotation gave a good result
				// If it didn't...kick to the right
				this.move(1,0,true);
				this.updateBCD(this.blockPos[0], this.blockPos[1]);
				if(this.checkBlockClipping(this.blockPos)) {
					// If it didn't...kick to the right again
					this.move(1,0,true);
					this.updateBCD(this.blockPos[0], this.blockPos[1]);
					if(this.checkBlockClipping(this.blockPos)) { // Check if kicking to the right gives a good result
						// If that didn't...kick to the left
						this.move(-3,0,true);
						this.updateBCD(this.blockPos[0], this.blockPos[1]);
						if(this.checkBlockClipping(this.blockPos)) {
							// If that didn't...kick to the left
							this.move(-1,0,true);
							this.updateBCD(this.blockPos[0], this.blockPos[1]);
							if(this.checkBlockClipping(this.blockPos)) { // Check if kicking to the left gives a good result
								// If that didn't...move back to the original rotation, don't rotate.
								this.move(2,0,true);
								this.currentRotation = originalRotation;
								this.updateBlockPos(4);
								this.updateBCD(this.blockPos[0], this.blockPos[1]);
							}
						}
					}
				}
			}
		} else {
			// Rotate counterclockwise
			this.currentRotation > 0 ? this.currentRotation-- : this.currentRotation = 3;
			this.updateBlockPos(4);
			this.updateBCD(this.blockPos[0], this.blockPos[1]);
			if(this.checkBlockClipping(this.blockPos)) { // Check if normal rotation gave a good result
				// If it didn't...kick to the right
				this.move(1,0,true);
				this.updateBCD(this.blockPos[0], this.blockPos[1]);
				if(this.checkBlockClipping(this.blockPos)) {
					// If it didn't...kick to the right again
					this.move(1,0,true);
					this.updateBCD(this.blockPos[0], this.blockPos[1]);
					if(this.checkBlockClipping(this.blockPos)) { // Check if kicking to the right gives a good result
						// If that didn't...kick to the left
						this.move(-3,0,true);
						this.updateBCD(this.blockPos[0], this.blockPos[1]);
						if(this.checkBlockClipping(this.blockPos)) {
							// If that didn't...kick to the left
							this.move(-1,0,true);
							this.updateBCD(this.blockPos[0], this.blockPos[1]);
							if(this.checkBlockClipping(this.blockPos)) { // Check if kicking to the left gives a good result
								// If that didn't...move back to the original rotation, don't rotate.
								this.move(2,0,true);
								this.currentRotation = originalRotation;
								this.updateBlockPos(2);
								this.updateBCD(this.blockPos[0], this.blockPos[1]);
							}
						}
					}
				}
			}
		}
	}
	updateBlockPos(num) {
		var newPos = this.blockPos.splice(num,2); // Grab 3rd Element Positions
		this.blockPos.push(newPos[0]);
		this.blockPos.push(newPos[1]);
	}
}
class TShape extends Piece {
	constructor(gameBoard) {
		super(gameBoard);
		this.deltaPos = [
			[0, 1, 0, -1, 1, 0],
			[1, 0, -1, 0, 0, -1],
			[0, -1, 0, 1, -1, 0],
			[-1, 0, 1, 0, 0, 1]
		];
		// Start Piece in the 4th rotation position
		this.currentRotation = 3;
		//update the rest of the squares
		this.updateBCD(this.blockPos[0], this.blockPos[1]);
	}
}
class LShape extends Piece {
	constructor(gameBoard) {
		super(gameBoard);
		this.deltaPos = [
			[0,-1,0,1,1,1],
			[1,0,-1,0,-1,1],
			[0,1,0,-1,-1,-1],
			[-1,0,1,0,1,-1]
		];
		// Start Piece in the 2nd rotation position
		this.currentRotation = 1;
		//update the rest of the squares
		this.updateBCD(this.blockPos[0], this.blockPos[1]);
	}
}
class ReverseL extends Piece {
	constructor(gameBoard) {
		super(gameBoard);
		this.deltaPos = [
			[0,1,0,-1,1,-1],
			[-1,0,1,0,1,1],
			[0,-1,0,1,-1,1],
			[1,0,-1,0,-1,-1]
		];
		// Start Piece in the 2nd rotation position
		this.currentRotation = 1;
		//update the rest of the squares
		this.updateBCD(this.blockPos[0], this.blockPos[1]);
	}
}
class Square extends Piece {
	constructor(gameBoard) {
		super(gameBoard);
		this.deltaPos = [
			[0, 1, 1, 0, 1, 1]
		];
		this.currentRotation = 0;
		//update the rest of the squares
		this.updateBCD(this.blockPos[0], this.blockPos[1]);
	}
	rotate() {
		console.log("Squares don't rotate...");
	}
}
class SShape extends Piece {
	constructor(gameBoard) {
		super(gameBoard);
		this.deltaPos = [
			[0,-1,1,1,1,0],
			[-1,0,1,-1,0,-1],
			[0,1,-1,-1,-1,0],
			[1,0,-1,1,0,1]
		];
		// Start Piece in the 4th rotation position
		this.currentRotation = 3;
		//update the rest of the squares
		this.updateBCD(this.blockPos[0], this.blockPos[1]);
	}
}
class ZShape extends Piece {
	constructor(gameBoard) {
		super(gameBoard);
		this.deltaPos = [
			[0,1,1,-1,1,0],
			[1,0,-1,-1,0,-1],
			[0,-1,-1,1,-1,0],
			[-1,0,1,1,0,1]
		];
		// Start Piece in the 4th rotation position
		this.currentRotation = 3;
		//update the rest of the squares
		this.updateBCD(this.blockPos[0], this.blockPos[1]);
	}
}

class GameBoard {
	constructor(cWidth) {
		// Create Canvas
		this.canvas = document.createElement("canvas");;
		this.ctx = this.canvas.getContext("2d");
		this.canvas.width = cWidth;
		this.canvas.height = cWidth*1.8;
		document.body.appendChild(this.canvas);

		this.bw = cWidth / 10;
		this.currentPiece;
		this.nextPiece;
		this.blockGrid = []; // Contains all existing blocks on the board except currentPiece
		for (var i = 0; i < this.canvas.height / this.bw; i++) {
			this.blockGrid.push([]); // Creates rows in the blockGrid. Row index corresponds to y value.
		}

		this.speed = 500; // Speed that blocks fall, smaller is faster
		this.dGravTime = 0; // Time since last gravity update
		this.loopSpeed = 16.66; // Runs update every loopSpeed ms
		this.runTime = 0; // Total runTime
	}
	// Initial Creation
	init() {
		this.currentPiece = this.getRandomPiece(); // Sets the current Piece being controlled
		this.nextPiece = this.getRandomPiece(); // Sets the next Piece to drop
		//this.currentPiece = new Line(this);
		//this.nextPiece = new Line(this);
		var self = this; // If you just call this.update, the scope changes to the window. To keep calling update on this GameBoard object, you have to create an anonymous function and call the update method inside of it.
		this.gameLoop = setInterval(function() {self.update()}, this.loopSpeed);
	}

	// Update call every loopSpeed ms
	update() {
		this.runTime += this.loopSpeed;
		this.dGravTime += this.loopSpeed;
		if (this.dGravTime >= this.speed) { // Check if we should update Gravity
			this.dGravTime = 0;
			var moveSucc = this.currentPiece.move(0, 1, false); // Update Gravity
			if(!moveSucc[1]) {
				this.grabNewPiece();
			}
		}
		this.render();
	}

	// Rendering and Drawing Methods
	render() {
		// Background
		this.ctx.fillStyle = "#FFFFFF";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		// Current Piece
		this.currentPiece.render();
		// Old Pieces
		this.renderBlocks();
	}
	renderBlocks() {
		var blockGrid = this.blockGrid;
		for (var i = 0; i < blockGrid.length; i++) {
			for (var j = 0; j < blockGrid[i].length; j++) {
				this.drawCell(blockGrid[i][j], i);
			}
		}
	}
	drawCell(x, y) {
		var bw = this.bw;
		this.ctx.fillStyle = "blue";
		this.ctx.fillRect(x * bw, y * bw, bw, bw);
		this.ctx.strokeStyle = "white";
		this.ctx.strokeRect(x * bw, y * bw, bw, bw);
	}

	// Piece and Grid Handlers
	addBlock(x, y) {
		this.blockGrid[y].push(x);
	}
	removeRow(rowIndex) {
		this.blockGrid.splice(rowIndex, 1); // Removes row
		this.blockGrid.unshift([]); // Adds new row to the top
	}
	checkRows() {
		var blockGrid = this.blockGrid;
		for (var i = 0; i < blockGrid.length; i++) {
			blockGrid[i].length >= this.canvas.width / this.bw ? this.removeRow(i) : ""; // If row full, remove row.
		}
	}
	grabNewPiece() {
		var currentPiece = this.currentPiece;
		for (var i = 0; i < currentPiece.blockPos.length; i++) {
			this.addBlock(currentPiece.blockPos[i], currentPiece.blockPos[++i]); // Add Blocks to Grid
		}
		this.checkRows(); // Check for complete Rows
		this.currentPiece = this.nextPiece; // Switch to the next piece
		this.nextPiece = this.getRandomPiece();
		//this.nextPiece = new Line(this);
	}
	getRandomPiece() {
		switch (Math.floor(Math.random() * 100) % 7) {
			case 0:
				return new Line(this);
				break;
			case 1:
				return new LShape(this);
				break;
			case 2:
				return new ReverseL(this);
				break;
			case 3:
				return new Square(this);
				break;
			case 4:
				return new TShape(this);
				break;
			case 5:
				return new SShape(this);
				break;
			case 6:
				return new ZShape(this);
				break;
			default:
				console.log("Error getting piece");
		}
	}
}

var GB1;

$(document).keydown(function(e) {
	switch (e.keyCode) {
		// X Key
		case 88:
			GB1.currentPiece.rotate(true);
			break;
		// Z Key
		case 90:
			GB1.currentPiece.rotate(false);
			break;
		// Left Key
		case 37:
			GB1.currentPiece.move(-1, 0, false);
			break;
		// Up Key
		case 38:
			break;
		// Right Key
		case 39:
			GB1.currentPiece.move(1, 0, false);
			break;
		// Down Key
		case 40:
			GB1.currentPiece.move(0, 1, false);
			break;
	}
});

$(document).ready(function() {
	GB1 = new GameBoard(300);
	GB1.init();
});
