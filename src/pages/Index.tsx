import { useState, useMemo, useCallback } from "react";
import { Sparkles, Menu, X, Home, Sun, Moon, RotateCcw, Plus, Trash2, Copy, Upload } from "lucide-react";
import { COURSES, getAllSections, Course } from "@/data/courses";
import { useStudyProgress } from "@/hooks/useStudyProgress";
import { useCustomCourses } from "@/hooks/useCustomCourses";
import { useTheme } from "@/hooks/useTheme";
import { CourseCard } from "@/components/CourseCard";
import { ChapterNav } from "@/components/ChapterNav";
import { SectionView } from "@/components/SectionView";
import { StatsDisplay } from "@/components/StatsDisplay";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProgressToast } from "@/components/ProgressToast";
import { CourseCreatorModal, CourseImporter } from "@/components/CourseCreator";
import { cn } from "@/lib/utils";

type ToastType = "complete" | "uncomplete" | "reset" | null;

const Index = () => {
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [highlightsEnabled, setHighlightsEnabled] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCourseCreator, setShowCourseCreator] = useState(false);
  const [showCourseImporter, setShowCourseImporter] = useState(false);
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

  const { customCourses, addCourse, deleteCourse, duplicateCourse } = useCustomCourses();

  // Combine default and custom courses
  const allCourses: Course[] = useMemo(() => [...COURSES, ...customCourses], [customCourses]);

  const activeCourse = useMemo(
    () => allCourses.find((c) => c.id === activeCourseId) || null,
    [activeCourseId, allCourses]
  );

  const activeSection = useMemo(() => {
    if (!activeCourse || !activeSectionId) return null;
    return getAllSections(activeCourse).find((s) => s.id === activeSectionId) || null;
  }, [activeCourse, activeSectionId]);

  // Calculate total sections across all courses
  const allCourseSections = useMemo(() => {
    return allCourses.flatMap(course => getAllSections(course));
  }, [allCourses]);

  const stats = getStats(allCourseSections.length);

  // Toast state
  const [toastType, setToastType] = useState<ToastType>(null);

  const handleSelectCourse = (courseId: string) => {
    setActiveCourseId(courseId);
    const course = allCourses.find((c) => c.id === courseId);
    if (course && course.chapters[0]?.sections[0]) {
      setActiveSectionId(course.chapters[0].sections[0].id);
    }
    setSidebarOpen(false);
  };

  const handleDeleteCustomCourse = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Supprimer ce cours personnalisé ?")) {
      deleteCourse(courseId);
    }
  };

  const handleDuplicateCourse = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateCourse(courseId);
  };

  const isCustomCourse = (courseId: string) => customCourses.some((c) => c.id === courseId);

  const handleValidateQuiz = (score: number, total: number) => {
    if (activeSectionId) {
      return updateSectionProgress(activeSectionId, score, total);
    }
    return false;
  };

  const handleReset = () => {
    if (confirm("Réinitialiser tous les progrès ? Cette action est irréversible.")) {
      resetProgress();
      setToastType("reset");
    }
  };

  const handleToggleSectionComplete = useCallback((sectionId: string) => {
    const currentProgress = getSectionProgress(sectionId);
    const wasCompleted = currentProgress?.completed || false;
    toggleSectionComplete(sectionId);
    setToastType(wasCompleted ? "uncomplete" : "complete");
  }, [getSectionProgress, toggleSectionComplete]);

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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">📚 Choisis un cours</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCourseImporter(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Importer
                </button>
                <button
                  onClick={() => setShowCourseCreator(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Créer
                </button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {allCourses.map((course) => {
                const sections = getAllSections(course);
                const progress = getProgressPercentage(course.id, sections.map((s) => s.id));
                const isCustom = isCustomCourse(course.id);
                return (
                  <div key={course.id} className="relative group">
                    <CourseCard
                      course={course}
                      progress={progress}
                      isActive={false}
                      onClick={() => handleSelectCourse(course.id)}
                    />
                    {isCustom && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleDuplicateCourse(course.id, e)}
                          className="p-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-muted/80"
                          title="Dupliquer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteCustomCourse(course.id, e)}
                          className="p-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-destructive/30 text-destructive hover:bg-destructive/10"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    {isCustom && (
                      <span className="absolute bottom-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                        Personnalisé
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Course Creator Modal */}
          <CourseCreatorModal
            isOpen={showCourseCreator}
            onClose={() => setShowCourseCreator(false)}
            onSave={(data) => {
              addCourse(data);
              setShowCourseCreator(false);
            }}
          />

          {/* Course Importer Modal */}
          <CourseImporter
            isOpen={showCourseImporter}
            onClose={() => setShowCourseImporter(false)}
            onImport={(data) => {
              addCourse(data);
              setShowCourseImporter(false);
            }}
          />
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
            onMarkComplete={handleToggleSectionComplete}
          />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-6 lg:pl-8">
        {/* Top bar with breadcrumbs */}
        <header className="flex flex-col gap-3 mb-5 pl-12 lg:pl-0">
          <div className="flex items-center justify-between gap-4">
            <Breadcrumbs
              items={[
                { label: "Accueil", onClick: () => setActiveCourseId(null) },
                ...(activeCourse
                  ? [
                      {
                        label: activeCourse.title,
                        onClick: activeSection ? () => setActiveSectionId(null) : undefined,
                        isActive: !activeSection,
                      },
                    ]
                  : []),
                ...(activeSection
                  ? [{ label: activeSection.title, isActive: true }]
                  : []),
              ]}
            />
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
          </div>
        </header>

        {/* Content - now uses SectionView which separates content and quiz */}
        {activeSection ? (
          <SectionView
            section={activeSection}
            highlightsEnabled={highlightsEnabled}
            onComplete={handleValidateQuiz}
            previousScore={getSectionProgress(activeSection.id)}
          />
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            Sélectionne une section dans le menu pour commencer.
          </div>
        )}
      </main>

      {/* Progress Toast */}
      {toastType && (
        <ProgressToast
          type={toastType}
          sectionsCompleted={stats.sectionsCompleted}
          totalSections={stats.totalSections}
          onClose={() => setToastType(null)}
        />
      )}
    </div>
  );
};

export default Index;
