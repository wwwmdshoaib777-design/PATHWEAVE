import React from 'react';
import { ArrowRight, Compass, HelpCircle, RefreshCcw, Users, Wifi, WifiOff } from 'lucide-react';
import { usePathweave } from '../../context/PathweaveContext';
import { MIN_QUESTIONS_FOR_ADAPTIVE_EVAL } from '../../modules/adaptive/adaptiveEngine';
import { pickLocalized } from '../../modules/i18n/translations';
import { progressService } from '../../modules/progress/progressService';

export const TeacherDashboardView: React.FC = () => {
  const {
    profile,
    language,
    messages,
    subjects,
    lessons,
    allQuestions,
    studentsRoster,
    allQuizAttempts,
    teacherAdaptiveOverview,
    syncQueue,
    recentActivity,
    network,
    setTeacherTab,
  } = usePathweave();

  const liveAdaptiveStudents = teacherAdaptiveOverview.studentRows.filter(
    (r) => r.hasLiveAdaptiveData
  );
  const sampleBaselineStudents = teacherAdaptiveOverview.studentRows.filter(
    (r) => !r.hasLiveAdaptiveData
  );

  // Live class average uses strictly actual IndexedDB attempts when present (never mixed with sample scores)
  const liveTotalCorrect = allQuizAttempts.reduce((sum, a) => sum + a.score, 0);
  const liveTotalQuestions = allQuizAttempts.reduce((sum, a) => sum + a.totalQuestions, 0);
  const liveClassAverage =
    liveTotalQuestions > 0 ? Math.round((liveTotalCorrect / liveTotalQuestions) * 100) : null;

  const sampleBaselineAverage =
    studentsRoster.filter((s) => s.origin === 'sample').length > 0
      ? Math.round(
          studentsRoster
            .filter((s) => s.origin === 'sample')
            .reduce((sum, s) => sum + s.averageScore, 0) /
            studentsRoster.filter((s) => s.origin === 'sample').length
        )
      : 0;

  const liveWeakAreas = progressService.computeLiveTopicWeakAreas(allQuizAttempts);
  const sampleWeakAreas = progressService.computeSampleRosterWeakAreas(studentsRoster);

  return (
    <div className="space-y-8">
      {/* Teacher Profile Header */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{profile.schoolName}</span>
              <span aria-hidden="true">·</span>
              <span>{profile.district}</span>
              <span aria-hidden="true">·</span>
              <span>{profile.gradeOrSubject}</span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              {profile.name}
            </h1>
            <p className="mt-1 text-sm text-slate-600">{messages.teacher.overviewSubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTeacherTab('students')}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
            >
              <Users className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
              {messages.teacher.studentManagement}
            </button>
            <button
              type="button"
              onClick={() => setTeacherTab('questions')}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap tabular-nums"
            >
              <HelpCircle className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
              {messages.teacher.questionManagement} ({allQuestions.length})
            </button>
            <button
              type="button"
              onClick={() => setTeacherTab('materials')}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-teal-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-800 whitespace-nowrap"
            >
              {messages.teacher.materialManagement}
            </button>
          </div>
        </div>
      </section>

      {/* Teacher Overview KPIs */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">
            {messages.teacher.totalStudents}
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
            {studentsRoster.length}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">
            {messages.teacher.availableLessons}
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
            {subjects.length} / {lessons.length}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">
            {liveClassAverage !== null
              ? 'Live Cumulative Avg (IndexedDB)'
              : `${messages.teacher.classAverageScore} (Sample)`}
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
            {liveClassAverage !== null ? `${liveClassAverage}%` : `${sampleBaselineAverage}%`}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">
            {messages.teacher.localQueueItems}
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
            {syncQueue.length}
          </div>
        </div>
      </section>

      {/* Adaptive Learning Overview (Live IndexedDB Analytics Only) */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <Compass className="h-4 w-4 text-teal-700" aria-hidden="true" />
              {messages.adaptive.teacherOverviewTitle}
            </h2>
            <p className="text-xs text-slate-500">{messages.adaptive.teacherOverviewSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => setTeacherTab('performance')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 whitespace-nowrap shrink-0"
          >
            Full adaptive report
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        {liveAdaptiveStudents.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            No live student quiz attempts saved in IndexedDB yet. Switch to Student Mode and submit
            a quiz to inspect real-time adaptive weak topics, difficulty progressions, and
            chronological improvements here.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {liveAdaptiveStudents.map((row) => (
              <div
                key={row.studentId}
                className="py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="text-sm font-medium text-slate-900">
                    {row.studentName}{' '}
                    <span className="font-normal text-xs text-slate-500 tabular-nums">
                      · Grade {row.grade} · {row.attemptsCount} attempt(s)
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Weak topics:{' '}
                    <span className="font-medium text-amber-900">
                      {row.weakTopics.length > 0 ? row.weakTopics.join(', ') : 'None flagged'}
                    </span>
                    {row.insufficientDataTopics.length > 0 && (
                      <>
                        {' · '}Below {MIN_QUESTIONS_FOR_ADAPTIVE_EVAL} Qs:{' '}
                        <span className="text-slate-500">
                          {row.insufficientDataTopics
                            .map((t) => `${t.topicLabel} (${t.latestAccuracyPercent}%, ${t.questionsAttempted} Q)`)
                            .join(', ')}
                        </span>
                      </>
                    )}
                    {row.recommendedRevisionTopics.length > 0 && (
                      <>
                        {' · '}Revise:{' '}
                        <span className="font-medium text-slate-800">
                          {row.recommendedRevisionTopics.join(', ')}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    {row.difficultyProgressions
                      .map((dp) => `${dp.topicLabel}: ${dp.progression.join(' → ')}`)
                      .join(' · ')}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 shrink-0 font-mono text-xs tabular-nums">
                  {row.cumulativeAccuracyPercent !== null && (
                    <span className="text-slate-700">
                      Cumulative: {row.cumulativeAccuracyPercent}%
                    </span>
                  )}
                  {row.latestAccuracyPercent !== null && (
                    <span className="font-semibold text-slate-900">
                      Latest: {row.latestAccuracyPercent}%
                    </span>
                  )}
                  {row.chronologicalQuizImprovementDelta !== null && (
                    <span
                      className={`font-semibold ${
                        row.chronologicalQuizImprovementDelta >= 0
                          ? 'text-emerald-700'
                          : 'text-amber-800'
                      }`}
                    >
                      {row.chronologicalQuizImprovementDelta >= 0 ? '+' : ''}
                      {row.chronologicalQuizImprovementDelta}% (latest vs prev)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Live vs Sample Separated Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {messages.teacher.performanceOverview}
              </h2>
              <p className="text-xs text-slate-500">
                {liveAdaptiveStudents.length > 0
                  ? 'Live IndexedDB student averages shown first; static sample baselines labeled'
                  : messages.sampleDataNotice}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTeacherTab('performance')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800"
            >
              Details
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {liveAdaptiveStudents.map((row) => (
              <div key={row.studentId} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-slate-900">
                    {row.studentName}
                  </div>
                  <div className="text-xs text-teal-800 tabular-nums">
                    Live IndexedDB · {row.attemptsCount} attempt(s) · Latest{' '}
                    {row.latestAccuracyPercent}%
                  </div>
                </div>
                <div className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                  {row.cumulativeAccuracyPercent}% cum
                </div>
              </div>
            ))}

            {sampleBaselineStudents
              .slice(0, Math.max(0, 5 - liveAdaptiveStudents.length))
              .map((row) => {
                const rosterEntry = studentsRoster.find((s) => s.id === row.studentId);
                return (
                  <div key={row.studentId} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-900">
                        {row.studentName}
                      </div>
                      <div className="text-xs text-slate-500 tabular-nums">
                        Sample baseline · Grade {row.grade} · {rosterEntry?.lessonsCompleted ?? 0}{' '}
                        lessons
                      </div>
                    </div>
                    <div className="font-mono text-sm font-semibold text-slate-600 tabular-nums">
                      {rosterEntry && rosterEntry.averageScore > 0
                        ? `${rosterEntry.averageScore}%`
                        : 'New'}
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {messages.teacher.weakAreasTitle}
              </h2>
              <p className="text-xs text-slate-500">
                {liveWeakAreas.length > 0
                  ? `Live IndexedDB topic accuracy (min ${MIN_QUESTIONS_FOR_ADAPTIVE_EVAL} Qs to flag weak)`
                  : 'Static sample classroom baseline (no live attempts yet)'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTeacherTab('performance')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800"
            >
              Full report
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {liveWeakAreas.length > 0
              ? liveWeakAreas.slice(0, 5).map((area) => (
                  <div key={area.topicKey} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-900">
                        {area.topicName}
                      </div>
                      <div className="text-xs text-slate-500 tabular-nums">
                        {area.meetsMinThreshold
                          ? area.isWeak
                            ? `Live IndexedDB · Weak (<50% across ${area.questionsAttempted} Qs)`
                            : `Live IndexedDB · Evaluated (${area.questionsAttempted} Qs)`
                          : `Live IndexedDB · Below min ${MIN_QUESTIONS_FOR_ADAPTIVE_EVAL} Qs (${area.questionsAttempted} Q)`}
                      </div>
                    </div>
                    <div
                      className={`font-mono text-xs font-semibold tabular-nums shrink-0 ${
                        area.isWeak ? 'text-amber-800' : 'text-slate-700'
                      }`}
                    >
                      {area.cumulativeAccuracyPercent}% cum
                    </div>
                  </div>
                ))
              : sampleWeakAreas.slice(0, 5).map((area) => (
                  <div key={area.topicName} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-900">
                        {area.topicName}
                      </div>
                      <div className="text-xs text-slate-500">Sample classroom baseline</div>
                    </div>
                    <div className="font-mono text-xs font-semibold text-slate-600 tabular-nums shrink-0">
                      {area.occurrences} student(s)
                    </div>
                  </div>
                ))}
          </div>
        </section>
      </div>

      {/* Synchronization Status & Recent Classroom Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              {messages.teacher.syncStatusTitle}
            </h2>
            <button
              type="button"
              onClick={() => setTeacherTab('synchronization')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800"
            >
              Inspect queue
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-2 text-slate-800 font-medium">
              {network.isOnline ? (
                <Wifi className="h-4 w-4 text-teal-700" aria-hidden="true" />
              ) : (
                <WifiOff className="h-4 w-4 text-amber-700" aria-hidden="true" />
              )}
              <span>
                Device Connection: {network.isOnline ? messages.online : messages.offline}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-800 font-medium">
              <RefreshCcw className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <span className="tabular-nums">
                {syncQueue.length} local change(s) staged in IndexedDB
              </span>
            </div>
            <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
              {messages.teacher.stage1SyncNotice}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              {messages.teacher.recentClassroomActivity}
            </h2>
            <span className="text-xs text-slate-500">{messages.localSavedNotice}</span>
          </div>

          {recentActivity.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              No local classroom actions recorded yet. Add a student, create a lesson, or run a
              student quiz to see live activity logs.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentActivity.slice(0, 5).map((act) => (
                <li key={act.id} className="py-3">
                  <div className="text-sm text-slate-800">
                    <span className="font-medium">{act.actorName}: </span>
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
