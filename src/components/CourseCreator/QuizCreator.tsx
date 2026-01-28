import { useState } from "react";
import { X, Plus, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuizQuestion } from "@/data/courses";

interface QuizCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizQuestion[];
  onSave: (quiz: QuizQuestion[]) => void;
}

type QuestionType = "mcq" | "tf" | "short";

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "mcq", label: "QCM" },
  { value: "tf", label: "Vrai/Faux" },
  { value: "short", label: "Réponse courte" },
];

export function QuizCreator({ isOpen, onClose, quiz, onSave }: QuizCreatorProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(quiz);

  if (!isOpen) return null;

  const addQuestion = (type: QuestionType) => {
    const newQuestion: QuizQuestion = {
      type,
      question: "",
      explanation: "",
      ...(type === "mcq"
        ? { choices: ["", "", "", ""], correctAnswer: 0 }
        : type === "tf"
        ? { correctAnswer: true }
        : { correctAnswer: [""] }),
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    (updated[index] as any)[field] = value;
    setQuestions(updated);
  };

  const updateChoice = (qIndex: number, cIndex: number, value: string) => {
    const updated = [...questions];
    if (updated[qIndex].choices) {
      updated[qIndex].choices![cIndex] = value;
      setQuestions(updated);
    }
  };

  const updateKeyword = (qIndex: number, kIndex: number, value: string) => {
    const updated = [...questions];
    if (Array.isArray(updated[qIndex].correctAnswer)) {
      (updated[qIndex].correctAnswer as string[])[kIndex] = value;
      setQuestions(updated);
    }
  };

  const addKeyword = (qIndex: number) => {
    const updated = [...questions];
    if (Array.isArray(updated[qIndex].correctAnswer)) {
      (updated[qIndex].correctAnswer as string[]).push("");
      setQuestions(updated);
    }
  };

  const removeKeyword = (qIndex: number, kIndex: number) => {
    const updated = [...questions];
    if (Array.isArray(updated[qIndex].correctAnswer) && (updated[qIndex].correctAnswer as string[]).length > 1) {
      (updated[qIndex].correctAnswer as string[]).splice(kIndex, 1);
      setQuestions(updated);
    }
  };

  const handleSave = () => {
    // Filter out incomplete questions
    const validQuestions = questions.filter((q) => q.question.trim());
    onSave(validQuestions);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[85vh] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-bold">Éditeur de Quiz</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {questions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">Aucune question. Ajoutez-en une !</p>
            </div>
          ) : (
            questions.map((q, qIndex) => (
              <div
                key={qIndex}
                className="border border-border/50 rounded-xl p-4 bg-card/30 space-y-3"
              >
                <div className="flex items-start gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground mt-2 cursor-grab" />
                  <div className="flex-1 space-y-3">
                    {/* Question type badge */}
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-medium",
                          q.type === "mcq" && "bg-primary/20 text-primary",
                          q.type === "tf" && "bg-secondary/20 text-secondary",
                          q.type === "short" && "bg-accent/20 text-accent-foreground"
                        )}
                      >
                        {QUESTION_TYPES.find((t) => t.value === q.type)?.label}
                      </span>
                      <button
                        onClick={() => removeQuestion(qIndex)}
                        className="p-1 text-destructive/70 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Question text */}
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                      placeholder="Entrez la question..."
                      className="w-full p-2 rounded-lg border border-border/30 bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />

                    {/* Type-specific inputs */}
                    {q.type === "mcq" && q.choices && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Choix (cochez la bonne réponse)</p>
                        {q.choices.map((choice, cIndex) => (
                          <div key={cIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`q-${qIndex}`}
                              checked={q.correctAnswer === cIndex}
                              onChange={() => updateQuestion(qIndex, "correctAnswer", cIndex)}
                              className="accent-secondary"
                            />
                            <input
                              type="text"
                              value={choice}
                              onChange={(e) => updateChoice(qIndex, cIndex, e.target.value)}
                              placeholder={`Choix ${cIndex + 1}`}
                              className="flex-1 p-1.5 rounded border border-border/30 bg-muted/20 text-xs focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {q.type === "tf" && (
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name={`tf-${qIndex}`}
                            checked={q.correctAnswer === true}
                            onChange={() => updateQuestion(qIndex, "correctAnswer", true)}
                            className="accent-secondary"
                          />
                          Vrai
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name={`tf-${qIndex}`}
                            checked={q.correctAnswer === false}
                            onChange={() => updateQuestion(qIndex, "correctAnswer", false)}
                            className="accent-secondary"
                          />
                          Faux
                        </label>
                      </div>
                    )}

                    {q.type === "short" && Array.isArray(q.correctAnswer) && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Mots-clés attendus</p>
                        {(q.correctAnswer as string[]).map((keyword, kIndex) => (
                          <div key={kIndex} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={keyword}
                              onChange={(e) => updateKeyword(qIndex, kIndex, e.target.value)}
                              placeholder={`Mot-clé ${kIndex + 1}`}
                              className="flex-1 p-1.5 rounded border border-border/30 bg-muted/20 text-xs focus:outline-none"
                            />
                            {(q.correctAnswer as string[]).length > 1 && (
                              <button
                                onClick={() => removeKeyword(qIndex, kIndex)}
                                className="p-1 text-destructive/50 hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addKeyword(qIndex)}
                          className="text-xs text-primary hover:underline"
                        >
                          + Ajouter un mot-clé
                        </button>
                      </div>
                    )}

                    {/* Explanation */}
                    <input
                      type="text"
                      value={q.explanation}
                      onChange={(e) => updateQuestion(qIndex, "explanation", e.target.value)}
                      placeholder="Explication (optionnel)"
                      className="w-full p-1.5 rounded border border-border/30 bg-muted/20 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Add question buttons */}
          <div className="flex gap-2 flex-wrap">
            {QUESTION_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => addQuestion(type.value)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs border border-dashed border-border rounded-lg hover:bg-muted/30"
              >
                <Plus className="w-3.5 h-3.5" />
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted/50"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Enregistrer ({questions.length} questions)
          </button>
        </div>
      </div>
    </div>
  );
}
