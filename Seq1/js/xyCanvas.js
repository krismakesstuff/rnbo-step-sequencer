
let playHeadColor = "rgb(244, 185, 66)";
let canvasBGColor = "rgb(151, 216, 196)";
let segmentColor = "rgb(55, 57, 65)";
let mouseFollowColor = "rgb(244, 185, 66)";

let isMouseDragging = false;
let shouldClearSegments = false;

function preload() {
  font = loadFont('assets/inconsolata.otf');
}


function canvasOptionChanged(){

}

function createCanvasOptions(){
  
  let canvasWrapper = document.getElementById('canvas-wrapper');

  let canvasOptionsEl = document.createElement("div");
  canvasOptionsEl.id = "canvas-options";

  let selectParams = document.createElement("select");
  selectParams.id = "canvas-select-params";

  let params = ["Rate", "Osc1 Freq", "Osc2 Freq", "Osc3 Freq", "Osc4 Freq", "All Osc Freqs", "All Osc Amps", "Everything"];

  for(let i = 0; i < params.length; i++){
    let option = document.createElement("option");
    option.value = params[i];
    option.text = params[i];
    selectParams.appendChild(option);
  }

  selectParams.selectedIndex = 0;

  selectParams.addEventListener("change", canvasOptionChanged);

  canvasOptionsEl.appendChild(selectParams);

  let p5Canvas = document.getElementById('p5-canvas');
  canvasWrapper.insertBefore(canvasOptionsEl, p5Canvas);

  let canvasTitle = document.createElement("div");
  canvasTitle.id = "canvas-title";
  canvasTitle.innerHTML = "Canvas";

  let canvasHelpText = document.createElement("div");
  canvasHelpText.id = "canvas-help-text";
  canvasHelpText.innerHTML = "Click and drag to draw segments. The y position of the playhead determines the value of the selected parameter.";
  
  canvasOptionsEl.insertBefore(canvasTitle, selectParams);  
  canvasOptionsEl.insertBefore(canvasHelpText, selectParams);
}

createCanvasOptions();

let canvasWidthOffset = 350;

class DefaultCanvas {
  constructor() {
    this.width = 700;
    this.height = 250;
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

let sketch = function(p) {
  
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
  // test the given coordinates against the canvas size
  let hitTest = function(x, y){
    return (x >= 0 && x <= p.windowWidth && y >= 0 && y <= defaultCanvas.height);
  }

  let segments = [];


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
      
      let playheadX = stepToX(p.windowWidth - canvasWidthOffset);
      p.stroke(playHeadColor);
      p.strokeWeight(4);
      p.line(playheadX, 0, playheadX, defaultCanvas.height);

      let segmentY = getSegmentYFromX(playheadX);
      
      if(segmentY === 0){
        //setRateSliderValue(1.0);
        setOsc1Freq(200);
        setOsc2Freq(200);
        setOsc3Freq(200);
        setOsc4Freq(200);
      } else {
        let rateScale = d3.scaleLinear().domain([p.height, 0]).range([0.0, 3.0]).clamp(true);
        //let rateScale = d3.scaleLog([0, p.height], [0.0, 5.0]);
        let newRate = rateScale(segmentY);
        //setRateSliderValue(newRate);

        let freqScale = d3.scaleLinear().domain([p.height, 0]).range([50, 100]);
        let newFreq = freqScale(segmentY);

        setOsc1Freq(newFreq);
        setOsc2Freq(newFreq);
        setOsc3Freq(newFreq);
        setOsc4Freq(newFreq);

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
      p.strokeWeight(3);
    } else {
      p.strokeWeight(1);
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

new p5(sketch, window.document.getElementById('p5-canvas'));

