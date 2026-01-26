import { Trophy, CheckSquare, Target, Flame, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsDisplayProps {
  totalScore: number;
  totalQuestions: number;
  sectionsCompleted: number;
  totalSections: number;
  compact?: boolean;
}

export function StatsDisplay({
  totalScore,
  totalQuestions,
  sectionsCompleted,
  totalSections,
  compact = false,
}: StatsDisplayProps) {
  const percentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
  const completionRate = totalSections > 0 ? Math.round((sectionsCompleted / totalSections) * 100) : 0;

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className="font-bold">{totalScore}</span>
          <span className="text-muted-foreground">pts</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckSquare className="w-4 h-4 text-secondary" />
          <span className="font-bold">{sectionsCompleted}</span>
          <span className="text-muted-foreground">sections</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        icon={Trophy}
        label="Score total"
        value={totalScore}
        subValue={`${percentage}%`}
        color="text-amber-500"
        bgColor="bg-amber-500/10"
      />
      <StatCard
        icon={CheckSquare}
        label="Sections validées"
        value={sectionsCompleted}
        subValue={`/${totalSections}`}
        color="text-secondary"
        bgColor="bg-secondary/10"
      />
      <StatCard
        icon={Target}
        label="Questions"
        value={totalQuestions}
        subValue="répondues"
        color="text-primary"
        bgColor="bg-primary/10"
      />
      <StatCard
        icon={Flame}
        label="Progression"
        value={`${completionRate}%`}
        subValue="complété"
        color="text-orange-500"
        bgColor="bg-orange-500/10"
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue: string;
  color: string;
  bgColor: string;
}

function StatCard({ icon: Icon, label, value, subValue, color, bgColor }: StatCardProps) {
  return (
    <div className="p-3 rounded-xl border border-border/50 bg-card/50">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", bgColor)}>
        <Icon className={cn("w-4 h-4", color)} />
      </div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-lg font-black mt-0.5">
        {value}
        <span className="text-sm font-normal text-muted-foreground ml-1">{subValue}</span>
      </p>
    </div>
  );
}
