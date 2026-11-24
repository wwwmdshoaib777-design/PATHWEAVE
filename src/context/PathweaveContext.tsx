import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  ActivityRecord,
  DownloadedLessonRecord,
  DownloadedMaterialRecord,
  LanguageCode,
  LearningPacket,
  Lesson,
  LessonProgressRecord,
  Quiz,
  QuizAttemptRecord,
  StudentNavTab,
  StudentRosterRecord,
  Subject,
  SubjectId,
  SyncQueueItem,
  TeacherNavTab,
  TopicProgressRecord,
  UserProfile,
  UserRole,
} from '../types/domain';
import { CreateStudentInput, roleService } from '../modules/auth/roleService';
import { CreateLocalLessonInput, lessonService } from '../modules/curriculum/lessonService';
import { NetworkStatusState, useNetworkStatus } from '../modules/network/useNetworkStatus';
import { packetService } from '../modules/packets/packetService';
import { progressService } from '../modules/progress/progressService';
import {
  ServiceWorkerStatus,
  usePWAInstall,
  useServiceWorkerManager,
} from '../modules/pwa/pwaService';
import { quizService } from '../modules/quiz/quizService';
import { storageService } from '../modules/storage/storageService';
import { StoreName } from '../modules/storage/StorageAdapter';
import { SyncAttemptSummary, syncService } from '../modules/sync/syncService';
import { TRANSLATIONS, UIMessages } from '../modules/i18n/translations';

interface StorageDiagnostics {
  engine: 'IndexedDB' | 'localStorage';
  counts: Record<StoreName, number>;
  error: string | null;
}

interface PathweaveContextValue {
  ready: boolean;
  role: UserRole;
  language: LanguageCode;
  messages: UIMessages;
  profile: UserProfile;
  studentTab: StudentNavTab;
  teacherTab: TeacherNavTab;
  selectedSubjectFilter: SubjectId | 'all';
  activeLessonId: string | null;
  activeQuizId: string | null;
  subjects: Subject[];
  lessons: Lesson[];
  quizzes: Quiz[];
  progressRecords: LessonProgressRecord[];
  topicProgress: TopicProgressRecord[];
  quizAttempts: QuizAttemptRecord[];
  allQuizAttempts: QuizAttemptRecord[];
  downloadedMaterials: DownloadedMaterialRecord[];
  downloadedLessons: DownloadedLessonRecord[];
  studentsRoster: StudentRosterRecord[];
  learningPackets: LearningPacket[];
  syncQueue: SyncQueueItem[];
  lastSyncResult: SyncAttemptSummary | null;
  recentActivity: ActivityRecord[];
  network: NetworkStatusState;
  offlineTestMode: boolean;
  diagnostics: StorageDiagnostics | null;
  swStatus: ServiceWorkerStatus;
  applySwUpdate: () => Promise<void>;
  dismissSwUpdate: () => void;
  pwaInstall: ReturnType<typeof usePWAInstall>;
  setStudentTab: (tab: StudentNavTab) => void;
  setTeacherTab: (tab: TeacherNavTab) => void;
  setSelectedSubjectFilter: (filter: SubjectId | 'all') => void;
  openLessonReader: (lessonId: string) => Promise<void>;
  closeLessonReader: () => void;
  openQuizRunner: (quizId: string) => void;
  closeQuizRunner: () => void;
  switchRole: (nextRole: UserRole) => Promise<void>;
  changeLanguage: (nextLang: LanguageCode) => Promise<void>;
  setOfflineTestMode: (enabled: boolean) => Promise<void>;
  toggleDownloadLesson: (lesson: Lesson) => Promise<void>;
  markLessonCompleted: (lesson: Lesson) => Promise<void>;
  submitQuiz: (quiz: Quiz, answers: Record<string, number>) => Promise<QuizAttemptRecord>;
  attemptSync: () => Promise<SyncAttemptSummary>;
  addLocalStudent: (input: CreateStudentInput) => Promise<void>;
  removeLocalStudent: (studentId: string) => Promise<void>;
  createLocalLesson: (input: CreateLocalLessonInput) => Promise<void>;
  removeLocalLesson: (lessonId: string) => Promise<void>;
  createLearningPacket: (title: string, subjectId: SubjectId, lessonIds: string[]) => Promise<void>;
  exportPacketJson: (packet: LearningPacket) => void;
  resetLocalStorage: () => Promise<void>;
}

