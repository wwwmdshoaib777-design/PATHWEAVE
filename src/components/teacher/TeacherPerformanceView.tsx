import React from 'react';
import { usePathweave } from '../../context/PathweaveContext';
import { MIN_QUESTIONS_FOR_ADAPTIVE_EVAL } from '../../modules/adaptive/adaptiveEngine';
import { pickLocalized } from '../../modules/i18n/translations';
import { progressService } from '../../modules/progress/progressService';

export const TeacherPerformanceView: React.FC = () => {
  const { language, messages, studentsRoster, allQuizAttempts, teacherAdaptiveOverview } =
    usePathweave();

  const liveStudentRows = teacherAdaptiveOverview.studentRows.filter(
    (r) => r.hasLiveAdaptiveData
  );
  const sampleBaselineRows = teacherAdaptiveOverview.studentRows.filter(
    (r) => !r.hasLiveAdaptiveData
  );
  const liveWeakAreas = progressService.computeLiveTopicWeakAreas(allQuizAttempts);
  const sampleWeakAreas = progressService.computeSampleRosterWeakAreas(studentsRoster);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          {messages.teacher.performanceOverview}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Live student metrics computed exclusively from saved IndexedDB quiz attempts, separated
          from static sample classroom baselines. Minimum {MIN_QUESTIONS_FOR_ADAPTIVE_EVAL}{' '}
          questions per topic are required before flagging a weak topic or changing difficulty.
        </p>
      </div>

      {/* SECTION 1: Live IndexedDB Topic Summary (Cumulative vs Latest Attempt Accuracy) */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">
            Live IndexedDB Topic Performance Summary
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Clearly separates Cumulative Accuracy (correct ÷ total questions across all attempts)
            from Latest Attempt Accuracy (most recent attempt per student). Zero sample data mixed.
          </p>
        </div>

        {teacherAdaptiveOverview.topicSummaries.length === 0 ? (
          <div className="p-5 text-sm text-slate-600">
            No live quiz attempts saved in IndexedDB yet. Once a student submits a quiz, topic
            cumulative accuracy, latest attempt accuracy, threshold status, and chronological
            improvement appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="px-5 py-3">Topic</th>
                  <th className="px-5 py-3">Questions (Correct / Total)</th>
                  <th className="px-5 py-3">Cumulative Accuracy (All Attempts)</th>
                  <th className="px-5 py-3">Latest Attempt Accuracy (Avg)</th>
                  <th className="px-5 py-3">Weak Flagged & Min Threshold</th>
                  <th className="px-5 py-3">Chronological Improvement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teacherAdaptiveOverview.topicSummaries.map((topic) => (
                  <tr key={topic.topicKey} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {pickLocalized(topic.topicLabel, language)}
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-700 tabular-nums">
                      {topic.totalCorrectAnswers} / {topic.totalQuestionsAttempted}
                    </td>
                    <td className="px-5 py-3 font-mono font-semibold text-slate-900 tabular-nums">
                      {topic.cumulativeAccuracyPercent}%
                    </td>
                    <td className="px-5 py-3 font-mono font-semibold text-teal-800 tabular-nums">
                      {topic.averageRecentAccuracy}%
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-700 tabular-nums">
                      {topic.evaluatedStudentsCount === 0 ? (
                        <span className="text-slate-600">
                          0 weak · Below min {MIN_QUESTIONS_FOR_ADAPTIVE_EVAL} Qs (
                          {topic.totalQuestionsAttempted} Q attempted)
                        </span>
                      ) : (
                        <span>
                          <span className="font-mono font-semibold text-amber-800">
                            {topic.weakStudentCount}
                          </span>{' '}
                          of {topic.evaluatedStudentsCount} evaluated
                          {topic.insufficientDataStudentCount > 0
                            ? ` (${topic.insufficientDataStudentCount} below ${MIN_QUESTIONS_FOR_ADAPTIVE_EVAL} Qs)`
                            : ''}
                          {topic.prerequisiteCount > 0
                            ? ` · ${topic.prerequisiteCount} prereq revision`
                            : ''}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-mono font-semibold tabular-nums">
                      {topic.averageImprovementDelta === null ? (
                        <span className="text-slate-500">1 attempt only</span>
                      ) : (
                        <span
                          className={
                            topic.averageImprovementDelta >= 0
                              ? 'text-emerald-700'
                              : 'text-amber-800'
                          }
                        >
                          {topic.averageImprovementDelta >= 0 ? '+' : ''}
                          {topic.averageImprovementDelta}% (latest vs prev)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* SECTION 2: Student-Wise Live IndexedDB Adaptive Breakdown */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">
            Student-Wise Live Adaptive Performance (IndexedDB Only)
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Actual locally saved quiz records per student. Topics with fewer than{' '}
            {MIN_QUESTIONS_FOR_ADAPTIVE_EVAL} questions are held at baseline until sufficient
            evidence is recorded.
          </p>
        </div>

        {liveStudentRows.length === 0 ? (
          <div className="p-5 text-sm text-slate-600">
            No students have submitted live quizzes on this device yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Cumulative vs Latest Quiz</th>
                  <th className="px-5 py-3">Weak Topics & Threshold Holds</th>
                  <th className="px-5 py-3">Chronological Topic Progression</th>
                  <th className="px-5 py-3">Recommended Revision</th>
                  <th className="px-5 py-3">Chronological Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {liveStudentRows.map((row) => (
                  <tr key={row.studentId} className="hover:bg-slate-50 align-top">
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-900">{row.studentName}</div>
                      <div className="text-xs text-slate-500 tabular-nums">
                        Grade {row.grade} · {row.attemptsCount} live attempt(s)
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs tabular-nums whitespace-nowrap">
                      <div className="font-semibold text-slate-900">
                        Cumulative: {row.cumulativeAccuracyPercent ?? '—'}%
                      </div>
                      <div className="text-teal-800">
                        Latest quiz: {row.latestAccuracyPercent ?? '—'}%
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-700 space-y-1">
                      <div>
                        {row.weakTopics.length > 0 ? (
                          <span className="font-semibold text-amber-900">
                            Weak: {row.weakTopics.join(', ')}
                          </span>
                        ) : (
                          <span>None flagged (&lt;50% on ≥{MIN_QUESTIONS_FOR_ADAPTIVE_EVAL} Qs)</span>
                        )}
                      </div>
                      {row.insufficientDataTopics.length > 0 && (
                        <div className="text-slate-500">
                          {row.insufficientDataTopics
                            .map(
                              (t) =>
                                `${t.topicLabel}: ${t.latestAccuracyPercent}% (${t.questionsAttempted} Q — min ${MIN_QUESTIONS_FOR_ADAPTIVE_EVAL} Qs to evaluate)`
                            )
                            .join('; ')}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-700">
                      <ul className="space-y-1.5">
                        {row.difficultyProgressions.map((dp) => (
                          <li key={dp.topicKey}>
                            <span className="font-sans font-medium text-slate-900">
                              {dp.topicLabel}:{' '}
                            </span>
                            <span>{dp.progression.join(' → ')}</span>
                            <span className="text-slate-500">
                              {' '}
                              [{dp.attemptAccuracies.map((a) => `${a}%`).join(' → ')} · cum{' '}
                              {dp.cumulativeAccuracyPercent}%]
                            </span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-700">
                      {row.recommendedRevisionTopics.length > 0
                        ? row.recommendedRevisionTopics.join('; ')
                        : 'On track'}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs font-semibold tabular-nums whitespace-nowrap">
                      {row.chronologicalQuizImprovementDelta !== null ? (
                        <span
                          className={
                            row.chronologicalQuizImprovementDelta >= 0
                              ? 'text-emerald-700'
                              : 'text-amber-800'
                          }
                        >
                          {row.chronologicalQuizImprovementDelta >= 0 ? '+' : ''}
                          {row.chronologicalQuizImprovementDelta}% (latest vs prev quiz)
                        </span>
                      ) : (
                        <span className="text-slate-500">1st attempt</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* SECTION 3: Live Weak Topics vs Threshold Summary (No Sample Mixing) */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">
            Live Topic Accuracy & Threshold Audit (IndexedDB Only)
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Cumulative topic accuracy across all saved attempts. Only topics with ≥
            {MIN_QUESTIONS_FOR_ADAPTIVE_EVAL} questions attempted and &lt;50% accuracy are flagged
            weak.
          </p>
        </div>
        {liveWeakAreas.length === 0 ? (
          <div className="p-5 text-sm text-slate-600">
            No live topic attempts recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="px-5 py-3">Topic</th>
                  <th className="px-5 py-3">Correct / Attempted</th>
                  <th className="px-5 py-3">Cumulative Accuracy</th>
                  <th className="px-5 py-3">Adaptive Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {liveWeakAreas.map((area) => (
                  <tr key={area.topicKey} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">{area.topicName}</td>
                    <td className="px-5 py-3 font-mono text-slate-700 tabular-nums">
                      {area.correctCount} / {area.questionsAttempted}
                    </td>
                    <td className="px-5 py-3 font-mono font-semibold text-slate-900 tabular-nums">
                      {area.cumulativeAccuracyPercent}%
                    </td>
                    <td className="px-5 py-3 text-xs">
                      {!area.meetsMinThreshold ? (
                        <span className="text-slate-600">
                          Not flagged weak — insufficient evidence ({area.questionsAttempted}/
                          {MIN_QUESTIONS_FOR_ADAPTIVE_EVAL} Qs min)
                        </span>
                      ) : area.isWeak ? (
                        <span className="font-semibold text-amber-800">
                          Weak topic (&lt;50% cumulative)
                        </span>
                      ) : (
                        <span className="text-teal-800">Evaluated (≥50%)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* SECTION 4: Sample Classroom Roster Baseline (Strictly Separate Reference Data) */}
      <section className="rounded-xl border border-slate-200 bg-slate-50/70 overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">
            Sample Classroom Baseline (Reference Only — Not Used by Adaptive Engine)
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Static seeded roster figures for students without live IndexedDB quiz attempts yet.
            These records never influence live adaptive recommendations or live topic accuracy.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-2">
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-2.5">Student</th>
                  <th className="px-4 py-2.5">Grade</th>
                  <th className="px-4 py-2.5">Sample Avg</th>
                  <th className="px-4 py-2.5">Sample Weak Topics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sampleBaselineRows.map((row) => (
                  <tr key={row.studentId}>
                    <td className="px-4 py-2.5 font-medium text-slate-900">{row.studentName}</td>
                    <td className="px-4 py-2.5 text-slate-600 tabular-nums">Grade {row.grade}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-700 tabular-nums">
                      {studentsRoster.find((s) => s.id === row.studentId)?.averageScore
                        ? `${studentsRoster.find((s) => s.id === row.studentId)?.averageScore}%`
                        : '0 attempts'}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {row.sampleBaselineWeakTopics.length > 0
                        ? row.sampleBaselineWeakTopics.join(', ')
                        : 'None'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-2.5">Sample Baseline Topic</th>
                  <th className="px-4 py-2.5">Roster Students Flagged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sampleWeakAreas.map((area) => (
                  <tr key={area.topicName}>
                    <td className="px-4 py-2.5 font-medium text-slate-900">{area.topicName}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-700 tabular-nums">
                      {area.occurrences} student(s)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
