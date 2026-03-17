import { useState } from "react";
import { BookOpen, HelpCircle, ArrowRight, ArrowLeft, RotateCcw, Trophy, CheckCircle, GraduationCap, Sparkles } from "lucide-react";
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

  const scorePercentage = lastScore ? Math.round((lastScore.score / lastScore.total) * 100) : 0;
  const passed = scorePercentage >= 70;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {viewMode === "content" ? (
        <div className="space-y-5">
          {/* Content card */}
          <section className="rounded-2xl border border-border/30 bg-card/60 backdrop-blur-sm p-6 lg:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium">Cours</span>
              </div>
              {previousScore?.completed && (
                <div className="flex items-center gap-1.5 text-xs text-secondary bg-secondary/10 px-2.5 py-1 rounded-lg">
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
              className="w-full p-5 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 hover:from-primary/10 hover:to-secondary/10 transition-all duration-300 group animate-pulse-glow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm">Prêt pour le Quiz ? 🎯</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {section.quiz.length} question{section.quiz.length > 1 ? "s" : ""} • Teste tes connaissances
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-primary font-medium hidden sm:block">Commencer</span>
                  <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5 animate-fade-in">
          {/* Back button */}
          <button
            onClick={handleBackToContent}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour au cours
          </button>

          {/* Quiz section */}
          <section className="rounded-2xl border border-border/30 bg-card/60 backdrop-blur-sm p-6 lg:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5 text-sm">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="font-medium">Quiz</span>
                  <span className="text-muted-foreground ml-1.5">— {section.title}</span>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-medium">
                {section.quiz.length} question{section.quiz.length > 1 ? "s" : ""}
              </span>
            </div>

            {quizCompleted && lastScore ? (
              <div className="text-center py-10 animate-fade-in">
                {/* Score circle */}
                <div className="relative w-28 h-28 mx-auto mb-6">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                    <circle cx="56" cy="56" r="48" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                    <circle
                      cx="56" cy="56" r="48"
                      fill="none"
                      stroke={passed ? "hsl(var(--secondary))" : "hsl(var(--warning))"}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 48}`}
                      strokeDashoffset={`${2 * Math.PI * 48 * (1 - scorePercentage / 100)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black">{lastScore.score}/{lastScore.total}</span>
                    <span className="text-[10px] text-muted-foreground">{scorePercentage}%</span>
                  </div>
                </div>

                <div className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6",
                  passed ? "bg-secondary/10 text-secondary" : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                )}>
                  {passed ? (
                    <><Sparkles className="w-4 h-4" /> Section validée !</>
                  ) : (
                    <><ArrowRight className="w-4 h-4" /> Il faut 70% pour valider</>
                  )}
                </div>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleBackToContent}
                    className="px-5 py-2.5 text-sm rounded-xl border border-border/50 hover:bg-muted/50 transition-all flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Revoir le cours
                  </button>
                  <button
                    onClick={handleRetakeQuiz}
                    className="px-5 py-2.5 text-sm rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
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
