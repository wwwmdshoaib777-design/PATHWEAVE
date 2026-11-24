import {
  AdaptiveRecommendationRecord,
  AdaptiveRuleId,
  DifficultyLevel,
  LocalizedText,
  Quiz,
  QuizAttemptRecord,
  StoredQuizQuestion,
  StudentAdaptiveOverviewRow,
  StudentRosterRecord,
  TopicAttemptSnapshot,
  TopicPerformanceAnalysis,
} from '../../types/domain';
import { getTopicDefinition, normalizeTopicKey } from './adaptiveQuestionBank';

const DIFFICULTY_ORDER: DifficultyLevel[] = ['Easy', 'Medium', 'Hard'];

function stepUpDifficulty(current: DifficultyLevel): DifficultyLevel {
  if (current === 'Easy') return 'Medium';
  if (current === 'Medium') return 'Hard';
  return 'Hard';
}

function stepDownDifficulty(current: DifficultyLevel): DifficultyLevel {
  if (current === 'Hard') return 'Medium';
  return 'Easy';
}

function resolvePrimaryDifficulty(counts: Record<DifficultyLevel, number>, fallback: DifficultyLevel): DifficultyLevel {
  let best: DifficultyLevel = fallback;
  let maxCount = -1;
  for (const level of DIFFICULTY_ORDER) {
    if (counts[level] > maxCount) {
      maxCount = counts[level];
      best = level;
    }
  }
  return maxCount > 0 ? best : fallback;
}

/**
 * Pure deterministic topic performance analyzer.
 * Computes per-topic metrics exclusively from saved QuizAttemptRecords.
 */
