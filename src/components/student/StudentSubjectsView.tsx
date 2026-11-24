import React from 'react';
import { BookOpen, ClipboardCheck } from 'lucide-react';
import { usePathweave } from '../../context/PathweaveContext';
import { pickLocalized } from '../../modules/i18n/translations';
import { progressService } from '../../modules/progress/progressService';
import { SubjectImage } from '../shared/SubjectImage';

export const StudentSubjectsView: React.FC = () => {
  const {
    language,
    messages,
    subjects,
    lessons,
    quizzes,
    progressRecords,
    setSelectedSubjectFilter,
    setStudentTab,
  } = usePathweave();

  const summaries = progressService.computeSubjectSummaries(lessons, progressRecords);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          {messages.student.availableSubjects}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Structured core subjects aligned for rural classrooms. {messages.sampleDataNotice}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {subjects.map((subject) => {
          const summary = summaries.find((s) => s.subjectId === subject.id);
          const subjectQuizzes = quizzes.filter((q) => q.subjectId === subject.id);

          return (
            <article
              key={subject.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white flex flex-col"
            >
              <SubjectImage
                src={subject.illustrationUrl}
                alt={pickLocalized(subject.title, language)}
                subjectId={subject.id}
                className="h-52 w-full object-cover border-b border-slate-100"
              />
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono">{subject.code}</span>
                    <span aria-hidden="true">·</span>
                    <span>{subject.gradeRange}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{subject.lessonCount} lessons</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{subjectQuizzes.length} quizzes</span>
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">
                    {pickLocalized(subject.title, language)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {pickLocalized(subject.description, language)}
                  </p>

                  {/* Completion bar */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                      <span>Completion</span>
                      <span className="font-mono tabular-nums">
                        {summary?.completionPercent ?? 0}% ({summary?.completedLessons ?? 0}/
                        {summary?.totalLessons ?? 0})
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-teal-700 transition-all"
                        style={{ width: `${summary?.completionPercent ?? 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubjectFilter(subject.id);
                      setStudentTab('lessons');
                    }}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 transition-colors whitespace-nowrap shrink-0"
                  >
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                    {messages.student.openLesson}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudentTab('practice')}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                  >
                    <ClipboardCheck className="h-4 w-4 text-teal-700" aria-hidden="true" />
                    {messages.student.startQuiz}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
