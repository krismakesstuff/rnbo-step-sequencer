
const patchExportURL = "export/stepSeq.export.json";
let device, context;


// colors 
let mouseOverColor = 'rgb(212, 95, 95)';
let mouseOutColor = 'rgb(0, 0, 50)';

let stepColor = "rgb(55, 57, 65)";
let stepActiveColor = "rgb(151, 216, 196)";

let mouseOverWidth = 50;
let mouseOutWidth = 35;

let currentWidth = 0;

let sequencerRowLength = 32;
//let numInstrumentRows = 4;
//const stepArray = [];

// holds each step's state [inst-stepIndex, state]
let stepMap = new Map();
let currentStep = 0;


let instrumentNames = ["kick", "snare", "hihat", "clap", "osc1", "osc2", "osc3", "osc4"];

let presetPatterns = ["default", "random", "downbeat", "offbeat", "2nd&4th", "1st&3rd"];

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

// step callback when clicked
function stepClicked(event) {
    let id = this.id;
    console.log(id + " clicked");
    //console.log(event);
    let stepState = stepMap.get(id);
    if(stepState === false) {
        stepMap.set(id, true);
        this.style.backgroundColor = stepActiveColor;
        //this.setAttribute("data-isStepActive", true);        
    }
    else {
        stepMap.set(id, false);
        //this.setAttribute("data-isStepActive", false);        
        this.style.backgroundColor = stepColor;
    }
}

// step callback when mouse is over
function stepMouseOver(event) {
    if(event.buttons === 1) {    
        let id = this.id;
        let stepState = stepMap.get(id);
        if(stepState === false) {
            stepMap.set(id, true);
            this.style.backgroundColor = stepActiveColor;
            //this.setAttribute("data-isStepActive", true);
        }
        else {
            stepMap.set(id, false);
            this.style.backgroundColor = stepColor;
            //this.setAttribute("data-isStepActive", false);
        }
    }
}

// create row to label steps
function createStepLabels() {
    
}

// create step grid
function createStepGrid() {

    // get sequencer-wrapper from DOM
    let sequencerWrapper = document.getElementById("sequencer-wrapper");    

    // create labbels for each step
    let seqLabels = document.getElementById("seq-labels");
    let bar = 1;
    let notelabels = ["e", "&", "a"];
    let noteIndex = 0;

    let instLabel = document.createElement("div");
    instLabel.setAttribute("class", "inst-title-label");
    instLabel.innerHTML = "Instruments";
    seqLabels.appendChild(instLabel);

    for(let i = 0; i < sequencerRowLength; i++) {
        let stepLabel = document.createElement("div");
        stepLabel.setAttribute("class", "step-label");

        // each step is a 8th notes, the total sequencer length is 8 bars
        if(i % 4 === 0) {
            stepLabel.innerHTML = bar;
            stepLabel.style.fontSize = "18px";
            bar++;
        } else {
            stepLabel.innerHTML = notelabels[noteIndex];
            stepLabel.style.fontSize = "12px";
            noteIndex++;
            if(noteIndex > 2) {
                noteIndex = 0;
            }

        }
        
        seqLabels.appendChild(stepLabel);
    }

    // create a row for each instrument
    for (let i = 0; i < instrumentNames.length; i++) {

        // create a row for each instrument
        let instRow = document.createElement("div");
        instRow.setAttribute("class", "inst-row");
        instRow.setAttribute("id", "inst-row-" + getInstrumentName(i));
        sequencerWrapper.appendChild(instRow);
        
        // make a controls elements for each instrument
        let controls = document.createElement("div");
        controls.setAttribute("class", "inst-controls");
        controls.setAttribute("id", "inst-controls-" + getInstrumentName(i));
        instRow.appendChild(controls);

        // make a label for each instrument
        let instLabel = document.createElement("div");
        instLabel.setAttribute("class", "inst-label");
        instLabel.innerHTML = getInstrumentName(i);
        controls.appendChild(instLabel);

        // make a select element for each instrument that will have preset beat patterns
        let patternSelect = document.createElement("select");
        patternSelect.setAttribute("class", "inst-pattern-select");
        patternSelect.setAttribute("id", "pattern-select-" + getInstrumentName(i));
        
        // make some options for the select
        for(let j = 0; j < presetPatterns.length; j++) {
            let option = document.createElement("option");
            option.value = presetPatterns[j];
            option.innerHTML = presetPatterns[j];
            patternSelect.appendChild(option);
        }
        
        patternSelect.setAttribute("oninput", "change" + getInstrumentName(i) +"Pattern(this.value)");
        controls.appendChild(patternSelect);

        // make a slider for each instrument
        let slider = document.createElement("input");
        slider.setAttribute("type", "range");
        slider.setAttribute("class", "inst-gain-slider");
        slider.setAttribute("id", "slider-" + getInstrumentName(i));
        slider.setAttribute("value", "0.5");
        slider.setAttribute("min", "0");
        slider.setAttribute("max", "1");
        slider.setAttribute("step", "0.01");
        slider.setAttribute("oninput", "updateInst"+getInstrumentName(i)+"Gain(this.value)");
        controls.appendChild(slider);

        // make a wrapper for the steps in sequencer row
        let seqRow = document.createElement("div");
        seqRow.setAttribute("class", "sequencer-row");
        seqRow.setAttribute("id", "row-" + getInstrumentName(i));
        instRow.appendChild(seqRow);


        // create a step for each beat in the row
        for (let j = 0; j < sequencerRowLength; j++) {

            let step = document.createElement("div");
            step.setAttribute("class", "step");
            step.setAttribute("id", getInstrumentName(i) + "-" + j);
            //step.setAttribute("data-isStepActive", false);
            step.setAttribute("data-isCurrentStep", false);

            //step.style.backgroundColor = stepColor;
            step.addEventListener("click", stepClicked);
            step.addEventListener("mouseover", stepMouseOver);
            
            seqRow.appendChild(step);
            
            stepMap.set(step.id, false);
        }
    }
}



