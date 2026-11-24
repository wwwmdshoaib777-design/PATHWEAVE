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
  title: LocalizedText;
  summary: LocalizedText;
  estimatedMinutes: number;
  sizeKB: number;
  sections: LessonSection[];
  origin: DataOrigin;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  topicKey: string;
  topicLabel: LocalizedText;
  prompt: LocalizedText;
  options: LocalizedText[];
  correctIndex: number;
  explanation: LocalizedText;
}

export interface StoredQuizQuestion extends QuizQuestion {
  quizId: string;
  subjectId: SubjectId;
  orderIndex: number;
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

export interface QuizAttemptRecord {
  id: string;
  quizId: string;
  subjectId: SubjectId;
  studentId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: Record<string, number>;
  topicResults: Array<{
    topicKey: string;
    topicLabel: LocalizedText;
    correct: boolean;
  }>;
  submittedAt: string;
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
    | 'student'
    | 'material'
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
  category: 'lesson' | 'quiz' | 'download' | 'material' | 'student';
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
  | 'performance'
  | 'synchronization'
  | 'settings';
