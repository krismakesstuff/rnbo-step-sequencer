
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

let presetPatterns = ["default", "random", "downbeat", "offbeat", "2nd&4th", "1st&3rd", "clear"];

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

// create step grid
function createStepGrid() {

    // get sequencer-wrapper from DOM
    let sequencerWrapper = document.getElementById("sequencer-wrapper");

    // create labels for each step
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

        // make a div contianer for the pattern select so we can custom syle
        let patternDiv = document.createElement("div");
        patternDiv.setAttribute("class", "custom-pattern-select");
        controls.appendChild(patternDiv);

        // make a select element for each instrument that will have preset beat patterns
        let patternSelect = document.createElement("select");
        patternSelect.setAttribute("class", "inst-pattern-select");
        patternSelect.setAttribute("id", "pattern-select-" + getInstrumentName(i));

        // make options for the select
        for(let j = 0; j < presetPatterns.length; j++) {
            let option = document.createElement("option");
            option.value = presetPatterns[j];
            option.innerHTML = presetPatterns[j];
            patternSelect.appendChild(option);
        }

        patternSelect.setAttribute("oninput", "changePattern(this.value, '" + getInstrumentName(i) + "')");
        patternDiv.appendChild(patternSelect);

        // make a slider for each instrument
        let slider = document.createElement("input");
        slider.setAttribute("type", "range");
        slider.setAttribute("class", "inst-gain-slider");
        slider.setAttribute("id", "slider-" + getInstrumentName(i));
        slider.setAttribute("min", "0");
        slider.setAttribute("max", "1");
        slider.setAttribute("value", "0.5");
        slider.setAttribute("step", "0.01");
        // slider.setAttribute("oninput", "updateInst"+getInstrumentName(i)+"Gain(this.value)");
        slider.setAttribute("oninput", "updateInstGain(this.value, '" + getInstrumentName(i) + "')");
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
            step.addEventListener("mousedown", stepClicked);
            step.addEventListener("mouseover", stepMouseOver);

            seqRow.appendChild(step);

            stepMap.set(step.id, false);
        }
    }
}

let suffixMs = 'ms';
let suffixHz = 'Hz';
let suffixBPM = 'BPM';
let suffixMult = 'x';

