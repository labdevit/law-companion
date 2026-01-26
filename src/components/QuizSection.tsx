import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Section, QuizQuestion } from "@/data/sections";
import { cn } from "@/lib/utils";

interface QuizSectionProps {
  section: Section | null;
  onValidate: (score: number, total: number) => boolean;
}

interface QuizAnswer {
  [questionIndex: number]: string | number | boolean | null;
}

interface QuizResult {
  [questionIndex: number]: {
    correct: boolean;
    explanation: string;
  } | null;
}

export function QuizSection({ section, onValidate }: QuizSectionProps) {
  const [answers, setAnswers] = useState<QuizAnswer>({});
  const [results, setResults] = useState<QuizResult>({});
  const [validated, setValidated] = useState(false);
  const [tipMessage, setTipMessage] = useState("");

  // Reset when section changes
  useEffect(() => {
    setAnswers({});
    setResults({});
    setValidated(false);
    setTipMessage("");
  }, [section?.id]);

  if (!section || section.quiz.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        Aucun quiz pour cette section.
      </div>
    );
  }

  const handleAnswerChange = (index: number, value: string | number | boolean) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const handleValidate = () => {
    let score = 0;
    const newResults: QuizResult = {};

    section.quiz.forEach((q, idx) => {
      const answer = answers[idx];
      let correct = false;

      if (q.type === "mcq" && answer !== undefined) {
        correct = Number(answer) === q.answer;
      } else if (q.type === "tf" && answer !== undefined) {
        correct = (answer === "true") === q.answerTF;
      } else if (q.type === "short" && typeof answer === "string" && q.answerText) {
        const userAnswer = answer.toLowerCase().trim();
        correct = q.answerText.some((expected) =>
          userAnswer.includes(expected.toLowerCase())
        );
      }

      if (correct) score++;
      newResults[idx] = {
        correct,
        explanation: q.explain,
      };
    });

    setResults(newResults);
    setValidated(true);

    const total = section.quiz.length;
    const passed = onValidate(score, total);

    setTipMessage(
      passed
        ? `🎉 Validé ! Score ${score}/${total}. (>=70%)`
        : `Encore un effort : ${score}/${total}. Objectif : 70%`
    );
  };

  const renderQuestion = (q: QuizQuestion, idx: number) => {
    const result = results[idx];
    const qKey = `${section.id}_q${idx}`;

    return (
      <div
        key={idx}
        className="p-3 rounded-2xl border border-border/50 bg-white/[0.03] mb-3 animate-fade-in"
      >
        <p className="text-[13px] font-bold mb-3">
          {idx + 1}. {q.q}
        </p>

        {/* MCQ */}
        {q.type === "mcq" && q.choices && (
          <div className="space-y-2">
            {q.choices.map((choice, i) => (
              <label
                key={i}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150",
                  answers[idx] === i
                    ? "border-primary/50 bg-primary/10"
                    : "border-border/50 bg-white/[0.02] hover:bg-white/[0.05]"
                )}
              >
                <input
                  type="radio"
                  name={qKey}
                  value={i}
                  checked={answers[idx] === i}
                  onChange={() => handleAnswerChange(idx, i)}
                  className="mt-0.5 accent-primary"
                  disabled={validated}
                />
                <span className="text-sm">
                  <strong>{String.fromCharCode(65 + i)}.</strong> {choice}
                </span>
              </label>
            ))}
          </div>
        )}

        {/* True/False */}
        {q.type === "tf" && (
          <div className="space-y-2">
            {["true", "false"].map((val) => (
              <label
                key={val}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150",
                  answers[idx] === val
                    ? "border-primary/50 bg-primary/10"
                    : "border-border/50 bg-white/[0.02] hover:bg-white/[0.05]"
                )}
              >
                <input
                  type="radio"
                  name={qKey}
                  value={val}
                  checked={answers[idx] === val}
                  onChange={() => handleAnswerChange(idx, val)}
                  className="mt-0.5 accent-primary"
                  disabled={validated}
                />
                <span className="text-sm font-medium">
                  {val === "true" ? "Vrai" : "Faux"}
                </span>
              </label>
            ))}
          </div>
        )}

        {/* Short answer */}
        {q.type === "short" && (
          <div>
            <input
              type="text"
              placeholder="Écris ta réponse ici..."
              value={(answers[idx] as string) || ""}
              onChange={(e) => handleAnswerChange(idx, e.target.value)}
              disabled={validated}
              className="w-full p-3 rounded-xl border border-border/50 bg-white/[0.04] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Astuce : mots clés attendus (pas besoin de phrase parfaite).
            </p>
          </div>
        )}

        {/* Result feedback */}
        {result && (
          <div
            className={cn(
              "mt-3 p-3 rounded-xl border text-sm flex items-start gap-2",
              result.correct
                ? "bg-secondary/10 border-secondary/30"
                : "bg-destructive/10 border-destructive/30"
            )}
          >
            {result.correct ? (
              <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            )}
            <span>
              {result.correct ? "✅ Correct." : "❌ Faux."} {result.explanation}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {section.quiz.map((q, idx) => renderQuestion(q, idx))}

      <button
        onClick={handleValidate}
        disabled={validated}
        className={cn(
          "w-full py-3 px-4 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-150",
          validated
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-gradient-to-r from-secondary/20 to-primary/10 border border-secondary/40 text-foreground hover:-translate-y-0.5"
        )}
      >
        <CheckCircle2 className="w-4 h-4" />
        {validated ? "Quiz validé" : "Valider le quiz"}
      </button>

      {tipMessage && (
        <p className="text-xs text-muted-foreground mt-3 text-center">{tipMessage}</p>
      )}

      {!validated && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Tu peux refaire le quiz autant de fois que tu veux.
        </p>
      )}
    </div>
  );
}