const PathweaveContext = createContext<PathweaveContextValue | null>(null);

export const PathweaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<UserRole>('student');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [offlineTestMode, setOfflineTestModeState] = useState<boolean>(false);
  const [studentProfile, setStudentProfile] = useState<UserProfile | null>(null);
  const [studentTab, setStudentTab] = useState<StudentNavTab>('dashboard');
  const [teacherTab, setTeacherTab] = useState<TeacherNavTab>('dashboard');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<SubjectId | 'all'>('all');
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [progressRecords, setProgressRecords] = useState<LessonProgressRecord[]>([]);
  const [topicProgress, setTopicProgress] = useState<TopicProgressRecord[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttemptRecord[]>([]);
  const [allQuizAttempts, setAllQuizAttempts] = useState<QuizAttemptRecord[]>([]);
  const [downloadedMaterials, setDownloadedMaterials] = useState<DownloadedMaterialRecord[]>([]);
  const [downloadedLessons, setDownloadedLessons] = useState<DownloadedLessonRecord[]>([]);
  const [studentsRoster, setStudentsRoster] = useState<StudentRosterRecord[]>([]);
  const [learningPackets, setLearningPackets] = useState<LearningPacket[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [lastSyncResult, setLastSyncResult] = useState<SyncAttemptSummary | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityRecord[]>([]);
  const [diagnostics, setDiagnostics] = useState<StorageDiagnostics | null>(null);

  const network = useNetworkStatus(offlineTestMode);
  const swManager = useServiceWorkerManager();
  const pwaInstall = usePWAInstall();

  const refreshData = useCallback(async (studentId: string) => {
    const [
      loadedSubjects,
      loadedLessons,
      loadedQuizzes,
      loadedProgress,
      loadedTopicProgress,
      loadedStudentAttempts,
      loadedAllAttempts,
      loadedDownloads,
      loadedFullDownloads,
      loadedStudents,
      loadedPackets,
      loadedQueue,
      loadedActivity,
      loadedDiagnostics,
    ] = await Promise.all([
      lessonService.getSubjects(),
      lessonService.getAllLessons(),
      quizService.getQuizzesFromDb(),
      progressService.getStudentLessonProgress(studentId),
      progressService.getTopicProgressForStudent(studentId),
      quizService.getAttemptsForStudent(studentId),
      quizService.getAllAttempts(),
      lessonService.getDownloadedMaterials(),
      lessonService.getDownloadedLessons(),
      roleService.getAllStudents(),
      packetService.getAllPackets(),
      syncService.getQueuedItems(),
      progressService.getRecentActivity(),
      storageService.getDiagnostics(),
    ]);

    setSubjects(loadedSubjects);
    setLessons(loadedLessons);
    setQuizzes(loadedQuizzes);
    setProgressRecords(loadedProgress);
    setTopicProgress(loadedTopicProgress);
    setQuizAttempts(loadedStudentAttempts);
    setAllQuizAttempts(loadedAllAttempts);
    setDownloadedMaterials(loadedDownloads);
    setDownloadedLessons(loadedFullDownloads);
    setStudentsRoster(loadedStudents);
    setLearningPackets(loadedPackets);
    setSyncQueue(loadedQueue);
    setRecentActivity(loadedActivity);
    setDiagnostics(loadedDiagnostics);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const prefs = await roleService.getSavedPreferences();
      if (cancelled) return;

      const seededStudent = await roleService.ensureProfilesSeeded();
      await lessonService.ensureSubjectsSeeded();
      await quizService.ensureQuizzesSeeded();

      if (cancelled) return;
      setRole(prefs.role);
      setLanguage(prefs.language);
      setOfflineTestModeState(prefs.offlineTestMode);
      setStudentProfile({ ...seededStudent, preferredLanguage: prefs.language });

      await refreshData(seededStudent.id);

      if (!cancelled) {
        setReady(true);
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [refreshData]);

  const fallbackStudentProfile = roleService.getProfileForRole('student', language);
  const activeStudentProfile = studentProfile
    ? { ...studentProfile, preferredLanguage: language }
    : fallbackStudentProfile;
  const profile =
    role === 'student' ? activeStudentProfile : roleService.getProfileForRole('teacher', language);
  const studentProfileId = activeStudentProfile.id;
  const messages = TRANSLATIONS[language];

  const switchRole = useCallback(async (nextRole: UserRole) => {
    setRole(nextRole);
    setActiveLessonId(null);
    setActiveQuizId(null);
    await roleService.saveRolePreference(nextRole);
  }, []);

  const changeLanguage = useCallback(async (nextLang: LanguageCode) => {
    setLanguage(nextLang);
    setStudentProfile((prev) => (prev ? { ...prev, preferredLanguage: nextLang } : prev));
    await roleService.saveLanguagePreference(nextLang);
  }, []);

  const setOfflineTestMode = useCallback(async (enabled: boolean) => {
    setOfflineTestModeState(enabled);
    await roleService.saveOfflineTestMode(enabled);
  }, []);

  const openLessonReader = useCallback(
    async (lessonId: string) => {
      setActiveLessonId(lessonId);
      setStudentTab('lessons');
      const isDownloaded = downloadedMaterials.some((d) => d.lessonId === lessonId);
      if (!network.isOnline && !isDownloaded) {
        return;
      }

      const progress = await progressService.markLessonViewed(studentProfileId, lessonId);
      const lesson = await lessonService.getLessonById(lessonId);
      if (lesson) {
        await progressService.logActivity({
          actorRole: 'student',
          actorName: roleService.getProfileForRole('student', language).name,
          category: 'lesson',
          description: {
            en: `Opened lesson: ${lesson.title.en}`,
            kn: `ಪಾಠ ತೆರೆಯಲಾಗಿದೆ: ${lesson.title.kn}`,
            hi: `पाठ खोला गया: ${lesson.title.hi}`,
          },
        });
        await syncService.enqueueLocalMutation({
          entityType: 'progress',
          entityId: lesson.id,
          action: 'update',
          summary: `Viewed lesson: ${lesson.title.en}`,
          payload: progress,
        });
      }
      await refreshData(studentProfileId);
    },
    [downloadedMaterials, language, network.isOnline, refreshData, studentProfileId]
  );

  const closeLessonReader = useCallback(() => {
    setActiveLessonId(null);
  }, []);

  const openQuizRunner = useCallback((quizId: string) => {
    setActiveQuizId(quizId);
    setStudentTab('practice');
  }, []);

  const closeQuizRunner = useCallback(() => {
    setActiveQuizId(null);
  }, []);

  const toggleDownloadLesson = useCallback(
    async (lesson: Lesson) => {
      const exists = downloadedMaterials.some((d) => d.lessonId === lesson.id);
      if (exists) {
        await lessonService.removeOfflineLesson(lesson.id);
      } else {
        if (!network.isOnline) {
          return;
        }
        await lessonService.saveLessonOffline(lesson);
        await progressService.logActivity({
          actorRole: 'student',
          actorName: activeStudentProfile.name,
          category: 'download',
          description: {
            en: `Saved lesson offline: ${lesson.title.en}`,
            kn: `ಪಾಠವನ್ನು ಆಫ್‌ಲೈನ್‌ಗೆ ಉಳಿಸಲಾಗಿದೆ: ${lesson.title.kn}`,
            hi: `पाठ ऑफ़लाइन सहेजा गया: ${lesson.title.hi}`,
          },
        });
      }
      await refreshData(studentProfileId);
    },
    [activeStudentProfile.name, downloadedMaterials, network.isOnline, refreshData, studentProfileId]
  );

  const markLessonCompleted = useCallback(
    async (lesson: Lesson) => {
      const record = await progressService.markLessonCompleted(studentProfileId, lesson.id);
      await progressService.logActivity({
        actorRole: 'student',
        actorName: roleService.getProfileForRole('student', language).name,
        category: 'lesson',
        description: {
          en: `Completed lesson: ${lesson.title.en}`,
          kn: `ಪಾಠ ಪೂರ್ಣಗೊಂಡಿದೆ: ${lesson.title.kn}`,
          hi: `पाठ पूर्ण हुआ: ${lesson.title.hi}`,
        },
      });
      await syncService.enqueueLocalMutation({
        entityType: 'progress',
        entityId: lesson.id,
        action: 'update',
        summary: `Lesson marked completed: ${lesson.title.en}`,
        payload: record,
      });
      await refreshData(studentProfileId);
    },
    [language, refreshData, studentProfileId]
  );

  const submitQuiz = useCallback(
    async (quiz: Quiz, answers: Record<string, number>) => {
      const attempt = await quizService.submitQuizAttempt(quiz, studentProfileId, answers);
      const updatedTopics = await progressService.updateTopicProgressFromAttempt(attempt);

      await progressService.logActivity({
        actorRole: 'student',
        actorName: roleService.getProfileForRole('student', language).name,
        category: 'quiz',
        description: {
          en: `Scored ${attempt.score}/${attempt.totalQuestions} (${attempt.percentage}%) on ${quiz.title.en}`,
          kn: `${quiz.title.kn} ರಸಪ್ರಶ್ನೆಯಲ್ಲಿ ${attempt.score}/${attempt.totalQuestions} (${attempt.percentage}%) ಅಂಕ`,
          hi: `${quiz.title.hi} में ${attempt.score}/${attempt.totalQuestions} (${attempt.percentage}%) अंक प्राप्त किए`,
        },
      });

      await syncService.enqueueLocalMutation({
        entityType: 'quiz_attempt',
        entityId: attempt.id,
        action: 'create',
        summary: `Quiz attempt (${attempt.percentage}%): ${quiz.title.en}`,
        payload: attempt,
      });

      for (const topic of updatedTopics) {
        await syncService.enqueueLocalMutation({
          entityType: 'topic_progress',
          entityId: topic.id,
          action: 'update',
          summary: `Topic mastery updated (${topic.topicLabel.en}: ${topic.accuracyPercent}%)`,
          payload: topic,
        });
      }

      await refreshData(studentProfileId);
      return attempt;
    },
    [language, refreshData, studentProfileId]
  );

  const attemptSync = useCallback(async () => {
    const reachable = await network.verifyConnectivity();
    const effectiveOnline = reachable && !offlineTestMode;
    const summary = await syncService.attemptSync(effectiveOnline);
    setLastSyncResult(summary);
    await refreshData(studentProfileId);
    return summary;
  }, [network, offlineTestMode, refreshData, studentProfileId]);

  const addLocalStudent = useCallback(
    async (input: CreateStudentInput) => {
      const created = await roleService.addLocalStudent(input);
      await progressService.logActivity({
        actorRole: 'teacher',
        actorName: roleService.getProfileForRole('teacher', language).name,
        category: 'student',
        description: {
          en: `Added student to local roster: ${created.name} (Grade ${created.grade})`,
          kn: `ಸ್ಥಳೀಯ ಪಟ್ಟಿಗೆ ವಿದ್ಯಾರ್ಥಿ ಸೇರ್ಪಡೆ: ${created.name} (ತರಗತಿ ${created.grade})`,
          hi: `स्थानीय सूची में छात्र जोड़ा गया: ${created.name} (कक्षा ${created.grade})`,
        },
      });
      await syncService.enqueueLocalMutation({
        entityType: 'student',
        entityId: created.id,
        action: 'create',
        summary: `Added student: ${created.name} (Grade ${created.grade})`,
        payload: created,
      });
      await refreshData(studentProfileId);
    },
    [language, refreshData, studentProfileId]
  );

  const removeLocalStudent = useCallback(
    async (studentId: string) => {
      await roleService.deleteLocalStudent(studentId);
      await refreshData(studentProfileId);
    },
    [refreshData, studentProfileId]
  );

  const createLocalLesson = useCallback(
    async (input: CreateLocalLessonInput) => {
      const lesson = await lessonService.createLocalLesson(input);
      await progressService.logActivity({
        actorRole: 'teacher',
        actorName: roleService.getProfileForRole('teacher', language).name,
        category: 'material',
        description: {
          en: `Created local lesson: ${lesson.title.en}`,
          kn: `ಹೊಸ ಸ್ಥಳೀಯ ಪಾಠ ರಚಿಸಲಾಗಿದೆ: ${lesson.title.kn}`,
          hi: `नया स्थानीय पाठ बनाया गया: ${lesson.title.hi}`,
        },
      });
      await syncService.enqueueLocalMutation({
        entityType: 'material',
        entityId: lesson.id,
        action: 'create',
        summary: `Created local lesson: ${lesson.title.en}`,
        payload: lesson,
      });
      await refreshData(studentProfileId);
    },
    [language, refreshData, studentProfileId]
  );

  const removeLocalLesson = useCallback(
    async (lessonId: string) => {
      await lessonService.deleteLocalLesson(lessonId);
      await refreshData(studentProfileId);
    },
    [refreshData, studentProfileId]
  );

  const createLearningPacket = useCallback(
    async (title: string, subjectId: SubjectId, lessonIds: string[]) => {
      const selected = lessons.filter((l) => lessonIds.includes(l.id));
      const packet = await packetService.createLocalPacket(title, subjectId, selected);
      await syncService.enqueueLocalMutation({
        entityType: 'packet',
        entityId: packet.id,
        action: 'create',
        summary: `Packaged learning bundle: ${packet.title} (${packet.lessonIds.length} lessons)`,
        payload: packet,
      });
      await refreshData(studentProfileId);
    },
    [lessons, refreshData, studentProfileId]
  );

  const exportPacketJson = useCallback(
    (packet: LearningPacket) => {
      packetService.exportPacketManifestAsJson(packet, lessons);
    },
    [lessons]
  );

  const resetLocalStorage = useCallback(async () => {
    await storageService.resetUserLearningData();
    await roleService.saveRolePreference(role);
    await roleService.saveLanguagePreference(language);
    setLastSyncResult(null);
    await refreshData(studentProfileId);
  }, [language, refreshData, role, studentProfileId]);

  return (
    <PathweaveContext.Provider
      value={{
        ready,
        role,
        language,
        messages,
        profile,
        studentTab,
        teacherTab,
        selectedSubjectFilter,
        activeLessonId,
        activeQuizId,
        subjects,
        lessons,
        quizzes,
        progressRecords,
        topicProgress,
        quizAttempts,
        allQuizAttempts,
        downloadedMaterials,
        downloadedLessons,
        studentsRoster,
        learningPackets,
        syncQueue,
        lastSyncResult,
        recentActivity,
        network,
        offlineTestMode,
        diagnostics,
        swStatus: swManager.status,
        applySwUpdate: swManager.applyUpdate,
        dismissSwUpdate: swManager.dismissUpdate,
        pwaInstall,
        setStudentTab,
        setTeacherTab,
        setSelectedSubjectFilter,
        openLessonReader,
        closeLessonReader,
        openQuizRunner,
        closeQuizRunner,
        switchRole,
        changeLanguage,
        setOfflineTestMode,
        toggleDownloadLesson,
        markLessonCompleted,
        submitQuiz,
        attemptSync,
        addLocalStudent,
        removeLocalStudent,
        createLocalLesson,
        removeLocalLesson,
        createLearningPacket,
        exportPacketJson,
        resetLocalStorage,
      }}
    >
      {children}
    </PathweaveContext.Provider>
  );
};

export function usePathweave(): PathweaveContextValue {
  const ctx = useContext(PathweaveContext);
  if (!ctx) {
    throw new Error('usePathweave must be used within PathweaveProvider');
  }
  return ctx;
}
