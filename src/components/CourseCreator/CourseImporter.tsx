import { useState, useRef } from "react";
import { Upload, FileText, Sparkles, X, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseCourseContent, ParsedCourse } from "@/lib/courseParser";
import { COURSE_COLORS, COURSE_ICONS, CustomCourseData } from "@/hooks/useCustomCourses";

interface CourseImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: CustomCourseData) => void;
}

type Step = "upload" | "preview" | "customize";

export function CourseImporter({ isOpen, onClose, onImport }: CourseImporterProps) {
  const [step, setStep] = useState<Step>("upload");
  const [rawContent, setRawContent] = useState("");
  const [parsedCourse, setParsedCourse] = useState<ParsedCourse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [icon, setIcon] = useState(COURSE_ICONS[0]);
  const [color, setColor] = useState(COURSE_COLORS[0].value);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawContent(content);
      processContent(content);
    };
    reader.onerror = () => setError("Erreur lors de la lecture du fichier");
    reader.readAsText(file);
  };

  const handlePaste = () => {
    if (rawContent.trim()) {
      processContent(rawContent);
    }
  };

  const processContent = (content: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Small delay for UX feedback
      setTimeout(() => {
        const parsed = parseCourseContent(content);
        
        if (parsed.chapters.length === 0) {
          setError("Aucun contenu n'a pu être extrait. Vérifiez le format.");
          setIsProcessing(false);
          return;
        }

        setParsedCourse(parsed);
        setStep("preview");
        setIsProcessing(false);
      }, 500);
    } catch (err) {
      setError("Erreur lors du traitement: " + (err as Error).message);
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    if (!parsedCourse) return;

    const courseData: CustomCourseData = {
      title: parsedCourse.title,
      icon,
      color,
      chapters: parsedCourse.chapters.map(ch => ({
        title: ch.title,
        sections: ch.sections.map(s => ({
          title: s.title,
          content: s.content,
          quiz: s.quiz
        }))
      }))
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

  const totalSections = parsedCourse?.chapters.reduce(
    (acc, ch) => acc + ch.sections.length, 0
  ) || 0;

  const totalQuestions = parsedCourse?.chapters.reduce(
    (acc, ch) => acc + ch.sections.reduce((a, s) => a + s.quiz.length, 0), 0
  ) || 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold">Importer un cours</h2>
              <p className="text-xs text-muted-foreground">
                {step === "upload" && "Collez ou importez votre contenu"}
                {step === "preview" && "Aperçu du cours généré"}
                {step === "customize" && "Personnalisez l'apparence"}
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
              {/* Instructions */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Import intelligent
                </h4>
                <p className="text-xs text-muted-foreground">
                  Collez ou importez vos notes de cours, et le système :
                </p>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                  <li>• Détecte automatiquement les chapitres et sections</li>
                  <li>• Applique le formatage HTML avec surlignage des termes clés</li>
                  <li>• Génère des quiz (QCM, Vrai/Faux, questions courtes)</li>
                </ul>
              </div>

              {/* File upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium">Cliquez pour importer un fichier</p>
                <p className="text-xs text-muted-foreground mt-1">
                  .txt, .json, .md supportés
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.json,.md"
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
                  Collez votre contenu
                </label>
                <textarea
                  value={rawContent}
                  onChange={(e) => setRawContent(e.target.value)}
                  placeholder={`Exemple de format texte:

Chapitre 1: Introduction au Droit
Section 1: Définitions
Le droit est l'ensemble des règles...

Ou format JSON:
{
  "title": "Mon cours",
  "chapters": [...]
}`}
                  className="w-full h-48 p-3 rounded-xl border border-border bg-card/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>
          )}

          {step === "preview" && parsedCourse && (
            <div className="space-y-4">
              {/* Success message */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/10 border border-secondary/30">
                <CheckCircle className="w-6 h-6 text-secondary" />
                <div>
                  <p className="font-medium text-sm">Cours analysé avec succès !</p>
                  <p className="text-xs text-muted-foreground">
                    {parsedCourse.chapters.length} chapitre(s), {totalSections} section(s), {totalQuestions} question(s) générée(s)
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
                <label className="text-sm font-medium">Structure détectée</label>
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
                            <span className="text-primary/70">
                              {section.quiz.length} Q
                            </span>
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
                onClick={handlePaste}
                disabled={!rawContent.trim() || isProcessing}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyse...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyser
                  </>
                )}
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
