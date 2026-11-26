import {
  DifficultyLevel,
  LanguageCode,
  LocalizedText,
  Quiz,
  QuizAttemptRecord,
  StoredQuizQuestion,
  SubjectId,
} from '../../types/domain';
import {
  ADAPTIVE_QUESTION_BANK,
  getTopicDefinition,
  normalizeTopicKey,
  TOPIC_DEFINITIONS,
} from '../adaptive/adaptiveQuestionBank';
import { createUniqueId, storageService } from '../storage/storageService';
import { SAMPLE_QUIZZES } from './sampleQuizzes';

export interface QuestionMutationInput {
  prompt: string;
  subjectId: SubjectId;
  topicKey?: string;
  topicText: string;
  lessonId: string;
  difficulty?: DifficultyLevel;
  language: LanguageCode;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

const ALL_LANGUAGES: LanguageCode[] = ['en', 'kn', 'hi'];

function stableTextHash(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function slugifyTopicKey(topicText: string): string {
  const trimmed = topicText.trim();
  const asciiSlug = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (asciiSlug.length >= 2) {
    return asciiSlug;
  }
  return `custom_topic_${stableTextHash(trimmed.toLowerCase())}`;
}

function buildLocalizedFromSingleLanguage(
  value: string,
  language: LanguageCode,
  existing?: LocalizedText
): LocalizedText {
  const trimmed = value.trim();
  if (!existing) {
    return {
      en: trimmed,
      kn: trimmed,
      hi: trimmed,
    };
  }
  const isMonolingual = existing.en === existing.kn && existing.kn === existing.hi;
  if (isMonolingual || existing.en === '') {
    return {
      en: trimmed,
      kn: trimmed,
      hi: trimmed,
    };
  }
  return {
    ...existing,
    [language]: trimmed,
  };
}

function resolveTopicMetadata(
  topicKeyInput: string | undefined,
  topicTextInput: string,
  language: LanguageCode,
  existingLabel?: LocalizedText
): {
  topicKey: string;
  topicLabel: LocalizedText;
  prerequisiteTopicKey?: string;
  prerequisiteTopicLabel?: LocalizedText;
} {
  const trimmedTopic = topicTextInput.trim();
  if (topicKeyInput) {
    const def = getTopicDefinition(topicKeyInput);
    if (
      def &&
      (def.label[language].toLowerCase() === trimmedTopic.toLowerCase() ||
        def.label.en.toLowerCase() === trimmedTopic.toLowerCase())
    ) {
      return {
        topicKey: def.topicKey,
        topicLabel: def.label,
        prerequisiteTopicKey: def.prerequisiteTopicKey,
        prerequisiteTopicLabel: def.prerequisiteTopicLabel,
      };
    }
  }

  const matchedByName = Object.values(TOPIC_DEFINITIONS).find(
    (def) =>
      def.label.en.toLowerCase() === trimmedTopic.toLowerCase() ||
      def.label.kn.toLowerCase() === trimmedTopic.toLowerCase() ||
      def.label.hi.toLowerCase() === trimmedTopic.toLowerCase()
  );
  if (matchedByName) {
    return {
      topicKey: matchedByName.topicKey,
      topicLabel: matchedByName.label,
      prerequisiteTopicKey: matchedByName.prerequisiteTopicKey,
      prerequisiteTopicLabel: matchedByName.prerequisiteTopicLabel,
    };
  }

  return {
    topicKey: slugifyTopicKey(trimmedTopic),
    topicLabel: buildLocalizedFromSingleLanguage(trimmedTopic, language, existingLabel),
  };
}

export function validateQuestionInput(input: QuestionMutationInput): {
  prompt: string;
  topicText: string;
  lessonId: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: DifficultyLevel;
} {
  const prompt = input.prompt.trim();
  if (!prompt) {
    throw new Error('Question text is required.');
  }

  if (input.subjectId !== 'math' && input.subjectId !== 'science') {
    throw new Error('Subject must be Mathematics or Science.');
  }

  const topicText = input.topicText.trim();
  if (!topicText) {
    throw new Error('Topic is required.');
  }

  const lessonId = input.lessonId.trim();
  if (!lessonId) {
    throw new Error('Related lesson is required.');
  }

  const options = input.options.map((opt) => opt.trim());
  if (options.length < 2) {
    throw new Error('At least 2 multiple-choice options are required.');
  }
  if (options.some((opt) => opt.length === 0)) {
    throw new Error('All multiple-choice option fields must be filled in.');
  }

  const uniqueNormalized = new Set(options.map((opt) => opt.toLowerCase()));
  if (uniqueNormalized.size !== options.length) {
    throw new Error('Multiple-choice options must be distinct.');
  }

  if (
    !Number.isInteger(input.correctIndex) ||
    input.correctIndex < 0 ||
    input.correctIndex >= options.length
  ) {
    throw new Error('Please select a valid correct answer option.');
  }

  const difficulty: DifficultyLevel = input.difficulty ?? 'Medium';
  const explanation = (input.explanation ?? '').trim();

  return {
    prompt,
    topicText,
    lessonId,
    options,
    correctIndex: input.correctIndex,
    explanation,
    difficulty,
  };
}

class QuizService {
  private getSeededQuestionById(questionId: string): StoredQuizQuestion | undefined {
    for (const quiz of SAMPLE_QUIZZES) {
      const idx = quiz.questions.findIndex((q) => q.id === questionId);
      if (idx >= 0) {
        const question = quiz.questions[idx];
        const def = getTopicDefinition(question.topicKey);
        return {
          ...question,
          quizId: quiz.id,
          subjectId: quiz.subjectId,
          orderIndex: idx,
          lessonId: def?.lessonId ?? quiz.lessonId,
          origin: 'sample',
        };
      }
    }
    const adaptiveMatch = ADAPTIVE_QUESTION_BANK.find((q) => q.id === questionId);
    if (adaptiveMatch) {
      const def = getTopicDefinition(adaptiveMatch.topicKey);
      return {
        ...adaptiveMatch,
        lessonId: def?.lessonId,
        origin: 'sample',
      };
    }
    return undefined;
  }

  isSampleQuestionId(questionId: string): boolean {
    return Boolean(this.getSeededQuestionById(questionId));
  }

  async ensureQuizzesSeeded(): Promise<Quiz[]> {
    const adapter = await storageService.getAdapter();
    const [existingQuizzes, existingQuestions] = await Promise.all([
      adapter.getAll<Quiz>('quizzes'),
      adapter.getAll<StoredQuizQuestion>('quizQuestions'),
    ]);

    const existingQuizById = new Map(existingQuizzes.map((q) => [q.id, q]));
    const existingQuestionById = new Map(existingQuestions.map((q) => [q.id, q]));

    // Seed or upgrade standard sample quizzes non-destructively (never overwrite teacher local edits)
    const quizWrites: Promise<void>[] = [];
    const questionWrites: Promise<void>[] = [];

    for (const quiz of SAMPLE_QUIZZES) {
      const storedQuiz = existingQuizById.get(quiz.id);
      const needsQuizUpgrade =
        !storedQuiz || storedQuiz.questions.some((q) => !('difficulty' in q) || !q.difficulty);
      if (needsQuizUpgrade) {
        quizWrites.push(adapter.put('quizzes', quiz.id, quiz));
      }

      quiz.questions.forEach((question, idx) => {
        const def = getTopicDefinition(question.topicKey);
        const storedQ: StoredQuizQuestion = {
          ...question,
          quizId: quiz.id,
          subjectId: quiz.subjectId,
          orderIndex: idx,
          lessonId: def?.lessonId ?? quiz.lessonId,
          origin: 'sample',
        };
        const existingQ = existingQuestionById.get(storedQ.id);
        if (
          !existingQ ||
          (existingQ.origin !== 'local' &&
            (!existingQ.difficulty ||
              existingQ.topicKey !== storedQ.topicKey ||
              !existingQ.lessonId ||
              !existingQ.origin))
        ) {
          questionWrites.push(adapter.put('quizQuestions', storedQ.id, storedQ));
        }
      });
    }

    // Seed or upgrade full deterministic adaptive question bank into IndexedDB
    for (const bankQuestion of ADAPTIVE_QUESTION_BANK) {
      const def = getTopicDefinition(bankQuestion.topicKey);
      const enrichedBankQuestion: StoredQuizQuestion = {
        ...bankQuestion,
        lessonId: def?.lessonId,
        origin: 'sample',
      };
      const existingQ = existingQuestionById.get(bankQuestion.id);
      if (
        !existingQ ||
        (existingQ.origin !== 'local' &&
          (!existingQ.difficulty ||
            !existingQ.languages ||
            !existingQ.lessonId ||
            !existingQ.origin))
      ) {
        questionWrites.push(adapter.put('quizQuestions', bankQuestion.id, enrichedBankQuestion));
      }
    }

    if (quizWrites.length > 0 || questionWrites.length > 0) {
      await Promise.all([...quizWrites, ...questionWrites]);
    }

    const [updatedQuizzes, updatedQuestions] = await Promise.all([
      adapter.getAll<Quiz>('quizzes'),
      adapter.getAll<StoredQuizQuestion>('quizQuestions'),
    ]);

    return this.assembleQuizzesFromDb(updatedQuizzes, updatedQuestions);
  }

  private assembleQuizzesFromDb(quizzes: Quiz[], questions: StoredQuizQuestion[]): Quiz[] {
    const orderById = new Map(SAMPLE_QUIZZES.map((q, idx) => [q.id, idx]));
    return quizzes
      .filter((q) => !q.isAdaptiveExercise)
      .sort((a, b) => (orderById.get(a.id) ?? 99) - (orderById.get(b.id) ?? 99))
      .map((quiz) => {
        const matched = questions
          .filter((q) => q.quizId === quiz.id)
          .sort((a, b) => a.orderIndex - b.orderIndex);
        return {
          ...quiz,
          questions: matched.length > 0 ? matched : quiz.questions,
        };
      });
  }

  async getQuizzesFromDb(): Promise<Quiz[]> {
    return this.ensureQuizzesSeeded();
  }

  async getAllQuestionsFromDb(): Promise<StoredQuizQuestion[]> {
    await this.ensureQuizzesSeeded();
    const adapter = await storageService.getAdapter();
    const questions = await adapter.getAll<StoredQuizQuestion>('quizQuestions');
    return questions.sort((a, b) => {
      const aLocal = a.origin === 'local' && !this.isSampleQuestionId(a.id) ? 0 : 1;
      const bLocal = b.origin === 'local' && !this.isSampleQuestionId(b.id) ? 0 : 1;
      if (aLocal !== bLocal) return aLocal - bLocal;
      if (aLocal === 0 && bLocal === 0) {
        return (
          new Date(b.updatedAt ?? b.createdAt ?? 0).getTime() -
          new Date(a.updatedAt ?? a.createdAt ?? 0).getTime()
        );
      }
      if (a.subjectId !== b.subjectId) return a.subjectId.localeCompare(b.subjectId);
      if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
      return a.id.localeCompare(b.id);
    });
  }

  async getQuestionsForLesson(lessonId: string): Promise<StoredQuizQuestion[]> {
    const all = await this.getAllQuestionsFromDb();
    return all.filter((q) => q.lessonId === lessonId);
  }

  async getQuestionsForTopic(topicKey: string): Promise<StoredQuizQuestion[]> {
    const normalized = normalizeTopicKey(topicKey);
    const all = await this.getAllQuestionsFromDb();
    return all.filter((q) => normalizeTopicKey(q.topicKey) === normalized);
  }

  async createLocalQuestion(input: QuestionMutationInput): Promise<StoredQuizQuestion> {
    const validated = validateQuestionInput(input);
    const adapter = await storageService.getAdapter();
    const existing = await adapter.getAll<StoredQuizQuestion>('quizQuestions');
    const maxOrder = existing.reduce((max, q) => Math.max(max, q.orderIndex ?? 0), 0);

    const topicMeta = resolveTopicMetadata(
      input.topicKey,
      validated.topicText,
      input.language
    );
    const now = new Date().toISOString();
    const id = createUniqueId(`tq-${input.subjectId}`);

    const newQuestion: StoredQuizQuestion = {
      id,
      quizId: 'teacher-bank',
      subjectId: input.subjectId,
      lessonId: validated.lessonId,
      orderIndex: maxOrder + 1,
      topicKey: topicMeta.topicKey,
      topicLabel: topicMeta.topicLabel,
      difficulty: validated.difficulty,
      language: input.language,
      languages: ALL_LANGUAGES,
      prompt: buildLocalizedFromSingleLanguage(validated.prompt, input.language),
      options: validated.options.map((opt) =>
        buildLocalizedFromSingleLanguage(opt, input.language)
      ),
      correctIndex: validated.correctIndex,
      explanation: validated.explanation
        ? buildLocalizedFromSingleLanguage(validated.explanation, input.language)
        : { en: '', kn: '', hi: '' },
      prerequisiteTopicKey: topicMeta.prerequisiteTopicKey,
      prerequisiteTopicLabel: topicMeta.prerequisiteTopicLabel,
      origin: 'local',
      createdAt: now,
      updatedAt: now,
    };

    await adapter.put('quizQuestions', newQuestion.id, newQuestion);
    return newQuestion;
  }

  async updateLocalQuestion(
    questionId: string,
    input: QuestionMutationInput
  ): Promise<StoredQuizQuestion> {
    const validated = validateQuestionInput(input);
    const adapter = await storageService.getAdapter();
    const existing = await adapter.get<StoredQuizQuestion>('quizQuestions', questionId);
    if (!existing) {
      throw new Error(`Question ${questionId} could not be found in local storage.`);
    }

    const topicMeta = resolveTopicMetadata(
      input.topicKey,
      validated.topicText,
      input.language,
      existing.topicLabel
    );
    const now = new Date().toISOString();

    const updatedQuestion: StoredQuizQuestion = {
      ...existing,
      subjectId: input.subjectId,
      lessonId: validated.lessonId,
      topicKey: topicMeta.topicKey,
      topicLabel: topicMeta.topicLabel,
      difficulty: validated.difficulty,
      language: input.language,
      languages: existing.languages?.length ? existing.languages : ALL_LANGUAGES,
      prompt: buildLocalizedFromSingleLanguage(validated.prompt, input.language, existing.prompt),
      options: validated.options.map((opt, idx) =>
        buildLocalizedFromSingleLanguage(opt, input.language, existing.options[idx])
      ),
      correctIndex: validated.correctIndex,
      explanation: validated.explanation
        ? buildLocalizedFromSingleLanguage(
            validated.explanation,
            input.language,
            existing.explanation
          )
        : { en: '', kn: '', hi: '' },
      prerequisiteTopicKey: topicMeta.prerequisiteTopicKey,
      prerequisiteTopicLabel: topicMeta.prerequisiteTopicLabel,
      origin: 'local',
      createdAt: existing.createdAt ?? now,
      updatedAt: now,
    };

    await adapter.put('quizQuestions', updatedQuestion.id, updatedQuestion);

    // Sync embedded quiz question if part of a stored quiz
    if (existing.quizId && existing.quizId !== 'teacher-bank') {
      const parentQuiz = await adapter.get<Quiz>('quizzes', existing.quizId);
      if (parentQuiz) {
        const nextQuestions = parentQuiz.questions.map((q) =>
          q.id === updatedQuestion.id ? updatedQuestion : q
        );
        await adapter.put('quizzes', parentQuiz.id, {
          ...parentQuiz,
          questions: nextQuestions,
        });
      }
    }

    return updatedQuestion;
  }

  async deleteLocalQuestion(questionId: string): Promise<void> {
    const adapter = await storageService.getAdapter();
    const seededOriginal = this.getSeededQuestionById(questionId);

    if (seededOriginal) {
      // Revert locally edited sample/adaptive question back to canonical seeded definition
      await adapter.put('quizQuestions', seededOriginal.id, seededOriginal);
      if (seededOriginal.quizId) {
        const parentQuiz = await adapter.get<Quiz>('quizzes', seededOriginal.quizId);
        if (parentQuiz) {
          const nextQuestions = parentQuiz.questions.map((q) =>
            q.id === seededOriginal.id ? seededOriginal : q
          );
          await adapter.put('quizzes', parentQuiz.id, {
            ...parentQuiz,
            questions: nextQuestions,
          });
        }
      }
      return;
    }

    const existing = await adapter.get<StoredQuizQuestion>('quizQuestions', questionId);
    await adapter.delete('quizQuestions', questionId);

    if (existing?.quizId && existing.quizId !== 'teacher-bank') {
      const parentQuiz = await adapter.get<Quiz>('quizzes', existing.quizId);
      if (parentQuiz) {
        await adapter.put('quizzes', parentQuiz.id, {
          ...parentQuiz,
          questions: parentQuiz.questions.filter((q) => q.id !== questionId),
        });
      }
    }
  }

  getQuizzes(): Quiz[] {
    return SAMPLE_QUIZZES;
  }

  async getQuizByIdFromDb(quizId: string): Promise<Quiz | undefined> {
    const quizzes = await this.getQuizzesFromDb();
    return quizzes.find((q) => q.id === quizId);
  }

  async submitQuizAttempt(
    quiz: Quiz,
    studentId: string,
    answers: Record<string, number>
  ): Promise<QuizAttemptRecord> {
    const topicResults = quiz.questions.map((question) => {
      const selected = answers[question.id];
      const correct = selected === question.correctIndex;
      return {
        questionId: question.id,
        topicKey: normalizeTopicKey(question.topicKey),
        topicLabel: question.topicLabel,
        difficulty: question.difficulty ?? quiz.targetDifficulty ?? 'Medium',
        correct,
      };
    });

    const score = topicResults.filter((r) => r.correct).length;
    const totalQuestions = quiz.questions.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    const record: QuizAttemptRecord = {
      id: createUniqueId('attempt'),
      quizId: quiz.id,
      subjectId: quiz.subjectId,
      studentId,
      score,
      totalQuestions,
      percentage,
      answers: { ...answers },
      topicResults,
      submittedAt: new Date().toISOString(),
      mode: quiz.isAdaptiveExercise ? 'adaptive_practice' : 'standard_quiz',
      targetDifficulty: quiz.targetDifficulty,
    };

    const adapter = await storageService.getAdapter();
    await adapter.put('quizAttempts', record.id, record);
    return record;
  }

  async getAttemptsForStudent(studentId: string): Promise<QuizAttemptRecord[]> {
    const adapter = await storageService.getAdapter();
    const all = await adapter.getAll<QuizAttemptRecord>('quizAttempts');
    return all
      .filter((a) => a.studentId === studentId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  async getAllAttempts(): Promise<QuizAttemptRecord[]> {
    const adapter = await storageService.getAdapter();
    const all = await adapter.getAll<QuizAttemptRecord>('quizAttempts');
    return all.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }
}

export const quizService = new QuizService();
