import { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, BookOpen, FileText, ChevronRight } from "lucide-react";
import { Course, getAllSections } from "@/data/courses";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: "course" | "chapter" | "section";
  courseId: string;
  courseTitle: string;
  courseIcon: string;
  courseColor: string;
  chapterTitle?: string;
  sectionId?: string;
  sectionTitle?: string;
  snippet?: string;
}

interface CourseSearchProps {
  courses: Course[];
  onNavigate: (courseId: string, sectionId?: string) => void;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function getSnippet(text: string, query: string, contextLen = 60): string {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx < 0) return text.slice(0, contextLen * 2) + "…";

  const start = Math.max(0, idx - contextLen);
  const end = Math.min(text.length, idx + query.length + contextLen);
  let snippet = (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
  return snippet;
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-primary/20 text-foreground rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export function CourseSearch({ courses, onNavigate }: CourseSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    const found: SearchResult[] = [];
    const MAX = 20;

    for (const course of courses) {
      if (found.length >= MAX) break;

      const base = {
        courseId: course.id,
        courseTitle: course.title,
        courseIcon: course.icon,
        courseColor: course.color,
      };

      // Match course title
      if (course.title.toLowerCase().includes(q)) {
        found.push({ ...base, type: "course" });
      }

      for (const chapter of course.chapters) {
        if (found.length >= MAX) break;

        // Match chapter title
        if (chapter.title.toLowerCase().includes(q)) {
          const firstSection = chapter.sections[0];
          found.push({
            ...base,
            type: "chapter",
            chapterTitle: chapter.title,
            sectionId: firstSection?.id,
            sectionTitle: firstSection?.title,
          });
        }

        // Match sections
        for (const section of chapter.sections) {
          if (found.length >= MAX) break;

          const plainContent = stripHtml(section.content);
          const titleMatch = section.title.toLowerCase().includes(q);
          const contentMatch = plainContent.toLowerCase().includes(q);

          if (titleMatch || contentMatch) {
            found.push({
              ...base,
              type: "section",
              chapterTitle: chapter.title,
              sectionId: section.id,
              sectionTitle: section.title,
              snippet: contentMatch ? getSnippet(plainContent, q) : undefined,
            });
          }
        }
      }
    }

    return found;
  }, [query, courses]);

  const handleSelect = (result: SearchResult) => {
    onNavigate(result.courseId, result.sectionId);
    setQuery("");
    setIsOpen(false);
  };

  const clearQuery = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Rechercher un sujet, une notion…"
          className="w-full pl-10 pr-10 py-3 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
        />
        {query && (
          <button
            onClick={clearQuery}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 max-h-[60vh] overflow-y-auto rounded-2xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-xl animate-fade-in">
          {results.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Aucun résultat pour « {query} »</p>
            </div>
          ) : (
            <div className="p-2">
              <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {results.length} résultat{results.length > 1 ? "s" : ""}
              </p>
              {results.map((result, i) => (
                <button
                  key={`${result.courseId}-${result.sectionId || result.chapterTitle || ""}-${i}`}
                  onClick={() => handleSelect(result)}
                  className="w-full text-left p-3 rounded-xl hover:bg-muted/40 transition-colors flex items-start gap-3 group"
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm bg-gradient-to-br",
                      result.courseColor
                    )}
                  >
                    <span className="drop-shadow-sm">{result.courseIcon}</span>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    {result.type === "course" && (
                      <p className="text-sm font-semibold truncate">
                        {highlightMatch(result.courseTitle, query)}
                      </p>
                    )}

                    {result.type === "chapter" && (
                      <>
                        <p className="text-sm font-semibold truncate">
                          {highlightMatch(result.chapterTitle || "", query)}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {result.courseTitle}
                        </p>
                      </>
                    )}

                    {result.type === "section" && (
                      <>
                        <p className="text-sm font-semibold truncate">
                          {highlightMatch(result.sectionTitle || "", query)}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {result.courseTitle} › {result.chapterTitle}
                        </p>
                        {result.snippet && (
                          <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-2 leading-relaxed">
                            {highlightMatch(result.snippet, query)}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground shrink-0 mt-1 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
