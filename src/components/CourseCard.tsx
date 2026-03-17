import { Course, countQuestions, getAllSections } from "@/data/courses";
import { cn } from "@/lib/utils";
import { BookOpen, ChevronRight, CheckCircle2, Zap } from "lucide-react";

interface CourseCardProps {
  course: Course;
  progress: number;
  isActive: boolean;
  onClick: () => void;
}

export function CourseCard({ course, progress, isActive, onClick }: CourseCardProps) {
  const questionCount = countQuestions(course);
  const chapterCount = course.chapters.length;
  const sectionCount = getAllSections(course).length;
  const isComplete = progress === 100;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-5 rounded-2xl border text-left transition-all duration-300 group interactive-card relative overflow-hidden",
        isActive
          ? "border-primary/50 bg-gradient-to-br from-primary/15 to-primary/5 shadow-lg"
          : "border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/30 hover:bg-card/80"
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl",
        `bg-gradient-to-br ${course.color}`
      )} style={{ opacity: 0 }}>
      </div>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 pointer-events-none rounded-2xl bg-gradient-to-br from-primary to-secondary" />

      <div className="relative flex items-start gap-4">
        {/* Icon with glow effect */}
        <div className="relative">
          <div
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-gradient-to-br shadow-lg transition-transform duration-300 group-hover:scale-105",
              course.color
            )}
          >
            {course.icon}
          </div>
          {isComplete && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-secondary flex items-center justify-center shadow-md animate-bounce-subtle">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm leading-tight mb-1.5 group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {chapterCount} ch.
            </span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span>{sectionCount} sections</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {questionCount} Q
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-3 space-y-1.5">
            <div className="h-2 bg-muted/60 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r relative",
                  course.color,
                  progress > 0 && "min-w-[8px]"
                )}
                style={{ width: `${progress}%` }}
              >
                {progress > 0 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[11px] text-muted-foreground font-medium">
                {progress === 0 ? "Pas encore commencé" : `${progress}% complété`}
              </p>
              {progress > 0 && progress < 100 && (
                <p className="text-[10px] text-primary font-medium">Continuer →</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