createStepLabels();
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



//makeDefaultSequence();


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

// inst gain slider callbacks
function updateInstkickGain(newGain){
    if (device) {
        context.resume();
        const kickGainParam = device.parametersById.get("kick-gain");
        kickGainParam.value = newGain;
        console.log("kick gain: " + newGain);
    }
}

function updateInstsnareGain(newGain){
    if (device) {
        context.resume();
        const snareGainParam = device.parametersById.get("snare-gain");
        snareGainParam.value = newGain;
        console.log("snare gain: " + newGain);
    }
}

function updateInsthihatGain(newGain){
    if (device) {
        context.resume();
        const hihatGainParam = device.parametersById.get("hihat-gain");
        hihatGainParam.value = newGain;
        console.log("hihat gain: " + newGain);
    }
}

function updateInstclapGain(newGain){
    if (device) {
        context.resume();
        const clapGainParam = device.parametersById.get("clap-gain");
        clapGainParam.value = newGain;
        console.log("clap gain: " + newGain);
    }
}

function updateInstosc1Gain(newGain){
    if (device) {
        context.resume();
        const osc1GainParam = device.parametersById.get("osc1-gain");
        osc1GainParam.value = newGain;
        console.log("osc1 gain: " + newGain);
    }
}

function updateInstosc2Gain(newGain){
    if (device) {
        context.resume();
        const osc2GainParam = device.parametersById.get("osc2-gain");
        osc2GainParam.value = newGain;
        console.log("osc2 gain: " + newGain);
    }
}

function updateInstosc3Gain(newGain){
    if (device) {
        context.resume();
        const osc3GainParam = device.parametersById.get("osc3-gain");
        osc3GainParam.value = newGain;
        console.log("osc3 gain: " + newGain);
    }
}

function updateInstosc4Gain(newGain){
    if (device) {
        context.resume();
        const osc4GainParam = device.parametersById.get("osc4-gain");
        osc4GainParam.value = newGain;
        console.log("osc4 gain: " + newGain);
    }
}


// clear instrument row
function clearInstrumentRow(inst) {
    for(let i = 0; i < sequencerRowLength; i++) {
        let step = document.getElementById(inst + "-" + i);
        stepMap.set(step.id, false);
        step.style.backgroundColor = stepColor;
    }
}

// pattern select callbacks
function changekickPattern(newPattern) {
    
    clearInstrumentRow("kick");

    if(newPattern === "default") {
        //makeDefaultSequence(kick);
    } else if(newPattern === "random") {
        makeRandomSequence("kick");
    } else if(newPattern === "downbeat") {
        makeDownbeatSequence("kick");
    } else if(newPattern === "offbeat") {
        makeOffbeatSequence("kick");
    } else if(newPattern === "2nd&4th") {
        make2nd4thSequence("kick");
    } else if(newPattern === "1st&3rd") {
        make1st3rdSequence("kick");
    } 
}

