import { useState } from "react";
import { BookOpen, HelpCircle, ArrowRight, RotateCcw, Trophy, CheckCircle } from "lucide-react";
import { Section } from "@/data/courses";
import { CourseContent } from "./CourseContent";
import { QuizSection } from "./QuizSection";
import { SectionProgress } from "@/hooks/useStudyProgress";
import { cn } from "@/lib/utils";

interface SectionViewProps {
  section: Section;
  highlightsEnabled: boolean;
  onComplete: (score: number, total: number) => boolean;
  previousScore: SectionProgress | undefined;
}

type ViewMode = "content" | "quiz";

export function SectionView({ section, highlightsEnabled, onComplete, previousScore }: SectionViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("content");
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [lastScore, setLastScore] = useState<{ score: number; total: number } | null>(null);

  const handleQuizComplete = (score: number, total: number) => {
    const result = onComplete(score, total);
    setQuizCompleted(true);
    setLastScore({ score, total });
    return result;
  };

  const handleRetakeQuiz = () => {
    setQuizCompleted(false);
    setLastScore(null);
  };

  const handleBackToContent = () => {
    setViewMode("content");
    setQuizCompleted(false);
    setLastScore(null);
  };

  // Reset when section changes
  const [lastSectionId, setLastSectionId] = useState(section.id);
  if (section.id !== lastSectionId) {
    setLastSectionId(section.id);
    setViewMode("content");
    setQuizCompleted(false);
    setLastScore(null);
  }

  return (
    <div className="h-full">
      {viewMode === "content" ? (
        <div className="space-y-4">
          {/* Content card */}
          <section className="rounded-2xl border border-border/50 bg-card/50 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                <span>Cours</span>
              </div>
              {previousScore?.completed && (
                <div className="flex items-center gap-1 text-xs text-secondary">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Validé ({previousScore.score}/{previousScore.total})
                </div>
              )}
            </div>
            <CourseContent section={section} highlightsEnabled={highlightsEnabled} />
          </section>

          {/* Quiz CTA */}
          {section.quiz.length > 0 && (
            <button
              onClick={() => setViewMode("quiz")}
              className="w-full p-4 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/5 to-secondary/5 hover:from-primary/10 hover:to-secondary/10 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <HelpCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">Prêt pour le Quiz ?</p>
                    <p className="text-xs text-muted-foreground">
                      {section.quiz.length} question{section.quiz.length > 1 ? "s" : ""} pour tester vos connaissances
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Back button */}
          <button
            onClick={handleBackToContent}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            ← Retour au cours
          </button>

          {/* Quiz section */}
          <section className="rounded-2xl border border-border/50 bg-card/50 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <HelpCircle className="w-4 h-4" />
                <span>Quiz - {section.title}</span>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                {section.quiz.length} question{section.quiz.length > 1 ? "s" : ""}
              </span>
            </div>

            {quizCompleted && lastScore ? (
              <div className="text-center py-8">
                <div className={cn(
                  "w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center",
                  lastScore.score / lastScore.total >= 0.7 
                    ? "bg-secondary/20" 
                    : "bg-accent/20"
                )}>
                  <Trophy className={cn(
                    "w-10 h-10",
                    lastScore.score / lastScore.total >= 0.7 
                      ? "text-secondary" 
                      : "text-accent"
                  )} />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {lastScore.score}/{lastScore.total}
                </h3>
                <p className={cn(
                  "text-sm mb-6",
                  lastScore.score / lastScore.total >= 0.7 
                    ? "text-secondary" 
                    : "text-accent"
                )}>
                  {lastScore.score / lastScore.total >= 0.7 
                    ? "Excellent ! Section validée ✓" 
                    : "Encore un effort ! Il faut 70% pour valider."
                  }
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleBackToContent}
                    className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted/50"
                  >
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Revoir le cours
                  </button>
                  <button
                    onClick={handleRetakeQuiz}
                    className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <RotateCcw className="w-4 h-4 inline mr-2" />
                    Recommencer
                  </button>
                </div>
              </div>
            ) : (
              <QuizSection
                section={section}
                onComplete={handleQuizComplete}
                previousScore={previousScore}
              />
            )}
          </section>
        </div>
      )}
    </div>
  );
}
