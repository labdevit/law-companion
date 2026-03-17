import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, GraduationCap, User, Loader2, Minimize2, Maximize2, Sparkles, BookOpen, Paperclip, FileText, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Course, getAllSections } from "@/data/courses";
import ReactMarkdown from "react-markdown";

interface CourseQAProps {
  course: Course;
}

interface AttachedFile {
  name: string;
  type: string;
  base64: string;
  size: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  fileName?: string;
}

const TYPING_PHRASES = [
  "Votre prof réfléchit…",
  "Je prépare ma réponse…",
  "Laissez-moi consulter le cours…",
  "Un instant, je formule…",
];

function TypingIndicator() {
  const [phrase] = useState(() => TYPING_PHRASES[Math.floor(Math.random() * TYPING_PHRASES.length)]);
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm">
        <GraduationCap className="w-4.5 h-4.5 text-secondary" />
      </div>
      <div className="bg-card border border-border/40 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-secondary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 rounded-full bg-secondary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 rounded-full bg-secondary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-xs text-muted-foreground italic">{phrase}</span>
        </div>
      </div>
    </div>
  );
}

function TimeStamp({ date }: { date?: Date }) {
  if (!date) return null;
  const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return <span className="text-[10px] text-muted-foreground/60 px-1">{time}</span>;
}

