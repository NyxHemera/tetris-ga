// Tetrads
class Piece {
	constructor(gameBoard) {
		this.GB = gameBoard;
		this.blockPos = [0, 0, 0, 0, 0, 0, 0, 0];
		this.blockPos[0] = Math.floor(this.GB.canvas.width / this.GB.bw / 2);
		this.currentRotation = 0;
		this.deltaPos = [ [], [], [], [] ];
		this.color = "";
	}
	toString() {
		return "";
	}
	move(x, y, bool) { // Move will return array of true on either a successful move or no move, or false on collision
		var success = [!x, !y]; // If not moving, set true, if moving set false. Numbers other than 0 are truthy.
		if(bool) { // Bool allows for forced movement, no matter the collision
			this.blockPos[0] += x;
			this.blockPos[1] += y;
			this.updateBCD(this.blockPos[0], this.blockPos[1]);
			return [true, true];
		}

		var fCollision = this.checkFrameCollision(this.blockPos);
		var bCollision = this.checkBlockCollision(this.blockPos);

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
					if(this.checkBlockClipping(this.blockPos)) { // Check if kicking to the left gives a good result
						// If that didn't...move back one above the original rotation.
						this.move(1,-1,true);
						this.updateBCD(this.blockPos[0], this.blockPos[1]);
						if(this.checkBlockClipping(this.blockPos)) { // Check if kicking up gives a good result
							// If that didn't...move back to original position with no rotation
							this.move(0,1,true);
							this.currentRotation = originalRotation;
							this.updateBCD(this.blockPos[0], this.blockPos[1]);
						}
					}
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
					if(this.checkBlockClipping(this.blockPos)) { // Check if kicking to the left gives a good result
						// If that didn't...move back one above the original rotation.
						this.move(1,-1,true);
						this.updateBCD(this.blockPos[0], this.blockPos[1]);
						if(this.checkBlockClipping(this.blockPos)) { // Check if kicking up gives a good result
							// If that didn't...move back to original position with no rotation
							this.move(0,1,true);
							this.currentRotation = originalRotation;
							this.updateBCD(this.blockPos[0], this.blockPos[1]);
						}
					}
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
			var top = pos[i+1]<0 || pos[i+1]>=canvas.height/bw; // Checks to see if block is out of the frame. If it is, don't run indexOf(prevents uncaught typeerror)
			var block;
			top ? block = false : block = blockGrid[pos[i+1]].indexOf(pos[i]) != -1;
			var leftWall = pos[i] < 0
			var rightWall = pos[i] >= canvas.width/bw;
			var bottomWall = pos[i+1]>=canvas.height/bw;
			if(block || leftWall || rightWall || bottomWall) {
				return true; // If clipping with block, leftframe, right frame, or bottom frame, return true, else continue checking
			}
			i++;
		}
		return false;
	}
	render() {
		for (var i = 0; i < this.blockPos.length; i++) {
			this.GB.drawCell(this.blockPos[i++], this.blockPos[i], this.color);
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
		this.color = "#D2015C";
	}
	toString() {
		return "Line";
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
								// If that didn't...move back to the original rotation and up one block.
								this.move(2,-1,true);
								this.updateBCD(this.blockPos[0], this.blockPos[1]);
								if(this.checkBlockClipping(this.blockPos)) {
									// If that didn't...move up one more.
									this.move(0,-1,true);
									this.updateBCD(this.blockPos[0], this.blockPos[1]);
									if(this.checkBlockClipping(this.blockPos)) { // Check if kicking up gives a good result
										// If that didn't...move back to the original rotation, don't rotate.
										this.move(0,2,true);
										this.currentRotation = originalRotation;
										this.updateBlockPos(4);
										this.updateBCD(this.blockPos[0], this.blockPos[1]);
									}
								}
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
								// If that didn't...move back to the original rotation and up one block.
								this.move(2,-1,true);
								this.updateBCD(this.blockPos[0], this.blockPos[1]);
								if(this.checkBlockClipping(this.blockPos)) {
									// If that didn't...move up one more.
									this.move(0,-1,true);
									this.updateBCD(this.blockPos[0], this.blockPos[1]);
									if(this.checkBlockClipping(this.blockPos)) { // Check if kicking up gives a good result
										// If that didn't...move back to the original rotation, don't rotate.
										this.move(0,2,true);
										this.currentRotation = originalRotation;
										this.updateBlockPos(4);
										this.updateBCD(this.blockPos[0], this.blockPos[1]);
									}
								}
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
		this.color = "#0EC200";
	}
	toString() {
		return "T-Shape";
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
		this.color = "#EB4824";
	}
	toString() {
		return "L-Shape";
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
		this.color = "#1684FF";
	}
	toString() {
		return "J-Shape";
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
		this.color = "#32AD87";
	}
	rotate() {
		console.log("Squares don't rotate...");
	}
	toString() {
		return "Square";
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
		this.color = "#B0009F";
	}
	toString() {
		return "S-Shape";
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
		this.color = "#6236F2";
	}
	toString() {
		return "Z-Shape";
	}
}

