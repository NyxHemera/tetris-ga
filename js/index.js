// Create canvas
var canvas;
var ctx;

var bw = 20;

// Tetrads

class Piece {
	constructor() {
		// Rotation enum
		this.rotation = {
			DOWN: 0,
			LEFT: 1,
			UP: 2,
			RIGHT: 3,
			properties: {
				0: {
					0: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					1: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					2: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					3: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					}
				},
				1: {
					0: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					1: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					2: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					3: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					}
				},
				2: {
					0: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					1: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					2: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					3: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					}
				},
				3: {
					0: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					1: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					2: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					3: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					}
				}
			}
		}

		this.currentRotation = this.rotation.DOWN;

	}

	getRotation() {
		return this.rotation.properties[this.currentRotation];
	};
	getCurrentRotation() {
		return this.currentRotation;
	}

	// Iterate through the rotation states
	rotate(direction) {
		if (direction >= 0) {
			//clockwise
			this.currentRotation == 3 ? this.currentRotation = 0 : this.currentRotation++;
			this.updateBCD(this.rotation.properties[this.currentRotation]);
		} else {
			//counterclockwise
			this.currentRotation == 0 ? this.currentRotation = 3 : this.currentRotation--;
		}
	}

	// Update the bcd-block positions based on the a-block position
	updateBCD(obj) {
		for (var i = 1; i < 4; i++) {
			this.rotation.properties[this.currentRotation][i].x = obj[0].x + obj[i].xd;
			this.rotation.properties[this.currentRotation][i].y = obj[0].y + obj[i].yd;
		}
	}

	drawCell(x, y) {
		ctx.fillStyle = "blue";
		ctx.fillRect(x * bw, y * bw, bw, bw);
		ctx.strokeStyle = "white";
		ctx.strokeRect(x * bw, y * bw, bw, bw);
	}

	render() {
		var obj = this.rotation.properties[this.currentRotation];
		for (var i = 0; i < 4; i++) {
			this.drawCell(obj[i].x, obj[i].y);
		}
	}
}
class Line extends Piece {
	constructor() {
		super();

		this.rotation = {
			DOWN: 0,
			LEFT: 1,
			UP: 2,
			RIGHT: 3,
			properties: {
				0: {
					0: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					1: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 1
					},
					2: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 2
					},
					3: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 3
					}
				},
				1: {
					0: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					1: {
						x: 0,
						y: 0,
						xd: -1,
						yd: 0
					},
					2: {
						x: 0,
						y: 0,
						xd: -2,
						yd: 0
					},
					3: {
						x: 0,
						y: 0,
						xd: -3,
						yd: 0
					}
				},
				2: {
					0: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					1: {
						x: 0,
						y: 0,
						xd: 0,
						yd: -1
					},
					2: {
						x: 0,
						y: 0,
						xd: 0,
						yd: -2
					},
					3: {
						x: 0,
						y: 0,
						xd: 0,
						yd: -3
					}
				},
				3: {
					0: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					1: {
						x: 0,
						y: 0,
						xd: 1,
						yd: 0
					},
					2: {
						x: 0,
						y: 0,
						xd: 2,
						yd: 0
					},
					3: {
						x: 0,
						y: 0,
						xd: 3,
						yd: 0
					}
				}
			}
		}

		// Start lines facing right at position 3
		this.currentRotation = this.rotation.DOWN;
		this.rotation.properties[this.currentRotation][0].x = 3;
		//update the rest of the squares
		this.updateBCD(this.rotation.properties[this.currentRotation]);
	}
}
class TShape extends Piece {
	constructor() {
		super();

		this.rotation = {
			DOWN: 0,
			LEFT: 1,
			UP: 2,
			RIGHT: 3,
			properties: {
				0: {
					0: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					1: {
						x: 0,
						y: 0,
						xd: 1,
						yd: 0
					},
					2: {
						x: 0,
						y: 0,
						xd: 2,
						yd: 0
					},
					3: {
						x: 0,
						y: 0,
						xd: 1,
						yd: 1
					}
				},
				1: {
					0: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					1: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 1
					},
					2: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 2
					},
					3: {
						x: 0,
						y: 0,
						xd: -1,
						yd: 1
					}
				},
				2: {
					0: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					1: {
						x: 0,
						y: 0,
						xd: -1,
						yd: 0
					},
					2: {
						x: 0,
						y: 0,
						xd: -2,
						yd: 0
					},
					3: {
						x: 0,
						y: 0,
						xd: -1,
						yd: -1
					}
				},
				3: {
					0: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					1: {
						x: 0,
						y: 0,
						xd: 0,
						yd: -1
					},
					2: {
						x: 0,
						y: 0,
						xd: 0,
						yd: -2
					},
					3: {
						x: 0,
						y: 0,
						xd: 1,
						yd: -1
					}
				}
			}
		}

		// Start lines facing down at position 3
		this.currentRotation = this.rotation.DOWN;
		this.rotation.properties[this.currentRotation][0].x = 3;
		//update the rest of the squares
		this.updateBCD(this.rotation.properties[this.currentRotation]);
	}
}
class LShape extends Piece {
	constructor() {
		super();

		this.rotation = {
			DOWN: 0,
			LEFT: 1,
			UP: 2,
			RIGHT: 3,
			properties: {
				0: {
					0: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					1: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 1
					},
					2: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 2
					},
					3: {
						x: 0,
						y: 0,
						xd: 1,
						yd: 2
					}
				},
				1: {
					0: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					1: {
						x: 0,
						y: 0,
						xd: -1,
						yd: 0
					},
					2: {
						x: 0,
						y: 0,
						xd: -2,
						yd: 0
					},
					3: {
						x: 0,
						y: 0,
						xd: -2,
						yd: 1
					}
				},
				2: {
					0: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					1: {
						x: 0,
						y: 0,
						xd: 0,
						yd: -1
					},
					2: {
						x: 0,
						y: 0,
						xd: 0,
						yd: -2
					},
					3: {
						x: 0,
						y: 0,
						xd: -1,
						yd: -2
					}
				},
				3: {
					0: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					1: {
						x: 0,
						y: 0,
						xd: 1,
						yd: 0
					},
					2: {
						x: 0,
						y: 0,
						xd: 2,
						yd: 0
					},
					3: {
						x: 0,
						y: 0,
						xd: 2,
						yd: -1
					}
				}
			}
		}

		// Start lines facing left at position 3
		this.currentRotation = this.rotation.LEFT;
		this.rotation.properties[this.currentRotation][0].x = 3;
		//update the rest of the squares
		this.updateBCD(this.rotation.properties[this.currentRotation]);
	}
}
class ReverseL extends Piece {
	constructor() {
		super();

		this.rotation = {
			DOWN: 0,
			LEFT: 1,
			UP: 2,
			RIGHT: 3,
			properties: {
				0: {
					0: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					1: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 1
					},
					2: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 2
					},
					3: {
						x: 0,
						y: 0,
						xd: -1,
						yd: 2
					}
				},
				1: {
					0: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					1: {
						x: 0,
						y: 0,
						xd: -1,
						yd: 0
					},
					2: {
						x: 0,
						y: 0,
						xd: -2,
						yd: 0
					},
					3: {
						x: 0,
						y: 0,
						xd: -2,
						yd: -1
					}
				},
				2: {
					0: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					1: {
						x: 0,
						y: 0,
						xd: 0,
						yd: -1
					},
					2: {
						x: 0,
						y: 0,
						xd: 0,
						yd: -2
					},
					3: {
						x: 0,
						y: 0,
						xd: 1,
						yd: -2
					}
				},
				3: {
					0: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					1: {
						x: 0,
						y: 0,
						xd: 1,
						yd: 0
					},
					2: {
						x: 0,
						y: 0,
						xd: 2,
						yd: 0
					},
					3: {
						x: 0,
						y: 0,
						xd: 2,
						yd: 1
					}
				}
			}
		}

		// Start lines facing right at position 3
		this.currentRotation = this.rotation.RIGHT;
		this.rotation.properties[this.currentRotation][0].x = 3;
		//update the rest of the squares
		this.updateBCD(this.rotation.properties[this.currentRotation]);
	}
}
class Square extends Piece {
	constructor() {
		super();

		this.rotation = {
			DOWN: 0,
			LEFT: 1,
			UP: 2,
			RIGHT: 3,
			properties: {
				0: {
					0: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					1: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 1
					},
					2: {
						x: 0,
						y: 0,
						xd: -1,
						yd: 0
					},
					3: {
						x: 0,
						y: 0,
						xd: -1,
						yd: 1
					}
				},
				1: {
					0: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					1: {
						x: 0,
						y: 0,
						xd: -1,
						yd: 0
					},
					2: {
						x: 0,
						y: 0,
						xd: 0,
						yd: -1
					},
					3: {
						x: 0,
						y: 0,
						xd: -1,
						yd: -1
					}
				},
				2: {
					0: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					1: {
						x: 0,
						y: 0,
						xd: 0,
						yd: -1
					},
					2: {
						x: 0,
						y: 0,
						xd: 1,
						yd: 0
					},
					3: {
						x: 0,
						y: 0,
						xd: 1,
						yd: -1
					}
				},
				3: {
					0: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 0
					},
					1: {
						x: 0,
						y: 0,
						xd: 1,
						yd: 0
					},
					2: {
						x: 0,
						y: 0,
						xd: 0,
						yd: 1
					},
					3: {
						x: 0,
						y: 0,
						xd: 1,
						yd: 1
					}
				}
			}
		}

		// Start lines facing right at position 3
		this.currentRotation = this.rotation.RIGHT;
		this.rotation.properties[this.currentRotation][0].x = 3;
		//update the rest of the squares
		this.updateBCD(this.rotation.properties[this.currentRotation]);
	}
}

var lineTest = new Line();
var lTest = new LShape();
var rLTest = new ReverseL();
var tTest = new TShape();

function createCanvas() {
	canvas = document.createElement("canvas");
	ctx = canvas.getContext("2d");
	canvas.width = 512;
	canvas.height = 480;
	document.body.appendChild(canvas);
	render();
}

function render() {

	//background
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Current Piece
	tTest.render();
}
