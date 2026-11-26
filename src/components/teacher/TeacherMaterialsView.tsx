import React, { useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Download,
  HelpCircle,
  PackagePlus,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { usePathweave } from '../../context/PathweaveContext';
import { TOPIC_DEFINITIONS } from '../../modules/adaptive/adaptiveQuestionBank';
import { lessonService } from '../../modules/curriculum/lessonService';
import { pickLocalized } from '../../modules/i18n/translations';
import { LanguageCode, Lesson, SubjectId } from '../../types/domain';

const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: 'English',
  kn: 'ಕನ್ನಡ (Kannada)',
  hi: 'हिन्दी (Hindi)',
};

export const TeacherMaterialsView: React.FC = () => {
  const {
    language,
    messages,
    lessons,
    allQuestions,
    learningPackets,
    createLocalLesson,
    updateLocalLesson,
    removeLocalLesson,
    createLearningPacket,
    exportPacketJson,
    setTeacherTab,
  } = usePathweave();

  const formRef = useRef<HTMLFormElement | null>(null);

  // Create / Edit Lesson Form State
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<SubjectId>('math');
  const [grade, setGrade] = useState<number>(7);
  const [lessonLanguage, setLessonLanguage] = useState<LanguageCode>(language);
  const [selectedTopicPreset, setSelectedTopicPreset] = useState<string>('custom');
  const [topicText, setTopicText] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);
  const [savingLesson, setSavingLesson] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Inline Delete Confirmation State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<SubjectId | 'all'>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');

  // Learning Packet Form State (preserved from Stage 1/2)
  const [showPacketForm, setShowPacketForm] = useState(false);
  const [packetTitle, setPacketTitle] = useState('');
  const [packetSubject, setPacketSubject] = useState<SubjectId>('math');
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);

  const subjectTopicOptions = useMemo(
    () =>
      Object.values(TOPIC_DEFINITIONS).filter((def) => def.subjectId === subjectId),
    [subjectId]
  );

  const availableFilterTopics = useMemo(() => {
    const unique = new Set<string>();
    for (const lesson of lessons) {
      if (subjectFilter !== 'all' && lesson.subjectId !== subjectFilter) continue;
      const label = pickLocalized(lesson.topic, language).trim();
      if (label) unique.add(label);
    }
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [language, lessons, subjectFilter]);

  const filteredLessons = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return lessons.filter((lesson) => {
      if (subjectFilter !== 'all' && lesson.subjectId !== subjectFilter) {
        return false;
      }
      const topicLabel = pickLocalized(lesson.topic, language);
      if (topicFilter !== 'all' && topicLabel !== topicFilter) {
        return false;
      }
      if (!query) return true;
      const lessonTitle = pickLocalized(lesson.title, language).toLowerCase();
      const lessonDesc = pickLocalized(lesson.summary, language).toLowerCase();
      return (
        lessonTitle.includes(query) ||
        topicLabel.toLowerCase().includes(query) ||
        lessonDesc.includes(query)
      );
    });
  }, [language, lessons, searchQuery, subjectFilter, topicFilter]);

  const localCreatedCount = useMemo(
    () => lessons.filter((l) => !lessonService.isSampleLessonId(l.id)).length,
    [lessons]
  );

  const questionCountByLesson = useMemo(() => {
    const map = new Map<string, number>();
    for (const q of allQuestions) {
      if (q.lessonId) {
        map.set(q.lessonId, (map.get(q.lessonId) ?? 0) + 1);
      }
    }
    return map;
  }, [allQuestions]);

  const resetLessonForm = () => {
    setEditingLessonId(null);
    setSubjectId('math');
    setGrade(7);
    setLessonLanguage(language);
    setSelectedTopicPreset('custom');
    setTopicText('');
    setTitle('');
    setDescription('');
    setContent('');
    setEstimatedMinutes(15);
    setFormError(null);
  };

  const openCreateForm = () => {
    resetLessonForm();
    setShowPacketForm(false);
    setShowLessonForm(true);
    setConfirmDeleteId(null);
  };

  const openEditForm = (lesson: Lesson) => {
    const targetLang = lesson.authoredLanguage ?? language;
    const matchedTopic = Object.values(TOPIC_DEFINITIONS).find(
      (def) =>
        def.topicKey === lesson.topicKey ||
        def.label[targetLang].toLowerCase() === pickLocalized(lesson.topic, targetLang).toLowerCase() ||
        def.label.en.toLowerCase() === lesson.topic.en.toLowerCase()
    );

    setEditingLessonId(lesson.id);
    setSubjectId(lesson.subjectId);
    setGrade(lesson.grade);
    setLessonLanguage(targetLang);
    setSelectedTopicPreset(matchedTopic ? matchedTopic.topicKey : 'custom');
    setTopicText(pickLocalized(lesson.topic, targetLang));
    setTitle(pickLocalized(lesson.title, targetLang));
    setDescription(pickLocalized(lesson.summary, targetLang));
    setContent(
      lesson.sections
        .map((s) => pickLocalized(s.body, targetLang))
        .filter(Boolean)
        .join('\n\n')
    );
    setEstimatedMinutes(lesson.estimatedMinutes);
    setFormError(null);
    setShowPacketForm(false);
    setShowLessonForm(true);
    setConfirmDeleteId(null);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 30);
  };

  const handleSubjectChange = (nextSubject: SubjectId) => {
    setSubjectId(nextSubject);
    if (selectedTopicPreset !== 'custom') {
      const stillMatches = TOPIC_DEFINITIONS[selectedTopicPreset]?.subjectId === nextSubject;
      if (!stillMatches) {
        setSelectedTopicPreset('custom');
        setTopicText('');
      }
    }
  };

  const handleTopicPresetChange = (presetKey: string) => {
    setSelectedTopicPreset(presetKey);
    if (presetKey !== 'custom') {
      const def = TOPIC_DEFINITIONS[presetKey];
      if (def) {
        setTopicText(def.label[lessonLanguage] || def.label.en);
      }
    }
  };

  const handleLessonLanguageChange = (nextLang: LanguageCode) => {
    setLessonLanguage(nextLang);
    if (selectedTopicPreset !== 'custom') {
      const def = TOPIC_DEFINITIONS[selectedTopicPreset];
      if (def) {
        setTopicText(def.label[nextLang] || def.label.en);
      }
    }
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingLesson) return;

    if (!title.trim() || !topicText.trim() || !description.trim() || !content.trim()) {
      setFormError('Please fill in lesson title, topic, description, and lesson content.');
      return;
    }

    setSavingLesson(true);
    setFormError(null);
    try {
      const payload = {
        subjectId,
        grade,
        topicKey: selectedTopicPreset !== 'custom' ? selectedTopicPreset : undefined,
        topicText: topicText.trim(),
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        language: lessonLanguage,
        estimatedMinutes,
      };

      if (editingLessonId) {
        const updated = await updateLocalLesson(editingLessonId, payload);
        setStatusNotice(
          `Saved changes to "${pickLocalized(updated.title, language)}" in IndexedDB and synced its offline cache.`
        );
      } else {
        const created = await createLocalLesson(payload);
        setStatusNotice(
          `Published "${pickLocalized(created.title, language)}" to IndexedDB and cached it for offline student access.`
        );
      }

      resetLessonForm();
      setShowLessonForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to save lesson locally.');
    } finally {
      setSavingLesson(false);
    }
  };

  const handleConfirmedDelete = async (lesson: Lesson) => {
    if (deletingId) return;
    setDeletingId(lesson.id);
    try {
      const isSampleOverride = lessonService.isSampleLessonId(lesson.id);
      const lessonTitle = pickLocalized(lesson.title, language);
      await removeLocalLesson(lesson.id);
      if (editingLessonId === lesson.id) {
        resetLessonForm();
        setShowLessonForm(false);
      }
      setConfirmDeleteId(null);
      setStatusNotice(
        isSampleOverride
          ? `Reverted "${lessonTitle}" back to the original sample curriculum version.`
          : `Deleted "${lessonTitle}" from IndexedDB and offline storage.`
      );
    } finally {
      setDeletingId(null);
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

  const hasActiveFilters =
    searchQuery.trim().length > 0 || subjectFilter !== 'all' || topicFilter !== 'all';

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            {messages.teacher.materialManagement}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Create, edit, search, and manage local lessons stored in IndexedDB alongside curriculum
            learning packets.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTeacherTab('questions')}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <HelpCircle className="h-4 w-4 text-teal-700" aria-hidden="true" />
            {messages.nav.questions}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowPacketForm((v) => !v);
              setShowLessonForm(false);
            }}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <PackagePlus className="h-4 w-4 text-teal-700" aria-hidden="true" />
            {messages.teacher.createPacket}
          </button>

          <button
            type="button"
            onClick={() => {
              if (showLessonForm && !editingLessonId) {
                setShowLessonForm(false);
              } else {
                openCreateForm();
              }
            }}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {messages.teacher.addMaterial}
          </button>
        </div>
      </div>

      {statusNotice && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-950"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" aria-hidden="true" />
            <span>{statusNotice}</span>
          </div>
          <button
            type="button"
            aria-label="Dismiss notice"
            onClick={() => setStatusNotice(null)}
            className="rounded-md p-1 text-teal-800 hover:bg-teal-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Create / Edit Lesson Form */}
      {showLessonForm && (
        <form
          ref={formRef}
          onSubmit={handleSaveLesson}
          className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {editingLessonId
                  ? 'Edit Lesson (Updates IndexedDB & Offline Cache)'
                  : 'Create New Lesson (Saved Locally in IndexedDB)'}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Published lessons appear immediately in the Student Lesson Library and stay
                available offline.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                resetLessonForm();
                setShowLessonForm(false);
              }}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close lesson editor"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {formError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800"
            >
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="lesson-subject" className="block text-xs font-medium text-slate-700">
                Subject
              </label>
              <select
                id="lesson-subject"
                value={subjectId}
                onChange={(e) => handleSubjectChange(e.target.value as SubjectId)}
                className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
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
                className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
              >
                <option value={6}>Grade 6</option>
                <option value={7}>Grade 7</option>
                <option value={8}>Grade 8</option>
              </select>
            </div>

            <div>
              <label htmlFor="lesson-language" className="block text-xs font-medium text-slate-700">
                Lesson Language
              </label>
              <select
                id="lesson-language"
                value={lessonLanguage}
                onChange={(e) => handleLessonLanguageChange(e.target.value as LanguageCode)}
                className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
              >
                <option value="en">English</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="hi">हिन्दी (Hindi)</option>
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
                max={120}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="lesson-topic-preset"
                className="block text-xs font-medium text-slate-700"
              >
                Topic Area
              </label>
              <select
                id="lesson-topic-preset"
                value={selectedTopicPreset}
                onChange={(e) => handleTopicPresetChange(e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
              >
                <option value="custom">Custom Topic (Enter Below)</option>
                {subjectTopicOptions.map((def) => (
                  <option key={def.topicKey} value={def.topicKey}>
                    {def.label[lessonLanguage] || def.label.en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="lesson-topic" className="block text-xs font-medium text-slate-700">
                Topic Label
              </label>
              <input
                id="lesson-topic"
                type="text"
                required
                value={topicText}
                onChange={(e) => {
                  setTopicText(e.target.value);
                  if (selectedTopicPreset !== 'custom') {
                    const presetLabel =
                      TOPIC_DEFINITIONS[selectedTopicPreset]?.label[lessonLanguage] ?? '';
                    if (e.target.value.trim() !== presetLabel.trim()) {
                      setSelectedTopicPreset('custom');
                    }
                  }
                }}
                placeholder="e.g. Simple Interest or Geometry"
                className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
              />
            </div>
          </div>

          <div>
            <label htmlFor="lesson-title" className="block text-xs font-medium text-slate-700">
              Lesson Title
            </label>
            <input
              id="lesson-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Calculating Simple Interest for Farm Loans"
              className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
            />
          </div>

          <div>
            <label htmlFor="lesson-summary" className="block text-xs font-medium text-slate-700">
              Lesson Description
            </label>
            <input
              id="lesson-summary"
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Concise summary shown in the student lesson library"
              className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
            />
          </div>

          <div>
            <label htmlFor="lesson-body" className="block text-xs font-medium text-slate-700">
              Lesson Content
            </label>
            <textarea
              id="lesson-body"
              rows={6}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write clear classroom explanation, examples, and practice notes..."
              className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-sm leading-relaxed text-slate-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={savingLesson}
              className="min-h-[44px] rounded-lg bg-teal-700 px-5 py-2 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-50 whitespace-nowrap"
            >
              {savingLesson
                ? 'Saving...'
                : editingLessonId
                  ? 'Save Lesson Changes'
                  : 'Save & Publish Lesson'}
            </button>
            <button
              type="button"
              onClick={() => {
                resetLessonForm();
                setShowLessonForm(false);
              }}
              className="min-h-[44px] rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
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

      {/* Lessons Management Section */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Curriculum &amp; Teacher Lessons ({filteredLessons.length} of {lessons.length})
              </h3>
              <p className="text-xs text-slate-500 tabular-nums">
                {localCreatedCount} teacher-created in IndexedDB ·{' '}
                {lessons.length - localCreatedCount} core curriculum lessons
              </p>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSubjectFilter('all');
                  setTopicFilter('all');
                }}
                className="self-start text-xs font-semibold text-teal-700 hover:text-teal-800 whitespace-nowrap"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Search & Subject / Topic Filters */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, topic, or description..."
                aria-label="Search lessons"
                className="min-h-[40px] w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <select
                aria-label="Filter by subject"
                value={subjectFilter}
                onChange={(e) => {
                  setSubjectFilter(e.target.value as SubjectId | 'all');
                  setTopicFilter('all');
                }}
                className="min-h-[40px] w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800"
              >
                <option value="all">All Subjects</option>
                <option value="math">Mathematics</option>
                <option value="science">Science</option>
              </select>
            </div>

            <div>
              <select
                aria-label="Filter by topic"
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                className="min-h-[40px] w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800"
              >
                <option value="all">All Topics ({availableFilterTopics.length})</option>
                {availableFilterTopics.map((topicName) => (
                  <option key={topicName} value={topicName}>
                    {topicName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredLessons.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-600">
            No lessons match your current search or subject/topic filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="px-5 py-3">Lesson &amp; Topic</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Grade</th>
                  <th className="px-5 py-3">Size</th>
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLessons.map((lesson) => {
                  const isSampleId = lessonService.isSampleLessonId(lesson.id);
                  const isLocalRecord = lesson.origin === 'local';
                  const canDeleteOrRevert = isLocalRecord;
                  const isConfirmingDelete = confirmDeleteId === lesson.id;
                  const authoredLangLabel = lesson.authoredLanguage
                    ? LANGUAGE_LABELS[lesson.authoredLanguage]
                    : 'English / Kannada / Hindi';

                  return (
                    <React.Fragment key={lesson.id}>
                      <tr className="hover:bg-slate-50">
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-slate-900">
                            {pickLocalized(lesson.title, language)}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-500">
                            {pickLocalized(lesson.topic, language)} · {authoredLangLabel} ·{' '}
                            <span className="tabular-nums">{lesson.estimatedMinutes} min</span> ·{' '}
                            <span className="tabular-nums">
                              {questionCountByLesson.get(lesson.id) ?? 0} Qs
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                          {lesson.subjectId === 'math' ? 'Mathematics' : 'Science'}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 tabular-nums whitespace-nowrap">
                          Grade {lesson.grade}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-600 tabular-nums whitespace-nowrap">
                          {lesson.sizeKB} KB
                        </td>
                        <td className="px-5 py-3.5 text-xs whitespace-nowrap">
                          {!isSampleId ? (
                            <span className="font-medium text-teal-800">
                              Teacher Created (IndexedDB)
                            </span>
                          ) : isLocalRecord ? (
                            <span className="font-medium text-amber-800">
                              Edited Sample (IndexedDB)
                            </span>
                          ) : (
                            <span className="text-slate-500">Sample Curriculum</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              aria-label={`Edit ${pickLocalized(lesson.title, language)}`}
                              onClick={() => openEditForm(lesson)}
                              className="inline-flex min-h-[34px] items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                            >
                              <Pencil className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
                              Edit
                            </button>

                            {canDeleteOrRevert && (
                              <button
                                type="button"
                                aria-label={
                                  isSampleId
                                    ? `Revert ${pickLocalized(lesson.title, language)}`
                                    : `Delete ${pickLocalized(lesson.title, language)}`
                                }
                                onClick={() =>
                                  setConfirmDeleteId((prev) =>
                                    prev === lesson.id ? null : lesson.id
                                  )
                                }
                                className="inline-flex min-h-[34px] items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700 whitespace-nowrap"
                              >
                                {isSampleId ? (
                                  <>
                                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                                    Revert
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                    Delete
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {isConfirmingDelete && (
                        <tr className="bg-red-50/70">
                          <td colSpan={6} className="px-5 py-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div className="text-xs font-medium text-red-900">
                                {isSampleId
                                  ? `Revert "${pickLocalized(lesson.title, language)}" back to the original sample lesson? Local edits in IndexedDB will be removed.`
                                  : `Delete "${pickLocalized(lesson.title, language)}" permanently from IndexedDB and offline student cache?`}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  disabled={deletingId === lesson.id}
                                  onClick={() => handleConfirmedDelete(lesson)}
                                  className="min-h-[34px] rounded-md bg-red-700 px-3 py-1 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-50 whitespace-nowrap"
                                >
                                  {deletingId === lesson.id
                                    ? 'Removing...'
                                    : isSampleId
                                      ? 'Confirm Revert'
                                      : 'Confirm Delete'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="min-h-[34px] rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
