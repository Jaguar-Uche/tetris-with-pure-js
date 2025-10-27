import { useState, useEffect, useCallback, useRef } from 'react';
import { Box, GameState, Particle } from './types';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  SHAPES,
  SHAPE_KEYS,
  INITIAL_DROP_SPEED,
  LEVEL_SPEED_DECREASE,
  BLOCK_SIZE,
} from './constants';
import { toast } from 'sonner';

export const useGameLoop = () => {
  const [gameState, setGameState] = useState<GameState>({
    running: false,
    paused: false,
    gameEnded: false,
    score: 0,
    level: 1,
    lines: 0,
  });

  const [board, setBoard] = useState<Box[][]>(() =>
    Array.from({ length: BOARD_HEIGHT }, () =>
      Array.from({ length: BOARD_WIDTH }, () => ({
        startCoordinates: [0, 0] as [number, number],
        endCoordinates: [0, 0] as [number, number],
        occupied: false,
        color: undefined,
      }))
    )
  );

  const [currentPiece, setCurrentPiece] = useState<{
    shape: { blocks: { x: number; y: number }[]; color: string } | null;
    x: number;
    y: number;
  } | null>(null);

  const [nextPiece, setNextPiece] = useState<{
    blocks: { x: number; y: number }[];
    color: string;
  } | null>(null);

  const [particles, setParticles] = useState<Particle[]>([]);

  const dropIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const particleAnimationRef = useRef<number | null>(null);

  const createRandomPiece = useCallback(() => {
    const shapeKey = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
    const shape = SHAPES[shapeKey];
    const rotationIndex = 0;
    return {
      blocks: shape.rotations[rotationIndex],
      color: shape.color,
      name: shape.name,
      rotationIndex,
      rotations: shape.rotations,
    };
  }, []);

  const checkCollision = useCallback(
    (piece: { blocks: { x: number; y: number }[] }, x: number, y: number) => {
      return piece.blocks.some((block) => {
        const newX = x + block.x;
        const newY = y + block.y;
        return (
          newX < 0 ||
          newX >= BOARD_WIDTH ||
          newY >= BOARD_HEIGHT ||
          (newY >= 0 && board[newY][newX].occupied)
        );
      });
    },
    [board]
  );

  const placePiece = useCallback(() => {
    if (!currentPiece?.shape) return;

    setBoard((prev) => {
      const newBoard = prev.map((row) => [...row]);
      currentPiece.shape!.blocks.forEach((block) => {
        const x = currentPiece.x + block.x;
        const y = currentPiece.y + block.y;
        if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
          newBoard[y][x] = {
            ...newBoard[y][x],
            occupied: true,
            color: currentPiece.shape!.color,
          };
        }
      });
      return newBoard;
    });
  }, [currentPiece]);

  const clearLines = useCallback(() => {
    let linesCleared = 0;
    const newBoard = board.filter((row, y) => {
      const isFull = row.every((cell) => cell.occupied);
      if (isFull) {
        linesCleared++;
        // Create particles
        row.forEach((_, x) => {
          for (let i = 0; i < 5; i++) {
            setParticles((prev) => [
              ...prev,
              {
                x: x * BLOCK_SIZE + BLOCK_SIZE / 2,
                y: y * BLOCK_SIZE + BLOCK_SIZE / 2,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 1.5) * 3,
                size: Math.random() * 3 + 2,
                alpha: 1,
                color: row[x].color || '#ffffff',
              },
            ]);
          }
        });
        return false;
      }
      return true;
    });

    if (linesCleared > 0) {
      // Add cleared lines back at the top
      const emptyLines = Array.from({ length: linesCleared }, () =>
        Array.from({ length: BOARD_WIDTH }, () => ({
          startCoordinates: [0, 0] as [number, number],
          endCoordinates: [0, 0] as [number, number],
          occupied: false,
          color: undefined,
        }))
      );

      setBoard([...emptyLines, ...newBoard]);

      const points = [0, 100, 300, 500, 800][linesCleared] || 0;
      setGameState((prev) => ({
        ...prev,
        score: prev.score + points * prev.level,
        lines: prev.lines + linesCleared,
        level: Math.floor((prev.lines + linesCleared) / 10) + 1,
      }));

      if (linesCleared >= 4) {
        toast.success('TETRIS! 🎉');
      } else if (linesCleared > 1) {
        toast.success(`${linesCleared} Lines!`);
      }
    }
  }, [board]);

  const spawnPiece = useCallback(() => {
    const piece = nextPiece || createRandomPiece();
    const startX = Math.floor(BOARD_WIDTH / 2) - 2;
    const startY = 0;

    setCurrentPiece({
      shape: piece,
      x: startX,
      y: startY,
    });

    setNextPiece(createRandomPiece());

    // Check game over
    if (checkCollision(piece, startX, startY)) {
      setGameState((prev) => ({ ...prev, running: false, gameEnded: true }));
      toast.error('Game Over!');
    }
  }, [nextPiece, createRandomPiece, checkCollision]);

  const movePiece = useCallback(
    (dx: number, dy: number) => {
      if (!currentPiece?.shape) return false;

      const newX = currentPiece.x + dx;
      const newY = currentPiece.y + dy;

      if (!checkCollision(currentPiece.shape, newX, newY)) {
        setCurrentPiece({ ...currentPiece, x: newX, y: newY });
        return true;
      }

      return false;
    },
    [currentPiece, checkCollision]
  );

  const rotatePiece = useCallback(
    (direction: number) => {
      if (!currentPiece?.shape) return;

      const shape = currentPiece.shape as any;
      const newRotationIndex =
        (shape.rotationIndex + direction + shape.rotations.length) % shape.rotations.length;
      const newBlocks = shape.rotations[newRotationIndex];

      const newShape = {
        ...shape,
        blocks: newBlocks,
        rotationIndex: newRotationIndex,
      };

      if (!checkCollision(newShape, currentPiece.x, currentPiece.y)) {
        setCurrentPiece({ ...currentPiece, shape: newShape });
      }
    },
    [currentPiece, checkCollision]
  );

  const hardDrop = useCallback(() => {
    if (!currentPiece?.shape) return;

    let newY = currentPiece.y;
    while (!checkCollision(currentPiece.shape, currentPiece.x, newY + 1)) {
      newY++;
    }

    setCurrentPiece({ ...currentPiece, y: newY });
    placePiece();
    clearLines();
    spawnPiece();
  }, [currentPiece, checkCollision, placePiece, clearLines, spawnPiece]);

  const dropPiece = useCallback(() => {
    if (!movePiece(0, 1)) {
      placePiece();
      clearLines();
      spawnPiece();
    }
  }, [movePiece, placePiece, clearLines, spawnPiece]);

  const startGame = useCallback(() => {
    setGameState({
      running: true,
      paused: false,
      gameEnded: false,
      score: 0,
      level: 1,
      lines: 0,
    });
    setBoard(
      Array.from({ length: BOARD_HEIGHT }, () =>
        Array.from({ length: BOARD_WIDTH }, () => ({
          startCoordinates: [0, 0] as [number, number],
          endCoordinates: [0, 0] as [number, number],
          occupied: false,
          color: undefined,
        }))
      )
    );
    setNextPiece(createRandomPiece());
    setTimeout(() => spawnPiece(), 100);
    toast.success('Game Started!');
  }, [createRandomPiece, spawnPiece]);

  const pauseGame = useCallback(() => {
    setGameState((prev) => ({ ...prev, paused: !prev.paused }));
  }, []);

  const restartGame = useCallback(() => {
    if (dropIntervalRef.current) {
      clearInterval(dropIntervalRef.current);
    }
    setCurrentPiece(null);
    setParticles([]);
    startGame();
  }, [startGame]);

  // Game loop
  useEffect(() => {
    if (gameState.running && !gameState.paused && !gameState.gameEnded) {
      const speed = Math.max(
        INITIAL_DROP_SPEED - (gameState.level - 1) * LEVEL_SPEED_DECREASE,
        100
      );
      dropIntervalRef.current = setInterval(dropPiece, speed);
    } else {
      if (dropIntervalRef.current) {
        clearInterval(dropIntervalRef.current);
        dropIntervalRef.current = null;
      }
    }

    return () => {
      if (dropIntervalRef.current) {
        clearInterval(dropIntervalRef.current);
      }
    };
  }, [gameState, dropPiece]);

  // Particle animation
  useEffect(() => {
    if (particles.length > 0) {
      const animate = () => {
        setParticles((prev) => {
          return prev
            .map((p) => ({
              ...p,
              x: p.x + p.vx,
              y: p.y + p.vy,
              alpha: p.alpha - 0.02,
            }))
            .filter((p) => p.alpha > 0);
        });
        particleAnimationRef.current = requestAnimationFrame(animate);
      };
      particleAnimationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (particleAnimationRef.current) {
        cancelAnimationFrame(particleAnimationRef.current);
      }
    };
  }, [particles.length > 0]);

  return {
    gameState,
    board,
    currentPiece,
    nextPiece,
    particles,
    startGame,
    pauseGame,
    restartGame,
    movePiece,
    rotatePiece,
    hardDrop,
  };
};
