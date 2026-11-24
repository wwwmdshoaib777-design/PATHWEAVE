import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { usePathweave } from '../../context/PathweaveContext';
import { pickLocalized } from '../../modules/i18n/translations';
import { AdaptiveRecommendationRecord, DifficultyLevel, QuizAttemptRecord } from '../../types/domain';

function formatDifficulty(level: DifficultyLevel, language: 'en' | 'kn' | 'hi'): string {
  if (language === 'kn') {
    return level === 'Easy' ? 'ಸುಲಭ' : level === 'Medium' ? 'ಮಧ್ಯಮ' : 'ಕಠಿಣ';
  }
  if (language === 'hi') {
    return level === 'Easy' ? 'आसान' : level === 'Medium' ? 'मध्यम' : 'कठिन';
  }
  return level;
}

export const StudentPracticeView: React.FC = () => {
  const {
    language,
    messages,
    profile,
    quizzes,
    quizAttempts,
    adaptiveRecommendations,
    topicAnalyses,
    activeQuizId,
    activeAdaptiveQuiz,
    openQuizRunner,
    startAdaptivePractice,
    openPrerequisiteLesson,
    closeQuizRunner,
    submitQuiz,
  } = usePathweave();

  const activeQuiz = useMemo(
    () => activeAdaptiveQuiz ?? quizzes.find((q) => q.id === activeQuizId) ?? null,
    [activeAdaptiveQuiz, activeQuizId, quizzes]
  );

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submittedAttempt, setSubmittedAttempt] = useState<QuizAttemptRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [startingRecId, setStartingRecId] = useState<string | null>(null);

  useEffect(() => {
    setAnswers({});
    setSubmittedAttempt(null);
    setSubmitError(null);
  }, [activeQuizId, activeAdaptiveQuiz?.id]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (submittedAttempt) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuiz || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const attempt = await submitQuiz(activeQuiz, answers);
      setSubmittedAttempt(attempt);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Unable to save quiz attempt to local storage. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setSubmittedAttempt(null);
    setSubmitError(null);
  };

  const handleBack = () => {
    setAnswers({});
    setSubmittedAttempt(null);
    setSubmitError(null);
    closeQuizRunner();
  };

  const handleStartAdaptive = async (rec: AdaptiveRecommendationRecord) => {
    setStartingRecId(rec.id);
    try {
      await startAdaptivePractice(rec);
    } finally {
      setStartingRecId(null);
    }
  };

  if (activeQuiz) {
    const answeredCount = Object.keys(answers).length;
    const allAnswered =
      activeQuiz.questions.length > 0 && answeredCount === activeQuiz.questions.length;

    const updatedRecForTopic =
      submittedAttempt && activeQuiz.targetTopicKey
        ? adaptiveRecommendations.find((r) => r.topicKey === activeQuiz.targetTopicKey)
        : submittedAttempt
          ? adaptiveRecommendations.find((r) =>
              submittedAttempt.topicResults.some((tr) => tr.topicKey === r.topicKey)
            )
          : undefined;

    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All Practice & Quizzes
          </button>

          <div className="font-mono text-xs text-slate-600 tabular-nums">
            {answeredCount} / {activeQuiz.questions.length} answered
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>{activeQuiz.subjectId === 'math' ? 'Mathematics' : 'Science'}</span>
            <span aria-hidden="true">·</span>
            <span>Grade {activeQuiz.grade}</span>
            {activeQuiz.isAdaptiveExercise && activeQuiz.targetDifficulty && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-teal-800">
                  Adaptive ({formatDifficulty(activeQuiz.targetDifficulty, language)})
                </span>
              </>
            )}
          </div>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            {pickLocalized(activeQuiz.title, language)}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {pickLocalized(activeQuiz.description, language)}
          </p>

          {submittedAttempt && (
            <div className="mt-5 space-y-3 rounded-lg border border-teal-200 bg-teal-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-teal-950">
                    {messages.student.scoreLabel}:{' '}
                    <span className="font-mono tabular-nums">
                      {submittedAttempt.score} / {submittedAttempt.totalQuestions} (
                      {submittedAttempt.percentage}%)
                    </span>
                  </div>
                  <div className="text-xs text-teal-800">
                    Saved locally in IndexedDB ·{' '}
                    <span className="font-mono">{submittedAttempt.id.slice(0, 18)}</span> ·{' '}
                    {new Date(submittedAttempt.submittedAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-teal-300 bg-white px-3.5 py-2 text-xs font-semibold text-teal-900 hover:bg-teal-100 whitespace-nowrap shrink-0"
                  >
                    View Updated Recommendations
                  </button>
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    {messages.student.retakeQuiz}
                  </button>
                </div>
              </div>

              {updatedRecForTopic && (
                <div className="border-t border-teal-200 pt-3 text-xs text-teal-950">
                  <span className="font-semibold">Next Adaptive Step: </span>
                  {pickLocalized(updatedRecForTopic.explanation, language)}
                </div>
              )}
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
                    Question {qIndex + 1} · {pickLocalized(question.topicLabel, language)} ·{' '}
                    {formatDifficulty(question.difficulty, language)}
                    {question.prerequisiteTopicLabel
                      ? ` · Prereq: ${pickLocalized(question.prerequisiteTopicLabel, language)}`
                      : ''}
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

            {submitError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800">
                {submitError}
              </div>
            )}

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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          {messages.student.quizPractice}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Offline-ready practice checks and rule-based adaptive exercises for {profile.name}.
        </p>
      </div>

      {/* Personalized Adaptive Practice */}
      <section aria-labelledby="adaptive-practice-heading" className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3
              id="adaptive-practice-heading"
              className="flex items-center gap-2 text-lg font-semibold text-slate-900"
            >
              <Compass className="h-5 w-5 text-teal-700" aria-hidden="true" />
              {messages.adaptive.sectionTitle}
            </h3>
            <p className="text-xs text-slate-500">{messages.adaptive.sectionSubtitle}</p>
          </div>
          <span className="text-xs text-slate-500 tabular-nums">
            {adaptiveRecommendations.length > 0
              ? `${adaptiveRecommendations.length} topic plan(s) saved locally`
              : messages.localSavedNotice}
          </span>
        </div>

        {adaptiveRecommendations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6">
            <h4 className="text-sm font-semibold text-slate-900">
              {messages.adaptive.emptyStateTitle}
            </h4>
            <p className="mt-1 text-sm text-slate-600">{messages.adaptive.emptyStateBody}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {adaptiveRecommendations.map((rec) => {
              const analysis = topicAnalyses.find((a) => a.topicKey === rec.topicKey);
              const progressionText = rec.difficultyProgression
                .map((d) => formatDifficulty(d, language))
                .join(' → ');

              return (
                <article
                  key={rec.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                      <div className="flex flex-wrap items-center gap-2">
                        <span>{rec.subjectId === 'math' ? 'Mathematics' : 'Science'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-slate-700">
                          {messages.adaptive.recommendedDifficulty}:{' '}
                          <span className="text-teal-800">
                            {formatDifficulty(rec.recommendedDifficulty, language)}
                          </span>
                        </span>
                      </div>
                      {rec.isWeakTopic && (
                        <span className="font-semibold text-amber-800">
                          {messages.adaptive.weakTopicBadge}
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="text-xs text-slate-500">
                        {messages.adaptive.recommendedTopic}
                      </div>
                      <h4 className="text-lg font-semibold text-slate-900">
                        {pickLocalized(rec.topicLabel, language)}
                      </h4>
                    </div>

                    {/* Accuracy & Attempt Stats */}
                    <div className="grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3 text-xs">
                      <div>
                        <div className="text-slate-500">{messages.adaptive.recentAccuracy}</div>
                        <div className="mt-0.5 font-mono text-sm font-semibold text-slate-900 tabular-nums">
                          {rec.recentAccuracyPercent}%
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500">Overall</div>
                        <div className="mt-0.5 font-mono text-sm font-semibold text-slate-900 tabular-nums">
                          {rec.correctAnswers}/{rec.questionsAttempted} (
                          {analysis?.accuracyPercent ?? rec.recentAccuracyPercent}%)
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500">{messages.adaptive.improvementLabel}</div>
                        <div className="mt-0.5 flex items-center gap-1 font-mono text-sm font-semibold tabular-nums">
                          {rec.improvementDelta === null ? (
                            <span className="text-slate-500">Attempt 1</span>
                          ) : rec.improvementDelta >= 0 ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700">
                              <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />+
                              {rec.improvementDelta}%
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-800">
                              <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
                              {rec.improvementDelta}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Suggested Exercise & Progression */}
                    <div className="space-y-1 text-xs text-slate-600">
                      <div>
                        <span className="font-semibold text-slate-700">
                          {messages.adaptive.suggestedExercise}:{' '}
                        </span>
                        {pickLocalized(rec.suggestedExerciseTitle, language)} (
                        <span className="tabular-nums">{rec.suggestedQuestionIds.length} Qs</span>)
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">
                          {messages.adaptive.difficultyProgression}:{' '}
                        </span>
                        <span className="font-mono">{progressionText}</span>
                      </div>
                    </div>

                    {/* Explainable Reason */}
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
                      <span className="font-semibold text-slate-900">
                        {messages.adaptive.reasonLabel}:{' '}
                      </span>
                      {pickLocalized(rec.explanation, language)}
                    </div>

                    {/* Prerequisite Revision Action */}
                    {rec.needsPrerequisiteRevision && rec.prerequisiteTopicLabel && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
                        <span className="font-semibold">
                          {messages.adaptive.prerequisiteRevision}:{' '}
                        </span>
                        {pickLocalized(rec.prerequisiteTopicLabel, language)}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                    {rec.needsPrerequisiteRevision && rec.prerequisiteLessonId ? (
                      <button
                        type="button"
                        onClick={() => openPrerequisiteLesson(rec.prerequisiteLessonId!)}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950 hover:bg-amber-100 whitespace-nowrap shrink-0"
                      >
                        <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                        {messages.adaptive.revisePrerequisiteBtn}:{' '}
                        {rec.prerequisiteTopicLabel
                          ? pickLocalized(rec.prerequisiteTopicLabel, language)
                          : ''}
                      </button>
                    ) : (
                      <span className="font-mono text-xs text-slate-500 tabular-nums">
                        {rec.attemptCount} attempt(s) analyzed
                      </span>
                    )}

                    <button
                      type="button"
                      disabled={startingRecId === rec.id}
                      onClick={() => handleStartAdaptive(rec)}
                      className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-50 whitespace-nowrap shrink-0"
                    >
                      <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                      {messages.adaptive.startAdaptiveBtn}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Standard Offline Quiz Library */}
      <section aria-labelledby="standard-quizzes-heading" className="space-y-4">
        <div>
          <h3 id="standard-quizzes-heading" className="text-lg font-semibold text-slate-900">
            Curriculum Quizzes
          </h3>
          <p className="text-xs text-slate-500">
            Complete any topic check to generate or update personalized recommendations above.
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
                  <h4 className="mt-2 text-lg font-semibold text-slate-900">
                    {pickLocalized(quiz.title, language)}
                  </h4>
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
      </section>
    </div>
  );
};
