import { LanguageCode, LocalizedText } from '../../types/domain';

export function pickLocalized(text: LocalizedText, lang: LanguageCode): string {
  return text[lang] || text.en;
}

export interface UIMessages {
  appName: string;
  studentPortal: string;
  teacherPortal: string;
  switchToTeacher: string;
  switchToStudent: string;
  online: string;
  offline: string;
  pendingSync: string;
  simulatedOffline: string;
  languageLabel: string;
  sampleDataNotice: string;
  localSavedNotice: string;
  nav: {
    dashboard: string;
    mySubjects: string;
    lessons: string;
    practice: string;
    myProgress: string;
    students: string;
    learningMaterials: string;
    performance: string;
    synchronization: string;
    settings: string;
  };
  student: {
    welcomeBack: string;
    overviewSubtitle: string;
    availableSubjects: string;
    lessonLibrary: string;
    quizPractice: string;
    learningProgress: string;
    downloadedMaterials: string;
    recentActivity: string;
    openLesson: string;
    startQuiz: string;
    downloadOffline: string;
    savedOffline: string;
    removeOffline: string;
    markCompleted: string;
    completed: string;
    inProgress: string;
    notStarted: string;
    lessonsCompleted: string;
    quizzesCompleted: string;
    averageScore: string;
    offlinePacksCount: string;
    noDownloadsYet: string;
    noActivityYet: string;
    backToLessons: string;
    submitQuiz: string;
    retakeQuiz: string;
    scoreLabel: string;
    correctAnswer: string;
    yourAnswer: string;
  };
  teacher: {
    overviewSubtitle: string;
    totalStudents: string;
    availableLessons: string;
    classAverageScore: string;
    localQueueItems: string;
    studentManagement: string;
    materialManagement: string;
    performanceOverview: string;
    weakAreasTitle: string;
    syncStatusTitle: string;
    recentClassroomActivity: string;
    addStudent: string;
    addMaterial: string;
    createPacket: string;
    stage1SyncNotice: string;
  };
  settings: {
    title: string;
    subtitle: string;
    languageSection: string;
    roleSection: string;
    storageSection: string;
    pwaSection: string;
    resetLocalData: string;
    installApp: string;
  };
}