export function analyzeStudentTopicPerformance(
  studentId: string,
  attempts: QuizAttemptRecord[],
  questionBank: StoredQuizQuestion[]
): TopicPerformanceAnalysis[] {
  const questionById = new Map(questionBank.map((q) => [q.id, q]));

  const studentAttempts = attempts
    .filter((a) => a.studentId === studentId)
    .slice()
    .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());

  interface TopicAccumulator {
    subjectId: TopicPerformanceAnalysis['subjectId'];
    topicKey: string;
    topicLabel: LocalizedText;
    totalQuestionsAttempted: number;
    correctAnswers: number;
    incorrectAnswers: number;
    attemptHistory: TopicAttemptSnapshot[];
    questionOutcomes: boolean[];
    lastPracticedAt: string;
  }

  const accumulators = new Map<string, TopicAccumulator>();

  for (const attempt of studentAttempts) {
    const perAttemptByTopic = new Map<
      string,
      {
        label: LocalizedText;
        questionsCount: number;
        correctCount: number;
        outcomes: boolean[];
        difficultyCounts: Record<DifficultyLevel, number>;
      }
    >();

    for (const result of attempt.topicResults) {
      const topicKey = normalizeTopicKey(result.topicKey);
      const bankQuestion = result.questionId ? questionById.get(result.questionId) : undefined;
      const def = getTopicDefinition(topicKey);
      const label = def?.label ?? result.topicLabel;
      const difficulty: DifficultyLevel =
        result.difficulty ?? bankQuestion?.difficulty ?? attempt.targetDifficulty ?? 'Medium';

      const group = perAttemptByTopic.get(topicKey) ?? {
        label,
        questionsCount: 0,
        correctCount: 0,
        outcomes: [],
        difficultyCounts: { Easy: 0, Medium: 0, Hard: 0 },
      };

      group.questionsCount += 1;
      if (result.correct) group.correctCount += 1;
      group.outcomes.push(result.correct);
      group.difficultyCounts[difficulty] += 1;
      perAttemptByTopic.set(topicKey, group);
    }

    for (const [topicKey, group] of perAttemptByTopic.entries()) {
      const def = getTopicDefinition(topicKey);
      const acc = accumulators.get(topicKey) ?? {
        subjectId: def?.subjectId ?? attempt.subjectId,
        topicKey,
        topicLabel: group.label,
        totalQuestionsAttempted: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        attemptHistory: [],
        questionOutcomes: [],
        lastPracticedAt: attempt.submittedAt,
      };

      const attemptAccuracy =
        group.questionsCount > 0
          ? Math.round((group.correctCount / group.questionsCount) * 100)
          : 0;

      const difficultyUsed = attempt.targetDifficulty
        ? attempt.targetDifficulty
        : resolvePrimaryDifficulty(group.difficultyCounts, 'Medium');

      acc.totalQuestionsAttempted += group.questionsCount;
      acc.correctAnswers += group.correctCount;
      acc.incorrectAnswers += group.questionsCount - group.correctCount;
      acc.questionOutcomes.push(...group.outcomes);
      acc.lastPracticedAt = attempt.submittedAt;
      acc.attemptHistory.push({
        attemptId: attempt.id,
        submittedAt: attempt.submittedAt,
        questionsCount: group.questionsCount,
        correctCount: group.correctCount,
        accuracyPercent: attemptAccuracy,
        difficultyUsed,
      });

      accumulators.set(topicKey, acc);
    }
  }

  const analyses: TopicPerformanceAnalysis[] = [];
  for (const acc of accumulators.values()) {
    const accuracyPercent =
      acc.totalQuestionsAttempted > 0
        ? Math.round((acc.correctAnswers / acc.totalQuestionsAttempted) * 100)
        : 0;

    const latestSnapshot = acc.attemptHistory[acc.attemptHistory.length - 1];
    const previousSnapshot =
      acc.attemptHistory.length >= 2 ? acc.attemptHistory[acc.attemptHistory.length - 2] : null;

    const recentAccuracyPercent = latestSnapshot.accuracyPercent;
    const previousAccuracyPercent = previousSnapshot ? previousSnapshot.accuracyPercent : null;
    const improvementDelta =
      previousAccuracyPercent !== null ? recentAccuracyPercent - previousAccuracyPercent : null;

    let trend: TopicPerformanceAnalysis['trend'] = 'insufficient_data';
    if (acc.attemptHistory.length >= 2 && improvementDelta !== null) {
      if (improvementDelta >= 5) trend = 'improving';
      else if (improvementDelta <= -5) trend = 'declining';
      else trend = 'steady';
    }

    // Trailing consecutive mistakes across recent chronological question answers
    let consecutiveMistakes = 0;
    for (let i = acc.questionOutcomes.length - 1; i >= 0; i -= 1) {
      if (!acc.questionOutcomes[i]) {
        consecutiveMistakes += 1;
      } else {
        break;
      }
    }

    const difficultyProgression = acc.attemptHistory.map((s) => s.difficultyUsed);
    const currentDifficulty = latestSnapshot.difficultyUsed;

    analyses.push({
      studentId,
      subjectId: acc.subjectId,
      topicKey: acc.topicKey,
      topicLabel: acc.topicLabel,
      totalQuestionsAttempted: acc.totalQuestionsAttempted,
      correctAnswers: acc.correctAnswers,
      incorrectAnswers: acc.incorrectAnswers,
      accuracyPercent,
      recentAccuracyPercent,
      previousAccuracyPercent,
      improvementDelta,
      trend,
      attemptCount: acc.attemptHistory.length,
      attemptHistory: acc.attemptHistory,
      consecutiveMistakes,
      currentDifficulty,
      difficultyProgression,
      lastPracticedAt: acc.lastPracticedAt,
    });
  }

  return analyses.sort((a, b) => a.recentAccuracyPercent - b.recentAccuracyPercent);
}

/**
 * Deterministic selection of suggested questions from the IndexedDB question bank.
 * Never uses Math.random(); orders strictly by orderIndex then id.
 */
