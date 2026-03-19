import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Brain, Send, Loader2, BookOpen, ChevronDown, Lightbulb, GraduationCap, ArrowRight, Sparkles, RotateCcw, MessageCircle, History } from "lucide-react";
import { COURSES, getAllSections } from "@/data/courses";
import { useCustomCourses } from "@/hooks/useCustomCourses";
import { useTheme } from "@/hooks/useTheme";
import { AppNav } from "@/components/AppNav";
import { TutorHistory } from "@/components/TutorHistory";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sun, Moon } from "lucide-react";

interface WhiteboardSection {
  emoji: string;
  title: string;
  body: string;
}

interface ConversationEntry {
  question: string;
  response: string;
  sections: WhiteboardSection[];
}

const SECTION_STYLES: Record<string, { bg: string; border: string; accent: string; glow: string; icon: string }> = {
  "📐": { bg: "bg-primary/[0.04]", border: "border-primary/15", accent: "text-primary", glow: "shadow-primary/5", icon: "from-primary/20 to-primary/5" },
  "🔢": { bg: "bg-[hsl(var(--warning)/.04)]", border: "border-[hsl(var(--warning)/.15)]", accent: "text-[hsl(var(--warning))]", glow: "shadow-[hsl(var(--warning)/.05)]", icon: "from-[hsl(var(--warning)/.2)] to-[hsl(var(--warning)/.05)]" },
  "💡": { bg: "bg-secondary/[0.04]", border: "border-secondary/15", accent: "text-secondary", glow: "shadow-secondary/5", icon: "from-secondary/20 to-secondary/5" },
  "✍️": { bg: "bg-accent/[0.04]", border: "border-accent/15", accent: "text-accent", glow: "shadow-accent/5", icon: "from-accent/20 to-accent/5" },
  "✅": { bg: "bg-secondary/[0.04]", border: "border-secondary/15", accent: "text-secondary", glow: "shadow-secondary/5", icon: "from-secondary/20 to-secondary/5" },
};

/** Strip any leftover LaTeX artifacts like $...$ or \frac etc */
function cleanLatex(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\$([^$]+)\$/g, "$1")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1 ÷ $2")
    .replace(/\\(sum|text|left|right|times|cdot)/g, "")
    .replace(/\^{([^}]+)}/g, " puissance $1")
    .replace(/_{([^}]+)}/g, "$1")
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n");
}

const isTableLine = (line: string) => /^\s*\|.+\|?\s*$/.test(line);
const isSeparatorFragment = (line: string) => /^\s*\|[\s:|\-]+\|?\s*$/.test(line);

function normalizeMarkdownTables(text: string): string {
  const introFixed = text.replace(/([:?!])\s+(\|[^\n]+\|?)/g, "$1\n\n$2");
  const repairedSeparators = introFixed.replace(
    /(\|[\s:-]+\|[\s:-]*)(?:\n\s*)(\|[\s:-]+\|)/g,
    (_, left, right) => `${left.trim()} ${right.trim()}`,
  );

  const lines = repairedSeparators.split("\n");
  const normalized: string[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    let line = lines[i].trimEnd();
    const nextLine = lines[i + 1]?.trim() ?? "";

    if (!line.trim()) {
      const previousLine = normalized[normalized.length - 1]?.trim() ?? "";
      if ((isTableLine(previousLine) || isSeparatorFragment(previousLine)) && (isTableLine(nextLine) || isSeparatorFragment(nextLine))) {
        continue;
      }
      normalized.push("");
      continue;
    }

    if (isSeparatorFragment(line)) {
      line = line.replace(/\s+/g, " ").replace(/\s*\|\s*/g, " | ").trim();
      if (!line.startsWith("|")) line = `| ${line}`;
      if (!line.endsWith("|")) line = `${line} |`;
      line = line.replace(/\|\s+\|/g, "| |");
    }

    if (isTableLine(line) && !line.endsWith("|")) {
      line = `${line} |`;
    }

    normalized.push(line);
  }

  return normalized.join("\n").replace(/\n{3,}/g, "\n\n");
}


