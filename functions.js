export let score = 0;

import {
  rows,
  boxes,
  columns,
  ctx,
  context,
  unit,
  gameOverSound,
  scatterSound,
  moveSound,
  currentShape,
  nextShapeArrays,
  game,
  shapeObjects,
  normalDropSpeed,
  fastDropSpeed,
  ROWS,
  COLS,
  ROTATE1,
  ROTATE2,
  ROTATE3,
  ROTATE4,
  LEFT,
  RIGHT,
  DOWN,
  pauseBtn,
  Particle,
  gameWidth,
  gameHeight,
  gameBox,
  particles,
  fakeKeyUp,
} from "./index.js";

import { O } from "./shapes/O.js";
import { I } from "./shapes/I.js";
import { I2 } from "./shapes/I2.js";
import { T } from "./shapes/T.js";
import { T1 } from "./shapes/T1.js";
import { T2 } from "./shapes/T2.js";
import { T4 } from "./shapes/T4.js";
import { S } from "./shapes/S.js";
import { S2 } from "./shapes/S2.js";
import { Z } from "./shapes/Z.js";
import { Z2 } from "./shapes/Z2.js";
import { L } from "./shapes/L.js";
import { L1 } from "./shapes/L1.js";
import { L2 } from "./shapes/L2.js";
import { L4 } from "./shapes/L4.js";
import { J } from "./shapes/J.js";
import { J1 } from "./shapes/J1.js";
import { J2 } from "./shapes/J2.js";
import { J4 } from "./shapes/J4.js";
import Timer from "./timer.js";

export function drawBlock(x, y) {
  context.strokeStyle = "black";
  context.fillStyle = "white";
  context.lineWidth = 2;
  context.fillRect(x, y, unit, unit);
  context.strokeRect(x, y, unit, unit);
}

function ctxDraw(x, y) {
  ctx.strokeStyle = "black";
  ctx.fillStyle = "white";
  ctx.lineWidth = 2;
  ctx.fillRect(x, y, unit, unit);
  ctx.strokeRect(x, y, unit, unit);
}

function drawNext(shape) {
  if (!shape) return;
  ctx.fillStyle = "burlywood";
  ctx.fillRect(0, 0, 200, 200);
  const arrays = nextShapeArrays[shape];
  arrays.forEach((array) => {
    const [x, y] = array;
    ctxDraw(x, y);
  });
}

export function generateBoxes() {
  let v = 0;
  for (let i = 0; i < 500; i += 25) {
    const rowIndex = i / 25;
    rows[rowIndex] = [];

    for (let t = 0; t < 500; t += 25) {
      const colIndex = t / 25;
      boxes[v] = {
        startCoordinates: [t, i],
        endCoordinates: [t + 25, i + 25],
        occupied: false,
      };

      rows[rowIndex].push(v);

      if (!columns[colIndex]) {
        columns[colIndex] = [];
        //if the columns array has not been created for that column, create one
      }
      columns[colIndex].push(v);
      //add this to the columns array
      v++;
    }
  }
}

export function refreshBoard() {
  context.fillStyle = "burlywood";
  context.fillRect(0, 0, 500, 500);
  boxes.forEach((box) => {
    if (box.occupied) {
      const [x, y] = box.startCoordinates;
      drawBlock(x, y);
    }
  });
}

export function gameStart() {
  game.running = true;
  generateBoxes();
  Timer.start();
  startNextShape();
}

export function calculateIndex(x, y) {
  return (y / 25) * 20 + x / 25;
}

function startNextShape() {
  if (!game.running) return;
  game.downHeld = false;
  if (game.dropIntervalId) {
    clearInterval(game.dropIntervalId);
    game.dropIntervalId = null;
  }
  const shape =
    game.nextShape ||
    shapeObjects[Math.floor(Math.random() * shapeObjects.length)];
  game.nextShape =
    shapeObjects[Math.floor(Math.random() * shapeObjects.length)];
  drawNext(game.nextShape.name);
  shape.generateX();
  shape.animate(shape.shapeX, 0, normalDropSpeed);

  if (game.shapeDoneInterval) clearInterval(game.shapeDoneInterval);
  game.shapeDoneInterval = setInterval(() => {
    if (currentShape.length == 0 && game.running) {
      clearInterval(game.shapeDoneInterval);
      game.shapeDoneInterval = null;
      setTimeout(startNextShape, 1500);
    }
  }, 100);
}

