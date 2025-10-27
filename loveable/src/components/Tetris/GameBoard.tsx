import { useEffect, useRef } from 'react';
import { Box, Particle } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, BLOCK_SIZE, BOARD_WIDTH, BOARD_HEIGHT } from './constants';

interface GameBoardProps {
  board: Box[][];
  currentPiece: {
    shape: { blocks: { x: number; y: number }[]; color: string } | null;
    x: number;
    y: number;
  } | null;
  particles: Particle[];
  gameEnded: boolean;
  paused: boolean;
}

export const GameBoard = ({ board, currentPiece, particles, gameEnded, paused }: GameBoardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * BLOCK_SIZE, 0);
      ctx.lineTo(x * BLOCK_SIZE, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * BLOCK_SIZE);
      ctx.lineTo(CANVAS_WIDTH, y * BLOCK_SIZE);
      ctx.stroke();
    }

    // Draw placed blocks
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (board[y][x].occupied) {
          drawBlock(ctx, x * BLOCK_SIZE, y * BLOCK_SIZE, board[y][x].color || '#ffffff');
        }
      }
    }

    // Draw current piece
    if (currentPiece?.shape) {
      const { shape, x, y } = currentPiece;
      shape.blocks.forEach((block) => {
        const drawX = (x + block.x) * BLOCK_SIZE;
        const drawY = (y + block.y) * BLOCK_SIZE;
        if (drawY >= 0) {
          drawBlock(ctx, drawX, drawY, shape.color);
        }
      });
    }

    // Draw particles
    particles.forEach((particle) => {
      ctx.save();
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw overlays
    if (paused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }

    if (gameEnded) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }
  }, [board, currentPiece, particles, gameEnded, paused]);

  const drawBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    // Outer glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;

    // Main block
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);

    // Inner highlight
    const gradient = ctx.createLinearGradient(x, y, x + BLOCK_SIZE, y + BLOCK_SIZE);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);

    // Border
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-2 border-primary/50 rounded-lg shadow-[0_0_40px_rgba(139,92,246,0.3)]"
        style={{
          background: 'linear-gradient(180deg, #0a0a0f 0%, #1a0a2e 100%)',
        }}
      />
    </div>
  );
};
