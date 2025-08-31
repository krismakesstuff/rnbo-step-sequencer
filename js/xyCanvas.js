
// Canvas Configuration and Constants
const CanvasConfig = {
  colors: {
    playHead: "rgb(244, 185, 66)",
    yLine: '#6B9AC4',
    background: "#81B9C4",
    segment: "#F4B942",
    mouseFollow: "rgb(244, 185, 66)"
  },
  dimensions: {
    height: 200,
    widthOffset: 245
  },
  lineWeights: {
    segmentPlaying: 5,
    segment: 2
  },
  defaults: {
    rate: 1.0,
    tempo: 100,
    oscDiff: 0.1,
    filterCutoff: 8000,
    oscFreq: 100,
    oscAmp: 0.5
  }
};

// Global state
let isMouseDragging = false;

// Scaling functions
const createScales = (height) => ({
  freq: d3.scaleLinear().domain([height, 0]).range([50, 1000]),
  amp: d3.scaleLinear().domain([height, 0]).range([0.0, 1.0]),
  filter: d3.scaleLinear().domain([height, 0]).range([20, 10000]),
  diff: d3.scaleLinear().domain([height, 0]).range([0.0, 0.3]),
  rate: d3.scaleLinear().domain([height, 0]).range([0.0, 3.0]).clamp(true),
  tempo: d3.scaleLinear().domain([height, 0]).range([1, 300])
});

const scales = createScales(CanvasConfig.dimensions.height);



// Utility functions for segments
function getHighestY(segments) {
  let highestY = 0;
  for (let i = 0; i < segments.length; i++) {
    let seg = segments[i];
    if (seg.startY > highestY) {
      highestY = seg.startY;
    }
  }
  return highestY;
}

function getLowestY(segments) {
  let lowestY = CanvasConfig.dimensions.height;
  for (let i = 0; i < segments.length; i++) {
    let seg = segments[i];
    if (seg.startY < lowestY) {
      lowestY = seg.startY;
    }
  }
  return lowestY;
}

function findStartXIndex(segments, x) {
  for (let i = 0; i < segments.length; i++) {
    let seg = segments[i];
    if (seg.startX > x && seg.endX < x) {
      return i;
    }
    if (seg.startX < x && seg.endX > x) {
      return i;
    }
  }
  return -1;
}

class Segment {
  constructor(startX, startY, endX, endY) {
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
  }

  get xAverage() {
    return (this.startX + this.endX) / 2;
  }

  get yAverage() {
    return (this.startY + this.endY) / 2;
  }
}

// Event handlers
function clearCanvas() {
  console.log(this.id + " called clearCanvas");
  const canvasId = this.id.replace('-clearCanvasButton', '');
  const canvas = canvasRegistry.get(canvasId);
  if (canvas) {
    canvas.clearSegments();
  } else {
    console.log("No canvas found for clear: " + this.id);
  }
}

function canvasOptionChanged() {
  const selectedParam = this.options[this.selectedIndex].value;
  console.log(this.id + " chose: " + selectedParam);

  const canvasId = this.id.replace('-select-params', '');
  const canvas = canvasRegistry.get(canvasId);
  if (canvas) {
    canvas.setCanvasParameter(selectedParam);
    console.log(`${canvasId}.currentParameter: ${canvas.getCurrentCanvasParameter()}`);
  } else {
    console.log("No canvas found for select: " + this.id);
  }
}

function updateCanvasOptions() {
  console.log("updateCanvasOptions called");

  // Get all canvas parameters
  const canvasParams = Array.from(canvasRegistry.values()).map(canvas =>
    canvas.getCurrentCanvasParameter()
  );

  const allFreqSelected = canvasParams.some(param => param === "All Osc Freqs");
  const allFreqDiffSelected = canvasParams.some(param => param === "All Osc Diffs");
  const allGainSelected = canvasParams.some(param => param === "All Osc Gains");

  for (let i = 0; i < this.options.length; i++) {
    let option = this.options[i];
    if (canvasParams.includes(option.value) ||
        (allFreqSelected && option.value.includes("Freq")) ||
        (allFreqDiffSelected && option.value.includes("Diff")) ||
        (allGainSelected && option.value.includes("Gain"))) {
      option.disabled = true;
      console.log("Option disabled: " + option.value);
    } else {
      option.disabled = false;
      console.log("Option enabled: " + option.value);
    }
  }
}

