import React from 'react';
import { usePathweave } from '../../context/PathweaveContext';
import { pickLocalized } from '../../modules/i18n/translations';
import { progressService } from '../../modules/progress/progressService';

export const TeacherPerformanceView: React.FC = () => {
  const { language, messages, studentsRoster, allQuizAttempts, teacherAdaptiveOverview } =
    usePathweave();
  const weakAreas = progressService.computeTopicWeakAreas(studentsRoster, allQuizAttempts);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          {messages.teacher.performanceOverview}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Live rule-based adaptive diagnostics from IndexedDB alongside clearly labeled sample
          classroom baselines.
        </p>
      </div>

      {/* Adaptive Topic Performance Across Students */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">
            {messages.adaptive.teacherOverviewTitle} — Topic Summary
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Computed exclusively from actual saved quiz attempts in IndexedDB.
          </p>
        </div>

        {teacherAdaptiveOverview.topicSummaries.length === 0 ? (
          <div className="p-5 text-sm text-slate-600">
            No live adaptive topic records yet. Once students submit quizzes, topic accuracy, weak
            student counts, prerequisite flags, and multi-attempt improvements appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="px-5 py-3">Topic</th>
                  <th className="px-5 py-3">Students Practiced</th>
                  <th className="px-5 py-3">Weak Flagged</th>
                  <th className="px-5 py-3">Prerequisite Revision</th>
                  <th className="px-5 py-3">Avg Latest Accuracy</th>
                  <th className="px-5 py-3">Avg Improvement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teacherAdaptiveOverview.topicSummaries.map((topic) => (
                  <tr key={topic.topicKey} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {pickLocalized(topic.topicLabel, language)}
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-700 tabular-nums">
                      {topic.studentsPracticed}
                    </td>
                    <td className="px-5 py-3 font-mono text-amber-800 tabular-nums">
                      {topic.weakStudentCount}
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-700 tabular-nums">
                      {topic.prerequisiteCount}
                    </td>
                    <td className="px-5 py-3 font-mono font-semibold text-slate-900 tabular-nums">
                      {topic.averageRecentAccuracy}%
                    </td>
                    <td className="px-5 py-3 font-mono font-semibold tabular-nums">
                      {topic.averageImprovementDelta === null ? (
                        <span className="text-slate-500">Single attempt</span>
                      ) : (
                        <span
                          className={
                            topic.averageImprovementDelta >= 0
                              ? 'text-emerald-700'
                              : 'text-amber-800'
                          }
                        >
                          {topic.averageImprovementDelta >= 0 ? '+' : ''}
                          {topic.averageImprovementDelta}%
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

      {/* Student-wise Adaptive Progression & Revision Matrix */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">
            Student-Wise Adaptive Weak Topics, Difficulty Progression & Improvement
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Rows with live local attempts show real adaptive engine output; others display sample
            baseline data.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Data Source</th>
                <th className="px-5 py-3">Weak Topics</th>
                <th className="px-5 py-3">Difficulty Progression</th>
                <th className="px-5 py-3">Recommended Revision</th>
                <th className="px-5 py-3">Multi-Attempt Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teacherAdaptiveOverview.studentRows.map((row) => (
                <tr key={row.studentId} className="hover:bg-slate-50 align-top">
                  <td className="px-5 py-3">
                    <div className="font-medium text-slate-900">{row.studentName}</div>
                    <div className="text-xs text-slate-500 tabular-nums">Grade {row.grade}</div>
                  </td>
                  <td className="px-5 py-3 text-xs">
                    {row.hasLiveAdaptiveData ? (
                      <span className="font-semibold text-teal-800 tabular-nums">
                        Live IndexedDB ({row.attemptsCount} attempts)
                      </span>
                    ) : (
                      <span className="text-slate-500">Sample Baseline</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-700">
                    {row.hasLiveAdaptiveData
                      ? row.weakTopics.length > 0
                        ? row.weakTopics.join(', ')
                        : 'None flagged'
                      : row.sampleBaselineWeakTopics.length > 0
                        ? `${row.sampleBaselineWeakTopics.join(', ')} (sample)`
                        : 'None'}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-700">
                    {row.difficultyProgressions.length > 0 ? (
                      <ul className="space-y-1">
                        {row.difficultyProgressions.map((dp) => (
                          <li key={dp.topicKey}>
                            <span className="font-sans font-medium text-slate-800">
                              {dp.topicLabel}:{' '}
                            </span>
                            {dp.progression.join(' → ')}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="font-sans text-slate-400">No attempts yet</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-700">
                    {row.recommendedRevisionTopics.length > 0
                      ? row.recommendedRevisionTopics.join('; ')
                      : row.hasLiveAdaptiveData
                        ? 'On track'
                        : '—'}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs font-semibold tabular-nums">
                    {row.overallImprovementDelta !== null ? (
                      <span
                        className={
                          row.overallImprovementDelta >= 0 ? 'text-emerald-700' : 'text-amber-800'
                        }
                      >
                        {row.overallImprovementDelta >= 0 ? '+' : ''}
                        {row.overallImprovementDelta}%
                      </span>
                    ) : row.latestAccuracyPercent !== null ? (
                      <span className="text-slate-700">{row.latestAccuracyPercent}% (1st)</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Topic-wise Weak Areas (Aggregated) */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">
            {messages.teacher.weakAreasTitle}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <tr>
                <th className="px-5 py-3">Topic</th>
                <th className="px-5 py-3">Students Flagged (Sample)</th>
                <th className="px-5 py-3">Live Quiz Accuracy</th>
                <th className="px-5 py-3">Signal Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {weakAreas.map((area) => (
                <tr key={area.topicName} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-900">{area.topicName}</td>
                  <td className="px-5 py-3 font-mono text-slate-700 tabular-nums">
                    {area.occurrences}
                  </td>
                  <td className="px-5 py-3 font-mono font-semibold text-slate-900 tabular-nums">
                    {area.accuracyPercent !== null ? `${area.accuracyPercent}%` : 'No quiz data'}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500">
                    {area.source === 'quiz_attempts'
                      ? 'Local Quiz Attempts + Roster'
                      : 'Sample Roster Baseline'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