export function checkMoveLeftable(index) {
  return boxes[index].startCoordinates[0] == 0 ||
    boxes[index - 1].occupied == true
    ? false
    : true;
}

export function checkMoveRightable(index) {
  return boxes[index].endCoordinates[0] == 500 ||
    boxes[index + 1].occupied == true
    ? false
    : true;
}

export function checkMoveDownable(index) {
  return boxes[index].endCoordinates[1] == 500 ||
    boxes[index + 20].occupied == true
    ? false
    : true;
}

export function checkLeft(...indices) {
  return indices.every((index) => checkMoveLeftable(index));
}

export function checkRight(...indices) {
  return indices.every((index) => checkMoveRightable(index));
}

export function checkDown(...indices) {
  return indices.every((index) => checkMoveDownable(index));
}

function columnIndex(index) {
  const column = index % 20;
  return column;
}

function rowIndex(index) {
  const row = Math.floor(index / 20);
  return row;
}

function checkColumns(col) {
  let columnBoxes = columns[col];
  return boxes[columnBoxes[0]].occupied;
}

function checkRows(row) {
  const rowBoxes = rows[row];
  const allOccupied = rowBoxes.every((index) => boxes[index].occupied);
  return allOccupied ? true : false;
}

export function dropAndClear(calledBySelf = false) {
  const clearedRows = [];

  // Step 1: Detect full rows
  for (let row = 0; row < 20; row++) {
    const isFull = rows[row].every((boxIdx) => boxes[boxIdx].occupied);
    if (isFull) clearedRows.push(row);
  }

  if (clearedRows.length === 0) return;

  const size = clearedRows.length;
  function returnScore(size, factor) {
    return size * (size * factor);
  }
  // ✅ Step 1.5: Update score
  const baseScore = calledBySelf ? returnScore(size, 10) : returnScore(size, 5);
  score += baseScore;
  const scoreText = document.getElementById("score");
  if (scoreText) {
    scoreText.textContent = `${score}`;
  }
  //if called by self, it should display nice and say nice

  // Step 2: Animate particles
  clearedRows.forEach((row) => {
    rows[row].forEach((boxIdx) => {
      const [x, y] = boxes[boxIdx].startCoordinates;
      for (let i = 0; i < 5; i++) {
        particles.push(new Particle(x, y));
      }
    });
  });

  rowClearSound();
  animateParticles();

  // Step 3: Clear rows after delay
  setTimeout(() => {
    clearedRows.forEach((row) => {
      rows[row].forEach((boxIdx) => {
        boxes[boxIdx].occupied = false;
      });
    });

    // Step 4: Drop blocks above cleared rows
    animateFall();
  }, 500);

  // Step 5: animateFall will re-call dropAndClear if needed
  function animateFall() {
    let moved = false;

    const fallInterval = setInterval(() => {
      moved = false;

      for (let i = boxes.length - 1; i >= 0; i--) {
        const belowIdx = i + 20;
        if (
          boxes[i].occupied &&
          belowIdx < boxes.length &&
          !boxes[belowIdx].occupied
        ) {
          boxes[belowIdx].occupied = true;
          boxes[i].occupied = false;
          moved = true;
        }
      }

      refreshBoard();

      if (!moved) {
        clearInterval(fallInterval);
        dropAndClear(true); // 🔁 Self-call
      }
    }, 50);
  }
}

export function checkGameOver(obj, ...indices) {
  const done = indices.some((index) => checkColumns(columnIndex(index)));
  if (done) {
    clearTimeout(obj.timeoutId);
    game.gameEnded = true;
    setTimeout(() => {
      gameOver();
      game.running = false;
    }, 400);
  }
}

function playMoveSound() {
  const soundClone = moveSound.cloneNode();
  soundClone.play();
  setTimeout(() => {
    soundClone.pause();
    soundClone.currentTime = 0;
  }, 500);
}

function rowClearSound() {
  const soundClone = scatterSound.cloneNode();
  soundClone.play();
  setTimeout(() => {
    soundClone.pause();
    soundClone.currentTime = 0;
  }, 1000);
}