// Available parameters for canvas control
const paramsControlRadioGroup = new Map([
  ["Choose Param...", false],
  ["Sample Play Rate", false],
  ["Tempo", false],
  ["Osc Filter Cutoff", false],
  ["Osc1 Freq", false],
  ["Osc2 Freq", false],
  ["Osc3 Freq", false],
  ["Osc4 Freq", false],
  ["All Osc Freqs", false],
  ["Osc1 Diff", false],
  ["Osc2 Diff", false],
  ["Osc3 Diff", false],
  ["Osc4 Diff", false],
  ["All Osc Diffs", false],
  ["Osc1 Gain", false],
  ["Osc2 Gain", false],
  ["Osc3 Gain", false],
  ["Osc4 Gain", false],
  ["All Osc Gains", false]
]);

// Canvas registry to keep track of all canvases
const canvasRegistry = new Map();



// Parameter update functions
function updateParameterFromCanvas(selectedParam, segmentY, defaults = false) {
  const getValue = (scale, defaultValue) => defaults ? defaultValue : scale(segmentY);
  const getInvertedY = (scale, defaultValue) => defaults ? scale.invert(defaultValue) : segmentY;

  switch (selectedParam) {
    case "Sample Play Rate":
      const rateValue = getValue(scales.rate, CanvasConfig.defaults.rate);
      setRateSliderValue(rateValue);
      return getInvertedY(scales.rate, CanvasConfig.defaults.rate);

    case "Tempo":
      const tempoValue = getValue(scales.tempo, CanvasConfig.defaults.tempo);
      setTempoSliderValue(tempoValue);
      return getInvertedY(scales.tempo, CanvasConfig.defaults.tempo);

    case "Osc Filter Cutoff":
      const filterValue = getValue(scales.filter, CanvasConfig.defaults.filterCutoff);
      updateParameter(filterValue, 'osc-filter-cutoff', document.getElementById('osc-filter-cutoff-slider-slider'));
      updateParameter(filterValue, 'osc-filter-cutoff', document.getElementById('osc-filter-cutoff-slider-number'));
      return getInvertedY(scales.filter, CanvasConfig.defaults.filterCutoff);

    case "Osc1 Freq":
    case "Osc2 Freq":
    case "Osc3 Freq":
    case "Osc4 Freq":
      const oscNum = selectedParam.match(/Osc(\d+)/)[1];
      const freqValue = getValue(scales.freq, CanvasConfig.defaults.oscFreq);
      updateParameter(freqValue, `osc${oscNum}-freq`, document.getElementById(`osc${oscNum}-freq-slider-slider`));
      updateParameter(freqValue, `osc${oscNum}-freq`, document.getElementById(`osc${oscNum}-freq-slider-number`));
      return getInvertedY(scales.freq, CanvasConfig.defaults.oscFreq);

    case "All Osc Freqs":
      const allFreqValue = getValue(scales.freq, CanvasConfig.defaults.oscFreq);
      for (let i = 1; i <= 4; i++) {
        updateParameter(allFreqValue, `osc${i}-freq`, document.getElementById(`osc${i}-freq-slider-slider`));
        updateParameter(allFreqValue, `osc${i}-freq`, document.getElementById(`osc${i}-freq-slider-number`));
      }
      return getInvertedY(scales.freq, CanvasConfig.defaults.oscFreq);

    case "Osc1 Diff":
    case "Osc2 Diff":
    case "Osc3 Diff":
    case "Osc4 Diff":
      const diffOscNum = selectedParam.match(/Osc(\d+)/)[1];
      const diffValue = getValue(scales.diff, CanvasConfig.defaults.oscDiff);
      updateParameter(diffValue, `osc${diffOscNum}-freq-diff`, document.getElementById(`osc${diffOscNum}-freq-diff-slider-slider`));
      updateParameter(diffValue, `osc${diffOscNum}-freq-diff`, document.getElementById(`osc${diffOscNum}-freq-diff-slider-number`));
      return getInvertedY(scales.diff, CanvasConfig.defaults.oscDiff);

    case "All Osc Diffs":
      const allDiffValue = getValue(scales.diff, CanvasConfig.defaults.oscDiff);
      for (let i = 1; i <= 4; i++) {
        updateParameter(allDiffValue, `osc${i}-freq-diff`, document.getElementById(`osc${i}-freq-diff-slider-slider`));
        updateParameter(allDiffValue, `osc${i}-freq-diff`, document.getElementById(`osc${i}-freq-diff-slider-number`));
      }
      return getInvertedY(scales.diff, CanvasConfig.defaults.oscDiff);

    case "Osc1 Gain":
    case "Osc2 Gain":
    case "Osc3 Gain":
    case "Osc4 Gain":
      const gainOscNum = selectedParam.match(/Osc(\d+)/)[1];
      const gainValue = getValue(scales.amp, CanvasConfig.defaults.oscAmp);
      updateInstGain(gainValue, `osc${gainOscNum}`);
      return getInvertedY(scales.amp, CanvasConfig.defaults.oscAmp);

    case "All Osc Gains":
      const allGainValue = getValue(scales.amp, CanvasConfig.defaults.oscAmp);
      for (let i = 1; i <= 4; i++) {
        updateInstGain(allGainValue, `osc${i}`);
      }
      return getInvertedY(scales.amp, CanvasConfig.defaults.oscAmp);

    default:
      return CanvasConfig.dimensions.height / 2;
  }
}

