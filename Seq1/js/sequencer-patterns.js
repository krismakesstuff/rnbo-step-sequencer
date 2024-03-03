// make random sequence
function makeRandomSequence(instName) {
    // make array of 32 random booleans
    let randomSequence = [];
    for (let i = 0; i < sequencerRowLength; i++) {
        randomSequence.push(Math.random() > 0.5);
    }

    // console log the sequence
    //console.log(instName + " random sequence: " + randomSequence);        

    // set the sequence
    for (let i = 0; i < sequencerRowLength; i++) {
        let step = document.getElementById(instName + "-" + i);
        if(randomSequence[i]) {
            stepMap.set(step.id, true);
            step.style.backgroundColor = stepActiveColor;
            //step.setAttribute("data-isStepActive", true);
        } else {
            stepMap.set(step.id, false);
            step.style.backgroundColor = stepColor;
            //step.setAttribute("data-isStepActive", false);
        }
    }
}

// make downbeat sequence
function makeDownbeatSequence(instName) {
    // set the sequence
    for (let i = 0; i < sequencerRowLength; i++) {
        let step = document.getElementById(instName + "-" + i);
        if(i % 4 === 0) {
            stepMap.set(step.id, true);
            step.style.backgroundColor = stepActiveColor;
            //step.setAttribute("data-isStepActive", true);
        } else {
            stepMap.set(step.id, false);
            step.style.backgroundColor = stepColor;
            //step.setAttribute("data-isStepActive", false);
        }
    }
}

// make Offbeat sequence
function makeOffbeatSequence(instName) {
    let sequence = [2, 6, 10, 14, 18, 22, 26, 30];

    // set the sequence
    let step;
    for (let i = 0; i < sequence.length; i++) {
        step = document.getElementById(instName + "-" + sequence[i]);
        stepMap.set(step.id, true);
        step.style.backgroundColor = stepActiveColor;
    }

    // set the rest of the sequence to inactive
    for (let i = 0; i < sequencerRowLength; i++) {
        if(!sequence.includes(i)) {
            step = document.getElementById(instName + "-" + i);
            stepMap.set(step.id, false);
            step.style.backgroundColor = stepColor;
        }
    }
}

// make 2 and 4 sequence
function make2nd4thSequence(instName) {
    let sequence = [4, 12, 20, 28];

    // set the sequence
    let step;
    for (let i = 0; i < sequence.length; i++) {
        step = document.getElementById(instName + "-" + sequence[i]);
        stepMap.set(step.id, true);
        step.style.backgroundColor = stepActiveColor;
    }

    // set the rest of the sequence to inactive
    for (let i = 0; i < sequencerRowLength; i++) {
        if(!sequence.includes(i)) {
            step = document.getElementById(instName + "-" + i);
            stepMap.set(step.id, false);
            step.style.backgroundColor = stepColor;
        }
    }
}

// make 1 and 3 sequence
function make1st3rdSequence(instName) {
    let sequence = [0, 8, 16, 24];

    // set the sequence
    let step;
    for (let i = 0; i < sequence.length; i++) {
        step = document.getElementById(instName + "-" + sequence[i]);
        stepMap.set(step.id, true);
        step.style.backgroundColor = stepActiveColor;
    }

    // set the rest of the sequence to inactive
    for (let i = 0; i < sequencerRowLength; i++) {
        if(!sequence.includes(i)) {
            step = document.getElementById(instName + "-" + i);
            stepMap.set(step.id, false);
            step.style.backgroundColor = stepColor;
        }
    }   
}

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
            //step.setAttribute("data-isStepActive", true);
        }
    }

    // put a snare on every 8th step
    for (let i = 0; i < sequencerRowLength; i++) {
        let step = document.getElementById(snare + "-" + i);
        if(i % 8 === 0) {
            stepMap.set(step.id, true);
            step.style.backgroundColor = stepActiveColor;
            //step.setAttribute("data-isStepActive", true);
        }
    }

    // put a hihat on every 2nd step
    for (let i = 0; i < sequencerRowLength; i++) {
        let step = document.getElementById(hihat + "-" + i);
        if(i % 2 === 0) {
            stepMap.set(step.id, true);
            step.style.backgroundColor = stepActiveColor;
            //step.setAttribute("data-isStepActive", true);
        }
    }

    // put a clap on every 16th step
    for(let i = 0; i < sequencerRowLength; i++) {
        let step = document.getElementById("clap" + "-" + i);
        if(i % 16 === 0) {
            stepMap.set(step.id, true);
            step.style.backgroundColor = stepActiveColor;
            //step.setAttribute("data-isStepActive", true);
        }
    }

    // put a osc1 on every 3rd step
    for(let i = 0; i < sequencerRowLength; i++) {
        let step = document.getElementById("osc1" + "-" + i);
        if(i % 3 === 0) {
            stepMap.set(step.id, true);
            step.style.backgroundColor = stepActiveColor;
            //step.setAttribute("data-isStepActive", true);
        }
    }

    // put a osc2 on every 5th step
    for(let i = 0; i < sequencerRowLength; i++) {
        let step = document.getElementById("osc2" + "-" + i);
        if(i % 5 === 0) {
            stepMap.set(step.id, true);
            step.style.backgroundColor = stepActiveColor;
            //step.setAttribute("data-isStepActive", true);
        }
    }

    // put a osc3 on every 7th step
    for(let i = 0; i < sequencerRowLength; i++) {
        let step = document.getElementById("osc3" + "-" + i);
        if(i % 7 === 0) {
            stepMap.set(step.id, true);
            step.style.backgroundColor = stepActiveColor;
            //step.setAttribute("data-isStepActive", true);
        }
    }

    // put a osc4 on every 9th step 
    for(let i = 0; i < sequencerRowLength; i++) {
        let step = document.getElementById("osc4" + "-" + i);
        if(i % 9 === 0) {
            stepMap.set(step.id, true);
            step.style.backgroundColor = stepActiveColor;
            //step.setAttribute("data-isStepActive", true);
        }
    }

}