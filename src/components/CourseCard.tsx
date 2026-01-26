import { Course, countQuestions } from "@/data/courses";
import { cn } from "@/lib/utils";
import { BookOpen, ChevronRight, Star, CheckCircle2 } from "lucide-react";

interface CourseCardProps {
  course: Course;
  progress: number;
  isActive: boolean;
  onClick: () => void;
}

export function CourseCard({ course, progress, isActive, onClick }: CourseCardProps) {
  const questionCount = countQuestions(course);
  const chapterCount = course.chapters.length;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-2xl border text-left transition-all duration-200 group",
        isActive
          ? "border-primary/50 bg-gradient-to-br from-primary/15 to-primary/5 shadow-lg"
          : "border-border/50 bg-card/50 hover:bg-card hover:border-border hover:-translate-y-0.5"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br shadow-lg",
            course.color
          )}
        >
          {course.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-sm truncate">{course.title}</h3>
            {progress === 100 && (
              <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>{chapterCount} chapitres</span>
            <span>•</span>
            <span>{questionCount} questions</span>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 bg-gradient-to-r",
                course.color
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{progress}% complété</p>
        </div>

        <ChevronRight
          className={cn(
            "w-5 h-5 text-muted-foreground transition-transform",
            isActive && "text-primary rotate-90"
          )}
        />
      </div>
    </button>
  );
}
