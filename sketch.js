const CELL_SIZE = 60;
const GRID_SIZE = 7;
const TIMER_LIMIT = 90;

let walls = { h: [], v: [] };
let players = [{ stones: [], color: 'white' }, { stones: [], color: 'black' }];
let currentPlayer = 0;
let selected = null;
let placingPhase = true;
let totalPlaced = 0;
let startTime;
let gameEnded = false;

function setup() {
  createCanvas(CELL_SIZE * GRID_SIZE, CELL_SIZE * GRID_SIZE + 50).parent("game");
  for (let i = 0; i < GRID_SIZE; i++) {
    walls.h[i] = Array(GRID_SIZE).fill(false);
    walls.v[i] = Array(GRID_SIZE).fill(false);
  }
  startTime = millis();
}

function draw() {
  background(220);
  drawBoard();
  drawStones();
  drawWalls();
  drawUI();

  if (!gameEnded && millis() - startTime > TIMER_LIMIT * 1000) {
    randomWall();
    endTurn();
  }
}

function drawBoard() {
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      stroke(0);
      fill(255);
      rect(x * CELL_SIZE, y * CELL_SIZE + 50, CELL_SIZE, CELL_SIZE);
    }
  }
}

function drawStones() {
  for (let p = 0; p < players.length; p++) {
    for (let s of players[p].stones) {
      fill(players[p].color);
      circle(s.x * CELL_SIZE + CELL_SIZE / 2, s.y * CELL_SIZE + CELL_SIZE / 2 + 50, CELL_SIZE * 0.6);
      if (selected && selected.x === s.x && selected.y === s.y && currentPlayer === p) {
        fill('red');
        circle(s.x * CELL_SIZE + CELL_SIZE / 2, s.y * CELL_SIZE + CELL_SIZE / 2 + 50, 8);
      }
    }
  }
}

function drawWalls() {
  stroke('blue');
  strokeWeight(4);
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (walls.h[y][x]) {
        line(x * CELL_SIZE, y * CELL_SIZE + 50, (x + 1) * CELL_SIZE, y * CELL_SIZE + 50);
      }
      if (walls.v[y][x]) {
        line(x * CELL_SIZE, y * CELL_SIZE + 50, x * CELL_SIZE, (y + 1) * CELL_SIZE + 50);
      }
    }
  }
  strokeWeight(1);
}

function drawUI() {
  fill(0);
  textSize(16);
  textAlign(CENTER);
  const remaining = TIMER_LIMIT - floor((millis() - startTime) / 1000);
  text("⏱ " + remaining + "초 남음", width / 2, 20);
}

function mousePressed() {
  if (gameEnded) return;

  const cx = floor(mouseX / CELL_SIZE);
  const cy = floor((mouseY - 50) / CELL_SIZE);
  if (cx < 0 || cy < 0 || cx >= GRID_SIZE || cy >= GRID_SIZE) return;

  const clickPos = { x: cx, y: cy };

  if (placingPhase) {
    if (!occupied(clickPos)) {
      players[currentPlayer].stones.push(clickPos);
      totalPlaced++;
      if (totalPlaced >= 4) placingPhase = false;
      currentPlayer = 1 - currentPlayer;
    }
    return;
  }

  if (selected && (clickPos.x !== selected.x || clickPos.y !== selected.y)) {
    if (!occupied(clickPos)) {
      players[currentPlayer].stones = players[currentPlayer].stones.map(s =>
        s.x === selected.x && s.y === selected.y ? clickPos : s
      );
      selected = clickPos;
    }
  } else {
    for (let s of players[currentPlayer].stones) {
      if (s.x === clickPos.x && s.y === clickPos.y) {
        selected = clickPos;
        return;
      }
    }
  }

  // 벽 설치
  if (selected && !occupied(clickPos)) {
    const dx = clickPos.x - selected.x;
    const dy = clickPos.y - selected.y;
    if (abs(dx) + abs(dy) === 1) {
      if (dx === 1) walls.v[selected.y][selected.x] = true;
      else if (dx === -1) walls.v[selected.y][clickPos.x] = true;
      else if (dy === 1) walls.h[selected.y][selected.x] = true;
      else if (dy === -1) walls.h[clickPos.y][selected.x] = true;

      selected = null;
      endTurn();
    }
  }
}

function endTurn() {
  currentPlayer = 1 - currentPlayer;
  selected = null;
  startTime = millis();
}

function occupied(pos) {
  return players.some(p => p.stones.some(s => s.x === pos.x && s.y === pos.y));
}

function randomWall() {
  const s = players[currentPlayer].stones[0];
  const dir = random(['UP', 'DOWN', 'LEFT', 'RIGHT']);
  const x = s.x, y = s.y;
  if (dir === 'UP' && y > 0) walls.h[y - 1][x] = true;
  else if (dir === 'DOWN' && y < GRID_SIZE - 1) walls.h[y][x] = true;
  else if (dir === 'LEFT' && x > 0) walls.v[y][x - 1] = true;
  else if (dir === 'RIGHT' && x < GRID_SIZE - 1) walls.v[y][x] = true;
}
