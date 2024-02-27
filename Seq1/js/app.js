
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

let sequencerRowLength = 32;
//let numInstrumentRows = 4;
//const stepArray = [];

// holds each step's state [inst-stepIndex, state]
let stepMap = new Map();
let currentStep = 0;


let instrumentNames = ["kick", "snare", "hihat", "clap"];
let instrumentNoteMap = new Map(); 

for(let i = 0; i < instrumentNames.length; i++) {
    instrumentNoteMap.set(instrumentNames[i], i + 61);
}

instrumentNoteMap.forEach((value, key, map) => {
    console.log("Inst note map:");
    console.log(key + " " + value);
});

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

    // add row of labels for each step
    let labelRow = document.createElement("div");
    labelRow.setAttribute("class", "label-row");

    // each step label should represent 16th notes
    
    for (let i = 0; i < sequencerRowLength; i++) {
        let labelDiv = document.createElement("div");
        labelDiv.setAttribute("class", "note-label");
        labelDiv.innerHTML = i + 1;
        labelRow.appendChild(labelDiv);
    }

    sequencerWrapper.appendChild(labelRow);

    // add rows for each instrument
    for (let i = 0; i < instrumentNames.length; i++) {
        let rowDiv = document.createElement("div");
        rowDiv.setAttribute("class", "sequencer-row");
        rowDiv.setAttribute("id", "row" + getInstrumentName(i));
        sequencerWrapper.appendChild(rowDiv);

        // add steps to each row
        for (let j = 0; j < sequencerRowLength; j++) {

            // if(j === 0 || j === 4 || j === 8 || j === 12 || j === 16) {
            //     let barDiv = document.createElement("div");
            //     barDiv.setAttribute("class", "bar");
            //     barDiv.setAttribute("id", "bar" + j);
            //     rowDiv.appendChild(barDiv);
            // }
            
            let stepDiv = document.createElement("div");
            stepDiv.setAttribute("class", "step");
            stepDiv.setAttribute("id", getInstrumentName(i) + "-" + j);
            stepDiv.setAttribute("data-isCurrentStep", false);

            stepDiv.style.backgroundColor = stepColor;
            stepDiv.addEventListener("click", stepClicked);

            console.log("step created: " + stepDiv.id);
            rowDiv.appendChild(stepDiv);

            // add step to stepMap and store initial state as false
            stepMap.set(stepDiv.id, false);
        }
    }
}

createStepGrid();

// make RNBO device
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
   
    // load data buffer dependencies
    const descriptions = device.dataBufferDescriptions;
    descriptions.forEach((desc) => {
        if(!!desc.file){
            console.log("buffer with id: " + desc.id + " -references file: " + desc.file);
        } else {
            console.log(`buffer with id ${desc.id} references remote URL ${desc.url}`);
        }});

    // Load the dependencies into the device
    const results = await device.loadDataBufferDependencies(descriptions);
    results.forEach(result => {
        if (result.type === "success") {
            console.log(`Successfully loaded buffer with id ${result.id}`);
        } else {
            console.log(`Failed to load buffer with id ${result.id}, ${result.error}`);
        }    
    });
    
    // set up "playstate" parameter listener 
    const playstateParam = device.parametersById.get("playstate");
    playstateParam.changeEvent.subscribe((newPlayState) => {
        console.log("playstate changed event, state: " + newPlayState);
    });

    // set up "beat" parameter listener to update current step and playhead
    const currentBeat = device.parametersById.get("beat");
    currentBeat.changeEvent.subscribe((newBeat) => {
        currentStep = newBeat;
        sendStepToDevice();
        setPlayhead();
        //console.log("current step: " + newBeat);
    });
}

// We can't await here because it's top level, so we have to check later
// if device and context have been assigned
setupRNBO();

// set playhead using current step
function setPlayhead() {
    // for each instrument row we set the current step's div isCurrentStep attribute to true
    for (let i = 0; i < instrumentNames.length; i++) {
        for(let j = 0; j < sequencerRowLength; j++) {
            let stepDiv = document.getElementById(getInstrumentName(i) + "-" + j);
            if(j === currentStep) {
                stepDiv.setAttribute("data-isCurrentStep", true);
            } else {
            stepDiv.setAttribute("data-isCurrentStep", false);
            }
        }
    }
}

// get active steps from stepMap and send to device
function sendStepToDevice() {
    for(let i = 0; i < instrumentNames.length; i++) {
        let inst = getInstrumentName(i);
        let active = stepMap.get(inst + "-" + (currentStep));
        if(active === true) {
            noteOn(device, context, instrumentNoteMap.get(inst), 100);
        }
        
    }
}

// rate slider callback
function updateRate(newRate) {
    if (device) {
        context.resume();
        const rateParam = device.parametersById.get("rate");
        rateParam.value = newRate;
        console.log("rate: " + newRate);
    }
}

// tempo slider callback
function updateTempo(newTempo) {
    if (device) {
        context.resume();
        const tempoParam = device.parametersById.get("tempo");
        tempoParam.value = newTempo;
        console.log("tempo: " + newTempo);
    }
}

// play button callback
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

// click checkbox callback
function toggleClick(checkBox) {
    if (device) {
        context.resume();
        const clickParam = device.parametersById.get("click");
        
        if(checkBox.checked) {
            clickParam.value = 1;
        } else {
            clickParam.value = 0;
        }   
        console.log("click button changed to: " + clickParam.value);
    }
}

// direction select callback
function changeDirection(value){
    if (device) {
        context.resume();
        const directionParam = device.parametersById.get("playDirection");

        if(value === "up"){
            directionParam.value = 0;
        } else if(value === "down"){
            directionParam.value = 1;
        } else if(value === "updown"){
            directionParam.value = 2;
        }

        const resetParam = device.parametersById.get("resetSeq");

        console.log("direction changed to: " + value);
    }
}