
let playHeadColor = "rgb(244, 185, 66)";
let yLineColor = '#6B9AC4';
let canvasBGColor = "#81B9C4";
let segmentColor = "#F4B942";
let mouseFollowColor = "rgb(244, 185, 66)";

let isMouseDragging = false;

let defaultRate = 1.0;
let defaultCanvasParam = "All Osc Freqs";
let defaultOscFreq = 440;
let defaultOscAmp = 0.5;

let segmentPlayingLineSize = 5;
let segmentLineSize = 2;

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
  
  console.log(this.id + " called canvasOptionChanged");

  if(this.id === "p5-canvas-select-params" && canvas1.currentParameterSelect != this){
    canvas1.canvasOptionsChanged(this);
  } else if(this.id === "osc1-canvas-select-params" && canvas2.currentParameterSelect != this){  
    canvas2.canvasOptionsChanged(this);
  } else {
    console.log("No canvas found or already selected - for select: " + this.id);
  }
  
}

let paramsControlRadioGroup = new Map();

function makeCanvasTitleDiv(){

}

function createp5CanvasOptions(){
  
  let canvasWrapper = document.getElementById('p5-canvas-wrapper');

  let canvasOptionsEl = document.createElement("div");
  canvasOptionsEl.id = "p5-canvas-options";
  canvasOptionsEl.setAttribute("class", "canvas-options");

  // let canvasTitle = document.createElement("div");
  // canvasTitle.id = "canvas-title";
  // canvasTitle.innerHTML = "Canvas";
  // canvasOptionsEl.appendChild(canvasTitle);

  // let canvasHelpText = document.createElement("div");
  // canvasHelpText.id = "canvas-help-text";
  // canvasHelpText.innerHTML = "Click and drag to draw segments. The y position of the playhead determines the value of the selected parameter.";
  // canvasOptionsEl.appendChild(canvasHelpText);

  // canvasOptionsEl.insertBefore(canvasTitle, selectParams);  
  // canvasOptionsEl.insertBefore(canvasHelpText, selectParams);

  
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

  let params = ["Rate", "Osc1 Freq", "Osc2 Freq", "Osc3 Freq", "Osc4 Freq", "All Osc Freqs", "All Osc Amps", "Everything"];

  for(let i = 0; i < params.length; i++){
    let option = document.createElement("option");
    option.value = params[i];
    option.text = params[i];
    selectParams.appendChild(option);
  }

  selectParams.selectedIndex = 5;
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

let canvasWidthOffset = 350;

class DefaultCanvas {
  constructor() {
    this.width = 600;
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

let sketch = function(p) {
  
  let currentParameterSelect = null;
  let shouldClearSegments = false;
  let segments = [];

  p.canvasOptionsChanged = function (select) {
    console.log("canvasOptionsChanged called");
    let selectedParam = select.options[select.selectedIndex].value;
    console.log("Selected param: " + selectedParam);

    currentParameterSelect = select;
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

  p.setup = function() {
    p.createCanvas(p.windowWidth - canvasWidthOffset, defaultCanvas.height);
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
      
      let playheadX = stepToX(p.windowWidth - canvasWidthOffset) + 30;
      p.stroke(playHeadColor);
      p.strokeWeight(4);
      p.line(playheadX, 0, playheadX, defaultCanvas.height);

      let segmentY = getSegmentYFromX(playheadX);
      
      // get the selected parameter
      //let select = document.getElementById("canvas-select-params");

      let select = currentParameterSelect;
      if(select != null){ 

        let selectedParam = select.options[select.selectedIndex].value;
        
        if(segmentY === 0){


          p.stroke(yLineColor);
          p.strokeWeight(2);
          p.line(0, p.windowHeight/2, p.windowWidth - canvasWidthOffset, p.windowHeight/2);

          if(selectedParam === "Rate"){
            setRateSliderValue(defaultRate);
          } else if(selectedParam === "Osc1 Freq"){
            setOsc1Freq(defaultOscFreq);
          } else if(selectedParam === "Osc2 Freq"){
            setOsc2Freq(defaultOscFreq);
          } else if(selectedParam === "Osc3 Freq"){
            setOsc3Freq(defaultOscFreq);
          } else if(selectedParam === "Osc4 Freq"){
            setOsc4Freq(defaultOscFreq);
          } else if(selectedParam === "All Osc Freqs"){
            setOsc1Freq(defaultOscFreq);
            setOsc2Freq(defaultOscFreq);
            setOsc3Freq(defaultOscFreq);
            setOsc4Freq(defaultOscFreq);
          } else if(selectedParam === "All Osc Amps"){
            
            updateInstOsc1Slider(defaultOscAmp);
            updateInstOsc2Slider(defaultOscAmp);
            updateInstOsc3Slider(defaultOscAmp);
            updateInstOsc4Slider(defaultOscAmp);
            
          } else if(selectedParam === "Everything"){
            
            setRateSliderValue(defaultRate);
            setOsc1Freq(defaultOscFreq);
            setOsc2Freq(defaultOscFreq);
            setOsc3Freq(defaultOscFreq);
            setOsc4Freq(defaultOscFreq);
            
            updateInstOsc1Slider(defaultOscAmp);
            updateInstOsc2Slider(defaultOscAmp);
            updateInstOsc3Slider(defaultOscAmp);
            updateInstOsc4Slider(defaultOscAmp);
          }
        } 
          
          let freqScale = d3.scaleLinear().domain([p.height, 0]).range([50, 900]);
          let newFreq = freqScale(segmentY);
          
          let ampScale = d3.scaleLinear().domain([p.height, 0]).range([0.0, 1.0]);
          let newAmp = ampScale(segmentY);
          
          p.stroke(yLineColor);
          p.strokeWeight(2);
          p.line(0, segmentY, p.windowWidth - canvasWidthOffset, segmentY);


          if(selectedParam === "Rate"){
            let rateScale = d3.scaleLinear().domain([p.height, 0]).range([0.0, 3.0]).clamp(true);
            let newRate = rateScale(segmentY);
            setRateSliderValue(newRate);
          } else if(selectedParam === "Osc1 Freq"){
            setOsc1Freq(newFreq);
          } else if(selectedParam === "Osc2 Freq"){
            setOsc2Freq(newFreq);
          } else if(selectedParam === "Osc3 Freq"){
            setOsc3Freq(newFreq);
          } else if(selectedParam === "Osc4 Freq"){
            setOsc4Freq(newFreq);
          } else if(selectedParam === "All Osc Freqs"){
            setOsc1Freq(newFreq);
            setOsc2Freq(newFreq);
            setOsc3Freq(newFreq);
            setOsc4Freq(newFreq);
          } else if(selectedParam === "All Osc Amps"){
            updateInstOsc1Slider(newAmp);
            updateInstOsc2Slider(newAmp);
            updateInstOsc3Slider(newAmp);
            updateInstOsc4Slider(newAmp);
          } else if(selectedParam === "Everything"){
            setRateSliderValue(newRate);
            setOsc1Freq(newFreq);
            setOsc2Freq(newFreq);
            setOsc3Freq(newFreq);
            setOsc4Freq(newFreq);
            updateInstOsc1Slider(newAmp);
            updateInstOsc2Slider(newAmp);
            updateInstOsc3Slider(newAmp);
            updateInstOsc4Slider(newAmp);
          }

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

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth - canvasWidthOffset, defaultCanvas.height);
  }

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
    //console.log("timer callback called");
  }

  d3.interval(timerCallback, 30); 


}

var canvas1 = new p5(sketch, window.document.getElementById('p5-canvas'));






// CANVAS 2 - OSC1



let osc1Canvas = function(p) {
  
  let currentParameterSelect = null;
  let shouldClearSegments = false;
  let segments = [];

  p.canvasOptionsChanged = function (select) {
    console.log("canvasOptionsChanged called");
    let selectedParam = select.options[select.selectedIndex].value;
    console.log("Selected param: " + selectedParam);

    currentParameterSelect = select;
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
  
    // let canvasTitle = document.createElement("div");
    // canvasTitle.id = "canvas-title";
    // canvasTitle.innerHTML = "Canvas";
    // canvasOptionsEl.appendChild(canvasTitle);
  
    // let canvasHelpText = document.createElement("div");
    // canvasHelpText.id = "canvas-help-text";
    // canvasHelpText.innerHTML = "Click and drag to draw segments. The y position of the playhead determines the value of the selected parameter.";
    // canvasOptionsEl.appendChild(canvasHelpText);
  
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
  
    let params = ["Rate", "Osc1 Freq", "Osc2 Freq", "Osc3 Freq", "Osc4 Freq", "All Osc Freqs", "All Osc Amps", "Everything"];
  
    // loop through the params and create options
    for(let i = 0; i < params.length; i++){
      let option = document.createElement("option");
      option.value = params[i];
      option.text = params[i];
      selectParams.appendChild(option);
    }
  
    selectParams.selectedIndex = 0;
    selectParams.addEventListener("change", canvasOptionChanged);

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

  let freqSegment = new Segment(0, 0, 0, 0);
  let maxSegments = 1;

  p.setup = function() {
    p.createCanvas(p.windowWidth - canvasWidthOffset, defaultCanvas.height);
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
      
      let playheadX = stepToX(p.windowWidth - canvasWidthOffset) + 30;
      p.stroke(playHeadColor);
      p.strokeWeight(4);
      p.line(playheadX, 0, playheadX, defaultCanvas.height);

      let segmentY = getSegmentYFromX(playheadX);
      
      // get the selected parameter
      let select = currentParameterSelect;
      if(select != null){

        let selectedParam = select.options[select.selectedIndex].value;

        if(segmentY === 0){
          if(selectedParam === "Rate"){
            setRateSliderValue(defaultRate);
          } else if(selectedParam === "Osc1 Freq"){
            setOsc1Freq(defaultOscFreq);
          } else if(selectedParam === "Osc2 Freq"){
            setOsc2Freq(defaultOscFreq);
          } else if(selectedParam === "Osc3 Freq"){
            setOsc3Freq(defaultOscFreq);
          } else if(selectedParam === "Osc4 Freq"){
            setOsc4Freq(defaultOscFreq);
          } else if(selectedParam === "All Osc Freqs"){
            setOsc1Freq(defaultOscFreq);
            setOsc2Freq(defaultOscFreq);
            setOsc3Freq(defaultOscFreq);
            setOsc4Freq(defaultOscFreq);
          } else if(selectedParam === "All Osc Amps"){
            
            updateInstOsc1Slider(defaultOscAmp);
            updateInstOsc2Slider(defaultOscAmp);
            updateInstOsc3Slider(defaultOscAmp);
            updateInstOsc4Slider(defaultOscAmp);

          } else if(selectedParam === "Everything"){

            setRateSliderValue(defaultRate);
            setOsc1Freq(defaultOscFreq);
            setOsc2Freq(defaultOscFreq);
            setOsc3Freq(defaultOscFreq);
            setOsc4Freq(defaultOscFreq);

            updateInstOsc1Slider(defaultOscAmp);
            updateInstOsc2Slider(defaultOscAmp);
            updateInstOsc3Slider(defaultOscAmp);
            updateInstOsc4Slider(defaultOscAmp);
          }
        } else {
          
          p.stroke(yLineColor);
          p.strokeWeight(2);
          p.line(0, segmentY, p.windowWidth - canvasWidthOffset, segmentY);

          
          let freqScale = d3.scaleLinear().domain([p.height, 0]).range([50, 900]);
          let newFreq = freqScale(segmentY);

          let ampScale = d3.scaleLinear().domain([p.height, 0]).range([0.0, 1.0]);
          let newAmp = ampScale(segmentY);
          
          if(selectedParam === "Rate"){
            let rateScale = d3.scaleLinear().domain([p.height, 0]).range([0.0, 3.0]).clamp(true);
            let newRate = rateScale(segmentY);
            setRateSliderValue(newRate);
          } else if(selectedParam === "Osc1 Freq"){
            setOsc1Freq(newFreq);
          } else if(selectedParam === "Osc2 Freq"){
            setOsc2Freq(newFreq);
          } else if(selectedParam === "Osc3 Freq"){
            setOsc3Freq(newFreq);
          } else if(selectedParam === "Osc4 Freq"){
            setOsc4Freq(newFreq);
          } else if(selectedParam === "All Osc Freqs"){
            setOsc1Freq(newFreq);
            setOsc2Freq(newFreq);
            setOsc3Freq(newFreq);
            setOsc4Freq(newFreq);
          } else if(selectedParam === "All Osc Amps"){
            updateInstOsc1Slider(newAmp);
            updateInstOsc2Slider(newAmp);
            updateInstOsc3Slider(newAmp);
            updateInstOsc4Slider(newAmp);
          } else if(selectedParam === "Everything"){
            setRateSliderValue(newRate);
            setOsc1Freq(newFreq);
            setOsc2Freq(newFreq);
            setOsc3Freq(newFreq);
            setOsc4Freq(newFreq);
            updateInstOsc1Slider(newAmp);
            updateInstOsc2Slider(newAmp);
            updateInstOsc3Slider(newAmp);
            updateInstOsc4Slider(newAmp);
          }
        }  
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

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth - canvasWidthOffset, defaultCanvas.height);
  }

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