export function selectSuggestedQuestions(
  topicKey: string,
  targetDifficulty: DifficultyLevel,
  questionBank: StoredQuizQuestion[],
  maxCount = 4
): StoredQuizQuestion[] {
  const normalized = normalizeTopicKey(topicKey);
  const topicQuestions = questionBank
    .filter((q) => normalizeTopicKey(q.topicKey) === normalized)
    .slice()
    .sort((a, b) => {
      if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
      return a.id.localeCompare(b.id);
    });

  // Prefer dedicated adaptive bank questions ('aq-...') first, then standard quiz questions
  const sortedBankFirst = topicQuestions.slice().sort((a, b) => {
    const aIsBank = a.id.startsWith('aq-') ? 0 : 1;
    const bIsBank = b.id.startsWith('aq-') ? 0 : 1;
    if (aIsBank !== bIsBank) return aIsBank - bIsBank;
    if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
    return a.id.localeCompare(b.id);
  });

  const exactMatches = sortedBankFirst.filter((q) => q.difficulty === targetDifficulty);
  if (exactMatches.length >= 2) {
    return exactMatches.slice(0, maxCount);
  }

  // Deterministic fallback order if a topic has fewer than maxCount questions at exact tier
  const fallbackPriority: DifficultyLevel[] =
    targetDifficulty === 'Easy'
      ? ['Easy', 'Medium', 'Hard']
      : targetDifficulty === 'Medium'
        ? ['Medium', 'Easy', 'Hard']
        : ['Hard', 'Medium', 'Easy'];

  const picked: StoredQuizQuestion[] = [];
  const seenIds = new Set<string>();
  for (const level of fallbackPriority) {
    for (const q of sortedBankFirst) {
      if (q.difficulty === level && !seenIds.has(q.id)) {
        seenIds.add(q.id);
        picked.push(q);
        if (picked.length >= maxCount) return picked;
      }
    }
  }
  return picked;
}

function buildDifficultyLabel(level: DifficultyLevel): LocalizedText {
  if (level === 'Easy') {
    return { en: 'Easy', kn: 'ಸುಲಭ', hi: 'आसान' };
  }
  if (level === 'Medium') {
    return { en: 'Medium', kn: 'ಮಧ್ಯಮ', hi: 'मध्यम' };
  }
  return { en: 'Hard', kn: 'ಕಠಿಣ', hi: 'कठिन' };
}