function playGameOverSong() {
  const soundClone = gameOverSound.cloneNode();
  soundClone.play();
  setTimeout(() => {
    soundClone.pause();
    soundClone.currentTime = 0;
  }, 3000);
}

export function clearMoveable(obj) {
  obj.leftMovable = false;
  obj.rightMovable = false;

  game.downHeld = false;

  if (game.dropIntervalId) {
    clearInterval(game.dropIntervalId);
    game.dropIntervalId = null;
  }
}

function gameOver() {
  ctx.fillStyle = "burlywood";
  ctx.fillRect(0, 0, 200, 200);
  playGameOverSong();
  gameOverAnimation(() => {
    showGameOverText();
    showRestartButton();
  });
}

function gameOverAnimation(callback) {
  let alpha = 1;

  const fadeInterval = setInterval(() => {
    drawBoardWithAlpha(alpha); // redraw board with fading opacity
    alpha -= 0.05;
    if (alpha <= 0) {
      clearInterval(fadeInterval);
      callback(); // Run next steps (text, sound, restart button)
    }
  }, 100);
}

function showGameOverText() {
  context.fillStyle = "burlywood";
  context.fillRect(0, 0, gameWidth, gameHeight);

  context.fillStyle = "rgba(0, 0, 0, 0.7)";
  context.fillRect(0, gameHeight / 2 - 40, gameWidth, 80);

  context.fillStyle = "red";
  context.font = "bold 48px Arial";
  context.textAlign = "center";
  context.fillText("GAME OVER", gameWidth / 2, gameHeight / 2 + 15);
}

function showRestartButton() {
  const btn = document.createElement("button");
  btn.innerText = "Restart Game";
  btn.classList.add("restart-button");
  gameBox.appendChild(btn);

  btn.onclick = () => {
    restartGame();
  };
}

function drawBoardWithAlpha(alpha) {
  context.fillStyle = "burlywood";
  context.fillRect(0, 0, gameWidth, gameHeight);
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (boxes[row][col]) {
        context.globalAlpha = alpha;
        drawCell(col, row, boxes[row][col]);
        context.globalAlpha = 1;
      }
    }
  }
}

export function occupy() {
  boxes[game.indexA].occupied = true;
  boxes[game.indexB].occupied = true;
  boxes[game.indexC].occupied = true;
  boxes[game.indexD].occupied = true;
}

function animateParticles() {
  if (particles.length > 0) {
    requestAnimationFrame(animateParticles);
    updateParticles();
    refreshBoard();
    particles.forEach((p) => p.draw(context));
  }
}

function updateParticles() {
  particles.forEach((p) => p.update());
  const storageArray = particles.filter((p) => p.isAlive());
  particles.length = 0;
  particles.push(...storageArray);
}

export function changethings(event) {
  const shape = currentShape[0];
  if (!shape) return;
  if (currentShape.length > 0) handleShapeInput(shape, event);

  if (event.code === "Space" || event.key === " ") {
    event.preventDefault();
    pauseGame();
  }
}
export function pauseGame() {
  if (game.gameEnded) {
    return;
  } else {
    if (game.running) {
      if (currentShape.length == 0) {
      } else {
        pauseShape(currentShape[0]);
      }
      game.running = false;
      Timer.pause();
      pauseBtn.textContent = "Resume";
    } else {
      game.running = true;
      pauseBtn.textContent = "Pause";
      Timer.resume();
      if (currentShape.length == 0) {
        startNextShape();
      } else {
        reanimateShape(currentShape[0]);
      }
    }
  }
}

function pauseShape(shape) {
  clearTimeout(shape.timeoutId);
  shape.draw(shape.shapeX, shape.shapeY);
  shape.moving = false;
}

function reanimateShape(shape) {
  shape.animate(shape.shapeX, shape.shapeY, normalDropSpeed);
}

