// Create canvas
var canvas;
var ctx;

var bw = 20;
var currentPiece;
var pieceList = [];
var rowFill = []; // Will contain the number of blocks in each row
var columnTops = []; // Will contain the y value of the highest block in each column

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
			// If moving down, checkBlockCollision, else don't...
			var bCollision = y > 0 ? this.checkBlockCollision(this.blockPos) : false;
			console.log(bCollision);
			// If not colliding with the bottom or another piece:
			if(!fCollision[2] && !bCollision) {
				this.blockPos[1] += y; // Move Down
				if(x > 0 && !fCollision[1]) {
					this.blockPos[0] += x; // Move Left
				}else if(x < 0 && !fCollision[0]) {
					this.blockPos[0] += x; // Move Right
				}
			} else {
				// Bottom Collision
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
	checkBlockCollision(pos) {
		// Assume block moving down
		for(var i=0; i<pos.length; i++) {
			if(columnTops[pos[i]] === (pos[i+1] + 1)) {
				return true;
			}
		}
		return false;
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

function updateGrid(piece) {
	var pos = piece.blockPos;
	// Update rowFill
	for(var i=1; i<pos.length; i+=2) {
		rowFill[pos[i]]++; // Increment rowFill for every block on that y
	}
	// Update columnTops
	for(var i=0; i<pos.length; i+=2) {
		if(columnTops[pos[i]] > pos[i+1]) { // If the y position of this block is higher than the highest y position stored in that column
			columnTops[pos[i]] = pos[i+1]; // Set the highest y position of that column to this block's position
		}
	}
}

function createCanvas() {
	canvas = document.createElement("canvas");
	ctx = canvas.getContext("2d");
	canvas.width = 400;
	canvas.height = 600;
	document.body.appendChild(canvas);
}

function grabNewPiece() {
	pieceList.push(currentPiece);
	// Updates the number of blocks in each row and the highest blocks in the columns
	updateGrid(currentPiece);
	// checkRowCompletion();
	currentPiece = getRandomPiece();
}

function renderList() {
	for(var i=0; i<pieceList.length; i++) {
		pieceList[i].render();
	}
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
	// Init Columns
	for(var i=0; i<canvas.width/bw; i++) {
		columnTops.push(canvas.height/bw);
	}
	// Init Rows
	for(var i=0; i<(canvas.height/bw); i++) {
		rowFill.push(0);
	}
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
	renderList();
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
