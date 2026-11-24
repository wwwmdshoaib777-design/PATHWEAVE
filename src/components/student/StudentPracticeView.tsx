import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, ClipboardCheck, RotateCcw, XCircle } from 'lucide-react';
import { usePathweave } from '../../context/PathweaveContext';
import { pickLocalized } from '../../modules/i18n/translations';
import { QuizAttemptRecord } from '../../types/domain';

export const StudentPracticeView: React.FC = () => {
  const {
    language,
    messages,
    quizzes,
    quizAttempts,
    activeQuizId,
    openQuizRunner,
    closeQuizRunner,
    submitQuiz,
  } = usePathweave();

  const activeQuiz = useMemo(
    () => quizzes.find((q) => q.id === activeQuizId) ?? null,
    [activeQuizId, quizzes]
  );

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submittedAttempt, setSubmittedAttempt] = useState<QuizAttemptRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setAnswers({});
    setSubmittedAttempt(null);
  }, [activeQuizId]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (submittedAttempt) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuiz || submitting) return;
    setSubmitting(true);
    try {
      const attempt = await submitQuiz(activeQuiz, answers);
      setSubmittedAttempt(attempt);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setSubmittedAttempt(null);
  };

  const handleBack = () => {
    setAnswers({});
    setSubmittedAttempt(null);
    closeQuizRunner();
  };

  if (activeQuiz) {
    const answeredCount = Object.keys(answers).length;
    const allAnswered = answeredCount === activeQuiz.questions.length;

    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All Quizzes
          </button>

          <div className="font-mono text-xs text-slate-600 tabular-nums">
            {answeredCount} / {activeQuiz.questions.length} answered
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="text-xs text-slate-500">
            {activeQuiz.subjectId === 'math' ? 'Mathematics' : 'Science'} · Grade {activeQuiz.grade}
          </div>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            {pickLocalized(activeQuiz.title, language)}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {pickLocalized(activeQuiz.description, language)}
          </p>

          {submittedAttempt && (
            <div className="mt-5 rounded-lg border border-teal-200 bg-teal-50 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-teal-950">
                  {messages.student.scoreLabel}:{' '}
                  <span className="font-mono tabular-nums">
                    {submittedAttempt.score} / {submittedAttempt.totalQuestions} (
                    {submittedAttempt.percentage}%)
                  </span>
                </div>
                <div className="text-xs text-teal-800">
                  Result saved to local IndexedDB progress history.
                </div>
              </div>
              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 self-start"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                {messages.student.retakeQuiz}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {activeQuiz.questions.map((question, qIndex) => {
              const selectedIndex = answers[question.id];
              const isCorrect =
                submittedAttempt !== null && selectedIndex === question.correctIndex;

              return (
                <fieldset
                  key={question.id}
                  className="rounded-lg border border-slate-200 p-4 sm:p-5 space-y-3"
                >
                  <legend className="px-1 text-xs font-medium text-slate-500">
                    Question {qIndex + 1} · {pickLocalized(question.topicLabel, language)}
                  </legend>
                  <p className="text-sm font-semibold text-slate-900">
                    {pickLocalized(question.prompt, language)}
                  </p>

                  <div className="space-y-2">
                    {question.options.map((option, optIdx) => {
                      const chosen = selectedIndex === optIdx;
                      const showCorrect =
                        submittedAttempt !== null && optIdx === question.correctIndex;
                      const showWrong =
                        submittedAttempt !== null && chosen && optIdx !== question.correctIndex;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={submittedAttempt !== null}
                          onClick={() => handleSelectOption(question.id, optIdx)}
                          className={`flex min-h-[44px] w-full items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${
                            showCorrect
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-medium'
                              : showWrong
                                ? 'border-red-500 bg-red-50 text-red-950'
                                : chosen
                                  ? 'border-teal-700 bg-teal-50 text-teal-950 font-medium'
                                  : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          <span>{pickLocalized(option, language)}</span>
                          {showCorrect && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                          )}
                          {showWrong && <XCircle className="h-4 w-4 text-red-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {submittedAttempt && (
                    <div
                      className={`rounded-md p-3 text-xs ${
                        isCorrect
                          ? 'bg-emerald-50 text-emerald-900'
                          : 'bg-amber-50 text-amber-950'
                      }`}
                    >
                      <span className="font-semibold">
                        {isCorrect ? 'Correct: ' : `${messages.student.correctAnswer}: `}
                      </span>
                      {pickLocalized(question.explanation, language)}
                    </div>
                  )}
                </fieldset>
              );
            })}

            {!submittedAttempt && (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!allAnswered || submitting}
                  className="min-h-[44px] rounded-lg bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {messages.student.submitQuiz}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          {messages.student.quizPractice}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Offline-ready practice checks for Mathematics and Science. Scores save to IndexedDB.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {quizzes.map((quiz) => {
          const attempts = quizAttempts.filter((a) => a.quizId === quiz.id);
          const bestScore =
            attempts.length > 0 ? Math.max(...attempts.map((a) => a.percentage)) : null;

          return (
            <article
              key={quiz.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{quiz.subjectId === 'math' ? 'Mathematics' : 'Science'}</span>
                  <span aria-hidden="true">·</span>
                  <span>Grade {quiz.grade}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{quiz.questions.length} questions</span>
                  <span aria-hidden="true">·</span>
                  <span>{messages.sampleDataNotice}</span>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  {pickLocalized(quiz.title, language)}
                </h3>
                <p className="mt-1.5 text-sm text-slate-600">
                  {pickLocalized(quiz.description, language)}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div className="text-xs text-slate-600 tabular-nums">
                  {attempts.length > 0
                    ? `${attempts.length} attempt(s) · Best: ${bestScore}%`
                    : 'Not attempted yet'}
                </div>
                <button
                  type="button"
                  onClick={() => openQuizRunner(quiz.id)}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 whitespace-nowrap shrink-0"
                >
                  <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                  {messages.student.startQuiz}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
