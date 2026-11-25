import assert from 'node:assert/strict';
import {
  analyzeStudentTopicPerformance,
  buildAdaptiveExerciseQuiz,
  buildTeacherAdaptiveOverview,
  computeStudentAdaptiveRecommendations,
} from '../src/modules/adaptive/adaptiveEngine';
import { ADAPTIVE_QUESTION_BANK } from '../src/modules/adaptive/adaptiveQuestionBank';
import { adaptiveService } from '../src/modules/adaptive/adaptiveService';
import { SAMPLE_STUDENT_ROSTER } from '../src/modules/auth/sampleProfiles';
import { quizService } from '../src/modules/quiz/quizService';
import { SAMPLE_QUIZZES } from '../src/modules/quiz/sampleQuizzes';
import { ALL_STORES, StorageAdapter, StoreName } from '../src/modules/storage/StorageAdapter';
import { storageService } from '../src/modules/storage/storageService';
import { Quiz } from '../src/types/domain';

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

function buildAnswersForQuiz(quiz: Quiz, correctCount: number): Record<string, number> {
  const answers: Record<string, number> = {};
  quiz.questions.forEach((q, idx) => {
    if (idx < correctCount) {
      answers[q.id] = q.correctIndex;
    } else {
      answers[q.id] = (q.correctIndex + 1) % q.options.length;
    }
  });
  return answers;
}

