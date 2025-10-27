import { useState, useEffect, useCallback, useRef } from 'react';
import { GameBoard } from './GameBoard';
import { NextPiece } from './NextPiece';
import { GameControls } from './GameControls';
import { GameStats } from './GameStats';
import { useGameLoop } from './useGameLoop';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const TetrisGame = () => {
  const {
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
  } = useGameLoop();

  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameState.running && !gameState.paused) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.running, gameState.paused]);

  useEffect(() => {
    if (!gameState.running) {
      setTimeElapsed(0);
    }
  }, [gameState.running]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!gameState.running || gameState.paused || gameState.gameEnded) return;

      switch (e.code) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePiece(0, 1);
          break;
        case 'ArrowUp':
        case 'KeyW':
          e.preventDefault();
          rotatePiece(1);
          break;
        case 'KeyZ':
        case 'KeyA':
          e.preventDefault();
          rotatePiece(-1);
          break;
        case 'Space':
          e.preventDefault();
          hardDrop();
          break;
        case 'KeyP':
        case 'Escape':
          e.preventDefault();
          pauseGame();
          break;
      }
    },
    [gameState, movePiece, rotatePiece, hardDrop, pauseGame]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-primary via-neon-pink to-neon-cyan bg-clip-text text-transparent">
            TETRIS
          </h1>
          <p className="text-muted-foreground">Use Arrow Keys & WASD to play</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-start">
          {/* Left Panel - Stats */}
          <div className="flex flex-col gap-4">
            <GameStats
              score={gameState.score}
              level={gameState.level}
              lines={gameState.lines}
              time={formatTime(timeElapsed)}
            />

            <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
              <h3 className="text-sm font-semibold mb-3 text-primary">CONTROLS</h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Move</span>
                  <span className="text-foreground">← → ↓</span>
                </div>
                <div className="flex justify-between">
                  <span>Rotate</span>
                  <span className="text-foreground">↑ W A Z</span>
                </div>
                <div className="flex justify-between">
                  <span>Hard Drop</span>
                  <span className="text-foreground">SPACE</span>
                </div>
                <div className="flex justify-between">
                  <span>Pause</span>
                  <span className="text-foreground">P ESC</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Center - Game Board */}
          <div className="flex flex-col items-center gap-4">
            <GameBoard
              board={board}
              currentPiece={currentPiece}
              particles={particles}
              gameEnded={gameState.gameEnded}
              paused={gameState.paused}
            />

            <GameControls
              gameState={gameState}
              onStart={startGame}
              onPause={pauseGame}
              onRestart={restartGame}
            />
          </div>

          {/* Right Panel - Next Piece */}
          <div className="flex flex-col gap-4">
            <NextPiece piece={nextPiece} />

            {gameState.gameEnded && (
              <Card className="p-6 bg-destructive/20 backdrop-blur border-destructive/50">
                <h3 className="text-xl font-bold mb-2 text-destructive">GAME OVER</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Final Score: {gameState.score}
                </p>
                <Button onClick={restartGame} className="w-full" variant="destructive">
                  Play Again
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
