
//const { TempoEvent, BeatTimeEvent, TimeNow, createDevice, TimeSignatureEvent, TransportEvent } = require("@rnbo/js");


const patchExportURL = "export/stepSeq.export.json";
let device, context;


// colors 
let mouseOverColor = 'rgb(212, 95, 95)';
let mouseOutColor = 'rgb(0, 0, 50)';

let stepColor = "black";
let stepActiveColor = "red";

let mouseOverWidth = 50;
let mouseOutWidth = 35;

let currentColor = mouseOverColor;
let currentWidth = 0;

let sequencerRowLength = 16;
let numInstrumentRows = 4;
//const stepArray = [];

// holds each step's state [inst-step, state]
let stepMap = new Map();

let currentStep = 0;


let instrumentNames = ["kick", "snare", "hihat", "rimshot"];

function getInstrumentName(index) {
    return instrumentNames[index];
}

function stepClicked(event) {
    let id = this.id;
    console.log(id + " clicked");
    //console.log(event);
    let stepState = stepMap.get(id);
    if(stepState === false) {
        stepMap.set(id, true);
        this.style.backgroundColor = stepActiveColor;
    }
    else {
        stepMap.set(id, false);
        this.style.backgroundColor = stepColor;
    }
}

// create step grid
function createStepGrid() {
    // get sequencer-wrapper from DOM
    let sequencerWrapper = document.getElementById("sequencer-wrapper");    

    for (let i = 0; i < numInstrumentRows; i++) {
        let row = document.createElement("div");
        row.setAttribute("class", "sequencer-row");
        row.setAttribute("id", "row" + getInstrumentName(i));
        sequencerWrapper.appendChild(row);

        for (let j = 0; j < sequencerRowLength; j++) {

            let step = document.createElement("div");
            step.setAttribute("class", "step");
            step.setAttribute("id", getInstrumentName(i) + "-" + j);
            step.setAttribute("data-isCurrentStep", false);

            step.style.backgroundColor = stepColor;
            step.addEventListener("click", stepClicked);
            
        
            console.log("step created: " + step.id);
            row.appendChild(step);
            

            stepMap.set(step.id, false);
            //stepArray.push(step);
            
        }
        
    }
       
}

createStepGrid();


async function setupRNBO() {
    [device, context] = await createRNBODevice(patchExportURL);
    console.log("RNBO Device Created");

    if(!device) {
        console.log("Device not found");
    }

    // print out loaded device parameters
    console.log("Device found");
    device.parameters.forEach((parameter) => {
        console.log(parameter.id);
        console.log(parameter.name);
        console.log(parameter.value);
    });
    
    // set up event listeners for parameters
    const playstateParam = device.parametersById.get("playstate");
    playstateParam.changeEvent.subscribe((newPlayState) => {
        console.log("playstate changed event, state: " + newPlayState);
    });

    const currentBeat = device.parametersById.get("beat");
    currentBeat.changeEvent.subscribe((newBeat) => {
        currentStep = newBeat;
        setPlayhead();
        console.log("current step: " + newBeat);
    });

    
    let beatTimeEvent = new BeatTimeEvent(TimeNow, 1);
    device.schedyleEvent(beatTimeEvent);


}

// We can't await here because it's top level, so we have to check later
// if device and context have been assigned
setupRNBO();


// set playhead using current step
function setPlayhead() {
    // for each instrument row we set the current step's div isCurrentStep attribute to true
    for (let i = 0; i < numInstrumentRows; i++) {
        for(let j = 0; j < sequencerRowLength; j++) {
            let stepDiv = document.getElementById(getInstrumentName(i) + "-" + j);
            if(j === currentStep - 1) {
                stepDiv.setAttribute("data-isCurrentStep", true);
            } else {
            stepDiv.setAttribute("data-isCurrentStep", false);
            }
        }
    }
}



// frequency slider callback
function updateFrequency(newFreq) {
    if (device) {
        context.resume();
        const freqParam = device.parametersById.get("freq");
        freqParam.value = newFreq;
        console.log("Frequency: " + newFreq);
    }
}

function updateTempo(newTempo) {
    if (device) {
        context.resume();
        const tempoParam = device.parametersById.get("tempo");
        tempoParam.value = newTempo;
        console.log("Tempo: " + newTempo);
    }
}

function togglePlay(playButton) {
    if (device) {
        context.resume();
        const playParam = device.parametersById.get("playstate");
        playParam.value = !playParam.value;
        
        // we set button text to reflect the opposite state of the current playring state
        if(playParam.value === false) {
            playButton.innerHTML = "Play";
        } else {
            playButton.innerHTML = "Stop";
        };

        console.log("playstate button changed to: " + playParam.value);
    }
}