function buildRuleExplanation(
  rule: AdaptiveRuleId,
  analysis: TopicPerformanceAnalysis,
  recommendedDifficulty: DifficultyLevel,
  prerequisiteLabel?: LocalizedText
): LocalizedText {
  const topic = analysis.topicLabel;
  const recentAcc = analysis.recentAccuracyPercent;
  const overallAcc = analysis.accuracyPercent;
  const correct = analysis.correctAnswers;
  const total = analysis.totalQuestionsAttempted;
  const diffLabel = buildDifficultyLabel(recommendedDifficulty);
  const currDiffLabel = buildDifficultyLabel(analysis.currentDifficulty);
  const prereqEn = prerequisiteLabel?.en;
  const prereqKn = prerequisiteLabel?.kn;
  const prereqHi = prerequisiteLabel?.hi;

  switch (rule) {
    case 'insufficient_evidence_hold':
      return {
        en: `Only ${total} question attempted in ${topic.en} (${recentAcc}%). Complete at least 2 questions before difficulty changes from ${currDiffLabel.en}.`,
        kn: `${topic.kn} ವಿಷಯದಲ್ಲಿ ಕೇವಲ ${total} ಪ್ರಶ್ನೆಗೆ ಉತ್ತರಿಸಲಾಗಿದೆ (${recentAcc}%). ಕಠಿಣತೆ ಬದಲಾಯಿಸುವ ಮೊದಲು ಕನಿಷ್ಠ 2 ಪ್ರಶ್ನೆಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.`,
        hi: `${topic.hi} में अभी केवल ${total} प्रश्न हल किया गया है (${recentAcc}%)। कठिनाई बदलने से पहले कम से कम 2 प्रश्न पूरे करें।`,
      };

    case 'low_accuracy_easier_and_prerequisite':
      return {
        en: prereqEn
          ? `Recent accuracy in ${topic.en} is ${recentAcc}% (${correct}/${total} correct overall), which is below 50%. Practice ${diffLabel.en} exercises and revise the prerequisite topic: ${prereqEn}.`
          : `Recent accuracy in ${topic.en} is ${recentAcc}% (${correct}/${total} correct overall), which is below 50%. Practice ${diffLabel.en} exercises to rebuild core concepts.`,
        kn: prereqKn
          ? `${topic.kn} ವಿಷಯದಲ್ಲಿ ಇತ್ತೀಚಿನ ನಿಖರತೆ ${recentAcc}% (${correct}/${total} ಸರಿ), ಇದು 50% ಕ್ಕಿಂತ ಕಡಿಮೆ ಇದೆ. ${diffLabel.kn} ಮಟ್ಟದ ಅಭ್ಯಾಸ ಮಾಡಿ ಮತ್ತು ಪೂರ್ವಾಪೇಕ್ಷಿತ ವಿಷಯ '${prereqKn}' ಅನ್ನು ಪುನರಾವರ್ತಿಸಿ.`
          : `${topic.kn} ವಿಷಯದಲ್ಲಿ ಇತ್ತೀಚಿನ ನಿಖರತೆ ${recentAcc}% (${correct}/${total} ಸರಿ), ಇದು 50% ಕ್ಕಿಂತ ಕಡಿಮೆ ಇದೆ. ಮೂಲಭೂತ ಅಂಶಗಳಿಗಾಗಿ ${diffLabel.kn} ಅಭ್ಯಾಸ ಮಾಡಿ.`,
        hi: prereqHi
          ? `${topic.hi} में हाल की सटीकता ${recentAcc}% है (${correct}/${total} सही), जो 50% से कम है। ${diffLabel.hi} स्तर के प्रश्न अभ्यास करें और पूर्व-आवश्यक विषय '${prereqHi}' दोहराएँ।`
          : `${topic.hi} में हाल की सटीकता ${recentAcc}% है (${correct}/${total} सही), जो 50% से कम है। मूल अवधारणाओं के लिए ${diffLabel.hi} अभ्यास करें।`,
      };

    case 'repeated_mistakes_revise':
      return {
        en: prereqEn
          ? `Detected ${analysis.consecutiveMistakes} consecutive mistake(s) / repeated low scores in ${topic.en} (${recentAcc}% recent, ${overallAcc}% overall). Revise ${topic.en} at ${diffLabel.en} level (and review ${prereqEn}) before advancing.`
          : `Detected repeated mistakes in ${topic.en} (${recentAcc}% recent, ${overallAcc}% overall). Complete ${diffLabel.en} revision before advancing to harder questions.`,
        kn: prereqKn
          ? `${topic.kn} ವಿಷಯದಲ್ಲಿ ಸತತ ತಪ್ಪುಗಳು ಕಂಡುಬಂದಿವೆ (${recentAcc}% ಇತ್ತೀಚಿನದು). ಮುಂದಿನ ಹಂತಕ್ಕೆ ಹೋಗುವ ಮೊದಲು ${diffLabel.kn} ಮಟ್ಟದಲ್ಲಿ ಪುನರಾವರ್ತಿಸಿ ಮತ್ತು '${prereqKn}' ಪರಿಶೀಲಿಸಿ.`
          : `${topic.kn} ವಿಷಯದಲ್ಲಿ ಸತತ ತಪ್ಪುಗಳು ಕಂಡುಬಂದಿವೆ (${recentAcc}% ಇತ್ತೀಚಿನದು). ಮುಂದುವರಿಯುವ ಮೊದಲು ${diffLabel.kn} ಹಂತದಲ್ಲಿ ಪುನರಾವರ್ತಿಸಿ.`,
        hi: prereqHi
          ? `${topic.hi} में लगातार गलतियाँ दर्ज हुई हैं (हालिया ${recentAcc}%)। आगे बढ़ने से पहले ${diffLabel.hi} स्तर पर दोहराएँ और '${prereqHi}' की समीक्षा करें।`
          : `${topic.hi} में लगातार गलतियाँ दर्ज हुई हैं (हालिया ${recentAcc}%)। आगे बढ़ने से पहले ${diffLabel.hi} स्तर पर अभ्यास करें।`,
      };

    case 'consistent_mastery_increase_difficulty':
      return {
        en: `Consistent mastery in ${topic.en}: scored above 75% across consecutive recent attempts at ${currDiffLabel.en} (latest ${recentAcc}%). Difficulty stepped up to ${diffLabel.en}.`,
        kn: `${topic.kn} ವಿಷಯದಲ್ಲಿ ಸ್ಥಿರ ಸಾಧನೆ: ${currDiffLabel.kn} ಮಟ್ಟದ ಸತತ ಪ್ರಯತ್ನಗಳಲ್ಲಿ 75% ಕ್ಕಿಂತ ಹೆಚ್ಚು ಅಂಕ (ಇತ್ತೀಚಿನದು ${recentAcc}%). ಕಠಿಣತೆಯನ್ನು ${diffLabel.kn} ಮಟ್ಟಕ್ಕೆ ಏರಿಸಲಾಗಿದೆ.`,
        hi: `${topic.hi} में निरंतर दक्षता: ${currDiffLabel.hi} स्तर के लगातार प्रयासों में 75% से अधिक अंक (नवीनतम ${recentAcc}%)। कठिनाई बढ़ाकर ${diffLabel.hi} की गई है।`,
      };

    case 'sustained_hard_mastery':
      return {
        en: `Strong mastery in ${topic.en} at Hard level (${recentAcc}% latest, ${overallAcc}% overall). Continue Hard-level reinforcement to retain mastery.`,
        kn: `${topic.kn} ವಿಷಯದ ಕಠಿಣ ಮಟ್ಟದಲ್ಲಿ ಉತ್ತಮ ಸಾಧನೆ (ಇತ್ತೀಚಿನದು ${recentAcc}%, ಒಟ್ಟು ${overallAcc}%). ಕಠಿಣ ಹಂತದ ಅಭ್ಯಾಸವನ್ನು ಮುಂದುವರಿಸಿ.`,
        hi: `${topic.hi} के कठिन स्तर पर मजबूत प्रदर्शन (नवीनतम ${recentAcc}%, कुल ${overallAcc}%)। दक्षता बनाए रखने के लिए कठिन अभ्यास जारी रखें।`,
      };

    case 'first_high_score_confirm_consistency':
      return {
        en: `Strong latest score in ${topic.en} (${recentAcc}% at ${currDiffLabel.en}). Complete one more attempt above 75% at ${currDiffLabel.en} to confirm consistency before increasing difficulty.`,
        kn: `${topic.kn} ವಿಷಯದಲ್ಲಿ ಇತ್ತೀಚಿನ ಅಂಕ ${recentAcc}% (${currDiffLabel.kn}). ಕಠಿಣತೆಯನ್ನು ಹೆಚ್ಚಿಸುವ ಮೊದಲು ಸ್ಥಿರತೆಗಾಗಿ ${currDiffLabel.kn} ಮಟ್ಟದಲ್ಲಿ ಇನ್ನೂ ಒಂದು ಪ್ರಯತ್ನದಲ್ಲಿ 75% ಕ್ಕಿಂತ ಹೆಚ್ಚು ಪಡೆಯಿರಿ.`,
        hi: `${topic.hi} में नवीनतम स्कोर ${recentAcc}% (${currDiffLabel.hi}) रहा। कठिनाई बढ़ाने से पहले निरंतरता की पुष्टि के लिए ${currDiffLabel.hi} स्तर पर एक और प्रयास में 75% से अधिक प्राप्त करें।`,
      };

    case 'moderate_accuracy_medium':
    default:
      return {
        en: `Accuracy in ${topic.en} is ${recentAcc}% (within 50%–75%). Practice ${diffLabel.en}-level questions to strengthen problem-solving accuracy.`,
        kn: `${topic.kn} ವಿಷಯದಲ್ಲಿ ನಿಖರತೆ ${recentAcc}% (50%–75% ವ್ಯಾಪ್ತಿ). ಸಮಸ್ಯೆ ಬಿಡಿಸುವ ಸಾಮರ್ಥ್ಯ ಹೆಚ್ಚಿಸಲು ${diffLabel.kn} ಮಟ್ಟದ ಪ್ರಶ್ನೆಗಳನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿ.`,
        hi: `${topic.hi} में सटीकता ${recentAcc}% है (50%–75% के बीच)। सटीकता बढ़ाने के लिए ${diffLabel.hi} स्तर के प्रश्न अभ्यास करें।`,
      };
  }
}

