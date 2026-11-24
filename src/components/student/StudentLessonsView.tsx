import React, { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, Download, Search, Trash2 } from 'lucide-react';
import { usePathweave } from '../../context/PathweaveContext';
import { pickLocalized } from '../../modules/i18n/translations';
import { SubjectId } from '../../types/domain';

export const StudentLessonsView: React.FC = () => {
  const {
    language,
    messages,
    lessons,
    progressRecords,
    downloadedMaterials,
    selectedSubjectFilter,
    activeLessonId,
    setSelectedSubjectFilter,
    openLessonReader,
    closeLessonReader,
    toggleDownloadLesson,
    markLessonCompleted,
  } = usePathweave();

  const [searchQuery, setSearchQuery] = useState('');

  const activeLesson = useMemo(
    () => lessons.find((l) => l.id === activeLessonId) ?? null,
    [activeLessonId, lessons]
  );

  const filteredLessons = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return lessons.filter((lesson) => {
      if (selectedSubjectFilter !== 'all' && lesson.subjectId !== selectedSubjectFilter) {
        return false;
      }
      if (!query) return true;
      const title = pickLocalized(lesson.title, language).toLowerCase();
      const topic = pickLocalized(lesson.topic, language).toLowerCase();
      const summary = pickLocalized(lesson.summary, language).toLowerCase();
      return title.includes(query) || topic.includes(query) || summary.includes(query);
    });
  }, [language, lessons, searchQuery, selectedSubjectFilter]);

  if (activeLesson) {
    const isDownloaded = downloadedMaterials.some((d) => d.lessonId === activeLesson.id);
    const progress = progressRecords.find((p) => p.lessonId === activeLesson.id);
    const isCompleted = progress?.status === 'completed';

    return (
      <article className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={closeLessonReader}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {messages.student.backToLessons}
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => toggleDownloadLesson(activeLesson)}
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors ${
                isDownloaded
                  ? 'border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isDownloaded ? (
                <>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  {messages.student.removeOffline}
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" aria-hidden="true" />
                  {messages.student.downloadOffline}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => markLessonCompleted(activeLesson)}
              disabled={isCompleted}
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                isCompleted
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                  : 'bg-teal-700 text-white hover:bg-teal-800'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {isCompleted ? messages.student.completed : messages.student.markCompleted}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>{activeLesson.subjectId === 'math' ? 'Mathematics' : 'Science'}</span>
            <span aria-hidden="true">·</span>
            <span>Grade {activeLesson.grade}</span>
            <span aria-hidden="true">·</span>
            <span>{pickLocalized(activeLesson.topic, language)}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{activeLesson.estimatedMinutes} min</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{activeLesson.sizeKB} KB</span>
            <span aria-hidden="true">·</span>
            <span>
              {activeLesson.origin === 'sample' ? messages.sampleDataNotice : 'Teacher Local Lesson'}
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">
            {pickLocalized(activeLesson.title, language)}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            {pickLocalized(activeLesson.summary, language)}
          </p>

          <div className="mt-8 space-y-6 border-t border-slate-100 pt-6">
            {activeLesson.sections.map((section, idx) => (
              <section key={idx} className="space-y-2.5">
                <h2 className="text-lg font-semibold text-slate-900">
                  {pickLocalized(section.heading, language)}
                </h2>
                <p className="text-[15px] leading-relaxed text-slate-700">
                  {pickLocalized(section.body, language)}
                </p>
                {section.keyTakeaway && (
                  <div className="rounded-lg border border-teal-200 bg-teal-50/70 p-4 text-sm text-teal-950">
                    <span className="font-semibold">Key takeaway: </span>
                    {pickLocalized(section.keyTakeaway, language)}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            {messages.student.lessonLibrary}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Read lessons online or save them to IndexedDB for offline classroom access.
          </p>
        </div>

        {/* Subject Filter Tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 self-start">
          {(
            [
              { id: 'all', label: 'All Subjects' },
              { id: 'math', label: 'Mathematics' },
              { id: 'science', label: 'Science' },
            ] as Array<{ id: SubjectId | 'all'; label: string }>
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedSubjectFilter(tab.id)}
              className={`min-h-[36px] rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedSubjectFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search lessons by title or topic..."
          aria-label="Search lessons"
          className="min-h-[44px] w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400"
        />
      </div>

      {/* Lesson Grid */}
      {filteredLessons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          No lessons match your current filter. Try clearing the search or selecting All Subjects.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredLessons.map((lesson) => {
            const isDownloaded = downloadedMaterials.some((d) => d.lessonId === lesson.id);
            const progress = progressRecords.find((p) => p.lessonId === lesson.id);

            return (
              <article
                key={lesson.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{lesson.subjectId === 'math' ? 'Mathematics' : 'Science'}</span>
                    <span aria-hidden="true">·</span>
                    <span>Grade {lesson.grade}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{lesson.estimatedMinutes} min</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{lesson.sizeKB} KB</span>
                    {lesson.origin === 'local' && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-medium text-slate-700">Teacher Added</span>
                      </>
                    )}
                  </div>

                  <h3 className="mt-2 text-base font-semibold text-slate-900">
                    {pickLocalized(lesson.title, language)}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-600">
                    {pickLocalized(lesson.summary, language)}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                  <div className="text-xs font-medium text-slate-600">
                    {progress?.status === 'completed'
                      ? messages.student.completed
                      : progress?.status === 'in_progress'
                        ? messages.student.inProgress
                        : messages.student.notStarted}
                    {isDownloaded ? ` · ${messages.student.savedOffline}` : ''}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleDownloadLesson(lesson)}
                      className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                        isDownloaded
                          ? 'border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      {isDownloaded
                        ? messages.student.savedOffline
                        : messages.student.downloadOffline}
                    </button>

                    <button
                      type="button"
                      onClick={() => openLessonReader(lesson.id)}
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-teal-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-800 transition-colors whitespace-nowrap"
                    >
                      <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                      {messages.student.openLesson}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
