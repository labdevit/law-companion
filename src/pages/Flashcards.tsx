import { useState, useMemo } from "react";
import { BookOpen, ChevronDown, RotateCcw, ChevronLeft, ChevronRight, Check, Sun, Moon, Shuffle } from "lucide-react";
import { COURSES, getAllSections, Course, Section } from "@/data/courses";
import { useCustomCourses } from "@/hooks/useCustomCourses";
import { useTheme } from "@/hooks/useTheme";
import { AppNav } from "@/components/AppNav";
import { cn } from "@/lib/utils";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  courseIcon: string;
  courseTitle: string;
}

function extractKeyContent(content: string): string {
  // Strip HTML, extract text, clean up
  let text = content.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  // Get first ~300 chars as a summary
  if (text.length > 300) {
    text = text.substring(0, 300).replace(/\s\S*$/, "") + "…";
  }
  return text;
}

function generateFlashcards(course: Course): Flashcard[] {
  return getAllSections(course).map((section) => ({
    id: section.id,
    front: section.title,
    back: extractKeyContent(section.content),
    courseIcon: course.icon,
    courseTitle: course.title,
  }));
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Flashcards() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [showCourseSelect, setShowCourseSelect] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<Set<string>>(new Set());
  const { customCourses } = useCustomCourses();
  const { theme, toggleTheme } = useTheme();

  const allCourses = useMemo(() => [...COURSES, ...customCourses], [customCourses]);
  const selectedCourse = allCourses.find((c) => c.id === selectedCourseId) || null;

  const cards = useMemo(() => {
    if (!selectedCourse) return [];
    return generateFlashcards(selectedCourse);
  }, [selectedCourse]);

  const currentCard = cards[currentIndex] || null;

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleMarkReviewed = () => {
    if (currentCard) {
      setReviewedCards((prev) => new Set(prev).add(currentCard.id));
      handleNext();
    }
  };

  const handleShuffle = () => {
    if (selectedCourse) {
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  };

  const handleReset = () => {
    setReviewedCards(new Set());
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const reviewedCount = cards.filter((c) => reviewedCards.has(c.id)).length;
  const progressPercent = cards.length > 0 ? Math.round((reviewedCount / cards.length) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/15 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Révision</h1>
              <p className="text-[11px] text-muted-foreground">Fiches de révision</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Course selector */}
            <div className="relative">
              <button
                onClick={() => setShowCourseSelect(!showCourseSelect)}
                className="flex items-center gap-2 px-3 py-2 text-xs rounded-xl border border-border/40 bg-card/60 hover:bg-muted/50 transition-all font-medium max-w-[180px]"
              >
                {selectedCourse ? (
                  <>
                    <span>{selectedCourse.icon}</span>
                    <span className="truncate">{selectedCourse.title}</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Choisir un cours</span>
                  </>
                )}
                <ChevronDown className="w-3 h-3 flex-shrink-0" />
              </button>

              {showCourseSelect && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowCourseSelect(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-64 p-2 rounded-2xl border border-border/40 bg-background/95 backdrop-blur-xl shadow-xl max-h-64 overflow-auto custom-scrollbar">
                    {allCourses.map((course) => (
                      <button
                        key={course.id}
                        onClick={() => {
                          setSelectedCourseId(course.id);
                          setShowCourseSelect(false);
                          setCurrentIndex(0);
                          setIsFlipped(false);
                          setReviewedCards(new Set());
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors text-left",
                          selectedCourseId === course.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/40"
                        )}
                      >
                        <span>{course.icon}</span>
                        <span className="truncate">{course.title}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-border/40 bg-card/60 hover:bg-muted/50 transition-all"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col">
        <div className="max-w-2xl mx-auto w-full px-4 py-6 flex-1 flex flex-col">
          {!selectedCourse ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center flex-1 animate-fade-in">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-secondary/15 to-primary/10 flex items-center justify-center mb-6 shadow-lg">
                <BookOpen className="w-10 h-10 text-secondary" />
              </div>
              <h2 className="text-xl font-bold mb-2">Fiches de révision</h2>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-6 leading-relaxed">
                Sélectionne un cours pour générer des fiches de révision. Retourne-les pour voir le contenu clé !
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg">
                {allCourses.slice(0, 6).map((course) => (
                  <button
                    key={course.id}
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      setCurrentIndex(0);
                      setIsFlipped(false);
                      setReviewedCards(new Set());
                    }}
                    className="p-4 rounded-2xl border border-border/30 bg-card/40 hover:bg-card/70 hover:border-primary/20 transition-all text-center group"
                  >
                    <span className="text-2xl block mb-2">{course.icon}</span>
                    <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{course.title}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1">
              <p className="text-muted-foreground">Aucune fiche disponible pour ce cours.</p>
            </div>
          ) : (
            <>
              {/* Progress */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-2 bg-muted/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                  {reviewedCount}/{cards.length} révisées
                </span>
              </div>

              {/* Card */}
              <div className="flex-1 flex items-center justify-center">
                <div
                  className="w-full max-w-lg perspective-1000 cursor-pointer"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <div
                    className={cn(
                      "relative w-full min-h-[300px] sm:min-h-[360px] transition-transform duration-500 preserve-3d",
                      isFlipped && "rotate-y-180"
                    )}
                    style={{
                      transformStyle: "preserve-3d",
                      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                  >
                    {/* Front */}
                    <div
                      className="absolute inset-0 rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5 p-8 flex flex-col items-center justify-center shadow-xl"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-4">
                        Fiche {currentIndex + 1}/{cards.length}
                      </span>
                      <span className="text-4xl mb-4">{currentCard?.courseIcon}</span>
                      <h3 className="text-lg font-bold text-center leading-relaxed px-4">
                        {currentCard?.front}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-4">Clique pour retourner</p>
                      {reviewedCards.has(currentCard?.id || "") && (
                        <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-secondary/15 flex items-center justify-center">
                          <Check className="w-4 h-4 text-secondary" />
                        </div>
                      )}
                    </div>

                    {/* Back */}
                    <div
                      className="absolute inset-0 rounded-3xl border-2 border-secondary/20 bg-gradient-to-br from-card to-secondary/5 p-8 flex flex-col shadow-xl overflow-auto"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">
                        Réponse
                      </span>
                      <p className="text-sm leading-relaxed text-foreground/80 flex-1">
                        {currentCard?.back}
                      </p>
                      <p className="text-xs text-muted-foreground mt-4 text-center">Clique pour retourner</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="p-3 rounded-xl border border-border/40 bg-card/60 hover:bg-muted/50 transition-all disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={handleMarkReviewed}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-secondary to-primary text-white text-sm font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Maîtrisé
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentIndex >= cards.length - 1}
                  className="p-3 rounded-xl border border-border/40 bg-card/60 hover:bg-muted/50 transition-all disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Utility buttons */}
              <div className="flex justify-center gap-3 mt-4">
                <button
                  onClick={handleShuffle}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-xl hover:bg-muted/30"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  Mélanger
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-xl hover:bg-muted/30"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Recommencer
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <AppNav />
    </div>
  );
}