function handleShapeInput(shape, event) {
  if (!shape.moving) return;

  if (event.keyCode === LEFT && shape.leftMoveable) {
    playMoveSound();
    refreshBoard();
    shape.shapeX -= unit;
    clearTimeout(shape.timeoutId);
    shape.animate(shape.shapeX, shape.shapeY, normalDropSpeed);
    shape.findIndex(shape.shapeX, shape.shapeY);
    shape.updateMovability();
    shape.updateRotability();
  } else if (event.keyCode === RIGHT && shape.rightMoveable) {
    playMoveSound();
    refreshBoard();
    shape.shapeX += unit;
    clearTimeout(shape.timeoutId);
    shape.animate(shape.shapeX, shape.shapeY, normalDropSpeed);
    shape.findIndex(shape.shapeX, shape.shapeY);
    shape.updateMovability();
    shape.updateRotability();
  } else if (
    event.keyCode === DOWN &&
    !game.downHeld &&
    shape.speedable &&
    shape.moving
  ) {
    game.downHeld = true;
    clearTimeout(shape.timeoutId);
    game.dropIntervalId = setInterval(() => {
      if (shape.downMoveable) {
        refreshBoard();
        shape.shapeY += unit;
        shape.findIndex(shape.shapeX, shape.shapeY);
        shape.updateMovability();
        shape.updateSpeedable();
        shape.updateRotability();
        if (!shape.speedable) window.dispatchEvent(fakeKeyUp);
        shape.draw(shape.shapeX, shape.shapeY);
      } else {
        occupy();
        clearInterval(game.dropIntervalId);
        game.dropIntervalId = null;
        game.downHeld = false;
        dropAndClear();
        checkGameOver(
          shape,
          game.indexA,
          game.indexB,
          game.indexC,
          game.indexD
        );
        currentShape.length = 0;
        shape.moving = false;
        clearMoveable(shape);
      }
    }, fastDropSpeed);
  }

  if (event.keyCode === ROTATE1 && shape.rotable1) {
    const shape = currentShape[0];
    clearTimeout(shape.timeoutId);

    let newShape = shape.rotate1;

    const x = shape.shapeX;
    const y = shape.shapeY;

    currentShape[0] = newShape;
    switch (shape) {
      case I:
        newShape.shapeX = x - 75;
        newShape.shapeY = y;
        break;
      case I2:
        newShape.shapeX = x;
        newShape.shapeY = y - 75;
        break;
      case T2:
        newShape.shapeX = x;
        newShape.shapeY = y + 25;
        break;
      case S2:
        newShape.shapeX = x;
        newShape.shapeY = y + 25;
        break;
      case Z:
        newShape.shapeX = x + 25;
        newShape.shapeY = y;
        break;
      case Z2:
        newShape.shapeX = x;
        newShape.shapeY = y + 25;
        break;
      default:
        newShape.shapeX = x;
        newShape.shapeY = y;
        break;
    }

    refreshBoard();
    newShape.findIndex(newShape.shapeX, newShape.shapeY);
    newShape.updateMovability();
    newShape.updateRotability();
    newShape.animate(newShape.shapeX, newShape.shapeY, normalDropSpeed);
  }

  if (event.keyCode === ROTATE2 && shape.rotable2) {
    const shape = currentShape[0];
    clearTimeout(shape.timeoutId);

    let newShape = shape.rotate2;

    const x = shape.shapeX;
    const y = shape.shapeY;

    currentShape[0] = newShape;
    switch (shape) {
      case T:
        newShape.shapeX = x;
        newShape.shapeY = y - 25;
        break;
      case S2:
        newShape.shapeX = x;
        newShape.shapeY = y + 25;
        break;
      case Z:
        newShape.shapeX = x + 25;
        newShape.shapeY = y;
        break;
      case Z2:
        newShape.shapeX = x;
        newShape.shapeY = y + 25;
        break;
      case L1:
        newShape.shapeX = x;
        newShape.shapeY = y - 25;
        break;
      case L2:
        newShape.shapeX = x + 25;
        newShape.shapeY = y;
        break;
      case L4:
        newShape.shapeX = x + 50;
        newShape.shapeY = y;
        break;
      default:
        newShape.shapeX = x;
        newShape.shapeY = y;
    }

    refreshBoard();
    newShape.findIndex(newShape.shapeX, newShape.shapeY);
    newShape.updateMovability();
    newShape.updateRotability();
    newShape.animate(newShape.shapeX, newShape.shapeY, normalDropSpeed);
  }

  if (event.keyCode === ROTATE3 && shape.rotable3) {
    const shape = currentShape[0];
    clearTimeout(shape.timeoutId);

    let newShape = shape.rotate3;

    const x = shape.shapeX;
    const y = shape.shapeY;

    currentShape[0] = newShape;

    switch (shape) {
      case T4:
        newShape.shapeX = x;
        newShape.shapeY = y + 25;
        break;
      case S2:
        newShape.shapeX = x + 25;
        newShape.shapeY = y;
        break;
      case Z2:
        newShape.shapeX = x - 25;
        newShape.shapeY = y;
        break;
      default:
        newShape.shapeX = x;
        newShape.shapeY = y;
    }
    refreshBoard();
    newShape.findIndex(newShape.shapeX, newShape.shapeY);
    newShape.updateMovability();
    newShape.updateRotability();
    newShape.animate(newShape.shapeX, newShape.shapeY, normalDropSpeed);
  }

  if (event.keyCode === ROTATE4 && shape.rotable4) {
    const shape = currentShape[0];
    clearTimeout(shape.timeoutId);

    let newShape = shape.rotate4;

    const x = shape.shapeX;
    const y = shape.shapeY;

    currentShape[0] = newShape;
    switch (shape) {
      case T4:
        newShape.shapeX = x;
        newShape.shapeY = y + 25;
        break;
      case S2:
        newShape.shapeX = x + 25;
        newShape.shapeY = y;
        break;
      case Z2:
        newShape.shapeX = x - 25;
        newShape.shapeY = y;
        break;
      default:
        newShape.shapeX = x;
        newShape.shapeY = y;
    }
    refreshBoard();
    newShape.findIndex(newShape.shapeX, newShape.shapeY);
    newShape.updateMovability();
    newShape.updateRotability();
    newShape.animate(newShape.shapeX, newShape.shapeY, normalDropSpeed);
  }
}

