import { Card } from '@/components/ui/card';
import { Trophy, Zap, Target, Clock } from 'lucide-react';

interface GameStatsProps {
  score: number;
  level: number;
  lines: number;
  time: string;
}

export const GameStats = ({ score, level, lines, time }: GameStatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-4 bg-card/50 backdrop-blur border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-4 h-4 text-neon-yellow" />
          <span className="text-xs text-muted-foreground">SCORE</span>
        </div>
        <div className="text-2xl font-bold text-foreground">{score}</div>
      </Card>

      <Card className="p-4 bg-card/50 backdrop-blur border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-neon-cyan" />
          <span className="text-xs text-muted-foreground">LEVEL</span>
        </div>
        <div className="text-2xl font-bold text-foreground">{level}</div>
      </Card>

      <Card className="p-4 bg-card/50 backdrop-blur border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-neon-pink" />
          <span className="text-xs text-muted-foreground">LINES</span>
        </div>
        <div className="text-2xl font-bold text-foreground">{lines}</div>
      </Card>

      <Card className="p-4 bg-card/50 backdrop-blur border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-neon-purple" />
          <span className="text-xs text-muted-foreground">TIME</span>
        </div>
        <div className="text-2xl font-bold text-foreground">{time}</div>
      </Card>
    </div>
  );
};
