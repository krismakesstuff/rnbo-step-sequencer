
let playHeadColor = "red";
let canvasBGColor = "black";
let segmentColor = "white";
let mouseFollowColor = "darkgrey";

let isMouseDragging = false;

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
  }
  return -1;
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
      console.log("Segment found at x: " + x);
      return segments[index].startY;
    } else {
      console.log("No segment found at x: " + x);
      return 0;
    }
  }

  let freqSegment = new Segment(0, 0, 0, 0);
  let maxSegments = 1;

  p.setup = function() {
    p.createCanvas(p.windowWidth, defaultCanvas.height);
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
      
      let playheadX = stepToX(p.windowWidth);
      p.stroke(playHeadColor);
      p.strokeWeight(4);
      p.line(playheadX, 0, playheadX, defaultCanvas.height);

      let segmentY = getSegmentYFromX(playheadX);
      
      if(segmentY === 0){
        setRateSliderValue(1.0);
      } else {
        let rateScale = d3.scaleLinear().domain([0, p.height]).range([5.0, 0.0]).clamp(true);
        //let rateScale = d3.scaleLog([0, p.height], [0.0, 5.0]);
        let newRate = rateScale(segmentY);
        setRateSliderValue(newRate);
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
    p.resizeCanvas(p.windowWidth, defaultCanvas.height);
  }

  p.mousePressed = function() {
    if(hitTest(p.mouseX, p.mouseY)){
      //console.log("Mouse pressed at: " + p.mouseX + ", " + p.mouseY);
      isMouseDragging = true;

      segments = [];

      segments.push(new Segment(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY));

      if(isPlaying()){
        let scale = 
        updateRate()
      }
    }
  }

  p.mouseDragged = function() {
    if(isMouseDragging){
      console.log("Mouse moved at: " + p.mouseX + ", " + p.mouseY);
      segments.push(new Segment(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY));
    }
  }

  p.mouseReleased = function() {
   if(isMouseDragging){
      isMouseDragging = false;
    }
  }

}

new p5(sketch, window.document.getElementById('xyCanvas-wrapper'));

