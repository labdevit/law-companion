import { useState, useMemo, useCallback } from "react";
import { Sparkles, Menu, X, Sun, Moon, RotateCcw, Plus, Trash2, Copy, Brain, ArrowLeft, GraduationCap, Undo2, Flame, Target, Trophy, Zap } from "lucide-react";
import { COURSES, getAllSections, Course } from "@/data/courses";
import { useStudyProgress } from "@/hooks/useStudyProgress";
import { useCustomCourses } from "@/hooks/useCustomCourses";
import { useStreak } from "@/hooks/useStreak";
import { useTheme } from "@/hooks/useTheme";
import { CourseCard } from "@/components/CourseCard";
import { ChapterNav } from "@/components/ChapterNav";
import { SectionView } from "@/components/SectionView";
import { StatsDisplay } from "@/components/StatsDisplay";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProgressToast } from "@/components/ProgressToast";
import { CourseCreatorModal, CourseImporter } from "@/components/CourseCreator";
import { CourseQA } from "@/components/CourseQA";
import { AppNav } from "@/components/AppNav";
import { CourseSearch } from "@/components/CourseSearch";
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

  const { customCourses, hiddenCourseIds, addCourse, deleteCourse, hideCourse, restoreAllCourses, duplicateCourse } = useCustomCourses();

  const isCustomCourse = (courseId: string) => customCourses.some((c) => c.id === courseId);

  const allCourses: Course[] = useMemo(() => {
    const builtIn = COURSES.filter((c) => !hiddenCourseIds.includes(c.id));
    return [...builtIn, ...customCourses];
  }, [customCourses, hiddenCourseIds]);

  const activeCourse = useMemo(
    () => allCourses.find((c) => c.id === activeCourseId) || null,
    [activeCourseId, allCourses]
  );

  const activeSection = useMemo(() => {
    if (!activeCourse || !activeSectionId) return null;
    return getAllSections(activeCourse).find((s) => s.id === activeSectionId) || null;
  }, [activeCourse, activeSectionId]);

  const allCourseSections = useMemo(() => {
    return allCourses.flatMap(course => getAllSections(course));
  }, [allCourses]);

  const stats = getStats(allCourseSections.length);
  const { currentStreak, dailyGoal, todayCompleted, allAchievements, recordStudy } = useStreak(stats.sectionsCompleted);
  const [toastType, setToastType] = useState<ToastType>(null);

  const handleSelectCourse = (courseId: string) => {
    setActiveCourseId(courseId);
    const course = allCourses.find((c) => c.id === courseId);
    if (course && course.chapters[0]?.sections[0]) {
      setActiveSectionId(course.chapters[0].sections[0].id);
    }
    setSidebarOpen(false);
  };

  const handleDeleteCourse = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCustom = isCustomCourse(courseId);
    const message = isCustom
      ? "Supprimer ce cours définitivement ?"
      : "Masquer ce cours ? Vous pourrez le restaurer plus tard.";
    if (confirm(message)) {
      if (isCustom) {
        deleteCourse(courseId);
      } else {
        hideCourse(courseId);
      }
      if (activeCourseId === courseId) {
        setActiveCourseId(null);
      }
    }
  };

  const handleDuplicateCourse = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateCourse(courseId);
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
      setToastType("reset");
    }
  };

  const handleToggleSectionComplete = useCallback((sectionId: string) => {
    const currentProgress = getSectionProgress(sectionId);
    const wasCompleted = currentProgress?.completed || false;
    toggleSectionComplete(sectionId);
    if (!wasCompleted) recordStudy();
    setToastType(wasCompleted ? "uncomplete" : "complete");
  }, [getSectionProgress, toggleSectionComplete, recordStudy]);

  // ═══════════════════════════════════════════
  // HOME VIEW
  // ═══════════════════════════════════════════
  if (!activeCourse) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

    return (
      <div className="min-h-screen p-4 lg:p-8 pb-24">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <header className="mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg animate-float">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight">Pandora</h1>
                  <p className="text-sm text-muted-foreground">{greeting} ! Prêt à réviser ?</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="p-2.5 rounded-xl border border-border/40 bg-card/60 hover:bg-destructive/10 hover:border-destructive/30 transition-all group"
                  aria-label="Réinitialiser les progrès"
                  title="Réinitialiser"
                >
                  <RotateCcw className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
                </button>
                <button
                  onClick={toggleTheme}
                  className="p-2.5 rounded-xl border border-border/40 bg-card/60 hover:bg-muted/50 transition-all"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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

          {/* Gamification row */}
          <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in" style={{ animationDelay: "50ms" }}>
            {/* Streak */}
            <div className="p-4 rounded-2xl border border-orange-500/20 bg-orange-500/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xl font-black">{currentStreak}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">jours de suite</p>
              </div>
            </div>

            {/* Daily goal */}
            <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-black">{todayCompleted}<span className="text-sm font-medium text-muted-foreground">/{dailyGoal}</span></p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">objectif du jour</p>
              </div>
            </div>

            {/* Achievements */}
            <div className="p-4 rounded-2xl border border-secondary/20 bg-secondary/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xl font-black">{allAchievements.filter(a => a.unlocked).length}<span className="text-sm font-medium text-muted-foreground">/{allAchievements.length}</span></p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">badges</p>
              </div>
            </div>
          </div>

          {/* Achievements row */}
          {allAchievements.some(a => a.unlocked) && (
            <div className="mb-6 animate-fade-in" style={{ animationDelay: "80ms" }}>
              <p className="text-xs text-muted-foreground font-medium mb-2.5 uppercase tracking-wider">Tes badges</p>
              <div className="flex gap-2 flex-wrap">
                {allAchievements.map((a) => (
                  <div
                    key={a.id}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all",
                      a.unlocked
                        ? "border-secondary/20 bg-secondary/5 text-foreground"
                        : "border-border/20 bg-muted/10 text-muted-foreground/40"
                    )}
                    title={a.label}
                  >
                    <span className={cn("text-base", !a.unlocked && "grayscale opacity-30")}>{a.icon}</span>
                    <span className={cn(!a.unlocked && "line-through")}>{a.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course grid */}
          <section className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold">Tes cours</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{allCourses.length} cours disponibles</p>
              </div>
              <div className="flex gap-2">
                {hiddenCourseIds.length > 0 && (
                  <button
                    onClick={restoreAllCourses}
                    className="flex items-center gap-2 px-3 py-2.5 text-xs rounded-xl border border-border/40 bg-card/60 hover:bg-muted/50 transition-all font-medium text-muted-foreground"
                    title="Restaurer les cours masqués"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Restaurer ({hiddenCourseIds.length})</span>
                  </button>
                )}
                <button
                  onClick={() => setShowCourseImporter(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 text-primary hover:from-primary/15 hover:to-secondary/15 transition-all border border-primary/15 font-medium"
                >
                  <Brain className="w-4 h-4" />
                  <span className="hidden sm:inline">Importer avec l'IA</span>
                  <span className="sm:hidden">Importer</span>
                </button>
                <button
                  onClick={() => setShowCourseCreator(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl bg-card/60 border border-border/40 hover:bg-muted/50 transition-all font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Créer</span>
                </button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 stagger-children">
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
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {isCustom && (
                        <button
                          onClick={(e) => handleDuplicateCourse(course.id, e)}
                          className="p-1.5 rounded-lg bg-background/90 backdrop-blur-sm border border-border/50 hover:bg-muted/80 transition-colors"
                          title="Dupliquer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDeleteCourse(course.id, e)}
                        className="p-1.5 rounded-lg bg-background/90 backdrop-blur-sm border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                        title={isCustom ? "Supprimer" : "Masquer"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {isCustom && (
                      <span className="absolute bottom-3 right-3 text-[10px] px-2 py-0.5 rounded-md bg-primary/15 text-primary font-medium border border-primary/20">
                        IA
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <CourseCreatorModal
            isOpen={showCourseCreator}
            onClose={() => setShowCourseCreator(false)}
            onSave={(data) => { addCourse(data); setShowCourseCreator(false); }}
          />
          <CourseImporter
            isOpen={showCourseImporter}
            onClose={() => setShowCourseImporter(false)}
            onImport={(data) => { addCourse(data); setShowCourseImporter(false); }}
          />
        </div>
        <AppNav />
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // COURSE VIEW
  // ═══════════════════════════════════════════
  const allSections = getAllSections(activeCourse);
  const courseProgress = getProgressPercentage(activeCourse.id, allSections.map((s) => s.id));

  return (
    <div className="min-h-screen flex">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl border border-border/40 bg-card/90 backdrop-blur-sm shadow-sm"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen w-80 flex flex-col glass-panel z-50 transition-transform duration-300 overflow-hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-4 flex flex-col h-full">
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-4 right-4 p-1">
            <X className="w-5 h-5" />
          </button>

          {/* Back button */}
          <button
            onClick={() => setActiveCourseId(null)}
            className="flex items-center gap-2 p-2 rounded-xl hover:bg-muted/30 text-sm text-muted-foreground mb-3 group transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Retour aux cours
          </button>

          {/* Course header card */}
          <div className={cn("p-4 rounded-2xl mb-4 bg-gradient-to-br relative overflow-hidden", activeCourse.color)}>
            <div className="relative z-10 flex items-center gap-3">
              <span className="text-3xl">{activeCourse.icon}</span>
              <div className="min-w-0">
                <h2 className="font-bold text-sm text-white leading-tight truncate">{activeCourse.title}</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden max-w-[120px]">
                    <div
                      className="h-full bg-white/80 rounded-full transition-all duration-700"
                      style={{ width: `${courseProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/80 font-medium">{courseProgress}%</p>
                </div>
              </div>
            </div>
            {/* Decorative circles */}
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full" />
            <div className="absolute -right-2 -bottom-6 w-16 h-16 bg-white/5 rounded-full" />
          </div>

          {/* Chapter navigation */}
          <div className="flex-1 overflow-auto custom-scrollbar pr-1">
            <ChapterNav
              chapters={activeCourse.chapters}
              activeSection={activeSectionId}
              onSelectSection={(id) => { setActiveSectionId(id); setSidebarOpen(false); }}
              getSectionProgress={getSectionProgress}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              onMarkComplete={handleToggleSectionComplete}
            />
          </div>

          {/* Sidebar footer stats */}
          <div className="pt-3 mt-3 border-t border-border/20">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{allSections.filter(s => getSectionProgress(s.id)?.completed).length}/{allSections.length} sections</span>
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors"
              >
                {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-8 lg:pl-10">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-4 mb-6 pl-12 lg:pl-0">
          <Breadcrumbs
            items={[
              { label: "Accueil", onClick: () => setActiveCourseId(null) },
              ...(activeCourse
                ? [{
                    label: activeCourse.title,
                    onClick: activeSection ? () => setActiveSectionId(null) : undefined,
                    isActive: !activeSection,
                  }]
                : []),
              ...(activeSection
                ? [{ label: activeSection.title, isActive: true }]
                : []),
            ]}
          />
          <button
            onClick={() => setHighlightsEnabled(!highlightsEnabled)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-xs rounded-xl border transition-all font-medium",
              highlightsEnabled
                ? "border-primary/30 bg-primary/8 text-primary"
                : "border-border/40 bg-card/60 text-muted-foreground"
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Surlignage</span>
          </button>
        </header>

        {/* Content */}
        {activeSection ? (
          <SectionView
            section={activeSection}
            highlightsEnabled={highlightsEnabled}
            onComplete={handleValidateQuiz}
            previousScore={getSectionProgress(activeSection.id)}
          />
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium">Sélectionne une section pour commencer</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Choisis dans le menu à gauche</p>
          </div>
        )}
      </main>

      {/* Course Q&A Chat */}
      <CourseQA course={activeCourse} />

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
