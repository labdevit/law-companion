import { useState, useMemo } from "react";
import { Sparkles, BookOpen, HelpCircle, Menu, X, Home, Sun, Moon, RotateCcw } from "lucide-react";
import { COURSES, getAllSections } from "@/data/courses";
import { useStudyProgress } from "@/hooks/useStudyProgress";
import { useTheme } from "@/hooks/useTheme";
import { CourseCard } from "@/components/CourseCard";
import { ChapterNav } from "@/components/ChapterNav";
import { CourseContent } from "@/components/CourseContent";
import { QuizSection } from "@/components/QuizSection";
import { StatsDisplay } from "@/components/StatsDisplay";
import { cn } from "@/lib/utils";

const Index = () => {
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [highlightsEnabled, setHighlightsEnabled] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const {
    updateSectionProgress,
    toggleFavorite,
    isFavorite,
    getSectionProgress,
    getStats,
    getProgressPercentage,
    resetProgress,
    toggleSectionComplete,
  } = useStudyProgress();

  const activeCourse = useMemo(
    () => COURSES.find((c) => c.id === activeCourseId) || null,
    [activeCourseId]
  );

  const activeSection = useMemo(() => {
    if (!activeCourse || !activeSectionId) return null;
    return getAllSections(activeCourse).find((s) => s.id === activeSectionId) || null;
  }, [activeCourse, activeSectionId]);

  const stats = getStats();

  const handleSelectCourse = (courseId: string) => {
    setActiveCourseId(courseId);
    const course = COURSES.find((c) => c.id === courseId);
    if (course && course.chapters[0]?.sections[0]) {
      setActiveSectionId(course.chapters[0].sections[0].id);
    }
    setSidebarOpen(false);
  };

  const handleValidateQuiz = (score: number, total: number) => {
    if (activeSectionId) {
      return updateSectionProgress(activeSectionId, score, total);
    }
    return false;
  };

  const handleReset = () => {
    if (confirm("Réinitialiser tous les progrès ? Cette action est irréversible.")) {
      resetProgress();
    }
  };

  // Home view (no course selected)
  if (!activeCourse) {
    return (
      <div className="min-h-screen p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-black text-white shadow-lg">
                  P
                </div>
                <div>
                  <h1 className="text-xl font-bold">Pandora</h1>
                  <p className="text-sm text-muted-foreground">Révise efficacement avec des cours structurés et des quiz</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="p-3 rounded-xl border border-border/50 bg-card/50 hover:bg-destructive/10 hover:border-destructive/50 transition-all group"
                  aria-label="Réinitialiser les progrès"
                  title="Réinitialiser tous les progrès"
                >
                  <RotateCcw className="w-5 h-5 text-muted-foreground group-hover:text-destructive" />
                </button>
                <button
                  onClick={toggleTheme}
                  className="p-3 rounded-xl border border-border/50 bg-card/50 hover:bg-muted/50 transition-all"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <StatsDisplay
              totalScore={stats.totalScore}
              totalQuestions={stats.totalQuestions}
              sectionsCompleted={stats.sectionsCompleted}
              totalSections={stats.totalSections}
            />
          </header>

          {/* Course grid */}
          <section>
            <h2 className="text-lg font-bold mb-4">📚 Choisis un cours</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {COURSES.map((course) => {
                const allSections = getAllSections(course);
                const progress = getProgressPercentage(course.id, allSections.map((s) => s.id));
                return (
                  <CourseCard
                    key={course.id}
                    course={course}
                    progress={progress}
                    isActive={false}
                    onClick={() => handleSelectCourse(course.id)}
                  />
                );
              })}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Course view
  const allSections = getAllSections(activeCourse);
  const courseProgress = getProgressPercentage(activeCourse.id, allSections.map((s) => s.id));

  return (
    <div className="min-h-screen flex">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl border border-border/50 bg-card/90 backdrop-blur-sm"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen w-80 p-4 flex flex-col glass-panel z-50 transition-transform duration-300 overflow-hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-4 right-4">
          <X className="w-5 h-5" />
        </button>

        {/* Back button */}
        <button
          onClick={() => setActiveCourseId(null)}
          className="flex items-center gap-2 p-2 rounded-xl hover:bg-muted/30 text-sm text-muted-foreground mb-4"
        >
          <Home className="w-4 h-4" />
          Retour aux cours
        </button>

        {/* Course header */}
        <div className={cn("p-3 rounded-xl mb-4 bg-gradient-to-br", activeCourse.color)}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{activeCourse.icon}</span>
            <div>
              <h2 className="font-bold text-sm text-white">{activeCourse.title}</h2>
              <p className="text-xs text-white/70">{courseProgress}% complété</p>
            </div>
          </div>
        </div>

        {/* Chapter navigation */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <ChapterNav
            chapters={activeCourse.chapters}
            activeSection={activeSectionId}
            onSelectSection={(id) => {
              setActiveSectionId(id);
              setSidebarOpen(false);
            }}
            getSectionProgress={getSectionProgress}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            onMarkComplete={(sectionId) => toggleSectionComplete(sectionId)}
          />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-6 lg:pl-8">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-4 mb-5 pl-12 lg:pl-0">
          <div>
            <h2 className="text-lg font-bold">{activeSection?.title || "Sélectionne une section"}</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setHighlightsEnabled(!highlightsEnabled)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-xs rounded-xl border transition-all",
                highlightsEnabled ? "border-primary/50 bg-primary/10" : "border-border/50 bg-card/50"
              )}
            >
              <Sparkles className="w-4 h-4" />
              Surlignage {highlightsEnabled ? "ON" : "OFF"}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-border/50 bg-card/50 hover:bg-muted/50 transition-all"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Content grid */}
        {activeSection ? (
          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-4">
            {/* Course content */}
            <section className="rounded-2xl border border-border/50 bg-card/50 p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                <span>Cours</span>
              </div>
              <CourseContent section={activeSection} highlightsEnabled={highlightsEnabled} />
            </section>

            {/* Quiz */}
            <aside className="rounded-2xl border border-border/50 bg-card/50 p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <HelpCircle className="w-4 h-4" />
                  <span>Quiz ({activeSection.quiz.length} questions)</span>
                </div>
              </div>
              <QuizSection
                section={activeSection}
                onComplete={handleValidateQuiz}
                previousScore={getSectionProgress(activeSection.id)}
              />
            </aside>
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            Sélectionne une section dans le menu pour commencer.
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
