import { Section } from "@/data/courses";
import { Clock, BookOpen } from "lucide-react";

interface CourseContentProps {
  section: Section;
  highlightsEnabled: boolean;
}

export function CourseContent({ section, highlightsEnabled }: CourseContentProps) {
  let content = section.content;

  if (!highlightsEnabled) {
    content = content
      .replace(/class="hl"/g, 'class=""')
      .replace(/class="hlg"/g, 'class=""')
      .replace(/class="hlo"/g, 'class=""');
  }

  // Estimate reading time (avg 200 words/min in French)
  const wordCount = section.content.replace(/<[^>]+>/g, '').split(/\s+/).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  return (
    <div className="animate-fade-in">
      {/* Section header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold leading-tight">{section.title}</h2>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            ~{readingTime} min de lecture
          </span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {wordCount} mots
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-primary/20 via-border to-transparent mb-6" />

      {/* Content */}
      <div
        className="course-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
