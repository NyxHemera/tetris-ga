var bpm = 88;
var beat = 60 / bpm;

var originalTheme = [
		'G4',0, 
		'D4',.5, 'E4',.75, 'F4',1, 
		'E4',1.5, 'D4',1.75, 'C4',2.0, 
		'C4',2.5, 'E4',2.75, 'G4',3.0, 
		'F4',3.5, 'E4',3.75, 'D4',4.0, 
		'E4',4.75, 'F4',5.0, 
		'G4',5.5, 'E4',6.0, 
		'C4',6.5, 'C4',7.0


]

var bass = new Wad({
	source : 'sine',
	volume : .9, //Peak volume ranges from 0-infinity, dont set higher than 1
	globalReverb : true,
	//loop : false, //If True the audio will loop, this only works for audio clips, not oscillators
	//pitch : "A4" Set a default pitch if you don't want to set one during play()
	env : {
		attack : .02, //Time in seconds from onset to peak volume. common values range from .05 to .3
		decay : .1, //Time in seconds from peak volume to sustain volume
		sustain : .9, //Sustain volume level. This is a percent of peak volume, 0-1 is normal.
		hold : beat * .4, //Time in seconds to maintain the sustain volume. If not set, oscilators must be manually stopped.
		release : beat * .1
	}
})

var piano = new Wad({
	source : 'square',
	volume : 1.4,
	env : {
		attack : .01,
		decay : .005,
		sustain : .5,
		hold : beat * .20,
		release : beat * .15,
	
	}
})

function playBass(pitch, wait) {
	//bass.play();
	bass.play({pitch:pitch, wait:beat*wait});
}

function playPiano(pitch, wait) {
	piano.play({pitch:pitch, wait:beat*wait});
}

function playInstrument(instrument, song) {
	for(var i=0; i<song.length; i++){
		var hold = song[i+3] - song[i+1];
		if(i+3 > song.length) {
			hold = .5;
		}
		instrument.play({
			pitch:song[i], 
			wait:beat * song[++i], 
			env:{
				release:beat*hold
			}});
	}	
}






