import { Chapter, Section } from "@/data/courses";
import { cn } from "@/lib/utils";
import { ChevronDown, CheckCircle2, Star, BookOpen, Circle } from "lucide-react";
import { useState } from "react";

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
    // Auto-expand chapter containing active section
    if (activeSection) {
      const chapter = chapters.find(ch => ch.sections.some(s => s.id === activeSection));
      return chapter ? new Set([chapter.id]) : new Set([chapters[0]?.id]);
    }
    return new Set([chapters[0]?.id]);
  });

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {chapters.map((chapter, chapterIndex) => {
        const isExpanded = expandedChapters.has(chapter.id);
        const completedCount = chapter.sections.filter(s => getSectionProgress(s.id)?.completed).length;
        const totalSections = chapter.sections.length;

        return (
          <div key={chapter.id} className="rounded-xl border border-border/50 overflow-hidden bg-card/30">
            {/* Chapter header */}
            <button
              onClick={() => toggleChapter(chapter.id)}
              className="w-full p-3 flex items-center gap-3 hover:bg-muted/30 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {chapterIndex + 1}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold truncate">{chapter.title}</p>
                <p className="text-xs text-muted-foreground">
                  {completedCount}/{totalSections} sections
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  isExpanded && "rotate-180"
                )}
              />
            </button>

            {/* Sections */}
            {isExpanded && (
              <div className="border-t border-border/30 p-2 space-y-1">
                {chapter.sections.map((section) => {
                  const progress = getSectionProgress(section.id);
                  const isActive = activeSection === section.id;
                  const isFav = isFavorite(section.id);

                  return (
                    <div
                      key={section.id}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-150 group",
                        isActive
                          ? "bg-primary/15 border border-primary/30"
                          : "hover:bg-muted/40"
                      )}
                      onClick={() => onSelectSection(section.id)}
                    >
                      {/* Status icon - clickable to toggle complete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkComplete(section.id);
                        }}
                        className="w-5 h-5 flex items-center justify-center"
                        title={progress?.completed ? "Marquer comme non terminé" : "Marquer comme terminé"}
                      >
                        {progress?.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-secondary hover:text-muted-foreground transition-colors" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground hover:text-secondary transition-colors" />
                        )}
                      </button>

                      {/* Section title */}
                      <span className={cn(
                        "flex-1 text-xs truncate",
                        isActive ? "font-medium" : "text-muted-foreground"
                      )}>
                        {section.title}
                      </span>

                      {/* Quiz count */}
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {section.quiz.length}
                      </span>

                      {/* Favorite button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(section.id);
                        }}
                        className={cn(
                          "opacity-0 group-hover:opacity-100 transition-opacity",
                          isFav && "opacity-100"
                        )}
                      >
                        <Star
                          className={cn(
                            "w-3.5 h-3.5",
                            isFav ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                          )}
                        />
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