// Canvas UI creation function
function createCanvasOptions(canvasId, wrapperId) {
  const canvasWrapper = document.getElementById(wrapperId);

  const canvasOptionsEl = document.createElement("div");
  canvasOptionsEl.id = `${canvasId}-options`;
  canvasOptionsEl.setAttribute("class", "canvas-options");

  // const selectLabel = document.createElement("div");
  // selectLabel.setAttribute("id", "canvas-select-params-title");
  // selectLabel.innerHTML = "Parameter to Control: ";
  // canvasOptionsEl.appendChild(selectLabel);

  const selectDiv = document.createElement("div");
  selectDiv.setAttribute("class", "custom-canvas-select");
  canvasOptionsEl.appendChild(selectDiv);

  const selectParams = document.createElement("select");
  selectParams.id = `${canvasId}-select-params`;
  selectParams.name = "canvas-select-params";

  paramsControlRadioGroup.forEach((value, key) => {
    const option = document.createElement("option");
    option.value = key;
    option.text = key;
    selectParams.appendChild(option);
    if (option.value === "Choose Param...") {
      option.selected = true;
    }
  });

  selectParams.addEventListener("click", updateCanvasOptions);
  selectParams.addEventListener("change", canvasOptionChanged);
  selectDiv.appendChild(selectParams);

  const clearButton = document.createElement("button");
  clearButton.setAttribute('class', 'clearCanvasButton');
  clearButton.id = `${canvasId}-clearCanvasButton`;
  clearButton.innerHTML = "Clear Canvas";
  clearButton.addEventListener("click", clearCanvas);
  canvasOptionsEl.appendChild(clearButton);

  const p5Canvas = document.getElementById(canvasId);
  canvasWrapper.insertBefore(canvasOptionsEl, p5Canvas);
}



// Canvas Factory Function
function createCanvasSketch(canvasId) {
  return function(p) {
    let currentParameter = "Choose Param...";
    let shouldClearSegments = false;
    let segments = [];

    // Public methods for external access
    p.setCanvasParameter = function(newParam) {
      currentParameter = newParam;
    };

    p.getCurrentCanvasParameter = function() {
      return currentParameter;
    };

    p.clearSegments = function() {
      segments = [];
      shouldClearSegments = false;
    };

    // Private methods
    const hitTest = function(x, y) {
      return (x >= 0 && x <= p.width && y >= 0 && y <= CanvasConfig.dimensions.height);
    };

    function getSegmentYFromX(x) {
      if (segments.length === 0) {
        return 0;
      }

      const index = findStartXIndex(segments, x);
      if (index > -1) {
        return segments[index].startY;
      } else {
        return 0;
      }
    }

    let canvasPadding = 0.84;

    // p5.js lifecycle methods
    p.windowResized = function() {

      p.resizeCanvas(window.innerWidth * canvasPadding, CanvasConfig.dimensions.height);
    };

    p.setup = function() {
      p.createCanvas(window.innerWidth * canvasPadding, CanvasConfig.dimensions.height);
      p.frameRate(25);
    };

    p.draw = function() {
      p.clear();
      p.background(CanvasConfig.colors.background);

      let circleW = 10;
      const playing = isPlaying();

      // Draw playhead and handle parameter updates
      if (playing) {
        const playheadX = stepToX(p.width) + 30;
        p.stroke(CanvasConfig.colors.playHead);
        p.strokeWeight(4);
        p.line(playheadX, 0, playheadX, CanvasConfig.dimensions.height);

        const segmentY = getSegmentYFromX(playheadX);

        // Handle parameter updates based on segments
        if (segments.length === 0 || segmentY <= 1 || segmentY >= p.height) {
          // No segments or playhead outside canvas - use defaults
          const y = updateParameterFromCanvas(currentParameter, 0, true);

          // Draw horizontal line at default position
          p.stroke(CanvasConfig.colors.yLine);
          p.strokeWeight(2);
          p.line(0, y, p.width - CanvasConfig.dimensions.widthOffset, y);
        } else {
          // Update parameters based on segment position
          updateParameterFromCanvas(currentParameter, segmentY, false);

          // Draw horizontal line at segment position
          p.stroke(CanvasConfig.colors.yLine);
          p.strokeWeight(2);
          p.line(0, segmentY, p.width - CanvasConfig.dimensions.widthOffset, segmentY);
        }

        if (p.mouseIsPressed) {
          circleW = 20;
        } else {
          p.fill(CanvasConfig.colors.mouseFollow);
        }
      }

      // Draw mouse follow
      p.line(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY);
      p.ellipse(p.mouseX, p.mouseY, circleW, circleW);

      // Set line weight based on playing state
      if (playing) {
        p.strokeWeight(CanvasConfig.lineWeights.segmentPlaying);
      } else {
        p.strokeWeight(CanvasConfig.lineWeights.segment);
      }

      // Draw all segments
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        p.stroke(CanvasConfig.colors.segment);
        p.line(seg.startX, seg.startY, seg.endX, seg.endY);
      }
    };

    // Mouse event handlers
    p.mousePressed = function() {
      if (hitTest(p.mouseX, p.mouseY)) {
        isMouseDragging = true;
        segments = []; // Clear all segments
        segments.push(new Segment(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY));
      }
    };

    p.mouseDragged = function() {
      if (isMouseDragging) {
        segments.push(new Segment(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY));
      }
    };

    p.mouseReleased = function() {
      if (isMouseDragging) {
        isMouseDragging = false;
      }
    };

    // Timer for cleanup
    function timerCallback(elapsed) {
      if (shouldClearSegments) {
        segments = [];
        shouldClearSegments = false;
        console.log("Segments cleared");
      }
    }

    d3.interval(timerCallback, 30);
  };
}

