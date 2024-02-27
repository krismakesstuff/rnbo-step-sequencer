
let canvasMouseX = 0;
let canvasmouseY = 0;


let sketch = function(p) {

  let widthOffset = 40;
  let height = 350;

  p.setup = function() {
    p.createCanvas(p.windowWidth - widthOffset, height);

  };

  p.draw = function() {
    if (p.mouseIsPressed) {
      p.fill(76);
    } else {
      p.fill(255);
    }
    
    p.ellipse(p.mouseX, p.mouseY, 60, 60);
  

    canvasMouseX = p.mouseX;
    canvasMouseY = p.mouseY;

    //console.log(mousex + " " + mouseY);
  };

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth - widthOffset, height);
  }

}

new p5(sketch, window.document.getElementById('xyCanvas-wrapper'));

// function setup(p) {
// }

// function draw(p) {
  
// }

