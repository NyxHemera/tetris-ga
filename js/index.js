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
	move(x, y) {
			var fCollision = this.checkFrameCollision(this.blockPos);
			//console.log("fCollision");
			//console.log(fCollision);
			// If moving down, checkBlockCollision, else don't...
			var bCollision = this.checkBlockCollision(this.blockPos);
			//console.log("bCollision");
			//console.log(bCollision);
			// If not colliding with the bottom or another piece:
			if(!fCollision[2] && !bCollision[2]) {
				this.blockPos[1] += y; // Move Down
				if(x > 0 && !fCollision[1] && !bCollision[1]) { // If not colliding with the right wall or a piece to the right
					this.blockPos[0] += x; // Move Right
				}else if(x < 0 && !fCollision[0] && !bCollision[0]) { // If not colliding with the left wall or a piece to the left
					this.blockPos[0] += x; // Move Left
				}
			} else {
				// Bottom Collision or Piece-on-Piece Collision
				grabNewPiece();
			}
			this.updateBCD(this.blockPos[0], this.blockPos[1]);
		}
		// Iterate through the rotation states
	rotate(direction) {
		if (direction) {
			// Rotate clockwise
			this.currentRotation < 3 ? this.currentRotation++ : this.currentRotation = 0;
			this.updateBCD(this.blockPos[0], this.blockPos[1]);
		} else {
			// Rotate counterclockwise
			this.currentRotation > 0 ? this.currentRotation-- : this.currentRotation = 3;
			this.updateBCD(this.blockPos[0], this.blockPos[1]);
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
	drawCell(x, y) {
		ctx.fillStyle = "blue";
		ctx.fillRect(x * bw, y * bw, bw, bw);
		ctx.strokeStyle = "white";
		ctx.strokeRect(x * bw, y * bw, bw, bw);
	}
	checkFrameCollision(pos) {
		var collision = [false, false, false];
		for(var i=0; i<pos.length; i++) {
			// Run X collision
			!collision[0] ? collision[0] = pos[i] <= 0 : ""; // Collides with Left Wall
			!collision[1] ? collision[1] = pos[i] >= (canvas.width/bw - 1) : ""; // Collides with Right Wall
			i++; //Must go here so it always increments
			// Run Y collision
			!collision[2] ? collision[2] = pos[i] >= (canvas.height/bw - 1) : ""; // Collides with Floor
		}
		return collision;
	}
	/*checkBlockCollision(pos) {
		// Assume block moving down
		for(var i=0; i<pos.length; i++) {
			if(columnTops[pos[i]] === (pos[i+1] + 1)) {
				return true;
			}
		}
		return false;
	}*/
	checkBlockCollision(pos) {
		var collision = [false, false, false];
		for(var i=0; i<pos.length; i++) {

			!collision[0] ? collision[0] = blockGrid[pos[i+1]].indexOf(pos[i]-1) != -1 : ""; // Collision Left; If there is a block to the left(x-1)
			!collision[1] ? collision[1] = blockGrid[pos[i+1]].indexOf(pos[i]+1) != -1 : ""; // Collision Right; If there is a block to the right(x+1)
			var row;
			blockGrid[pos[i+1]+ 1] != undefined ? row = blockGrid[pos[i+1]+ 1] : row = [];
			!collision[2] ? collision[2] = row.indexOf(pos[i]) != -1 : ""; // Collision Bottom; If there is a block below(y+1, x)
			i++;
		}
		return collision;
	}
	render() {
		for (var i = 0; i < this.blockPos.length; i++) {
			this.drawCell(this.blockPos[i++], this.blockPos[i]);
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
			[-1, 1, 0, 1, 1, 1], //down
			[-1, -1, -1, 0, -1, 1], //left
			[1, -1, 0, -1, -1, -1], //up
			[1, 1, 1, 0, 1, -1] //right
		];
		// Start lines facing down at position 5
		this.currentRotation = 0;
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
			[1, 0, 1, 1, 1, 2], //down
			[0, 1, -1, 1, -2, 1], //left
			[-1, 0, -1, -1, -1, -2], //up
			[0, -1, 1, -1, 2, -1] //right
		];
		// Start lines facing down at position 5
		this.currentRotation = 0;
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
			[-1, 0, -1, 1, -1, 2], //down
			[0, -1, -1, -1, -2, -1], //left
			[1, 0, 1, -1, 1, -2], //up
			[0, 1, 1, 1, 2, 1] //right
		];
		// Start lines facing down at position 5
		this.currentRotation = 0;
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

function addBlock(x,y) {
	blockGrid[y].push(x);
}

function removeRow(rowIndex) {
	console.log(blockGrid);
	blockGrid.splice(rowIndex, 1);
	blockGrid.unshift([]);
	console.log(blockGrid);
}

function checkRows() {
	for(var i=0; i<blockGrid.length; i++) {
		blockGrid[i].length >= canvas.width/bw ? removeRow(i) : "";
	}
}

function renderBlocks() {
	for(var i=0; i<blockGrid.length; i++) {
		for(var j=0; j<blockGrid[i].length; j++) {
			drawCell(blockGrid[i][j], i);
		}
	}
}

function 	drawCell(x, y) {
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
	for(var i=0; i<currentPiece.blockPos.length; i++) {
		addBlock(currentPiece.blockPos[i], currentPiece.blockPos[i+1]);
		i++;
	}
	checkRows();
	// checkRowCompletion();
	currentPiece = getRandomPiece();
}

function getRandomPiece() {
	switch (Math.floor(Math.random() * 100) % 5) {
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
		default:
			console.log("Error getting piece");
	}
}

function init() {
	createCanvas();
	initializeVariables();
	currentPiece = getRandomPiece();
	gameLoop = setInterval(update, loopSpeed);
}

function initializeVariables() {
	console.log(blockGrid);
	for(var i=0; i<canvas.height/bw; i++) {
		blockGrid.push([]);
	}
	console.log(blockGrid);
}

function update() {
	runTime += loopSpeed;
	if(runTime >= speed) {
		runTime = 0;
		currentPiece.move(0, 1);
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
			currentPiece.move(-1, 0);
			break;
			// Up Key
		case 38:
			break;
			// Right Key
		case 39:
			currentPiece.move(1, 0);
			break;
			// Down Key
		case 40:
			currentPiece.move(0, 1);
			break;
	}
});

$(document).ready(function() {
	init();
});
