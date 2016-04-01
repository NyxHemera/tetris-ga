// Create canvas
var canvas;
var ctx;

var bw = 20;
var currentPiece;
var blockGrid = []; // Contains all existing blocks on the board except currentPiece

// Update speed in ms
var speed = 300;
var loopSpeed = 60;
var runTime = 0;

// Tetrads
class Piece {
	constructor() {
		// Rotation enum
		this.blockPos = [0, 0, 0, 0, 0, 0, 0, 0];
		// Down: 0, Left: 1, Up: 2, Right: 3
		this.currentRotation = 0;
		this.deltaPos = [
			[], //down
			[], //left
			[], //up
			[] //right
		];
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
			if (x > 0 && !fCollision[1] && !bCollision[1]) { // If not colliding with the right wall or a piece to the right
				this.blockPos[0] += x; // Move Right
				success[0] = true;
			} else if (x < 0 && !fCollision[0] && !bCollision[0]) { // If not colliding with the left wall or a piece to the left
				this.blockPos[0] += x; // Move Left
				success[0] = true;
			}
		} else {
			// Bottom Collision or Piece-on-Piece Collision
			grabNewPiece();
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
		for (var i = 0; i < pos.length; i++) {

			!collision[0] ? collision[0] = blockGrid[pos[i + 1]].indexOf(pos[i] - 1) != -1 : ""; // Collision Left; If there is a block to the left(x-1)
			!collision[1] ? collision[1] = blockGrid[pos[i + 1]].indexOf(pos[i] + 1) != -1 : ""; // Collision Right; If there is a block to the right(x+1)
			var row;
			blockGrid[pos[i + 1] + 1] != undefined ? row = blockGrid[pos[i + 1] + 1] : row = [];
			!collision[2] ? collision[2] = row.indexOf(pos[i]) != -1 : ""; // Collision Bottom; If there is a block below(y+1, x)
			i++;
		}
		return collision;
	}
	checkBlockClipping(pos) { // Checks to see if the Piece is occupying the same space as other blocks
		for(var i=0; i< pos.length; i++) {
			if(blockGrid[pos[i+1]].indexOf(pos[i]) != -1 || pos[i] < 0 || pos[i] >= canvas.width/bw) {
				return true; // If clipping with block, leftframe, or right rame, return true, else continue checking
			}
			i++;
		}
		return false;
	}
	render() {
		for (var i = 0; i < this.blockPos.length; i++) {
			drawCell(this.blockPos[i++], this.blockPos[i]);
		}
	}
}
class Line extends Piece {
	constructor() {
		super();
		// Rotation enum
		this.blockPos = [0, 0, 0, 0, 0, 0, 0, 0];
		this.deltaPos = [
			[0, 1, 0, 2, 0, 3], //down
			[-1, 0, -2, 0, -3, 0], //left
			[0, -1, 0, -2, 0, -3], //up
			[1, 0, 2, 0, 3, 0] //right
		];
		// Start lines facing down at position 5
		this.currentRotation = 0;
		this.blockPos[0] = 5;
		//update the rest of the squares
		this.updateBCD(this.blockPos[0], this.blockPos[1]);
	}
}
class TShape extends Piece {
	constructor() {
		super();
		// Rotation enum
		this.blockPos = [0, 0, 0, 0, 0, 0, 0, 0];
		// Down: 0, Left: 1, Up: 2, Right: 3
		this.currentRotation = 0;
		this.deltaPos = [
			[0, 1, 0, -1, 1, 0], //down
			[1, 0, -1, 0, 0, -1], //left
			[0, -1, 0, 1, -1, 0], //up
			[-1, 0, 1, 0, 0, 1] //right
		];
		// Start lines facing right at position 5
		this.currentRotation = 3;
		this.blockPos[0] = 5;
		//update the rest of the squares
		this.updateBCD(this.blockPos[0], this.blockPos[1]);
	}
}
class LShape extends Piece {
	constructor() {
		super();
		// Rotation enum
		this.blockPos = [0, 0, 0, 0, 0, 0, 0, 0];
		this.deltaPos = [
			[0,-1,0,1,1,1], //down
			[1,0,-1,0,-1,1], //left
			[0,1,0,-1,-1,-1], //up
			[-1,0,1,0,1,-1] //right
		];
		// Start lines facing left at position 5
		this.currentRotation = 1;
		this.blockPos[0] = 5;
		//update the rest of the squares
		this.updateBCD(this.blockPos[0], this.blockPos[1]);
	}
}
class ReverseL extends Piece {
	constructor() {
		super();
		// Rotation enum
		this.blockPos = [0, 0, 0, 0, 0, 0, 0, 0];
		this.deltaPos = [
			[0,1,0,-1,1,-1], //down
			[-1,0,1,0,1,1], //left
			[0,-1,0,1,-1,1], //up
			[1,0,-1,0,-1,-1] //right
		];
		// Start lines facing left at position 5
		this.currentRotation = 1;
		this.blockPos[0] = 5;
		//update the rest of the squares
		this.updateBCD(this.blockPos[0], this.blockPos[1]);
	}
}
class Square extends Piece {
	constructor() {
		super();
		// Rotation enum
		this.blockPos = [0, 0, 0, 0, 0, 0, 0, 0];
		this.deltaPos = [
			[0, 1, 1, 0, 1, 1] //down
		];
		// Start lines facing down at position 5
		this.currentRotation = 0;
		this.blockPos[0] = 5;
		//update the rest of the squares
		this.updateBCD(this.blockPos[0], this.blockPos[1]);
	}
	rotate() {
		console.log("Squares don't rotate...");
	}
}
class SShape extends Piece {
	constructor() {
		super();
		// Rotation enum
		this.blockPos = [0, 0, 0, 0, 0, 0, 0, 0];
		this.deltaPos = [
			[0,-1,1,1,1,0], //down
			[-1,0,1,-1,0,-1], //left
			[0,1,-1,-1,-1,0], //up
			[1,0,-1,1,0,1] //right
		];
		// Start lines facing down at position 5
		this.currentRotation = 0;
		this.blockPos[0] = 5;
		//update the rest of the squares
		this.updateBCD(this.blockPos[0], this.blockPos[1]);
	}
}
class ZShape extends Piece {
	constructor() {
		super();
		// Rotation enum
		this.blockPos = [0, 0, 0, 0, 0, 0, 0, 0];
		this.deltaPos = [
			[0,1,1,-1,1,0], //down
			[1,0,-1,-1,0,-1], //left
			[0,-1,-1,1,-1,0], //up
			[-1,0,1,1,0,1] //right
		];
		// Start lines facing down at position 5
		this.currentRotation = 0;
		this.blockPos[0] = 5;
		//update the rest of the squares
		this.updateBCD(this.blockPos[0], this.blockPos[1]);
	}
}