class GameBoard {
	constructor(cWidth) {
		// Create Canvas
		this.canvas = document.createElement("canvas");;
		this.ctx = this.canvas.getContext("2d");
		this.canvas.width = cWidth;
		this.canvas.height = cWidth*1.8;
		$('.wrap-game').append(this.canvas);
		this.domEl = $(this.canvas);

		this.SB;
		this.gameOver = false;
		this.paused = true;

		this.bw = cWidth / 10;
		this.currentPiece;
		this.nextPiece;
		this.blockGrid = []; // Contains all existing blocks on the board except currentPiece
		this.colorGrid = [];

		this.speed = 500; // Speed that blocks fall, smaller is faster
		this.dGravTime = 0; // Time since last gravity update
		this.loopSpeed = 16.66; // Runs update every loopSpeed ms
		this.runTime = 0; // Total runTime
	}
	// Initial Creation
	init() {
		for (var i = 0; i < this.canvas.height / this.bw; i++) {
			this.blockGrid.push([]); // Creates rows in the blockGrid. Row index corresponds to y value.
			this.colorGrid.push([]);
		}
		this.SB = new ScoreBoard(this);
		this.currentPiece = this.getRandomPiece(); // Sets the current Piece being controlled
		this.SB.updateCount();
		this.nextPiece = this.getRandomPiece(); // Sets the next Piece to drop
		this.SB.drawScoreBoard();

		// Draw Start Text
		this.ctx.font = "bold 24px Arial";
		this.ctx.fillStyle = "#FFFFFF";
		this.ctx.strokeStyle = "#000000";
		this.ctx.lineWidth = 1;
		this.ctx.textAlign = 'center';
		
		this.ctx.fillText("Press Space to Play", this.canvas.width/2, this.canvas.height/2);
		this.ctx.strokeText("Press Space to Play", this.canvas.width/2, this.canvas.height/2);
	}

	// Time Handlers
	start() {
		var self = this; // If you just call this.update, the scope changes to the window. To keep calling update on this GameBoard object, you have to create an anonymous function and call the update method inside of it.
		this.paused = false;
		this.gameLoop = setInterval(function() {self.update()}, this.loopSpeed);
	}
	pause() {
		this.paused = true;
		clearInterval(this.gameLoop);

		// Draw Pause Text
		this.ctx.font = "bold 24px Arial";
		this.ctx.fillStyle = "#FFFFFF";
		this.ctx.strokeStyle = "#000000";
		this.ctx.lineWidth = 1;
		this.ctx.textAlign = 'center';
		
		this.ctx.fillText("Paused", this.canvas.width/2, this.canvas.height/2 - this.bw);
		this.ctx.strokeText("Paused", this.canvas.width/2, this.canvas.height/2 - this.bw);
		this.ctx.fillText("Press Space to Continue", this.canvas.width/2, this.canvas.height/2);
		this.ctx.strokeText("Press Space to Continue", this.canvas.width/2, this.canvas.height/2);
		this.ctx.fillText("Press Esc to Quit", this.canvas.width/2, this.canvas.height/2 + this.bw);
		this.ctx.strokeText("Press Esc to Quit", this.canvas.width/2, this.canvas.height/2 + this.bw);
	}
	kill() {
		clearInterval(this.gameLoop); // Stop Updating
		this.SB.removeSelf(); // Remove ScoreBoard
		this.domEl.remove(); // Remove GameBoard
	}

	// Update call every loopSpeed ms
	update() {
		this.runTime += this.loopSpeed;
		this.dGravTime += this.loopSpeed;
		if (this.dGravTime >= this.speed) { // Check if we should update Gravity
			this.dGravTime = 0;
			var moveSucc = this.currentPiece.move(0, 1, false); // Update Gravity
			if(!moveSucc[1]) {
				if(this.checkGameOver()) {
					console.log("test");
					clearInterval(this.gameLoop);
					this.drawGameOver();
					return;
				}
				this.SB.updateCount(); // Increments PieceCount in Scoreboard
				this.grabNewPiece();
				this.SB.drawScoreBoard(); // Renders the ScoreBoard
			}
		}
		this.render();
	}
	restart() {
		this.gameOver = false;
		this.blockGrid = [];
		this.colorGrid = [];
		this.paused = true;
		this.speed = 500;
		this.runTime = 0;
		this.dGravTime = 0;

		this.SB.removeSelf();

		this.init();
		this.start();
	}

