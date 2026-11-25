import assert from 'node:assert/strict';
import { lessonService } from '../src/modules/curriculum/lessonService';
import { SAMPLE_LESSONS } from '../src/modules/curriculum/sampleCurriculum';
import { progressService } from '../src/modules/progress/progressService';
import { quizService } from '../src/modules/quiz/quizService';
import { ALL_STORES, StorageAdapter, StoreName } from '../src/modules/storage/StorageAdapter';
import { storageService } from '../src/modules/storage/storageService';
import { Lesson, LessonProgressRecord } from '../src/types/domain';

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

  // 1. Seed subjects & quizzes (existing Stage 1-3 records)
  await lessonService.ensureSubjectsSeeded();
  await quizService.ensureQuizzesSeeded();
  const initialQuizzes = await quizService.getQuizzesFromDb();
  const initialLessons = await lessonService.getAllLessons();
  assert.equal(initialLessons.length, SAMPLE_LESSONS.length, 'Expected 8 initial sample lessons');
  assert.ok(initialQuizzes.length >= 2, 'Expected existing sample quizzes to be preserved');

  // 2. Teacher creates a new Kannada lesson & a new Hindi lesson
  const createdKn = await lessonService.createLocalLesson({
    subjectId: 'math',
    grade: 7,
    topicKey: 'ratios',
    topicText: 'ಅನುಪಾತ ಮತ್ತು ಸಮಾನುಪಾತ',
    title: 'ರೈತರ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಅನುಪಾತ ಲೆಕ್ಕಾಚಾರ',
    description: 'ದೈನಂದಿನ ಮಾರುಕಟ್ಟೆ ಉದಾಹರಣೆಗಳೊಂದಿಗೆ ಅನುಪಾತವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ.',
    content: 'ಮೊದಲ ಹಂತ: ಎರಡೂ ಪ್ರಮಾಣಗಳನ್ನು ಒಂದೇ ಘಟಕಕ್ಕೆ ಪರಿವರ್ತಿಸಿ.\n\nಎರಡನೇ ಹಂತ: ಸರಳ ರೂಪಕ್ಕೆ ಭಾಗಿಸಿ.',
    language: 'kn',
    estimatedMinutes: 20,
  });

  const createdHi = await lessonService.createLocalLesson({
    subjectId: 'science',
    grade: 8,
    topicText: 'Soil Microorganisms',
    title: 'मिट्टी के सूक्ष्मजीव और फसल स्वास्थ्य',
    description: 'जानें कि राइजोबियम पौधों को नाइट्रोजन कैसे देता है।',
    content: 'दलहन फसलों की जड़ों में राइजोबियम जीवाणु नाइट्रोजन स्थिरीकरण करते हैं।',
    language: 'hi',
    estimatedMinutes: 15,
  });

  assert.ok(createdKn.id.startsWith('local-math-'), 'Created math lesson has unique local ID');
  assert.ok(createdHi.id.startsWith('local-science-'), 'Created science lesson has unique local ID');
  assert.notEqual(createdKn.id, createdHi.id, 'Created lessons have distinct IDs');
  assert.equal(createdKn.authoredLanguage, 'kn', 'Authored language saved as Kannada');
  assert.equal(createdHi.authoredLanguage, 'hi', 'Authored language saved as Hindi');

  const afterCreateLessons = await lessonService.getAllLessons();
  assert.equal(
    afterCreateLessons.length,
    SAMPLE_LESSONS.length + 2,
    'Lesson list includes both teacher-created lessons plus all sample lessons'
  );

  const subjectsAfterCreate = await lessonService.getSubjects();
  const mathSubject = subjectsAfterCreate.find((s) => s.id === 'math');
  const sciSubject = subjectsAfterCreate.find((s) => s.id === 'science');
  assert.equal(mathSubject?.lessonCount, 5, 'Math lesson count increments dynamically');
  assert.equal(sciSubject?.lessonCount, 5, 'Science lesson count increments dynamically');

  // Verify automatic offline cache storage
  const downloadedAfterCreate = await lessonService.getDownloadedLessons();
  assert.ok(
    downloadedAfterCreate.some((d) => d.id === createdKn.id),
    'Teacher-created Kannada lesson is cached in downloadedLessons for offline reading'
  );
  assert.ok(
    downloadedAfterCreate.some((d) => d.id === createdHi.id),
    'Teacher-created Hindi lesson is cached in downloadedLessons for offline reading'
  );

  // 3. Edit existing teacher lesson and verify both materials + offline cache stay synchronized
  const updatedEn = await lessonService.updateLocalLesson(createdKn.id, {
    subjectId: 'math',
    grade: 8,
    topicKey: 'geometry',
    topicText: 'Geometry',
    title: 'Practical Land Measurement & Fencing Area',
    description: 'Updated description for measuring rectangular and triangular plots.',
    content: 'Step 1: Measure perimeter for fencing.\n\nStep 2: Multiply length by width for area.',
    language: 'en',
    estimatedMinutes: 25,
  });

  assert.equal(updatedEn.id, createdKn.id, 'Editing preserves original lesson ID');
  assert.equal(updatedEn.grade, 8, 'Grade updated to 8');
  assert.equal(updatedEn.authoredLanguage, 'en', 'Authored language updated to English');
  assert.equal(updatedEn.title.en, 'Practical Land Measurement & Fencing Area');
  assert.equal(
    updatedEn.title.kn,
    'Practical Land Measurement & Fencing Area',
    'Monolingual edit keeps localized fallback synced across languages'
  );

  const downloadedAfterEdit = await lessonService.getDownloadedLessons();
  const cachedEdited = downloadedAfterEdit.find((d) => d.id === createdKn.id);
  assert.ok(cachedEdited, 'Edited lesson remains in offline downloadedLessons store');
  assert.equal(
    cachedEdited?.lesson.title.en,
    'Practical Land Measurement & Fencing Area',
    'Offline cache reflects updated title immediately (no stale cached title)'
  );
  assert.equal(
    cachedEdited?.lesson.sections[0]?.body.en,
    'Step 1: Measure perimeter for fencing.\n\nStep 2: Multiply length by width for area.',
    'Offline cache reflects updated lesson content'
  );

  // 4. Simulate page reload by re-attaching storage adapter & querying fresh
  storageService.setAdapterForTesting(db);
  const persistedById = await lessonService.getLessonById(createdKn.id);
  assert.equal(
    persistedById?.title.en,
    'Practical Land Measurement & Fencing Area',
    'Edited lesson persists across reload'
  );
  const persistedQuizzes = await quizService.getQuizzesFromDb();
  assert.equal(
    persistedQuizzes.length,
    initialQuizzes.length,
    'Existing quiz records remain completely preserved'
  );

  // 5. Student opens & completes teacher-created lesson (offline flow + progress)
  const studentId = 'student-ananya-01';
  await progressService.markLessonViewed(studentId, createdKn.id);
  const completedRecord = await progressService.markLessonCompleted(studentId, createdKn.id);
  assert.equal(completedRecord.status, 'completed', 'Student can complete teacher-created lesson');

  const studentProgress = await progressService.getStudentLessonProgress(studentId);
  assert.ok(
    studentProgress.some((p) => p.lessonId === createdKn.id && p.status === 'completed'),
    'Student completion saved in IndexedDB progress store'
  );

  // 6. Delete created lesson & confirm cleanup without harming quizzes or other lessons
  await lessonService.deleteLocalLesson(createdKn.id);
  const afterDeleteLessons = await lessonService.getAllLessons();
  assert.equal(
    afterDeleteLessons.some((l) => l.id === createdKn.id),
    false,
    'Deleted lesson removed from getAllLessons()'
  );
  assert.equal(
    await db.get<Lesson>('materials', createdKn.id),
    undefined,
    'Deleted lesson removed from materials store'
  );
  assert.equal(
    await db.get('downloadedLessons', createdKn.id),
    undefined,
    'Deleted lesson removed from downloadedLessons store'
  );
  assert.equal(
    await db.get('downloads', createdKn.id),
    undefined,
    'Deleted lesson removed from downloads store'
  );
  assert.equal(
    await db.get<LessonProgressRecord>('progress', `${studentId}::${createdKn.id}`),
    undefined,
    'Orphaned progress for deleted local lesson cleaned up'
  );
  assert.ok(
    afterDeleteLessons.some((l) => l.id === createdHi.id),
    'Other teacher-created lessons remain intact'
  );

  // 7. Sample lesson edit & revert check
  await progressService.markLessonCompleted(studentId, 'math-fractions-01');
  const editedSample = await lessonService.updateLocalLesson('math-fractions-01', {
    subjectId: 'math',
    grade: 6,
    topicKey: 'fractions',
    topicText: 'Fractions & Decimals',
    title: 'Custom Fractions Title',
    description: 'Custom summary',
    content: 'Custom classroom note for fractions.',
    language: 'en',
    estimatedMinutes: 18,
  });
  assert.equal(editedSample.origin, 'local', 'Edited sample stored locally in materials');
  assert.equal((await lessonService.getLessonById('math-fractions-01'))?.title.en, 'Custom Fractions Title');

  await lessonService.deleteLocalLesson('math-fractions-01');
  const revertedSample = await lessonService.getLessonById('math-fractions-01');
  assert.equal(
    revertedSample?.origin,
    'sample',
    'Deleting local sample override reverts cleanly to core sample lesson'
  );
  const sampleProgress = await db.get<LessonProgressRecord>('progress', `${studentId}::math-fractions-01`);
  assert.equal(sampleProgress?.status, 'completed', 'Student progress on sample lesson preserved on revert');

  console.log('ALL STAGE 4 MODULE 1 LESSON MANAGEMENT TESTS PASSED');
}

runTests().catch((err) => {
  console.error('Stage 4 Lesson Management verification failed:', err);
  process.exit(1);
});
