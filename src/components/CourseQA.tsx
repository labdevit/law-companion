import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Bot, User, Loader2, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Course, getAllSections } from "@/data/courses";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface CourseQAProps {
  course: Course;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function CourseQA({ course }: CourseQAProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Build course content for context
  const courseContent = getAllSections(course)
    .map((s) => `## ${s.title}\n${s.content.replace(/<[^>]+>/g, "")}`)
    .join("\n\n");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset messages when course changes
  useEffect(() => {
    setMessages([]);
  }, [course.id]);

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    const userMsg: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
        }
        return [...prev, { role: "assistant", content: assistantContent }];
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
            question,
            courseContent,
            courseTitle: course.title,
            history: messages,
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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center group"
        title="Poser une question sur le cours"
      >
        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed z-50 bg-background border border-border rounded-2xl shadow-2xl flex flex-col transition-all duration-300",
        isExpanded
          ? "bottom-4 right-4 left-4 top-4 lg:left-auto lg:w-[600px]"
          : "bottom-6 right-6 w-[380px] h-[520px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Assistant IA</p>
            <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">
              {course.title}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-muted/50"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-muted/50">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Posez vos questions !</p>
              <p className="text-xs text-muted-foreground mt-1">
                Je connais le contenu de "{course.title}" et je suis là pour vous aider.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {["Résume ce cours", "Explique les concepts clés", "Donne-moi un exemple"].map(
                (q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInput(q);
                      setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                    className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-muted/50 transition-colors"
                  >
                    {q}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn("flex gap-2", msg.role === "user" ? "flex-row-reverse" : "")}
          >
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
                msg.role === "user" ? "bg-primary/10" : "bg-secondary/10"
              )}
            >
              {msg.role === "user" ? (
                <User className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Bot className="w-3.5 h-3.5 text-secondary" />
              )}
            </div>
            <div
              className={cn(
                "rounded-xl px-3 py-2 max-w-[85%] text-sm",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 border border-border/50"
              )}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-secondary" />
            </div>
            <div className="bg-muted/50 border border-border/50 rounded-xl px-3 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez une question sur le cours..."
            rows={1}
            className="flex-1 p-2.5 rounded-xl border border-border bg-card/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 max-h-24"
            style={{ minHeight: "40px" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
