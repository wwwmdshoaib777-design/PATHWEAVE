import React, { useState } from 'react';
import { Download, PackagePlus, Plus, Trash2 } from 'lucide-react';
import { usePathweave } from '../../context/PathweaveContext';
import { pickLocalized } from '../../modules/i18n/translations';
import { SubjectId } from '../../types/domain';

export const TeacherMaterialsView: React.FC = () => {
  const {
    language,
    messages,
    lessons,
    learningPackets,
    createLocalLesson,
    removeLocalLesson,
    createLearningPacket,
    exportPacketJson,
  } = usePathweave();

  const [showLessonForm, setShowLessonForm] = useState(false);
  const [subjectId, setSubjectId] = useState<SubjectId>('math');
  const [grade, setGrade] = useState(7);
  const [topicEn, setTopicEn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [summaryEn, setSummaryEn] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);
  const [savingLesson, setSavingLesson] = useState(false);

  const [showPacketForm, setShowPacketForm] = useState(false);
  const [packetTitle, setPacketTitle] = useState('');
  const [packetSubject, setPacketSubject] = useState<SubjectId>('math');
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn.trim() || !bodyEn.trim() || savingLesson) return;
    setSavingLesson(true);
    try {
      await createLocalLesson({
        subjectId,
        grade,
        topicEn: topicEn || 'Classroom Topic',
        titleEn,
        summaryEn: summaryEn || titleEn,
        bodyEn,
        estimatedMinutes,
      });
      setTopicEn('');
      setTitleEn('');
      setSummaryEn('');
      setBodyEn('');
      setShowLessonForm(false);
    } finally {
      setSavingLesson(false);
    }
  };

  const handleToggleLessonForPacket = (lessonId: string) => {
    setSelectedLessonIds((prev) =>
      prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
    );
  };

  const handleCreatePacket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packetTitle.trim() || selectedLessonIds.length === 0) return;
    await createLearningPacket(packetTitle, packetSubject, selectedLessonIds);
    setPacketTitle('');
    setSelectedLessonIds([]);
    setShowPacketForm(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            {messages.teacher.materialManagement}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Manage curriculum lessons and bundle materials into offline-ready learning packets.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setShowPacketForm((v) => !v);
              setShowLessonForm(false);
            }}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
          >
            <PackagePlus className="h-4 w-4 text-teal-700" aria-hidden="true" />
            {messages.teacher.createPacket}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowLessonForm((v) => !v);
              setShowPacketForm(false);
            }}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {messages.teacher.addMaterial}
          </button>
        </div>
      </div>

      {/* Create Local Lesson Form */}
      {showLessonForm && (
        <form
          onSubmit={handleCreateLesson}
          className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
        >
          <h3 className="text-base font-semibold text-slate-900">
            Create Local Lesson Material (Saved to IndexedDB)
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="lesson-subject" className="block text-xs font-medium text-slate-700">
                Subject
              </label>
              <select
                id="lesson-subject"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value as SubjectId)}
                className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
              >
                <option value="math">Mathematics</option>
                <option value="science">Science</option>
              </select>
            </div>
            <div>
              <label htmlFor="lesson-grade" className="block text-xs font-medium text-slate-700">
                Grade
              </label>
              <select
                id="lesson-grade"
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
              <label htmlFor="lesson-duration" className="block text-xs font-medium text-slate-700">
                Duration (minutes)
              </label>
              <input
                id="lesson-duration"
                type="number"
                min={5}
                max={60}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 px-3 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="lesson-topic" className="block text-xs font-medium text-slate-700">
                Topic Name
              </label>
              <input
                id="lesson-topic"
                type="text"
                required
                value={topicEn}
                onChange={(e) => setTopicEn(e.target.value)}
                placeholder="e.g. Simple Interest"
                className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 px-3 text-sm"
              />
            </div>
            <div>
              <label htmlFor="lesson-title" className="block text-xs font-medium text-slate-700">
                Lesson Title
              </label>
              <input
                id="lesson-title"
                type="text"
                required
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Calculating Simple Interest for Farm Loans"
                className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 px-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="lesson-summary" className="block text-xs font-medium text-slate-700">
              Short Summary
            </label>
            <input
              id="lesson-summary"
              type="text"
              required
              value={summaryEn}
              onChange={(e) => setSummaryEn(e.target.value)}
              placeholder="One-sentence overview for students"
              className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 px-3 text-sm"
            />
          </div>

          <div>
            <label htmlFor="lesson-body" className="block text-xs font-medium text-slate-700">
              Lesson Explanation
            </label>
            <textarea
              id="lesson-body"
              rows={4}
              required
              value={bodyEn}
              onChange={(e) => setBodyEn(e.target.value)}
              placeholder="Write clear classroom explanation and worked example..."
              className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={savingLesson}
              className="min-h-[44px] rounded-lg bg-teal-700 px-5 py-2 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
            >
              Publish Locally
            </button>
            <button
              type="button"
              onClick={() => setShowLessonForm(false)}
              className="min-h-[44px] rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Package Learning Packet Form */}
      {showPacketForm && (
        <form
          onSubmit={handleCreatePacket}
          className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
        >
          <h3 className="text-base font-semibold text-slate-900">
            Create Staged Learning Packet Manifest
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="packet-title" className="block text-xs font-medium text-slate-700">
                Packet Name
              </label>
              <input
                id="packet-title"
                type="text"
                required
                value={packetTitle}
                onChange={(e) => setPacketTitle(e.target.value)}
                placeholder="e.g. Week 4 Revision Bundle"
                className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 px-3 text-sm"
              />
            </div>
            <div>
              <label htmlFor="packet-subject" className="block text-xs font-medium text-slate-700">
                Subject Focus
              </label>
              <select
                id="packet-subject"
                value={packetSubject}
                onChange={(e) => setPacketSubject(e.target.value as SubjectId)}
                className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
              >
                <option value="math">Mathematics</option>
                <option value="science">Science</option>
              </select>
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-700 mb-2">
              Select Lessons to Include ({selectedLessonIds.length} selected)
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3">
              {lessons.map((lesson) => (
                <label
                  key={lesson.id}
                  className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedLessonIds.includes(lesson.id)}
                    onChange={() => handleToggleLessonForPacket(lesson.id)}
                    className="mt-0.5 h-4 w-4 accent-teal-700"
                  />
                  <span>{pickLocalized(lesson.title, language)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!packetTitle.trim() || selectedLessonIds.length === 0}
              className="min-h-[44px] rounded-lg bg-teal-700 px-5 py-2 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
            >
              Stage Packet Manifest
            </button>
            <button
              type="button"
              onClick={() => setShowPacketForm(false)}
              className="min-h-[44px] rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Lessons Table */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">
            Curriculum & Local Lessons ({lessons.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <tr>
                <th className="px-5 py-3">Lesson Title</th>
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3">Grade</th>
                <th className="px-5 py-3">Size</th>
                <th className="px-5 py-3">Origin</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lessons.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-900">
                    {pickLocalized(lesson.title, language)}
                  </td>
                  <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                    {lesson.subjectId === 'math' ? 'Mathematics' : 'Science'}
                  </td>
                  <td className="px-5 py-3 text-slate-600 tabular-nums whitespace-nowrap">
                    Grade {lesson.grade}
                  </td>
                  <td className="px-5 py-3 font-mono text-slate-600 tabular-nums whitespace-nowrap">
                    {lesson.sizeKB} KB
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">
                    {lesson.origin === 'sample' ? 'Sample Curriculum' : 'Local IndexedDB'}
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    {lesson.origin === 'local' ? (
                      <button
                        type="button"
                        aria-label={`Delete ${pickLocalized(lesson.title, language)}`}
                        onClick={() => removeLocalLesson(lesson.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Core sample</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Staged Learning Packets */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">
            Learning Packet Manifests ({learningPackets.length})
          </h3>
          <span className="text-xs text-slate-500">JSON export ready for Stage 2 transfer</span>
        </div>
        <div className="divide-y divide-slate-100">
          {learningPackets.map((packet) => (
            <div
              key={packet.id}
              className="px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="text-sm font-semibold text-slate-900">{packet.title}</div>
                <div className="mt-0.5 text-xs text-slate-500 tabular-nums">
                  {packet.subjectId === 'math' ? 'Mathematics' : 'Science'} ·{' '}
                  {packet.lessonIds.length} lessons · {packet.totalSizeKB} KB · v{packet.version} ·{' '}
                  {packet.origin === 'sample' ? 'Sample Packet' : 'Created Locally'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => exportPacketJson(packet)}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 self-start sm:self-auto"
              >
                <Download className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
                Export Manifest JSON
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