// create OSC controls
function createOscControls() {
    // get osc-controls container from DOM
    let oscControls = document.getElementById("osc-controls");

    // Define OSC control configurations
    const oscControlConfigs = [
        {
            id: "attackSlider",
            label: "attack",
            value: "10",
            min: "1",
            max: "200",
            step: "0.01",
            paramId: "note-attack",
            suffix: suffixMs
        },
        {
            id: "decaySlider",
            label: "decay",
            value: "10",
            min: "1",
            max: "200",
            step: "0.01",
            paramId: "note-decay",
            suffix: suffixMs
        },
        {
          id: "sustainSlider",
          label: "sustain",
          value: "0.5",
          min: "0",
          max: "1.0",
          step: "0.01",
          paramId: "note-sustain",
          suffix: suffixMult
        },
        {
          id: "releaseSlider",
          label: "release",
          value: "200",
          min: "1",
          max: "1000",
          step: "0.01",
          paramId: "note-release",
          suffix: suffixMs
        },
        {
            id: "noteLengthSlider",
            label: "note length",
            value: "150",
            min: "2",
            max: "200",
            step: "0.01",
            paramId: "note-length",
            suffix: suffixMs
        },
        {
            id: "osc1-freq-slider",
            label: "osc1 freq",
            value: "100",
            min: "50",
            max: "1000",
            step: "1",
            paramId: "osc1-freq",
            suffix: suffixHz
        },
        {
            id: "osc2-freq-slider",
            label: "osc2 freq",
            value: "100",
            min: "50",
            max: "1000",
            step: "1",
            paramId: "osc2-freq",
            suffix: suffixHz
        },
        {
            id: "osc3-freq-slider",
            label: "osc3 freq",
            value: "100",
            min: "50",
            max: "1000",
            step: "1",
            paramId: "osc3-freq",
            suffix: suffixHz
        },
        {
            id: "osc4-freq-slider",
            label: "osc4 freq",
            value: "100",
            min: "50",
            max: "1000",
            step: "1",
            paramId: "osc4-freq",
            suffix: suffixHz
        },
        {
            id: "osc-filter-cutoff-slider",
            label: "filter cutoff",
            value: "8000",
            min: "20",
            max: "10000",
            step: "1",
            paramId: "osc-filter-cutoff",
            suffix: suffixHz
        },
        {
            id: "osc1-freq-diff-slider",
            label: "osc1 freq diff",
            value: "0.1",
            min: "0",
            max: "0.3",
            step: "0.01",
            paramId: "osc1-freq-diff",
            suffix: suffixMult
        },
        {
            id: "osc2-freq-diff-slider",
            label: "osc2 freq diff",
            value: "0.1",
            min: "0",
            max: "0.3",
            step: "0.01",
            paramId: "osc2-freq-diff",
            suffix: suffixMult
        },
        {
            id: "osc3-freq-diff-slider",
            label: "osc3 freq diff",
            value: "0.1",
            min: "0",
            max: "0.3",
            step: "0.01",
            paramId: "osc3-freq-diff",
            suffix: suffixMult
        },
        {
            id: "osc4-freq-diff-slider",
            label: "osc4 freq diff",
            value: "0.1",
            min: "0",
            max: "0.3",
            step: "0.01",
            paramId: "osc4-freq-diff",
            suffix: suffixMult
        }
    ];

    // Create each control dynamically
    oscControlConfigs.forEach(config => {
        // Create container div
        let controlDiv = document.createElement("div");
        controlDiv.setAttribute("class", "osc-control");
        oscControls.appendChild(controlDiv);

        // Create label container
        let labelContainer = document.createElement("div");
        labelContainer.setAttribute("class", "osc-control-label-container");
        controlDiv.appendChild(labelContainer);

        // Create label
        let label = document.createElement("div");
        label.setAttribute("id", config.id);
        label.innerHTML = config.label;
        labelContainer.appendChild(label);

        // Create number input
        let numberInput = document.createElement("input");
        numberInput.setAttribute("type", "number");
        numberInput.setAttribute("class", "osc-number-input");
        numberInput.setAttribute("id", config.id + "-number");
        numberInput.setAttribute("value", config.value);
        numberInput.setAttribute("min", config.min);
        numberInput.setAttribute("max", config.max);
        numberInput.setAttribute("step", config.step);
        labelContainer.appendChild(numberInput);

        // Create suffix
        // let suffix = document.createElement("div");
        // suffix.setAttribute("class", "osc-control-suffix");
        // suffix.innerHTML = config.suffix;
        // labelContainer.appendChild(suffix);

        // Create slider
        let slider = document.createElement("input");
        slider.setAttribute("type", "range");
        slider.setAttribute("class", "osc-slider");
        slider.setAttribute("id", config.id + "-slider");
        slider.setAttribute("value", config.value);
        slider.setAttribute("min", config.min);
        slider.setAttribute("max", config.max);
        slider.setAttribute("step", config.step);

        // Set the oninput callback dynamically to use updateParameter and update other UI element
        numberInput.setAttribute("oninput", `updateParameter(this.value, '${config.paramId}', document.getElementById('${config.id}-slider'))`);
        slider.setAttribute("oninput", `updateParameter(this.value, '${config.paramId}', document.getElementById('${config.id}-number'))`);

        controlDiv.appendChild(slider);
    });
}

// create canvas containers dynamically
function createCanvasContainers() {
    // get the main canvas container
    let canvasContainer = document.getElementById("canvas-container");

    // Define canvas configurations
    const canvasConfigs = [
        {
            wrapperId: "kick-canvas-wrapper",
            canvasId: "kick-canvas"
        },
        {
            wrapperId: "snare-canvas-wrapper",
            canvasId: "snare-canvas"
        },
        {
            wrapperId: "hihat-canvas-wrapper",
            canvasId: "hihat-canvas"
        }
    ];

    // Make canvasConfigs globally available for xyCanvas.js
    window.canvasConfigs = canvasConfigs;

    // Create each canvas container
    canvasConfigs.forEach(config => {
        // Create wrapper div
        let wrapper = document.createElement("div");
        wrapper.setAttribute("id", config.wrapperId);
        wrapper.setAttribute("class", "canvas-wrapper");
        canvasContainer.appendChild(wrapper);

        // Create canvas div inside wrapper
        let canvasDiv = document.createElement("div");
        canvasDiv.setAttribute("id", config.canvasId);

        // Add comment for clarity
        let comment = document.createComment(" p5 will insert a canvas here ");
        canvasDiv.appendChild(comment);

        wrapper.appendChild(canvasDiv);
    });
}
// Function to set up sequencer control event listeners
function setupSequencerControlEventListeners() {
    // Rate control - number input and slider
    const rateInput = document.getElementById("rateInput");
    const rateSlider = document.getElementById("rateSlider");
    rateInput.addEventListener("input", () => updateRate(rateInput.value, rateSlider));
    rateSlider.addEventListener("input", () => updateRate(rateSlider.value, rateInput));

    // Tempo control - number input and slider
    const tempoInput = document.getElementById("tempoInput");
    const tempoSlider = document.getElementById("tempoSlider");
    tempoInput.addEventListener("input", () => updateTempo(tempoInput.value, tempoSlider));
    tempoSlider.addEventListener("input", () => updateTempo(tempoSlider.value, tempoInput));

    // Direction select
    const directionSelect = document.getElementById("direction-select");
    directionSelect.addEventListener("change", () => changeDirection(directionSelect.value));

    // Output gain - number input and slider
    const outGainInput = document.getElementById("out-gain-input");
    const outGainSlider = document.getElementById("out-gain");
    outGainInput.addEventListener("input", () => updateOutGain(outGainInput.value, outGainSlider));
    outGainSlider.addEventListener("input", () => updateOutGain(outGainSlider.value, outGainInput));

    // Play button
    const playButton = document.getElementById("playButton");
    playButton.addEventListener("click", () => togglePlay(playButton));

    // Clear sequencer button
    const clearButton = document.getElementById("clearSequencerButton");
    clearButton.addEventListener("click", () => clearSequencer());
}





