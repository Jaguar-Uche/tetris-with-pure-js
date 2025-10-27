export interface Position {
  x: number;
  y: number;
}

export interface Box {
  startCoordinates: [number, number];
  endCoordinates: [number, number];
  occupied: boolean;
  color?: string;
}

export interface GameState {
  running: boolean;
  paused: boolean;
  gameEnded: boolean;
  score: number;
  level: number;
  lines: number;
}

export interface Shape {
  name: string;
  blocks: Position[];
  color: string;
  rotationIndex: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}
