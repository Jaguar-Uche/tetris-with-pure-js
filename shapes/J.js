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
  checkEmpty,
  checkSameRow,
} from "../functions.js";
import { currentShape, game, normalDropSpeed } from "../index.js";

export let J = {
  name: "J",
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
    const multiples = Math.floor((500 - 25) / 25);
    const randomMultiple = Math.floor(Math.random() * multiples);
    this.shapeX = 25 + randomMultiple * 25;
  },

  draw: function (x, y) {
    (currentShape[0] = J), drawBlock(x, y);
    drawBlock(x, y + 25);
    drawBlock(x - 25, y + 50);
    drawBlock(x, y + 50);
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
      this.updateRotability();
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => {
        if (this.downMoveable) {
          refreshBoard();
          this.shapeY += 25;
          this.animate(this.shapeX, this.shapeY, normalDropSpeed);
        } else {
          occupy();
          dropAndClear();
          checkGameOver(this, game.indexA, game.indexD);
          currentShape.length = 0;
          (this.moving = false), clearMoveable(this);
        }
      }, speed || 500);
    }
  },

  findIndex: function (x, y) {
    game.indexA = calculateIndex(x, y);
    game.indexB = game.indexA + 20;
    game.indexC = game.indexB + 20;
    game.indexD = game.indexC - 1;
  },

  updateMovability: function () {
    this.leftMoveable = checkLeft(game.indexA, game.indexB, game.indexD);
    this.rightMoveable = checkRight(game.indexA, game.indexB, game.indexC);
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
    checkBelow(this, 75, belowIndexC, belowIndexD);
  },

  updateRotability: function () {
    this.rotable1 =
      checkEmpty(game.indexA - 1, game.indexA - 2) &&
      checkSameRow(game.indexA - 1, game.indexA - 2);
    this.rotable2 =
      checkEmpty(game.indexB + 1, game.indexB + 2) &&
      checkSameRow(game.indexB, game.indexB + 1, game.indexB + 2);
    this.rotable3 = checkEmpty(game.indexA - 1);
    this.rotable4 = checkEmpty(game.indexA - 1);
  },
};
