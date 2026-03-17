import { Trophy, CheckSquare, Target, Flame, TrendingUp } from "lucide-react";
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

  // Motivational message based on progress
  const getMotivation = () => {
    if (completionRate === 0) return { text: "Prêt à commencer ? 🚀", sub: "Choisis un cours ci-dessous" };
    if (completionRate < 25) return { text: "Bon début ! Continue comme ça 💪", sub: "Chaque section compte" };
    if (completionRate < 50) return { text: "Tu avances bien ! 🔥", sub: "Presque à mi-chemin" };
    if (completionRate < 75) return { text: "Impressionnant ! 🌟", sub: "Plus de la moitié déjà" };
    if (completionRate < 100) return { text: "Presque au sommet ! 🏔️", sub: "La fin est proche" };
    return { text: "Tout terminé ! Champion ! 🏆", sub: "Tu maîtrises tes cours" };
  };

  const motivation = getMotivation();

  return (
    <div className="space-y-4">
      {/* Motivational banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/8 via-secondary/5 to-accent/8 border border-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-base">{motivation.text}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{motivation.sub}</p>
          </div>
          {/* Circular progress */}
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
              <circle
                cx="28" cy="28" r="24"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - completionRate / 100)}`}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--secondary))" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-black">
              {completionRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        <StatCard
          icon={Trophy}
          label="Score total"
          value={totalScore}
          subValue={`${percentage}%`}
          color="text-amber-500"
          bgColor="bg-amber-500/10"
          borderColor="border-amber-500/20"
        />
        <StatCard
          icon={CheckSquare}
          label="Sections validées"
          value={sectionsCompleted}
          subValue={`/${totalSections}`}
          color="text-secondary"
          bgColor="bg-secondary/10"
          borderColor="border-secondary/20"
        />
        <StatCard
          icon={Target}
          label="Questions"
          value={totalQuestions}
          subValue="répondues"
          color="text-primary"
          bgColor="bg-primary/10"
          borderColor="border-primary/20"
        />
        <StatCard
          icon={Flame}
          label="Progression"
          value={`${completionRate}%`}
          subValue="complété"
          color="text-orange-500"
          bgColor="bg-orange-500/10"
          borderColor="border-orange-500/20"
        />
      </div>
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
  borderColor: string;
}

function StatCard({ icon: Icon, label, value, subValue, color, bgColor, borderColor }: StatCardProps) {
  return (
    <div className={cn(
      "p-3.5 rounded-2xl border bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-all duration-200",
      borderColor
    )}>
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-2.5", bgColor)}>
        <Icon className={cn("w-4.5 h-4.5", color)} />
      </div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
      <p className="text-xl font-black mt-1 tracking-tight">
        {value}
        <span className="text-sm font-medium text-muted-foreground ml-1">{subValue}</span>
      </p>
    </div>
  );
}
