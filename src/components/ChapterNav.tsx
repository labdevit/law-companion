import { Chapter } from "@/data/courses";
import { cn } from "@/lib/utils";
import { ChevronDown, CheckCircle2, Star, Circle, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";

interface ChapterNavProps {
  chapters: Chapter[];
  activeSection: string | null;
  onSelectSection: (sectionId: string) => void;
  getSectionProgress: (sectionId: string) => { completed: boolean; bestScore: number; total: number } | undefined;
  isFavorite: (sectionId: string) => boolean;
  onToggleFavorite: (sectionId: string) => void;
  onMarkComplete: (sectionId: string) => void;
}

export function ChapterNav({
  chapters,
  activeSection,
  onSelectSection,
  getSectionProgress,
  isFavorite,
  onToggleFavorite,
  onMarkComplete,
}: ChapterNavProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(() => {
    if (activeSection) {
      const chapter = chapters.find(ch => ch.sections.some(s => s.id === activeSection));
      return chapter ? new Set([chapter.id]) : new Set([chapters[0]?.id]);
    }
    return new Set([chapters[0]?.id]);
  });

  // Auto-expand chapter when activeSection changes
  useEffect(() => {
    if (activeSection) {
      const chapter = chapters.find(ch => ch.sections.some(s => s.id === activeSection));
      if (chapter && !expandedChapters.has(chapter.id)) {
        setExpandedChapters(prev => new Set([...prev, chapter.id]));
      }
    }
  }, [activeSection, chapters]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {chapters.map((chapter, chapterIndex) => {
        const isExpanded = expandedChapters.has(chapter.id);
        const completedCount = chapter.sections.filter(s => getSectionProgress(s.id)?.completed).length;
        const totalSections = chapter.sections.length;
        const chapterProgress = totalSections > 0 ? Math.round((completedCount / totalSections) * 100) : 0;
        const isChapterComplete = completedCount === totalSections && totalSections > 0;

        return (
          <div key={chapter.id} className={cn(
            "rounded-xl border overflow-hidden transition-all duration-200",
            isExpanded ? "border-primary/20 bg-card/50" : "border-border/30 bg-card/20"
          )}>
            {/* Chapter header */}
            <button
              onClick={() => toggleChapter(chapter.id)}
              className="w-full p-3 flex items-center gap-3 hover:bg-muted/20 transition-colors"
            >
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-colors",
                isChapterComplete 
                  ? "bg-secondary/15 text-secondary" 
                  : "bg-primary/10 text-primary"
              )}>
                {isChapterComplete ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  chapterIndex + 1
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold truncate">{chapter.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  {/* Mini progress bar */}
                  <div className="flex-1 h-1 bg-muted/50 rounded-full overflow-hidden max-w-[100px]">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        isChapterComplete ? "bg-secondary" : "bg-primary/60"
                      )}
                      style={{ width: `${chapterProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {completedCount}/{totalSections}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}
              />
            </button>

            {/* Sections */}
            {isExpanded && (
              <div className="border-t border-border/20 p-1.5 space-y-0.5 animate-fade-in">
                {chapter.sections.map((section, secIdx) => {
                  const progress = getSectionProgress(section.id);
                  const isActive = activeSection === section.id;
                  const isFav = isFavorite(section.id);

                  return (
                    <div
                      key={section.id}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-200 group",
                        isActive
                          ? "bg-primary/12 border border-primary/25 shadow-sm"
                          : "hover:bg-muted/30 border border-transparent"
                      )}
                      onClick={() => onSelectSection(section.id)}
                      style={{ animationDelay: `${secIdx * 30}ms` }}
                    >
                      {/* Status icon */}
                      <button
                        onClick={(e) => { e.stopPropagation(); onMarkComplete(section.id); }}
                        className="w-5 h-5 flex items-center justify-center flex-shrink-0"
                        title={progress?.completed ? "Marquer à refaire" : "Marquer terminé"}
                      >
                        {progress?.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-secondary transition-all hover:scale-110" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground/40 hover:text-secondary transition-all hover:scale-110" />
                        )}
                      </button>

                      {/* Section title */}
                      <span className={cn(
                        "flex-1 text-xs truncate transition-colors",
                        isActive ? "font-semibold text-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )}>
                        {section.title}
                      </span>

                      {/* Quiz badge */}
                      {section.quiz.length > 0 && (
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded-md font-medium",
                          progress?.completed 
                            ? "bg-secondary/10 text-secondary" 
                            : "bg-muted/60 text-muted-foreground"
                        )}>
                          {section.quiz.length} Q
                        </span>
                      )}

                      {/* Favorite */}
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(section.id); }}
                        className={cn(
                          "opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110",
                          isFav && "opacity-100"
                        )}
                      >
                        <Star className={cn(
                          "w-3.5 h-3.5",
                          isFav ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
                        )} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
