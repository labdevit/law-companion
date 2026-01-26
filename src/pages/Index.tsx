import { useState, useMemo } from "react";
import { Brain, Sparkles, RotateCcw, BookOpen, HelpCircle } from "lucide-react";
import { SECTIONS } from "@/data/sections";
import { useStudyProgress } from "@/hooks/useStudyProgress";
import { Sidebar } from "@/components/Sidebar";
import { CourseContent } from "@/components/CourseContent";
import { QuizSection } from "@/components/QuizSection";
import { StatsDisplay } from "@/components/StatsDisplay";
import { cn } from "@/lib/utils";

const Index = () => {
  const [activeId, setActiveId] = useState<string | null>(SECTIONS[0]?.id || null);
  const [focusMode, setFocusMode] = useState(false);
  const [highlightsEnabled, setHighlightsEnabled] = useState(true);

  const {
    isFavorite,
    toggleFavorite,
    getSectionProgress,
    updateSectionProgress,
    getTotalScore,
    getCompletedCount,
    resetProgress,
  } = useStudyProgress();

  const activeSection = useMemo(
    () => SECTIONS.find((s) => s.id === activeId) || null,
    [activeId]
  );

  const handleValidateQuiz = (score: number, total: number) => {
    if (activeId) {
      return updateSectionProgress(activeId, score, total);
    }
    return false;
  };

  const handleReset = () => {
    if (confirm("Reset tous les progrès et favoris ?")) {
      resetProgress();
    }
  };

  return (
    <div
      className={cn(
        "flex min-h-screen transition-colors duration-300",
        focusMode && "bg-[hsl(222,47%,3%)]"
      )}
    >
      {/* Sidebar */}
      <Sidebar
        sections={SECTIONS}
        activeId={activeId}
        onSelectSection={setActiveId}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        isCompleted={(id) => !!getSectionProgress(id)?.done}
      />

      {/* Main content */}
      <main className="flex-1 p-5 lg:p-6 lg:pl-8">
        {/* Top bar */}
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
          <div className="pl-12 lg:pl-0">
            <h2 className="text-lg font-bold">
              {activeSection?.title || "Bienvenue 👋"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {activeSection?.desc || "Sélectionne une section à gauche pour commencer."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 text-[13px] rounded-2xl border transition-all duration-150 hover:-translate-y-0.5",
                focusMode
                  ? "border-primary/50 bg-primary/20"
                  : "border-border/50 bg-white/[0.04]"
              )}
            >
              <Brain className="w-4 h-4" />
              Mode Focus {focusMode && "ON"}
            </button>

            <button
              onClick={() => setHighlightsEnabled(!highlightsEnabled)}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 text-[13px] rounded-2xl border transition-all duration-150 hover:-translate-y-0.5",
                highlightsEnabled
                  ? "border-border/50 bg-white/[0.04]"
                  : "border-muted/50 bg-muted/20"
              )}
            >
              <Sparkles className="w-4 h-4" />
              Surlignage {highlightsEnabled ? "ON" : "OFF"}
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2.5 text-[13px] rounded-2xl border border-secondary/40 bg-gradient-to-r from-secondary/20 to-primary/10 transition-all duration-150 hover:-translate-y-0.5"
            >
              <RotateCcw className="w-4 h-4" />
              Reset progrès
            </button>
          </div>
        </header>

        {/* Content grid */}
        <div className="grid lg:grid-cols-[1.4fr_0.9fr] gap-4">
          {/* Course card */}
          <section className="rounded-2xl border border-border/50 bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-lg overflow-hidden card-glow">
            <div className="px-4 py-3.5 border-b border-border/50 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Cours (Synthèse structurée)
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Les mots clés sont en{" "}
                  <span className="hl">violet</span> /{" "}
                  <span className="hlg">vert</span> /{" "}
                  <span className="hlo">orange</span>
                </p>
              </div>
              {activeSection && (
                <span className="text-xs px-3 py-1.5 rounded-full border border-border/50 bg-white/[0.04] text-muted-foreground">
                  {activeSection.subject}
                </span>
              )}
            </div>
            <div className="p-4">
              <CourseContent section={activeSection} highlightsEnabled={highlightsEnabled} />
            </div>
          </section>

          {/* Quiz card */}
          <aside className="rounded-2xl border border-border/50 bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-lg overflow-hidden card-glow">
            <div className="px-4 py-3.5 border-b border-border/50 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-secondary" />
                  Quiz de la section
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Réponds puis valide</p>
              </div>
              <span className="text-xs px-3 py-1.5 rounded-full border border-border/50 bg-white/[0.04] text-muted-foreground">
                {activeSection?.quiz.length || 0} question
                {(activeSection?.quiz.length || 0) > 1 ? "s" : ""}
              </span>
            </div>
            <div className="p-4">
              <StatsDisplay
                totalScore={getTotalScore()}
                completedCount={getCompletedCount()}
              />

              <div className="h-4" />

              <QuizSection section={activeSection} onValidate={handleValidateQuiz} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Index;