/**
 * Pure deterministic rule evaluator for a single analyzed topic.
 */
export function evaluateTopicRecommendation(
  analysis: TopicPerformanceAnalysis,
  questionBank: StoredQuizQuestion[],
  generatedAt = new Date().toISOString()
): AdaptiveRecommendationRecord {
  const def = getTopicDefinition(analysis.topicKey);
  const currentDiff = analysis.currentDifficulty;
  const recent2 = analysis.attemptHistory.slice(-2);

  const trailingHighAtCurrent: typeof analysis.attemptHistory = [];
  for (let i = analysis.attemptHistory.length - 1; i >= 0; i -= 1) {
    const snap = analysis.attemptHistory[i];
    if (snap.difficultyUsed === currentDiff && snap.accuracyPercent > 75) {
      trailingHighAtCurrent.push(snap);
    } else {
      break;
    }
  }
  const multiQuestionHighStreak = trailingHighAtCurrent.filter((s) => s.questionsCount >= 2).length;

  let recommendedDifficulty: DifficultyLevel = currentDiff;
  let ruleApplied: AdaptiveRuleId = 'moderate_accuracy_medium';
  let isWeakTopic = false;
  let needsPrerequisiteRevision = false;

  // Rule 1: Guard against changing difficulty on a single question
  if (analysis.totalQuestionsAttempted < 2) {
    recommendedDifficulty = currentDiff;
    ruleApplied = 'insufficient_evidence_hold';
    isWeakTopic = false;
    needsPrerequisiteRevision = false;
  }
  // Rule 2: Accuracy < 50% -> Recommend Easy exercises + prerequisite revision
  else if (analysis.recentAccuracyPercent < 50) {
    recommendedDifficulty = 'Easy';
    ruleApplied = 'low_accuracy_easier_and_prerequisite';
    isWeakTopic = true;
    needsPrerequisiteRevision = Boolean(def?.prerequisiteTopicKey);
  }
  // Rule 3: Repeated mistakes (>= 2 consecutive wrong answers at end, or 2 consecutive low <60% attempts)
  else if (
    analysis.consecutiveMistakes >= 2 ||
    (recent2.length === 2 && recent2.every((s) => s.accuracyPercent < 60))
  ) {
    recommendedDifficulty =
      analysis.recentAccuracyPercent < 60 ? 'Easy' : stepDownDifficulty(currentDiff);
    ruleApplied = 'repeated_mistakes_revise';
    isWeakTopic = analysis.accuracyPercent < 65 || analysis.recentAccuracyPercent < 60;
    needsPrerequisiteRevision = Boolean(def?.prerequisiteTopicKey && analysis.accuracyPercent < 60);
  }
  // Rule 4: Consistent >75% across >= 2 multi-question attempts at current difficulty -> step up +1
  else if (
    analysis.attemptCount >= 2 &&
    analysis.totalQuestionsAttempted >= 4 &&
    multiQuestionHighStreak >= 2 &&
    analysis.consecutiveMistakes === 0
  ) {
    if (currentDiff === 'Hard') {
      recommendedDifficulty = 'Hard';
      ruleApplied = 'sustained_hard_mastery';
    } else {
      recommendedDifficulty = stepUpDifficulty(currentDiff);
      ruleApplied = 'consistent_mastery_increase_difficulty';
    }
    isWeakTopic = false;
    needsPrerequisiteRevision = false;
  }
  // Rule 5: Latest attempt > 75%, but consistency across >= 2 attempts at current level not yet reached
  else if (analysis.recentAccuracyPercent > 75) {
    recommendedDifficulty = currentDiff;
    ruleApplied = 'first_high_score_confirm_consistency';
    isWeakTopic = false;
    needsPrerequisiteRevision = false;
  }
  // Rule 6: 50% to 75% accuracy -> Medium-level practice (hold Easy if not yet >75% on Easy)
  else {
    recommendedDifficulty = currentDiff === 'Easy' ? 'Easy' : 'Medium';
    ruleApplied = 'moderate_accuracy_medium';
    isWeakTopic = analysis.recentAccuracyPercent < 60 && analysis.accuracyPercent < 60;
    needsPrerequisiteRevision = false;
  }

  const suggestedQuestions = selectSuggestedQuestions(
    analysis.topicKey,
    recommendedDifficulty,
    questionBank,
    4
  );

  const diffLabel = buildDifficultyLabel(recommendedDifficulty);
  const suggestedExerciseTitle: LocalizedText = {
    en: `${analysis.topicLabel.en} — ${diffLabel.en} Adaptive Set`,
    kn: `${analysis.topicLabel.kn} — ${diffLabel.kn} ಹೊಂದಾಣಿಕೆಯ ಅಭ್ಯಾಸ`,
    hi: `${analysis.topicLabel.hi} — ${diffLabel.hi} अनुकूली अभ्यास`,
  };

  const explanation = buildRuleExplanation(
    ruleApplied,
    analysis,
    recommendedDifficulty,
    def?.prerequisiteTopicLabel
  );

  return {
    id: `${analysis.studentId}::${analysis.topicKey}`,
    studentId: analysis.studentId,
    subjectId: analysis.subjectId,
    topicKey: analysis.topicKey,
    topicLabel: analysis.topicLabel,
    recommendedDifficulty,
    previousDifficulty: currentDiff,
    difficultyProgression: [...analysis.difficultyProgression, recommendedDifficulty],
    isWeakTopic,
    needsPrerequisiteRevision,
    prerequisiteTopicKey: needsPrerequisiteRevision ? def?.prerequisiteTopicKey : undefined,
    prerequisiteTopicLabel: needsPrerequisiteRevision ? def?.prerequisiteTopicLabel : undefined,
    prerequisiteLessonId: needsPrerequisiteRevision ? def?.prerequisiteLessonId : undefined,
    suggestedExerciseTitle,
    suggestedQuestionIds: suggestedQuestions.map((q) => q.id),
    previousAccuracyPercent: analysis.previousAccuracyPercent ?? analysis.recentAccuracyPercent,
    recentAccuracyPercent: analysis.recentAccuracyPercent,
    improvementDelta: analysis.improvementDelta,
    attemptCount: analysis.attemptCount,
    questionsAttempted: analysis.totalQuestionsAttempted,
    correctAnswers: analysis.correctAnswers,
    incorrectAnswers: analysis.incorrectAnswers,
    ruleApplied,
    explanation,
    generatedAt,
  };
}

