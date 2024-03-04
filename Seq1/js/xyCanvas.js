
let playHeadColor = "rgb(244, 185, 66)";
let yLineColor = '#6B9AC4';
let canvasBGColor = "#81B9C4";
let segmentColor = "#F4B942";
let mouseFollowColor = "rgb(244, 185, 66)";

let isMouseDragging = false;

let defaultRate = 1.0;
let defaultTempo = 100;
let defaultOscDiff = 0.1;
let defaultFilterCutoff = 10000;
let defaultOscFreq = 100;
let defaultOscAmp = 0.5;

let segmentPlayingLineSize = 5;
let segmentLineSize = 2;

//let canvasWidthOffset = 350;
let canvasWidthOffset = 245;

class DefaultCanvas {
  constructor() {
    this.width = 785;
    this.height = 200;
  }
}

let defaultCanvas = new DefaultCanvas();


function getHighestY(segments){
  let highestY = 0;
  for(let i = 0; i < segments.length; i++){
    let seg = segments[i];
    if(seg.startY > highestY){
      highestY = seg.startY;
    }
  }
  return highestY;
}

function getLowestY(segments){
  let lowestY = defaultCanvas.height;
  for(let i = 0; i < segments.length; i++){
    let seg = segments[i];
    if(seg.startY < lowestY){
      lowestY = seg.startY;
    }
  }
  return lowestY;
}

function findStartXIndex(segments, x){
  for(let i = 0; i < segments.length; i++){
    let seg = segments[i];
    if(seg.startX > x && seg.endX < x){
      return i;
    }
    if(seg.startX < x && seg.endX > x){
      return i;
    }
  }
  return -1;
}

function clearSegments(segments){
  segments = [];
}

class Segment {
  constructor(startX, startY, endX, endY) {
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
  }


  get xAverage(){
    return (this.startX + this.endX) / 2;
  }

  get yAverage(){
    return (this.startY + this.endY) / 2;
  }
}

// clearCanvas button callback
function clearCanvas() {
  console.log(this.id + " called clearCanvas");  

  if(this.id === "p5-canvas-clearCanvasButton"){
    canvas1.clearSegments();
  } else if(this.id === "osc1-canvas-clearCanvasButton"){
    canvas2.clearSegments();
  } else {
    console.log("No canvas found or already selected - for clear: " + this.id); 
  }
}

// canvas parameter select callback
function canvasOptionChanged(){
  
  let selectedParam = this.options[this.selectedIndex].value;
  console.log(this.id + " chose: " + selectedParam);
  
  // this should never be called unless something is wrong in UpdateCanvasOptions callback
  // if(selectedParam === canvas1.currentParameter || selectedParam === canvas2.currentParameter){
  //   alert("Already selected: " + selectedParam);
  //   console.log("Already selected: " + selectedParam);
  //   return;
  // }
 
  if(this.id === "p5-canvas-select-params"){
    canvas1.setCanvasParameter(selectedParam);
    console.log("canvas1.currentParameter: " + canvas1.currentParameter);
  } else if(this.id === "osc1-canvas-select-params"){
    canvas2.setCanvasParameter(selectedParam);
    console.log("canvas2.currentParameter: " + canvas2.currentParameter);
  } else {
    console.log("No canvas found or already selected - for select: " + this.id);
  }
  
}

// called as the select is clicked so we can disable in-use parameters
function updateCanvasOptions(){
  console.log("updateCanvasOptions called");

  let canvas1Param = canvas1.getCurrentCanvasParameter();
  let canvas2Param = canvas2.getCurrentCanvasParameter();

  let allFreqSelected = canvas1Param === "All Osc Freqs" || canvas2Param === "All Osc Freqs";
  let allFreqDiffSelected = canvas1Param === "All Osc Diffs" || canvas2Param === "All Osc Diffs";
  let allGainSelected = canvas1Param === "All Osc Gains" || canvas2Param === "All Osc Gains";


  for(let i = 0; i < this.options.length; i++){
    let option = this.options[i];
    if(option.value === canvas1Param || option.value === canvas2Param 
      || (allFreqSelected && option.value.includes("Freq")) || (allFreqDiffSelected && option.value.includes("Diff"))
      || (allGainSelected && option.value.includes("Gain"))){
      option.disabled = true;
      console.log("Option disabled: " + option.value);
    } else {
      option.disabled = false;
      console.log("Option enabled: " + option.value);
    }
    }
}