export function CourseQA({ course }: CourseQAProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const courseContent = getAllSections(course)
    .map((s) => `## ${s.title}\n${s.content.replace(/<[^>]+>/g, "")}`)
    .join("\n\n");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMessages([]);
  }, [course.id]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("Le fichier est trop volumineux (max 10 Mo)");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Seuls les fichiers PDF et DOCX sont acceptés");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setAttachedFile({ name: file.name, type: file.type, base64, size: file.size });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const sendMessage = async () => {
    const question = input.trim();
    if (!question && !attachedFile) return;
    if (isLoading) return;

    const userMsg: Message = {
      role: "user",
      content: question || (attachedFile ? `📎 ${attachedFile.name}` : ""),
      timestamp: new Date(),
      fileName: attachedFile?.name,
    };
    setMessages((prev) => [...prev, userMsg]);

    const fileToSend = attachedFile;
    setInput("");
    setAttachedFile(null);
    setIsLoading(true);

    let assistantContent = "";
    const assistantTimestamp = new Date();
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
        }
        return [...prev, { role: "assistant", content: assistantContent, timestamp: assistantTimestamp }];
      });
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/course-qa`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            question: question || `Analyse ce document : ${fileToSend?.name || ""}`,
            courseContent,
            courseTitle: course.title,
            history: messages.map(({ role, content }) => ({ role, content })),
            ...(fileToSend && {
              file: {
                name: fileToSend.name,
                type: fileToSend.type,
                base64: fileToSend.base64,
              },
            }),
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
            if (content) updateAssistant(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (err) {
      updateAssistant(`❌ ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    { icon: "📝", text: "Résume ce cours" },
    { icon: "💡", text: "Explique les concepts clés" },
    { icon: "🔍", text: "Donne-moi un exemple concret" },
    { icon: "❓", text: "Qu'est-ce que je dois retenir ?" },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 group"
        title="Discuter avec votre prof virtuel"
      >
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center">
          <GraduationCap className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </div>
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
          <Sparkles className="w-2.5 h-2.5 text-accent-foreground" />
        </span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed z-50 flex flex-col transition-all duration-300 overflow-hidden",
        "bg-background/95 backdrop-blur-xl border border-border/60 rounded-3xl shadow-2xl",
        isExpanded
          ? "bottom-4 right-4 left-4 top-4 lg:left-auto lg:w-[640px]"
          : "bottom-6 right-6 w-[400px] h-[560px]"
      )}
    >
      {/* Header — warm & personal */}
      <div className="relative px-4 py-3 border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/8 via-primary/5 to-accent/8 rounded-t-3xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/15 flex items-center justify-center shadow-sm">
                <GraduationCap className="w-5 h-5 text-secondary" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-secondary border-2 border-background" />
            </div>
            <div>
              <p className="text-sm font-semibold flex items-center gap-1.5">
                Prof. Virtuel
                <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-full bg-secondary/10 text-secondary">en ligne</span>
              </p>
              <p className="text-[11px] text-muted-foreground truncate max-w-[200px] flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {course.title}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl hover:bg-muted/60 transition-colors"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4 text-muted-foreground" /> : <Maximize2 className="w-4 h-4 text-muted-foreground" />}
            </button>
            <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-destructive/10 transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
        {/* Welcome state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center py-6 space-y-5 animate-fade-in">
            <div className="relative">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-secondary/15 to-primary/10 flex items-center justify-center shadow-md">
                <GraduationCap className="w-8 h-8 text-secondary" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
              </div>
            </div>
            <div className="text-center space-y-1.5">
              <p className="text-base font-semibold">Bonjour ! 👋</p>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px]">
                Je suis votre prof virtuel pour ce cours. Posez-moi vos questions, je vous explique tout simplement.
              </p>
            </div>

            {/* Welcome message bubble */}
            <div className="w-full bg-card border border-border/40 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
              <p className="text-sm text-foreground/90 leading-relaxed">
                💬 N'hésitez pas à me demander un <strong>résumé</strong>, une <strong>explication</strong> d'un concept difficile, ou même un <strong>exemple concret</strong>. Je suis là pour vous accompagner !
              </p>
            </div>

            {/* Quick questions */}
            <div className="w-full space-y-2">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider px-1">Suggestions</p>
              <div className="grid grid-cols-2 gap-2">
                {quickQuestions.map((q) => (
                  <button
                    key={q.text}
                    onClick={() => {
                      setInput(q.text);
                      setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                    className="flex items-center gap-2 text-left text-xs px-3 py-2.5 rounded-xl border border-border/50 hover:bg-muted/40 hover:border-primary/20 transition-all group"
                  >
                    <span className="text-base">{q.icon}</span>
                    <span className="text-foreground/80 group-hover:text-foreground transition-colors">{q.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Conversation */}
        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
          const showTimestamp = i === 0 || (messages[i - 1] && messages[i - 1].role !== msg.role);

          return (
            <div key={i} className="animate-fade-in" style={{ animationDelay: `${Math.min(i * 30, 150)}ms` }}>
              {showTimestamp && (
                <div className={cn("flex mb-1", isUser ? "justify-end" : "justify-start")}>
                  <TimeStamp date={msg.timestamp} />
                </div>
              )}
              <div className={cn("flex items-end gap-2.5", isUser ? "flex-row-reverse" : "")}>
                {/* Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-secondary/20 to-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm mb-0.5">
                    <GraduationCap className="w-4 h-4 text-secondary" />
                  </div>
                )}
                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm mb-0.5">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={cn(
                    "max-w-[80%] text-sm leading-relaxed",
                    isUser
                      ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2.5 shadow-sm"
                      : "bg-card border border-border/40 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:leading-relaxed [&_li]:leading-relaxed [&_ul]:space-y-1 [&_ol]:space-y-1 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_strong]:text-foreground [&_code]:text-xs [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <>
                      {msg.fileName && (
                        <div className="flex items-center gap-1.5 mb-1.5 text-xs opacity-80">
                          <FileText className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[180px]">{msg.fileName}</span>
                        </div>
                      )}
                      <p>{msg.content}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-border/40 bg-muted/20">
        {/* Attached file indicator */}
        {attachedFile && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/20 text-sm">
            <FileText className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="truncate text-foreground/80">{attachedFile.name}</span>
            <span className="text-[10px] text-muted-foreground flex-shrink-0">
              {(attachedFile.size / 1024).toFixed(0)} Ko
            </span>
            <button onClick={() => setAttachedFile(null)} className="ml-auto p-0.5 rounded-full hover:bg-destructive/10 transition-colors">
              <XCircle className="w-4 h-4 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        )}
        <div className="flex gap-2 items-end">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-3 rounded-2xl hover:bg-muted/60 transition-colors flex-shrink-0"
            title="Joindre un document PDF ou DOCX"
          >
            <Paperclip className="w-4 h-4 text-muted-foreground" />
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question au prof…"
            rows={1}
            className="flex-1 p-3 rounded-2xl border border-border/50 bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 max-h-24 placeholder:text-muted-foreground/60 transition-all"
            style={{ minHeight: "44px" }}
          />
          <button
            onClick={sendMessage}
            disabled={(!input.trim() && !attachedFile) || isLoading}
            className={cn(
              "p-3 rounded-2xl transition-all flex-shrink-0 shadow-sm",
              (input.trim() || attachedFile) && !isLoading
                ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground hover:shadow-md hover:scale-105"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
          PDF et DOCX acceptés · Réponses basées sur votre cours
        </p>
      </div>
    </div>
  );
}
