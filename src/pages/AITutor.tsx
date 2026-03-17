import { useState, useMemo, useRef, useEffect } from "react";
import { Brain, Send, Loader2, BookOpen, ChevronDown, Lightbulb, GraduationCap, ArrowRight } from "lucide-react";
import { COURSES, getAllSections, Course } from "@/data/courses";
import { useCustomCourses } from "@/hooks/useCustomCourses";
import { useTheme } from "@/hooks/useTheme";
import { AppNav } from "@/components/AppNav";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Sun, Moon } from "lucide-react";

interface WhiteboardSection {
  emoji: string;
  title: string;
  body: string;
}

const SECTION_STYLES: Record<string, { bg: string; border: string; accent: string }> = {
  "📐": { bg: "bg-primary/5", border: "border-primary/20", accent: "text-primary" },
  "🔢": { bg: "bg-orange-500/5", border: "border-orange-500/20", accent: "text-orange-600 dark:text-orange-400" },
  "💡": { bg: "bg-secondary/5", border: "border-secondary/20", accent: "text-secondary" },
  "✍️": { bg: "bg-accent/5", border: "border-accent/20", accent: "text-accent" },
  "✅": { bg: "bg-emerald-500/5", border: "border-emerald-500/20", accent: "text-emerald-600 dark:text-emerald-400" },
};

function parseSections(content: string): WhiteboardSection[] {
  if (!content.includes("## ")) {
    return content.trim() ? [{ emoji: "📐", title: "Réponse", body: content }] : [];
  }

  const sections: WhiteboardSection[] = [];
  const parts = content.split(/^## /gm).filter(Boolean);

  for (const part of parts) {
    const firstNewline = part.indexOf("\n");
    const rawTitle = firstNewline > -1 ? part.slice(0, firstNewline).trim() : part.trim();
    const body = firstNewline > -1 ? part.slice(firstNewline + 1).trim() : "";

    const emojiMatch = rawTitle.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)/u);
    const emoji = emojiMatch ? emojiMatch[0] : "📐";
    const title = rawTitle.replace(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)\s*/u, "").trim();

    sections.push({ emoji, title, body });
  }

  return sections;
}

const SUGGESTIONS = [
  { icon: "📊", text: "Explique-moi le bilan comptable avec un exemple concret" },
  { icon: "💰", text: "Comment calculer la VAN d'un investissement ?" },
  { icon: "⚖️", text: "Quelles sont les conditions de la responsabilité civile ?" },
  { icon: "🏦", text: "Comment fonctionne l'amortissement linéaire ? Donne-moi un exercice" },
  { icon: "📈", text: "Explique le seuil de rentabilité avec un cas pratique" },
  { icon: "🔐", text: "Les sûretés réelles en droit OHADA : résumé et exemples" },
];

