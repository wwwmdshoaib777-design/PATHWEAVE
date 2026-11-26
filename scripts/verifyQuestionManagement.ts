import assert from 'node:assert/strict';
import { adaptiveService } from '../src/modules/adaptive/adaptiveService';
import { lessonService } from '../src/modules/curriculum/lessonService';
import { quizService, slugifyTopicKey, validateQuestionInput } from '../src/modules/quiz/quizService';
import { ALL_STORES, StorageAdapter, StoreName } from '../src/modules/storage/StorageAdapter';
import { storageService } from '../src/modules/storage/storageService';
import { Quiz, StoredQuizQuestion } from '../src/types/domain';

class InMemoryStorageAdapter implements StorageAdapter {
  readonly engineName = 'IndexedDB' as const;
  private stores = new Map<StoreName, Map<string, unknown>>();

  async init(): Promise<void> {
    for (const store of ALL_STORES) {
      if (!this.stores.has(store)) {
        this.stores.set(store, new Map());
      }
    }
  }

  async get<T>(store: StoreName, key: string): Promise<T | undefined> {
    return this.stores.get(store)?.get(key) as T | undefined;
  }

  async getAll<T>(store: StoreName): Promise<T[]> {
    return Array.from(this.stores.get(store)?.values() ?? []) as T[];
  }

  async put<T>(store: StoreName, key: string, value: T): Promise<void> {
    if (!this.stores.has(store)) {
      this.stores.set(store, new Map());
    }
    this.stores.get(store)!.set(key, structuredClone(value));
  }

  async delete(store: StoreName, key: string): Promise<void> {
    this.stores.get(store)?.delete(key);
  }

  async clear(store: StoreName): Promise<void> {
    this.stores.get(store)?.clear();
  }

  async count(store: StoreName): Promise<number> {
    return this.stores.get(store)?.size ?? 0;
  }
}

