
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


let instrumentNames = ["kick", "snare", "hihat", "clap", "osc1", "osc2", "osc3", "osc4"];

// map instrument names to midi note numbers
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

    for (let i = 0; i < instrumentNames.length; i++) {
        let row = document.createElement("div");
        row.setAttribute("class", "sequencer-row");
        row.setAttribute("id", "row" + getInstrumentName(i));
        sequencerWrapper.appendChild(row);

        for (let j = 0; j < sequencerRowLength; j++) {

            let step = document.createElement("div");
            step.setAttribute("class", "step");
            step.setAttribute("id", getInstrumentName(i) + "-" + j);
            step.setAttribute("data-isCurrentStep", false);

            //step.style.backgroundColor = stepColor;
            step.addEventListener("click", stepClicked);
            
            row.appendChild(step);
            
            stepMap.set(step.id, false);
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
        sendStepToDevice();
        setPlayhead();
        //console.log("current step: " + newBeat);
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

}

// We can't await here because it's top level, so we have to check later
// if device and context have been assigned
setupRNBO();

// make default sequence for easy testing
function makeDefaultSequence() {
    

    let kick = instrumentNames[0];
    let snare = instrumentNames[1];
    let hihat = instrumentNames[2];

    // put a kick on every 4th step
    for (let i = 0; i < sequencerRowLength; i++) {
        let step = document.getElementById(kick + "-" + i);
        if(i % 4 === 0) {
            stepMap.set(step.id, true);
            step.style.backgroundColor = stepActiveColor;
        }
    }

    // put a snare on every 8th step
    for (let i = 0; i < sequencerRowLength; i++) {
        let step = document.getElementById(snare + "-" + i);
        if(i % 8 === 0) {
            stepMap.set(step.id, true);
            step.style.backgroundColor = stepActiveColor;
        }
    }

    // put a hihat on every 2nd step
    for (let i = 0; i < sequencerRowLength; i++) {
        let step = document.getElementById(hihat + "-" + i);
        if(i % 2 === 0) {
            stepMap.set(step.id, true);
            step.style.backgroundColor = stepActiveColor;
        }
    }
    

    // put a clap on every 16th step
    for(let i = 0; i < sequencerRowLength; i++) {
        let step = document.getElementById("clap" + "-" + i);
        if(i % 16 === 0) {
            stepMap.set(step.id, true);
            step.style.backgroundColor = stepActiveColor;
        }
    }

    // put a osc1 on every 3rd step
    for(let i = 0; i < sequencerRowLength; i++) {
        let step = document.getElementById("osc1" + "-" + i);
        if(i % 3 === 0) {
            stepMap.set(step.id, true);
            step.style.backgroundColor = stepActiveColor;
        }
    }

    // put a osc2 on every 5th step
    for(let i = 0; i < sequencerRowLength; i++) {
        let step = document.getElementById("osc2" + "-" + i);
        if(i % 5 === 0) {
            stepMap.set(step.id, true);
            step.style.backgroundColor = stepActiveColor;
        }
    }

    // put a osc3 on every 7th step
    for(let i = 0; i < sequencerRowLength; i++) {
        let step = document.getElementById("osc3" + "-" + i);
        if(i % 7 === 0) {
            stepMap.set(step.id, true);
            step.style.backgroundColor = stepActiveColor;
        }
    }

    // put a osc4 on every 9th step 
    for(let i = 0; i < sequencerRowLength; i++) {
        let step = document.getElementById("osc4" + "-" + i);
        if(i % 9 === 0) {
            stepMap.set(step.id, true);
            step.style.backgroundColor = stepActiveColor;
        }
    }

}

makeDefaultSequence();


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

// get playhead position from a given width and current step
function stepToX(width) {
    let scale = d3.scaleLinear().domain([0, sequencerRowLength]).range([0, width]);
    return scale(currentStep);
}

// check if the sequencer is playing
function isPlaying(){
    if(device) {
        let state = device.parametersById.get("playstate");
        return state.value;
    }
}

// get active steps from stepMap and send to device
function sendStepToDevice() {
    for(let i = 0; i < instrumentNames.length; i++) {
        let inst = getInstrumentName(i);
        let active = stepMap.get(inst + "-" + (currentStep - 1));
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

// attack slider callback
function updateAttack(newAttack) {
    if (device) {
        context.resume();
        const attackParam = device.parametersById.get("note-attack");
        attackParam.value = newAttack;
        console.log("attack: " + newAttack);
    }
}

// decay slider callback
function updateDecay(newDecay) {
    if (device) {
        context.resume();
        const decayParam = device.parametersById.get("note-decay");
        decayParam.value = newDecay;
        console.log("decay: " + newDecay);
    }
}

// sustain slider callback
function updateSustain(newSustain) {
    if (device) {
        context.resume();
        const sustainParam = device.parametersById.get("note-sustain");
        sustainParam.value = newSustain;
        console.log("sustain: " + newSustain);
    }
}

// release slider callback
function updateRelease(newRelease) {
    if (device) {
        context.resume();
        const releaseParam = device.parametersById.get("note-release");
        releaseParam.value = newRelease;
        console.log("release: " + newRelease);
    }
}

// note length slider callback
function updateNoteLength(newNoteLength) {
    if (device) {
        context.resume();
        const noteLengthParam = device.parametersById.get("note-length");
        noteLengthParam.value = newNoteLength;
        console.log("note length: " + newNoteLength);
    }
}

// oscMix slider callback
function updateOscMix(newOscMix) {
    if (device) {
        context.resume();
        const oscMixParam = device.parametersById.get("osc-mix");
        oscMixParam.value = newOscMix;
        console.log("osc mix: " + newOscMix);
    }
}
    
// clearCanvas button callback
function clearCanvas() {
    shouldClearSegments = true;
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

function setRateSliderValue(newRate){
    let rateSlider = document.getElementById("rateSlider");
    rateSlider.value = newRate;
    updateRate(newRate);
    //console.log("rate slider value set: " + newRate);
}

function setTempoSliderValue(newTempo){
    let tempoSlider = document.getElementById("tempoSlider");
    tempoSlider.value = newTempo;
    updateTempo(newTempo);
    console.log("tempo slider value set: " + newTempo);
}

function setOsc1Freq(newFreq){
    if (device) {
        context.resume();
        const osc1FreqParam = device.parametersById.get("osc1-freq");
        osc1FreqParam.value = newFreq;
        //console.log("osc1 freq: " + newFreq);
    }
}

function setOsc2Freq(newFreq){
    if (device) {
        context.resume();
        const osc2FreqParam = device.parametersById.get("osc2-freq");
        osc2FreqParam.value = newFreq;
        //console.log("osc2 freq: " + newFreq);
    }
}

function setOsc3Freq(newFreq){
    if (device) {
        context.resume();
        const osc3FreqParam = device.parametersById.get("osc3-freq");
        osc3FreqParam.value = newFreq;
        //console.log("osc3 freq: " + newFreq);
    }
}

function setOsc4Freq(newFreq){
    if (device) {
        context.resume();
        const osc4FreqParam = device.parametersById.get("osc4-freq");
        osc4FreqParam.value = newFreq;
        //console.log("osc4 freq: " + newFreq);
    }
}
