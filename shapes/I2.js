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

export let I2 = {
  name: "I2",
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
    const multiples = Math.floor((500 - 100) / 25);
    const randomMultiple = Math.floor(Math.random() * (multiples + 1));
    this.shapeX = randomMultiple * 25;
  },

  draw: function (x, y) {
    (currentShape[0] = I2), drawBlock(x, y);
    drawBlock(x + 25, y);
    drawBlock(x + 50, y);
    drawBlock(x + 75, y);
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
          checkGameOver(
            this,
            game.indexA,
            game.indexB,
            game.indexC,
            game.indexD
          );
          currentShape.length = 0;
          (this.moving = false), clearMoveable(this);
        }
      }, speed || 500);
    }
  },

  findIndex: function (x, y) {
    game.indexA = calculateIndex(x, y);
    game.indexB = game.indexA + 1;
    game.indexC = game.indexB + 1;
    game.indexD = game.indexC + 1;
  },

  updateMovability: function () {
    this.leftMoveable = checkLeft(game.indexA);
    this.rightMoveable = checkRight(game.indexD);
    this.downMoveable = checkDown(
      game.indexA,
      game.indexB,
      game.indexC,
      game.indexD
    );
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
    const belowIndexA = game.indexA + 40;
    const belowIndexB = game.indexB + 40;
    const belowIndexC = game.indexC + 40;
    const belowIndexD = game.indexD + 40;
    checkBelow(this, 50, belowIndexA, belowIndexB, belowIndexC, belowIndexD);
  },

  updateRotability: function () {
    this.rotable1 = checkEmpty(
      game.indexA - 20,
      game.indexA - 40,
      game.indexA - 60
    );
    this.rotable2 = checkEmpty(
      game.indexA + 20,
      game.indexA + 40,
      game.indexA + 60
    );
  },
};