	// Rendering and Drawing Methods
	render() {
		// Background
		this.ctx.fillStyle = "#E5E5E5";
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
				this.drawCell(blockGrid[i][j], i, this.colorGrid[i][j]);
			}
		}
	}
	drawCell(x, y, color) {
		var bw = this.bw;
		/*if(this.SB.level > 0) {
			console.log(color);
			color = this.alterColor(color, (this.SB.level + 1) * -5);
			console.log(color);
		}*/
		this.ctx.fillStyle = color;
		this.ctx.fillRect(x * bw, y * bw, bw, bw);
		this.ctx.strokeStyle = "white";
		this.ctx.strokeRect(x * bw, y * bw, bw, bw);
	}
	/*alterColor(color, percent) {
		var hexNum = color.slice(1);
		var rgb = [hexNum.slice(0,2), hexNum.slice(2,4), hexNum.slice(4,6)];
		var hexString = "#";
		for(var i=0; i<rgb.length; i++) {
			rgb[i] = parseInt(rgb[i], 16);
			rgb[i] += 255/100*percent;
			rgb[i] = Math.floor(rgb[i]);
			rgb[i] <= 0 ? rgb[i] = 0 : "";
			rgb[i] < 10 ? rgb[i] = "0" + rgb[i] : "";
			rgb[i] >= 255 ? rgb[i] = 255 : "";
			hexString += rgb[i].toString(16);
		}
		return hexString;
	}*/
	drawGameOver() {
		this.ctx.font = "bold 24px Arial";
		this.ctx.fillStyle = "#FFFFFF";
		this.ctx.strokeStyle = "#000000";
		this.ctx.lineWidth = 1;
		this.ctx.textAlign = 'center';
		 
		this.ctx.fillText("Game Over", this.canvas.width/2, this.canvas.height/2 - this.bw);
		this.ctx.strokeText("Game Over", this.canvas.width/2, this.canvas.height/2 - this.bw);
		this.ctx.fillText("Press Space to Play", this.canvas.width/2, this.canvas.height/2);
		this.ctx.strokeText("Press Space to Play", this.canvas.width/2, this.canvas.height/2);
	}

	// Piece and Grid Handlers
	addBlock(x, y) {
		this.blockGrid[y].push(x);
		this.colorGrid[y].push(this.currentPiece.color);
	}
	checkGameOver() {
		this.gameOver = this.currentPiece.checkBlockClipping(this.currentPiece.blockPos);
		return this.gameOver; // If clipping with anything, trigger game over
	}
	removeRow(rowIndex) {
		this.blockGrid.splice(rowIndex, 1); // Removes row
		this.blockGrid.unshift([]); // Adds new row to the top
		this.colorGrid.splice(rowIndex, 1);
		this.colorGrid.unshift([]);
	}
	checkRows() {
		var blockGrid = this.blockGrid;
		var numRemoved = 0;
		for (var i = 0; i < blockGrid.length; i++) {
			if(blockGrid[i].length >= this.canvas.width / this.bw) {
				this.removeRow(i);
				numRemoved++;
				(this.SB.lines+numRemoved)%10 == 0 && this.speed>=50 ? this.speedUp() : "";
			}
		}
		this.SB.updateScore(numRemoved);
	}
	speedUp() {
		this.speed -= 25;
		this.SB.levelUp();
	}
	grabNewPiece() {
		var currentPiece = this.currentPiece;
		for (var i = 0; i < currentPiece.blockPos.length; i++) {
			this.addBlock(currentPiece.blockPos[i], currentPiece.blockPos[++i]); // Add Blocks to Grid
		}
		this.checkRows(); // Check for complete Rows
		this.currentPiece = this.nextPiece; // Switch to the next piece
		this.nextPiece = this.getRandomPiece();
	}
	getRandomPiece() {
		var rand = Math.floor(Math.random() * 100) % 7;
		this.SB.logPiece(rand);
		switch (rand) {
			case 0:
				this.SB.updateNextPiece(new Line(this.SB));
				return new Line(this);
				break;
			case 1:
				this.SB.updateNextPiece(new LShape(this.SB));
				return new LShape(this);
				break;
			case 2:
				this.SB.updateNextPiece(new ReverseL(this.SB));
				return new ReverseL(this);
				break;
			case 3:
				this.SB.updateNextPiece(new Square(this.SB));
				return new Square(this);
				break;
			case 4:
				this.SB.updateNextPiece(new TShape(this.SB));
				return new TShape(this);
				break;
			case 5:
				this.SB.updateNextPiece(new SShape(this.SB));
				return new SShape(this);
				break;
			case 6:
				this.SB.updateNextPiece(new ZShape(this.SB));
				return new ZShape(this);
				break;
			default:
				console.log("Error getting piece");
		}
	}
}
class MultiGameBoard {
	constructor(cWidth) {
		// Create Canvas
		this.canvas = document.createElement("canvas");;
		this.ctx = this.canvas.getContext("2d");
		this.canvas.width = cWidth*2;
		this.canvas.height = cWidth*1.8;
		$('.wrap-game').append(this.canvas);
		this.domEl = $(this.canvas);

		this.SB;
		this.gameOver = false;
		this.paused = true;

		this.bw = cWidth / 10;
		this.currentPieces = [];
		this.nextPiece;
		this.blockGrid = []; // Contains all existing blocks on the board except currentPiece
		this.colorGrid = [];

		this.speed = 500; // Speed that blocks fall, smaller is faster
		this.dGravTime = 0; // Time since last gravity update
		this.loopSpeed = 16.66; // Runs update every loopSpeed ms
		this.runTime = 0; // Total runTime
	}
	// Initial Creation
	init() {
		for (var i = 0; i < this.canvas.height / this.bw; i++) {
			this.blockGrid.push([]); // Creates rows in the blockGrid. Row index corresponds to y value.
			this.colorGrid.push([]);
		}
		this.SB = new ScoreBoard(this);
		this.currentPieces.push(this.getRandomPiece()); // Sets the current Piece being controlled by P1
		this.placeNewPieces(0);
		this.currentPieces.push(this.getRandomPiece()); // Sets the current Piece being controlled by P2
		this.placeNewPieces(1);
		this.SB.updateCount();
		this.nextPiece = this.getRandomPiece(); // Sets the next Piece to drop
		this.SB.drawScoreBoard();

		// Draw Start Text
		this.ctx.font = "bold 24px Arial";
		this.ctx.fillStyle = "#FFFFFF";
		this.ctx.strokeStyle = "#000000";
		this.ctx.lineWidth = 1;
		this.ctx.textAlign = 'center';
		
		this.ctx.fillText("Press Space to Play", this.canvas.width/2, this.canvas.height/2);
		this.ctx.strokeText("Press Space to Play", this.canvas.width/2, this.canvas.height/2);
	}

	// Time Handlers
	start() {
		var self = this; // If you just call this.update, the scope changes to the window. To keep calling update on this GameBoard object, you have to create an anonymous function and call the update method inside of it.
		this.paused = false;
		this.gameLoop = setInterval(function() {self.update()}, this.loopSpeed);
	}
	pause() {
		this.paused = true;
		clearInterval(this.gameLoop);

		// Draw Pause Text
		this.ctx.font = "bold 24px Arial";
		this.ctx.fillStyle = "#FFFFFF";
		this.ctx.strokeStyle = "#000000";
		this.ctx.lineWidth = 1;
		this.ctx.textAlign = 'center';
		
		this.ctx.fillText("Paused", this.canvas.width/2, this.canvas.height/2 - this.bw);
		this.ctx.strokeText("Paused", this.canvas.width/2, this.canvas.height/2 - this.bw);
		this.ctx.fillText("Press Space to Continue", this.canvas.width/2, this.canvas.height/2);
		this.ctx.strokeText("Press Space to Continue", this.canvas.width/2, this.canvas.height/2);
		this.ctx.fillText("Press Esc to Quit", this.canvas.width/2, this.canvas.height/2 + this.bw);
		this.ctx.strokeText("Press Esc to Quit", this.canvas.width/2, this.canvas.height/2 + this.bw);
	}
	kill() {
		clearInterval(this.gameLoop); // Stop Updating
		this.SB.removeSelf(); // Remove ScoreBoard
		this.domEl.remove(); // Remove GameBoard
	}

