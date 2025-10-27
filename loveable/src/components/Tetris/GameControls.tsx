import { Button } from '@/components/ui/button';
import { GameState } from './types';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface GameControlsProps {
  gameState: GameState;
  onStart: () => void;
  onPause: () => void;
  onRestart: () => void;
}

export const GameControls = ({ gameState, onStart, onPause, onRestart }: GameControlsProps) => {
  return (
    <div className="flex gap-2 justify-center">
      {!gameState.running ? (
        <Button onClick={onStart} size="lg" className="gap-2">
          <Play className="w-4 h-4" />
          Start Game
        </Button>
      ) : (
        <>
          <Button onClick={onPause} size="lg" variant="secondary" className="gap-2">
            {gameState.paused ? (
              <>
                <Play className="w-4 h-4" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            )}
          </Button>
          <Button onClick={onRestart} size="lg" variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Restart
          </Button>
        </>
      )}
    </div>
  );
};
