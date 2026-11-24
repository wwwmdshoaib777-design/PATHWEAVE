import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Download,
  Search,
  Trash2,
  WifiOff,
} from 'lucide-react';
import { usePathweave } from '../../context/PathweaveContext';
import { pickLocalized } from '../../modules/i18n/translations';
import { SubjectId } from '../../types/domain';

type LessonFilter = SubjectId | 'all' | 'offline';

export const StudentLessonsView: React.FC = () => {
  const {
    language,
    messages,
    lessons,
    downloadedLessons,
    progressRecords,
    downloadedMaterials,
    selectedSubjectFilter,
    activeLessonId,
    network,
    setSelectedSubjectFilter,
    openLessonReader,
    closeLessonReader,
    toggleDownloadLesson,
    markLessonCompleted,
  } = usePathweave();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<LessonFilter>(selectedSubjectFilter);

  useEffect(() => {
    setFilterMode(selectedSubjectFilter);
  }, [selectedSubjectFilter]);

  const effectiveFilter: LessonFilter =
    filterMode === 'offline' ? 'offline' : selectedSubjectFilter;

  const downloadedIds = useMemo(
    () => new Set(downloadedMaterials.map((d) => d.lessonId)),
    [downloadedMaterials]
  );

  const downloadedOrderedLessons = useMemo(
    () => downloadedLessons.map((d) => d.lesson),
    [downloadedLessons]
  );

  const activeLesson = useMemo(() => {
    if (!activeLessonId) return null;
    const fromDownloaded = downloadedLessons.find((d) => d.id === activeLessonId)?.lesson;
    if (fromDownloaded) return fromDownloaded;
    return lessons.find((l) => l.id === activeLessonId) ?? null;
  }, [activeLessonId, downloadedLessons, lessons]);

  const filteredLessons = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return lessons.filter((lesson) => {
      if (effectiveFilter === 'offline' && !downloadedIds.has(lesson.id)) {
        return false;
      }
      if (
        effectiveFilter !== 'all' &&
        effectiveFilter !== 'offline' &&
        lesson.subjectId !== effectiveFilter
      ) {
        return false;
      }
      if (!query) return true;
      const title = pickLocalized(lesson.title, language).toLowerCase();
      const topic = pickLocalized(lesson.topic, language).toLowerCase();
      const summary = pickLocalized(lesson.summary, language).toLowerCase();
      return title.includes(query) || topic.includes(query) || summary.includes(query);
    });
  }, [downloadedIds, effectiveFilter, language, lessons, searchQuery]);

  if (activeLesson) {
    const isDownloaded = downloadedIds.has(activeLesson.id);
    const progress = progressRecords.find((p) => p.lessonId === activeLesson.id);
    const isCompleted = progress?.status === 'completed';

    const currentDownloadedIndex = downloadedOrderedLessons.findIndex(
      (l) => l.id === activeLesson.id
    );
    const prevDownloaded =
      currentDownloadedIndex > 0
        ? downloadedOrderedLessons[currentDownloadedIndex - 1]
        : null;
    const nextDownloaded =
      currentDownloadedIndex >= 0 &&
      currentDownloadedIndex < downloadedOrderedLessons.length - 1
        ? downloadedOrderedLessons[currentDownloadedIndex + 1]
        : null;

    // Require local download when offline
    if (!network.isOnline && !isDownloaded) {
      return (
        <div className="mx-auto max-w-2xl space-y-5">
          <button
            type="button"
            onClick={closeLessonReader}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {messages.student.backToLessons}
          </button>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-950">
              <WifiOff className="h-5 w-5 text-amber-800" aria-hidden="true" />
              Lesson Requires Downloading First
            </div>
            <p className="text-sm text-amber-900">
              &ldquo;{pickLocalized(activeLesson.title, language)}&rdquo; has not been downloaded to
              IndexedDB yet. Reconnect to download it, or switch to your already-downloaded lessons
              below.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setFilterMode('offline');
                  closeLessonReader();
                }}
                className="min-h-[40px] rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800"
              >
                View Downloaded Lessons ({downloadedOrderedLessons.length})
              </button>
            </div>
          </div>
        </div>
      );
    }

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
              disabled={!network.isOnline && !isDownloaded}
              onClick={() => toggleDownloadLesson(activeLesson)}
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
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
            <span className={isDownloaded ? 'font-semibold text-teal-700' : 'text-amber-700'}>
              {isDownloaded ? 'Available Offline (IndexedDB)' : 'Online Only — Not Downloaded'}
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

        {/* Navigate between Downloaded Lessons */}
        {downloadedOrderedLessons.length > 1 && isDownloaded && (
          <nav
            aria-label="Downloaded lesson navigation"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"
          >
            <button
              type="button"
              disabled={!prevDownloaded}
              onClick={() => prevDownloaded && openLessonReader(prevDownloaded.id)}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {prevDownloaded
                  ? `Prev: ${pickLocalized(prevDownloaded.title, language)}`
                  : 'First Downloaded Lesson'}
              </span>
            </button>

            <button
              type="button"
              disabled={!nextDownloaded}
              onClick={() => nextDownloaded && openLessonReader(nextDownloaded.id)}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>
                {nextDownloaded
                  ? `Next: ${pickLocalized(nextDownloaded.title, language)}`
                  : 'Last Downloaded Lesson'}
              </span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </nav>
        )}
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
            Download lessons to IndexedDB for offline reading. Downloaded lessons remain available
            after refreshing offline.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 self-start">
          {(
            [
              { id: 'all', label: 'All Lessons' },
              { id: 'offline', label: `Downloaded (${downloadedMaterials.length})` },
              { id: 'math', label: 'Mathematics' },
              { id: 'science', label: 'Science' },
            ] as Array<{ id: LessonFilter; label: string }>
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setFilterMode(tab.id);
                if (tab.id !== 'offline') {
                  setSelectedSubjectFilter(tab.id);
                }
              }}
              className={`min-h-[36px] rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                effectiveFilter === tab.id
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
          {effectiveFilter === 'offline'
            ? messages.student.noDownloadsYet
            : 'No lessons match your current filter. Try clearing the search or selecting All Lessons.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredLessons.map((lesson) => {
            const isDownloaded = downloadedIds.has(lesson.id);
            const progress = progressRecords.find((p) => p.lessonId === lesson.id);
            const blockedOffline = !network.isOnline && !isDownloaded;

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
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-medium ${
                        isDownloaded ? 'text-teal-700' : 'text-amber-700'
                      }`}
                    >
                      {isDownloaded ? 'Available Offline' : 'Requires Download'}
                    </span>
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
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={blockedOffline}
                      onClick={() => toggleDownloadLesson(lesson)}
                      className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 ${
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