export const TRANSLATIONS: Record<LanguageCode, UIMessages> = {
  en: {
    appName: 'PATHWEAVE',
    studentPortal: 'Student Mode',
    teacherPortal: 'Teacher Mode',
    switchToTeacher: 'Switch to Teacher Mode',
    switchToStudent: 'Switch to Student Mode',
    online: 'Online',
    offline: 'Offline',
    pendingSync: 'Pending synchronization',
    simulatedOffline: 'Simulated Offline (Test Mode)',
    languageLabel: 'Language',
    sampleDataNotice: 'Sample Curriculum Data',
    localSavedNotice: 'Saved Locally (IndexedDB)',
    nav: {
      dashboard: 'Dashboard',
      mySubjects: 'My Subjects',
      lessons: 'Lessons',
      practice: 'Practice',
      myProgress: 'My Progress',
      students: 'Students',
      learningMaterials: 'Learning Materials',
      performance: 'Performance',
      synchronization: 'Synchronization',
      settings: 'Settings',
    },
    student: {
      welcomeBack: 'Welcome back',
      overviewSubtitle: 'Access your lessons, practice quizzes, and manage offline study packs.',
      availableSubjects: 'Available Subjects',
      lessonLibrary: 'Lesson Library',
      quizPractice: 'Quiz Practice',
      learningProgress: 'Learning Progress Overview',
      downloadedMaterials: 'Downloaded Learning Materials',
      recentActivity: 'Recent Learning Activity',
      openLesson: 'Open Lesson',
      startQuiz: 'Start Quiz',
      downloadOffline: 'Save Offline',
      savedOffline: 'Saved Offline',
      removeOffline: 'Remove Download',
      markCompleted: 'Mark Lesson Completed',
      completed: 'Completed',
      inProgress: 'In Progress',
      notStarted: 'Not Started',
      lessonsCompleted: 'Lessons Completed',
      quizzesCompleted: 'Quizzes Taken',
      averageScore: 'Average Quiz Score',
      offlinePacksCount: 'Offline Lessons Saved',
      noDownloadsYet: 'No lessons have been saved for offline reading yet. Open the Lessons tab to save lessons locally.',
      noActivityYet: 'No recorded activity yet. Open a lesson or complete a practice quiz to track your progress.',
      backToLessons: 'Back to Lessons',
      submitQuiz: 'Submit Answers',
      retakeQuiz: 'Retake Quiz',
      scoreLabel: 'Score',
      correctAnswer: 'Correct answer',
      yourAnswer: 'Your answer',
    },
    teacher: {
      overviewSubtitle: 'Monitor classroom progress, review topic weak areas, and prepare local learning packets.',
      totalStudents: 'Total Students',
      availableLessons: 'Subjects & Lessons',
      classAverageScore: 'Class Average Score',
      localQueueItems: 'Local Changes Staged',
      studentManagement: 'Student Management',
      materialManagement: 'Learning Material Management',
      performanceOverview: 'Student Performance Overview',
      weakAreasTitle: 'Topic-Wise Weak Areas',
      syncStatusTitle: 'Synchronization Status',
      recentClassroomActivity: 'Recent Classroom Activity',
      addStudent: 'Add Student',
      addMaterial: 'Create Local Lesson',
      createPacket: 'Package Learning Packet',
      stage1SyncNotice:
        'Stage 2 Offline Mode: Downloaded lessons, quizzes, topic progress, and pending synchronization events are persisted locally in IndexedDB. Cloud synchronization to a remote server will be added in Stage 3.',
    },
    settings: {
      title: 'Platform Settings',
      subtitle: 'Configure display language, demonstration mode, local storage, and PWA readiness.',
      languageSection: 'Preferred Learning Language',
      roleSection: 'Demonstration Role Switch',
      storageSection: 'Local Storage Architecture (IndexedDB)',
      pwaSection: 'Progressive Web App & Offline Readiness',
      resetLocalData: 'Clear Saved Progress & Local Edits',
      installApp: 'Install App',
    },
  },
  kn: {
    appName: 'PATHWEAVE',
    studentPortal: 'ವಿದ್ಯಾರ್ಥಿ ವಿಭಾಗ',
    teacherPortal: 'ಶಿಕ್ಷಕರ ವಿಭಾಗ',
    switchToTeacher: 'ಶಿಕ್ಷಕರ ಮೋಡ್‌ಗೆ ಬದಲಿಸಿ',
    switchToStudent: 'ವಿದ್ಯಾರ್ಥಿ ಮೋಡ್‌ಗೆ ಬದಲಿಸಿ',
    online: 'ಆನ್‌ಲೈನ್',
    offline: 'ಆಫ್‌ಲೈನ್',
    pendingSync: 'ಸಿಂಕ್ ಬಾಕಿಯಿದೆ',
    simulatedOffline: 'ಅಣಕು ಆಫ್‌ಲೈನ್ (ಪರೀಕ್ಷಾ ಮೋಡ್)',
    languageLabel: 'ಭಾಷೆ',
    sampleDataNotice: 'ಮಾದರಿ ಪಠ್ಯಕ್ರಮ ದತ್ತಾಂಶ',
    localSavedNotice: 'ಸ್ಥಳೀಯವಾಗಿ ಉಳಿಸಲಾಗಿದೆ (IndexedDB)',
    nav: {
      dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      mySubjects: 'ನನ್ನ ವಿಷಯಗಳು',
      lessons: 'ಪಾಠಗಳು',
      practice: 'ಅಭ್ಯಾಸ',
      myProgress: 'ನನ್ನ ಪ್ರಗತಿ',
      students: 'ವಿದ್ಯಾರ್ಥಿಗಳು',
      learningMaterials: 'ಕಲಿಕಾ ಸಾಮಗ್ರಿಗಳು',
      performance: 'ಸಾಧನೆ',
      synchronization: 'ಸಿಂಕ್ರೊನೈಸೇಶನ್',
      settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    },
    student: {
      welcomeBack: 'ಮತ್ತೆ ಸ್ವಾಗತ',
      overviewSubtitle: 'ನಿಮ್ಮ ಪಾಠಗಳು, ಅಭ್ಯಾಸ ರಸಪ್ರಶ್ನೆಗಳು ಮತ್ತು ಆಫ್‌ಲೈನ್ ಕಲಿಕಾ ಸಾಮಗ್ರಿಗಳನ್ನು ಬಳಸಿ.',
      availableSubjects: 'ಲಭ್ಯವಿರುವ ವಿಷಯಗಳು',
      lessonLibrary: 'ಪಾಠಗಳ ಗ್ರಂಥಾಲಯ',
      quizPractice: 'ರಸಪ್ರಶ್ನೆ ಅಭ್ಯಾಸ',
      learningProgress: 'ಕಲಿಕಾ ಪ್ರಗತಿ ಸಾರಾಂಶ',
      downloadedMaterials: 'ಡೌನ್‌ಲೋಡ್ ಮಾಡಿದ ಕಲಿಕಾ ಸಾಮಗ್ರಿಗಳು',
      recentActivity: 'ಇತ್ತೀಚಿನ ಕಲಿಕಾ ಚಟುವಟಿಕೆ',
      openLesson: 'ಪಾಠ ತೆರೆಯಿರಿ',
      startQuiz: 'ರಸಪ್ರಶ್ನೆ ಆರಂಭಿಸಿ',
      downloadOffline: 'ಆಫ್‌ಲೈನ್‌ಗೆ ಉಳಿಸಿ',
      savedOffline: 'ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ',
      removeOffline: 'ಡೌನ್‌ಲೋಡ್ ತೆಗೆಯಿರಿ',
      markCompleted: 'ಪಾಠ ಪೂರ್ಣಗೊಂಡಿದೆ ಎಂದು ಗುರುತಿಸಿ',
      completed: 'ಪೂರ್ಣಗೊಂಡಿದೆ',
      inProgress: 'ಪ್ರಗತಿಯಲ್ಲಿದೆ',
      notStarted: 'ಪ್ರಾರಂಭಿಸಿಲ್ಲ',
      lessonsCompleted: 'ಪೂರ್ಣಗೊಂಡ ಪಾಠಗಳು',
      quizzesCompleted: 'ಮುಗಿಸಿದ ರಸಪ್ರಶ್ನೆಗಳು',
      averageScore: 'ಸರಾಸರಿ ಅಂಕ',
      offlinePacksCount: 'ಉಳಿಸಿದ ಆಫ್‌ಲೈನ್ ಪಾಠಗಳು',
      noDownloadsYet: 'ಇನ್ನೂ ಯಾವುದೇ ಪಾಠಗಳನ್ನು ಆಫ್‌ಲೈನ್‌ಗಾಗಿ ಉಳಿಸಲಾಗಿಲ್ಲ. ಪಾಠಗಳು ಟ್ಯಾಬ್‌ನಿಂದ ಉಳಿಸಿ.',
      noActivityYet: 'ಇನ್ನೂ ಯಾವುದೇ ಚಟುವಟಿಕೆ ದಾಖಲಾಗಿಲ್ಲ. ಪ್ರಗತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಪಾಠ ಅಥವಾ ರಸಪ್ರಶ್ನೆ ಆರಂಭಿಸಿ.',
      backToLessons: 'ಪಾಠಗಳಿಗೆ ಹಿಂತಿರುಗಿ',
      submitQuiz: 'ಉತ್ತರಗಳನ್ನು ಸಲ್ಲಿಸಿ',
      retakeQuiz: 'ಮತ್ತೆ ರಸಪ್ರಶ್ನೆ ತೆಗೆದುಕೊಳ್ಳಿ',
      scoreLabel: 'ಅಂಕಗಳು',
      correctAnswer: 'ಸರಿಯಾದ ಉತ್ತರ',
      yourAnswer: 'ನಿಮ್ಮ ಉತ್ತರ',
    },
    teacher: {
      overviewSubtitle: 'ತರಗತಿ ಪ್ರಗತಿ, ವಿಷಯವಾರು ದುರ್ಬಲ ಕ್ಷೇತ್ರಗಳು ಮತ್ತು ಕಲಿಕಾ ಪ್ಯಾಕೆಟ್‌ಗಳನ್ನು ನಿರ್ವಹಿಸಿ.',
      totalStudents: 'ಒಟ್ಟು ವಿದ್ಯಾರ್ಥಿಗಳು',
      availableLessons: 'ವಿಷಯಗಳು ಮತ್ತು ಪಾಠಗಳು',
      classAverageScore: 'ತರಗತಿ ಸರಾಸರಿ ಅಂಕ',
      localQueueItems: 'ಸ್ಥಳೀಯ ಬದಲಾವಣೆಗಳು',
      studentManagement: 'ವಿದ್ಯಾರ್ಥಿಗಳ ನಿರ್ವಹಣೆ',
      materialManagement: 'ಕಲಿಕಾ ಸಾಮಗ್ರಿ ನಿರ್ವಹಣೆ',
      performanceOverview: 'ವಿದ್ಯಾರ್ಥಿಗಳ ಸಾಧನೆ ಸಾರಾಂಶ',
      weakAreasTitle: 'ವಿಷಯವಾರು ದುರ್ಬಲ ಕ್ಷೇತ್ರಗಳು',
      syncStatusTitle: 'ಸಿಂಕ್ರೊನೈಸೇಶನ್ ಸ್ಥಿತಿ',
      recentClassroomActivity: 'ಇತ್ತೀಚಿನ ತರಗತಿ ಚಟುವಟಿಕೆ',
      addStudent: 'ವಿದ್ಯಾರ್ಥಿಯನ್ನು ಸೇರಿಸಿ',
      addMaterial: 'ಹೊಸ ಸ್ಥಳೀಯ ಪಾಠ ರಚಿಸಿ',
      createPacket: 'ಕಲಿಕಾ ಪ್ಯಾಕೆಟ್ ತಯಾರಿಸಿ',
      stage1SyncNotice:
        'ಹಂತ 2 ಆಫ್‌ಲೈನ್ ಮೋಡ್: ಡೌನ್‌ಲೋಡ್ ಮಾಡಿದ ಪಾಠಗಳು, ರಸಪ್ರಶ್ನೆಗಳು, ವಿಷಯ ಪ್ರಗತಿ ಮತ್ತು ಬಾಕಿಯಿರುವ ಸಿಂಕ್ ಘಟನೆಗಳು IndexedDB ಯಲ್ಲಿ ಉಳಿಯುತ್ತವೆ. ಕ್ಲೌಡ್ ಸಿಂಕ್ ಹಂತ 3ರಲ್ಲಿ ಬರಲಿದೆ.',
    },
    settings: {
      title: 'ವೇದಿಕೆ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
      subtitle: 'ಭಾಷೆ, ಡೆಮೊ ಮೋಡ್, ಸ್ಥಳೀಯ ಸಂಗ್ರಹಣೆ ಮತ್ತು PWA ಸಿದ್ಧತೆಯನ್ನು ನಿರ್ವಹಿಸಿ.',
      languageSection: 'ಆದ್ಯತೆಯ ಕಲಿಕಾ ಭಾಷೆ',
      roleSection: 'ಡೆಮೊ ಪಾತ್ರ ಬದಲಾವಣೆ',
      storageSection: 'ಸ್ಥಳೀಯ ಸಂಗ್ರಹಣೆ ವಿನ್ಯಾಸ (IndexedDB)',
      pwaSection: 'ಪ್ರೋಗ್ರೆಸಿವ್ ವೆಬ್ ಆಪ್ ಮತ್ತು ಆಫ್‌ಲೈನ್ ಸಿದ್ಧತೆ',
      resetLocalData: 'ಉಳಿಸಿದ ಪ್ರಗತಿ ಮತ್ತು ಸ್ಥಳೀಯ ಬದಲಾವಣೆಗಳನ್ನು ಅಳಿಸಿ',
      installApp: 'ಆಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ',
    },
  },
  hi: {
    appName: 'PATHWEAVE',
    studentPortal: 'छात्र पोर्टल',
    teacherPortal: 'शिक्षक पोर्टल',
    switchToTeacher: 'शिक्षक मोड पर स्विच करें',
    switchToStudent: 'छात्र मोड पर स्विच करें',
    online: 'ऑनलाइन',
    offline: 'ऑफ़लाइन',
    pendingSync: 'सिंक लंबित',
    simulatedOffline: 'सिम्युलेटेड ऑफ़लाइन (परीक्षण मोड)',
    languageLabel: 'भाषा',
    sampleDataNotice: 'नमूना पाठ्यक्रम डेटा',
    localSavedNotice: 'स्थानीय रूप से सहेजा गया (IndexedDB)',
    nav: {
      dashboard: 'डैशबोर्ड',
      mySubjects: 'मेरे विषय',
      lessons: 'पाठ',
      practice: 'अभ्यास',
      myProgress: 'मेरी प्रगति',
      students: 'छात्र',
      learningMaterials: 'शिक्षण सामग्री',
      performance: 'प्रदर्शन',
      synchronization: 'सिंक्रोनाइज़ेशन',
      settings: 'सेटिंग्स',
    },
    student: {
      welcomeBack: 'वापसी पर स्वागत है',
      overviewSubtitle: 'अपने पाठ, अभ्यास प्रश्नोत्तरी और ऑफ़लाइन अध्ययन पैक का उपयोग करें।',
      availableSubjects: 'उपलब्ध विषय',
      lessonLibrary: 'पाठ पुस्तकालय',
      quizPractice: 'प्रश्नोत्तरी अभ्यास',
      learningProgress: 'सीखने की प्रगति सारांश',
      downloadedMaterials: 'डाउनलोड की गई शिक्षण सामग्री',
      recentActivity: 'हाल की सीखने की गतिविधि',
      openLesson: 'पाठ खोलें',
      startQuiz: 'प्रश्नोत्तरी शुरू करें',
      downloadOffline: 'ऑफ़लाइन सहेजें',
      savedOffline: 'ऑफ़लाइन सहेजा गया',
      removeOffline: 'डाउनलोड हटाएँ',
      markCompleted: 'पाठ पूर्ण चिह्नित करें',
      completed: 'पूर्ण',
      inProgress: 'प्रगति में',
      notStarted: 'शुरू नहीं हुआ',
      lessonsCompleted: 'पूर्ण किए गए पाठ',
      quizzesCompleted: 'पूर्ण प्रश्नोत्तरी',
      averageScore: 'औसत अंक',
      offlinePacksCount: 'सहेजे गए ऑफ़लाइन पाठ',
      noDownloadsYet: 'अभी तक कोई पाठ ऑफ़लाइन पढ़ने के लिए सहेजा नहीं गया है। पाठ टैब से सहेजें।',
      noActivityYet: 'अभी तक कोई गतिविधि दर्ज नहीं है। प्रगति ट्रैक करने के लिए पाठ या प्रश्नोत्तरी शुरू करें।',
      backToLessons: 'पाठों पर वापस जाएं',
      submitQuiz: 'उत्तर जमा करें',
      retakeQuiz: 'फिर से प्रश्नोत्तरी दें',
      scoreLabel: 'अंक',
      correctAnswer: 'सही उत्तर',
      yourAnswer: 'आपका उत्तर',
    },
    teacher: {
      overviewSubtitle: 'कक्षा की प्रगति, विषयवार कमजोर क्षेत्रों की समीक्षा करें और स्थानीय शिक्षण पैकेट तैयार करें।',
      totalStudents: 'कुल छात्र',
      availableLessons: 'विषय और पाठ',
      classAverageScore: 'कक्षा औसत अंक',
      localQueueItems: 'स्थानीय परिवर्तन कतार',
      studentManagement: 'छात्र प्रबंधन',
      materialManagement: 'शिक्षण सामग्री प्रबंधन',
      performanceOverview: 'छात्र प्रदर्शन सारांश',
      weakAreasTitle: 'विषयवार कमजोर क्षेत्र',
      syncStatusTitle: 'सिंक्रोनाइज़ेशन स्थिति',
      recentClassroomActivity: 'हाल की कक्षा गतिविधि',
      addStudent: 'छात्र जोड़ें',
      addMaterial: 'नया स्थानीय पाठ बनाएं',
      createPacket: 'शिक्षण पैकेट तैयार करें',
      stage1SyncNotice:
        'चरण 2 ऑफ़लाइन मोड: डाउनलोड किए गए पाठ, प्रश्नोत्तरी, विषयवार प्रगति और लंबित सिंक घटनाएँ IndexedDB में स्थानीय रूप से सहेजी जाती हैं। क्लाउड सिंक चरण 3 में जोड़ा जाएगा।',
    },
    settings: {
      title: 'प्लेटफ़ॉर्म सेटिंग्स',
      subtitle: 'भाषा, डेमो मोड, स्थानीय स्टोरेज और PWA तैयारी कॉन्फ़िगर करें।',
      languageSection: 'पसंदीदा शिक्षण भाषा',
      roleSection: 'डेमो भूमिका स्विच',
      storageSection: 'स्थानीय स्टोरेज आर्किटेक्चर (IndexedDB)',
      pwaSection: 'प्रोग्रेसिव वेब ऐप और ऑफ़लाइन तैयारी',
      resetLocalData: 'सहेजी गई प्रगति और स्थानीय बदलाव हटाएं',
      installApp: 'ऐप इंस्टॉल करें',
    },
  },
};
