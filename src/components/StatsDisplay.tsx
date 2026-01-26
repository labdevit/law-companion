import { Trophy, CheckSquare } from "lucide-react";

interface StatsDisplayProps {
  totalScore: number;
  completedCount: number;
}

export function StatsDisplay({ totalScore, completedCount }: StatsDisplayProps) {
  return (
    <div className="flex gap-3">
      <div className="flex-1 p-3 rounded-2xl border border-border/50 bg-white/[0.03]">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Trophy className="w-3.5 h-3.5" />
          Score total
        </div>
        <p className="text-xl font-black mt-1.5">{totalScore}</p>
      </div>
      <div className="flex-1 p-3 rounded-2xl border border-border/50 bg-white/[0.03]">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckSquare className="w-3.5 h-3.5" />
          Sections validées
        </div>
        <p className="text-xl font-black mt-1.5">{completedCount}</p>
      </div>
    </div>
  );
}