createStepGrid();
createOscControls();
createCanvasContainers();
setupSequencerControlEventListeners();

// Canvas initialization will happen automatically via xyCanvas.js



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
        sendStepToDevice();
        setPlayhead();
        currentStep = newBeat;
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
        let active = stepMap.get(inst + "-" + (currentStep ));
        if(active === true) {
            noteOn(device, context, instrumentNoteMap.get(inst), 100);
            console.log("note on: " + inst + " " + (currentStep + 1));
        }

    }
}

// rate slider callback
function updateRate(newRate, uiElement = null) {
    if (device) {
        context.resume();
        const rateParam = device.parametersById.get("rate");
        rateParam.value = newRate;
        console.log("rate: " + newRate);

        // Update the UI if necessary
        if (uiElement) {
            uiElement.value = newRate;
        }
    }
}

// tempo slider callback
function updateTempo(newTempo, uiElement = null) {
    if (device) {
        context.resume();
        const tempoParam = device.parametersById.get("tempo");
        tempoParam.value = newTempo;
        console.log("tempo: " + newTempo);

        // Update the UI if necessary
        if (uiElement) {
            uiElement.value = newTempo;
        }
    }
}

// inst gain slider callbacks
function updateInstGain(newGain, instId) {
    if (device) {
        context.resume();
        const gainParam = device.parametersById.get(instId + "-gain");
        gainParam.value = newGain;
        console.log(instId + " gain: " + newGain);
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
function changePattern(newPattern, instId) {
  clearInstrumentRow(instId);
  if(newPattern === "default") {
      //makeDefaultSequence(instId);
  } else if(newPattern === "random") {
      makeRandomSequence(instId);
  } else if(newPattern === "downbeat") {
      makeDownbeatSequence(instId);
  } else if(newPattern === "offbeat") {
      makeOffbeatSequence(instId);
  } else if(newPattern === "2nd&4th") {
      make2nd4thSequence(instId);
  } else if(newPattern === "1st&3rd") {
      make1st3rdSequence(instId);
  }
}

// Update the parameter value
function updateParameter(newValue, paramId, uiElement = null) {
    if (device) {
        context.resume();
        const param = device.parametersById.get(paramId);
        param.value = newValue;
        console.log(paramId + ": " + newValue);

        // Update the UI if necessary
        if (uiElement) {
            uiElement.value = newValue;
        }

    }
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

        //console.log("playstate button changed to: " + playParam.value);
    }
}

// out gain slider callback
function updateOutGain(newGain, uiElement = null) {
    if (device) {
        context.resume();
        const outGainParam = device.parametersById.get("out-gain");
        outGainParam.value = newGain;
        console.log("out gain: " + newGain);

        // Update the UI if necessary
        if (uiElement) {
            uiElement.value = newGain;
        }
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
    let rateInput = document.getElementById("rateInput");

    rateSlider.value = newRate;
    rateInput.value = newRate;
    updateRate(newRate);
    //console.log("rate slider value set: " + newRate);
}

function setTempoSliderValue(newTempo){
    let tempoSlider = document.getElementById("tempoSlider");
    let tempoInput = document.getElementById("tempoInput");

    tempoSlider.value = newTempo;
    tempoInput.value = newTempo;
    updateTempo(newTempo);
    //console.log("tempo slider value set: " + newTempo);
}

// Generic function to update any slider and its corresponding parameter
function updateSliderAndParameter(sliderId, paramId, value) {
    const slider = document.getElementById(sliderId);
    const numberInput = document.getElementById(sliderId.replace('-slider', '-number'));

    if (slider) {
        slider.value = value;
    }
    if (numberInput) {
        numberInput.value = value;
    }

    updateParameter(value, paramId);
}

// Set default values for all sliders (called on page load)
function setSliderDefaults() {
    // This function can be used to set initial values if needed
    // Currently, defaults are set in the HTML and oscControlConfigs
    console.log("Slider defaults set");
}