async function runTests() {
  const db = new InMemoryStorageAdapter();
  await db.init();
  storageService.setAdapterForTesting(db);

  // 1. Seed existing curriculum, quizzes, and 83-question adaptive bank
  await lessonService.ensureSubjectsSeeded();
  await quizService.ensureQuizzesSeeded();
  const initialQuestions = await quizService.getAllQuestionsFromDb();
  assert.ok(initialQuestions.length >= 83, `Expected at least 83 seeded questions, got ${initialQuestions.length}`);

  // 2. Validate required field checks and error handling
  assert.throws(
    () =>
      validateQuestionInput({
        prompt: '   ',
        subjectId: 'math',
        topicText: 'Fractions',
        lessonId: 'math-fractions-01',
        language: 'en',
        options: ['1', '2', '3', '4'],
        correctIndex: 0,
      }),
    /Question text is required/
  );

  assert.throws(
    () =>
      validateQuestionInput({
        prompt: 'What is 1/2 + 1/4?',
        subjectId: 'math',
        topicText: '  ',
        lessonId: 'math-fractions-01',
        language: 'en',
        options: ['1/4', '2/4', '3/4', '1'],
        correctIndex: 2,
      }),
    /Topic is required/
  );

  assert.throws(
    () =>
      validateQuestionInput({
        prompt: 'What is 1/2 + 1/4?',
        subjectId: 'math',
        topicText: 'Fractions',
        lessonId: '',
        language: 'en',
        options: ['1/4', '2/4', '3/4', '1'],
        correctIndex: 2,
      }),
    /Related lesson is required/
  );

  assert.throws(
    () =>
      validateQuestionInput({
        prompt: 'What is 1/2 + 1/4?',
        subjectId: 'math',
        topicText: 'Fractions',
        lessonId: 'math-fractions-01',
        language: 'en',
        options: ['1/4', '', '3/4', '1'],
        correctIndex: 2,
      }),
    /All multiple-choice option fields/
  );

  assert.throws(
    () =>
      validateQuestionInput({
        prompt: 'What is 1/2 + 1/4?',
        subjectId: 'math',
        topicText: 'Fractions',
        lessonId: 'math-fractions-01',
        language: 'en',
        options: ['Three Quarters', 'three quarters', '1/2', '1/4'],
        correctIndex: 0,
      }),
    /must be distinct/
  );

  assert.throws(
    () =>
      validateQuestionInput({
        prompt: 'What is 1/2 + 1/4?',
        subjectId: 'math',
        topicText: 'Fractions',
        lessonId: 'math-fractions-01',
        language: 'en',
        options: ['1/4', '2/4', '3/4', '1'],
        correctIndex: 5,
      }),
    /valid correct answer/
  );

  // Verify non-ASCII custom topics generate distinct deterministic slugs
  const knSlug1 = slugifyTopicKey('ಸರಳ ಬಡ್ಡಿ');
  const knSlug2 = slugifyTopicKey('ಕ್ಷೇತ್ರಫಲ ಮತ್ತು ಸುತ್ತಳತೆ');
  assert.ok(knSlug1.startsWith('custom_topic_'));
  assert.ok(knSlug2.startsWith('custom_topic_'));
  assert.notEqual(knSlug1, knSlug2, 'Distinct Kannada custom topics must not collide');

  // 3. Create a teacher-owned lesson and create teacher questions (with and without explanation)
  const localLesson = await lessonService.createLocalLesson({
    subjectId: 'math',
    grade: 7,
    topicText: 'Simple Interest',
    title: 'Calculating Simple Interest for Village Savings',
    description: 'Learn P * R * T / 100 using real cooperative society examples.',
    content: 'Simple Interest = (Principal × Rate × Time) / 100.',
    language: 'en',
    estimatedMinutes: 20,
  });

  const qCustomNoExplanation = await quizService.createLocalQuestion({
    prompt: 'What is the simple interest on Rs 1000 at 5% per year for 2 years?',
    subjectId: 'math',
    topicText: 'Simple Interest',
    lessonId: localLesson.id,
    difficulty: 'Easy',
    language: 'en',
    options: ['Rs 50', 'Rs 100', 'Rs 150', 'Rs 200'],
    correctIndex: 1,
    explanation: '',
  });

  const qCustomWithExplanation = await quizService.createLocalQuestion({
    prompt: 'If Principal is Rs 500, Rate is 10% and Time is 1 year, what is the interest?',
    subjectId: 'math',
    topicText: 'Simple Interest',
    lessonId: localLesson.id,
    difficulty: 'Easy',
    language: 'en',
    options: ['Rs 25', 'Rs 50', 'Rs 75', 'Rs 100'],
    correctIndex: 1,
    explanation: '(500 × 10 × 1) / 100 = Rs 50.',
  });

  const qForSampleLesson = await quizService.createLocalQuestion({
    prompt: 'Which fraction equals 0.75?',
    subjectId: 'math',
    topicKey: 'fractions',
    topicText: 'Fractions & Decimals',
    lessonId: 'math-fractions-01',
    difficulty: 'Medium',
    language: 'en',
    options: ['1/4', '2/3', '3/4', '4/5'],
    correctIndex: 2,
    explanation: '0.75 = 75/100 = 3/4.',
  });

  assert.ok(qCustomNoExplanation.id.startsWith('tq-math-'));
  assert.equal(qCustomNoExplanation.quizId, 'teacher-bank');
  assert.equal(qCustomNoExplanation.origin, 'local');
  assert.equal(qCustomNoExplanation.explanation.en, '', 'Optional explanation allowed to stay blank');
  assert.equal(qCustomWithExplanation.lessonId, localLesson.id);
  assert.equal(qForSampleLesson.topicKey, 'fractions');

  // 4. Query questions by lesson & topic (verifying readiness for Quiz Assignment Step 3)
  const localLessonQuestions = await quizService.getQuestionsForLesson(localLesson.id);
  assert.equal(localLessonQuestions.length, 2, 'Both custom questions queryable by lessonId');

  const simpleInterestTopicQuestions = await quizService.getQuestionsForTopic('simple_interest');
  assert.equal(simpleInterestTopicQuestions.length, 2, 'Custom topic questions queryable by topicKey');

  // 5. Edit teacher-created question and verify persistence
  const originalCreatedAt = qCustomNoExplanation.createdAt;
  const edited = await quizService.updateLocalQuestion(qCustomNoExplanation.id, {
    prompt: 'What is the simple interest on Rs 2000 at 5% per year for 2 years?',
    subjectId: 'math',
    topicText: 'Simple Interest',
    lessonId: localLesson.id,
    difficulty: 'Medium',
    language: 'en',
    options: ['Rs 100', 'Rs 200', 'Rs 250', 'Rs 400'],
    correctIndex: 1,
    explanation: '(2000 × 5 × 2) / 100 = Rs 200.',
  });

  assert.equal(edited.id, qCustomNoExplanation.id, 'Edit preserves unique question ID');
  assert.equal(edited.createdAt, originalCreatedAt, 'Edit preserves createdAt');
  assert.equal(edited.difficulty, 'Medium');
  assert.equal(edited.explanation.en, '(2000 × 5 × 2) / 100 = Rs 200.');

  // Simulate reload & ensureQuizzesSeeded() does NOT overwrite local edits
  storageService.setAdapterForTesting(db);
  await quizService.ensureQuizzesSeeded();
  const persistedEdited = await db.get<StoredQuizQuestion>('quizQuestions', qCustomNoExplanation.id);
  assert.equal(
    persistedEdited?.prompt.en,
    'What is the simple interest on Rs 2000 at 5% per year for 2 years?',
    'Edited teacher question persists across reload and re-seed'
  );

  // 6. Adaptive Engine compatibility with teacher-created questions on a custom topic
  const studentId = 'student-ananya-01';
  const teacherMiniQuiz: Quiz = {
    id: 'teacher-practice-simple-interest',
    subjectId: 'math',
    lessonId: localLesson.id,
    grade: 7,
    title: {
      en: 'Simple Interest Check',
      kn: 'Simple Interest Check',
      hi: 'Simple Interest Check',
    },
    description: {
      en: 'Teacher-authored questions',
      kn: 'Teacher-authored questions',
      hi: 'Teacher-authored questions',
    },
    questions: [edited, qCustomWithExplanation],
    origin: 'local',
  };

  // Student answers both incorrectly -> triggers weak topic & Easy recommendation
  const attempt = await quizService.submitQuizAttempt(teacherMiniQuiz, studentId, {
    [edited.id]: 0,
    [qCustomWithExplanation.id]: 0,
  });
  assert.equal(attempt.score, 0);

  const { recommendations } = await adaptiveService.recomputeAndSaveForStudent(studentId);
  const simpleInterestRec = recommendations.find((r) => r.topicKey === 'simple_interest');
  assert.ok(simpleInterestRec, 'Adaptive engine evaluates custom teacher topic from IndexedDB');
  assert.equal(simpleInterestRec?.isWeakTopic, true, '0/2 accuracy flags weak topic cleanly');
  assert.equal(simpleInterestRec?.recommendedDifficulty, 'Easy', 'Weak performance sets Easy difficulty');
  assert.ok(
    simpleInterestRec!.suggestedQuestionIds.includes(qCustomWithExplanation.id),
    'Adaptive engine pulls matching Easy teacher question from IndexedDB'
  );

  const adaptiveQuiz = await adaptiveService.createAdaptiveQuizFromRecommendation(simpleInterestRec!);
  assert.ok(
    adaptiveQuiz.questions.some((q) => q.id === qCustomWithExplanation.id),
    'Generated adaptive practice exercise includes teacher-authored question'
  );

  // 7. Delete custom question and verify historical quizAttempt remains intact
  await quizService.deleteLocalQuestion(qCustomWithExplanation.id);
  const afterDeleteQuestions = await quizService.getAllQuestionsFromDb();
  assert.equal(
    afterDeleteQuestions.some((q) => q.id === qCustomWithExplanation.id),
    false,
    'Deleted teacher question removed from quizQuestions store'
  );
  const studentAttemptsAfterDelete = await quizService.getAttemptsForStudent(studentId);
  assert.equal(studentAttemptsAfterDelete.length, 1, 'Existing quizAttempts remain preserved');

  // 8. Sample question edit & revert check (plus parent quiz sync)
  const sampleQ = initialQuestions.find((q) => q.id === 'q-m-1');
  assert.ok(sampleQ, 'Expected sample question q-m-1 to exist');
  const editedSampleQ = await quizService.updateLocalQuestion('q-m-1', {
    prompt: 'Updated sample fractions question?',
    subjectId: 'math',
    topicKey: 'fractions',
    topicText: 'Fractions & Decimals',
    lessonId: 'math-fractions-01',
    difficulty: 'Easy',
    language: 'en',
    options: ['1/2', '1/3', '1/4', '1/5'],
    correctIndex: 0,
    explanation: 'Custom sample edit explanation.',
  });
  assert.equal(editedSampleQ.origin, 'local');

  // Reload + re-seed should preserve the teacher's edit to the sample question
  await quizService.ensureQuizzesSeeded();
  const sampleAfterReseed = await db.get<StoredQuizQuestion>('quizQuestions', 'q-m-1');
  assert.equal(sampleAfterReseed?.prompt.en, 'Updated sample fractions question?');

  const parentQuizAfterEdit = await quizService.getQuizByIdFromDb('quiz-math-fractions');
  assert.equal(
    parentQuizAfterEdit?.questions.find((q) => q.id === 'q-m-1')?.prompt.en,
    'Updated sample fractions question?',
    'Parent curriculum quiz reflects edited sample question'
  );

  // Reverting sample question restores canonical version
  await quizService.deleteLocalQuestion('q-m-1');
  const revertedSampleQ = await db.get<StoredQuizQuestion>('quizQuestions', 'q-m-1');
  assert.equal(revertedSampleQ?.origin, 'sample');
  assert.equal(revertedSampleQ?.prompt.en, sampleQ?.prompt.en);

  console.log('ALL STAGE 4 STEP 2 QUESTION MANAGEMENT TESTS PASSED');
}

runTests().catch((err) => {
  console.error('Stage 4 Step 2 Question Management verification failed:', err);
  process.exit(1);
});