function addBlock(x, y) {
	blockGrid[y].push(x);
}

function removeRow(rowIndex) {
	console.log(blockGrid);
	blockGrid.splice(rowIndex, 1);
	blockGrid.unshift([]);
	console.log(blockGrid);
}

function checkRows() {
	for (var i = 0; i < blockGrid.length; i++) {
		blockGrid[i].length >= canvas.width / bw ? removeRow(i) : "";
	}
}

function renderBlocks() {
	for (var i = 0; i < blockGrid.length; i++) {
		for (var j = 0; j < blockGrid[i].length; j++) {
			drawCell(blockGrid[i][j], i);
		}
	}
}

function drawCell(x, y) {
	ctx.fillStyle = "blue";
	ctx.fillRect(x * bw, y * bw, bw, bw);
	ctx.strokeStyle = "white";
	ctx.strokeRect(x * bw, y * bw, bw, bw);
}

function createCanvas() {
	canvas = document.createElement("canvas");
	ctx = canvas.getContext("2d");
	canvas.width = 400;
	canvas.height = 600;
	document.body.appendChild(canvas);
}

function grabNewPiece() {
	for (var i = 0; i < currentPiece.blockPos.length; i++) {
		addBlock(currentPiece.blockPos[i], currentPiece.blockPos[i + 1]);
		i++;
	}
	checkRows();
	// checkRowCompletion();
	currentPiece = getRandomPiece();
}

function getRandomPiece() {
	switch (Math.floor(Math.random() * 100) % 7) {
		case 0:
			return new Line();
			break;
		case 1:
			return new LShape();
			break;
		case 2:
			return new ReverseL();
			break;
		case 3:
			return new Square();
			break;
		case 4:
			return new TShape();
			break;
		case 5:
			return new SShape();
			break;
		case 6:
			return new ZShape();
			break;
		default:
			console.log("Error getting piece");
	}
}

function init() {
	createCanvas();
	initializeVariables();
	//currentPiece = getRandomPiece();
	currentPiece = new LShape();
	gameLoop = setInterval(update, loopSpeed);
}

function initializeVariables() {
	console.log(blockGrid);
	for (var i = 0; i < canvas.height / bw; i++) {
		blockGrid.push([]);
	}
	console.log(blockGrid);
}

function update() {
	runTime += loopSpeed;
	if (runTime >= speed) {
		runTime = 0;
		currentPiece.move(0, 1, false);
	}
	render();
}

function render() {
	//background
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Current Piece
	currentPiece.render();
	// Old Pieces
	renderBlocks();
}

$(document).keydown(function(e) {
	switch (e.keyCode) {
		// X Key
		case 88:
			currentPiece.rotate(true);
			break;
			// Z Key
		case 90:
			currentPiece.rotate(false);
			break;
			// Left Key
		case 37:
			currentPiece.move(-1, 0, false);
			break;
			// Up Key
		case 38:
			break;
			// Right Key
		case 39:
			currentPiece.move(1, 0, false);
			break;
			// Down Key
		case 40:
			currentPiece.move(0, 1, false);
			break;
	}
});

$(document).ready(function() {
	init();
});
