import React, { useMemo, useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { usePathweave } from '../../context/PathweaveContext';
import { LanguageCode } from '../../types/domain';

export const TeacherStudentsView: React.FC = () => {
  const { messages, studentsRoster, addLocalStudent, removeLocalStudent } = usePathweave();
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState<number | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const [name, setName] = useState('');
  const [grade, setGrade] = useState(7);
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>('kn');
  const [saving, setSaving] = useState(false);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return studentsRoster.filter((s) => {
      if (gradeFilter !== 'all' && s.grade !== gradeFilter) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q);
    });
  }, [gradeFilter, search, studentsRoster]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      await addLocalStudent({ name, grade, preferredLanguage });
      setName('');
      setGrade(7);
      setPreferredLanguage('kn');
      setShowAddForm(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            {messages.teacher.studentManagement}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Sample rural classroom roster combined with students added locally in IndexedDB.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm((prev) => !prev)}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 self-start"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {messages.teacher.addStudent}
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAddStudent}
          className="rounded-xl border border-slate-200 bg-white p-5 space-y-4"
        >
          <h3 className="text-base font-semibold text-slate-900">Add Student to Local Roster</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="student-name" className="block text-xs font-medium text-slate-700">
                Full Name
              </label>
              <input
                id="student-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Deepa Rao"
                className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 px-3 text-sm"
              />
            </div>
            <div>
              <label htmlFor="student-grade" className="block text-xs font-medium text-slate-700">
                Grade
              </label>
              <select
                id="student-grade"
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
              >
                <option value={6}>Grade 6</option>
                <option value={7}>Grade 7</option>
                <option value={8}>Grade 8</option>
              </select>
            </div>
            <div>
              <label htmlFor="student-lang" className="block text-xs font-medium text-slate-700">
                Preferred Language
              </label>
              <select
                id="student-lang"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value as LanguageCode)}
                className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
              >
                <option value="kn">Kannada</option>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="min-h-[40px] rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
            >
              Save Student Locally
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="min-h-[40px] rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students by name..."
            aria-label="Search students"
            className="min-h-[44px] w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm"
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 self-start">
          {(['all', 6, 7, 8] as const).map((g) => (
            <button
              key={String(g)}
              type="button"
              onClick={() => setGradeFilter(g)}
              className={`min-h-[36px] rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                gradeFilter === g
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {g === 'all' ? 'All Grades' : `Grade ${g}`}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Grade</th>
                <th className="px-5 py-3">Language</th>
                <th className="px-5 py-3">Lessons</th>
                <th className="px-5 py-3">Avg Score</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-900">{student.name}</td>
                  <td className="px-5 py-3 text-slate-600 tabular-nums">Grade {student.grade}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {student.preferredLanguage === 'kn'
                      ? 'Kannada'
                      : student.preferredLanguage === 'hi'
                        ? 'Hindi'
                        : 'English'}
                  </td>
                  <td className="px-5 py-3 font-mono text-slate-700 tabular-nums">
                    {student.lessonsCompleted}
                  </td>
                  <td className="px-5 py-3 font-mono font-semibold text-slate-900 tabular-nums">
                    {student.averageScore > 0 ? `${student.averageScore}%` : '—'}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500">
                    {student.origin === 'sample' ? 'Sample Roster' : 'Local IndexedDB'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {student.origin === 'local' ? (
                      <button
                        type="button"
                        aria-label={`Delete ${student.name}`}
                        onClick={() => removeLocalStudent(student.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Read-only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