	// Update call every loopSpeed ms
	update() {
		this.runTime += this.loopSpeed;
		this.dGravTime += this.loopSpeed;
		if (this.dGravTime >= this.speed) { // Check if we should update Gravity
			this.dGravTime = 0;
			var moveSucc0 = this.currentPieces[0].move(0, 1, false); // Update Gravity
			var moveSucc1 = this.currentPieces[1].move(0, 1, false); // Update Gravity
			if(!moveSucc0[1]) { // If gravity isn't successful
				if(this.checkGameOver(0)) {
					clearInterval(this.gameLoop);
					this.drawGameOver();
					return;
				}
				this.SB.updateCount(); // Increments PieceCount in Scoreboard
				this.grabNewPiece(0);
				this.SB.drawScoreBoard(); // Renders the ScoreBoard
			}
			if(!moveSucc1[1]) { // If gravity isn't successful
				if(this.checkGameOver(1)) {
					clearInterval(this.gameLoop);
					this.drawGameOver();
					return;
				}
				this.SB.updateCount(); // Increments PieceCount in Scoreboard
				this.grabNewPiece(1);
				this.SB.drawScoreBoard(); // Renders the ScoreBoard
			}
		}
		this.render();
	}
	restart() {
		this.gameOver = false;
		this.blockGrid = [];
		this.colorGrid = [];
		this.paused = true;
		this.speed = 500;
		this.runTime = 0;
		this.dGravTime = 0;
		this.currentPieces = [];
		this.SB.removeSelf();

		this.init();
		this.start();
	}

	// Rendering and Drawing Methods
	render() {
		// Background
		this.ctx.fillStyle = "#E5E5E5";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		// Current Piece
		this.currentPieces[0].render();
		this.currentPieces[1].render();
		// Old Pieces
		this.renderBlocks();
	}
	renderBlocks() {
		var blockGrid = this.blockGrid;
		for (var i = 0; i < blockGrid.length; i++) {
			for (var j = 0; j < blockGrid[i].length; j++) {
				this.drawCell(blockGrid[i][j], i, this.colorGrid[i][j]);
			}
		}
	}
	drawCell(x, y, color) {
		var bw = this.bw;
		this.ctx.fillStyle = color;
		this.ctx.fillRect(x * bw, y * bw, bw, bw);
		this.ctx.strokeStyle = "white";
		this.ctx.strokeRect(x * bw, y * bw, bw, bw);
	}
	drawGameOver() {
		this.ctx.font = "bold 24px Arial";
		this.ctx.fillStyle = "#FFFFFF";
		this.ctx.strokeStyle = "#000000";
		this.ctx.lineWidth = 1;
		this.ctx.textAlign = 'center';
		 
		this.ctx.fillText("Game Over", this.canvas.width/2, this.canvas.height/2 - this.bw);
		this.ctx.strokeText("Game Over", this.canvas.width/2, this.canvas.height/2 - this.bw);
		this.ctx.fillText("Press Space to Play", this.canvas.width/2, this.canvas.height/2);
		this.ctx.strokeText("Press Space to Play", this.canvas.width/2, this.canvas.height/2);
	}

	// Piece and Grid Handlers
	addBlock(x, y, num) {
		this.blockGrid[y].push(x);
		this.colorGrid[y].push(this.currentPieces[num].color);
	}
	checkGameOver(num) {
		this.gameOver = this.currentPieces[num].checkBlockClipping(this.currentPieces[num].blockPos);
		return this.gameOver; // If clipping with anything, trigger game over
	}
	removeRow(rowIndex) {
		this.blockGrid.splice(rowIndex, 1); // Removes row
		this.blockGrid.unshift([]); // Adds new row to the top
		this.colorGrid.splice(rowIndex, 1);
		this.colorGrid.unshift([]);
	}
	checkRows() {
		var blockGrid = this.blockGrid;
		var numRemoved = 0;
		for (var i = 0; i < blockGrid.length; i++) {
			if(blockGrid[i].length >= this.canvas.width / this.bw) {
				this.removeRow(i);
				numRemoved++;
				(this.SB.lines+numRemoved)%10 == 0 && this.speed>=50 ? this.speedUp() : "";
			}
		}
		this.SB.updateScore(numRemoved);
	}
	speedUp() {
		this.speed -= 25;
		this.SB.levelUp();
	}
	grabNewPiece(num) {
		var currentPiece = this.currentPieces[num];
		for (var i = 0; i < currentPiece.blockPos.length; i++) {
			this.addBlock(currentPiece.blockPos[i], currentPiece.blockPos[++i], num); // Add Blocks to Grid
		}
		this.checkRows(); // Check for complete Rows
		this.currentPieces[num] = this.nextPiece; // Switch to the next piece
		this.placeNewPieces(num);
		this.nextPiece = this.getRandomPiece();
	}
	placeNewPieces(num) {
		if(num == 0) {
			this.currentPieces[num].blockPos[0] -= this.canvas.width/this.bw/4; // Move over one quarter screen left
			this.currentPieces[num].updateBCD(this.currentPieces[num].blockPos[0], this.currentPieces[num].blockPos[1]);
		}else {
			this.currentPieces[num].blockPos[0] += this.canvas.width/this.bw/4; // Move over one quarter screen right
			this.currentPieces[num].updateBCD(this.currentPieces[num].blockPos[0], this.currentPieces[num].blockPos[1]);
		}
	}
	getRandomPiece() {
		var rand = Math.floor(Math.random() * 100) % 7;
		this.SB.logPiece(rand);
		switch (rand) {
			case 0:
				this.SB.updateNextPiece(new Line(this.SB));
				return new Line(this);
				break;
			case 1:
				this.SB.updateNextPiece(new LShape(this.SB));
				return new LShape(this);
				break;
			case 2:
				this.SB.updateNextPiece(new ReverseL(this.SB));
				return new ReverseL(this);
				break;
			case 3:
				this.SB.updateNextPiece(new Square(this.SB));
				return new Square(this);
				break;
			case 4:
				this.SB.updateNextPiece(new TShape(this.SB));
				return new TShape(this);
				break;
			case 5:
				this.SB.updateNextPiece(new SShape(this.SB));
				return new SShape(this);
				break;
			case 6:
				this.SB.updateNextPiece(new ZShape(this.SB));
				return new ZShape(this);
				break;
			default:
				console.log("Error getting piece");
		}
	}
}
class ScoreBoard {
	constructor(gameBoard) {
		this.GB = gameBoard;
		this.score = 0;
		this.lines = 0;
		this.level = 0;
		this.bw = this.GB.bw;
		this.stagedCount = 0;
		this.pieceCount = [0,0,0,0,0,0,0];
		this.nextPiece;
		this.canvas;
		this.ctx;
		this.domEl;
		this.buildScoreBoard();
	}

