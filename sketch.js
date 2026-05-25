let particles = [];
let bg;

let synths = [];
let reverb;
let lastNoteTime = 0;

let fontSize = 10;
let cellW;
let cellH;

const BG_TINT = [28, 28, 28, 170];

const TEXT_COLORS = [
  [242, 242, 242],
  [255, 170, 120],
  [255, 120, 90],
  [180, 255, 180]
];

const scale = [
  "C3", "D3", "E3", "F3", "G3", "A3", "B3",
  "C4", "D4", "E4", "F4", "G4", "A4", "B4",
  "C5", "D5", "E5", "F5", "G5"
];

const chars =
  "abcdefghijklmnopqrstuvwxyz0123456789" +
  "$#@%&*+=<>/[]{}|~-" +
  "あいうえおかきくけこさしすせそたちつてと" +
  "なにぬねのはひふへほまみむめもやゆよらりるれろわをん" +
  "アイウエオカキクケコサシスセソタチツテト" +
  "ナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン" +
  "東京京都大阪電脳記憶夢愛雨夜光海空心猫音" +
  "・「」『』【】〜。、";

function preload() {
  console.log("i don't know what this is but its pretty freaking cool i think")
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

  userStartAudio();
  reverb = new p5.Reverb();

  for (let i = 0; i < 8; i++) {
    const synth = new p5.MonoSynth();
    synths.push(synth);
    reverb.process(synth, 3, 2);
  }
}

function draw() {
  image(bg, 0, 0, width, height);
  fill(...BG_TINT);
  rect(0, 0, width, height);

  drawGrid();

  if (mouseIsPressed) {
    for (let i = 0; i < 8; i++) {
      const spawnX = mouseX + random(-120, 120);
      const spawnY = mouseY + random(-30, 30);
      particles.push(new TerminalParticle(spawnX, spawnY));
    }

    playAmbientChord();
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

function playAmbientChord() {
  const now = millis();
  if (now - lastNoteTime < 70) {
    return;
  }
  lastNoteTime = now;

  const noteIndex = constrain(
    floor(map(mouseX, 0, width, 0, scale.length)),
    0,
    scale.length - 1
  );

  const note = scale[noteIndex];
  const volume = map(mouseY, height, 0, 0.08, 0.55);
  
  // y-axis maps to timbre: top = short bright, bottom = long ambient
  const timbreFactor = map(mouseY, height, 0, 0.1, 0.8);
  const attackTime = 0.02;
  const duration = 0.15 + timbreFactor * 0.4;

  const synth = random(synths);
  synth.play(note, volume, attackTime, duration);
}

function mouseReleased() {
  // no-op: note triggering is throttled and stateless
}

function updateTerminalScale() {
  cellW = fontSize * 0.72;
  cellH = fontSize * 1.45;
}

function drawGrid() {
  stroke(255, 255, 255, 8);
  strokeWeight(1);

  for (let x = 0; x < width; x += cellW) {
    line(x, 0, x, height);
  }

  for (let y = 0; y < height; y += cellH) {
    line(0, y, width, y);
  }

  noStroke();
}

function drawPrompt() {
  fill(255, 140, 110, 120);
  text("theo@nagarake:~$ ./memory.exe", 16, 16);
}

function randomChar() {
  return chars.charAt(floor(random(chars.length)));
}

class TerminalParticle {
  constructor(x, y) {
    this.x = snapX(x + random(-140, 140));
    this.y = snapY(y + random(-40, 40));

    const direction = random() < 0.5 ? -1 : 1;
    this.vx = direction * random(0.8, 2.0);
    this.vy = random(-0.25, 0.25);

    this.char = randomChar();
    this.life = int(random(40, 120));
    this.maxLife = this.life;
    this.typingDuration = int(this.maxLife * 0.35);
    this.stepTimer = int(random(1, 4));
    this.col = random(TEXT_COLORS);
    this.history = [];
  }

  update() {
    this.life--;
    this.stepTimer--;

    if (this.stepTimer <= 0) {
      this.history.push({ x: this.x, y: this.y, char: this.char });
      if (this.history.length > 4) {
        this.history.shift();
      }

      this.x += this.vx * cellW;
      if (random() < 0.18) {
        this.y += this.vy * cellH;
      }

      if (random() < 0.08) {
        this.vx += random(-0.18, 0.18);
        this.vx = constrain(this.vx, -2, 2);
      }

      if (random() < 0.12) {
        this.char = randomChar();
      }

      this.x = constrain(this.x, -cellW * 2, width + cellW * 2);
      this.y = constrain(this.y, 0, height - cellH);

      this.stepTimer = int(random(2, 5));
    }
  }

  display() {
    const isTyping = this.life > this.maxLife - this.typingDuration;
    
    for (let i = 0; i < this.history.length; i++) {
      const trail = this.history[i];
      const alpha = map(i, 0, this.history.length, 40, 140);
      fill(this.col[0], this.col[1], this.col[2], alpha);
      text(trail.char, trail.x, trail.y);
    }

    let alpha;
    if (isTyping) {
      alpha = map(this.life, this.maxLife - this.typingDuration, this.maxLife, 120, 255);
    } else {
      alpha = map(this.life, 0, this.maxLife - this.typingDuration, 40, 120);
    }
    alpha = constrain(alpha, 40, 255);
    fill(this.col[0], this.col[1], this.col[2], alpha);
    text(this.char, this.x, this.y);
  }

  dead() {
    return this.life <= 0;
  }
}

function snapX(x) {
  return Math.floor(x / cellW) * cellW;
}

function snapY(y) {
  return Math.floor(y / cellH) * cellH;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateTerminalScale();
  textSize(fontSize);
}
