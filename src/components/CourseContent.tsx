import { Section } from "@/data/courses";

interface CourseContentProps {
  section: Section;
  highlightsEnabled: boolean;
}

export function CourseContent({ section, highlightsEnabled }: CourseContentProps) {
  let content = section.content;

  // Remove highlight classes if disabled
  if (!highlightsEnabled) {
    content = content
      .replace(/class="hl"/g, 'class=""')
      .replace(/class="hlg"/g, 'class=""')
      .replace(/class="hlo"/g, 'class=""');
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-lg font-bold mb-4">{section.title}</h2>
      <div
        className="course-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
