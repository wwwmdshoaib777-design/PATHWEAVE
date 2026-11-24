import React from 'react';
import { usePathweave } from '../../context/PathweaveContext';
import { pickLocalized } from '../../modules/i18n/translations';
import { progressService } from '../../modules/progress/progressService';

export const StudentProgressView: React.FC = () => {
  const {
    language,
    messages,
    lessons,
    quizzes,
    progressRecords,
    quizAttempts,
    openLessonReader,
    openQuizRunner,
  } = usePathweave();

  const summaries = progressService.computeSubjectSummaries(lessons, progressRecords);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          {messages.student.learningProgress}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Your saved lesson completions and quiz attempt records in local IndexedDB storage.
        </p>
      </div>

      {/* Subject Progress Bars */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {summaries.map((summary) => (
          <div key={summary.subjectId} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">
                {summary.subjectId === 'math' ? 'Mathematics' : 'Science'}
              </h3>
              <span className="font-mono text-sm font-semibold text-teal-800 tabular-nums">
                {summary.completionPercent}%
              </span>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-teal-700 transition-all"
                style={{ width: `${summary.completionPercent}%` }}
              />
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs text-slate-600 tabular-nums">
              <span>{summary.completedLessons} completed</span>
              <span aria-hidden="true">·</span>
              <span>{summary.inProgressLessons} in progress</span>
              <span aria-hidden="true">·</span>
              <span>{summary.totalLessons} total</span>
            </div>
          </div>
        ))}
      </section>

      {/* Lesson Status Table */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">Lesson Completion Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <tr>
                <th className="px-5 py-3">Lesson</th>
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lessons.map((lesson) => {
                const record = progressRecords.find((p) => p.lessonId === lesson.id);
                const statusLabel =
                  record?.status === 'completed'
                    ? messages.student.completed
                    : record?.status === 'in_progress'
                      ? messages.student.inProgress
                      : messages.student.notStarted;
                return (
                  <tr key={lesson.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {pickLocalized(lesson.title, language)}
                    </td>
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                      {lesson.subjectId === 'math' ? 'Mathematics' : 'Science'} · Grade{' '}
                      {lesson.grade}
                    </td>
                    <td className="px-5 py-3 text-slate-700 whitespace-nowrap">{statusLabel}</td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openLessonReader(lesson.id)}
                        className="text-xs font-semibold text-teal-700 hover:text-teal-800"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quiz Attempts Table */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Quiz Attempt History</h3>
          <span className="font-mono text-xs text-slate-500 tabular-nums">
            {quizAttempts.length} attempt(s)
          </span>
        </div>

        {quizAttempts.length === 0 ? (
          <div className="p-6 text-sm text-slate-600">
            No quizzes submitted yet. Visit Practice to complete your first quiz.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="px-5 py-3">Quiz</th>
                  <th className="px-5 py-3">Score</th>
                  <th className="px-5 py-3">Percentage</th>
                  <th className="px-5 py-3">Submitted</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quizAttempts.map((attempt) => {
                  const quiz = quizzes.find((q) => q.id === attempt.quizId);
                  return (
                    <tr key={attempt.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-900">
                        {quiz ? pickLocalized(quiz.title, language) : attempt.quizId}
                      </td>
                      <td className="px-5 py-3 font-mono text-slate-700 tabular-nums">
                        {attempt.score} / {attempt.totalQuestions}
                      </td>
                      <td className="px-5 py-3 font-mono font-semibold text-teal-800 tabular-nums">
                        {attempt.percentage}%
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-slate-500 tabular-nums">
                        {new Date(attempt.submittedAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {quiz && (
                          <button
                            type="button"
                            onClick={() => openQuizRunner(quiz.id)}
                            className="text-xs font-semibold text-teal-700 hover:text-teal-800"
                          >
                            Retry
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
