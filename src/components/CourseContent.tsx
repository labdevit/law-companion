import { Section } from "@/data/sections";

interface CourseContentProps {
  section: Section | null;
  highlightsEnabled: boolean;
}

export function CourseContent({ section, highlightsEnabled }: CourseContentProps) {
  if (!section) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <p>Sélectionne une section pour commencer</p>
      </div>
    );
  }

  let content = section.content;

  // Remove highlight classes if disabled
  if (!highlightsEnabled) {
    content = content
      .replace(/class="hl"/g, 'class=""')
      .replace(/class="hlg"/g, 'class=""')
      .replace(/class="hlo"/g, 'class=""');
  }

  return (
    <div
      className="course-content animate-fade-in"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