	buildScoreBoard() {
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d');
		this.canvas.width = this.GB.canvas.height/1.8/2;
		this.canvas.height = this.GB.canvas.height;
		this.domEl = $(this.canvas);
		this.domEl.addClass('scoreBoard');
		$('.wrap-game').append(this.domEl);
		this.domEl.css('display', 'inline-block');
	}

	removeSelf() {
		this.domEl.remove();
	}

	logPiece(stageNum) {
		this.stagedCount = stageNum;
	}

	updateCount() {
		this.pieceCount[this.stagedCount]++;
	}

	updateNextPiece(next) {
		this.nextPiece = next;
		var name = this.nextPiece.toString();
		if(name === "Square") {
			this.nextPiece.blockPos[0] = 1.5;
			this.nextPiece.blockPos[1] = 2.2;
		}else if(name === "Line") {
			this.nextPiece.blockPos[0] = 2.5;
			this.nextPiece.blockPos[1] = 2.7;
		}else {
			this.nextPiece.blockPos[0] = 2;
			this.nextPiece.blockPos[1] = 2.2;
		}
		this.nextPiece.updateBCD(this.nextPiece.blockPos[0], this.nextPiece.blockPos[1]);
	}

	levelUp() {
		this.level++;
	}

	updateScore(numLines) {
		this.lines += numLines;
		switch(numLines) {
			case 0 :
				this.score += 25;
				break;
			case 1 :
				this.score += 100;
				break;
			case 2 :
				this.score += 250;
				break;
			case 3 :
				this.score += 500;
				break;
			case 4 :
				this.score += 1000;
				break;
			default :
				console.log("Invalid numLines recieved: " + numLines);
				break;
		}
	}

	drawScoreBoard() {
		// Background
		this.ctx.fillStyle = "#404040";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		// Draw Permanent Text
		this.drawTexts();
		// Draw Next Piece Box
		this.drawBox();
		// Draw Next Piece
		this.nextPiece.render();
	}

	drawBox() {
		this.ctx.strokeStyle = "#DCDCDC";
		this.ctx.strokeRect(0, 1.7*this.bw, 5*this.bw, 3*this.bw);
		this.ctx.fillStyle = "#E5E5E5";
		this.ctx.fillRect(0, 1.7*this.bw, 5*this.bw, 3*this.bw);
	}

	drawCell(x, y, color) {
		var bw = this.bw;
		this.ctx.fillStyle = color;
		this.ctx.fillRect(x * bw, y * bw, bw, bw);
		this.ctx.strokeStyle = "white";
		this.ctx.strokeRect(x * bw, y * bw, bw, bw);
	}

	drawTexts() {
		var unit = this.bw;
		// Initial font setup
		this.ctx.font = "16px Nunito, sans-serif";
		this.ctx.fillStyle = "#DCDCDC";
		this.ctx.textAlign = 'center';
		// Next: 
		this.ctx.fillText("Next: ", this.canvas.width/2, unit);
		// NextPiece:

		// Score:
		this.ctx.textAlign = 'left';
		this.ctx.fillText("Score:" + this.score, unit/2, unit*6);

		// Level:
		this.ctx.textAlign = 'left';
		this.ctx.fillText("Level:" + this.level, unit/2, unit*7);

		// Lines:
		this.ctx.fillText("Lines:" + this.lines, unit/2, unit*8);

		// Used:
		// Line:
		this.ctx.fillText("Line:" + this.pieceCount[0], unit/2, unit*10);
		// LShape:
		this.ctx.fillText("LShape:" + this.pieceCount[1], unit/2, unit*11);
		// RLShape:
		this.ctx.fillText("JShape:" + this.pieceCount[2], unit/2, unit*12);
		// Square:
		this.ctx.fillText("Square:" + this.pieceCount[3], unit/2, unit*13); 
		// TShape:
		this.ctx.fillText("TShape:" + this.pieceCount[4], unit/2, unit*14);
		// SShape:
		this.ctx.fillText("SShape:" + this.pieceCount[5], unit/2, unit*15);
		// ZShape:
		this.ctx.fillText("ZShape:" + this.pieceCount[6], unit/2, unit*16);
	}
}
class SplashScreen {
	constructor(cWidth) {
		// Create Canvas
		this.canvas = document.createElement("canvas");;
		this.ctx = this.canvas.getContext("2d");
		this.canvas.width = cWidth;
		this.canvas.height = cWidth/2.5*1.8;
		$('.wrap-game').append(this.canvas);
		this.domEl = $(this.canvas);

		this.bw = cWidth / 10 / 2.5;
		this.pieceArr = [];
		this.removeArr = [];

		this.speed = 200; // Speed that blocks fall, smaller is faster
		this.loadSpeed = 400; // Speed that pieces load
		this.dLoadTime = 0; // Time since last pieceLoad
		this.dGravTime = 0; // Time since last gravity update
		this.loopSpeed = 16.66; // Runs update every loopSpeed ms
		this.runTime = 0; // Total runTime

		this.splashing = true;
		this.controls = false;
	}
	// Initial Creation
	init() {
		this.start();
	}

