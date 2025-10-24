import {
  changethings,
  pauseGame,
  restartGame,
  normalizeSpeed,
  gameStart,
} from "../functions.js";
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

let canvas = document.getElementById("gameContext");
export let context = canvas.getContext("2d");
let canva = document.getElementById("shapeContext");
export let ctx = canva.getContext("2d");
export let gameBox = document.getElementById("gameContainer");
export let boxes = [];
export let rows = [];
export let columns = [];
export let particles = [];
export let currentShape = [];
export let shapeObjects = [];
export let game = {
  running: false,
  keyPressed: null,
  downHeld: false,
  gameEnded: false,
  dropIntervalId: null,
  shapeDoneInterval: null,
  nextShape: null,
  indexA: null,
  indexB: null,
  indexC: null,
  indexD: null,
};
export let score = 0;
export let fastDropSpeed = 100;
export let normalDropSpeed = 500;
export const pauseBtn = document.querySelector("#pause");
export const restartBtn = document.querySelector("#restart");
export const gameWidth = 500;
export const gameHeight = gameWidth;
export const unit = gameHeight / 20;
export const ROWS = unit;
export const COLS = unit;
export const LEFT = 37;
export const RIGHT = 39;
export const DOWN = 40;
export const ROTATE1 = 65; //A
export const ROTATE2 = 68; //D
export const ROTATE3 = 87; //W
export const ROTATE4 = 83; //S

export const moveSound = new Audio("sounds/move.mp3");
moveSound.preload = "auto";
export const scatterSound = new Audio("sounds/wind.mp3");
scatterSound.preload = "auto";
export const gameOverSound = new Audio("sounds/tetristheme.mp3");
gameOverSound.preload = "auto";

export const fakeKeyUp = new KeyboardEvent("keyup", {
  keyCode: 40,
  which: 40,
  code: "ArrowDown",
  key: "ArrowDown",
  bubbles: true,
});

export const nextShapeArrays = {
  O: [
    [75, 75],
    [75, 100],
    [100, 75],
    [100, 100],
  ],
  I: [
    [90, 50],
    [90, 75],
    [90, 100],
    [90, 125],
  ],
  I2: [
    [50, 75],
    [75, 75],
    [100, 75],
    [125, 75],
  ],

  T: [
    [60, 75],
    [85, 75],
    [110, 75],
    [85, 100],
  ],
  T1: [
    [75, 50],
    [75, 75],
    [100, 75],
    [75, 100],
  ],
  T2: [
    [90, 50],
    [90, 75],
    [65, 75],
    [90, 100],
  ],
  T4: [
    [60, 100],
    [85, 100],
    [110, 100],
    [85, 75],
  ],

  S: [
    [110, 75],
    [85, 75],
    [85, 100],
    [60, 100],
  ],
  S2: [
    [70, 60],
    [70, 85],
    [95, 85],
    [95, 110],
  ],

  Z: [
    [60, 75],
    [85, 75],
    [85, 100],
    [110, 100],
  ],
  Z2: [
    [100, 60],
    [100, 85],
    [75, 85],
    [75, 110],
  ],

  L: [
    [75, 50],
    [75, 75],
    [75, 100],
    [100, 100],
  ],
  L1: [
    [65, 95],
    [90, 95],
    [115, 95],
    [115, 70],
  ],
  L2: [
    [65, 95],
    [65, 70],
    [90, 70],
    [115, 70],
  ],
  L4: [
    [75, 50],
    [75, 75],
    [75, 100],
    [100, 50],
  ],

  J: [
    [90, 50],
    [90, 75],
    [90, 100],
    [65, 100],
  ],
  J1: [
    [65, 70],
    [90, 70],
    [115, 70],
    [115, 95],
  ],
  J2: [
    [65, 70],
    [65, 95],
    [90, 95],
    [115, 95],
  ],
  J4: [
    [100, 50],
    [100, 75],
    [100, 100],
    [75, 50],
  ],
};

window.addEventListener("keydown", changethings);
pauseBtn.addEventListener("click", pauseGame);
restartBtn.addEventListener("click", restartGame);
window.addEventListener("keyup", normalizeSpeed);

export class Particle {
  constructor(x, y) {
    this.x = x + 12.5;
    this.y = y + 12.5;
    this.vx = (Math.random() - 0.5) * 3;
    this.vy = (Math.random() - 1.5) * 3;
    this.size = Math.random() * 3 + 2;
    this.alpha = 1;

    const colors = ["#00bcd4", "#e91e63", "#ffc107", "#673ab7", "#4caf50"];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 0.02;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  isAlive() {
    return this.alpha > 0;
  }
}

I.rotate1 = I2;
I.rotate2 = I2;

I2.rotate1 = I;
I2.rotate2 = I;

T.rotate1 = T1;
T.rotate2 = T2;
T.rotate3 = T4;
T.rotate4 = T4;

T1.rotate1 = T4;
T1.rotate2 = T;

T2.rotate1 = T;
T2.rotate2 = T4;

T4.rotate1 = T2;
T4.rotate2 = T1;
T4.rotate3 = T;
T4.rotate4 = T;

S.rotate1 = S2;
S.rotate2 = S2;
S.rotate3 = Z;
S.rotate4 = Z;

S2.rotate1 = S;
S2.rotate2 = S;
S2.rotate3 = Z2;
S2.rotate4 = Z2;

Z.rotate1 = Z2;
Z.rotate2 = Z2;
Z.rotate3 = S;
Z.rotate4 = S;

Z2.rotate1 = Z;
Z2.rotate2 = Z;
Z2.rotate3 = S2;
Z2.rotate4 = S2;

L.rotate1 = L1;
L.rotate2 = L2;
L.rotate3 = L4;
L.rotate4 = L4;

L1.rotate1 = J4;
L1.rotate2 = L;
L1.rotate3 = J1;
L1.rotate4 = J1;

L2.rotate1 = L;
L2.rotate2 = J4;
L2.rotate3 = J2;
L2.rotate4 = J2;

L4.rotate1 = J2;
L4.rotate2 = J1;
L4.rotate3 = L;
L4.rotate4 = L;

J.rotate1 = J1;
J.rotate2 = J2;
J.rotate3 = J4;
J.rotate4 = J4;

J1.rotate1 = L4;
J1.rotate2 = J;
J1.rotate3 = L1;
J1.rotate4 = L1;

J2.rotate1 = J;
J2.rotate2 = L4;
J2.rotate3 = L2;
J2.rotate4 = L2;

J4.rotate1 = L2;
J4.rotate2 = L1;
J4.rotate3 = J;
J4.rotate4 = J;

shapeObjects.push(
  O,
  I,
  I2,
  T,
  T1,
  T2,
  T4,
  S,
  S2,
  Z,
  Z2,
  L,
  L1,
  L2,
  L4,
  J,
  J1,
  J2,
  J4
);
gameStart();
