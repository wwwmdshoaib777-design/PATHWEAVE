import React from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Trash2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { usePathweave } from '../../context/PathweaveContext';
import { pickLocalized } from '../../modules/i18n/translations';
import { progressService } from '../../modules/progress/progressService';
import { SubjectImage } from '../shared/SubjectImage';

export const StudentDashboardView: React.FC = () => {
  const {
    profile,
    language,
    messages,
    subjects,
    lessons,
    quizzes,
    progressRecords,
    quizAttempts,
    downloadedMaterials,
    recentActivity,
    network,
    setStudentTab,
    setSelectedSubjectFilter,
    openLessonReader,
    openQuizRunner,
    toggleDownloadLesson,
    changeLanguage,
  } = usePathweave();

  const completedCount = progressRecords.filter((p) => p.status === 'completed').length;
  const avgScore =
    quizAttempts.length > 0
      ? Math.round(
          quizAttempts.reduce((sum, item) => sum + item.percentage, 0) / quizAttempts.length
        )
      : 0;
  const subjectSummaries = progressService.computeSubjectSummaries(lessons, progressRecords);

  const downloadedLessons = downloadedMaterials
    .map((d) => ({
      record: d,
      lesson: lessons.find((l) => l.id === d.lessonId),
    }))
    .filter((item): item is { record: typeof item.record; lesson: NonNullable<typeof item.lesson> } =>
      Boolean(item.lesson)
    );

  return (
    <div className="space-y-8">
      {/* Student Profile & Connection Overview */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{profile.schoolName}</span>
              <span aria-hidden="true">·</span>
              <span>{profile.gradeOrSubject}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                {network.isOnline ? (
                  <Wifi className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
                ) : (
                  <WifiOff className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
                )}
                {network.isOnline ? messages.online : messages.offline}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              {messages.student.welcomeBack}, {profile.name}
            </h1>
            <p className="mt-1 text-sm text-slate-600">{messages.student.overviewSubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500 mr-1">
              {messages.languageLabel}:
            </span>
            <div className="flex items-center rounded-lg bg-slate-100 p-1">
              {(['en', 'kn', 'hi'] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => changeLanguage(code)}
                  className={`min-h-[36px] rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    language === code
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {code === 'en' ? 'English' : code === 'kn' ? 'ಕನ್ನಡ' : 'हिन्दी'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Learning Progress Overview KPIs */}
      <section aria-labelledby="progress-overview-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="progress-overview-heading" className="text-lg font-semibold text-slate-900">
            {messages.student.learningProgress}
          </h2>
          <button
            type="button"
            onClick={() => setStudentTab('progress')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 whitespace-nowrap shrink-0"
          >
            View full progress
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-medium text-slate-500">
              {messages.student.lessonsCompleted}
            </div>
            <div className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {completedCount} / {lessons.length}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-medium text-slate-500">
              {messages.student.quizzesCompleted}
            </div>
            <div className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {quizAttempts.length}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-medium text-slate-500">
              {messages.student.averageScore}
            </div>
            <div className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {quizAttempts.length > 0 ? `${avgScore}%` : '—'}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-medium text-slate-500">
              {messages.student.offlinePacksCount}
            </div>
            <div className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {downloadedMaterials.length}
            </div>
          </div>
        </div>
      </section>

      {/* Available Subjects */}
      <section aria-labelledby="subjects-heading">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 id="subjects-heading" className="text-lg font-semibold text-slate-900">
              {messages.student.availableSubjects}
            </h2>
            <p className="text-xs text-slate-500">{messages.sampleDataNotice}</p>
          </div>
          <button
            type="button"
            onClick={() => setStudentTab('subjects')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 whitespace-nowrap shrink-0"
          >
            All subjects
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {subjects.map((subject) => {
            const summary = subjectSummaries.find((s) => s.subjectId === subject.id);
            return (
              <article
                key={subject.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white flex flex-col"
              >
                <SubjectImage
                  src={subject.illustrationUrl}
                  alt={pickLocalized(subject.title, language)}
                  subjectId={subject.id}
                  className="h-44 w-full object-cover border-b border-slate-100"
                />
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono">{subject.code}</span>
                      <span aria-hidden="true">·</span>
                      <span>{subject.gradeRange}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{subject.lessonCount} lessons</span>
                    </div>
                    <h3 className="mt-1.5 text-lg font-semibold text-slate-900">
                      {pickLocalized(subject.title, language)}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {pickLocalized(subject.description, language)}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="text-xs font-medium text-slate-600 tabular-nums">
                      {summary?.completedLessons ?? 0} / {summary?.totalLessons ?? 0}{' '}
                      {messages.student.completed}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSubjectFilter(subject.id);
                        setStudentTab('lessons');
                      }}
                      className="min-h-[40px] rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 transition-colors whitespace-nowrap shrink-0"
                    >
                      {messages.student.openLesson}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Lesson Library & Quiz Section Split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Lesson Library */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              {messages.student.lessonLibrary}
            </h2>
            <button
              type="button"
              onClick={() => {
                setSelectedSubjectFilter('all');
                setStudentTab('lessons');
              }}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 whitespace-nowrap"
            >
              Browse all ({lessons.length})
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {lessons.slice(0, 4).map((lesson) => {
              const progress = progressRecords.find((p) => p.lessonId === lesson.id);
              const isDownloaded = downloadedMaterials.some((d) => d.lessonId === lesson.id);
              return (
                <div key={lesson.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                      <span>{lesson.subjectId === 'math' ? 'Mathematics' : 'Science'}</span>
                      <span aria-hidden="true">·</span>
                      <span>Grade {lesson.grade}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{lesson.estimatedMinutes} min</span>
                      {isDownloaded && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-teal-700">
                            {messages.student.savedOffline}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="mt-0.5 truncate text-sm font-medium text-slate-900">
                      {pickLocalized(lesson.title, language)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {progress?.status === 'completed' && (
                      <CheckCircle2 className="h-4 w-4 text-teal-700" aria-label="Completed" />
                    )}
                    <button
                      type="button"
                      onClick={() => openLessonReader(lesson.id)}
                      className="min-h-[36px] rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                    >
                      <BookOpen className="inline h-3.5 w-3.5 mr-1" aria-hidden="true" />
                      Read
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Quiz Section */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              {messages.student.quizPractice}
            </h2>
            <button
              type="button"
              onClick={() => setStudentTab('practice')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 whitespace-nowrap"
            >
              All quizzes ({quizzes.length})
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {quizzes.map((quiz) => {
              const latestAttempt = quizAttempts.find((a) => a.quizId === quiz.id);
              return (
                <div key={quiz.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                      <span>{quiz.subjectId === 'math' ? 'Mathematics' : 'Science'}</span>
                      <span aria-hidden="true">·</span>
                      <span>Grade {quiz.grade}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{quiz.questions.length} questions</span>
                      {latestAttempt && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono font-medium text-teal-700 tabular-nums">
                            Last: {latestAttempt.percentage}%
                          </span>
                        </>
                      )}
                    </div>
                    <div className="mt-0.5 truncate text-sm font-medium text-slate-900">
                      {pickLocalized(quiz.title, language)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openQuizRunner(quiz.id)}
                    className="min-h-[36px] rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800 whitespace-nowrap shrink-0"
                  >
                    <ClipboardCheck className="inline h-3.5 w-3.5 mr-1" aria-hidden="true" />
                    {messages.student.startQuiz}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Downloaded Materials & Recent Learning Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Downloaded Learning Materials */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              {messages.student.downloadedMaterials}
            </h2>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              {downloadedLessons.length} saved
            </span>
          </div>

          {downloadedLessons.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p>{messages.student.noDownloadsYet}</p>
              <button
                type="button"
                onClick={() => setStudentTab('lessons')}
                className="mt-3 inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
                Go to Lesson Library
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {downloadedLessons.map(({ lesson, record }) => (
                <div key={lesson.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-slate-900">
                      {pickLocalized(lesson.title, language)}
                    </div>
                    <div className="text-xs text-slate-500 tabular-nums">
                      {record.sizeKB} KB · Saved {new Date(record.downloadedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openLessonReader(lesson.id)}
                      className="min-h-[36px] rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Read
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${pickLocalized(lesson.title, language)} from offline storage`}
                      onClick={() => toggleDownloadLesson(lesson)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Learning Activity */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              {messages.student.recentActivity}
            </h2>
            <span className="text-xs text-slate-500">{messages.localSavedNotice}</span>
          </div>

          {recentActivity.filter((a) => a.actorRole === 'student').length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              {messages.student.noActivityYet}
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentActivity
                .filter((a) => a.actorRole === 'student')
                .slice(0, 5)
                .map((act) => (
                  <li key={act.id} className="py-3">
                    <div className="text-sm text-slate-800">
                      {pickLocalized(act.description, language)}
                    </div>
                    <div className="mt-0.5 font-mono text-xs text-slate-500 tabular-nums">
                      {new Date(act.timestamp).toLocaleString()}
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};