var paramsControlRadioGroup = new Map();
paramsControlRadioGroup.set("Choose Param...", false);
paramsControlRadioGroup.set("Sample Play Rate", false);
paramsControlRadioGroup.set("Tempo", false);
paramsControlRadioGroup.set("Osc Filter Cutoff", false);
paramsControlRadioGroup.set("Osc1 Freq", false);
paramsControlRadioGroup.set("Osc2 Freq", false);
paramsControlRadioGroup.set("Osc3 Freq", false);
paramsControlRadioGroup.set("Osc4 Freq", false);  
paramsControlRadioGroup.set("All Osc Freqs", false);
paramsControlRadioGroup.set("Osc1 Diff", false);
paramsControlRadioGroup.set("Osc2 Diff", false);
paramsControlRadioGroup.set("Osc3 Diff", false);
paramsControlRadioGroup.set("Osc4 Diff", false);
paramsControlRadioGroup.set("All Osc Diffs", false);
paramsControlRadioGroup.set("Osc1 Gain", false);
paramsControlRadioGroup.set("Osc2 Gain", false);
paramsControlRadioGroup.set("Osc3 Gain", false);
paramsControlRadioGroup.set("Osc4 Gain", false);
paramsControlRadioGroup.set("All Osc Gains", false);
  


function createp5CanvasOptions(){
  
  let canvasWrapper = document.getElementById('p5-canvas-wrapper');

  let canvasOptionsEl = document.createElement("div");
  canvasOptionsEl.id = "p5-canvas-options";
  canvasOptionsEl.setAttribute("class", "canvas-options");
  
  let selectLabel = document.createElement("div");
  selectLabel.setAttribute("id", "canvas-select-params-title");
  selectLabel.innerHTML = "Parameter to Control: ";
  canvasOptionsEl.appendChild(selectLabel);
  
  let selectDiv = document.createElement("div");
  selectDiv.setAttribute("class", "custom-canvas-select");
  canvasOptionsEl.appendChild(selectDiv);
  
  
  let selectParams = document.createElement("select");
  selectParams.id = "p5-canvas-select-params";
  selectParams.name = "canvas-select-params";


  paramsControlRadioGroup.forEach((value, key, map) => {
    let option = document.createElement("option");
    option.value = key;
    option.text = key;
    selectParams.appendChild(option);
    if(option.value === "Choose Param..."){
      option.selected = true;
    }
  });


  selectParams.addEventListener("click", updateCanvasOptions)
  selectParams.addEventListener("change", canvasOptionChanged);


  selectDiv.appendChild(selectParams);

  let clearButton = document.createElement("button");
  clearButton.setAttribute ('class', 'clearCanvasButton');
  clearButton.id = "p5-canvas-clearCanvasButton"
  clearButton.innerHTML = "Clear Canvas";

  clearButton.addEventListener("click", clearCanvas);

  canvasOptionsEl.appendChild(clearButton);

  let p5Canvas = document.getElementById('p5-canvas');
  canvasWrapper.insertBefore(canvasOptionsEl, p5Canvas);

}

createp5CanvasOptions();