	// Time Handlers
	start() {
		var self = this; // If you just call this.update, the scope changes to the window. To keep calling update on this GameBoard object, you have to create an anonymous function and call the update method inside of it.
		this.gameLoop = setInterval(function() {self.update()}, this.loopSpeed);
	}
	kill() {
		clearInterval(this.gameLoop); // Stop Updating
		this.domEl.remove(); // Remove GameBoard
	}

	// Update call every loopSpeed ms
	update() {
		this.runTime += this.loopSpeed;
		this.dGravTime += this.loopSpeed;
		this.dLoadTime += this.loopSpeed;
		if(this.dGravTime >= this.speed) { // Check if we should update Gravity
			this.dGravTime = 0;
			this.movePieces(); // Update Gravity
		}
		if(this.dLoadTime >= this.loadSpeed) { // Check if we should load new Pieces
			this.dLoadTime = 0;
			this.loadNewPiece();
		}
		this.checkOutOfBounds();
		this.render();
	}

	// Rendering and Drawing Methods
	render() {
		// Background
		this.ctx.fillStyle = "#E5E5E5";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		// Falling Blocks
		this.renderBlocks();
		// Title
		if(this.splashing) {
			this.drawTitle();
		}else if(this.controls) {
			this.drawControls();
		}else {
			this.drawMenu();
		}
	}
	renderBlocks() {
		for(var i=0; i<this.pieceArr.length; i++) {
			this.pieceArr[i].render();
		}
	}
	drawCell(x, y, color) {
		var bw = this.bw;
		this.ctx.fillStyle = color;
		this.ctx.fillRect(x * bw, y * bw, bw, bw);
		this.ctx.strokeStyle = "white";
		this.ctx.strokeRect(x * bw, y * bw, bw, bw);
	}
	drawTitle() {
		this.ctx.font = "bold 80px Arial";
		this.ctx.fillStyle = "#FFFFFF";
		this.ctx.strokeStyle = "#000000";
		this.ctx.lineWidth = 3;
		this.ctx.textAlign = 'center';
		 
		this.ctx.fillText("Tetris", this.canvas.width/2, this.canvas.height/2 - this.bw/2);
		this.ctx.strokeText("Tetris", this.canvas.width/2, this.canvas.height/2 - this.bw/2);
		this.ctx.font = "bold 30px Arial";
		this.ctx.lineWidth = 1;
		this.ctx.fillText("Press Space to Continue", this.canvas.width/2, this.canvas.height/2 + this.bw);
		this.ctx.strokeText("Press Space to Continue", this.canvas.width/2, this.canvas.height/2 + this.bw);
	}
	drawMenu() {
		this.ctx.font = "bold 80px Arial";
		this.ctx.fillStyle = "#FFFFFF";
		this.ctx.strokeStyle = "#000000";
		this.ctx.lineWidth = 3;
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
		 
		this.ctx.fillText("Main Menu", this.canvas.width/2, this.canvas.height/3);
		this.ctx.strokeText("Main Menu", this.canvas.width/2, this.canvas.height/3);
		this.ctx.font = "bold 30px Arial";
		this.ctx.fillStyle = "#464646";
		this.ctx.lineWidth = 1;
		this.ctx.fillText("1: Single-Player", this.canvas.width/2, this.canvas.height/3 * 2 - this.bw);
		this.ctx.strokeText("1: Single-Player", this.canvas.width/2, this.canvas.height/3 * 2 - this.bw);
		this.ctx.fillText("2: Co-op", this.canvas.width/2, this.canvas.height/3 * 2);
		this.ctx.strokeText("2: Co-op", this.canvas.width/2, this.canvas.height/3 * 2);
		this.ctx.fillText("3: Computer (In Progress)", this.canvas.width/2, this.canvas.height/3 * 2 + this.bw);
		this.ctx.strokeText("3: Computer (In Progress)", this.canvas.width/2, this.canvas.height/3 * 2 + this.bw);
		this.ctx.fillText("4: Controls", this.canvas.width/2, this.canvas.height/3 * 2 + this.bw*2);
		this.ctx.strokeText("4: Controls", this.canvas.width/2, this.canvas.height/3 * 2 + this.bw*2);
	}
	drawControls() {
		this.ctx.font = "bold 80px Arial";
		this.ctx.fillStyle = "#FFFFFF";
		this.ctx.strokeStyle = "#000000";
		this.ctx.lineWidth = 3;
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';

		this.ctx.fillText("Controls", this.canvas.width/2, this.canvas.height/3);
		this.ctx.strokeText("Controls", this.canvas.width/2, this.canvas.height/3);
		this.ctx.font = "bold 30px Arial";
		this.ctx.fillStyle = "#464646";
		this.ctx.lineWidth = 1;

		this.ctx.fillText("Single-Player:", this.canvas.width/3 - this.bw, this.canvas.height/3 * 2 - this.bw);
		this.ctx.strokeText("Single-Player:", this.canvas.width/3 - this.bw, this.canvas.height/3 * 2 - this.bw);
		this.ctx.fillText("Move: Arrow Keys", this.canvas.width/3 - this.bw, this.canvas.height/3 * 2);
		this.ctx.strokeText("Move: Arrow Keys", this.canvas.width/3 - this.bw, this.canvas.height/3 * 2);
		this.ctx.fillText("Rotate: Z X", this.canvas.width/3 - this.bw, this.canvas.height/3 * 2 + this.bw);
		this.ctx.strokeText("Rotate: Z X", this.canvas.width/3 - this.bw, this.canvas.height/3 * 2 + this.bw);
		this.ctx.fillText("Pause: Esc", this.canvas.width/3 - this.bw, this.canvas.height/3 * 2 + this.bw*2);
		this.ctx.strokeText("Pause: Esc", this.canvas.width/3 - this.bw, this.canvas.height/3 * 2 + this.bw*2);

		this.ctx.fillText("Multi-Player:", this.canvas.width/3*2 + this.bw, this.canvas.height/3 * 2 - this.bw);
		this.ctx.strokeText("Multi-Player:", this.canvas.width/3*2 + this.bw, this.canvas.height/3 * 2 - this.bw);
		this.ctx.fillText("P1 Move: A S D", this.canvas.width/3*2 + this.bw, this.canvas.height/3 * 2);
		this.ctx.strokeText("P1 Move: A S D", this.canvas.width/3*2 + this.bw, this.canvas.height/3 * 2);
		this.ctx.fillText("P1 Rotate: Q E", this.canvas.width/3*2 + this.bw, this.canvas.height/3 * 2 + this.bw);
		this.ctx.strokeText("P1 Rotate: Q E", this.canvas.width/3*2 + this.bw, this.canvas.height/3 * 2 + this.bw);
		this.ctx.fillText("P2 Move: Arrow Keys", this.canvas.width/3*2 + this.bw, this.canvas.height/3 * 2 + this.bw*2);
		this.ctx.strokeText("P2 Move: Arrow Keys", this.canvas.width/3*2 + this.bw, this.canvas.height/3 * 2 + this.bw*2);
		this.ctx.fillText("P2 Rotate: . /", this.canvas.width/3*2 + this.bw, this.canvas.height/3 * 2 + this.bw*3);
		this.ctx.strokeText("P2 Rotate: . /", this.canvas.width/3*2 + this.bw, this.canvas.height/3 * 2 + this.bw*3);
	}

