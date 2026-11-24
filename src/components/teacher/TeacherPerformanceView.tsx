import React from 'react';
import { usePathweave } from '../../context/PathweaveContext';
import { progressService } from '../../modules/progress/progressService';

export const TeacherPerformanceView: React.FC = () => {
  const { messages, studentsRoster, allQuizAttempts } = usePathweave();
  const weakAreas = progressService.computeTopicWeakAreas(studentsRoster, allQuizAttempts);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          {messages.teacher.performanceOverview}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Student mastery metrics and topic-wise weak areas derived from sample classroom data and
          local quiz attempts.
        </p>
      </div>

      {/* Topic-wise Weak Areas */}
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

      {/* Individual Student Breakdown */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">Student-by-Student Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Grade</th>
                <th className="px-5 py-3">Completed Lessons</th>
                <th className="px-5 py-3">Average Score</th>
                <th className="px-5 py-3">Weak Topics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentsRoster.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-900">{student.name}</td>
                  <td className="px-5 py-3 text-slate-600 tabular-nums">Grade {student.grade}</td>
                  <td className="px-5 py-3 font-mono text-slate-700 tabular-nums">
                    {student.lessonsCompleted}
                  </td>
                  <td className="px-5 py-3 font-mono font-semibold text-slate-900 tabular-nums">
                    {student.averageScore > 0 ? `${student.averageScore}%` : '—'}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-600">
                    {student.weakTopics.length > 0 ? student.weakTopics.join(', ') : 'None flagged'}
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