let sketch = function(p) {
  
  let currentParameter = "Choose Param...";
  let shouldClearSegments = false;
  let segments = [];

  p.setCanvasParameter = function (newParam) {
    currentParameter = newParam;
    //console.log("currentParameter: " + currentParameter);
  }

  p.getCurrentCanvasParameter = function(){
    return currentParameter;
  }

  p.clearSegments = function(){
    segments = [];
    shouldClearSegments = false;
  }

  // test the given coordinates against the canvas size
  let hitTest = function(x, y){
    return (x >= 0 && x <= p.windowWidth && y >= 0 && y <= defaultCanvas.height);
  }

  function getSegmentYFromX(x){
    if(segments.length === 0){
      return 0;
    }

    let index = findStartXIndex(segments, x);
    if(index > -1){
      //console.log("Segment found at x: " + x);
      return segments[index].startY;
    } else {
      //console.log("No segment found at x: " + x);
      return 0;
    }
  }

  p.windowResized = function() {
    p.resizeCanvas(defaultCanvas.width, defaultCanvas.height);
  }

  p.setup = function() {
    p.createCanvas(defaultCanvas.width, defaultCanvas.height);
    p.frameRate(25);
  };

  p.draw = function() {
    
    p.clear();

    p.background(canvasBGColor);

    let circleW = 10;
    let playing = isPlaying();
    // draw playhead
    if(playing){

      //p.fill(255, 0, 0);
      
      let playheadX = stepToX(p.width) + 30;
      p.stroke(playHeadColor);
      p.strokeWeight(4);
      p.line(playheadX, 0, playheadX, defaultCanvas.height);

      let segmentY = getSegmentYFromX(playheadX);
      console.log("Segment Y: " + segmentY);
      
        let selectedParam = currentParameter;
        if(segments.length === 0 || segmentY <= 1 || segmentY >= p.widnwowHeight){ 

          p.stroke(yLineColor);
          p.strokeWeight(2);
          p.line(0, p.windowHeight/2, p.windowWidth - canvasWidthOffset, p.windowHeight/2);

          if(selectedParam === "Sample Play Rate"){
            setRateSliderValue(defaultRate);
          }  else if (selectedParam === "Tempo"){
            setTempoSliderValue(defaultTempo);
          } else if (selectedParam === "Osc Filter Cutoff"){
            setOscFilterCutoffSlider(defaultFilterCutoff);
          } else if(selectedParam === "Osc1 Freq"){
            setOsc1FreqSlider(defaultOscFreq);
          } else if(selectedParam === "Osc2 Freq"){
            setOsc2FreqSlider(defaultOscFreq);
          } else if(selectedParam === "Osc3 Freq"){
            setOsc3FreqSlider(defaultOscFreq);
          } else if(selectedParam === "Osc4 Freq"){
            setOsc4FreqSlider(defaultOscFreq);
          } else if(selectedParam === "All Osc Freqs"){
            setOsc1FreqSlider(defaultOscFreq);
            setOsc2FreqSlider(defaultOscFreq);
            setOsc3FreqSlider(defaultOscFreq);
            setOsc4FreqSlider(defaultOscFreq);
          } else if(selectedParam === "Osc1 Diff"){
            setOsc1DiffSlider(defaultOscDiff);
          } else if(selectedParam === "Osc2 Diff"){
            setOsc2DiffSlider(defaultOscDiff);
          } else if(selectedParam === "Osc3 Diff"){ 
            setOsc3DiffSlider(defaultOscDiff);
          } else if(selectedParam === "Osc4 Diff"){
            setOsc4DiffSlider(defaultOscDiff);
          } else if (selectedParam === "All Osc Diffs"){
            setOsc1DiffSlider(defaultOscDiff);
            setOsc2DiffSlider(defaultOscDiff);
            setOsc3DiffSlider(defaultOscDiff);
            setOsc4DiffSlider(defaultOscDiff);
            } else if(selectedParam === "Osc1 Gain"){
            updateInstOsc1Slider(defaultOscAmp);
          } else if(selectedParam === "Osc2 Gain"){
            updateInstOsc2Slider(defaultOscAmp);
          } else if(selectedParam === "Osc3 Gain"){
            updateInstOsc3Slider(defaultOscAmp);
          } else if(selectedParam === "Osc4 Gain"){
            updateInstOsc4Slider(defaultOscAmp);
          } else if(selectedParam === "All Osc Gains"){
            updateInstOsc1Slider(defaultOscAmp);
            updateInstOsc2Slider(defaultOscAmp);
            updateInstOsc3Slider(defaultOscAmp);
            updateInstOsc4Slider(defaultOscAmp);
          } 

        } else {
          
          let freqScale = d3.scaleLinear().domain([p.height, 0]).range([50, 900]);
          let newFreq = freqScale(segmentY);
          
          let ampScale = d3.scaleLinear().domain([p.height, 0]).range([0.0, 1.0]);
          let newAmp = ampScale(segmentY);

          let filterScale = d3.scaleLinear().domain([p.height, 0]).range([20, 3000]);
          let newFilterFreq = filterScale(segmentY);

          let diffScale = d3.scaleLinear().domain([p.height, 0]).range([0.0, 0.3]);
          let newDiff = diffScale(segmentY);

          p.stroke(yLineColor);
          p.strokeWeight(2);
          p.line(0, segmentY, p.windowWidth - canvasWidthOffset, segmentY);


          if(selectedParam === "Sample Play Rate"){
            let rateScale = d3.scaleLinear().domain([p.height, 0]).range([0.0, 3.0]).clamp(true);
            let newRate = rateScale(segmentY);
            setRateSliderValue(newRate);
          } else if (selectedParam === "Tempo"){
            let tempoScale = d3.scaleLinear().domain([p.height, 0]).range([1, 300]);
            let newTempo = tempoScale(segmentY);
            setTempoSliderValue(newTempo);
          } else if (selectedParam === "Osc Filter Cutoff"){
            setOscFilterCutoffSlider(newFilterFreq);
          } else if(selectedParam === "Osc1 Diff"){
            setOsc1DiffSlider(newDiff);
          } else if(selectedParam === "Osc2 Diff"){
            setOsc2DiffSlider(newDiff);
          } else if(selectedParam === "Osc3 Diff"){ 
            setOsc3DiffSlider(newDiff);
          } else if(selectedParam === "Osc4 Diff"){
            setOsc4DiffSlider(newDiff);
          } else if (selectedParam === "All Osc Diffs"){
            setOsc1DiffSlider(newDiff);
            setOsc2DiffSlider(newDiff);
            setOsc3DiffSlider(newDiff);
            setOsc4DiffSlider(newDiff);
          } else if(selectedParam === "Osc1 Freq"){
            setOsc1FreqSlider(newFreq);
          } else if(selectedParam === "Osc2 Freq"){
            setOsc2FreqSlider(newFreq);
          } else if(selectedParam === "Osc3 Freq"){
            setOsc3FreqSlider(newFreq);
          } else if(selectedParam === "Osc4 Freq"){
            setOsc4FreqSlider(newFreq);
          } else if(selectedParam === "All Osc Freqs"){
            setOsc1FreqSlider(newFreq);
            setOsc2FreqSlider(newFreq);
            setOsc3FreqSlider(newFreq);
            setOsc4FreqSlider(newFreq);
          } else if(selectedParam === "All Osc Gains"){
            updateInstOsc1Slider(newAmp);
            updateInstOsc2Slider(newAmp);
            updateInstOsc3Slider(newAmp);
            updateInstOsc4Slider(newAmp);
          } else if(selectedParam === "Osc1 Gain"){
            updateInstOsc1Slider(newAmp);
          } else if(selectedParam === "Osc2 Gain"){
            updateInstOsc2Slider(newAmp);
          } else if(selectedParam === "Osc3 Gain"){
            updateInstOsc3Slider(newAmp);
          } else if(selectedParam === "Osc4 Gain"){
            updateInstOsc4Slider(newAmp);
        }
          
        }
      
      if (p.mouseIsPressed) {
        let xToRate = d3.scaleLinear().domain([0, p.windowWidth]).range([0.0, 5.0]);
        let yToTempo = d3.scaleLinear().domain([0, p.windowHeight]).range([100, 200]);
        
        circleW = 20;
        //p.fill(mouseFollowColor);
      } else {
        p.fill(mouseFollowColor);
      }
      
    }

    // draw mouse follow
    p.line(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY);
    p.ellipse(p.mouseX, p.mouseY, circleW, circleW);
    
    // change line weight based on playing
    if(playing){
      p.strokeWeight(segmentPlayingLineSize);
    } else {
      p.strokeWeight(segmentLineSize);
    }
    
    // draw segments
    for(let i = 0; i < segments.length; i++){
      let seg = segments[i];
      p.stroke(segmentColor);
      p.line(seg.startX, seg.startY, seg.endX, seg.endY);
    }
    
  };

  

  p.mousePressed = function() {
    if(hitTest(p.mouseX, p.mouseY)){
      //console.log("Mouse pressed at: " + p.mouseX + ", " + p.mouseY);
      isMouseDragging = true;

      // clear all segments
      segments = [];

      segments.push(new Segment(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY));

      if(isPlaying()){
        //let scale = 
        //updateRate()
      }
    }
  }

  p.mouseDragged = function() {
    if(isMouseDragging){
      //console.log("Mouse moved at: " + p.mouseX + ", " + p.mouseY);

      // check if there is an existing segment with overlapping x values
      //let index = findStartXIndex(segments, p.mouseX);
      //segments = [];

      segments.push(new Segment(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY));
    }
  }

  p.mouseReleased = function() {
   if(isMouseDragging){
      isMouseDragging = false;
    }
  }

  function timerCallback(elapsed){
   if(shouldClearSegments){
      segments = [];
      shouldClearSegments = false;
      
      console.log("Segments cleared");
    }
    //console.log("timer callback called");
  }

  d3.interval(timerCallback, 30); 


}