	// Piece Handling Methods
	checkOutOfBounds() {
		for(var i=0; i<this.pieceArr.length; i++) {
			for(var j=0; j<this.pieceArr[i].blockPos.length; j++) {
				if(this.pieceArr[i].blockPos[++j] > this.canvas.height/this.bw + 5) {
					console.log("splicedd");
					this.pieceArr.splice(i,1);
				}
			}
		}
	}
	removePieces() {
		for(var i=0; i<removeArr.length; i++) {

		}
	}
	movePieces() {
		for(var i=0; i<this.pieceArr.length; i++) {
			this.pieceArr[i].move(0,1,true);
		}
	}
	loadNewPiece() {
		this.pieceArr.push(this.getRandomPiece());
	}
	getRandomPiece() {
		var rand = Math.floor(Math.random() * 100) % 7;
		var randX = Math.floor(Math.random() * 100) % (this.canvas.width/this.bw - 1);
		randX <= 0 ? randX += 2 : "";
		var piece;
		switch (rand) {
			case 0:
				piece = new Line(this);
				piece.blockPos[0] = randX;
				piece.updateBCD(piece.blockPos[0], piece.blockPos[1]);
				return piece;
				break;
			case 1:
				piece = new LShape(this);
				piece.blockPos[0] = randX;
				piece.updateBCD(piece.blockPos[0], piece.blockPos[1]);
				return piece;
				break;
			case 2:
				piece = new ReverseL(this);
				piece.blockPos[0] = randX;
				piece.updateBCD(piece.blockPos[0], piece.blockPos[1]);
				return piece;
				break;
			case 3:
				piece = new Square(this);
				piece.blockPos[0] = randX;
				piece.updateBCD(piece.blockPos[0], piece.blockPos[1]);
				return piece;
				break;
			case 4:
				piece = new TShape(this);
				piece.blockPos[0] = randX;
				piece.updateBCD(piece.blockPos[0], piece.blockPos[1]);
				return piece;
				break;
			case 5:
				piece = new SShape(this);
				piece.blockPos[0] = randX;
				piece.updateBCD(piece.blockPos[0], piece.blockPos[1]);
				return piece;
				break;
			case 6:
				piece = new ZShape(this);
				piece.blockPos[0] = randX;
				piece.updateBCD(piece.blockPos[0], piece.blockPos[1]);
				return piece;
				break;
			default:
				console.log("Error getting piece");
		}
	}
}

class MusicHandler {
	constructor() {
		this.theme = new Audio('media/Original_Theme.mp3');
		this.theme.loop = true;
		this.typeA = new Audio('media/typeA.mp3');
		this.typeA.loop = true;
		this.currentPlaying;
	}
}
class GameStateHandler {
	constructor() {
		this.GBArr = [];
		this.MH = new MusicHandler();
		this.width = 300;
		// SplashScreen : 0
		// Menu : 1
		// Single Player : 2
		// Multiplayer : 3
		// Computer : 4
		this.currentState = 0;
		this.lastState = 0;
		this.loadStateObjects();
	}