export default function AITutor() {
  const [query, setQuery] = useState("");
  const [rawResponse, setRawResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [showCourseSelect, setShowCourseSelect] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const { customCourses } = useCustomCourses();
  const { theme, toggleTheme } = useTheme();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const whiteboardRef = useRef<HTMLDivElement>(null);

  const allCourses = useMemo(() => [...COURSES, ...customCourses], [customCourses]);
  const selectedCourse = allCourses.find((c) => c.id === selectedCourseId) || null;

  const sections = useMemo(() => parseSections(rawResponse), [rawResponse]);

  useEffect(() => {
    if (sections.length > 0 && whiteboardRef.current) {
      whiteboardRef.current.scrollTo({ top: whiteboardRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [rawResponse]);

  const handleSubmit = async () => {
    const q = query.trim();
    if (!q || isLoading) return;

    setCurrentQuestion(q);
    setQuery("");
    setRawResponse("");
    setIsLoading(true);

    let courseContent = "";
    if (selectedCourse) {
      courseContent = getAllSections(selectedCourse)
        .map((s) => `## ${s.title}\n${s.content.replace(/<[^>]+>/g, "")}`)
        .join("\n\n");
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            question: q,
            courseContent,
            courseTitle: selectedCourse?.title,
          }),
        }
      );

      if (!response.ok || !response.body) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
              setRawResponse(fullContent);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (err) {
      setRawResponse(`❌ ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestion = (text: string) => {
    setQuery(text);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const hasContent = rawResponse.length > 0 || isLoading;

  return (
    <div className="min-h-screen flex flex-col pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/15 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Tuteur IA</h1>
              <p className="text-[11px] text-muted-foreground">Mode tableau blanc</p>
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
                    <span>Tous les sujets</span>
                  </>
                )}
                <ChevronDown className="w-3 h-3 flex-shrink-0" />
              </button>

              {showCourseSelect && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowCourseSelect(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-64 p-2 rounded-2xl border border-border/40 bg-background/95 backdrop-blur-xl shadow-xl max-h-64 overflow-auto custom-scrollbar">
                    <button
                      onClick={() => { setSelectedCourseId(null); setShowCourseSelect(false); }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors text-left",
                        !selectedCourseId ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/40"
                      )}
                    >
                      <Lightbulb className="w-4 h-4" />
                      Tous les sujets
                    </button>
                    {allCourses.map((course) => (
                      <button
                        key={course.id}
                        onClick={() => { setSelectedCourseId(course.id); setShowCourseSelect(false); }}
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

      {/* Main content */}
      <div ref={whiteboardRef} className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {!hasContent ? (
            /* Empty state with suggestions */
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/15 to-secondary/10 flex items-center justify-center shadow-lg">
                  <Brain className="w-10 h-10 text-primary" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-secondary/15 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-secondary" />
                </div>
              </div>

              <h2 className="text-xl font-bold mb-2">Ton tableau blanc intelligent</h2>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-8 leading-relaxed">
                Pose une question complexe — finance, comptabilité, droit — et je te l'explique 
                visuellement, étape par étape, avec des exemples concrets et des exercices.
              </p>

              <div className="w-full max-w-2xl grid sm:grid-cols-2 gap-3">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.text}
                    onClick={() => handleSuggestion(s.text)}
                    className="flex items-start gap-3 text-left p-4 rounded-2xl border border-border/30 bg-card/40 hover:bg-card/70 hover:border-primary/20 transition-all group"
                  >
                    <span className="text-xl mt-0.5">{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground/80 group-hover:text-foreground transition-colors leading-relaxed">
                        {s.text}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary mt-0.5 transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Whiteboard display */
            <div className="space-y-4 animate-fade-in">
              {/* Question */}
              <div className="flex items-start gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-1">Ta question</p>
                  <p className="text-sm font-semibold">{currentQuestion}</p>
                </div>
              </div>

              {/* Loading state */}
              {isLoading && sections.length === 0 && (
                <div className="flex flex-col items-center py-12 gap-4 animate-fade-in">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/10 flex items-center justify-center">
                      <Brain className="w-8 h-8 text-primary" />
                    </div>
                    <Loader2 className="w-20 h-20 text-primary/20 animate-spin absolute -top-2 -left-2" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Le prof prépare le tableau...</p>
                    <p className="text-xs text-muted-foreground mt-1">Analyse et structuration en cours</p>
                  </div>
                </div>
              )}

              {/* Sections */}
              <div className="grid gap-4">
                {sections.map((section, idx) => {
                  const style = SECTION_STYLES[section.emoji] || SECTION_STYLES["📐"];
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "rounded-2xl border p-5 transition-all animate-fade-in",
                        style.bg,
                        style.border
                      )}
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="flex items-center gap-2.5 mb-3">
                        <span className="text-xl">{section.emoji}</span>
                        <h3 className={cn("font-bold text-base", style.accent)}>{section.title}</h3>
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_table]:text-xs [&_th]:bg-muted/30 [&_th]:px-3 [&_th]:py-2 [&_td]:px-3 [&_td]:py-2 [&_table]:rounded-xl [&_table]:overflow-hidden [&_table]:border [&_table]:border-border/30 [&_strong]:text-foreground [&_code]:text-xs [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_li]:leading-relaxed [&_p]:leading-relaxed">
                        <ReactMarkdown>{section.body}</ReactMarkdown>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Streaming indicator */}
              {isLoading && sections.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Le prof continue d'écrire...</span>
                </div>
              )}

              {/* New question prompt */}
              {!isLoading && sections.length > 0 && (
                <div className="pt-4 border-t border-border/20 mt-6 animate-fade-in">
                  <p className="text-xs text-muted-foreground text-center">
                    Tu as une autre question ? Pose-la ci-dessous 👇
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="sticky bottom-16 z-30 border-t border-border/40 bg-background/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pose ta question au tableau blanc..."
              rows={1}
              className="flex-1 resize-none rounded-2xl border border-border/40 bg-card/60 px-4 py-3 text-sm placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 focus:bg-card/80 transition-all max-h-32 overflow-auto"
              style={{ minHeight: "44px" }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "44px";
                t.style.height = Math.min(t.scrollHeight, 128) + "px";
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!query.trim() || isLoading}
              className={cn(
                "p-3 rounded-2xl flex-shrink-0 transition-all duration-200",
                query.trim() && !isLoading
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  : "bg-muted/40 text-muted-foreground/40"
              )}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AppNav />
    </div>
  );
}
