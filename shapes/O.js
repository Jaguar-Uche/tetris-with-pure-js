import {
  drawBlock,
  refreshBoard,
  calculateIndex,
  checkLeft,
  checkRight,
  checkDown,
  dropAndClear,
  clearMoveable,
  checkGameOver,
  occupy,
  checkBelow,
} from "../functions.js";
import { currentShape, game, normalDropSpeed } from "../index.js";

export let O = {
  name: "O",
  moving: false,
  shapeX: 0,
  shapeY: 0,
  speedable: false,
  leftMoveable: false,
  rightMoveable: false,
  downMoveable: false,
  rotable1: false,
  rotable2: false,
  rotable3: false,
  rotable4: false,

  generateX: function () {
    const multiples = Math.floor((500 - 50) / 50);
    const randomMultiple = Math.floor(Math.random() * (multiples + 1));
    this.shapeX = randomMultiple * 50;
  },

  draw: function (x, y) {
    (currentShape[0] = O), drawBlock(x, y);
    drawBlock(x + 25, y);
    drawBlock(x, y + 25);
    drawBlock(x + 25, y + 25);
  },

  animate: function (x, y, speed) {
    if (game.running) {
      this.moving = true;
      this.shapeX = x;
      this.shapeY = y;
      this.findIndex(x, y);
      this.draw(x, y);
      this.updateMovability();
      this.updateSpeedable();
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => {
        if (this.downMoveable) {
          refreshBoard();
          this.shapeY += 25;
          this.animate(this.shapeX, this.shapeY, normalDropSpeed);
        } else {
          occupy();
          dropAndClear();
          checkGameOver(this, game.indexA, game.indexB);
          currentShape.length = 0;
          (this.moving = false), clearMoveable(this);
        }
      }, speed || 500);
    }
  },

  findIndex: function (x, y) {
    game.indexA = calculateIndex(x, y);
    game.indexB = game.indexA + 1;
    game.indexC = game.indexA + 20;
    game.indexD = game.indexB + 20;
  },

  updateMovability: function () {
    this.leftMoveable = checkLeft(game.indexA, game.indexC);
    this.rightMoveable = checkRight(game.indexB, game.indexD);
    this.downMoveable = checkDown(game.indexC, game.indexD);
    if (!this.downMoveable) {
      clearMoveable(this);
      game.downHeld = false;
      if (game.dropIntervalId) {
        clearInterval(game.dropIntervalId);
        game.dropIntervalId = null;
      }
    }
  },

  updateSpeedable: function () {
    this.speedable = true;
    const belowIndexC = game.indexC + 40;
    const belowIndexD = game.indexD + 40;
    checkBelow(this, 50, belowIndexC, belowIndexD);
  },

  updateRotability: function () {
    return;
  },
};
