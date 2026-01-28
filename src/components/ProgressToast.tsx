import { useEffect, useState } from "react";
import { CheckCircle2, Trophy, Sparkles, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressToastProps {
  type: "complete" | "uncomplete" | "reset";
  sectionsCompleted?: number;
  totalSections?: number;
  onClose: () => void;
}

export function ProgressToast({
  type,
  sectionsCompleted = 0,
  totalSections = 1,
  onClose,
}: ProgressToastProps) {
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const targetProgress = Math.round((sectionsCompleted / totalSections) * 100);

  useEffect(() => {
    // Animate progress bar
    const timer = setTimeout(() => {
      setProgress(targetProgress);
    }, 100);

    // Show confetti for completion
    if (type === "complete") {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    }

    // Auto close
    const closeTimer = setTimeout(onClose, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(closeTimer);
    };
  }, [targetProgress, type, onClose]);

  const getIcon = () => {
    switch (type) {
      case "complete":
        return <CheckCircle2 className="w-6 h-6 text-secondary" />;
      case "uncomplete":
        return <RotateCcw className="w-6 h-6 text-muted-foreground" />;
      case "reset":
        return <RotateCcw className="w-6 h-6 text-destructive" />;
    }
  };

  const getMessage = () => {
    switch (type) {
      case "complete":
        return "Section terminée ! 🎉";
      case "uncomplete":
        return "Section marquée à refaire";
      case "reset":
        return "Progression réinitialisée";
    }
  };

  const getSubMessage = () => {
    if (type === "reset") return "Bonne chance pour cette nouvelle tentative !";
    return `${sectionsCompleted}/${totalSections} sections complétées`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-slide-in-up">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl p-4 min-w-[300px]",
          type === "complete" && "border-secondary/50 bg-secondary/10",
          type === "uncomplete" && "border-border/50 bg-card/90",
          type === "reset" && "border-destructive/30 bg-destructive/5"
        )}
      >
        {/* Confetti effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(12)].map((_, i) => (
              <Sparkles
                key={i}
                className={cn(
                  "absolute w-4 h-4 text-secondary animate-confetti",
                  i % 3 === 0 && "text-accent",
                  i % 3 === 1 && "text-primary"
                )}
                style={{
                  left: `${10 + (i * 8)}%`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">{getMessage()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{getSubMessage()}</p>

            {/* Progress bar with animation */}
            {type !== "reset" && (
              <div className="mt-3 relative">
              <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-medium text-muted-foreground">
                    Progression vers le goal
                  </span>
                  <Trophy className="w-3 h-3 text-accent" />
                </div>
                <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 ease-out relative",
                      type === "complete"
                        ? "bg-gradient-to-r from-secondary via-primary to-accent"
                        : "bg-gradient-to-r from-muted-foreground to-muted"
                    )}
                    style={{ width: `${progress}%` }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground">0%</span>
                  <span className={cn(
                    "text-[10px] font-bold transition-all duration-500",
                    progress >= 70 ? "text-secondary" : "text-primary"
                  )}>
                    {progress}%
                  </span>
                  <span className="text-[10px] text-muted-foreground">100%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center text-xs text-muted-foreground"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