function changesnarePattern(newPattern) {
    clearInstrumentRow("snare");

    if(newPattern === "default") {
        //makeDefaultSequence(snare);
    } else if(newPattern === "random") {
        makeRandomSequence("snare");
    } else if(newPattern === "downbeat") {
        makeDownbeatSequence("snare");
    } else if(newPattern === "offbeat") {
        makeOffbeatSequence("snare");
    } else if(newPattern === "2nd&4th") {
        make2nd4thSequence("snare");
    } else if(newPattern === "1st&3rd") {
        make1st3rdSequence("snare");
    } 
}

function changehihatPattern(newPattern) {
    clearInstrumentRow("hihat");

    if(newPattern === "default") {
        //makeDefaultSequence(hihat);
    } else if(newPattern === "random") {
        makeRandomSequence("hihat");
    } else if(newPattern === "downbeat") {
        makeDownbeatSequence("hihat");
    } else if(newPattern === "offbeat") {
        makeOffbeatSequence("hihat");
    } else if(newPattern === "2nd&4th") {
        make2nd4thSequence("hihat");
    } else if(newPattern === "1st&3rd") {
        make1st3rdSequence("hihat");
    } 
}

function changeclapPattern(newPattern) {
    clearInstrumentRow("clap");

    if(newPattern === "default") {
        //makeDefaultSequence(clap);
    } else if(newPattern === "random") {
        makeRandomSequence("clap");
    } else if(newPattern === "downbeat") {
        makeDownbeatSequence("clap");
    } else if(newPattern === "offbeat") {
        makeOffbeatSequence("clap");
    } else if(newPattern === "2nd&4th") {
        make2nd4thSequence("clap");
    } else if(newPattern === "1st&3rd") {
        make1st3rdSequence("clap");
    } 
}

function changeosc1Pattern(newPattern) {
    clearInstrumentRow("osc1");

    if(newPattern === "default") {
        //makeDefaultSequence(osc1);
    } else if(newPattern === "random") {
        makeRandomSequence("osc1");
    } else if(newPattern === "downbeat") {
        makeDownbeatSequence("osc1");
    } else if(newPattern === "offbeat") {
        makeOffbeatSequence("osc1");
    } else if(newPattern === "2nd&4th") {
        make2nd4thSequence("osc1");
    } else if(newPattern === "1st&3rd") {
        make1st3rdSequence("osc1");
    } 
}

function changeosc2Pattern(newPattern) {
    clearInstrumentRow("osc2");

    if(newPattern === "default") {
        //makeDefaultSequence(osc2);
    } else if(newPattern === "random") {
        makeRandomSequence("osc2");
    } else if(newPattern === "downbeat") {
        makeDownbeatSequence("osc2");
    } else if(newPattern === "offbeat") {
        makeOffbeatSequence("osc2");
    } else if(newPattern === "2nd&4th") {
        make2nd4thSequence("osc2");
    } else if(newPattern === "1st&3rd") {
        make1st3rdSequence("osc2");
    } 
}

function changeosc3Pattern(newPattern) {
    clearInstrumentRow("osc3");
    if(newPattern === "default") {
        //makeDefaultSequence(osc3);
    } else if(newPattern === "random") {
        makeRandomSequence("osc3");
    } else if(newPattern === "downbeat") {
        makeDownbeatSequence("osc3");
    } else if(newPattern === "offbeat") {
        makeOffbeatSequence("osc3");
    } else if(newPattern === "2nd&4th") {
        make2nd4thSequence("osc3");
    } else if(newPattern === "1st&3rd") {
        make1st3rdSequence("osc3");
    }
}

function changeosc4Pattern(newPattern) {
    clearInstrumentRow("osc4");

    if(newPattern === "default") {
        //makeDefaultSequence(osc4);
    } else if(newPattern === "random") {
        makeRandomSequence("osc4");
    } else if(newPattern === "downbeat") {
        makeDownbeatSequence("osc4");
    } else if(newPattern === "offbeat") {
        makeOffbeatSequence("osc4");
    } else if(newPattern === "2nd&4th") {
        make2nd4thSequence("osc4");
    } else if(newPattern === "1st&3rd") {
        make1st3rdSequence("osc4");
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

// clearSequence button callback
function clearSequencer() {
    for (let i = 0; i < instrumentNames.length; i++) {
        for (let j = 0; j < sequencerRowLength; j++) {
            let step = document.getElementById(getInstrumentName(i) + "-" + j);
            stepMap.set(step.id, false);
            step.style.backgroundColor = stepColor;

        }
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