/**
 * Computes all deterministic adaptive recommendations for a student.
 * Returns [] if the student has zero saved quiz attempts (no fake recommendations).
 */
export function computeStudentAdaptiveRecommendations(
  studentId: string,
  attempts: QuizAttemptRecord[],
  questionBank: StoredQuizQuestion[],
  generatedAt = new Date().toISOString()
): {
  analyses: TopicPerformanceAnalysis[];
  recommendations: AdaptiveRecommendationRecord[];
} {
  const analyses = analyzeStudentTopicPerformance(studentId, attempts, questionBank);
  if (analyses.length === 0) {
    return { analyses: [], recommendations: [] };
  }

  const recommendations = analyses
    .map((analysis) => evaluateTopicRecommendation(analysis, questionBank, generatedAt))
    .sort((a, b) => {
      if (a.isWeakTopic !== b.isWeakTopic) return a.isWeakTopic ? -1 : 1;
      if (a.needsPrerequisiteRevision !== b.needsPrerequisiteRevision) {
        return a.needsPrerequisiteRevision ? -1 : 1;
      }
      return a.recentAccuracyPercent - b.recentAccuracyPercent;
    });

  return { analyses, recommendations };
}

/**
 * Builds an executable Quiz object directly from a deterministic recommendation + IndexedDB questions.
 */
