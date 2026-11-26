export type UserRole = 'student' | 'teacher';

export type LanguageCode = 'en' | 'kn' | 'hi';

export interface LocalizedText {
  en: string;
  kn: string;
  hi: string;
}

export type DataOrigin = 'sample' | 'local';

export interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  schoolName: string;
  district: string;
  gradeOrSubject: string;
  preferredLanguage: LanguageCode;
}

export type SubjectId = 'math' | 'science';

export interface Subject {
  id: SubjectId;
  code: string;
  title: LocalizedText;
  description: LocalizedText;
  gradeRange: string;
  illustrationUrl: string;
  lessonCount: number;
}

export interface LessonSection {
  heading: LocalizedText;
  body: LocalizedText;
  keyTakeaway?: LocalizedText;
}

export interface Lesson {
  id: string;
  subjectId: SubjectId;
  grade: number;
  topic: LocalizedText;
  topicKey?: string;
  title: LocalizedText;
  summary: LocalizedText;
  estimatedMinutes: number;
  sizeKB: number;
  sections: LessonSection[];
  origin: DataOrigin;
  authoredLanguage?: LanguageCode;
  createdAt: string;
  updatedAt?: string;
}

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface QuizQuestion {
  id: string;
  topicKey: string;
  topicLabel: LocalizedText;
  difficulty: DifficultyLevel;
  language: LanguageCode;
  languages: LanguageCode[];
  prompt: LocalizedText;
  options: LocalizedText[];
  correctIndex: number;
  explanation: LocalizedText;
  prerequisiteTopicKey?: string;
  prerequisiteTopicLabel?: LocalizedText;
}

export interface StoredQuizQuestion extends QuizQuestion {
  quizId: string;
  subjectId: SubjectId;
  orderIndex: number;
  lessonId?: string;
  origin?: DataOrigin;
  createdAt?: string;
  updatedAt?: string;
}

export interface Quiz {
  id: string;
  subjectId: SubjectId;
  lessonId: string;
  grade: number;
  title: LocalizedText;
  description: LocalizedText;
  questions: QuizQuestion[];
  origin: DataOrigin;
  isAdaptiveExercise?: boolean;
  targetTopicKey?: string;
  targetDifficulty?: DifficultyLevel;
}

export interface LessonProgressRecord {
  lessonId: string;
  studentId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completionPercent: number;
  lastViewedAt: string;
  completedAt?: string;
}

export interface TopicProgressRecord {
  id: string;
  studentId: string;
  subjectId: SubjectId;
  topicKey: string;
  topicLabel: LocalizedText;
  attemptsCount: number;
  questionsAnswered: number;
  correctCount: number;
  accuracyPercent: number;
  lastPracticedAt: string;
}

export interface QuizAttemptTopicResult {
  questionId?: string;
  topicKey: string;
  topicLabel: LocalizedText;
  difficulty?: DifficultyLevel;
  correct: boolean;
}

export interface QuizAttemptRecord {
  id: string;
  quizId: string;
  subjectId: SubjectId;
  studentId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: Record<string, number>;
  topicResults: QuizAttemptTopicResult[];
  submittedAt: string;
  mode?: 'standard_quiz' | 'adaptive_practice';
  targetDifficulty?: DifficultyLevel;
}

export interface TopicAttemptSnapshot {
  attemptId: string;
  submittedAt: string;
  questionsCount: number;
  correctCount: number;
  accuracyPercent: number;
  difficultyUsed: DifficultyLevel;
}

export interface TopicPerformanceAnalysis {
  studentId: string;
  subjectId: SubjectId;
  topicKey: string;
  topicLabel: LocalizedText;
  totalQuestionsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracyPercent: number;
  recentAccuracyPercent: number;
  previousAccuracyPercent: number | null;
  firstAccuracyPercent: number;
  improvementDelta: number | null;
  netImprovementDelta: number | null;
  trend: 'improving' | 'declining' | 'steady' | 'insufficient_data';
  attemptCount: number;
  attemptHistory: TopicAttemptSnapshot[];
  consecutiveMistakes: number;
  currentDifficulty: DifficultyLevel;
  difficultyProgression: DifficultyLevel[];
  meetsMinimumQuestionThreshold: boolean;
  lastPracticedAt: string;
}

