import React, { useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { usePathweave } from '../../context/PathweaveContext';
import { TOPIC_DEFINITIONS } from '../../modules/adaptive/adaptiveQuestionBank';
import { pickLocalized } from '../../modules/i18n/translations';
import { quizService, validateQuestionInput } from '../../modules/quiz/quizService';
import {
  DifficultyLevel,
  LanguageCode,
  Lesson,
  StoredQuizQuestion,
  SubjectId,
} from '../../types/domain';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: 'English',
  kn: 'ಕನ್ನಡ (Kannada)',
  hi: 'हिन्दी (Hindi)',
};

export const TeacherQuestionsView: React.FC = () => {
  const {
    language,
    messages,
    lessons,
    allQuestions,
    createLocalQuestion,
    updateLocalQuestion,
    removeLocalQuestion,
  } = usePathweave();

  const formRef = useRef<HTMLFormElement | null>(null);

  const mathLessons = useMemo(
    () => lessons.filter((l) => l.subjectId === 'math'),
    [lessons]
  );
  const scienceLessons = useMemo(
    () => lessons.filter((l) => l.subjectId === 'science'),
    [lessons]
  );

  // Create / Edit Question Form State
  const [showForm, setShowForm] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<SubjectId>('math');
  const [lessonId, setLessonId] = useState<string>(mathLessons[0]?.id ?? '');
  const [questionLanguage, setQuestionLanguage] = useState<LanguageCode>(language);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [selectedTopicPreset, setSelectedTopicPreset] = useState<string>('custom');
  const [topicText, setTopicText] = useState('');
  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [explanation, setExplanation] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Inline Delete / Revert Confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Search & Filter Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<SubjectId | 'all'>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [lessonFilter, setLessonFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'teacher' | 'sample'>('all');

  const lessonsById = useMemo(
    () => new Map<string, Lesson>(lessons.map((l) => [l.id, l])),
    [lessons]
  );

  const subjectLessons = subjectId === 'math' ? mathLessons : scienceLessons;

  const subjectTopicOptions = useMemo(
    () => Object.values(TOPIC_DEFINITIONS).filter((def) => def.subjectId === subjectId),
    [subjectId]
  );

  const availableTopicFilters = useMemo(() => {
    const names = new Set<string>();
    for (const q of allQuestions) {
      if (subjectFilter !== 'all' && q.subjectId !== subjectFilter) continue;
      const label = pickLocalized(q.topicLabel, language).trim();
      if (label) names.add(label);
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [allQuestions, language, subjectFilter]);

  const availableLessonFilters = useMemo(
    () =>
      lessons.filter((l) => (subjectFilter === 'all' ? true : l.subjectId === subjectFilter)),
    [lessons, subjectFilter]
  );

  const filteredQuestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allQuestions.filter((q) => {
      if (subjectFilter !== 'all' && q.subjectId !== subjectFilter) return false;
      const topicName = pickLocalized(q.topicLabel, language);
      if (topicFilter !== 'all' && topicName !== topicFilter) return false;
      if (lessonFilter !== 'all' && q.lessonId !== lessonFilter) return false;

      const isSample = quizService.isSampleQuestionId(q.id);
      if (sourceFilter === 'teacher' && isSample) return false;
      if (sourceFilter === 'sample' && !isSample) return false;

      if (!query) return true;
      const promptText = pickLocalized(q.prompt, language).toLowerCase();
      const explanationText = pickLocalized(q.explanation, language).toLowerCase();
      const relatedLessonTitle = q.lessonId
        ? pickLocalized(
            lessonsById.get(q.lessonId)?.title ?? { en: '', kn: '', hi: '' },
            language
          ).toLowerCase()
        : '';

      return (
        promptText.includes(query) ||
        topicName.toLowerCase().includes(query) ||
        explanationText.includes(query) ||
        relatedLessonTitle.includes(query)
      );
    });
  }, [
    allQuestions,
    language,
    lessonFilter,
    lessonsById,
    searchQuery,
    sourceFilter,
    subjectFilter,
    topicFilter,
  ]);

  // Group filtered questions cleanly by Subject -> Topic
  const groupedBySubjectAndTopic = useMemo(() => {
    const subjectsOrder: SubjectId[] = ['math', 'science'];
    const result: Array<{
      subjectId: SubjectId;
      subjectLabel: string;
      totalCount: number;
      topics: Array<{
        topicKey: string;
        topicLabel: string;
        questions: StoredQuizQuestion[];
      }>;
    }> = [];

    for (const subj of subjectsOrder) {
      const subjQuestions = filteredQuestions.filter((q) => q.subjectId === subj);
      if (subjQuestions.length === 0) continue;

      const topicMap = new Map<
        string,
        { topicLabel: string; questions: StoredQuizQuestion[] }
      >();

      for (const q of subjQuestions) {
        const label = pickLocalized(q.topicLabel, language);
        const groupKey = `${q.topicKey}::${label}`;
        const existingGroup = topicMap.get(groupKey) ?? {
          topicLabel: label,
          questions: [],
        };
        existingGroup.questions.push(q);
        topicMap.set(groupKey, existingGroup);
      }

      const topics = Array.from(topicMap.entries())
        .map(([topicKey, group]) => ({
          topicKey,
          topicLabel: group.topicLabel,
          questions: group.questions,
        }))
        .sort((a, b) => a.topicLabel.localeCompare(b.topicLabel));

      result.push({
        subjectId: subj,
        subjectLabel: subj === 'math' ? 'Mathematics' : 'Science',
        totalCount: subjQuestions.length,
        topics,
      });
    }

    return result;
  }, [filteredQuestions, language]);

  const teacherCreatedCount = useMemo(
    () => allQuestions.filter((q) => !quizService.isSampleQuestionId(q.id)).length,
    [allQuestions]
  );

  const syncTopicFromLesson = (chosenLessonId: string, lang: LanguageCode) => {
    const chosen = lessonsById.get(chosenLessonId);
    if (!chosen) return;
    const matchedPreset = Object.values(TOPIC_DEFINITIONS).find(
      (def) =>
        def.topicKey === chosen.topicKey ||
        def.lessonId === chosen.id ||
        def.label.en.toLowerCase() === chosen.topic.en.toLowerCase()
    );
    if (matchedPreset) {
      setSelectedTopicPreset(matchedPreset.topicKey);
      setTopicText(matchedPreset.label[lang] || matchedPreset.label.en);
    } else {
      setSelectedTopicPreset('custom');
      setTopicText(pickLocalized(chosen.topic, lang));
    }
  };

  const resetForm = () => {
    const defaultSubject: SubjectId = 'math';
    const defaultLesson = mathLessons[0] ?? lessons[0];
    setEditingQuestionId(null);
    setSubjectId(defaultSubject);
    setLessonId(defaultLesson?.id ?? '');
    setQuestionLanguage(language);
    setDifficulty('Medium');
    if (defaultLesson) {
      const matched = Object.values(TOPIC_DEFINITIONS).find(
        (def) => def.topicKey === defaultLesson.topicKey || def.lessonId === defaultLesson.id
      );
      if (matched) {
        setSelectedTopicPreset(matched.topicKey);
        setTopicText(matched.label[language] || matched.label.en);
      } else {
        setSelectedTopicPreset('custom');
        setTopicText(pickLocalized(defaultLesson.topic, language));
      }
    } else {
      setSelectedTopicPreset('custom');
      setTopicText('');
    }
    setPrompt('');
    setOptions(['', '', '', '']);
    setCorrectIndex(0);
    setExplanation('');
    setFormError(null);
  };

  const openCreateForm = () => {
    resetForm();
    setConfirmDeleteId(null);
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 30);
  };

  const openEditForm = (q: StoredQuizQuestion) => {
    const targetLang = q.language ?? language;
    const matchedPreset = Object.values(TOPIC_DEFINITIONS).find(
      (def) => def.topicKey === q.topicKey
    );
    const subjLessons = q.subjectId === 'math' ? mathLessons : scienceLessons;
    const resolvedLessonId =
      q.lessonId && lessonsById.has(q.lessonId)
        ? q.lessonId
        : matchedPreset?.lessonId && lessonsById.has(matchedPreset.lessonId)
          ? matchedPreset.lessonId
          : subjLessons[0]?.id ?? '';

    const normalizedOpts = [0, 1, 2, 3].map((idx) =>
      q.options[idx] ? pickLocalized(q.options[idx], targetLang) : ''
    );

    setEditingQuestionId(q.id);
    setSubjectId(q.subjectId);
    setLessonId(resolvedLessonId);
    setQuestionLanguage(targetLang);
    setDifficulty(q.difficulty ?? 'Medium');
    setSelectedTopicPreset(matchedPreset ? matchedPreset.topicKey : 'custom');
    setTopicText(pickLocalized(q.topicLabel, targetLang));
    setPrompt(pickLocalized(q.prompt, targetLang));
    setOptions(normalizedOpts);
    setCorrectIndex(
      q.correctIndex >= 0 && q.correctIndex < normalizedOpts.length ? q.correctIndex : 0
    );
    setExplanation(pickLocalized(q.explanation, targetLang));
    setFormError(null);
    setConfirmDeleteId(null);
    setShowForm(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 30);
  };

  const handleSubjectChange = (nextSubject: SubjectId) => {
    setSubjectId(nextSubject);
    const candidates = nextSubject === 'math' ? mathLessons : scienceLessons;
    const nextLesson = candidates[0];
    setLessonId(nextLesson?.id ?? '');
    if (nextLesson) {
      syncTopicFromLesson(nextLesson.id, questionLanguage);
    } else {
      setSelectedTopicPreset('custom');
      setTopicText('');
    }
  };

  const handleLessonChange = (nextLessonId: string) => {
    setLessonId(nextLessonId);
    syncTopicFromLesson(nextLessonId, questionLanguage);
  };

  const handleTopicPresetChange = (presetKey: string) => {
    setSelectedTopicPreset(presetKey);
    if (presetKey !== 'custom') {
      const def = TOPIC_DEFINITIONS[presetKey];
      if (def) {
        setTopicText(def.label[questionLanguage] || def.label.en);
      }
    }
  };

  const handleLanguageChange = (nextLang: LanguageCode) => {
    setQuestionLanguage(nextLang);
    if (selectedTopicPreset !== 'custom') {
      const def = TOPIC_DEFINITIONS[selectedTopicPreset];
      if (def) {
        setTopicText(def.label[nextLang] || def.label.en);
      }
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    setOptions((prev) => prev.map((item, idx) => (idx === index ? value : item)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const payload = {
      prompt,
      subjectId,
      topicKey: selectedTopicPreset !== 'custom' ? selectedTopicPreset : undefined,
      topicText,
      lessonId,
      difficulty,
      language: questionLanguage,
      options,
      correctIndex,
      explanation,
    };

    try {
      validateQuestionInput(payload);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Please complete all required fields.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      if (editingQuestionId) {
        const updated = await updateLocalQuestion(editingQuestionId, payload);
        setStatusNotice(
          `Updated question in "${pickLocalized(updated.topicLabel, language)}" and saved locally to IndexedDB.`
        );
      } else {
        const created = await createLocalQuestion(payload);
        setStatusNotice(
          `Added new question to "${pickLocalized(created.topicLabel, language)}" in IndexedDB (offline-ready & available for quiz assignments).`
        );
      }
      resetForm();
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to save question.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmedDelete = async (q: StoredQuizQuestion) => {
    if (deletingId) return;
    setDeletingId(q.id);
    try {
      const isSample = quizService.isSampleQuestionId(q.id);
      const topicLabel = pickLocalized(q.topicLabel, language);
      await removeLocalQuestion(q.id);
      if (editingQuestionId === q.id) {
        resetForm();
        setShowForm(false);
      }
      setConfirmDeleteId(null);
      setStatusNotice(
        isSample
          ? `Reverted "${topicLabel}" question back to the original curriculum bank version.`
          : `Deleted question from "${topicLabel}" in IndexedDB.`
      );
    } finally {
      setDeletingId(null);
    }
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    subjectFilter !== 'all' ||
    topicFilter !== 'all' ||
    lessonFilter !== 'all' ||
    sourceFilter !== 'all';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            {messages.teacher.questionManagement}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Create, edit, and organize lesson-linked multiple-choice questions stored offline in
            IndexedDB for adaptive learning and upcoming quiz assignments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showForm && !editingQuestionId) {
              setShowForm(false);
            } else {
              openCreateForm();
            }
          }}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {messages.teacher.addQuestion}
        </button>
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

      {/* Create / Edit Question Form */}
      {showForm && (
        <form
          ref={formRef}
          noValidate
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-6 space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {editingQuestionId
                  ? 'Edit Question (Saved Locally in IndexedDB)'
                  : 'Create New Question (Saved Locally in IndexedDB)'}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Questions are linked to a lesson, topic, and difficulty tier for offline quizzes and
                rule-based adaptive recommendations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              aria-label="Close question form"
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
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
              <label htmlFor="q-subject" className="block text-xs font-medium text-slate-700">
                Subject *
              </label>
              <select
                id="q-subject"
                value={subjectId}
                onChange={(e) => handleSubjectChange(e.target.value as SubjectId)}
                className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
              >
                <option value="math">Mathematics</option>
                <option value="science">Science</option>
              </select>
            </div>

            <div>
              <label htmlFor="q-lesson" className="block text-xs font-medium text-slate-700">
                Related Lesson *
              </label>
              <select
                id="q-lesson"
                value={lessonId}
                onChange={(e) => handleLessonChange(e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
              >
                {subjectLessons.length === 0 ? (
                  <option value="">No lessons available for subject</option>
                ) : (
                  subjectLessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {pickLocalized(lesson.title, questionLanguage)} (Gr {lesson.grade})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label htmlFor="q-difficulty" className="block text-xs font-medium text-slate-700">
                Adaptive Difficulty *
              </label>
              <select
                id="q-difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label htmlFor="q-language" className="block text-xs font-medium text-slate-700">
                Question Language
              </label>
              <select
                id="q-language"
                value={questionLanguage}
                onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
                className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
              >
                <option value="en">English</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="q-topic-preset" className="block text-xs font-medium text-slate-700">
                Topic Area
              </label>
              <select
                id="q-topic-preset"
                value={selectedTopicPreset}
                onChange={(e) => handleTopicPresetChange(e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
              >
                <option value="custom">Custom Topic (Use Topic Name Below)</option>
                {subjectTopicOptions.map((def) => (
                  <option key={def.topicKey} value={def.topicKey}>
                    {def.label[questionLanguage] || def.label.en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="q-topic-text" className="block text-xs font-medium text-slate-700">
                Topic Name *
              </label>
              <input
                id="q-topic-text"
                type="text"
                required
                value={topicText}
                onChange={(e) => {
                  setTopicText(e.target.value);
                  if (selectedTopicPreset !== 'custom') {
                    const presetLabel =
                      TOPIC_DEFINITIONS[selectedTopicPreset]?.label[questionLanguage] ?? '';
                    if (e.target.value.trim() !== presetLabel.trim()) {
                      setSelectedTopicPreset('custom');
                    }
                  }
                }}
                placeholder="e.g. Fractions & Decimals or Simple Interest"
                className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
              />
            </div>
          </div>

          <div>
            <label htmlFor="q-prompt" className="block text-xs font-medium text-slate-700">
              Question Text *
            </label>
            <textarea
              id="q-prompt"
              rows={3}
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Write a clear question for students..."
              className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-sm leading-relaxed text-slate-900"
            />
          </div>

          {/* Multiple-Choice Options & Correct Answer */}
          <fieldset className="space-y-3">
            <legend className="text-xs font-medium text-slate-700">
              Multiple-Choice Options * (Select the radio button for the correct answer)
            </legend>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {options.map((optValue, idx) => {
                const isCorrect = correctIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-lg border p-3 transition-colors ${
                      isCorrect
                        ? 'border-teal-600 bg-teal-50/50'
                        : 'border-slate-200 bg-slate-50/40'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <label
                        htmlFor={`q-option-${idx}`}
                        className="text-xs font-semibold text-slate-700"
                      >
                        Option {OPTION_LETTERS[idx]}
                      </label>
                      <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-700">
                        <input
                          type="radio"
                          name="correct-answer-option"
                          checked={isCorrect}
                          onChange={() => setCorrectIndex(idx)}
                          className="h-4 w-4 accent-teal-700"
                        />
                        <span className={isCorrect ? 'font-semibold text-teal-800' : ''}>
                          Correct answer
                        </span>
                      </label>
                    </div>

                    <input
                      id={`q-option-${idx}`}
                      type="text"
                      required
                      value={optValue}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Enter option ${OPTION_LETTERS[idx]}`}
                      className="min-h-[40px] w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900"
                    />
                  </div>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label htmlFor="q-explanation" className="block text-xs font-medium text-slate-700">
              Explanation (Optional)
            </label>
            <textarea
              id="q-explanation"
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Optional step-by-step explanation shown to students after answering..."
              className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="min-h-[44px] rounded-lg bg-teal-700 px-5 py-2 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-50 whitespace-nowrap"
            >
              {saving
                ? 'Saving...'
                : editingQuestionId
                  ? 'Save Question Changes'
                  : 'Save Question Locally'}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              className="min-h-[44px] rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search & Filter Toolbar */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <ClipboardList className="h-4 w-4 text-teal-700" aria-hidden="true" />
              Question Bank ({filteredQuestions.length} of {allQuestions.length})
            </h3>
            <p className="text-xs text-slate-500 tabular-nums">
              {teacherCreatedCount} teacher-created in IndexedDB ·{' '}
              {allQuestions.length - teacherCreatedCount} core curriculum &amp; adaptive questions
            </p>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSubjectFilter('all');
                setTopicFilter('all');
                setLessonFilter('all');
                setSourceFilter('all');
              }}
              className="self-start text-xs font-semibold text-teal-700 hover:text-teal-800 whitespace-nowrap"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search question text, topic, or lesson..."
              aria-label="Search questions"
              className="min-h-[40px] w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <select
            aria-label="Filter by subject"
            value={subjectFilter}
            onChange={(e) => {
              setSubjectFilter(e.target.value as SubjectId | 'all');
              setTopicFilter('all');
              setLessonFilter('all');
            }}
            className="min-h-[40px] w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800"
          >
            <option value="all">All Subjects</option>
            <option value="math">Mathematics</option>
            <option value="science">Science</option>
          </select>

          <select
            aria-label="Filter by topic"
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="min-h-[40px] w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800"
          >
            <option value="all">All Topics ({availableTopicFilters.length})</option>
            {availableTopicFilters.map((topicName) => (
              <option key={topicName} value={topicName}>
                {topicName}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by source or lesson"
            value={lessonFilter !== 'all' ? `lesson:${lessonFilter}` : `source:${sourceFilter}`}
            onChange={(e) => {
              const val = e.target.value;
              if (val.startsWith('lesson:')) {
                setLessonFilter(val.slice(7));
                setSourceFilter('all');
              } else {
                setLessonFilter('all');
                setSourceFilter(val.slice(7) as 'all' | 'teacher' | 'sample');
              }
            }}
            className="min-h-[40px] w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800"
          >
            <option value="source:all">All Sources &amp; Lessons</option>
            <option value="source:teacher">Teacher Created Only ({teacherCreatedCount})</option>
            <option value="source:sample">Sample &amp; Adaptive Bank</option>
            {availableLessonFilters.map((lesson) => (
              <option key={lesson.id} value={`lesson:${lesson.id}`}>
                Lesson: {pickLocalized(lesson.title, language)}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Questions Grouped by Subject and Topic */}
      {groupedBySubjectAndTopic.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          No questions match your current search or filters.
        </div>
      ) : (
        <div className="space-y-8">
          {groupedBySubjectAndTopic.map((subjectGroup) => (
            <section
              key={subjectGroup.subjectId}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {subjectGroup.subjectLabel}
                  </h3>
                  <p className="text-xs text-slate-500 tabular-nums">
                    {subjectGroup.topics.length} topic(s) · {subjectGroup.totalCount} question(s)
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-200">
                {subjectGroup.topics.map((topicGroup) => (
                  <div key={topicGroup.topicKey} className="p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <h4 className="text-sm font-semibold text-slate-900">
                        {topicGroup.topicLabel}
                      </h4>
                      <span className="font-mono text-xs text-slate-500 tabular-nums">
                        {topicGroup.questions.length} question(s)
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {topicGroup.questions.map((question) => {
                        const isSample = quizService.isSampleQuestionId(question.id);
                        const isLocalEdit = question.origin === 'local';
                        const relatedLesson = question.lessonId
                          ? lessonsById.get(question.lessonId)
                          : undefined;
                        const explanationText = pickLocalized(question.explanation, language).trim();
                        const isConfirmingDelete = confirmDeleteId === question.id;

                        return (
                          <div key={question.id} className="py-4 first:pt-1 last:pb-1 space-y-3">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="space-y-1.5 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                  <span className="font-semibold text-slate-700">
                                    {question.difficulty}
                                  </span>
                                  <span aria-hidden="true">·</span>
                                  <span>
                                    {relatedLesson
                                      ? pickLocalized(relatedLesson.title, language)
                                      : question.lessonId
                                        ? 'Linked Lesson (Removed)'
                                        : 'General Subject Bank'}
                                  </span>
                                  <span aria-hidden="true">·</span>
                                  <span>{LANGUAGE_LABELS[question.language ?? 'en']}</span>
                                  <span aria-hidden="true">·</span>
                                  {!isSample ? (
                                    <span className="font-medium text-teal-800">
                                      Teacher Created (IndexedDB)
                                    </span>
                                  ) : isLocalEdit ? (
                                    <span className="font-medium text-amber-800">
                                      Edited Bank Question (IndexedDB)
                                    </span>
                                  ) : question.id.startsWith('aq-') ? (
                                    <span>Adaptive Bank</span>
                                  ) : (
                                    <span>Curriculum Quiz Bank</span>
                                  )}
                                </div>

                                <p className="text-sm font-medium text-slate-900">
                                  {pickLocalized(question.prompt, language)}
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  aria-label={`Edit question: ${pickLocalized(question.prompt, language)}`}
                                  onClick={() => openEditForm(question)}
                                  className="inline-flex min-h-[34px] items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                                >
                                  <Pencil className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
                                  Edit
                                </button>

                                {(!isSample || isLocalEdit) && (
                                  <button
                                    type="button"
                                    aria-label={
                                      isSample
                                        ? `Revert question: ${pickLocalized(question.prompt, language)}`
                                        : `Delete question: ${pickLocalized(question.prompt, language)}`
                                    }
                                    onClick={() =>
                                      setConfirmDeleteId((prev) =>
                                        prev === question.id ? null : question.id
                                      )
                                    }
                                    className="inline-flex min-h-[34px] items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700 whitespace-nowrap"
                                  >
                                    {isSample ? (
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
                            </div>

                            {/* Options List */}
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                              {question.options.map((opt, idx) => {
                                const isAnswer = idx === question.correctIndex;
                                return (
                                  <div
                                    key={idx}
                                    className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs ${
                                      isAnswer
                                        ? 'border-emerald-300 bg-emerald-50/70 text-emerald-950 font-medium'
                                        : 'border-slate-200 bg-slate-50/50 text-slate-700'
                                    }`}
                                  >
                                    <span>
                                      <span className="font-mono font-semibold mr-1.5">
                                        {OPTION_LETTERS[idx]}.
                                      </span>
                                      {pickLocalized(opt, language)}
                                    </span>
                                    {isAnswer && (
                                      <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold whitespace-nowrap shrink-0">
                                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                        Correct
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {explanationText && (
                              <div className="text-xs text-slate-600">
                                <span className="font-semibold text-slate-700">Explanation: </span>
                                {explanationText}
                              </div>
                            )}

                            {isConfirmingDelete && (
                              <div className="rounded-lg border border-red-200 bg-red-50/80 px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-xs font-medium text-red-900">
                                  {isSample
                                    ? 'Revert this question back to the original curriculum version? Local edits in IndexedDB will be removed.'
                                    : 'Delete this question permanently from IndexedDB? Existing historical quiz attempt scores remain preserved.'}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    disabled={deletingId === question.id}
                                    onClick={() => handleConfirmedDelete(question)}
                                    className="min-h-[34px] rounded-md bg-red-700 px-3 py-1 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-50 whitespace-nowrap"
                                  >
                                    {deletingId === question.id
                                      ? 'Removing...'
                                      : isSample
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
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
