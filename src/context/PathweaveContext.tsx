import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  ActivityRecord,
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
  UserProfile,
  UserRole,
} from '../types/domain';
import { CreateStudentInput, roleService } from '../modules/auth/roleService';
import { CreateLocalLessonInput, lessonService } from '../modules/curriculum/lessonService';
import { NetworkStatusState, useNetworkStatus } from '../modules/network/useNetworkStatus';
import { packetService } from '../modules/packets/packetService';
import { progressService } from '../modules/progress/progressService';
import {
  registerPathweaveServiceWorker,
  ServiceWorkerStatus,
  usePWAInstall,
} from '../modules/pwa/pwaService';
import { quizService } from '../modules/quiz/quizService';
import { storageService } from '../modules/storage/storageService';
import { StoreName } from '../modules/storage/StorageAdapter';
import { syncService } from '../modules/sync/syncService';
import { TRANSLATIONS, UIMessages } from '../modules/i18n/translations';

interface StorageDiagnostics {
  engine: 'IndexedDB' | 'localStorage';
  counts: Record<StoreName, number>;
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
  quizAttempts: QuizAttemptRecord[];
  allQuizAttempts: QuizAttemptRecord[];
  downloadedMaterials: DownloadedMaterialRecord[];
  studentsRoster: StudentRosterRecord[];
  learningPackets: LearningPacket[];
  syncQueue: SyncQueueItem[];
  recentActivity: ActivityRecord[];
  network: NetworkStatusState;
  diagnostics: StorageDiagnostics | null;
  swStatus: ServiceWorkerStatus;
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
  toggleDownloadLesson: (lesson: Lesson) => Promise<void>;
  markLessonCompleted: (lesson: Lesson) => Promise<void>;
  submitQuiz: (quiz: Quiz, answers: Record<string, number>) => Promise<QuizAttemptRecord>;
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
  const [studentTab, setStudentTab] = useState<StudentNavTab>('dashboard');
  const [teacherTab, setTeacherTab] = useState<TeacherNavTab>('dashboard');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<SubjectId | 'all'>('all');
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes] = useState<Quiz[]>(() => quizService.getQuizzes());
  const [progressRecords, setProgressRecords] = useState<LessonProgressRecord[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttemptRecord[]>([]);
  const [allQuizAttempts, setAllQuizAttempts] = useState<QuizAttemptRecord[]>([]);
  const [downloadedMaterials, setDownloadedMaterials] = useState<DownloadedMaterialRecord[]>([]);
  const [studentsRoster, setStudentsRoster] = useState<StudentRosterRecord[]>([]);
  const [learningPackets, setLearningPackets] = useState<LearningPacket[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityRecord[]>([]);
  const [diagnostics, setDiagnostics] = useState<StorageDiagnostics | null>(null);
  const [swStatus, setSwStatus] = useState<ServiceWorkerStatus>({
    supported: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
    registered: false,
    scope: null,
    error: null,
  });

  const network = useNetworkStatus();
  const pwaInstall = usePWAInstall();

  const refreshData = useCallback(async (studentId: string) => {
    const [
      loadedSubjects,
      loadedLessons,
      loadedProgress,
      loadedStudentAttempts,
      loadedAllAttempts,
      loadedDownloads,
      loadedStudents,
      loadedPackets,
      loadedQueue,
      loadedActivity,
      loadedDiagnostics,
    ] = await Promise.all([
      lessonService.getSubjects(),
      lessonService.getAllLessons(),
      progressService.getStudentLessonProgress(studentId),
      quizService.getAttemptsForStudent(studentId),
      quizService.getAllAttempts(),
      lessonService.getDownloadedMaterials(),
      roleService.getAllStudents(),
      packetService.getAllPackets(),
      syncService.getQueuedItems(),
      progressService.getRecentActivity(),
      storageService.getDiagnostics(),
    ]);

    setSubjects(loadedSubjects);
    setLessons(loadedLessons);
    setProgressRecords(loadedProgress);
    setQuizAttempts(loadedStudentAttempts);
    setAllQuizAttempts(loadedAllAttempts);
    setDownloadedMaterials(loadedDownloads);
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

      setRole(prefs.role);
      setLanguage(prefs.language);

      const studentProfile = roleService.getProfileForRole('student', prefs.language);
      await refreshData(studentProfile.id);

      const sw = await registerPathweaveServiceWorker();
      if (!cancelled) {
        setSwStatus(sw);
        setReady(true);
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [refreshData]);

  const profile = roleService.getProfileForRole(role, language);
  const studentProfileId = roleService.getProfileForRole('student', language).id;
  const messages = TRANSLATIONS[language];

  const switchRole = useCallback(
    async (nextRole: UserRole) => {
      setRole(nextRole);
      setActiveLessonId(null);
      setActiveQuizId(null);
      await roleService.saveRolePreference(nextRole);
    },
    []
  );

  const changeLanguage = useCallback(async (nextLang: LanguageCode) => {
    setLanguage(nextLang);
    await roleService.saveLanguagePreference(nextLang);
  }, []);

  const openLessonReader = useCallback(
    async (lessonId: string) => {
      setActiveLessonId(lessonId);
      setStudentTab('lessons');
      await progressService.markLessonViewed(studentProfileId, lessonId);
      const lesson = lessons.find((l) => l.id === lessonId);
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
      }
      await refreshData(studentProfileId);
    },
    [language, lessons, refreshData, studentProfileId]
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
        await lessonService.saveLessonOffline(lesson);
        await progressService.logActivity({
          actorRole: 'student',
          actorName: roleService.getProfileForRole('student', language).name,
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
    [downloadedMaterials, language, refreshData, studentProfileId]
  );

  const markLessonCompleted = useCallback(
    async (lesson: Lesson) => {
      await progressService.markLessonCompleted(studentProfileId, lesson.id);
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
      });
      await refreshData(studentProfileId);
    },
    [language, refreshData, studentProfileId]
  );

  const submitQuiz = useCallback(
    async (quiz: Quiz, answers: Record<string, number>) => {
      const attempt = await quizService.submitQuizAttempt(quiz, studentProfileId, answers);
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
      });
      await refreshData(studentProfileId);
      return attempt;
    },
    [language, refreshData, studentProfileId]
  );

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
    await storageService.resetAllLocalData();
    await roleService.saveRolePreference(role);
    await roleService.saveLanguagePreference(language);
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
        quizAttempts,
        allQuizAttempts,
        downloadedMaterials,
        studentsRoster,
        learningPackets,
        syncQueue,
        recentActivity,
        network,
        diagnostics,
        swStatus,
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
        toggleDownloadLesson,
        markLessonCompleted,
        submitQuiz,
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