export type AdaptiveRuleId =
  | 'insufficient_evidence_hold'
  | 'low_accuracy_easier_and_prerequisite'
  | 'repeated_mistakes_revise'
  | 'moderate_accuracy_medium'
  | 'first_high_score_confirm_consistency'
  | 'consistent_mastery_increase_difficulty'
  | 'sustained_hard_mastery';

export interface AdaptiveRecommendationRecord {
  id: string;
  studentId: string;
  subjectId: SubjectId;
  topicKey: string;
  topicLabel: LocalizedText;
  recommendedDifficulty: DifficultyLevel;
  previousDifficulty: DifficultyLevel;
  difficultyProgression: DifficultyLevel[];
  isWeakTopic: boolean;
  meetsMinimumQuestionThreshold: boolean;
  needsPrerequisiteRevision: boolean;
  prerequisiteTopicKey?: string;
  prerequisiteTopicLabel?: LocalizedText;
  prerequisiteLessonId?: string;
  suggestedExerciseTitle: LocalizedText;
  suggestedQuestionIds: string[];
  previousAccuracyPercent: number;
  recentAccuracyPercent: number;
  cumulativeAccuracyPercent: number;
  improvementDelta: number | null;
  netImprovementDelta: number | null;
  attemptCount: number;
  questionsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  ruleApplied: AdaptiveRuleId;
  explanation: LocalizedText;
  generatedAt: string;
}

export interface StudentAdaptiveOverviewRow {
  studentId: string;
  studentName: string;
  grade: number;
  origin: DataOrigin;
  hasLiveAdaptiveData: boolean;
  attemptsCount: number;
  weakTopics: string[];
  insufficientDataTopics: Array<{
    topicKey: string;
    topicLabel: string;
    questionsAttempted: number;
    latestAccuracyPercent: number;
  }>;
  recommendedRevisionTopics: string[];
  difficultyProgressions: Array<{
    topicKey: string;
    topicLabel: string;
    progression: DifficultyLevel[];
    currentRecommended: DifficultyLevel;
    attemptAccuracies: number[];
    latestAccuracyPercent: number;
    cumulativeAccuracyPercent: number;
    improvementDelta: number | null;
    netImprovementDelta: number | null;
    questionsAttempted: number;
    meetsMinThreshold: boolean;
  }>;
  overallImprovementDelta: number | null;
  chronologicalQuizImprovementDelta: number | null;
  latestAccuracyPercent: number | null;
  cumulativeAccuracyPercent: number | null;
  sampleBaselineWeakTopics: string[];
}

export interface DownloadedMaterialRecord {
  lessonId: string;
  downloadedAt: string;
  sizeKB: number;
  packetVersion: string;
}

export interface DownloadedLessonRecord {
  id: string;
  lesson: Lesson;
  downloadedAt: string;
  sizeKB: number;
  packetVersion: string;
  cachedAssetUrls: string[];
}

export interface StudentRosterRecord {
  id: string;
  name: string;
  grade: number;
  preferredLanguage: LanguageCode;
  lessonsCompleted: number;
  averageScore: number;
  weakTopics: string[];
  lastActiveAt: string;
  origin: DataOrigin;
}

export interface LearningPacket {
  id: string;
  title: string;
  subjectId: SubjectId;
  lessonIds: string[];
  version: string;
  totalSizeKB: number;
  createdAt: string;
  status: 'staged_local' | 'cached_offline';
  origin: DataOrigin;
}

export interface SyncQueueItem {
  id: string;
  entityType:
    | 'progress'
    | 'topic_progress'
    | 'quiz_attempt'
    | 'adaptive_recommendation'
    | 'student'
    | 'material'
    | 'question'
    | 'packet';
  entityId: string;
  action: 'create' | 'update' | 'delete';
  summary: string;
  payload?: unknown;
  createdAt: string;
  status: 'pending' | 'failed_retained';
  retryCount: number;
  lastAttemptAt?: string | null;
  lastError?: string | null;
}

export interface ActivityRecord {
  id: string;
  actorRole: UserRole;
  actorName: string;
  description: LocalizedText;
  timestamp: string;
  category: 'lesson' | 'quiz' | 'adaptive' | 'download' | 'material' | 'student';
}

export type StudentNavTab =
  | 'dashboard'
  | 'subjects'
  | 'lessons'
  | 'practice'
  | 'progress'
  | 'settings';

export type TeacherNavTab =
  | 'dashboard'
  | 'students'
  | 'materials'
  | 'questions'
  | 'performance'
  | 'synchronization'
  | 'settings';
