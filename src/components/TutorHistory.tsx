import { useState, useEffect } from "react";
import { History, Plus, Trash2, MessageCircle, X, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface TutorConversation {
  id: string;
  title: string;
  messages: any[];
  course_id: string | null;
  created_at: string;
  updated_at: string;
}

interface TutorHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  currentConversationId: string | null;
  onSelectConversation: (conv: TutorConversation) => void;
  onNewConversation: () => void;
}

export function TutorHistory({
  isOpen,
  onClose,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
}: TutorHistoryProps) {
  const [conversations, setConversations] = useState<TutorConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) loadConversations();
  }, [isOpen]);

  const loadConversations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("tutor_conversations")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(50);

    if (data) {
      setConversations(data as unknown as TutorConversation[]);
    }
    setLoading(false);
  };

  const deleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await supabase.from("tutor_conversations").delete().eq("id", id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  const getMessageCount = (messages: any[]) => {
    if (!Array.isArray(messages)) return 0;
    return messages.filter((m: any) => m.question).length;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed left-0 top-0 bottom-0 z-50 w-80 max-w-[85vw] bg-background border-r border-border/40 shadow-2xl flex flex-col animate-slide-in-left">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <History className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-bold text-sm">Historique</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New conversation button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewConversation();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 border-dashed border-primary/20 hover:border-primary/40 hover:bg-primary/[0.04] transition-all text-sm font-medium text-primary"
          >
            <Plus className="w-4 h-4" />
            Nouvelle conversation
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageCircle className="w-10 h-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm text-muted-foreground">Aucune conversation</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Tes échanges avec le tuteur s'afficheront ici
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {conversations.map((conv) => {
                const msgCount = getMessageCount(conv.messages);
                const isActive = conv.id === currentConversationId;

                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      onSelectConversation(conv);
                      onClose();
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-xl transition-all group relative",
                      isActive
                        ? "bg-primary/[0.08] border border-primary/20"
                        : "hover:bg-muted/40 border border-transparent"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm font-medium truncate",
                            isActive ? "text-primary" : "text-foreground"
                          )}
                        >
                          {conv.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(conv.updated_at)}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {msgCount} échange{msgCount > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => deleteConversation(e, conv.id)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