// Factory function to create a new canvas instance
function createCanvas(canvasId, containerId, wrapperId) {
  // Create the UI options for this canvas
  createCanvasOptions(canvasId, wrapperId);

  // Create the p5 canvas instance
  const sketch = createCanvasSketch(canvasId);
  const canvasInstance = new p5(sketch, document.getElementById(containerId));

  // Register the canvas for global access
  canvasRegistry.set(canvasId, canvasInstance);

  return canvasInstance;
}

// Function to initialize canvases based on app.js canvasConfigs
function initializeCanvases() {
  // Check if canvasConfigs is available from app.js
  if (typeof window !== 'undefined' && window.canvasConfigs) {
    console.log('Initializing canvases with configs:', window.canvasConfigs);
    window.canvasConfigs.forEach(config => {
      // Ensure the DOM elements exist before creating canvas
      const wrapperElement = document.getElementById(config.wrapperId);
      const canvasElement = document.getElementById(config.canvasId);

      if (wrapperElement && canvasElement) {
        createCanvas(config.canvasId, config.canvasId, config.wrapperId);
        console.log(`Canvas created: ${config.canvasId}`);
      } else {
        console.warn(`Canvas elements not found for ${config.canvasId}`);
      }
    });
  } else {
    console.warn('canvasConfigs not found. Canvas initialization delayed.');
  }
}

// Check for canvasConfigs and initialize when ready
function checkAndInitialize() {
  if (window.canvasConfigs && document.getElementById('canvas-container')) {
    console.log('Conditions met, initializing canvases...');
    initializeCanvases();
    return true;
  }
  return false;
}

// Try to initialize immediately (in case app.js already ran)
if (!checkAndInitialize()) {
  // If not ready, set up a polling mechanism
  console.log('Canvas initialization waiting for canvasConfigs...');
  const initInterval = setInterval(() => {
    if (checkAndInitialize()) {
      clearInterval(initInterval);
    }
  }, 50);

  // Also clear interval after reasonable timeout
  setTimeout(() => {
    clearInterval(initInterval);
    console.warn('Canvas initialization timed out');
  }, 5000);
}

// Utility function to easily add more canvases
function addNewCanvas(canvasId, containerId, wrapperId) {
  return createCanvas(canvasId, containerId, wrapperId);
}

// Export canvas management functions for external use
window.CanvasFactory = {
  createCanvas: createCanvas,
  addNewCanvas: addNewCanvas,
  initializeCanvases: initializeCanvases,
  getCanvas: (canvasId) => canvasRegistry.get(canvasId),
  getAllCanvases: () => Array.from(canvasRegistry.values()),
  removeCanvas: (canvasId) => {
    const canvas = canvasRegistry.get(canvasId);
    if (canvas) {
      canvas.remove();
      canvasRegistry.delete(canvasId);
    }
  }
};

