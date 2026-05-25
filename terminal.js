// Terminal module: constants, helpers, and TerminalParticle class

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

const chars =
"abcdefghijklmnopqrstuvwxyz0123456789" +
"$#@%&*+=<>/[]{}|~-" +

// hiragana
"あいうえおかきくけこさしすせそたちつてと" +
"なにぬねのはひふへほまみむめもやゆよらりるれろわをん" +

// katakana
"アイウエオカキクケコサシスセソタチツテト" +
"ナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン" +

// terminal-ish japanese fragments
"東京京都大阪電脳記憶夢愛雨夜光海空心猫音" +

// symbols
"・「」『』【】〜。、";

function randomChar() {
  return chars.charAt(floor(random(chars.length)));
}

function snapX(x) {
  return Math.floor(x / cellW) * cellW;
}

function snapY(y) {
  return Math.floor(y / cellH) * cellH;
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

  text(
    "theo@nagarake:~$ ./memory.exe",
    16,
    16
  );
}

class TerminalParticle {

  constructor(x, y) {
    // choose ring-spawn or near-center spawn
    if (random() < 0.7) {
      // ring: pick angle and smaller, horizontally-stretched radius
      const angle = random(TWO_PI);
      const rx = lerp(15, 90, sqrt(random())); // horizontal radius (smaller)
      const ry = lerp(6, 36, sqrt(random()));  // vertical radius (smaller)

      // stretch horizontally so spawn is more of a horizontal band
      this.x = snapX(x + Math.cos(angle) * rx);
      this.y = snapY(y + Math.sin(angle) * ry * 0.45);

      // bias initial velocity more strongly horizontal, weaker vertical
      this.vx = Math.cos(angle) * random(1.0, 3.0);
      this.vy = Math.sin(angle) * random(0.05, 0.6);
    } else {
      // small jitter near center but favor horizontal spread
      let spreadX = random(-80, 80);
      let spreadY = random(-10, 10);

      this.x = snapX(x + spreadX);
      this.y = snapY(y + spreadY);

      this.vx = random([-2, -1, 1, 2]);
      this.vy = random([-1, 0, 0, 0, 1]);
    }

    this.char = randomChar();

    // slightly longer lifetimes for visibility
    this.life = int(random(60, 160));
    this.maxLife = this.life;

    this.stepTimer = int(random(1, 4));

    this.col = random(TEXT_COLORS);
  }

  update() {

    this.life--;

    this.stepTimer--;

    if (this.stepTimer <= 0) {

      this.x += this.vx * cellW;

      if (random() < 0.12) {
        this.y += this.vy * cellH;
      }

      if (random() < 0.08) {
        this.vx += random([-1, 1]);

        this.vx = constrain(this.vx, -3, 3);
      }

      if (random() < 0.08) {
        this.char = randomChar();
      }

      this.stepTimer = int(random(2, 5));
    }
  }

  display() {

    // map life to a stronger visible alpha range
    let alpha = map(this.life, 0, this.maxLife, 60, 255);

    fill(this.col[0], this.col[1], this.col[2], alpha);

    text(this.char, this.x, this.y);
  }

  dead() {
    return this.life <= 0;
  }
}
