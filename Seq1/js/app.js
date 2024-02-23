

const patchExportURL = "export/stepSeq.export.json";
let device, context;

// create playbutton and add event listener
// function createPlayButton(){
//     const playButton = document.createElement("button");
//     playButton.setAttribute("id", "playButton");
    
//     playButton.innerHTML = "Play";
//     playButton.addEventListener("click", togglePlay);
//     document.body.appendChild(playButton);
// }

// createPlayButton();


// colors 
let mouseOverColor = 'rgb(212, 95, 95)';
let mouseOutColor = 'rgb(0, 0, 50)';

let mouseOverWidth = 50;
let mouseOutWidth = 35;

let currentColor = mouseOverColor;
let currentWidth = 0;

let sequencerRowLength = 16;
let numInstrumentRows = 4;
const stepArray = [];

let currentStep = 0;


let instrumentNames = ["kick", "snare", "hihat", "clap"];

function getInstrumentName(index) {
    return instrumentNames[index];
}

// create button grid. each button represents a step in the sequencer
// there should be 16 buttons in a row and 4 rows
function createButtonGrid() {
    // get sequencer-wrapper from DOM
    let sequencerWrapper = document.getElementById("sequencer-wrapper");    

    for (let i = 0; i < numInstrumentRows; i++) {
        let row = document.createElement("div");
        row.setAttribute("class", "sequencer-row");
        row.setAttribute("id", "row" + getInstrumentName(i));
        sequencerWrapper.appendChild(row);

        for (let j = 0; j < sequencerRowLength; j++) {
            let checkbox = document.createElement("input");
            checkbox.setAttribute("type", "checkbox");
            checkbox.setAttribute("class", "step-checkbox");
            checkbox.setAttribute("id", getInstrumentName(i) + "-" + j);
            checkbox.addEventListener("change", function() {
                if(this.checked) {
                    this.style.backgroundColor = 'rgb(212, 95, 95)';
                } else {
                    this.style.backgroundColor = 'rgb(0, 0, 50)';
                }
                console.log(this.id + "  changed to: " + this.checked);
            });

            //     // if (device) {
            //     //     context.resume();
            //     //     const stepParam = device.parametersById.get("step" + i + j);
            //     //     stepParam.value = !stepParam.value;
            //     //     console.log("step" + i + j + " changed to: " + stepParam.value);
            //     // }
            //     console.log("clicked button" + i + j);
            // });
            row.appendChild(checkbox);
            stepArray.push(checkbox);
        }
        
    }
}

createButtonGrid();


async function setupRNBO() {
    [device, context] = await createRNBODevice(patchExportURL);
    console.log("RNBO Device Created");

    // device.messageEvent.suscribe((event) => {
    //     if(event.tag === "play") {
    //         console.log("play-from RNBO event");
    //     }
    //     if(event.tag === "stop") {
    //         console.log("stop-from RNBO event");
    //     }
    // });

    
    if(device) {
        console.log("Device found");
        device.parameters.forEach((parameter) => {
            console.log(parameter.id);
            console.log(parameter.name);
            console.log(parameter.value);
        });
        
        const playstateParam = device.parametersById.get("playstate");
        playstateParam.changeEvent.subscribe((newPlayState) => {
            console.log("playstate changed event, state: " + newPlayState);
        });
    } else{
        console.log("Device not found");
    
    }


}

// We can't await here because it's top level, so we have to check later
// if device and context have been assigned
setupRNBO();



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