export function normalizeSpeed(event) {
  if (event.keyCode === DOWN) {
    game.downHeld = false;
    clearInterval(game.dropIntervalId);
    game.dropIntervalId = null;
    const shape = currentShape[0];
    if (shape && shape.moving && shape.downMoveable) {
      clearInterval(game.dropIntervalId);
      reanimateShape(shape);
    }
  }
}

export function checkBelow(obj, shapeheight, ...indices) {
  if (obj.shapeY >= gameHeight - (shapeheight + 25)) {
    obj.speedable = false;
  }
  const occcupied = indices.some(
    (index) => index < boxes.length && boxes[index].occupied
  );
  if (occcupied) {
    obj.speedable = false;
  }
}
export function restartGame() {
  const bt = document.querySelector(".restart-button");
  if (bt) {
    gameBox.removeChild(bt);
  }
  Timer.reset();
  game.running = true;
  game.gameEnded = false;
  if (currentShape.length != 0) {
    const shape = currentShape[0];
    clearTimeout(shape.timeoutId);
    shape.shapeX = 0;
    shape.shapeY = 0;
    (shape.moving = false), clearMoveable(shape);
  }

  rows.length = 0;
  columns.length = 0;
  boxes.length = 0;
  generateBoxes();
  refreshBoard();
  pauseBtn.textContent = "Pause";
  game.indexA = 0;
  game.indexB = 0;
  game.indexC = 0;
  game.indexD = 0;
  game.downHeld = false;
  game.keyDown = false;
  currentShape.length = 0;

  if (game.dropIntervalId) {
    clearInterval(game.dropIntervalId);
    game.dropIntervalId = null;
  }
  if (game.shapeDoneInterval) {
    clearInterval(game.shapeDoneInterval);
    game.shapeDoneInterval = null;
  }
  console.clear();
  startNextShape();
}

export function checkEmpty(...indices) {
  const isEmpty = indices.every(
    (index) => index >= 0 && index < boxes.length && !boxes[index].occupied
  );
  return isEmpty;
}

export function checkSameRow(...indices) {
  const set = new Set();
  let sameRow = false;
  indices.forEach((index) => set.add(rowIndex(index)));
  if (set.size == 1) {
    sameRow = true;
  }
  return sameRow;
}
