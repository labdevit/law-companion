import { useState } from "react";
import { X, Plus, Trash2, ChevronDown, ChevronRight, BookOpen, HelpCircle, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { COURSE_COLORS, COURSE_ICONS, CustomCourseData } from "@/hooks/useCustomCourses";
import { QuizQuestion } from "@/data/courses";
import { QuizCreator } from "./QuizCreator";

interface CourseCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CustomCourseData) => void;
  initialData?: CustomCourseData;
  mode?: "create" | "edit";
}

interface SectionData {
  title: string;
  content: string;
  quiz: QuizQuestion[];
}

interface ChapterData {
  title: string;
  sections: SectionData[];
  isExpanded: boolean;
}

export function CourseCreatorModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode = "create",
}: CourseCreatorModalProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [icon, setIcon] = useState(initialData?.icon || COURSE_ICONS[0]);
  const [color, setColor] = useState(initialData?.color || COURSE_COLORS[0].value);
  const [chapters, setChapters] = useState<ChapterData[]>(
    initialData?.chapters.map((ch) => ({
      ...ch,
      isExpanded: true,
    })) || [
      {
        title: "",
        sections: [{ title: "", content: "", quiz: [] }],
        isExpanded: true,
      },
    ]
  );
  const [activeQuizEditor, setActiveQuizEditor] = useState<{ chapterIdx: number; sectionIdx: number } | null>(null);
  const [step, setStep] = useState<"info" | "content">("info");

  if (!isOpen) return null;

  const handleAddChapter = () => {
    setChapters([
      ...chapters,
      { title: "", sections: [{ title: "", content: "", quiz: [] }], isExpanded: true },
    ]);
  };

  const handleRemoveChapter = (chapterIdx: number) => {
    if (chapters.length <= 1) return;
    setChapters(chapters.filter((_, i) => i !== chapterIdx));
  };

  const handleAddSection = (chapterIdx: number) => {
    const updated = [...chapters];
    updated[chapterIdx].sections.push({ title: "", content: "", quiz: [] });
    setChapters(updated);
  };

  const handleRemoveSection = (chapterIdx: number, sectionIdx: number) => {
    const updated = [...chapters];
    if (updated[chapterIdx].sections.length <= 1) return;
    updated[chapterIdx].sections = updated[chapterIdx].sections.filter((_, i) => i !== sectionIdx);
    setChapters(updated);
  };

  const handleChapterTitleChange = (chapterIdx: number, value: string) => {
    const updated = [...chapters];
    updated[chapterIdx].title = value;
    setChapters(updated);
  };

  const handleSectionChange = (
    chapterIdx: number,
    sectionIdx: number,
    field: keyof SectionData,
    value: string | QuizQuestion[]
  ) => {
    const updated = [...chapters];
    (updated[chapterIdx].sections[sectionIdx] as any)[field] = value;
    setChapters(updated);
  };

  const toggleChapterExpand = (chapterIdx: number) => {
    const updated = [...chapters];
    updated[chapterIdx].isExpanded = !updated[chapterIdx].isExpanded;
    setChapters(updated);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert("Veuillez entrer un titre pour le cours");
      return;
    }

    const hasContent = chapters.some((ch) =>
      ch.title.trim() && ch.sections.some((s) => s.title.trim())
    );
    if (!hasContent) {
      alert("Ajoutez au moins un chapitre avec une section");
      return;
    }

    const data: CustomCourseData = {
      title: title.trim(),
      icon,
      color,
      chapters: chapters
        .filter((ch) => ch.title.trim())
        .map((ch) => ({
          title: ch.title.trim(),
          sections: ch.sections
            .filter((s) => s.title.trim())
            .map((s) => ({
              title: s.title.trim(),
              content: s.content || "<p>Contenu à ajouter...</p>",
              quiz: s.quiz,
            })),
        })),
    };

    onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-xl", color)}>
              {icon}
            </div>
            <div>
              <h2 className="font-bold">{mode === "create" ? "Créer un cours" : "Modifier le cours"}</h2>
              <p className="text-xs text-muted-foreground">
                {step === "info" ? "Étape 1/2 : Informations" : "Étape 2/2 : Contenu"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {step === "info" ? (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Titre du cours *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Droit Commercial"
                  className="w-full p-3 rounded-xl border border-border bg-card/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Icon selector */}
              <div>
                <label className="block text-sm font-medium mb-2">Icône</label>
                <div className="flex flex-wrap gap-2">
                  {COURSE_ICONS.map((i) => (
                    <button
                      key={i}
                      onClick={() => setIcon(i)}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all",
                        icon === i
                          ? "bg-primary/20 border-2 border-primary"
                          : "bg-muted/30 border border-border hover:bg-muted/50"
                      )}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color selector */}
              <div>
                <label className="block text-sm font-medium mb-2">Couleur</label>
                <div className="flex flex-wrap gap-2">
                  {COURSE_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setColor(c.value)}
                      className={cn(
                        "w-12 h-8 rounded-lg bg-gradient-to-br transition-all",
                        c.value,
                        color === c.value ? "ring-2 ring-offset-2 ring-primary" : ""
                      )}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {chapters.map((chapter, chapterIdx) => (
                <div
                  key={chapterIdx}
                  className="border border-border/50 rounded-xl bg-card/30 overflow-hidden"
                >
                  {/* Chapter header */}
                  <div className="flex items-center gap-2 p-3 bg-muted/20">
                    <button
                      onClick={() => toggleChapterExpand(chapterIdx)}
                      className="p-1 hover:bg-muted/50 rounded"
                    >
                      {chapter.isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {chapterIdx + 1}
                    </div>
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) => handleChapterTitleChange(chapterIdx, e.target.value)}
                      placeholder="Titre du chapitre"
                      className="flex-1 bg-transparent border-none focus:outline-none font-medium"
                    />
                    {chapters.length > 1 && (
                      <button
                        onClick={() => handleRemoveChapter(chapterIdx)}
                        className="p-1.5 text-destructive hover:bg-destructive/10 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Sections */}
                  {chapter.isExpanded && (
                    <div className="p-3 space-y-3">
                      {chapter.sections.map((section, sectionIdx) => (
                        <div
                          key={sectionIdx}
                          className="border border-border/30 rounded-lg p-3 bg-background/50 space-y-3"
                        >
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) =>
                                handleSectionChange(chapterIdx, sectionIdx, "title", e.target.value)
                              }
                              placeholder="Titre de la section"
                              className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                            />
                            {chapter.sections.length > 1 && (
                              <button
                                onClick={() => handleRemoveSection(chapterIdx, sectionIdx)}
                                className="p-1 text-destructive/70 hover:text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <textarea
                            value={section.content}
                            onChange={(e) =>
                              handleSectionChange(chapterIdx, sectionIdx, "content", e.target.value)
                            }
                            placeholder="Contenu de la section (HTML supporté avec <span class='hl'>...</span> pour le surlignage)"
                            className="w-full p-2 rounded-lg border border-border/30 bg-muted/20 text-xs resize-none h-20 focus:outline-none focus:ring-1 focus:ring-primary/30"
                          />

                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => setActiveQuizEditor({ chapterIdx, sectionIdx })}
                              className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                              {section.quiz.length > 0
                                ? `${section.quiz.length} question(s)`
                                : "Ajouter des questions"}
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => handleAddSection(chapterIdx)}
                        className="w-full p-2 border border-dashed border-border/50 rounded-lg text-xs text-muted-foreground hover:bg-muted/20 flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Ajouter une section
                      </button>
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={handleAddChapter}
                className="w-full p-3 border border-dashed border-primary/30 rounded-xl text-sm text-primary hover:bg-primary/5 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter un chapitre
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-card/50">
          {step === "content" ? (
            <button
              onClick={() => setStep("info")}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              ← Retour
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted/50"
            >
              Annuler
            </button>
            {step === "info" ? (
              <button
                onClick={() => setStep("content")}
                disabled={!title.trim()}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Suivant →
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {mode === "create" ? "Créer le cours" : "Enregistrer"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quiz Editor Modal */}
      {activeQuizEditor && (
        <QuizCreator
          isOpen={!!activeQuizEditor}
          onClose={() => setActiveQuizEditor(null)}
          quiz={chapters[activeQuizEditor.chapterIdx].sections[activeQuizEditor.sectionIdx].quiz}
          onSave={(quiz) => {
            handleSectionChange(
              activeQuizEditor.chapterIdx,
              activeQuizEditor.sectionIdx,
              "quiz",
              quiz
            );
            setActiveQuizEditor(null);
          }}
        />
      )}
    </div>
  );
}
