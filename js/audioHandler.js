var bpm = 140 / 4;
var beat = 60 / bpm;

var bass = new Wad({
	source : 'square',
	volume : 1, //Peak volume ranges from 0-infinity, dont set higher than 1
	//loop : false, //If True the audio will loop, this only works for audio clips, not oscillators
	//pitch : "A4" Set a default pitch if you don't want to set one during play()
	env : {
		attack : beat * .001, //Time in seconds from onset to peak volume. common values range from .05 to .3
		decay : beat * .01, //Time in seconds from peak volume to sustain volume
		sustain : .8, //Sustain volume level. This is a percent of peak volume, 0-1 is normal.
		hold : beat * .4, //Time in seconds to maintain the sustain volume. If not set, oscilators must be manually stopped.
		release : beat * .01
	}
})

var bass2 = new Wad({
	source : 'square',
	volume : .4, //Peak volume ranges from 0-infinity, dont set higher than 1
	//loop : false, //If True the audio will loop, this only works for audio clips, not oscillators
	//pitch : "A4" Set a default pitch if you don't want to set one during play()
	env : {
		attack : beat * .001, //Time in seconds from onset to peak volume. common values range from .05 to .3
		decay : beat * .01, //Time in seconds from peak volume to sustain volume
		sustain : .3, //Sustain volume level. This is a percent of peak volume, 0-1 is normal.
		hold : beat * .4, //Time in seconds to maintain the sustain volume. If not set, oscilators must be manually stopped.
		release : beat * .01
	}
})

var piano = new Wad({
	source : 'square',
	volume : .8,
	env : {
		attack : beat * .01,
		decay : beat * .005,
		sustain : .5,
		hold : beat * .20,
		release : beat * .15
	}
})

var snare = new Wad ({
   source : 'noise', 
   volume : 1,
    env : {
        attack : beat * .001, 
        decay : beat * .01, 
        sustain : .4, 
        hold : .03, 
        release : beat * .01
    }, 
    filter : {
        type : 'bandpass', 
        frequency : 300, 
        q : .180
    }
})

function playInstrument(instrument, pitch, duration, wait) {
	console.log(pitch);
	console.log(duration);
	console.log(wait);
	if(pitch === 'REST') {
			
	}else {
		instrument.play({
			pitch: pitch,
			wait: beat*wait,
			env: {
				hold: (beat*duration - instrument.env.attack - instrument.env.decay - instrument.env.release)
			}
		});	
	}
}

function loadInstrument(intsObject) {
	var timecount = 0;
	for(var i=0; i<intsObject.notes.length; i++) {
		//console.log("playing");
		var note = intsObject.notes[i];
		//console.log(note);
		//console.log(note.pitch);
		//console.log(note.duration);
		playInstrument(intsObject.instrument, note.pitch, note.duration, timecount);
		timecount = timecount + note.duration;
	}
}

function handleSong(songObject) {
	//choose correct instruments
	//play instruments
	var intsArr = [bass, bass2, snare];
	songObject.instruments[0].instrument = intsArr[0];
	loadInstrument(songObject.instruments[0]);
	//songObject.instruments[1].instrument = intsArr[1];
	//loadInstrument(songObject.instruments[1]);
	songObject.instruments[2].instrument = intsArr[2];
	loadInstrument(songObject.instruments[2]);

	/*for(var i=0; i<songObject.instruments.length; i++) {
		songObject.instruments[i].instrument = intsArr[i];
		loadInstrument(songObject.instruments[i]);
	}*/
}

function loadSong(songName) {
	songName = "/js/json/" + songName + ".json";
	$.getJSON(songName, handleSong);
}




