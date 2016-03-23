// Canvas Vars
var canvas;
var ctx;


function createCanvas() {
	canvas = document.createElement("canvas");
	ctx = canvas.getContext("2d");
	canvas.width = 512;
	canvas.height = 480;
	document.body.appendChild(canvas);

	render();
	playInstrument(piano, originalTheme);
}

function render() {
	ctx.fillStyle="#FFFFFF";
	ctx.fillRect(0,0,canvas.width,canvas.height);	
}