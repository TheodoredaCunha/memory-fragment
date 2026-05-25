let particles = [];
let bg;

// ===== AUDIO =====
let osc;
let env;
let reverb;

const chords = [
  ["C4", "E4", "G4"],
  ["A3", "C4", "E4"],
  ["F3", "A3", "C4"],
  ["G3", "B3", "D4"],
  ["D3", "F3", "A3"],
  ["E3", "G3", "B3"]
];

let currentChord = -1;


function preload() {
  bg = loadImage("assets/background.jpg");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  frameRate(30);

  updateTerminalScale();

  textFont("'Noto Sans JP', monospace");
  textSize(fontSize);
  textStyle(BOLD);
  textAlign(LEFT, TOP);

  noStroke();

  // ===== AUDIO SETUP =====
  osc = new p5.PolySynth(p5.MonoSynth);

  reverb = new p5.Reverb();
  reverb.process(osc, 3, 2);

  userStartAudio();
}

function draw() {

  // ===== BG =====
  image(bg, 0, 0, width, height);

  fill(...BG_TINT);
  rect(0, 0, width, height);

  drawGrid();

  // ===== PARTICLES =====
  if (mouseIsPressed) {

    for (let i = 0; i < 14; i++) {
      particles.push(new TerminalParticle(mouseX, mouseY));
    }

    playMappedChord();
  }

  for (let i = particles.length - 1; i >= 0; i--) {

    const p = particles[i];

    p.update();
    p.display();

    if (p.dead()) {
      particles.splice(i, 1);
    }
  }

  drawPrompt();
}

// ===== AUDIO =====

function playMappedChord() {

  // map X to chord index
  let chordIndex = floor(
    map(mouseX, 0, width, 0, chords.length)
  );

  chordIndex = constrain(chordIndex, 0, chords.length - 1);

  // map Y to volume
  // top = loud, bottom = quiet
  // increased overall volume range (min, max)
  let volume = map(mouseY, height, 0, 0.05, 0.6);

  // only retrigger if chord changes
  if (chordIndex !== currentChord) {

    currentChord = chordIndex;

    let chord = chords[chordIndex];

    for (let note of chord) {

      osc.play(
        note,
        volume,
        0,
        0.4
      );
    }
  }
}

function mouseReleased() {
  currentChord = -1;
}

// ===== PARTICLES =====
// Terminal-specific classes and helpers moved to terminal.js

function windowResized() {

  resizeCanvas(windowWidth, windowHeight);

  updateTerminalScale();

  textSize(fontSize);
}