export function buildAdaptiveExerciseQuiz(
  recommendation: AdaptiveRecommendationRecord,
  questionBank: StoredQuizQuestion[]
): Quiz {
  const def = getTopicDefinition(recommendation.topicKey);
  const bankById = new Map(questionBank.map((q) => [q.id, q]));

  let questions = recommendation.suggestedQuestionIds
    .map((id) => bankById.get(id))
    .filter((q): q is StoredQuizQuestion => Boolean(q));

  if (questions.length === 0) {
    questions = selectSuggestedQuestions(
      recommendation.topicKey,
      recommendation.recommendedDifficulty,
      questionBank,
      4
    );
  }

  return {
    id: `adaptive-${recommendation.topicKey}-${recommendation.recommendedDifficulty.toLowerCase()}`,
    subjectId: recommendation.subjectId,
    lessonId: def?.lessonId ?? 'math-fractions-01',
    grade: def?.grade ?? 7,
    origin: 'local',
    isAdaptiveExercise: true,
    targetTopicKey: recommendation.topicKey,
    targetDifficulty: recommendation.recommendedDifficulty,
    title: recommendation.suggestedExerciseTitle,
    description: recommendation.explanation,
    questions,
  };
}

/**
 * Builds Teacher Dashboard adaptive overview rows combining live IndexedDB attempts
 * with clearly distinguished sample roster baselines when a student has no local attempts yet.
 */
