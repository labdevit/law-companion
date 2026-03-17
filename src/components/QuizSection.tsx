import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, RotateCcw, Trophy, Zap } from "lucide-react";
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
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    setState({ answers: {}, results: {}, validated: false, score: 0 });
    setTipMessage("");
    setCurrentQuestion(0);
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
        const validation = validateShortAnswer(answer, q.correctAnswer, 0.4);
        correct = validation.isCorrect;
        if (!correct && validation.missedKeywords.length > 0) {
          hint = `Mots-clés attendus : ${validation.missedKeywords.slice(0, 2).join(", ")}...`;
        }
      }

      if (correct) score++;
      newResults[idx] = { correct, explanation: q.explanation, hint };
    });

    setState((prev) => ({ ...prev, results: newResults, validated: true, score }));

    const total = section.quiz.length;
    const passed = onComplete(score, total);
    const percentage = Math.round((score / total) * 100);

    setTipMessage(
      passed
        ? `🎉 Bravo ! ${score}/${total} (${percentage}%) — Section validée !`
        : `${score}/${total} (${percentage}%) — Objectif : 70% pour valider`
    );
  };

  const handleReset = () => {
    setState({ answers: {}, results: {}, validated: false, score: 0 });
    setTipMessage("");
    setCurrentQuestion(0);
  };

  const answeredCount = Object.keys(state.answers).filter(k => state.answers[Number(k)] !== null && state.answers[Number(k)] !== undefined && state.answers[Number(k)] !== "").length;
  const progressPercent = Math.round((answeredCount / section.quiz.length) * 100);

  const renderQuestion = (q: QuizQuestion, idx: number) => {
    const result = state.results[idx];
    const qKey = `${section.id}_q${idx}`;
    const isAnswered = state.answers[idx] !== undefined && state.answers[idx] !== null && state.answers[idx] !== "";

    return (
      <div
        key={idx}
        className={cn(
          "p-5 rounded-2xl border transition-all duration-300 mb-4 animate-fade-in",
          result?.correct === true
            ? "border-secondary/40 bg-secondary/5"
            : result?.correct === false
            ? "border-destructive/40 bg-destructive/5"
            : isAnswered
            ? "border-primary/30 bg-primary/5"
            : "border-border/30 bg-card/40"
        )}
      >
        {/* Question header */}
        <div className="flex items-start gap-3 mb-4">
          <span className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors",
            result?.correct === true ? "bg-secondary/15 text-secondary" :
            result?.correct === false ? "bg-destructive/15 text-destructive" :
            isAnswered ? "bg-primary/15 text-primary" :
            "bg-muted/60 text-muted-foreground"
          )}>
            {idx + 1}
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold leading-relaxed">{q.question}</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">
              {q.type === "mcq" ? "Choix multiple" : q.type === "tf" ? "Vrai ou Faux" : "Réponse courte"}
            </p>
          </div>
        </div>

        {/* MCQ */}
        {q.type === "mcq" && q.choices && (
          <div className="space-y-2 ml-10">
            {q.choices.map((choice, i) => (
              <button
                type="button"
                key={i}
                onClick={() => !state.validated && handleAnswerChange(idx, i)}
                disabled={state.validated}
                className={cn(
                  "flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 group/choice text-left w-full",
                  state.answers[idx] === i
                    ? "border-primary/40 bg-primary/8 shadow-sm"
                    : "border-border/20 bg-background/30 hover:bg-muted/20 hover:border-border/40",
                  state.validated && i === q.correctAnswer && "border-secondary/50 bg-secondary/8 shadow-sm",
                  state.validated && state.answers[idx] === i && i !== q.correctAnswer && "border-destructive/50 bg-destructive/8"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                  state.answers[idx] === i ? "border-primary bg-primary" :
                  state.validated && i === q.correctAnswer ? "border-secondary bg-secondary" :
                  "border-muted-foreground/30 group-hover/choice:border-muted-foreground/50"
                )}>
                  {(state.answers[idx] === i || (state.validated && i === q.correctAnswer)) && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <span className="text-sm flex-1">{choice}</span>
                {state.validated && i === q.correctAnswer && (
                  <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* True/False */}
        {q.type === "tf" && (
          <div className="flex gap-3 ml-10">
            {[
              { value: true, label: "Vrai", emoji: "✓" },
              { value: false, label: "Faux", emoji: "✗" },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => !state.validated && handleAnswerChange(idx, opt.value)}
                disabled={state.validated}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 p-3.5 rounded-xl border font-medium text-sm transition-all duration-200",
                  state.answers[idx] === opt.value
                    ? "border-primary/40 bg-primary/10 text-primary shadow-sm"
                    : "border-border/20 bg-background/30 hover:bg-muted/20 text-muted-foreground",
                  state.validated && opt.value === q.correctAnswer && "border-secondary/50 bg-secondary/10 text-secondary",
                  state.validated && state.answers[idx] === opt.value && opt.value !== q.correctAnswer && "border-destructive/50 bg-destructive/10 text-destructive"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Short answer */}
        {q.type === "short" && (
          <div className="ml-10">
            <input
              type="text"
              placeholder="Écris ta réponse ici..."
              value={(state.answers[idx] as string) || ""}
              onChange={(e) => handleAnswerChange(idx, e.target.value)}
              disabled={state.validated}
              className="w-full p-3.5 rounded-xl border border-border/30 bg-background/30 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 focus:bg-primary/5 transition-all text-sm"
            />
            <p className="text-[10px] text-muted-foreground mt-1.5 ml-1">
              💡 Utilise les mots-clés importants
            </p>
          </div>
        )}

        {/* Result feedback */}
        {result && (
          <div
            className={cn(
              "mt-4 ml-10 p-3.5 rounded-xl text-sm flex items-start gap-2.5 animate-fade-in",
              result.correct
                ? "bg-secondary/8 border border-secondary/20"
                : "bg-destructive/8 border border-destructive/20"
            )}
          >
            {result.correct ? (
              <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="leading-relaxed">{result.explanation}</p>
              {result.hint && (
                <p className="text-xs text-muted-foreground mt-1 italic">{result.hint}</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Previous score */}
      {previousScore && previousScore.attempts > 0 && (
        <div className="mb-5 p-4 rounded-2xl bg-muted/20 border border-border/20 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
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

      {/* Progress indicator */}
      {!state.validated && (
        <div className="mb-5 flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-muted/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
            {answeredCount}/{section.quiz.length} répondues
          </span>
        </div>
      )}

      {/* Questions */}
      {section.quiz.map((q, idx) => renderQuestion(q, idx))}

      {/* Action buttons */}
      <div className="flex gap-3 mt-5">
        {!state.validated ? (
          <button
            onClick={handleValidate}
            disabled={answeredCount === 0}
            className={cn(
              "flex-1 py-3.5 px-5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200",
              answeredCount === section.quiz.length
                ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15"
            )}
          >
            <Zap className="w-4 h-4" />
            Valider mes réponses
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="flex-1 py-3.5 px-5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 bg-card/60 border border-border/30 hover:bg-muted/30 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Recommencer
          </button>
        )}
      </div>

      {/* Result message */}
      {tipMessage && (
        <p className={cn(
          "text-sm mt-4 text-center p-4 rounded-xl font-medium animate-fade-in",
          state.score / section.quiz.length >= 0.7
            ? "bg-secondary/10 text-secondary border border-secondary/20"
            : "bg-muted/30 text-muted-foreground border border-border/20"
        )}>
          {tipMessage}
        </p>
      )}
    </div>
  );
}