async function runTests() {
  const db = new InMemoryStorageAdapter();
  await db.init();
  storageService.setAdapterForTesting(db);

  // Seed quizzes and adaptive question bank into local store
  await quizService.ensureQuizzesSeeded();
  const storedQuestions = await quizService.getAllQuestionsFromDb();
  assert.ok(
    storedQuestions.length >= ADAPTIVE_QUESTION_BANK.length,
    `Expected >= ${ADAPTIVE_QUESTION_BANK.length} stored questions, got ${storedQuestions.length}`
  );

  // Guard: Zero attempts produces zero recommendations (never fake recommendations)
  const chinmayiId = 'student-ananya-01';
  const emptyCheck = await adaptiveService.recomputeAndSaveForStudent(chinmayiId);
  assert.equal(
    emptyCheck.recommendations.length,
    0,
    'Student with 0 attempts must have 0 recommendations'
  );

  // Guard: Single-question attempt must NOT abruptly flip difficulty
  const geometryQuiz = SAMPLE_QUIZZES.find((q) => q.id === 'quiz-math-geometry')!;
  assert.ok(geometryQuiz, 'Geometry quiz must exist in SAMPLE_QUIZZES');
  const singleQuestionQuiz: Quiz = {
    ...geometryQuiz,
    questions: [geometryQuiz.questions[1]], // 1 Medium question
  };
  await quizService.submitQuizAttempt(singleQuestionQuiz, 'student-single-guard', {
    [singleQuestionQuiz.questions[0].id]: (singleQuestionQuiz.questions[0].correctIndex + 1) % 4,
  });
  const singleGuardResult = await adaptiveService.recomputeAndSaveForStudent('student-single-guard');
  assert.equal(singleGuardResult.recommendations[0].ruleApplied, 'insufficient_evidence_hold');
  assert.equal(
    singleGuardResult.recommendations[0].recommendedDifficulty,
    'Medium',
    'Single wrong answer must hold difficulty at Medium without jumping'
  );

  // Scenario 1, 2, 3 & 6: Student performs poorly in Geometry (< 50%) -> 1/3 = 33%
  const geoAttempt1 = await quizService.submitQuizAttempt(
    geometryQuiz,
    chinmayiId,
    buildAnswersForQuiz(geometryQuiz, 1)
  );
  assert.equal(geoAttempt1.percentage, 33);

  const afterPoorGeo = await adaptiveService.recomputeAndSaveForStudent(chinmayiId);
  const geoRec1 = afterPoorGeo.recommendations.find((r) => r.topicKey === 'geometry');
  assert.ok(geoRec1, 'Geometry recommendation must be generated from real attempt');
  assert.equal(geoRec1.isWeakTopic, true, 'Scenario 2: Geometry must be flagged as weak topic');
  assert.equal(
    geoRec1.recommendedDifficulty,
    'Easy',
    'Scenario 3: Accuracy < 50% must recommend Easy exercises'
  );
  assert.equal(
    geoRec1.needsPrerequisiteRevision,
    true,
    'Scenario 6: Poor Geometry must recommend prerequisite revision (Fractions & Decimals)'
  );
  assert.equal(geoRec1.prerequisiteTopicKey, 'fractions');
  assert.equal(geoRec1.prerequisiteLessonId, 'math-fractions-01');
  assert.ok(geoRec1.explanation.en.includes('33%'), 'Explanation must cite real 33% accuracy');

  // Build adaptive Easy quiz from recommendation & verify Easy questions from local DB
  const adaptiveEasyQuiz = await adaptiveService.createAdaptiveQuizFromRecommendation(geoRec1);
  assert.equal(adaptiveEasyQuiz.targetDifficulty, 'Easy');
  assert.ok(adaptiveEasyQuiz.questions.length >= 3);
  assert.ok(
    adaptiveEasyQuiz.questions.every((q) => q.difficulty === 'Easy'),
    'Easy adaptive exercise must serve Easy questions from local store'
  );

  // Scenario 4 & 5: Repeated practice improves accuracy, and difficulty increases ONLY after consistent >75%
  // Attempt 2: 100% on Easy -> must hold at Easy to confirm consistency first
  await quizService.submitQuizAttempt(
    adaptiveEasyQuiz,
    chinmayiId,
    buildAnswersForQuiz(adaptiveEasyQuiz, adaptiveEasyQuiz.questions.length)
  );
  const afterAttempt2 = await adaptiveService.recomputeAndSaveForStudent(chinmayiId);
  const geoRec2 = afterAttempt2.recommendations.find((r) => r.topicKey === 'geometry')!;
  assert.equal(geoRec2.recentAccuracyPercent, 100, 'Scenario 4: Latest accuracy improved to 100%');
  assert.equal(geoRec2.improvementDelta, 67, 'Scenario 4: Improvement delta should be +67%');
  assert.equal(
    geoRec2.recommendedDifficulty,
    'Easy',
    'Scenario 5: Single >75% attempt at Easy must confirm consistency before advancing'
  );
  assert.equal(geoRec2.ruleApplied, 'first_high_score_confirm_consistency');

  // Attempt 3: Second consecutive >75% on Easy -> steps up +1 to Medium!
  await quizService.submitQuizAttempt(
    adaptiveEasyQuiz,
    chinmayiId,
    buildAnswersForQuiz(adaptiveEasyQuiz, adaptiveEasyQuiz.questions.length)
  );
  const afterAttempt3 = await adaptiveService.recomputeAndSaveForStudent(chinmayiId);
  const geoRec3 = afterAttempt3.recommendations.find((r) => r.topicKey === 'geometry')!;
  assert.equal(
    geoRec3.recommendedDifficulty,
    'Medium',
    'Scenario 5: Two consecutive >75% attempts at Easy must step up to Medium'
  );
  assert.equal(geoRec3.ruleApplied, 'consistent_mastery_increase_difficulty');
  assert.equal(geoRec3.isWeakTopic, false, 'Geometry should no longer be flagged weak');

  // Step from Medium -> Hard requires two consecutive >75% Medium attempts
  const adaptiveMediumQuiz = await adaptiveService.createAdaptiveQuizFromRecommendation(geoRec3);
  assert.equal(adaptiveMediumQuiz.targetDifficulty, 'Medium');
  await quizService.submitQuizAttempt(
    adaptiveMediumQuiz,
    chinmayiId,
    buildAnswersForQuiz(adaptiveMediumQuiz, adaptiveMediumQuiz.questions.length)
  );
  const afterMed1 = await adaptiveService.recomputeAndSaveForStudent(chinmayiId);
  assert.equal(
    afterMed1.recommendations.find((r) => r.topicKey === 'geometry')!.recommendedDifficulty,
    'Medium',
    'First >75% at Medium holds Medium before advancing to Hard'
  );

  await quizService.submitQuizAttempt(
    adaptiveMediumQuiz,
    chinmayiId,
    buildAnswersForQuiz(adaptiveMediumQuiz, adaptiveMediumQuiz.questions.length)
  );
  const afterMed2 = await adaptiveService.recomputeAndSaveForStudent(chinmayiId);
  assert.equal(
    afterMed2.recommendations.find((r) => r.topicKey === 'geometry')!.recommendedDifficulty,
    'Hard',
    'Two consecutive >75% Medium attempts advance difficulty to Hard'
  );

  // Scenario 6b: Linear Equations poor accuracy -> prerequisite Basic Algebra
  const algebraQuiz = SAMPLE_QUIZZES.find((q) => q.id === 'quiz-math-algebra')!;
  await quizService.submitQuizAttempt(algebraQuiz, chinmayiId, {
    'q-ma-1': 0, // linear_equations wrong (correctIndex is 1)
    'q-ma-2': 1, // geometry correct
    'q-ma-3': 0, // linear_equations wrong (correctIndex is 1)
  });
  const afterLinearFail = await adaptiveService.recomputeAndSaveForStudent(chinmayiId);
  const linearRec = afterLinearFail.recommendations.find((r) => r.topicKey === 'linear_equations')!;
  assert.equal(linearRec.isWeakTopic, true);
  assert.equal(linearRec.recommendedDifficulty, 'Easy');
  assert.equal(linearRec.needsPrerequisiteRevision, true);
  assert.equal(linearRec.prerequisiteTopicKey, 'basic_algebra');

  // Rule check: 50%–75% accuracy -> Medium recommendation
  const ratiosMediumStudent = 'student-suresh-04';
  const ratiosQuiz: Quiz = buildAdaptiveExerciseQuiz(
    {
      ...linearRec,
      topicKey: 'ratios',
      topicLabel: { en: 'Ratios & Proportions', kn: '', hi: '' },
      recommendedDifficulty: 'Medium',
      suggestedQuestionIds: ['aq-rat-m1', 'aq-rat-m2', 'aq-rat-m3', 'aq-rat-m4'],
    },
    storedQuestions
  );
  await quizService.submitQuizAttempt(
    ratiosQuiz,
    ratiosMediumStudent,
    buildAnswersForQuiz(ratiosQuiz, 2) // 2/3 = 67% (within 50%-75%)
  );
  const sureshRes = await adaptiveService.recomputeAndSaveForStudent(ratiosMediumStudent);
  const ratiosRec = sureshRes.recommendations.find((r) => r.topicKey === 'ratios')!;
  assert.equal(ratiosRec.recentAccuracyPercent, 67);
  assert.equal(ratiosRec.recommendedDifficulty, 'Medium');
  assert.equal(ratiosRec.ruleApplied, 'moderate_accuracy_medium');

  // Scenario 8: Different students receive independent recommendations
  const karthikId = 'student-karthik-02';
  const scienceQuiz = SAMPLE_QUIZZES.find((q) => q.id === 'quiz-science-core')!;
  await quizService.submitQuizAttempt(
    scienceQuiz,
    karthikId,
    buildAnswersForQuiz(scienceQuiz, scienceQuiz.questions.length)
  );
  await adaptiveService.recomputeAndSaveForStudent(karthikId);

  // Scenario 7: Saved recommendations persist in local storage across simulated app reload
  storageService.setAdapterForTesting(db);
  const persistedChinmayi = await adaptiveService.getSavedRecommendationsForStudent(chinmayiId);
  const persistedKarthik = await adaptiveService.getSavedRecommendationsForStudent(karthikId);

  assert.ok(
    persistedChinmayi.some((r) => r.topicKey === 'geometry' && r.recommendedDifficulty === 'Hard')
  );
  assert.ok(
    persistedChinmayi.some(
      (r) => r.topicKey === 'linear_equations' && r.recommendedDifficulty === 'Easy'
    )
  );
  assert.equal(
    persistedKarthik.some((r) => r.topicKey === 'geometry'),
    false,
    'Scenario 8: Karthik must not inherit Chinmayi Geometry recommendations'
  );
  assert.ok(
    persistedKarthik.some((r) => r.topicKey === 'plant_nutrition'),
    'Scenario 8: Karthik must have independent Science recommendations'
  );

  // Test 5 (strict): Single correct answer NEVER causes a difficulty increase
  // Case A: Single 1/1 = 100% attempt on Easy -> must stay Easy
  const singleCorrectStudent = 'student-single-correct';
  const easyFractions = ADAPTIVE_QUESTION_BANK.filter(
    (q) => q.topicKey === 'fractions' && q.difficulty === 'Easy'
  );
  await quizService.submitQuizAttempt(
    {
      ...geometryQuiz,
      id: 'single-q-frac-1',
      subjectId: 'math',
      targetTopicKey: 'fractions',
      targetDifficulty: 'Easy',
      isAdaptiveExercise: true,
      questions: [easyFractions[0]],
    },
    singleCorrectStudent,
    { [easyFractions[0].id]: easyFractions[0].correctIndex }
  );
  const singleCorrectRes1 = await adaptiveService.recomputeAndSaveForStudent(singleCorrectStudent);
  assert.equal(singleCorrectRes1.recommendations[0].recommendedDifficulty, 'Easy');
  assert.equal(singleCorrectRes1.recommendations[0].ruleApplied, 'insufficient_evidence_hold');

  // Case B: 3/3 on Attempt 1 + single 1/1 correct answer on Attempt 2 -> still must NOT jump to Medium
  await quizService.submitQuizAttempt(
    {
      ...geometryQuiz,
      id: 'full-q-frac-1',
      subjectId: 'math',
      targetTopicKey: 'fractions',
      targetDifficulty: 'Easy',
      isAdaptiveExercise: true,
      questions: easyFractions,
    },
    singleCorrectStudent,
    {
      [easyFractions[0].id]: easyFractions[0].correctIndex,
      [easyFractions[1].id]: easyFractions[1].correctIndex,
      [easyFractions[2].id]: easyFractions[2].correctIndex,
    }
  );
  await quizService.submitQuizAttempt(
    {
      ...geometryQuiz,
      id: 'single-q-frac-2',
      subjectId: 'math',
      targetTopicKey: 'fractions',
      targetDifficulty: 'Easy',
      isAdaptiveExercise: true,
      questions: [easyFractions[1]],
    },
    singleCorrectStudent,
    { [easyFractions[1].id]: easyFractions[1].correctIndex }
  );
  const singleCorrectRes2 = await adaptiveService.recomputeAndSaveForStudent(singleCorrectStudent);
  assert.equal(
    singleCorrectRes2.recommendations[0].recommendedDifficulty,
    'Easy',
    'A single 1-question correct attempt must never trigger Easy -> Medium escalation'
  );

  // Case C: 1/2 = 50% on Easy (1 correct, 1 wrong) -> must hold Easy, never jump to Medium
  const halfEasyStudent = 'student-half-easy';
  await quizService.submitQuizAttempt(
    {
      ...geometryQuiz,
      id: 'two-q-frac-easy',
      subjectId: 'math',
      targetTopicKey: 'fractions',
      targetDifficulty: 'Easy',
      isAdaptiveExercise: true,
      questions: easyFractions.slice(0, 2),
    },
    halfEasyStudent,
    {
      [easyFractions[0].id]: easyFractions[0].correctIndex,
      [easyFractions[1].id]: (easyFractions[1].correctIndex + 1) % 4,
    }
  );
  const halfEasyRes = await adaptiveService.recomputeAndSaveForStudent(halfEasyStudent);
  assert.equal(
    halfEasyRes.recommendations[0].recommendedDifficulty,
    'Easy',
    '50% (1/2) on Easy must not escalate Easy -> Medium'
  );

  // Test 3: Repeated mistakes (>= 2 consecutive wrong answers) triggers repeated_mistakes_revise even at >= 50%
  const repeatedMistakesStudent = 'student-repeated-mistakes';
  const medCircuits = ADAPTIVE_QUESTION_BANK.filter(
    (q) => q.topicKey === 'circuits' && q.difficulty === 'Medium'
  );
  const easyCircuits = ADAPTIVE_QUESTION_BANK.filter(
    (q) => q.topicKey === 'circuits' && q.difficulty === 'Easy'
  );
  const fourCircuits = [...medCircuits, ...easyCircuits]; // 4 questions: first 2 right, last 2 wrong = 50% with 2 trailing mistakes
  await quizService.submitQuizAttempt(
    {
      ...scienceQuiz,
      id: 'circuits-4q-check',
      subjectId: 'science',
      targetTopicKey: 'circuits',
      targetDifficulty: 'Medium',
      isAdaptiveExercise: true,
      questions: fourCircuits,
    },
    repeatedMistakesStudent,
    {
      [fourCircuits[0].id]: fourCircuits[0].correctIndex,
      [fourCircuits[1].id]: fourCircuits[1].correctIndex,
      [fourCircuits[2].id]: (fourCircuits[2].correctIndex + 1) % 4,
      [fourCircuits[3].id]: (fourCircuits[3].correctIndex + 1) % 4,
    }
  );
  const repeatedRes = await adaptiveService.recomputeAndSaveForStudent(repeatedMistakesStudent);
  const circuitsRec = repeatedRes.recommendations.find((r) => r.topicKey === 'circuits')!;
  assert.equal(circuitsRec.ruleApplied, 'repeated_mistakes_revise');
  assert.equal(circuitsRec.recommendedDifficulty, 'Easy');

  // Verify Teacher Adaptive Overview aggregates live data accurately
  const allAttempts = await quizService.getAllAttempts();
  const teacherOverview = buildTeacherAdaptiveOverview(
    SAMPLE_STUDENT_ROSTER,
    allAttempts,
    storedQuestions
  );
  const chinmayiRow = teacherOverview.studentRows.find((r) => r.studentId === chinmayiId)!;
  const meenaRow = teacherOverview.studentRows.find((r) => r.studentId === 'student-meena-03')!;
  assert.equal(chinmayiRow.hasLiveAdaptiveData, true);
  assert.ok(chinmayiRow.weakTopics.includes('Linear Equations'));
  assert.equal(meenaRow.hasLiveAdaptiveData, false, 'Meena has 0 live attempts -> sample baseline only');
  assert.equal(meenaRow.weakTopics.length, 0, 'Sample baseline must never populate live weakTopics');

  // Teacher Consistency Audit:
  // 1) Fractions 1/3 (33%) then 1/2 (50%) -> Latest = 50%, Cumulative = 2/5 = 40%
  // 2) Geometry 0/1 (0%) -> not flagged weak (insufficientDataTopics, min 2 Qs)
  // 3) Out-of-order submittedAt timestamps still compute chronological delta accurately
  const { progressService } = await import('../src/modules/progress/progressService');
  const auditStudentId = 'student-audit-09';
  const auditRoster = [
    ...SAMPLE_STUDENT_ROSTER,
    {
      id: auditStudentId,
      name: 'Audit Student',
      grade: 7,
      preferredLanguage: 'en' as const,
      lessonsCompleted: 0,
      averageScore: 0,
      weakTopics: ['Water Conservation'], // sample-like field that must NOT affect live engine
      lastActiveAt: '2026-11-24T00:00:00.000Z',
      origin: 'local' as const,
    },
  ];
  const auditAttempts = [
    // Intentionally insert newer attempt FIRST to verify chronological sorting
    {
      id: 'audit-att-2',
      quizId: 'adaptive-fractions-easy',
      subjectId: 'math' as const,
      studentId: auditStudentId,
      score: 1,
      totalQuestions: 2,
      percentage: 50,
      answers: {},
      submittedAt: '2026-11-25T10:00:00.000Z',
      topicResults: [
        { questionId: 'aq-frac-e1', topicKey: 'fractions', topicLabel: { en: 'Fractions & Decimals', kn: '', hi: '' }, difficulty: 'Easy' as const, correct: true },
        { questionId: 'aq-frac-e2', topicKey: 'fractions', topicLabel: { en: 'Fractions & Decimals', kn: '', hi: '' }, difficulty: 'Easy' as const, correct: false },
      ],
    },
    {
      id: 'audit-att-1',
      quizId: 'quiz-math-fractions',
      subjectId: 'math' as const,
      studentId: auditStudentId,
      score: 1,
      totalQuestions: 4,
      percentage: 25,
      answers: {},
      submittedAt: '2026-11-25T09:00:00.000Z',
      topicResults: [
        { questionId: 'q-m-1', topicKey: 'fractions', topicLabel: { en: 'Fractions & Decimals', kn: '', hi: '' }, difficulty: 'Easy' as const, correct: true },
        { questionId: 'q-m-2', topicKey: 'fractions', topicLabel: { en: 'Fractions & Decimals', kn: '', hi: '' }, difficulty: 'Medium' as const, correct: false },
        { questionId: 'aq-frac-m1', topicKey: 'fractions', topicLabel: { en: 'Fractions & Decimals', kn: '', hi: '' }, difficulty: 'Medium' as const, correct: false },
        // 1 Geometry question answered wrong -> 0% on 1 Q (< 2 Q threshold)
        { questionId: 'q-m-4', topicKey: 'geometry', topicLabel: { en: 'Geometry', kn: '', hi: '' }, difficulty: 'Medium' as const, correct: false },
      ],
    },
  ];

  const auditOverview = buildTeacherAdaptiveOverview(auditRoster, auditAttempts, storedQuestions);
  const auditFracTopic = auditOverview.topicSummaries.find((t) => t.topicKey === 'fractions')!;
  const auditGeoTopic = auditOverview.topicSummaries.find((t) => t.topicKey === 'geometry')!;
  const auditRow = auditOverview.studentRows.find((r) => r.studentId === auditStudentId)!;

  assert.equal(auditFracTopic.averageRecentAccuracy, 50, 'Latest attempt accuracy must be 50%');
  assert.equal(auditFracTopic.cumulativeAccuracyPercent, 40, 'Cumulative accuracy across 2/5 Qs must be 40%');
  assert.equal(auditFracTopic.averageImprovementDelta, 17, 'Chronological 33% -> 50% delta must be +17%');
  assert.equal(auditRow.chronologicalQuizImprovementDelta, 25, 'Chronological 25% -> 50% quiz delta must be +25%');

  assert.equal(auditGeoTopic.cumulativeAccuracyPercent, 0);
  assert.equal(auditGeoTopic.weakStudentCount, 0, '0% on 1 Q must NOT be flagged weak');
  assert.equal(auditGeoTopic.insufficientDataStudentCount, 1);
  assert.equal(auditRow.insufficientDataTopics.length, 1);
  assert.equal(auditRow.insufficientDataTopics[0].topicKey, 'geometry');

  const liveWeakAudit = progressService.computeLiveTopicWeakAreas(auditAttempts);
  const liveGeoWeak = liveWeakAudit.find((w) => w.topicKey === 'geometry')!;
  assert.equal(liveGeoWeak.meetsMinThreshold, false);
  assert.equal(liveGeoWeak.isWeak, false, 'computeLiveTopicWeakAreas must share min 2-Q threshold');
  assert.equal(
    liveWeakAudit.some((w) => w.topicName === 'Water Conservation'),
    false,
    'Sample roster weak topics must never leak into liveWeakAreas'
  );

  // Verify deterministic repeatability (running compute twice yields identical output)
  const passA = computeStudentAdaptiveRecommendations(
    chinmayiId,
    allAttempts,
    storedQuestions,
    '2026-11-24T12:00:00Z'
  );
  const passB = computeStudentAdaptiveRecommendations(
    chinmayiId,
    allAttempts,
    storedQuestions,
    '2026-11-24T12:00:00Z'
  );
  assert.deepEqual(passA, passB, 'Adaptive engine must be 100% deterministic');

  const chinmayiAnalyses = analyzeStudentTopicPerformance(chinmayiId, allAttempts, storedQuestions);
  const geoAnalysis = chinmayiAnalyses.find((a) => a.topicKey === 'geometry')!;
  assert.ok(geoAnalysis.attemptCount >= 5);

  console.log('ALL STAGE 3 & TEACHER DASHBOARD CONSISTENCY TESTS PASSED');
  console.log(`- Stored questions verified: ${storedQuestions.length}`);
  console.log(`- Chinmayi Geometry progression: ${geoAnalysis.difficultyProgression.join(' -> ')}`);
  console.log(
    `- Audit Fractions: Latest=${auditFracTopic.averageRecentAccuracy}%, Cumulative=${auditFracTopic.cumulativeAccuracyPercent}%`
  );
  console.log(
    `- Audit Geometry 0% (1 Q): weakStudentCount=${auditGeoTopic.weakStudentCount}, insufficientData=${auditGeoTopic.insufficientDataStudentCount}`
  );
  console.log(`- Repeated mistakes rule verified: ${circuitsRec.ruleApplied}`);
  console.log(`- Karthik independent recommendations count: ${persistedKarthik.length}`);
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