export function buildTeacherAdaptiveOverview(
  studentsRoster: StudentRosterRecord[],
  allAttempts: QuizAttemptRecord[],
  questionBank: StoredQuizQuestion[]
): {
  studentRows: StudentAdaptiveOverviewRow[];
  topicSummaries: Array<{
    topicKey: string;
    topicLabel: LocalizedText;
    studentsPracticed: number;
    weakStudentCount: number;
    averageRecentAccuracy: number;
    averageImprovementDelta: number | null;
    prerequisiteCount: number;
  }>;
} {
  const studentRows: StudentAdaptiveOverviewRow[] = [];
  const topicRecsAll: AdaptiveRecommendationRecord[] = [];

  for (const student of studentsRoster) {
    const studentAttempts = allAttempts.filter((a) => a.studentId === student.id);
    if (studentAttempts.length === 0) {
      studentRows.push({
        studentId: student.id,
        studentName: student.name,
        grade: student.grade,
        origin: student.origin,
        hasLiveAdaptiveData: false,
        attemptsCount: 0,
        weakTopics: [],
        recommendedRevisionTopics: [],
        difficultyProgressions: [],
        overallImprovementDelta: null,
        latestAccuracyPercent: null,
        sampleBaselineWeakTopics: student.weakTopics,
      });
      continue;
    }

    const { analyses, recommendations } = computeStudentAdaptiveRecommendations(
      student.id,
      studentAttempts,
      questionBank
    );
    topicRecsAll.push(...recommendations);

    const weakTopics = recommendations
      .filter((r) => r.isWeakTopic)
      .map((r) => r.topicLabel.en);

    const revisionSet = new Set<string>();
    for (const r of recommendations) {
      if (r.needsPrerequisiteRevision && r.prerequisiteTopicLabel) {
        revisionSet.add(`${r.prerequisiteTopicLabel.en} (before ${r.topicLabel.en})`);
      } else if (r.ruleApplied === 'repeated_mistakes_revise') {
        revisionSet.add(r.topicLabel.en);
      }
    }

    const deltas = analyses
      .map((a) => a.improvementDelta)
      .filter((d): d is number => d !== null);
    const overallImprovementDelta =
      deltas.length > 0 ? Math.round(deltas.reduce((s, d) => s + d, 0) / deltas.length) : null;

    const sortedAttempts = studentAttempts
      .slice()
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    studentRows.push({
      studentId: student.id,
      studentName: student.name,
      grade: student.grade,
      origin: student.origin,
      hasLiveAdaptiveData: true,
      attemptsCount: studentAttempts.length,
      weakTopics,
      recommendedRevisionTopics: Array.from(revisionSet),
      difficultyProgressions: recommendations.map((r) => ({
        topicKey: r.topicKey,
        topicLabel: r.topicLabel.en,
        progression: r.difficultyProgression,
        currentRecommended: r.recommendedDifficulty,
      })),
      overallImprovementDelta,
      latestAccuracyPercent: sortedAttempts[0]?.percentage ?? null,
      sampleBaselineWeakTopics: student.weakTopics,
    });
  }

  const byTopic = new Map<
    string,
    {
      topicLabel: LocalizedText;
      recs: AdaptiveRecommendationRecord[];
    }
  >();

  for (const rec of topicRecsAll) {
    const existing = byTopic.get(rec.topicKey) ?? {
      topicLabel: rec.topicLabel,
      recs: [],
    };
    existing.recs.push(rec);
    byTopic.set(rec.topicKey, existing);
  }

  const topicSummaries = Array.from(byTopic.entries())
    .map(([topicKey, entry]) => {
      const n = entry.recs.length;
      const avgAcc = Math.round(
        entry.recs.reduce((sum, r) => sum + r.recentAccuracyPercent, 0) / n
      );
      const deltas = entry.recs
        .map((r) => r.improvementDelta)
        .filter((d): d is number => d !== null);
      const avgDelta =
        deltas.length > 0 ? Math.round(deltas.reduce((s, d) => s + d, 0) / deltas.length) : null;

      return {
        topicKey,
        topicLabel: entry.topicLabel,
        studentsPracticed: n,
        weakStudentCount: entry.recs.filter((r) => r.isWeakTopic).length,
        averageRecentAccuracy: avgAcc,
        averageImprovementDelta: avgDelta,
        prerequisiteCount: entry.recs.filter((r) => r.needsPrerequisiteRevision).length,
      };
    })
    .sort((a, b) => a.averageRecentAccuracy - b.averageRecentAccuracy);

  return { studentRows, topicSummaries };
}