function parseSections(content: string): WhiteboardSection[] {
  const cleaned = cleanLatex(content);

  if (!cleaned.includes("## ")) {
    return cleaned.trim() ? [{ emoji: "📐", title: "Réponse", body: cleaned }] : [];
  }

  const sections: WhiteboardSection[] = [];
  const parts = cleaned.split(/^## /gm).filter(Boolean);

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

/* Custom markdown components for digestible, visual rendering */
const MarkdownComponents = {
  table: ({ children, ...props }: any) => (
    <div className="my-6 overflow-x-auto rounded-2xl border-2 border-primary/20 shadow-md">
      <table className="w-full text-sm" {...props}>{children}</table>
    </div>
  ),
  thead: ({ children, ...props }: any) => (
    <thead className="bg-gradient-to-r from-primary/12 to-primary/[0.04] dark:from-primary/20 dark:to-primary/[0.06]" {...props}>{children}</thead>
  ),
  th: ({ children, ...props }: any) => (
    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-[0.15em] text-primary border-b-2 border-primary/25 whitespace-nowrap" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: any) => (
    <td className="px-5 py-3.5 border-b border-border/10 text-foreground/90 tabular-nums text-[13px]" {...props}>
      {children}
    </td>
  ),
  tr: ({ children, ...props }: any) => (
    <tr className="transition-colors even:bg-muted/[0.04] hover:bg-primary/[0.05]" {...props}>{children}</tr>
  ),
  strong: ({ children, ...props }: any) => {
    const text = typeof children === 'string' ? children : '';
    // Key results get a highlighted badge
    const isResult = text.includes('FCFA') || text.includes('Résultat') || text.match(/^-?[\d\s,.]+\s*(FCFA)?$/);
    if (isResult) {
      return (
        <strong className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/12 text-secondary font-extrabold border border-secondary/20 text-[13px]" {...props}>
          ✦ {children}
        </strong>
      );
    }
    // Key terms get subtle highlight
    return (
      <strong className="font-extrabold text-foreground bg-primary/[0.06] px-1 py-0.5 rounded" {...props}>{children}</strong>
    );
  },
  ul: ({ children, ...props }: any) => (
    <ul className="my-4 space-y-3 list-none pl-0" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol className="my-4 space-y-3 list-none pl-0 [counter-reset:item]" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }: any) => (
    <li className="flex items-start gap-3 leading-relaxed text-[13.5px]" {...props}>
      <span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-primary/60 to-secondary/40 flex-shrink-0 shadow-sm" />
      <span className="flex-1 text-foreground/85">{children}</span>
    </li>
  ),
  p: ({ children, ...props }: any) => {
    const text = typeof children === 'string' ? children : '';
    // Conclusion/interpretation paragraphs get a callout box
    if (text.startsWith('Conclusion') || text.startsWith('Interprétation') || text.startsWith('Résultat :') || text.startsWith('Résultat:')) {
      return (
        <div className="my-5 p-4 rounded-xl bg-gradient-to-r from-secondary/[0.08] to-secondary/[0.02] border-2 border-secondary/20 flex items-start gap-3">
          <span className="text-xl mt-0.5 flex-shrink-0">🎯</span>
          <p className="text-sm leading-relaxed text-foreground font-medium flex-1">{children}</p>
        </div>
      );
    }
    // Formula-like paragraphs (containing = signs and key terms)
    if (text.includes(' = ') && (text.includes('VAN') || text.includes('Flux') || text.includes('Taux') || text.includes('Somme'))) {
      return (
        <div className="my-4 px-5 py-3.5 rounded-xl bg-[hsl(var(--warning)/.06)] border border-[hsl(var(--warning)/.15)] font-mono text-[13px] text-foreground/90">
          {children}
        </div>
      );
    }
    return (
      <p className="my-3 leading-[1.9] text-foreground/80 text-[13.5px]" {...props}>{children}</p>
    );
  },
  h3: ({ children, ...props }: any) => (
    <h3 className="text-sm font-bold text-foreground mt-5 mb-2.5 flex items-center gap-2.5 pb-2 border-b border-border/15" {...props}>
      <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-primary to-secondary inline-block" />
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: any) => (
    <h4 className="text-sm font-semibold text-foreground/90 mt-4 mb-2" {...props}>{children}</h4>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote className="my-4 pl-4 border-l-[3px] border-primary/30 bg-primary/[0.04] rounded-r-xl py-3 pr-4 text-foreground/80" {...props}>
      {children}
    </blockquote>
  ),
  code: ({ children, className, ...props }: any) => {
    const isInline = !className;
    if (isInline) {
      return <code className="text-xs bg-primary/[0.08] text-primary px-2 py-1 rounded-lg font-semibold" {...props}>{children}</code>;
    }
    return (
      <code className="block my-4 p-4 rounded-xl bg-muted/40 border border-border/30 text-xs font-mono overflow-x-auto leading-relaxed" {...props}>{children}</code>
    );
  },
  hr: () => (
    <div className="my-6 flex items-center gap-3">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <Sparkles className="w-3 h-3 text-muted-foreground/30" />
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  ),
};

function WhiteboardSections({ sections }: { sections: WhiteboardSection[] }) {
  return (
    <div className="grid gap-6">
      {sections.map((section, idx) => {
        const style = SECTION_STYLES[section.emoji] || SECTION_STYLES["📐"];
        return (
          <div
            key={idx}
            className={cn(
              "rounded-2xl border-2 p-0 overflow-hidden transition-all shadow-sm",
              style.bg,
              style.border,
              style.glow
            )}
          >
            {/* Section header bar */}
            <div className={cn("flex items-center gap-3 px-5 py-3.5 border-b-2", style.border)}>
              <div className={cn("w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm", style.icon)}>
                <span className="text-lg">{section.emoji}</span>
              </div>
              <h3 className={cn("font-extrabold text-sm tracking-tight", style.accent)}>{section.title}</h3>
            </div>
            {/* Section body */}
            <div className="px-6 py-5">
              <div className="max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>{normalizeMarkdownTables(section.body)}</ReactMarkdown>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AITutor() {
  const [query, setQuery] = useState("");
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [streamingResponse, setStreamingResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [showCourseSelect, setShowCourseSelect] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { customCourses } = useCustomCourses();
  const { theme, toggleTheme } = useTheme();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const whiteboardRef = useRef<HTMLDivElement>(null);

  const allCourses = useMemo(() => [...COURSES, ...customCourses], [customCourses]);
  const selectedCourse = allCourses.find((c) => c.id === selectedCourseId) || null;

  const streamingSections = useMemo(() => parseSections(streamingResponse), [streamingResponse]);

  useEffect(() => {
    if (whiteboardRef.current) {
      whiteboardRef.current.scrollTo({ top: whiteboardRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [streamingResponse, conversation.length]);

  const saveConversation = useCallback(async (entries: ConversationEntry[], courseId: string | null, existingId: string | null) => {
    const title = entries[0]?.question?.slice(0, 80) || "Nouvelle conversation";
    const messages = entries.map((e) => ({ question: e.question, response: e.response }));

    if (existingId) {
      await supabase
        .from("tutor_conversations")
        .update({ title, messages, course_id: courseId, updated_at: new Date().toISOString() } as any)
        .eq("id", existingId);
      return existingId;
    } else {
      const { data } = await supabase
        .from("tutor_conversations")
        .insert({ title, messages, course_id: courseId } as any)
        .select("id")
        .single();
      return data?.id || null;
    }
  }, []);

  const handleNewConversation = () => {
    setConversation([]);
    setStreamingResponse("");
    setCurrentQuestion("");
    setConversationId(null);
  };

  const handleSelectConversation = (conv: any) => {
    const entries: ConversationEntry[] = (conv.messages || []).map((m: any) => ({
      question: m.question,
      response: m.response,
      sections: parseSections(m.response),
    }));
    setConversation(entries);
    setConversationId(conv.id);
    setSelectedCourseId(conv.course_id || null);
    setStreamingResponse("");
    setCurrentQuestion("");
  };

  const handleSubmit = async () => {
    const q = query.trim();
    if (!q || isLoading) return;

    setCurrentQuestion(q);
    setQuery("");
    setStreamingResponse("");
    setIsLoading(true);

    let courseContent = "";
    if (selectedCourse) {
      courseContent = getAllSections(selectedCourse)
        .map((s) => `## ${s.title}\n${s.content.replace(/<[^>]+>/g, "")}`)
        .join("\n\n");
    }

    const history = conversation.map((entry) => ({
      question: entry.question,
      response: entry.response,
    }));

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
            history,
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
              setStreamingResponse(fullContent);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      const finalSections = parseSections(fullContent);
      setConversation((prev) => [
        ...prev,
        { question: q, response: fullContent, sections: finalSections },
      ]);
      setStreamingResponse("");
      setCurrentQuestion("");
    } catch (err) {
      setStreamingResponse(`❌ ${(err as Error).message}`);
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

  const hasContent = conversation.length > 0 || streamingResponse.length > 0 || isLoading;

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
              <p className="text-[11px] text-muted-foreground">
                {conversation.length > 0
                  ? `${conversation.length} échange${conversation.length > 1 ? "s" : ""} dans cette session`
                  : "Mode tableau blanc"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasContent && (
              <button
                onClick={handleNewConversation}
                className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl border border-border/40 bg-card/60 hover:bg-muted/50 transition-all font-medium"
                title="Nouvelle conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nouveau</span>
              </button>
            )}
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
                visuellement, étape par étape. Tu peux poser des questions de suivi pour approfondir.
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
            <div className="space-y-6">
              {/* Previous conversation entries */}
              {conversation.map((entry, entryIdx) => (
                <div key={entryIdx} className="animate-fade-in">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <GraduationCap className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">
                        {entryIdx === 0 ? "Ta question" : "Question de suivi"}
                      </p>
                      <div className="inline-block bg-primary/[0.06] border border-primary/10 rounded-2xl rounded-tl-md px-4 py-2.5">
                        <p className="text-sm font-medium">{entry.question}</p>
                      </div>
                    </div>
                  </div>

                  <div className="ml-11">
                    <WhiteboardSections sections={entry.sections} />
                  </div>

                  {entryIdx < conversation.length - 1 && (
                    <div className="my-8 flex items-center gap-3">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                      <MessageCircle className="w-3.5 h-3.5 text-muted-foreground/25" />
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                    </div>
                  )}
                </div>
              ))}

              {/* Currently streaming response */}
              {(isLoading || streamingResponse) && (
                <div className="animate-fade-in">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <GraduationCap className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">
                        {conversation.length === 0 ? "Ta question" : "Question de suivi"}
                      </p>
                      <div className="inline-block bg-primary/[0.06] border border-primary/10 rounded-2xl rounded-tl-md px-4 py-2.5">
                        <p className="text-sm font-medium">{currentQuestion}</p>
                      </div>
                    </div>
                  </div>

                  <div className="ml-11">
                    {isLoading && streamingSections.length === 0 && (
                      <div className="flex flex-col items-center py-10 gap-3 animate-fade-in">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/10 flex items-center justify-center">
                            <Brain className="w-7 h-7 text-primary" />
                          </div>
                          <Loader2 className="w-18 h-18 text-primary/20 animate-spin absolute -top-2 -left-2" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">Le prof prépare le tableau...</p>
                          <p className="text-xs text-muted-foreground mt-1">Analyse et structuration en cours</p>
                        </div>
                      </div>
                    )}

                    {streamingSections.length > 0 && (
                      <WhiteboardSections sections={streamingSections} />
                    )}

                    {isLoading && streamingSections.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in py-2 mt-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Le prof continue d'écrire...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!isLoading && conversation.length > 0 && !streamingResponse && (
                <div className="pt-3 mt-4 animate-fade-in">
                  <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Pose une question de suivi pour approfondir 👇</span>
                  </div>
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
              placeholder={conversation.length > 0 ? "Pose une question de suivi..." : "Pose ta question au tableau blanc..."}
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
                  ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5"
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
