# rnbo-step-sequencer
a step sequencer built with [Max](https://cycling74.com/) and exported via [RNBO](https://cycling74.com/products/rnbo). It uses lines drawn on [p5.js]([p5.js](https://p5js.org/)) canvases to modulate parameters of the step sequencer.

live github build: https://krismakesstuff.github.io/rnbo-step-sequencer/

demo video: https://www.youtube.com/watch?v=VdBxwLx5CV4&ab_channel=krismakesmusic

#### how to use:
1. click play or press spacebar
2. click on steps to trigger sounds or choose a preset pattern
3. drag and drop audio files onto drum tracks to use your own samples
4. play with sliders
5. assign parameters to each canvas and draw lines
6. repeat


#### how to run locally:
1. clone the repository
2. start a local server
   1. Using VSCode: Click on the "Go Live" button in the bottom right corner of the window.
   2. Using node.js: Run `npx http-server` in the terminal.


big credit to [Sam](https://github.com/starakaj) and this [video](https://youtu.be/l42_f9Ir8fQ?si=_1eSUs2Ipbc8S9cu)

drum samples used:
-

- clap1.wav: https://samplefocus.com/samples/drum-shot-air-clap
- hihat1.wav: https://samplefocus.com/samples/dry-closed-hi-hat-618dd7ff-b13b-4194-8266-20e41ca14418
- snare1.wav: https://samplefocus.com/samples/snare-basic
- kick1.wav: https://samplefocus.com/samples/eurodance-drums-smooth-kick


todo:
- add scales and octaves to "quantize the canvas"
- change tempo to show BPM
