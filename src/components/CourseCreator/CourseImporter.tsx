import { useState, useRef } from "react";
import { Upload, FileText, Sparkles, X, AlertCircle, CheckCircle, Brain, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { COURSE_COLORS, COURSE_ICONS, CustomCourseData } from "@/hooks/useCustomCourses";
import { supabase } from "@/integrations/supabase/client";

interface CourseImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: CustomCourseData) => void;
}

type Step = "upload" | "processing" | "preview";

interface ParsedCourse {
  title: string;
  chapters: {
    title: string;
    sections: {
      title: string;
      content: string;
      quiz: any[];
    }[];
  }[];
}

export function CourseImporter({ isOpen, onClose, onImport }: CourseImporterProps) {
  const [step, setStep] = useState<Step>("upload");
  const [rawContent, setRawContent] = useState("");
  const [parsedCourse, setParsedCourse] = useState<ParsedCourse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [icon, setIcon] = useState(COURSE_ICONS[0]);
  const [color, setColor] = useState(COURSE_COLORS[0].value);
  const [processingMessage, setProcessingMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawContent(content);
    };
    reader.onerror = () => setError("Erreur lors de la lecture du fichier");
    reader.readAsText(file);
  };

  const processWithAI = async () => {
    if (!rawContent.trim()) return;

    setStep("processing");
    setError(null);
    setProcessingMessage("L'IA analyse votre contenu...");

    const messages = [
      "L'IA analyse votre contenu...",
      "Identification des chapitres et sections...",
      "Génération du surlignage sémantique...",
      "Création des quiz et questions...",
      "Finalisation du cours structuré...",
    ];

    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex = Math.min(msgIndex + 1, messages.length - 1);
      setProcessingMessage(messages[msgIndex]);
    }, 3000);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("process-course", {
        body: { content: rawContent },
      });

      clearInterval(interval);

      if (fnError) throw new Error(fnError.message || "Erreur lors du traitement");
      if (data?.error) throw new Error(data.error);
      if (!data?.course) throw new Error("Aucun résultat retourné par l'IA");

      setParsedCourse(data.course);
      setStep("preview");
    } catch (err) {
      clearInterval(interval);
      setError((err as Error).message);
      setStep("upload");
    }
  };

  const handleImport = () => {
    if (!parsedCourse) return;

    const courseData: CustomCourseData = {
      title: parsedCourse.title,
      icon,
      color,
      chapters: parsedCourse.chapters.map((ch) => ({
        title: ch.title,
        sections: ch.sections.map((s) => ({
          title: s.title,
          content: s.content,
          quiz: s.quiz,
        })),
      })),
    };

    onImport(courseData);
    handleClose();
  };

  const handleClose = () => {
    setStep("upload");
    setRawContent("");
    setParsedCourse(null);
    setError(null);
    onClose();
  };

  const totalSections =
    parsedCourse?.chapters.reduce((acc, ch) => acc + ch.sections.length, 0) || 0;
  const totalQuestions =
    parsedCourse?.chapters.reduce(
      (acc, ch) => acc + ch.sections.reduce((a, s) => a + s.quiz.length, 0),
      0
    ) || 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold">Import intelligent par IA</h2>
              <p className="text-xs text-muted-foreground">
                {step === "upload" && "Collez votre contenu, l'IA fait le reste"}
                {step === "processing" && "Traitement en cours..."}
                {step === "preview" && "Aperçu du cours généré par l'IA"}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-muted/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {step === "upload" && (
            <div className="space-y-4">
              {/* AI badge */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  Propulsé par l'IA
                </h4>
                <p className="text-xs text-muted-foreground">
                  Collez n'importe quel contenu de cours et l'IA va automatiquement :
                </p>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                  <li>🧠 Structurer en chapitres et sections cohérents</li>
                  <li>✨ Appliquer le surlignage sémantique intelligent</li>
                  <li>📝 Générer des quiz variés (QCM, Vrai/Faux, réponses courtes)</li>
                  <li>📚 Enrichir et reformuler le contenu pédagogiquement</li>
                </ul>
              </div>

              {/* File upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium">Cliquez pour importer un fichier</p>
                <p className="text-xs text-muted-foreground mt-1">.txt, .md supportés</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-x-0 top-1/2 border-t border-border" />
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-xs text-muted-foreground">ou</span>
                </div>
              </div>

              {/* Text area */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Collez votre contenu de cours
                </label>
                <textarea
                  value={rawContent}
                  onChange={(e) => setRawContent(e.target.value)}
                  placeholder="Collez ici vos notes de cours, résumés, ou tout contenu textuel...

L'IA se charge de tout structurer automatiquement !"
                  className="w-full h-48 p-3 rounded-xl border border-border bg-card/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {rawContent.length > 0 && `${rawContent.length} caractères`}
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Brain className="w-10 h-10 text-primary animate-pulse" />
                </div>
                <Loader2 className="w-24 h-24 text-primary/30 animate-spin absolute -top-2 -left-2" />
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">{processingMessage}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Cela peut prendre jusqu'à 30 secondes...
                </p>
              </div>
              <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full animate-shimmer" 
                  style={{ width: "100%", backgroundSize: "200% 100%" }} />
              </div>
            </div>
          )}

          {step === "preview" && parsedCourse && (
            <div className="space-y-4">
              {/* Success message */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/10 border border-secondary/30">
                <CheckCircle className="w-6 h-6 text-secondary" />
                <div>
                  <p className="font-medium text-sm">Cours généré par l'IA avec succès !</p>
                  <p className="text-xs text-muted-foreground">
                    {parsedCourse.chapters.length} chapitre(s), {totalSections} section(s),{" "}
                    {totalQuestions} question(s) de quiz
                  </p>
                </div>
              </div>

              {/* Course title */}
              <div>
                <label className="text-sm font-medium mb-2 block">Titre du cours</label>
                <input
                  type="text"
                  value={parsedCourse.title}
                  onChange={(e) => setParsedCourse({ ...parsedCourse, title: e.target.value })}
                  className="w-full p-3 rounded-xl border border-border bg-card/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Structure preview */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Structure générée</label>
                <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
                  {parsedCourse.chapters.map((chapter, chIdx) => (
                    <div key={chIdx} className="border border-border/50 rounded-lg p-3 bg-card/30">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {chIdx + 1}
                        </div>
                        <span className="font-medium text-sm">{chapter.title}</span>
                      </div>
                      <div className="pl-8 space-y-1">
                        {chapter.sections.map((section, secIdx) => (
                          <div key={secIdx} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {secIdx + 1}. {section.title}
                            </span>
                            <span className="text-primary/70">{section.quiz.length} Q</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customization */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Icône</label>
                  <div className="flex flex-wrap gap-1">
                    {COURSE_ICONS.slice(0, 12).map((i) => (
                      <button
                        key={i}
                        onClick={() => setIcon(i)}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all",
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
                <div>
                  <label className="text-sm font-medium mb-2 block">Couleur</label>
                  <div className="flex flex-wrap gap-1">
                    {COURSE_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setColor(c.value)}
                        className={cn(
                          "w-8 h-8 rounded-lg bg-gradient-to-br transition-all",
                          c.value,
                          color === c.value ? "ring-2 ring-offset-2 ring-primary" : ""
                        )}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-card/50">
          {step === "preview" ? (
            <button
              onClick={() => setStep("upload")}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              ← Retour
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted/50"
            >
              Annuler
            </button>

            {step === "upload" && (
              <button
                onClick={processWithAI}
                disabled={!rawContent.trim()}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
              >
                <Brain className="w-4 h-4" />
                Générer avec l'IA
              </button>
            )}

            {step === "preview" && (
              <button
                onClick={handleImport}
                className="px-4 py-2 text-sm rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Importer le cours
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
