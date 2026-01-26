import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";
import { Section, QuizQuestion } from "@/data/courses";
import { cn } from "@/lib/utils";
import { validateShortAnswer } from "@/lib/textMatching";

interface QuizSectionProps {
  section: Section;
  onComplete: (score: number, total: number) => boolean;
  previousScore?: { bestScore: number; attempts: number };
}

interface QuizState {
  answers: { [key: number]: string | number | boolean | null };
  results: { [key: number]: { correct: boolean; explanation: string; hint?: string } | null };
  validated: boolean;
  score: number;
}

export function QuizSection({ section, onComplete, previousScore }: QuizSectionProps) {
  const [state, setState] = useState<QuizState>({
    answers: {},
    results: {},
    validated: false,
    score: 0,
  });
  const [tipMessage, setTipMessage] = useState("");

  // Reset when section changes
  useEffect(() => {
    setState({
      answers: {},
      results: {},
      validated: false,
      score: 0,
    });
    setTipMessage("");
  }, [section.id]);

  if (section.quiz.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center">
        <p>Aucun quiz pour cette section.</p>
      </div>
    );
  }

  const handleAnswerChange = (index: number, value: string | number | boolean) => {
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [index]: value },
    }));
  };

  const handleValidate = () => {
    let score = 0;
    const newResults: typeof state.results = {};

    section.quiz.forEach((q, idx) => {
      const answer = state.answers[idx];
      let correct = false;
      let hint: string | undefined;

      if (q.type === "mcq" && answer !== undefined && answer !== null) {
        correct = Number(answer) === q.correctAnswer;
      } else if (q.type === "tf" && answer !== undefined && answer !== null) {
        correct = answer === q.correctAnswer;
      } else if (q.type === "short" && typeof answer === "string" && Array.isArray(q.correctAnswer)) {
        // Use smart validation
        const validation = validateShortAnswer(answer, q.correctAnswer, 0.4);
        correct = validation.isCorrect;
        
        if (!correct && validation.missedKeywords.length > 0) {
          hint = `Mots-clés attendus : ${validation.missedKeywords.slice(0, 2).join(", ")}...`;
        }
      }

      if (correct) score++;
      newResults[idx] = {
        correct,
        explanation: q.explanation,
        hint,
      };
    });

    setState((prev) => ({
      ...prev,
      results: newResults,
      validated: true,
      score,
    }));

    const total = section.quiz.length;
    const passed = onComplete(score, total);
    const percentage = Math.round((score / total) * 100);

    setTipMessage(
      passed
        ? `🎉 Bravo ! Score : ${score}/${total} (${percentage}%) — Section validée !`
        : `Score : ${score}/${total} (${percentage}%) — Objectif : 70% pour valider`
    );
  };

  const handleReset = () => {
    setState({
      answers: {},
      results: {},
      validated: false,
      score: 0,
    });
    setTipMessage("");
  };

  const renderQuestion = (q: QuizQuestion, idx: number) => {
    const result = state.results[idx];
    const qKey = `${section.id}_q${idx}`;

    return (
      <div
        key={idx}
        className={cn(
          "p-4 rounded-xl border transition-all duration-200 mb-3",
          result?.correct === true
            ? "border-secondary/50 bg-secondary/5"
            : result?.correct === false
            ? "border-destructive/50 bg-destructive/5"
            : "border-border/50 bg-card/50"
        )}
      >
        <p className="text-sm font-semibold mb-3 flex gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs flex-shrink-0">
            {idx + 1}
          </span>
          <span>{q.question}</span>
        </p>

        {/* MCQ */}
        {q.type === "mcq" && q.choices && (
          <div className="space-y-2 ml-8">
            {q.choices.map((choice, i) => (
              <label
                key={i}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150",
                  state.answers[idx] === i
                    ? "border-primary/50 bg-primary/10"
                    : "border-border/30 bg-background/50 hover:bg-muted/30",
                  state.validated && i === q.correctAnswer && "border-secondary bg-secondary/10",
                  state.validated && state.answers[idx] === i && i !== q.correctAnswer && "border-destructive bg-destructive/10"
                )}
              >
                <input
                  type="radio"
                  name={qKey}
                  value={i}
                  checked={state.answers[idx] === i}
                  onChange={() => handleAnswerChange(idx, i)}
                  className="mt-0.5 accent-primary"
                  disabled={state.validated}
                />
                <span className="text-sm">
                  <strong className="text-muted-foreground">{String.fromCharCode(65 + i)}.</strong> {choice}
                </span>
              </label>
            ))}
          </div>
        )}

        {/* True/False */}
        {q.type === "tf" && (
          <div className="space-y-2 ml-8">
            {[
              { value: true, label: "Vrai" },
              { value: false, label: "Faux" },
            ].map((opt) => (
              <label
                key={String(opt.value)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150",
                  state.answers[idx] === opt.value
                    ? "border-primary/50 bg-primary/10"
                    : "border-border/30 bg-background/50 hover:bg-muted/30",
                  state.validated && opt.value === q.correctAnswer && "border-secondary bg-secondary/10",
                  state.validated && state.answers[idx] === opt.value && opt.value !== q.correctAnswer && "border-destructive bg-destructive/10"
                )}
              >
                <input
                  type="radio"
                  name={qKey}
                  value={String(opt.value)}
                  checked={state.answers[idx] === opt.value}
                  onChange={() => handleAnswerChange(idx, opt.value)}
                  className="mt-0.5 accent-primary"
                  disabled={state.validated}
                />
                <span className="text-sm font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
        )}

        {/* Short answer */}
        {q.type === "short" && (
          <div className="ml-8">
            <input
              type="text"
              placeholder="Écris ta réponse ici..."
              value={(state.answers[idx] as string) || ""}
              onChange={(e) => handleAnswerChange(idx, e.target.value)}
              disabled={state.validated}
              className="w-full p-3 rounded-lg border border-border/50 bg-background/50 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors text-sm"
            />
            <p className="text-[10px] text-muted-foreground mt-1.5">
              💡 Utilise les mots-clés importants (pas besoin d'une phrase parfaite)
            </p>
          </div>
        )}

        {/* Result feedback */}
        {result && (
          <div
            className={cn(
              "mt-3 ml-8 p-3 rounded-lg text-sm flex items-start gap-2",
              result.correct
                ? "bg-secondary/10 text-secondary-foreground"
                : "bg-destructive/10 text-destructive-foreground"
            )}
          >
            {result.correct ? (
              <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            )}
            <span>{result.explanation}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Previous score info */}
      {previousScore && previousScore.attempts > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-muted/30 border border-border/30 flex items-center gap-3">
          <Trophy className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Meilleur score</p>
            <p className="text-sm font-bold">{previousScore.bestScore}/{section.quiz.length}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Tentatives</p>
            <p className="text-sm font-bold">{previousScore.attempts}</p>
          </div>
        </div>
      )}

      {/* Questions */}
      {section.quiz.map((q, idx) => renderQuestion(q, idx))}

      {/* Action buttons */}
      <div className="flex gap-2 mt-4">
        {!state.validated ? (
          <button
            onClick={handleValidate}
            className="flex-1 py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-secondary/20 to-primary/10 border border-secondary/40 text-foreground hover:-translate-y-0.5 transition-all duration-150"
          >
            <CheckCircle2 className="w-4 h-4" />
            Valider mes réponses
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="flex-1 py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 bg-muted/50 border border-border/50 text-foreground hover:-translate-y-0.5 transition-all duration-150"
          >
            <RotateCcw className="w-4 h-4" />
            Recommencer
          </button>
        )}
      </div>

      {/* Result message */}
      {tipMessage && (
        <p className={cn(
          "text-sm mt-3 text-center p-3 rounded-xl",
          state.score / section.quiz.length >= 0.7
            ? "bg-secondary/10 text-secondary"
            : "bg-muted text-muted-foreground"
        )}>
          {tipMessage}
        </p>
      )}
    </div>
  );
}