var canvas1 = new p5(sketch, window.document.getElementById('p5-canvas'));


// CANVAS 2 - OSC1


let osc1Canvas = function(p) {
  
  let currentParameter = "Choose Param...";
  let shouldClearSegments = false;
  let segments = [];

  p.setCanvasParameter = function (newParam) {
    currentParameter = newParam;
    //console.log("currentParameter: " + currentParameter);
  }

  p.getCurrentCanvasParameter = function(){
    return currentParameter;
  }

  p.clearSegments = function(){
    segments = [];
    shouldClearSegments = false;
  }

  function createOsc1CanvasOptions(){
  
    let canvasWrapper = document.getElementById('osc1-canvas-wrapper');
  
    let canvasOptionsEl = document.createElement("div");
    canvasOptionsEl.id = "osc1-canvas-options";
    canvasOptionsEl.setAttribute("class", "canvas-options");  
  
  
    let selectLabel = document.createElement("div");
    selectLabel.setAttribute("id", "canvas-select-params-title");
    selectLabel.innerHTML = "Parameter to Control: ";
    canvasOptionsEl.appendChild(selectLabel);
    
    let selectDiv = document.createElement("div");
    selectDiv.setAttribute("class", "custom-canvas-select");
    canvasOptionsEl.appendChild(selectDiv);
    
    
    let selectParams = document.createElement("select");
    selectParams.id = "osc1-canvas-select-params";
    selectParams.name = "canvas-select-params";


    paramsControlRadioGroup.forEach((value, key, map) => {
      let option = document.createElement("option");
      option.value = key;
      option.text = key;
      selectParams.appendChild(option);
      if(option.value === "Choose Param..."){
        option.selected = true;
      }
    });

    
    // selectParams.selectedIndex = 0;
    selectParams.addEventListener("click", updateCanvasOptions)
    selectParams.addEventListener("change", canvasOptionChanged);

    //selectParams.updateCanvasOptions();

    selectDiv.appendChild(selectParams);

    let clearButton = document.createElement("button");
    clearButton.setAttribute('class', 'clearCanvasButton');
    clearButton.id = "osc1-canvas-clearCanvasButton" 
    clearButton.innerHTML = "Clear Canvas";

    clearButton.addEventListener("click", clearCanvas);

    canvasOptionsEl.appendChild(clearButton);

    let p5Canvas = document.getElementById('osc1-canvas');
    canvasWrapper.insertBefore(canvasOptionsEl, p5Canvas);

  } 

  createOsc1CanvasOptions();

  let hitTest = function(x, y){
    return (x >= 0 && x <= p.windowWidth && y >= 0 && y <= defaultCanvas.height);
  }

  function getSegmentYFromX(x){
    if(segments.length === 0){
      return 0;
    }

    let index = findStartXIndex(segments, x);
    if(index > -1){
      //console.log("Segment found at x: " + x);
      return segments[index].startY;
    } else {
      //console.log("No segment found at x: " + x);
      return 0;
    }
  }

  
  p.windowResized = function() {
    p.resizeCanvas(defaultCanvas.width , defaultCanvas.height);
  }

  p.setup = function() {
    p.createCanvas(defaultCanvas.width, defaultCanvas.height);
    p.frameRate(25);
  };

  p.draw = function() {
    
    p.clear();

    p.background(canvasBGColor);

    let circleW = 10;
    let playing = isPlaying();
    // draw playhead
    if(playing){

      //p.fill(255, 0, 0);
      
      let playheadX = stepToX(p.width) + 30;
      p.stroke(playHeadColor);
      p.strokeWeight(4);
      p.line(playheadX, 0, playheadX, defaultCanvas.height);

      let segmentY = getSegmentYFromX(playheadX);
      console.log("Segment Y: " + segmentY);
      
        let selectedParam = currentParameter;
        if(segments.length === 0 || segmentY <= 1 || segmentY >= p.widnwowHeight){ 

          p.stroke(yLineColor);
          p.strokeWeight(2);
          p.line(0, p.windowHeight/2, p.windowWidth - canvasWidthOffset, p.windowHeight/2);

          if(selectedParam === "Sample Play Rate"){
            setRateSliderValue(defaultRate);
          }  else if (selectedParam === "Tempo"){
            setTempoSliderValue(defaultTempo);
          } else if (selectedParam === "Osc Filter Cutoff"){
            setOscFilterCutoffSlider(defaultFilterCutoff);
          } else if(selectedParam === "Osc1 Freq"){
            setOsc1FreqSlider(defaultOscFreq);
          } else if(selectedParam === "Osc2 Freq"){
            setOsc2FreqSlider(defaultOscFreq);
          } else if(selectedParam === "Osc3 Freq"){
            setOsc3FreqSlider(defaultOscFreq);
          } else if(selectedParam === "Osc4 Freq"){
            setOsc4FreqSlider(defaultOscFreq);
          } else if(selectedParam === "All Osc Freqs"){
            setOsc1FreqSlider(defaultOscFreq);
            setOsc2FreqSlider(defaultOscFreq);
            setOsc3FreqSlider(defaultOscFreq);
            setOsc4FreqSlider(defaultOscFreq);
          } else if(selectedParam === "Osc1 Diff"){
            setOsc1DiffSlider(defaultOscDiff);
          } else if(selectedParam === "Osc2 Diff"){
            setOsc2DiffSlider(defaultOscDiff);
          } else if(selectedParam === "Osc3 Diff"){ 
            setOsc3DiffSlider(defaultOscDiff);
          } else if(selectedParam === "Osc4 Diff"){
            setOsc4DiffSlider(defaultOscDiff);
          } else if (selectedParam === "All Osc Diffs"){
            setOsc1DiffSlider(defaultOscDiff);
            setOsc2DiffSlider(defaultOscDiff);
            setOsc3DiffSlider(defaultOscDiff);
            setOsc4DiffSlider(defaultOscDiff);
            } else if(selectedParam === "Osc1 Gain"){
            updateInstOsc1Slider(defaultOscAmp);
          } else if(selectedParam === "Osc2 Gain"){
            updateInstOsc2Slider(defaultOscAmp);
          } else if(selectedParam === "Osc3 Gain"){
            updateInstOsc3Slider(defaultOscAmp);
          } else if(selectedParam === "Osc4 Gain"){
            updateInstOsc4Slider(defaultOscAmp);
          } else if(selectedParam === "All Osc Gains"){
            updateInstOsc1Slider(defaultOscAmp);
            updateInstOsc2Slider(defaultOscAmp);
            updateInstOsc3Slider(defaultOscAmp);
            updateInstOsc4Slider(defaultOscAmp);
          } 

        } else {
          
          let freqScale = d3.scaleLinear().domain([p.height, 0]).range([50, 900]);
          let newFreq = freqScale(segmentY);
          
          let ampScale = d3.scaleLinear().domain([p.height, 0]).range([0.0, 1.0]);
          let newAmp = ampScale(segmentY);

          let filterScale = d3.scaleLinear().domain([p.height, 0]).range([20, 3000]);
          let newFilterFreq = filterScale(segmentY);

          let diffScale = d3.scaleLinear().domain([p.height, 0]).range([0.0, 0.3]);
          let newDiff = diffScale(segmentY);

          p.stroke(yLineColor);
          p.strokeWeight(2);
          p.line(0, segmentY, p.windowWidth - canvasWidthOffset, segmentY);


          if(selectedParam === "Sample Play Rate"){
            let rateScale = d3.scaleLinear().domain([p.height, 0]).range([0.0, 3.0]).clamp(true);
            let newRate = rateScale(segmentY);
            setRateSliderValue(newRate);
          } else if (selectedParam === "Tempo"){
            let tempoScale = d3.scaleLinear().domain([p.height, 0]).range([1, 300]);
            let newTempo = tempoScale(segmentY);
            setTempoSliderValue(newTempo);
          } else if (selectedParam === "Osc Filter Cutoff"){
            setOscFilterCutoffSlider(newFilterFreq);
          } else if(selectedParam === "Osc1 Diff"){
            setOsc1DiffSlider(newDiff);
          } else if(selectedParam === "Osc2 Diff"){
            setOsc2DiffSlider(newDiff);
          } else if(selectedParam === "Osc3 Diff"){ 
            setOsc3DiffSlider(newDiff);
          } else if(selectedParam === "Osc4 Diff"){
            setOsc4DiffSlider(newDiff);
          } else if (selectedParam === "All Osc Diffs"){
            setOsc1DiffSlider(newDiff);
            setOsc2DiffSlider(newDiff);
            setOsc3DiffSlider(newDiff);
            setOsc4DiffSlider(newDiff);
          } else if(selectedParam === "Osc1 Freq"){
            setOsc1FreqSlider(newFreq);
          } else if(selectedParam === "Osc2 Freq"){
            setOsc2FreqSlider(newFreq);
          } else if(selectedParam === "Osc3 Freq"){
            setOsc3FreqSlider(newFreq);
          } else if(selectedParam === "Osc4 Freq"){
            setOsc4FreqSlider(newFreq);
          } else if(selectedParam === "All Osc Freqs"){
            setOsc1FreqSlider(newFreq);
            setOsc2FreqSlider(newFreq);
            setOsc3FreqSlider(newFreq);
            setOsc4FreqSlider(newFreq);
          } else if(selectedParam === "All Osc Gains"){
            updateInstOsc1Slider(newAmp);
            updateInstOsc2Slider(newAmp);
            updateInstOsc3Slider(newAmp);
            updateInstOsc4Slider(newAmp);
          } else if(selectedParam === "Osc1 Gain"){
            updateInstOsc1Slider(newAmp);
          } else if(selectedParam === "Osc2 Gain"){
            updateInstOsc2Slider(newAmp);
          } else if(selectedParam === "Osc3 Gain"){
            updateInstOsc3Slider(newAmp);
          } else if(selectedParam === "Osc4 Gain"){
            updateInstOsc4Slider(newAmp);
        }
      }
      // } else {
      //   console.log("No parameter select found");
      // }
      
      if (p.mouseIsPressed) {
        let xToRate = d3.scaleLinear().domain([0, p.windowWidth]).range([0.0, 5.0]);
        let yToTempo = d3.scaleLinear().domain([0, p.windowHeight]).range([100, 200]);
        
        circleW = 20;
        //p.fill(mouseFollowColor);
      } else {
        p.fill(mouseFollowColor);
      }
    }

    if (p.mouseIsPressed) {
      let xToRate = d3.scaleLinear().domain([0, p.windowWidth]).range([0.0, 5.0]);
      let yToTempo = d3.scaleLinear().domain([0, p.windowHeight]).range([100, 200]);

      circleW = 20;
      //p.fill(mouseFollowColor);
    } else {
      p.fill(mouseFollowColor);
    }
    
    p.line(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY);
    p.ellipse(p.mouseX, p.mouseY, circleW, circleW);
    
    if(playing){
      p.strokeWeight(segmentPlayingLineSize);
    } else {
      p.strokeWeight(segmentLineSize);
    }
  
    // draw segments
    for(let i = 0; i < segments.length; i++){
      let seg = segments[i];
      p.stroke(segmentColor);
      p.line(seg.startX, seg.startY, seg.endX, seg.endY);
    }

    //p.fill(segmentColor);
    //p.line(freqSegment.startX, freqSegment.startY, freqSegment.endX, freqSegment.endY);

  };

  

  p.mousePressed = function() {
    if(hitTest(p.mouseX, p.mouseY)){
      //console.log("Mouse pressed at: " + p.mouseX + ", " + p.mouseY);
      isMouseDragging = true;

      // this clears all segments
      segments = [];

      segments.push(new Segment(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY));

      if(isPlaying()){
        //let scale = 
        //updateRate()
      }
    }
  }

  p.mouseDragged = function() {
    if(isMouseDragging){
      //console.log("Mouse moved at: " + p.mouseX + ", " + p.mouseY);

      // check if there is an existing segment with overlapping x values
      //let index = findStartXIndex(segments, p.mouseX);
      //segments = [];

      segments.push(new Segment(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY));
    }
  }

  p.mouseReleased = function() {
   if(isMouseDragging){
      isMouseDragging = false;
    }
  }

  function timerCallback(elapsed){
   if(shouldClearSegments){
      segments = [];
      shouldClearSegments = false;
      
      console.log("Segments cleared");
    }
  }

  d3.interval(timerCallback, 30); 


}

var canvas2 = new p5(osc1Canvas, window.document.getElementById('osc1-canvas'));