import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { PREVIEW_BLOCK_SIZE, PREVIEW_SIZE } from './constants';

interface NextPieceProps {
  piece: { blocks: { x: number; y: number }[]; color: string } | null;
}

export const NextPiece = ({ piece }: NextPieceProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasSize = PREVIEW_SIZE * PREVIEW_BLOCK_SIZE;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    if (!piece) return;

    // Calculate bounds to center the piece
    const minX = Math.min(...piece.blocks.map((b) => b.x));
    const maxX = Math.max(...piece.blocks.map((b) => b.x));
    const minY = Math.min(...piece.blocks.map((b) => b.y));
    const maxY = Math.max(...piece.blocks.map((b) => b.y));

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;

    const offsetX = (PREVIEW_SIZE - width) / 2 - minX;
    const offsetY = (PREVIEW_SIZE - height) / 2 - minY;

    // Draw blocks
    piece.blocks.forEach((block) => {
      const x = (block.x + offsetX) * PREVIEW_BLOCK_SIZE;
      const y = (block.y + offsetY) * PREVIEW_BLOCK_SIZE;

      // Outer glow
      ctx.shadowColor = piece.color;
      ctx.shadowBlur = 8;

      // Main block
      ctx.fillStyle = piece.color;
      ctx.fillRect(x + 1, y + 1, PREVIEW_BLOCK_SIZE - 2, PREVIEW_BLOCK_SIZE - 2);

      // Inner highlight
      const gradient = ctx.createLinearGradient(x, y, x + PREVIEW_BLOCK_SIZE, y + PREVIEW_BLOCK_SIZE);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(x + 1, y + 1, PREVIEW_BLOCK_SIZE - 2, PREVIEW_BLOCK_SIZE - 2);

      // Border
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, PREVIEW_BLOCK_SIZE - 1, PREVIEW_BLOCK_SIZE - 1);
    });
  }, [piece, canvasSize]);

  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
      <h3 className="text-sm font-semibold mb-3 text-primary">NEXT</h3>
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="border border-primary/30 rounded"
          style={{
            background: 'linear-gradient(180deg, #0a0a0f 0%, #1a0a2e 100%)',
          }}
        />
      </div>
    </Card>
  );
};