	loadStateObjects() {
		switch(this.currentState) {
			case 0 : // SplashScreen
				this.GBArr.push(new SplashScreen(this.width*2.5));
				this.lastState > 0 ? this.GBArr[0].splashing = false : "";
				$('.wrap-game').css('height', this.GBArr[0].canvas.height);
				$('.wrap-game').css('width', this.width*2.5);
				this.GBArr[0].init();

				if(this.lastState == 0) {
					this.MH.theme.play();
					this.MH.currentPlaying = this.MH.theme;
				}
				break;
			case 2 : // Single Player
				this.GBArr.push(new GameBoard(this.width));
				$('.wrap-game').css('height', this.GBArr[0].canvas.height);
				$('.wrap-game').css('width', this.width*1.5 + 1);
				this.GBArr[0].init();

				if(this.MH.currentPlaying != this.MH.typeA) {
					this.MH.currentPlaying.pause();
					this.MH.currentPlaying.currentTime = 0;
					this.MH.typeA.play();
					this.MH.currentPlaying = this.MH.typeA;
				}
				break;
			case 3 : // Multiplayer
				this.GBArr.push(new MultiGameBoard(this.width));
				$('.wrap-game').css('height', this.GBArr[0].canvas.height);
				$('.wrap-game').css('width', this.width*2.5 + 1);
				this.GBArr[0].init();

				if(this.MH.currentPlaying != this.MH.typeA) {
					this.MH.currentPlaying.pause();
					this.MH.currentPlaying.currentTime = 0;
					this.MH.typeA.play();
					this.MH.currentPlaying = this.MH.typeA;
				}
				break;
			case 4 : // Computer
				break;
		}
	}

	setState(num) {
		this.lastState = this.currentState;
		this.currentState = num;
		this.killGBArr();
		this.loadStateObjects();
	}

	killGBArr() {
		for(var i=0; i<this.GBArr.length; i++) {
			this.GBArr[i].kill();
		}
		this.GBArr = [];
	}

	handleKeyPress(e) {
		switch(this.currentState) {
			case 0 : // SplashScreen
				switch (e.keyCode) {
					// Esc Key
					case 27 :
						this.GBArr[0].controls ? this.GBArr[0].controls = false : "";
						break;
					// Space Key
					case 32 :
						console.log(this.GBArr[0].splashing);
						this.GBArr[0].splashing ? this.GBArr[0].splashing = false : "";
						console.log(this.GBArr[0].splashing);
						break;
					// 1 Key
					case 49 :
						!this.GBArr[0].splashing && !this.GBArr[0].controls ? this.setState(2) : "";
						break;
					case 50 :
						!this.GBArr[0].splashing && !this.GBArr[0].controls ? this.setState(3) : "";
						break;
					case 52 :
						!this.GBArr[0].splashing ? this.GBArr[0].controls = true : "";
						break;
				}
				break;
			case 2 : // Single Player
				switch (e.keyCode) {
					// X Key
					case 88:
						!this.GBArr[0].paused ? this.GBArr[0].currentPiece.rotate(true) : "";
						break;
					// Z Key
					case 90:
						!this.GBArr[0].paused ? this.GBArr[0].currentPiece.rotate(false) : "";
						break;
					// Left Key
					case 37:
						!this.GBArr[0].paused ? this.GBArr[0].currentPiece.move(-1, 0, false) : "";
						break;
					// Up Key
					case 38:
						break;
					// Right Key
					case 39:
						!this.GBArr[0].paused ? this.GBArr[0].currentPiece.move(1, 0, false) : "";
						break;
					// Down Key
					case 40:
						!this.GBArr[0].paused ? this.GBArr[0].currentPiece.move(0, 1, false) : "";
						break;
					// Space Key
					case 32 :
						this.GBArr[0].paused ? this.GBArr[0].start() : "";
						this.GBArr[0].gameOver ? this.GBArr[0].restart() : "";
						break;
					// Esc Key
					case 27 :
						this.GBArr[0].paused ? this.setState(0) : this.GBArr[0].pause(); // If already paused, switch to MainMenu
						this.GBArr[0].gameOver ? this.setState(0) : "";
						break;
				}
				break;
			case 3 : // Multiplayer
				switch (e.keyCode) {
					// Left Player

					// E Key
					case 69:
						!this.GBArr[0].paused ? this.GBArr[0].currentPieces[0].rotate(true) : "";
						break;
					// Q Key
					case 81:
						!this.GBArr[0].paused ? this.GBArr[0].currentPieces[0].rotate(false) : "";
						break;
					// A Key
					case 65:
						!this.GBArr[0].paused ? this.GBArr[0].currentPieces[0].move(-1, 0, false) : "";
						break;
					// D Key
					case 68:
						!this.GBArr[0].paused ? this.GBArr[0].currentPieces[0].move(1, 0, false) : "";
						break;
					// S Key
					case 83:
						!this.GBArr[0].paused ? this.GBArr[0].currentPieces[0].move(0, 1, false) : "";
						break;

					// Right Player

					// / Key
					case 191:
						!this.GBArr[0].paused ? this.GBArr[0].currentPieces[1].rotate(true) : "";
						break;
					// . Key
					case 190:
						!this.GBArr[0].paused ? this.GBArr[0].currentPieces[1].rotate(false) : "";
						break;
					// Left Key
					case 37:
						!this.GBArr[0].paused ? this.GBArr[0].currentPieces[1].move(-1, 0, false) : "";
						break;
					// Right Key
					case 39:
						!this.GBArr[0].paused ? this.GBArr[0].currentPieces[1].move(1, 0, false) : "";
						break;
					// Down Key
					case 40:
						!this.GBArr[0].paused ? this.GBArr[0].currentPieces[1].move(0, 1, false) : "";
						break;

					// Both Players

					// Space Key
					case 32 :
						this.GBArr[0].paused ? this.GBArr[0].start() : "";
						this.GBArr[0].gameOver ? this.GBArr[0].restart() : "";
						break;
					// Esc Key
					case 27 :
						this.GBArr[0].paused ? this.setState(0) : this.GBArr[0].pause(); // If already paused, switch to MainMenu
						this.GBArr[0].gameOver ? this.setState(0) : "";
						break;
				}
				break;
			case 4 : // Computer
				break;
		}
	}
}

var GSH;

$(document).keydown(function(e) {
	GSH.handleKeyPress(e);
});

$(document).ready(function() {
	GSH = new GameStateHandler();
});
