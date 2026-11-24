import {
  DifficultyLevel,
  LanguageCode,
  LocalizedText,
  StoredQuizQuestion,
  SubjectId,
} from '../../types/domain';

export interface TopicDefinition {
  topicKey: string;
  subjectId: SubjectId;
  lessonId: string;
  grade: number;
  label: LocalizedText;
  prerequisiteTopicKey?: string;
  prerequisiteTopicLabel?: LocalizedText;
  prerequisiteLessonId?: string;
}

export const TOPIC_DEFINITIONS: Record<string, TopicDefinition> = {
  fractions: {
    topicKey: 'fractions',
    subjectId: 'math',
    lessonId: 'math-fractions-01',
    grade: 6,
    label: {
      en: 'Fractions & Decimals',
      kn: 'ಭಿನ್ನರಾಶಿಗಳು ಮತ್ತು ದಶಮಾಂಶಗಳು',
      hi: 'भिन्न और दशमलव',
    },
  },
  ratios: {
    topicKey: 'ratios',
    subjectId: 'math',
    lessonId: 'math-ratios-02',
    grade: 7,
    label: {
      en: 'Ratios & Proportions',
      kn: 'ಅನುಪಾತ ಮತ್ತು ಸಮಾನುಪಾತ',
      hi: 'अनुपात और समानुपात',
    },
    prerequisiteTopicKey: 'fractions',
    prerequisiteTopicLabel: {
      en: 'Fractions & Decimals',
      kn: 'ಭಿನ್ನರಾಶಿಗಳು ಮತ್ತು ದಶಮಾಂಶಗಳು',
      hi: 'भिन्न और दशमलव',
    },
    prerequisiteLessonId: 'math-fractions-01',
  },
  geometry: {
    topicKey: 'geometry',
    subjectId: 'math',
    lessonId: 'math-geometry-03',
    grade: 7,
    label: {
      en: 'Geometry',
      kn: 'ಜ್ಯಾಮಿತಿ',
      hi: 'ज्यामिति',
    },
    prerequisiteTopicKey: 'fractions',
    prerequisiteTopicLabel: {
      en: 'Fractions & Decimals',
      kn: 'ಭಿನ್ನರಾಶಿಗಳು ಮತ್ತು ದಶಮಾಂಶಗಳು',
      hi: 'भिन्न और दशमलव',
    },
    prerequisiteLessonId: 'math-fractions-01',
  },
  basic_algebra: {
    topicKey: 'basic_algebra',
    subjectId: 'math',
    lessonId: 'math-algebra-04',
    grade: 7,
    label: {
      en: 'Basic Algebra',
      kn: 'ಮೂಲ ಬೀಜಗಣಿತ',
      hi: 'प्रारंभिक बीजगणित',
    },
    prerequisiteTopicKey: 'ratios',
    prerequisiteTopicLabel: {
      en: 'Ratios & Proportions',
      kn: 'ಅನುಪಾತ ಮತ್ತು ಸಮಾನುಪಾತ',
      hi: 'अनुपात और समानुपात',
    },
    prerequisiteLessonId: 'math-ratios-02',
  },
  linear_equations: {
    topicKey: 'linear_equations',
    subjectId: 'math',
    lessonId: 'math-algebra-04',
    grade: 8,
    label: {
      en: 'Linear Equations',
      kn: 'ರೇಖೀಯ ಸಮೀಕರಣಗಳು',
      hi: 'रैखिक समीकरण',
    },
    prerequisiteTopicKey: 'basic_algebra',
    prerequisiteTopicLabel: {
      en: 'Basic Algebra',
      kn: 'ಮೂಲ ಬೀಜಗಣಿತ',
      hi: 'प्रारंभिक बीजगणित',
    },
    prerequisiteLessonId: 'math-algebra-04',
  },
  plant_nutrition: {
    topicKey: 'plant_nutrition',
    subjectId: 'science',
    lessonId: 'sci-photosynthesis-01',
    grade: 7,
    label: {
      en: 'Plant Nutrition',
      kn: 'ಸಸ್ಯಗಳಲ್ಲಿ ಪೋಷಣೆ',
      hi: 'पादपों में पोषण',
    },
  },
  circuits: {
    topicKey: 'circuits',
    subjectId: 'science',
    lessonId: 'sci-circuits-02',
    grade: 6,
    label: {
      en: 'Electricity & Circuits',
      kn: 'ವಿದ್ಯುತ್ ಮತ್ತು ಸರ್ಕ್ಯೂಟ್‌ಗಳು',
      hi: 'विद्युत तथा परिपथ',
    },
  },
  water_cycle: {
    topicKey: 'water_cycle',
    subjectId: 'science',
    lessonId: 'sci-water-03',
    grade: 7,
    label: {
      en: 'Water Conservation',
      kn: 'ನೀರಿನ ಸಂರಕ್ಷಣೆ',
      hi: 'जल संरक्षण',
    },
    prerequisiteTopicKey: 'plant_nutrition',
    prerequisiteTopicLabel: {
      en: 'Plant Nutrition',
      kn: 'ಸಸ್ಯಗಳಲ್ಲಿ ಪೋಷಣೆ',
      hi: 'पादपों में पोषण',
    },
    prerequisiteLessonId: 'sci-photosynthesis-01',
  },
  soil_acids: {
    topicKey: 'soil_acids',
    subjectId: 'science',
    lessonId: 'sci-matter-04',
    grade: 8,
    label: {
      en: 'Acids, Bases & Soil pH',
      kn: 'ಆಮ್ಲಗಳು, ಪ್ರತ್ಯಾಮ್ಲಗಳು ಮತ್ತು ಮಣ್ಣಿನ pH',
      hi: 'अम्ल, क्षार और मिट्टी का pH',
    },
    prerequisiteTopicKey: 'water_cycle',
    prerequisiteTopicLabel: {
      en: 'Water Conservation',
      kn: 'ನೀರಿನ ಸಂರಕ್ಷಣೆ',
      hi: 'जल संरक्षण',
    },
    prerequisiteLessonId: 'sci-water-03',
  },
};

export function normalizeTopicKey(topicKey: string): string {
  if (topicKey === 'area_perimeter') return 'geometry';
  return topicKey;
}

export function getTopicDefinition(topicKey: string): TopicDefinition | undefined {
  return TOPIC_DEFINITIONS[normalizeTopicKey(topicKey)];
}

const ALL_LANGUAGES: LanguageCode[] = ['en', 'kn', 'hi'];

interface RawBankEntry {
  id: string;
  topicKey: keyof typeof TOPIC_DEFINITIONS;
  difficulty: DifficultyLevel;
  orderIndex: number;
  prompt: LocalizedText;
  options: LocalizedText[];
  correctIndex: number;
  explanation: LocalizedText;
}

function buildQuestion(entry: RawBankEntry): StoredQuizQuestion {
  const def = TOPIC_DEFINITIONS[entry.topicKey];
  return {
    id: entry.id,
    quizId: `adaptive-${entry.topicKey}-${entry.difficulty.toLowerCase()}`,
    subjectId: def.subjectId,
    topicKey: def.topicKey,
    topicLabel: def.label,
    difficulty: entry.difficulty,
    language: 'en',
    languages: ALL_LANGUAGES,
    orderIndex: entry.orderIndex,
    prompt: entry.prompt,
    options: entry.options,
    correctIndex: entry.correctIndex,
    explanation: entry.explanation,
    prerequisiteTopicKey: def.prerequisiteTopicKey,
    prerequisiteTopicLabel: def.prerequisiteTopicLabel,
  };
}

const RAW_BANK: RawBankEntry[] = [
  // ---------------- GEOMETRY (Easy, Medium, Hard) ----------------
  {
    id: 'aq-geo-e1',
    topicKey: 'geometry',
    difficulty: 'Easy',
    orderIndex: 1,
    prompt: {
      en: 'A square school garden has each side equal to 6 m. What is its perimeter?',
      kn: 'ಚೌಕಾಕಾರದ ಶಾಲಾ ತೋಟದ ಪ್ರತಿಯೊಂದು ಬದಿಯ ಉದ್ದ 6 ಮೀ ಆಗಿದೆ. ಅದರ ಸುತ್ತಳತೆ ಎಷ್ಟು?',
      hi: 'एक वर्गाकार स्कूल बगीचे की प्रत्येक भुजा 6 मीटर है। इसका परिमाप क्या है?',
    },
    options: [
      { en: '12 m', kn: '12 ಮೀ', hi: '12 मीटर' },
      { en: '24 m', kn: '24 ಮೀ', hi: '24 मीटर' },
      { en: '36 m', kn: '36 ಮೀ', hi: '36 मीटर' },
      { en: '18 m', kn: '18 ಮೀ', hi: '18 मीटर' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'A square has 4 equal sides: Perimeter = 4 × 6 m = 24 m.',
      kn: 'ಚೌಕಕ್ಕೆ 4 ಸಮಾನ ಬದಿಗಳಿವೆ: ಸುತ್ತಳತೆ = 4 × 6 ಮೀ = 24 ಮೀ.',
      hi: 'वर्ग की 4 बराबर भुजाएँ होती हैं: परिमाप = 4 × 6 मीटर = 24 मीटर।',
    },
  },
  {
    id: 'aq-geo-e2',
    topicKey: 'geometry',
    difficulty: 'Easy',
    orderIndex: 2,
    prompt: {
      en: 'What is the area of a rectangular slate board of length 8 cm and width 5 cm?',
      kn: '8 ಸೆಂ.ಮೀ ಉದ್ದ ಮತ್ತು 5 ಸೆಂ.ಮೀ ಅಗಲದ ಆಯತಾಕಾರದ ಹಲಗೆಯ ವಿಸ್ತೀರ್ಣ ಎಷ್ಟು?',
      hi: '8 सेमी लंबाई और 5 सेमी चौड़ाई वाली आयताकार स्लेट का क्षेत्रफल कितना है?',
    },
    options: [
      { en: '13 sq cm', kn: '13 ಚ.ಸೆಂ.ಮೀ', hi: '13 वर्ग सेमी' },
      { en: '26 sq cm', kn: '26 ಚ.ಸೆಂ.ಮೀ', hi: '26 वर्ग सेमी' },
      { en: '40 sq cm', kn: '40 ಚ.ಸೆಂ.ಮೀ', hi: '40 वर्ग सेमी' },
      { en: '35 sq cm', kn: '35 ಚ.ಸೆಂ.ಮೀ', hi: '35 वर्ग सेमी' },
    ],
    correctIndex: 2,
    explanation: {
      en: 'Area of rectangle = length × width = 8 × 5 = 40 sq cm.',
      kn: 'ಆಯತದ ವಿಸ್ತೀರ್ಣ = ಉದ್ದ × ಅಗಲ = 8 × 5 = 40 ಚ.ಸೆಂ.ಮೀ.',
      hi: 'आयत का क्षेत्रफल = लंबाई × चौड़ाई = 8 × 5 = 40 वर्ग सेमी।',
    },
  },
  {
    id: 'aq-geo-e3',
    topicKey: 'geometry',
    difficulty: 'Easy',
    orderIndex: 3,
    prompt: {
      en: 'How many sides does a triangle have?',
      kn: 'ಒಂದು ತ್ರಿಕೋನಕ್ಕೆ ಎಷ್ಟು ಬದಿಗಳಿರುತ್ತವೆ?',
      hi: 'एक त्रिभुज में कितनी भुजाएँ होती हैं?',
    },
    options: [
      { en: '2 sides', kn: '2 ಬದಿಗಳು', hi: '2 भुजाएँ' },
      { en: '3 sides', kn: '3 ಬದಿಗಳು', hi: '3 भुजाएँ' },
      { en: '4 sides', kn: '4 ಬದಿಗಳು', hi: '4 भुजाएँ' },
      { en: '5 sides', kn: '5 ಬದಿಗಳು', hi: '5 भुजाएँ' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'A triangle is a closed figure formed by 3 straight line segments.',
      kn: 'ತ್ರಿಕೋನವು 3 ಸರಳ ರೇಖೆಗಳಿಂದ ಕೂಡಿದ ಮುಚ್ಚಿದ ಆಕೃತಿಯಾಗಿದೆ.',
      hi: 'त्रिभुज 3 सीधी भुजाओं से बनी एक बंद आकृति है।',
    },
  },
  {
    id: 'aq-geo-m1',
    topicKey: 'geometry',
    difficulty: 'Medium',
    orderIndex: 4,
    prompt: {
      en: 'A triangular flower bed has base 14 m and height 6 m. What is its area?',
      kn: '14 ಮೀ ಪಾದ ಮತ್ತು 6 ಮೀ ಎತ್ತರದ ತ್ರಿಕೋನಾಕಾರದ ಹೂದೋಟದ ವಿಸ್ತೀರ್ಣ ಎಷ್ಟು?',
      hi: 'एक त्रिभुजाकार क्यारी का आधार 14 मीटर और ऊँचाई 6 मीटर है। इसका क्षेत्रफल क्या है?',
    },
    options: [
      { en: '84 sq m', kn: '84 ಚ.ಮೀ', hi: '84 वर्ग मीटर' },
      { en: '42 sq m', kn: '42 ಚ.ಮೀ', hi: '42 वर्ग मीटर' },
      { en: '20 sq m', kn: '20 ಚ.ಮೀ', hi: '20 वर्ग मीटर' },
      { en: '48 sq m', kn: '48 ಚ.ಮೀ', hi: '48 वर्ग मीटर' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Area of triangle = (1/2) × base × height = (1/2) × 14 × 6 = 42 sq m.',
      kn: 'ತ್ರಿಕೋನದ ವಿಸ್ತೀರ್ಣ = (1/2) × 14 × 6 = 42 ಚ.ಮೀ.',
      hi: 'त्रिभुज का क्षेत्रफल = (1/2) × 14 × 6 = 42 वर्ग मीटर।',
    },
  },
  {
    id: 'aq-geo-m2',
    topicKey: 'geometry',
    difficulty: 'Medium',
    orderIndex: 5,
    prompt: {
      en: 'The perimeter of a rectangular plot is 48 m and its length is 15 m. Find its width.',
      kn: 'ಆಯತಾಕಾರದ ಜಾಗದ ಸುತ್ತಳತೆ 48 ಮೀ ಮತ್ತು ಉದ್ದ 15 ಮೀ ಆದರೆ, ಅಗಲ ಎಷ್ಟು?',
      hi: 'एक आयताकार खेत का परिमाप 48 मीटर और लंबाई 15 मीटर है। इसकी चौड़ाई ज्ञात करें।',
    },
    options: [
      { en: '9 m', kn: '9 ಮೀ', hi: '9 मीटर' },
      { en: '12 m', kn: '12 ಮೀ', hi: '12 मीटर' },
      { en: '18 m', kn: '18 ಮೀ', hi: '18 मीटर' },
      { en: '33 m', kn: '33 ಮೀ', hi: '33 मीटर' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Half perimeter = length + width = 48 ÷ 2 = 24 m. So width = 24 - 15 = 9 m.',
      kn: 'ಅರ್ಧ ಸುತ್ತಳತೆ = 48 ÷ 2 = 24 ಮೀ. ಅಗಲ = 24 - 15 = 9 ಮೀ.',
      hi: 'अर्ध-परिमाप = 48 ÷ 2 = 24 मीटर। चौड़ाई = 24 - 15 = 9 मीटर।',
    },
  },
  {
    id: 'aq-geo-m3',
    topicKey: 'geometry',
    difficulty: 'Medium',
    orderIndex: 6,
    prompt: {
      en: 'Two angles of a triangle measure 50° and 65°. What is the third angle?',
      kn: 'ಒಂದು ತ್ರಿಕೋನದ ಎರಡು ಕೋನಗಳು 50° ಮತ್ತು 65° ಆಗಿದ್ದರೆ, ಮೂರನೇ ಕೋನ ಎಷ್ಟು?',
      hi: 'एक त्रिभुज के दो कोण 50° और 65° हैं। तीसरा कोण कितना होगा?',
    },
    options: [
      { en: '55°', kn: '55°', hi: '55°' },
      { en: '65°', kn: '65°', hi: '65°' },
      { en: '75°', kn: '75°', hi: '75°' },
      { en: '115°', kn: '115°', hi: '115°' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Angles in any triangle sum to 180°. Third angle = 180° - (50° + 65°) = 65°.',
      kn: 'ತ್ರಿಕೋನದ ಮೂರು ಕೋನಗಳ ಮೊತ್ತ 180°. ಆದ್ದರಿಂದ 180° - 115° = 65°.',
      hi: 'त्रिभुज के तीनों कोणों का योग 180° होता है। तीसरा कोण = 180° - 115° = 65°।',
    },
  },
  {
    id: 'aq-geo-h1',
    topicKey: 'geometry',
    difficulty: 'Hard',
    orderIndex: 7,
    prompt: {
      en: 'A rectangular yard is 20 m by 14 m. A 1 m wide path runs inside along all four sides. What is the area of the inner lawn?',
      kn: '20 ಮೀ × 14 ಮೀ ಆಯತಾಕಾರದ ಅಂಗಳದ ಒಳಗೆ ನಾಲ್ಕೂ ಬದಿಗಳಲ್ಲಿ 1 ಮೀ ಅಗಲದ ದಾರಿಯಿದೆ. ಒಳಗಿನ ಹುಲ್ಲುಹಾಸಿನ ವಿಸ್ತೀರ್ಣ ಎಷ್ಟು?',
      hi: '20 मीटर × 14 मीटर के आयताकार आँगन के अंदर चारों तरफ 1 मीटर चौड़ा रास्ता है। अंदर के लॉन का क्षेत्रफल कितना है?',
    },
    options: [
      { en: '280 sq m', kn: '280 ಚ.ಮೀ', hi: '280 वर्ग मीटर' },
      { en: '216 sq m', kn: '216 ಚ.ಮೀ', hi: '216 वर्ग मीटर' },
      { en: '247 sq m', kn: '247 ಚ.ಮೀ', hi: '247 वर्ग मीटर' },
      { en: '192 sq m', kn: '192 ಚ.ಮೀ', hi: '192 वर्ग मीटर' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Inner length = 20 - 2 = 18 m; inner width = 14 - 2 = 12 m. Inner area = 18 × 12 = 216 sq m.',
      kn: 'ಒಳಗಿನ ಉದ್ದ = 20 - 2 = 18 ಮೀ, ಅಗಲ = 14 - 2 = 12 ಮೀ. ವಿಸ್ತೀರ್ಣ = 18 × 12 = 216 ಚ.ಮೀ.',
      hi: 'अंदर की लंबाई = 20 - 2 = 18 मीटर, चौड़ाई = 14 - 2 = 12 मीटर। क्षेत्रफल = 18 × 12 = 216 वर्ग मीटर।',
    },
  },
  {
    id: 'aq-geo-h2',
    topicKey: 'geometry',
    difficulty: 'Hard',
    orderIndex: 8,
    prompt: {
      en: 'If fencing wire costs ₹25 per metre, what is the cost to put 2 rounds of wire around a 30 m by 18 m farm plot?',
      kn: 'ಪ್ರತಿ ಮೀಟರ್ ತಂತಿಗೆ ₹25 ಆದರೆ, 30 ಮೀ × 18 ಮೀ ಹೊಲದ ಸುತ್ತ 2 ಸುತ್ತು ತಂತಿ ಬೇಲಿ ಹಾಕಲು ಎಷ್ಟು ಖರ್ಚಾಗುತ್ತದೆ?',
      hi: 'यदि बाड़ के तार की कीमत ₹25 प्रति मीटर है, तो 30 मीटर × 18 मीटर खेत के चारों ओर 2 चक्कर तार लगाने का खर्च क्या होगा?',
    },
    options: [
      { en: '₹2,400', kn: '₹2,400', hi: '₹2,400' },
      { en: '₹4,800', kn: '₹4,800', hi: '₹4,800' },
      { en: '₹1,200', kn: '₹1,200', hi: '₹1,200' },
      { en: '₹3,600', kn: '₹3,600', hi: '₹3,600' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Perimeter = 2 × (30 + 18) = 96 m. Two rounds = 192 m. Cost = 192 × ₹25 = ₹4,800.',
      kn: 'ಸುತ್ತಳತೆ = 96 ಮೀ. 2 ಸುತ್ತು = 192 ಮೀ. ಖರ್ಚು = 192 × ₹25 = ₹4,800.',
      hi: 'परिमाप = 96 मीटर। दो चक्कर = 192 मीटर। खर्च = 192 × ₹25 = ₹4,800।',
    },
  },
  {
    id: 'aq-geo-h3',
    topicKey: 'geometry',
    difficulty: 'Hard',
    orderIndex: 9,
    prompt: {
      en: 'A square and a rectangle have the same perimeter of 40 cm. If the rectangle is 12 cm long, how much larger is the square’s area?',
      kn: 'ಒಂದು ಚೌಕ ಮತ್ತು ಆಯತದ ಸುತ್ತಳತೆ 40 ಸೆಂ.ಮೀ ಆಗಿದೆ. ಆಯತದ ಉದ್ದ 12 ಸೆಂ.ಮೀ ಆದರೆ, ಚೌಕದ ವಿಸ್ತೀರ್ಣ ಎಷ್ಟು ಹೆಚ್ಚು?',
      hi: 'एक वर्ग और एक आयत दोनों का परिमाप 40 सेमी है। यदि आयत की लंबाई 12 सेमी है, तो वर्ग का क्षेत्रफल कितना अधिक है?',
    },
    options: [
      { en: '4 sq cm', kn: '4 ಚ.ಸೆಂ.ಮೀ', hi: '4 वर्ग सेमी' },
      { en: '16 sq cm', kn: '16 ಚ.ಸೆಂ.ಮೀ', hi: '16 वर्ग सेमी' },
      { en: '8 sq cm', kn: '8 ಚ.ಸೆಂ.ಮೀ', hi: '8 वर्ग सेमी' },
      { en: '12 sq cm', kn: '12 ಚ.ಸೆಂ.ಮೀ', hi: '12 वर्ग सेमी' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Square side = 40 ÷ 4 = 10 cm (Area = 100 sq cm). Rectangle width = 20 - 12 = 8 cm (Area = 12 × 8 = 96 sq cm). Difference = 4 sq cm.',
      kn: 'ಚೌಕದ ವಿಸ್ತೀರ್ಣ = 10 × 10 = 100 ಚ.ಸೆಂ.ಮೀ. ಆಯತದ ವಿಸ್ತೀರ್ಣ = 12 × 8 = 96 ಚ.ಸೆಂ.ಮೀ. ವ್ಯತ್ಯಾಸ = 4 ಚ.ಸೆಂ.ಮೀ.',
      hi: 'वर्ग का क्षेत्रफल = 10 × 10 = 100 वर्ग सेमी। आयत का क्षेत्रफल = 12 × 8 = 96 वर्ग सेमी। अंतर = 4 वर्ग सेमी।',
    },
  },

  // ---------------- FRACTIONS (Easy, Medium, Hard) ----------------
  {
    id: 'aq-frac-e1',
    topicKey: 'fractions',
    difficulty: 'Easy',
    orderIndex: 1,
    prompt: {
      en: 'A roti is cut into 4 equal pieces and 1 piece is eaten. What fraction remains?',
      kn: 'ಒಂದು ರೊಟ್ಟಿಯನ್ನು 4 ಸಮಾನ ಭಾಗಗಳಾಗಿ ಮಾಡಿ 1 ಭಾಗ ತಿಂದರೆ ಉಳಿದ ಭಿನ್ನರಾಶಿ ಎಷ್ಟು?',
      hi: 'एक रोटी के 4 बराबर टुकड़ों में से 1 टुकड़ा खाया गया। कितना भिन्न बचा है?',
    },
    options: [
      { en: '1/4', kn: '1/4', hi: '1/4' },
      { en: '3/4', kn: '3/4', hi: '3/4' },
      { en: '2/4', kn: '2/4', hi: '2/4' },
      { en: '1/3', kn: '1/3', hi: '1/3' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Out of 4 equal pieces, 3 pieces remain, which is 3/4.',
      kn: '4 ಭಾಗಗಳಲ್ಲಿ 3 ಭಾಗಗಳು ಉಳಿದಿರುವುದರಿಂದ ಅದು 3/4 ಆಗಿದೆ.',
      hi: '4 बराबर टुकड़ों में से 3 टुकड़े बचे हैं, यानी 3/4।',
    },
  },
  {
    id: 'aq-frac-e2',
    topicKey: 'fractions',
    difficulty: 'Easy',
    orderIndex: 2,
    prompt: {
      en: 'Which fraction is equal to 1/2?',
      kn: '1/2 ಕ್ಕೆ ಸಮಾನವಾದ ಭಿನ್ನರಾಶಿ ಯಾವುದು?',
      hi: 'कौन-सा भिन्न 1/2 के बराबर है?',
    },
    options: [
      { en: '2/3', kn: '2/3', hi: '2/3' },
      { en: '3/5', kn: '3/5', hi: '3/5' },
      { en: '4/8', kn: '4/8', hi: '4/8' },
      { en: '3/8', kn: '3/8', hi: '3/8' },
    ],
    correctIndex: 2,
    explanation: {
      en: 'Multiplying numerator and denominator of 1/2 by 4 gives 4/8.',
      kn: '1/2 ರ ಅಂಶ ಮತ್ತು ಛೇದವನ್ನು 4 ರಿಂದ ಗುಣಿಸಿದರೆ 4/8 ಬರುತ್ತದೆ.',
      hi: '1/2 के अंश और हर को 4 से गुणा करने पर 4/8 मिलता है।',
    },
  },
  {
    id: 'aq-frac-e3',
    topicKey: 'fractions',
    difficulty: 'Easy',
    orderIndex: 3,
    prompt: {
      en: 'What is 2/5 + 1/5?',
      kn: '2/5 + 1/5 ಎಷ್ಟು?',
      hi: '2/5 + 1/5 का मान क्या है?',
    },
    options: [
      { en: '3/10', kn: '3/10', hi: '3/10' },
      { en: '3/5', kn: '3/5', hi: '3/5' },
      { en: '2/5', kn: '2/5', hi: '2/5' },
      { en: '1/5', kn: '1/5', hi: '1/5' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'When denominators are equal, add the numerators: (2 + 1)/5 = 3/5.',
      kn: 'ಛೇದಗಳು ಸಮಾನವಾಗಿದ್ದಾಗ ಅಂಶಗಳನ್ನು ಕೂಡಿಸಿ: (2 + 1)/5 = 3/5.',
      hi: 'समान हर होने पर अंश जोड़ते हैं: (2 + 1)/5 = 3/5।',
    },
  },
  {
    id: 'aq-frac-m1',
    topicKey: 'fractions',
    difficulty: 'Medium',
    orderIndex: 4,
    prompt: {
      en: 'Add 1/3 + 1/6 and write in simplest form.',
      kn: '1/3 + 1/6 ಅನ್ನು ಕೂಡಿಸಿ ಸರಳ ರೂಪದಲ್ಲಿ ಬರೆಯಿರಿ.',
      hi: '1/3 + 1/6 को जोड़कर सरलतम रूप में लिखें।',
    },
    options: [
      { en: '2/9', kn: '2/9', hi: '2/9' },
      { en: '1/2', kn: '1/2', hi: '1/2' },
      { en: '2/6', kn: '2/6', hi: '2/6' },
      { en: '3/4', kn: '3/4', hi: '3/4' },
    ],
    correctIndex: 1,
    explanation: {
      en: '1/3 = 2/6. Then 2/6 + 1/6 = 3/6 = 1/2.',
      kn: '1/3 = 2/6. ಆದ್ದರಿಂದ 2/6 + 1/6 = 3/6 = 1/2.',
      hi: '1/3 = 2/6 होता है। 2/6 + 1/6 = 3/6 = 1/2।',
    },
  },
  {
    id: 'aq-frac-m2',
    topicKey: 'fractions',
    difficulty: 'Medium',
    orderIndex: 5,
    prompt: {
      en: 'Convert 3/4 into a decimal.',
      kn: '3/4 ಅನ್ನು ದಶಮಾಂಶಕ್ಕೆ ಪರಿವರ್ತಿಸಿ.',
      hi: '3/4 को दशमलव में बदलें।',
    },
    options: [
      { en: '0.25', kn: '0.25', hi: '0.25' },
      { en: '0.50', kn: '0.50', hi: '0.50' },
      { en: '0.75', kn: '0.75', hi: '0.75' },
      { en: '0.34', kn: '0.34', hi: '0.34' },
    ],
    correctIndex: 2,
    explanation: {
      en: '3 ÷ 4 = 0.75 (or 75/100).',
      kn: '3 ÷ 4 = 0.75.',
      hi: '3 ÷ 4 = 0.75 (या 75/100)।',
    },
  },
  {
    id: 'aq-frac-m3',
    topicKey: 'fractions',
    difficulty: 'Medium',
    orderIndex: 6,
    prompt: {
      en: 'Which fraction is larger: 5/8 or 3/4?',
      kn: '5/8 ಮತ್ತು 3/4 ರಲ್ಲಿ ಯಾವ ಭಿನ್ನರಾಶಿ ದೊಡ್ಡದು?',
      hi: '5/8 और 3/4 में कौन-सा भिन्न बड़ा है?',
    },
    options: [
      { en: '5/8', kn: '5/8', hi: '5/8' },
      { en: '3/4', kn: '3/4', hi: '3/4' },
      { en: 'Both are equal', kn: 'ಎರಡೂ ಸಮಾನ', hi: 'दोनों बराबर हैं' },
      { en: 'Cannot be compared', kn: 'ಹೋಲಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ', hi: 'तुलना नहीं की जा सकती' },
    ],
    correctIndex: 1,
    explanation: {
      en: '3/4 = 6/8, which is greater than 5/8.',
      kn: '3/4 = 6/8 ಆಗಿದ್ದು, ಇದು 5/8 ಕ್ಕಿಂತ ದೊಡ್ಡದು.',
      hi: '3/4 = 6/8 होता है, जो 5/8 से बड़ा है।',
    },
  },
  {
    id: 'aq-frac-h1',
    topicKey: 'fractions',
    difficulty: 'Hard',
    orderIndex: 7,
    prompt: {
      en: 'A water tank is 3/5 full. After using 1/4 of the tank’s capacity, what fraction of the tank remains full?',
      kn: 'ನೀರಿನ ಟ್ಯಾಂಕ್ 3/5 ರಷ್ಟು ತುಂಬಿದೆ. ಅದರ ಸಾಮರ್ಥ್ಯದ 1/4 ಭಾಗವನ್ನು ಬಳಸಿದ ನಂತರ ಎಷ್ಟು ಭಾಗ ಉಳಿಯುತ್ತದೆ?',
      hi: 'एक पानी की टंकी 3/5 भरी है। टंकी की क्षमता का 1/4 भाग उपयोग करने के बाद कितना भाग बचा है?',
    },
    options: [
      { en: '2/5', kn: '2/5', hi: '2/5' },
      { en: '7/20', kn: '7/20', hi: '7/20' },
      { en: '11/20', kn: '11/20', hi: '11/20' },
      { en: '1/4', kn: '1/4', hi: '1/4' },
    ],
    correctIndex: 1,
    explanation: {
      en: '3/5 - 1/4 = 12/20 - 5/20 = 7/20.',
      kn: '3/5 - 1/4 = 12/20 - 5/20 = 7/20.',
      hi: '3/5 - 1/4 = 12/20 - 5/20 = 7/20।',
    },
  },
  {
    id: 'aq-frac-h2',
    topicKey: 'fractions',
    difficulty: 'Hard',
    orderIndex: 8,
    prompt: {
      en: 'Multiply and simplify: (3/4) × (8/9)',
      kn: 'ಗುಣಿಸಿ ಸರಳಗೊಳಿಸಿ: (3/4) × (8/9)',
      hi: 'गुणा करें और सरल रूप लिखें: (3/4) × (8/9)',
    },
    options: [
      { en: '2/3', kn: '2/3', hi: '2/3' },
      { en: '11/13', kn: '11/13', hi: '11/13' },
      { en: '24/27', kn: '24/27', hi: '24/27' },
      { en: '3/4', kn: '3/4', hi: '3/4' },
    ],
    correctIndex: 0,
    explanation: {
      en: '(3 × 8)/(4 × 9) = 24/36. Dividing by 12 gives 2/3.',
      kn: '(3 × 8)/(4 × 9) = 24/36 = 2/3.',
      hi: '(3 × 8)/(4 × 9) = 24/36 = 2/3।',
    },
  },
  {
    id: 'aq-frac-h3',
    topicKey: 'fractions',
    difficulty: 'Hard',
    orderIndex: 9,
    prompt: {
      en: 'Divide: 2 1/2 ÷ 5/8',
      kn: 'ಭಾಗಿಸಿ: 2 1/2 ÷ 5/8',
      hi: 'भाग दें: 2 1/2 ÷ 5/8',
    },
    options: [
      { en: '4', kn: '4', hi: '4' },
      { en: '2', kn: '2', hi: '2' },
      { en: '25/16', kn: '25/16', hi: '25/16' },
      { en: '5', kn: '5', hi: '5' },
    ],
    correctIndex: 0,
    explanation: {
      en: '2 1/2 = 5/2. Dividing by 5/8 is multiplying by 8/5: (5/2) × (8/5) = 8/2 = 4.',
      kn: '2 1/2 = 5/2. (5/2) × (8/5) = 4.',
      hi: '2 1/2 = 5/2। (5/2) × (8/5) = 4।',
    },
  },

  // ---------------- RATIOS (Easy, Medium, Hard) ----------------
  {
    id: 'aq-rat-e1',
    topicKey: 'ratios',
    difficulty: 'Easy',
    orderIndex: 1,
    prompt: {
      en: 'In a class there are 12 girls and 18 boys. What is the ratio of girls to boys in simplest form?',
      kn: 'ಒಂದು ತರಗತಿಯಲ್ಲಿ 12 ಬಾಲಕಿಯರು ಮತ್ತು 18 ಬಾಲಕರು ಇದ್ದಾರೆ. ಬಾಲಕಿಯರು ಮತ್ತು ಬಾಲಕರ ಸರಳ ಅನುಪಾತ ಎಷ್ಟು?',
      hi: 'एक कक्षा में 12 लड़कियाँ और 18 लड़के हैं। लड़कियों और लड़कों का सरलतम अनुपात क्या है?',
    },
    options: [
      { en: '2:3', kn: '2:3', hi: '2:3' },
      { en: '3:2', kn: '3:2', hi: '3:2' },
      { en: '4:6', kn: '4:6', hi: '4:6' },
      { en: '1:2', kn: '1:2', hi: '1:2' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Divide both 12 and 18 by 6 to get 2:3.',
      kn: '12 ಮತ್ತು 18 ನ್ನು 6 ರಿಂದ ಭಾಗಿಸಿದರೆ 2:3 ಸಿಗುತ್ತದೆ.',
      hi: '12 और 18 को 6 से भाग देने पर 2:3 मिलता है।',
    },
  },
  {
    id: 'aq-rat-e2',
    topicKey: 'ratios',
    difficulty: 'Easy',
    orderIndex: 2,
    prompt: {
      en: 'If 1 pen costs ₹12, how much do 5 pens cost?',
      kn: '1 ಪೆನ್ನಿನ ಬೆಲೆ ₹12 ಆದರೆ, 5 ಪೆನ್ನುಗಳ ಬೆಲೆ ಎಷ್ಟು?',
      hi: 'यदि 1 पेन की कीमत ₹12 है, तो 5 पेन कितने के होंगे?',
    },
    options: [
      { en: '₹50', kn: '₹50', hi: '₹50' },
      { en: '₹60', kn: '₹60', hi: '₹60' },
      { en: '₹72', kn: '₹72', hi: '₹72' },
      { en: '₹48', kn: '₹48', hi: '₹48' },
    ],
    correctIndex: 1,
    explanation: {
      en: '5 × ₹12 = ₹60.',
      kn: '5 × ₹12 = ₹60.',
      hi: '5 × ₹12 = ₹60।',
    },
  },
  {
    id: 'aq-rat-e3',
    topicKey: 'ratios',
    difficulty: 'Easy',
    orderIndex: 3,
    prompt: {
      en: 'Simplify the ratio 10:25.',
      kn: '10:25 ಅನುಪಾತವನ್ನು ಸರಳಗೊಳಿಸಿ.',
      hi: 'अनुपात 10:25 को सरल करें।',
    },
    options: [
      { en: '2:5', kn: '2:5', hi: '2:5' },
      { en: '5:2', kn: '5:2', hi: '5:2' },
      { en: '1:5', kn: '1:5', hi: '1:5' },
      { en: '2:10', kn: '2:10', hi: '2:10' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Divide both terms by 5: 10÷5 = 2 and 25÷5 = 5, giving 2:5.',
      kn: 'ಎರಡನ್ನೂ 5 ರಿಂದ ಭಾಗಿಸಿ: 2:5.',
      hi: 'दोनों को 5 से भाग देने पर 2:5 मिलता है।',
    },
  },
  {
    id: 'aq-rat-m1',
    topicKey: 'ratios',
    difficulty: 'Medium',
    orderIndex: 4,
    prompt: {
      en: 'Find the missing value in the proportion: 3 : 5 = 12 : x',
      kn: 'ಸಮಾನುಪಾತದಲ್ಲಿ ಕಾಣೆಯಾದ ಮೌಲ್ಯ ಕಂಡುಹಿಡಿಯಿರಿ: 3 : 5 = 12 : x',
      hi: 'समानुपात में लुप्त संख्या ज्ञात करें: 3 : 5 = 12 : x',
    },
    options: [
      { en: '15', kn: '15', hi: '15' },
      { en: '20', kn: '20', hi: '20' },
      { en: '25', kn: '25', hi: '25' },
      { en: '18', kn: '18', hi: '18' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Since 3 × 4 = 12, multiply 5 × 4 = 20.',
      kn: '3 × 4 = 12 ಆಗಿರುವುದರಿಂದ 5 × 4 = 20.',
      hi: 'चूँकि 3 × 4 = 12 है, इसलिए 5 × 4 = 20 होगा।',
    },
  },
  {
    id: 'aq-rat-m2',
    topicKey: 'ratios',
    difficulty: 'Medium',
    orderIndex: 5,
    prompt: {
      en: 'What is the ratio of 50 cm to 2 m in simplest form?',
      kn: '50 ಸೆಂ.ಮೀ ಮತ್ತು 2 ಮೀ ನಡುವಿನ ಸರಳ ಅನುಪಾತ ಎಷ್ಟು?',
      hi: '50 सेमी और 2 मीटर का सरलतम अनुपात क्या है?',
    },
    options: [
      { en: '25:1', kn: '25:1', hi: '25:1' },
      { en: '1:4', kn: '1:4', hi: '1:4' },
      { en: '1:2', kn: '1:2', hi: '1:2' },
      { en: '5:2', kn: '5:2', hi: '5:2' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Convert 2 m = 200 cm. Ratio 50:200 simplifies to 1:4.',
      kn: '2 ಮೀ = 200 ಸೆಂ.ಮೀ. 50:200 = 1:4.',
      hi: '2 मीटर = 200 सेमी। 50:200 का सरल रूप 1:4 है।',
    },
  },
  {
    id: 'aq-rat-m3',
    topicKey: 'ratios',
    difficulty: 'Medium',
    orderIndex: 6,
    prompt: {
      en: 'A bus travels 135 km in 3 hours. At the same speed, how far will it travel in 5 hours?',
      kn: 'ಒಂದು ಬಸ್ 3 ಗಂಟೆಯಲ್ಲಿ 135 ಕಿ.ಮೀ ಕ್ರಮಿಸಿದರೆ, ಅದೇ ವೇಗದಲ್ಲಿ 5 ಗಂಟೆಯಲ್ಲಿ ಎಷ್ಟು ದೂರ ಕ್ರಮಿಸುತ್ತದೆ?',
      hi: 'एक बस 3 घंटे में 135 किमी चलती है। उसी गति से 5 घंटे में कितनी दूर जाएगी?',
    },
    options: [
      { en: '215 km', kn: '215 ಕಿ.ಮೀ', hi: '215 किमी' },
      { en: '225 km', kn: '225 ಕಿ.ಮೀ', hi: '225 किमी' },
      { en: '240 km', kn: '240 ಕಿ.ಮೀ', hi: '240 किमी' },
      { en: '180 km', kn: '180 ಕಿ.ಮೀ', hi: '180 किमी' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Speed = 135 ÷ 3 = 45 km/h. In 5 hours: 45 × 5 = 225 km.',
      kn: 'ವೇಗ = 135 ÷ 3 = 45 ಕಿ.ಮೀ/ಗಂ. 5 ಗಂಟೆಯಲ್ಲಿ 225 ಕಿ.ಮೀ.',
      hi: 'गति = 135 ÷ 3 = 45 किमी/घंटा। 5 घंटे में 45 × 5 = 225 किमी।',
    },
  },
  {
    id: 'aq-rat-h1',
    topicKey: 'ratios',
    difficulty: 'Hard',
    orderIndex: 7,
    prompt: {
      en: 'Divide ₹630 between Asha and Kiran in the ratio 4 : 5. How much does Kiran receive?',
      kn: '₹630 ಅನ್ನು ಆಶಾ ಮತ್ತು ಕಿರಣ್ ನಡುವೆ 4 : 5 ಅನುಪಾತದಲ್ಲಿ ಹಂಚಿದರೆ ಕಿರಣ್‌ಗೆ ಎಷ್ಟು ಸಿಗುತ್ತದೆ?',
      hi: '₹630 को आशा और किरण में 4 : 5 के अनुपात में बाँटें। किरण को कितने रुपये मिलेंगे?',
    },
    options: [
      { en: '₹280', kn: '₹280', hi: '₹280' },
      { en: '₹350', kn: '₹350', hi: '₹350' },
      { en: '₹315', kn: '₹315', hi: '₹315' },
      { en: '₹400', kn: '₹400', hi: '₹400' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Total parts = 4 + 5 = 9. One part = ₹630 ÷ 9 = ₹70. Kiran gets 5 × ₹70 = ₹350.',
      kn: 'ಒಟ್ಟು ಭಾಗಗಳು = 9. 1 ಭಾಗ = ₹70. ಕಿರಣ್ = 5 × ₹70 = ₹350.',
      hi: 'कुल भाग = 9। 1 भाग = ₹70। किरण = 5 × ₹70 = ₹350।',
    },
  },
  {
    id: 'aq-rat-h2',
    topicKey: 'ratios',
    difficulty: 'Hard',
    orderIndex: 8,
    prompt: {
      en: 'If 6 pumps can fill a village tank in 8 hours, how long will 4 identical pumps take?',
      kn: '6 ಪಂಪ್‌ಗಳು ಒಂದು ಟ್ಯಾಂಕ್ ಅನ್ನು 8 ಗಂಟೆಯಲ್ಲಿ ತುಂಬಿದರೆ, 4 ಪಂಪ್‌ಗಳು ಎಷ್ಟು ಗಂಟೆ ತೆಗೆದುಕೊಳ್ಳುತ್ತವೆ?',
      hi: 'यदि 6 पंप एक टंकी को 8 घंटे में भरते हैं, तो 4 पंप उसी टंकी को कितने घंटे में भरेंगे?',
    },
    options: [
      { en: '10 hours', kn: '10 ಗಂಟೆ', hi: '10 घंटे' },
      { en: '12 hours', kn: '12 ಗಂಟೆ', hi: '12 घंटे' },
      { en: '5.3 hours', kn: '5.3 ಗಂಟೆ', hi: '5.3 घंटे' },
      { en: '16 hours', kn: '16 ಗಂಟೆ', hi: '16 घंटे' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Inverse proportion: 6 × 8 = 4 × hours → 48 ÷ 4 = 12 hours.',
      kn: 'ವಿಲೋಮ ಸಮಾನುಪಾತ: 6 × 8 = 48. 48 ÷ 4 = 12 ಗಂಟೆ.',
      hi: 'व्युत्क्रम अनुपात: 6 × 8 = 48। 48 ÷ 4 = 12 घंटे।',
    },
  },
  {
    id: 'aq-rat-h3',
    topicKey: 'ratios',
    difficulty: 'Hard',
    orderIndex: 9,
    prompt: {
      en: 'On a map with scale 1 cm : 2.5 km, two schools are 6.4 cm apart. What is the real distance?',
      kn: '1 ಸೆಂ.ಮೀ : 2.5 ಕಿ.ಮೀ ಮಾಪಕದ ನಕ್ಷೆಯಲ್ಲಿ ಎರಡು ಶಾಲೆಗಳ ದೂರ 6.4 ಸೆಂ.ಮೀ ಆದರೆ ನಿಜವಾದ ದೂರ ಎಷ್ಟು?',
      hi: '1 सेमी : 2.5 किमी पैमाने वाले नक्शे पर दो स्कूल 6.4 सेमी दूर हैं। वास्तविक दूरी क्या है?',
    },
    options: [
      { en: '12.8 km', kn: '12.8 ಕಿ.ಮೀ', hi: '12.8 किमी' },
      { en: '16 km', kn: '16 ಕಿ.ಮೀ', hi: '16 किमी' },
      { en: '15.4 km', kn: '15.4 ಕಿ.ಮೀ', hi: '15.4 किमी' },
      { en: '18 km', kn: '18 ಕಿ.ಮೀ', hi: '18 किमी' },
    ],
    correctIndex: 1,
    explanation: {
      en: '6.4 × 2.5 = 16 km.',
      kn: '6.4 × 2.5 = 16 ಕಿ.ಮೀ.',
      hi: '6.4 × 2.5 = 16 किमी।',
    },
  },

  // ---------------- BASIC ALGEBRA (Easy, Medium, Hard) ----------------
  {
    id: 'aq-balg-e1',
    topicKey: 'basic_algebra',
    difficulty: 'Easy',
    orderIndex: 1,
    prompt: {
      en: 'If x = 4, what is the value of x + 9?',
      kn: 'x = 4 ಆದರೆ, x + 9 ರ ಮೌಲ್ಯ ಎಷ್ಟು?',
      hi: 'यदि x = 4 है, तो x + 9 का मान क्या होगा?',
    },
    options: [
      { en: '12', kn: '12', hi: '12' },
      { en: '13', kn: '13', hi: '13' },
      { en: '36', kn: '36', hi: '36' },
      { en: '5', kn: '5', hi: '5' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Substitute x = 4 into x + 9: 4 + 9 = 13.',
      kn: 'x = 4 ಆದೇಶಿಸಿದಾಗ 4 + 9 = 13.',
      hi: 'x = 4 रखने पर 4 + 9 = 13 मिलता है।',
    },
  },
  {
    id: 'aq-balg-e2',
    topicKey: 'basic_algebra',
    difficulty: 'Easy',
    orderIndex: 2,
    prompt: {
      en: 'Simplify: 3a + 2a',
      kn: 'ಸರಳಗೊಳಿಸಿ: 3a + 2a',
      hi: 'सरल करें: 3a + 2a',
    },
    options: [
      { en: '5a', kn: '5a', hi: '5a' },
      { en: '6a', kn: '6a', hi: '6a' },
      { en: '5a²', kn: '5a²', hi: '5a²' },
      { en: 'a⁵', kn: 'a⁵', hi: 'a⁵' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Combine like terms by adding coefficients: (3 + 2)a = 5a.',
      kn: 'ಸಜಾತಿಯ ಪದಗಳನ್ನು ಕೂಡಿಸಿ: (3 + 2)a = 5a.',
      hi: 'समान पदों के गुणांक जोड़ने पर (3 + 2)a = 5a मिलता है।',
    },
  },
  {
    id: 'aq-balg-e3',
    topicKey: 'basic_algebra',
    difficulty: 'Easy',
    orderIndex: 3,
    prompt: {
      en: 'Write an algebraic expression for “5 more than twice a number n”.',
      kn: '“ಒಂದು ಸಂಖ್ಯೆ n ನ ಎರಡರಷ್ಟಕ್ಕಿಂತ 5 ಹೆಚ್ಚು” ಎಂಬುದನ್ನು ಬೀಜಗಣಿತೀಯ ಪದವಾಗಿ ಬರೆಯಿರಿ.',
      hi: '“संख्या n के दोगुने से 5 अधिक” का बीजीय व्यंजक क्या है?',
    },
    options: [
      { en: '2n + 5', kn: '2n + 5', hi: '2n + 5' },
      { en: '5n + 2', kn: '5n + 2', hi: '5n + 2' },
      { en: 'n + 7', kn: 'n + 7', hi: 'n + 7' },
      { en: '2(n + 5)', kn: '2(n + 5)', hi: '2(n + 5)' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Twice n is 2n, and 5 more than that is 2n + 5.',
      kn: 'n ನ ಎರಡರಷ್ಟು 2n, ಅದಕ್ಕೆ 5 ಸೇರಿಸಿದರೆ 2n + 5.',
      hi: 'n का दोगुना 2n है, और उससे 5 अधिक 2n + 5 होगा।',
    },
  },
  {
    id: 'aq-balg-m1',
    topicKey: 'basic_algebra',
    difficulty: 'Medium',
    orderIndex: 4,
    prompt: {
      en: 'Evaluate 4m - 3 when m = 5.',
      kn: 'm = 5 ಆದಾಗ 4m - 3 ರ ಮೌಲ್ಯವನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ.',
      hi: 'यदि m = 5 हो, तो 4m - 3 का मान निकालें।',
    },
    options: [
      { en: '17', kn: '17', hi: '17' },
      { en: '20', kn: '20', hi: '20' },
      { en: '6', kn: '6', hi: '6' },
      { en: '23', kn: '23', hi: '23' },
    ],
    correctIndex: 0,
    explanation: {
      en: '4(5) - 3 = 20 - 3 = 17.',
      kn: '4(5) - 3 = 20 - 3 = 17.',
      hi: '4(5) - 3 = 20 - 3 = 17।',
    },
  },
  {
    id: 'aq-balg-m2',
    topicKey: 'basic_algebra',
    difficulty: 'Medium',
    orderIndex: 5,
    prompt: {
      en: 'Simplify: 6x + 4 - 2x + 3',
      kn: 'ಸರಳಗೊಳಿಸಿ: 6x + 4 - 2x + 3',
      hi: 'सरल करें: 6x + 4 - 2x + 3',
    },
    options: [
      { en: '4x + 7', kn: '4x + 7', hi: '4x + 7' },
      { en: '8x + 7', kn: '8x + 7', hi: '8x + 7' },
      { en: '4x + 1', kn: '4x + 1', hi: '4x + 1' },
      { en: '11x', kn: '11x', hi: '11x' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Group like terms: (6x - 2x) + (4 + 3) = 4x + 7.',
      kn: 'ಸಜಾತಿಯ ಪದಗಳನ್ನು ಗುಂಪು ಮಾಡಿ: (6x - 2x) + (4 + 3) = 4x + 7.',
      hi: 'समान पद मिलाने पर (6x - 2x) + (4 + 3) = 4x + 7 मिलता है।',
    },
  },
  {
    id: 'aq-balg-m3',
    topicKey: 'basic_algebra',
    difficulty: 'Medium',
    orderIndex: 6,
    prompt: {
      en: 'Expand: 3(y + 4)',
      kn: 'ವಿಸ್ತರಿಸಿ: 3(y + 4)',
      hi: 'विस्तार करें: 3(y + 4)',
    },
    options: [
      { en: '3y + 4', kn: '3y + 4', hi: '3y + 4' },
      { en: '3y + 12', kn: '3y + 12', hi: '3y + 12' },
      { en: 'y + 12', kn: 'y + 12', hi: 'y + 12' },
      { en: '7y', kn: '7y', hi: '7y' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Multiply 3 by both terms inside brackets: 3×y + 3×4 = 3y + 12.',
      kn: '3 ರಿಂದ ಎರಡೂ ಪದಗಳನ್ನು ಗುಣಿಸಿ: 3y + 12.',
      hi: '3 को कोष्ठक के दोनों पदों से गुणा करें: 3y + 12।',
    },
  },
  {
    id: 'aq-balg-h1',
    topicKey: 'basic_algebra',
    difficulty: 'Hard',
    orderIndex: 7,
    prompt: {
      en: 'Simplify: 2(3p - 4) + 5p',
      kn: 'ಸರಳಗೊಳಿಸಿ: 2(3p - 4) + 5p',
      hi: 'सरल करें: 2(3p - 4) + 5p',
    },
    options: [
      { en: '11p - 8', kn: '11p - 8', hi: '11p - 8' },
      { en: '11p - 4', kn: '11p - 4', hi: '11p - 4' },
      { en: '8p - 8', kn: '8p - 8', hi: '8p - 8' },
      { en: '6p - 3', kn: '6p - 3', hi: '6p - 3' },
    ],
    correctIndex: 0,
    explanation: {
      en: '2(3p - 4) + 5p = 6p - 8 + 5p = 11p - 8.',
      kn: '6p - 8 + 5p = 11p - 8.',
      hi: '6p - 8 + 5p = 11p - 8।',
    },
  },
  {
    id: 'aq-balg-h2',
    topicKey: 'basic_algebra',
    difficulty: 'Hard',
    orderIndex: 8,
    prompt: {
      en: 'If a = 3 and b = -2, what is 2a² + b?',
      kn: 'a = 3 ಮತ್ತು b = -2 ಆದರೆ 2a² + b ಮೌಲ್ಯ ಎಷ್ಟು?',
      hi: 'यदि a = 3 और b = -2 है, तो 2a² + b का मान क्या है?',
    },
    options: [
      { en: '16', kn: '16', hi: '16' },
      { en: '18', kn: '18', hi: '18' },
      { en: '34', kn: '34', hi: '34' },
      { en: '10', kn: '10', hi: '10' },
    ],
    correctIndex: 0,
    explanation: {
      en: '2(3²) + (-2) = 2(9) - 2 = 18 - 2 = 16.',
      kn: '2(9) - 2 = 18 - 2 = 16.',
      hi: '2(9) - 2 = 18 - 2 = 16।',
    },
  },
  {
    id: 'aq-balg-h3',
    topicKey: 'basic_algebra',
    difficulty: 'Hard',
    orderIndex: 9,
    prompt: {
      en: 'Subtract (2x - 5) from (7x + 1).',
      kn: '(7x + 1) ನಿಂದ (2x - 5) ಅನ್ನು ಕಳೆಯಿರಿ.',
      hi: '(7x + 1) में से (2x - 5) घटाएँ।',
    },
    options: [
      { en: '5x - 4', kn: '5x - 4', hi: '5x - 4' },
      { en: '5x + 6', kn: '5x + 6', hi: '5x + 6' },
      { en: '9x - 4', kn: '9x - 4', hi: '9x - 4' },
      { en: '5x - 6', kn: '5x - 6', hi: '5x - 6' },
    ],
    correctIndex: 1,
    explanation: {
      en: '(7x + 1) - (2x - 5) = 7x + 1 - 2x + 5 = 5x + 6.',
      kn: '7x + 1 - 2x + 5 = 5x + 6.',
      hi: '7x + 1 - 2x + 5 = 5x + 6।',
    },
  },

  // ---------------- LINEAR EQUATIONS (Easy, Medium, Hard) ----------------
  {
    id: 'aq-lin-e1',
    topicKey: 'linear_equations',
    difficulty: 'Easy',
    orderIndex: 1,
    prompt: {
      en: 'Solve for x: x + 8 = 15',
      kn: 'x ಕಂಡುಹಿಡಿಯಿರಿ: x + 8 = 15',
      hi: 'x का मान ज्ञात करें: x + 8 = 15',
    },
    options: [
      { en: '5', kn: '5', hi: '5' },
      { en: '7', kn: '7', hi: '7' },
      { en: '23', kn: '23', hi: '23' },
      { en: '8', kn: '8', hi: '8' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Subtract 8 from both sides: x = 15 - 8 = 7.',
      kn: 'ಎರಡೂ ಬದಿಗಳಿಂದ 8 ಕಳೆಯಿರಿ: x = 7.',
      hi: 'दोनों ओर से 8 घटाने पर x = 7 मिलता है।',
    },
  },
  {
    id: 'aq-lin-e2',
    topicKey: 'linear_equations',
    difficulty: 'Easy',
    orderIndex: 2,
    prompt: {
      en: 'Solve for n: 3n = 21',
      kn: 'n ಕಂಡುಹಿಡಿಯಿರಿ: 3n = 21',
      hi: 'n का मान ज्ञात करें: 3n = 21',
    },
    options: [
      { en: '6', kn: '6', hi: '6' },
      { en: '7', kn: '7', hi: '7' },
      { en: '18', kn: '18', hi: '18' },
      { en: '63', kn: '63', hi: '63' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Divide both sides by 3: n = 21 ÷ 3 = 7.',
      kn: 'ಎರಡೂ ಬದಿಗಳನ್ನು 3 ರಿಂದ ಭಾಗಿಸಿ: n = 7.',
      hi: 'दोनों ओर 3 से भाग देने पर n = 7 मिलता है।',
    },
  },
  {
    id: 'aq-lin-e3',
    topicKey: 'linear_equations',
    difficulty: 'Easy',
    orderIndex: 3,
    prompt: {
      en: 'Solve for k: k - 6 = 10',
      kn: 'k ಕಂಡುಹಿಡಿಯಿರಿ: k - 6 = 10',
      hi: 'k का मान ज्ञात करें: k - 6 = 10',
    },
    options: [
      { en: '4', kn: '4', hi: '4' },
      { en: '16', kn: '16', hi: '16' },
      { en: '60', kn: '60', hi: '60' },
      { en: '14', kn: '14', hi: '14' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Add 6 to both sides: k = 10 + 6 = 16.',
      kn: 'ಎರಡೂ ಬದಿಗಳಿಗೆ 6 ಸೇರಿಸಿ: k = 16.',
      hi: 'दोनों ओर 6 जोड़ने पर k = 16 मिलता है।',
    },
  },
  {
    id: 'aq-lin-m1',
    topicKey: 'linear_equations',
    difficulty: 'Medium',
    orderIndex: 4,
    prompt: {
      en: 'Solve for x: 5x - 4 = 21',
      kn: 'x ಕಂಡುಹಿಡಿಯಿರಿ: 5x - 4 = 21',
      hi: 'x का मान निकालें: 5x - 4 = 21',
    },
    options: [
      { en: '3', kn: '3', hi: '3' },
      { en: '5', kn: '5', hi: '5' },
      { en: '3.4', kn: '3.4', hi: '3.4' },
      { en: '25', kn: '25', hi: '25' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Add 4 to both sides: 5x = 25. Divide by 5: x = 5.',
      kn: '5x = 25 ಆಗುತ್ತದೆ. 5 ರಿಂದ ಭಾಗಿಸಿ: x = 5.',
      hi: 'दोनों ओर 4 जोड़ने पर 5x = 25 और x = 5।',
    },
  },
  {
    id: 'aq-lin-m2',
    topicKey: 'linear_equations',
    difficulty: 'Medium',
    orderIndex: 5,
    prompt: {
      en: 'Solve for p: (p / 4) + 3 = 9',
      kn: 'p ಕಂಡುಹಿಡಿಯಿರಿ: (p / 4) + 3 = 9',
      hi: 'p का मान निकालें: (p / 4) + 3 = 9',
    },
    options: [
      { en: '24', kn: '24', hi: '24' },
      { en: '12', kn: '12', hi: '12' },
      { en: '36', kn: '36', hi: '36' },
      { en: '48', kn: '48', hi: '48' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Subtract 3: p/4 = 6. Multiply by 4: p = 24.',
      kn: 'p/4 = 6. ಆದ್ದರಿಂದ p = 24.',
      hi: '3 घटाने पर p/4 = 6, और 4 से गुणा करने पर p = 24।',
    },
  },
  {
    id: 'aq-lin-m3',
    topicKey: 'linear_equations',
    difficulty: 'Medium',
    orderIndex: 6,
    prompt: {
      en: 'Solve for t: 3t + 9 = t + 19',
      kn: 't ಕಂಡುಹಿಡಿಯಿರಿ: 3t + 9 = t + 19',
      hi: 't का मान निकालें: 3t + 9 = t + 19',
    },
    options: [
      { en: '4', kn: '4', hi: '4' },
      { en: '5', kn: '5', hi: '5' },
      { en: '7', kn: '7', hi: '7' },
      { en: '10', kn: '10', hi: '10' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Subtract t and 9: 2t = 10 → t = 5.',
      kn: '2t = 10 → t = 5.',
      hi: '2t = 10 → t = 5।',
    },
  },
  {
    id: 'aq-lin-h1',
    topicKey: 'linear_equations',
    difficulty: 'Hard',
    orderIndex: 7,
    prompt: {
      en: 'Solve for x: 3(x - 2) = 2x + 5',
      kn: 'x ಕಂಡುಹಿಡಿಯಿರಿ: 3(x - 2) = 2x + 5',
      hi: 'x का मान निकालें: 3(x - 2) = 2x + 5',
    },
    options: [
      { en: '11', kn: '11', hi: '11' },
      { en: '7', kn: '7', hi: '7' },
      { en: '1', kn: '1', hi: '1' },
      { en: '9', kn: '9', hi: '9' },
    ],
    correctIndex: 0,
    explanation: {
      en: '3x - 6 = 2x + 5 → x = 11.',
      kn: '3x - 6 = 2x + 5 → x = 11.',
      hi: '3x - 6 = 2x + 5 → x = 11।',
    },
  },
  {
    id: 'aq-lin-h2',
    topicKey: 'linear_equations',
    difficulty: 'Hard',
    orderIndex: 8,
    prompt: {
      en: 'The sum of two consecutive integers is 47. What is the larger integer?',
      kn: 'ಎರಡು ಅನುಕ್ರಮ ಪೂರ್ಣಾಂಕಗಳ ಮೊತ್ತ 47 ಆದರೆ ದೊಡ್ಡ ಸಂಖ್ಯೆ ಯಾವುದು?',
      hi: 'दो लगातार पूर्णांकों का योग 47 है। बड़ा पूर्णांक क्या है?',
    },
    options: [
      { en: '23', kn: '23', hi: '23' },
      { en: '24', kn: '24', hi: '24' },
      { en: '25', kn: '25', hi: '25' },
      { en: '22', kn: '22', hi: '22' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Let integers be n and n + 1. 2n + 1 = 47 → 2n = 46 → n = 23. Larger integer = 24.',
      kn: '2n + 1 = 47 → n = 23. ದೊಡ್ಡ ಸಂಖ್ಯೆ = 24.',
      hi: '2n + 1 = 47 → n = 23। बड़ा पूर्णांक = 24।',
    },
  },
  {
    id: 'aq-lin-h3',
    topicKey: 'linear_equations',
    difficulty: 'Hard',
    orderIndex: 9,
    prompt: {
      en: 'Solve for m: (2m + 1) / 3 = 5',
      kn: 'm ಕಂಡುಹಿಡಿಯಿರಿ: (2m + 1) / 3 = 5',
      hi: 'm का मान निकालें: (2m + 1) / 3 = 5',
    },
    options: [
      { en: '7', kn: '7', hi: '7' },
      { en: '8', kn: '8', hi: '8' },
      { en: '14', kn: '14', hi: '14' },
      { en: '2', kn: '2', hi: '2' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Multiply by 3: 2m + 1 = 15 → 2m = 14 → m = 7.',
      kn: '2m + 1 = 15 → 2m = 14 → m = 7.',
      hi: '2m + 1 = 15 → 2m = 14 → m = 7।',
    },
  },

  // ---------------- SCIENCE TOPICS (Easy, Medium, Hard) ----------------
  {
    id: 'aq-sci-pn-e1',
    topicKey: 'plant_nutrition',
    difficulty: 'Easy',
    orderIndex: 1,
    prompt: {
      en: 'Which part of a green plant mainly performs photosynthesis?',
      kn: 'ಹಸಿರು ಸಸ್ಯದ ಯಾವ ಭಾಗ ಮುಖ್ಯವಾಗಿ ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ ನಡೆಸುತ್ತದೆ?',
      hi: 'हरे पौधे का कौन-सा भाग मुख्य रूप से प्रकाश संश्लेषण करता है?',
    },
    options: [
      { en: 'Leaves', kn: 'ಎಲೆಗಳು', hi: 'पत्तियाँ' },
      { en: 'Flowers', kn: 'ಹೂವುಗಳು', hi: 'फूल' },
      { en: 'Seeds', kn: 'ಬೀಜಗಳು', hi: 'बीज' },
      { en: 'Bark', kn: 'ತೊಗಟೆ', hi: 'छाल' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Leaves contain chlorophyll that captures sunlight to make plant food.',
      kn: 'ಎಲೆಗಳಲ್ಲಿರುವ ಕ್ಲೋರೋಫಿಲ್ ಸೂರ್ಯನ ಬೆಳಕನ್ನು ಬಳಸಿ ಆಹಾರ ತಯಾರಿಸುತ್ತದೆ.',
      hi: 'पत्तियों में क्लोरोफिल होता है जो सूर्य के प्रकाश से भोजन बनाता है।',
    },
  },
  {
    id: 'aq-sci-pn-e2',
    topicKey: 'plant_nutrition',
    difficulty: 'Easy',
    orderIndex: 2,
    prompt: {
      en: 'What gives leaves their green colour?',
      kn: 'ಎಲೆಗಳಿಗೆ ಹಸಿರು ಬಣ್ಣವನ್ನು ನೀಡುವ ವಸ್ತು ಯಾವುದು?',
      hi: 'पत्तियों को हरा रंग किसके कारण मिलता है?',
    },
    options: [
      { en: 'Starch', kn: 'ಪಿಷ್ಟ', hi: 'स्टार्च' },
      { en: 'Chlorophyll', kn: 'ಕ್ಲೋರೋಫಿಲ್', hi: 'क्लोरोफिल' },
      { en: 'Nitrogen', kn: 'ಸಾರಜನಕ', hi: 'नाइट्रोजन' },
      { en: 'Water', kn: 'ನೀರು', hi: 'पानी' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Chlorophyll is the green pigment in leaves essential for absorbing sunlight.',
      kn: 'ಕ್ಲೋರೋಫಿಲ್ ಹಸಿರು ವರ್ಣದ್ರವ್ಯವಾಗಿದೆ.',
      hi: 'क्लोरोफिल हरा वर्णक है जो प्रकाश संश्लेषण के लिए आवश्यक है।',
    },
  },
  {
    id: 'aq-sci-pn-m1',
    topicKey: 'plant_nutrition',
    difficulty: 'Medium',
    orderIndex: 3,
    prompt: {
      en: 'Through which tiny pores on leaves does carbon dioxide enter?',
      kn: 'ಎಲೆಗಳ ಮೇಲಿರುವ ಯಾವ ಸಣ್ಣ ರಂಧ್ರಗಳ ಮೂಲಕ ಕಾರ್ಬನ್ ಡೈಆಕ್ಸೈಡ್ ಒಳಗೆ ಹೋಗುತ್ತದೆ?',
      hi: 'पत्तियों के किन छोटे छिद्रों से कार्बन डाइऑक्साइड अंदर जाती है?',
    },
    options: [
      { en: 'Xylem', kn: 'ಕ್ಸೈಲಂ', hi: 'जाइलम' },
      { en: 'Stomata', kn: 'ಪತ್ರರಂಧ್ರಗಳು (Stomata)', hi: 'रंध्र (Stomata)' },
      { en: 'Root hairs', kn: 'ಬೇರು ರೋಮಗಳು', hi: 'मूल रोम' },
      { en: 'Petals', kn: 'ದಳಗಳು', hi: 'पंखुड़ियाँ' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Stomata allow gas exchange (CO2 in, O2 out) and transpiration.',
      kn: 'ಪತ್ರರಂಧ್ರಗಳು ಅನಿಲ ವಿನಿಮಯಕ್ಕೆ ಸಹಾಯ ಮಾಡುತ್ತವೆ.',
      hi: 'रंध्र गैसों के आदान-प्रदान में मदद करते हैं।',
    },
  },
  {
    id: 'aq-sci-pn-m2',
    topicKey: 'plant_nutrition',
    difficulty: 'Medium',
    orderIndex: 4,
    prompt: {
      en: 'Which tissue transports water from roots up to the leaves?',
      kn: 'ಬೇರುಗಳಿಂದ ಎಲೆಗಳಿಗೆ ನೀರನ್ನು ಸಾಗಿಸುವ ಅಂಗಾಂಶ ಯಾವುದು?',
      hi: 'जड़ों से पत्तियों तक पानी पहुँचाने वाला ऊतक कौन-सा है?',
    },
    options: [
      { en: 'Xylem', kn: 'ಕ್ಸೈಲಂ (Xylem)', hi: 'जाइलम' },
      { en: 'Phloem', kn: 'ಫ್ಲೋಯಂ', hi: 'फ्लोएम' },
      { en: 'Epidermis', kn: 'ಹೊರಚರ್ಮ', hi: 'एपिडर्मिस' },
      { en: 'Guard cells', kn: 'ರಕ್ಷಕ ಕೋಶಗಳು', hi: 'द्वार कोशिकाएँ' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Xylem vessels carry water and dissolved minerals upward from soil to leaves.',
      kn: 'ಕ್ಸೈಲಂ ನಾಳಗಳು ನೀರು ಮತ್ತು ಖನಿಜಗಳನ್ನು ಮೇಲಕ್ಕೆ ಸಾಗಿಸುತ್ತವೆ.',
      hi: 'जाइलम जल और खनिजों को जड़ों से पत्तियों तक ले जाता है।',
    },
  },
  {
    id: 'aq-sci-pn-h1',
    topicKey: 'plant_nutrition',
    difficulty: 'Hard',
    orderIndex: 5,
    prompt: {
      en: 'Why do farmers grow legume crops (like pulses or groundnut) between cereal crops?',
      kn: 'ರೈತರು ಧಾನ್ಯ ಬೆಳೆಗಳ ನಡುವೆ ದ್ವಿದಳ ಧಾನ್ಯಗಳನ್ನು (ಕಡಲೆಕಾಯಿ, ತೊಗರಿ) ಏಕೆ ಬೆಳೆಯುತ್ತಾರೆ?',
      hi: 'किसान अनाज की फसलों के बीच दलहनी फसलें (मूंगफली, दालें) क्यों उगाते हैं?',
    },
    options: [
      {
        en: 'Rhizobium bacteria in their root nodules fix atmospheric nitrogen into soil',
        kn: 'ಬೇರು ಗಂಟುಗಳಲ್ಲಿರುವ ರೈಜೋಬಿಯಂ ಬ್ಯಾಕ್ಟೀರಿಯಾ ಮಣ್ಣಿಗೆ ಸಾರಜನಕವನ್ನು ಸೇರಿಸುತ್ತದೆ',
        hi: 'जड़ों की गांठों में राइजोबियम जीवाणु मिट्टी में नाइट्रोजन स्थिर करते हैं',
      },
      {
        en: 'They stop photosynthesis completely',
        kn: 'ಅವು ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆಯನ್ನು ನಿಲ್ಲಿಸುತ್ತವೆ',
        hi: 'वे प्रकाश संश्लेषण रोक देती हैं',
      },
      {
        en: 'They remove all oxygen from soil',
        kn: 'ಮಣ್ಣಿನಿಂದ ಆಮ್ಲಜನಕ ತೆಗೆಯುತ್ತವೆ',
        hi: 'मिट्टी से ऑक्सीजन हटाती हैं',
      },
      {
        en: 'They turn clay into sand',
        kn: 'ಜೇಡಿಮಣ್ಣನ್ನು ಮರಳಾಗಿ ಬದಲಿಸುತ್ತವೆ',
        hi: 'चिकनी मिट्टी को रेत में बदलती हैं',
      },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Symbiotic Rhizobium bacteria convert atmospheric nitrogen into usable soil compounds.',
      kn: 'ರೈಜೋಬಿಯಂ ಬ್ಯಾಕ್ಟೀರಿಯಾ ಗಾಳಿಯ ಸಾರಜನಕವನ್ನು ಸಸ್ಯಗಳಿಗೆ ಉಪಯುಕ್ತ ರೂಪಕ್ಕೆ ಪರಿವರ್ತಿಸುತ್ತದೆ.',
      hi: 'राइजोबियम जीवाणु वायुमंडलीय नाइट्रोजन को मिट्टी के लिए उपयोगी यौगिकों में बदलते हैं।',
    },
  },
  {
    id: 'aq-sci-pn-h2',
    topicKey: 'plant_nutrition',
    difficulty: 'Hard',
    orderIndex: 6,
    prompt: {
      en: 'If a potted green plant is kept in a completely dark room for 3 days, what happens to starch in its leaves?',
      kn: 'ಒಂದು ಹಸಿರು ಸಸ್ಯವನ್ನು 3 ದಿನ ಪೂರ್ತಿ ಕತ್ತಲೆ ಕೋಣೆಯಲ್ಲಿಟ್ಟರೆ ಎಲೆಗಳಲ್ಲಿರುವ ಪಿಷ್ಟಕ್ಕೆ ಏನಾಗುತ್ತದೆ?',
      hi: 'एक हरे पौधे को 3 दिन तक पूरी तरह अंधेरे कमरे में रखने पर पत्तियों के स्टार्च का क्या होता है?',
    },
    options: [
      {
        en: 'Stored starch is used up and new starch cannot be made without light',
        kn: 'ಸಂಗ್ರಹವಾದ ಪಿಷ್ಟ ಖರ್ಚಾಗುತ್ತದೆ ಮತ್ತು ಬೆಳಕಿಲ್ಲದೆ ಹೊಸ ಪಿಷ್ಟ ತಯಾರಾಗುವುದಿಲ್ಲ',
        hi: 'संचित स्टार्च उपयोग हो जाता है और प्रकाश के बिना नया स्टार्च नहीं बनता',
      },
      {
        en: 'Starch doubles every hour',
        kn: 'ಪ್ರತಿ ಗಂಟೆಗೆ ಪಿಷ್ಟ ದ್ವಿಗುಣವಾಗುತ್ತದೆ',
        hi: 'स्टार्च हर घंटे दोगुना हो जाता है',
      },
      {
        en: 'Leaves turn into xylem tissue',
        kn: 'ಎಲೆಗಳು ಕ್ಸೈಲಂ ಆಗುತ್ತವೆ',
        hi: 'पत्तियाँ जाइलम बन जाती हैं',
      },
      {
        en: 'Iodine solution turns deep blue-black',
        kn: 'ಅಯೋಡಿನ್ ದ್ರಾವಣ ಗಾಢ ನೀಲಿ-ಕಪ್ಪು ಬಣ್ಣಕ್ಕೆ ತಿರುಗುತ್ತದೆ',
        hi: 'आयोडीन घोल गहरा नीला-काला हो जाता है',
      },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Without sunlight, photosynthesis stops and existing starch reserves are consumed by respiration.',
      kn: 'ಸೂರ್ಯನ ಬೆಳಕಿಲ್ಲದೆ ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ ನಡೆಯುವುದಿಲ್ಲ ಮತ್ತು ಸಂಗ್ರಹಿತ ಪಿಷ್ಟ ಖರ್ಚಾಗುತ್ತದೆ.',
      hi: 'सूर्य के प्रकाश के बिना प्रकाश संश्लेषण रुक जाता है और संचित स्टार्च खर्च हो जाता है।',
    },
  },

  {
    id: 'aq-sci-cir-e1',
    topicKey: 'circuits',
    difficulty: 'Easy',
    orderIndex: 1,
    prompt: {
      en: 'When a switch is in the OFF (open) position in a torch circuit, the bulb:',
      kn: 'ಟಾರ್ಚ್ ಸರ್ಕ್ಯೂಟ್‌ನಲ್ಲಿ ಸ್ವಿಚ್ OFF (ತೆರೆದ) ಸ್ಥಿತಿಯಲ್ಲಿದ್ದಾಗ ಬಲ್ಬ್:',
      hi: 'टॉर्च परिपथ में स्विच OFF (खुली) स्थिति में होने पर बल्ब:',
    },
    options: [
      { en: 'Does not glow', kn: 'ಉರಿಯುವುದಿಲ್ಲ', hi: 'नहीं जलता है' },
      { en: 'Glows brighter', kn: 'ಹೆಚ್ಚು ಪ್ರಕಾಶಮಾನವಾಗಿ ಉರಿಯುತ್ತದೆ', hi: 'अधिक तेज जलता है' },
      { en: 'Charges the cell', kn: 'ಸೆಲ್ ಚಾರ್ಜ್ ಮಾಡುತ್ತದೆ', hi: 'सेल चार्ज करता है' },
      { en: 'Reverses terminals', kn: 'ತುದಿಗಳನ್ನು ಬದಲಿಸುತ್ತದೆ', hi: 'टर्मिनल बदल देता है' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'An open switch creates an air gap that breaks the closed path, stopping current flow.',
      kn: 'ತೆರೆದ ಸ್ವಿಚ್ ವಿದ್ಯುತ್ ಮಾರ್ಗವನ್ನು ತುಂಡರಿಸುತ್ತದೆ.',
      hi: 'खुला स्विच परिपथ को तोड़ देता है जिससे धारा नहीं बहती।',
    },
  },
  {
    id: 'aq-sci-cir-e2',
    topicKey: 'circuits',
    difficulty: 'Easy',
    orderIndex: 2,
    prompt: {
      en: 'Which of these is an electrical insulator?',
      kn: 'ಇವುಗಳಲ್ಲಿ ಯಾವುದು ವಿದ್ಯುತ್ ಅವಾಹಕವಾಗಿದೆ?',
      hi: 'इनमें से कौन-सा विद्युत कुचालक है?',
    },
    options: [
      { en: 'Iron nail', kn: 'ಕಬ್ಬಿಣದ ಮೊಳೆ', hi: 'लोहे की कील' },
      { en: 'Plastic ruler', kn: 'ಪ್ಲಾಸ್ಟಿಕ್ ಅಳತೆಪಟ್ಟಿ', hi: 'प्लास्टिक स्केल' },
      { en: 'Copper wire', kn: 'ತಾಮ್ರದ ತಂತಿ', hi: 'तांबे का तार' },
      { en: 'Aluminium spoon', kn: 'ಅಲ್ಯೂಮಿನಿಯಂ ಚಮಚ', hi: 'एल्युमीनियम चम्मच' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Plastic does not allow electric current to flow through it.',
      kn: 'ಪ್ಲಾಸ್ಟಿಕ್ ಮೂಲಕ ವಿದ್ಯುತ್ ಹರಿಯುವುದಿಲ್ಲ.',
      hi: 'प्लास्टिक से होकर विद्युत धारा नहीं बहती।',
    },
  },
  {
    id: 'aq-sci-cir-m1',
    topicKey: 'circuits',
    difficulty: 'Medium',
    orderIndex: 3,
    prompt: {
      en: 'Why are electrician screwdriver handles covered with thick rubber or plastic?',
      kn: 'ಎಲೆಕ್ಟ್ರಿಷಿಯನ್ ಸ್ಕ್ರೂಡ್ರೈವರ್ ಹಿಡಿಕೆಗಳನ್ನು ರಬ್ಬರ್ ಅಥವಾ ಪ್ಲಾಸ್ಟಿಕ್‌ನಿಂದ ಏಕೆ ಮುಚ್ಚಿರುತ್ತಾರೆ?',
      hi: 'बिजली मिस्त्री के पेचकस के हैंडल पर रबर या प्लास्टिक क्यों चढ़ा होता है?',
    },
    options: [
      {
        en: 'To insulate the hand from electric shock',
        kn: 'ವಿದ್ಯುತ್ ಆಘಾತದಿಂದ ಕೈಯನ್ನು ರಕ್ಷಿಸಲು',
        hi: 'बिजली के झटके से हाथ को बचाने के लिए',
      },
      { en: 'To increase voltage', kn: 'ವೋಲ್ಟೇಜ್ ಹೆಚ್ಚಿಸಲು', hi: 'वोल्टेज बढ़ाने के लिए' },
      { en: 'To make the metal conduct faster', kn: 'ಲೋಹದ ವಾಹಕತೆ ಹೆಚ್ಚಿಸಲು', hi: 'धातु में चालन तेज करने के लिए' },
      { en: 'To store electrical charge', kn: 'ವಿದ್ಯುತ್ ಸಂಗ್ರಹಿಸಲು', hi: 'विद्युत संचित करने के लिए' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Rubber and plastic are insulators that block electric current from reaching the user.',
      kn: 'ರಬ್ಬರ್ ಮತ್ತು ಪ್ಲಾಸ್ಟಿಕ್ ಅವಾಹಕಗಳಾಗಿ ಸುರಕ್ಷತೆ ನೀಡುತ್ತವೆ.',
      hi: 'रबर और प्लास्टिक कुचालक हैं जो करंट को हाथ तक जाने से रोकते हैं।',
    },
  },
  {
    id: 'aq-sci-cir-m2',
    topicKey: 'circuits',
    difficulty: 'Medium',
    orderIndex: 4,
    prompt: {
      en: 'In a dry cell, electric current conventionally flows outside the cell from:',
      kn: 'ಡ್ರೈ ಸೆಲ್‌ನ ಹೊರಗೆ ಸಾಂಪ್ರದಾಯಿಕವಾಗಿ ವಿದ್ಯುತ್ ಪ್ರವಾಹ ಎಲ್ಲಿಂದ ಎಲ್ಲಿಗೆ ಹರಿಯುತ್ತದೆ?',
      hi: 'शुष्क सेल के बाहर विद्युत धारा पारंपरिक रूप से कहाँ से कहाँ बहती है?',
    },
    options: [
      {
        en: 'Positive (+) terminal to Negative (-) terminal',
        kn: 'ಧನ (+) ತುದಿಯಿಂದ ಋಣ (-) ತುದಿಗೆ',
        hi: 'धनात्मक (+) सिरे से ऋणात्मक (-) सिरे की ओर',
      },
      {
        en: 'Negative (-) terminal to Positive (+) terminal',
        kn: 'ಋಣ (-) ತುದಿಯಿಂದ ಧನ (+) ತುದಿಗೆ',
        hi: 'ऋणात्मक (-) सिरे से धनात्मक (+) सिरे की ओर',
      },
      { en: 'Only inside the switch', kn: 'ಸ್ವಿಚ್ ಒಳಗೆ ಮಾತ್ರ', hi: 'केवल स्विच के अंदर' },
      { en: 'From plastic to glass', kn: 'ಪ್ಲಾಸ್ಟಿಕ್‌ನಿಂದ ಗಾಜಿಗೆ', hi: 'प्लास्टिक से काँच की ओर' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Conventional current flows from the positive (+) terminal through the external circuit to the negative (-) terminal.',
      kn: 'ವಿದ್ಯುತ್ ಪ್ರವಾಹವು ಧನ (+) ತುದಿಯಿಂದ ಋಣ (-) ತುದಿಗೆ ಹರಿಯುತ್ತದೆ.',
      hi: 'पारंपरिक धारा धनात्मक (+) सिरे से परिपथ में होते हुए ऋणात्मक (-) सिरे तक जाती है।',
    },
  },
  {
    id: 'aq-sci-cir-h1',
    topicKey: 'circuits',
    difficulty: 'Hard',
    orderIndex: 5,
    prompt: {
      en: 'A student connects a new cell and switch properly, yet the bulb still does not glow. What is the most likely circuit fault inside the bulb?',
      kn: 'ಹೊಸ ಸೆಲ್ ಮತ್ತು ಸ್ವಿಚ್ ಸರಿಯಾಗಿ ಜೋಡಿಸಿದರೂ ಬಲ್ಬ್ ಉರಿಯುತ್ತಿಲ್ಲ. ಬಲ್ಬ್ ಒಳಗೆ ಇರಬಹುದಾದ ದೋಷ ಯಾವುದು?',
      hi: 'नया सेल और स्विच सही जोड़ने पर भी बल्ब नहीं जलता। बल्ब के अंदर सबसे संभावित खराबी क्या है?',
    },
    options: [
      {
        en: 'The thin tungsten filament inside the bulb is broken (fused bulb)',
        kn: 'ಬಲ್ಬ್ ಒಳಗಿನ ತೆಳುವಾದ ಫಿಲಮೆಂಟ್ ತುಂಡಾಗಿದೆ (ಫ್ಯೂಸ್ ಆಗಿದೆ)',
        hi: 'बल्ब के अंदर का पतला तंतु (फिलामेंट) टूट गया है',
      },
      { en: 'The glass cover is transparent', kn: 'ಗಾಜಿನ ಕವರ್ ಪಾರದರ್ಶಕವಾಗಿದೆ', hi: 'काँच पारदर्शी है' },
      { en: 'The copper wire is insulated', kn: 'ತಾಮ್ರದ ತಂತಿಗೆ ಪ್ಲಾಸ್ಟಿಕ್ ಇದೆ', hi: 'तांबे के तार पर प्लास्टिक चढ़ा है' },
      { en: 'The switch is closed', kn: 'ಸ್विಚ್ ಮುಚ್ಚಿದೆ', hi: 'स्विच बंद है' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'A broken filament interrupts the closed loop inside the bulb, so current cannot pass.',
      kn: 'ತುಂಡಾದ ಫಿಲಮೆಂಟ್ ಬಲ್ಬ್ ಒಳಗಿನ ಸರ್ಕ್ಯೂಟ್ ಮಾರ್ಗವನ್ನು ಮುರಿಯುತ್ತದೆ.',
      hi: 'टूटा हुआ तंतु परिपथ के बंद मार्ग को तोड़ देता है।',
    },
  },
  {
    id: 'aq-sci-cir-h2',
    topicKey: 'circuits',
    difficulty: 'Hard',
    orderIndex: 6,
    prompt: {
      en: 'Why do household circuits include a safety fuse or MCB?',
      kn: 'ಮನೆಯ ವಿದ್ಯುತ್ ಸರ್ಕ್ಯೂಟ್‌ಗಳಲ್ಲಿ ಸುರಕ್ಷತಾ ಫ್ಯೂಸ್ ಅಥವಾ MCB ಏಕೆ ಅಳವಡಿಸುತ್ತಾರೆ?',
      hi: 'घरेलू विद्युत परिपथ में फ्यूज या MCB क्यों लगाया जाता है?',
    },
    options: [
      {
        en: 'It breaks the circuit automatically if excessive current flows, preventing fires',
        kn: 'ಹೆಚ್ಚುವರಿ ವಿದ್ಯುತ್ ಹರಿದಾಗ ಸರ್ಕ್ಯೂಟ್ ಕತ್ತರಿಸಿ ಬೆಂಕಿ ಅಪಾಯ ತಪ್ಪಿಸುತ್ತದೆ',
        hi: 'अधिक धारा बहने पर परिपथ को तुरंत तोड़कर आग से बचाता है',
      },
      { en: 'It doubles battery voltage', kn: 'ಬ್ಯಾಟರಿ ವೋಲ್ಟೇಜ್ ದ್ವಿಗುಣಗೊಳಿಸುತ್ತದೆ', hi: 'वोल्टेज दोगुना करता है' },
      { en: 'It turns insulators into metals', kn: 'ಅವಾಹಕಗಳನ್ನು ಲೋಹವಾಗಿ ಮಾಡುತ್ತದೆ', hi: 'कुचालकों को धातु बनाता है' },
      { en: 'It cools down solar panels', kn: 'ಸೌರ ಫಲಕಗಳನ್ನು ತಂಪಾಗಿಸುತ್ತದೆ', hi: 'सोलर पैनल को ठंडा रखता है' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'A fuse melts or an MCB trips during overload or short circuit, safely disconnecting power.',
      kn: 'ಅಧಿಕ ವಿದ್ಯುತ್ ಪ್ರವಾಹದ ಸಮಯದಲ್ಲಿ ಫ್ಯೂಸ್ ಅಥವಾ MCB ವಿದ್ಯುತ್ ಕಡಿತಗೊಳಿಸಿ ರಕ್ಷಿಸುತ್ತದೆ.',
      hi: 'ओवरलोड या शॉर्ट सर्किट होने पर फ्यूज या MCB बिजली काटकर सुरक्षा प्रदान करता है।',
    },
  },

  {
    id: 'aq-sci-wat-e1',
    topicKey: 'water_cycle',
    difficulty: 'Easy',
    orderIndex: 1,
    prompt: {
      en: 'Turning liquid water from ponds into water vapour by sunlight is called:',
      kn: 'ಸೂರ್ಯನ ಬಿಸಿಲಿನಿಂದ ಕೆರೆಯ ನೀರು ಆವಿಯಾಗುವ ಪ್ರಕ್ರಿಯೆಯನ್ನು ಏನೆನ್ನುತ್ತಾರೆ?',
      hi: 'सूर्य की गर्मी से तालाब के पानी का वाष्प बनना क्या कहलाता है?',
    },
    options: [
      { en: 'Evaporation', kn: 'ಆವಿಯಾಗುವಿಕೆ (Evaporation)', hi: 'वाष्पीकरण' },
      { en: 'Condensation', kn: 'ಸಾಂದ್ರೀಕರಣ', hi: 'संघनन' },
      { en: 'Freezing', kn: 'ಘನೀಕರಣ', hi: 'हिमांक' },
      { en: 'Filtration', kn: 'ಶೋಧನೆ', hi: 'छानना' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Evaporation changes liquid water into water vapour when heated.',
      kn: 'ಶಾಖದಿಂದ ದ್ರವ ನೀರು ಆವಿಯಾಗುವುದನ್ನು ಆವಿಯಾಗುವಿಕೆ ಎನ್ನುತ್ತಾರೆ.',
      hi: 'गर्म होने पर द्रव जल का वाष्प में बदलना वाष्पीकरण है।',
    },
  },
  {
    id: 'aq-sci-wat-e2',
    topicKey: 'water_cycle',
    difficulty: 'Easy',
    orderIndex: 2,
    prompt: {
      en: 'Collecting rainwater from school roofs into underground recharge pits helps to:',
      kn: 'ಶಾಲೆಯ ಮೇಲ್ಛಾವಣಿಯ ಮಳೆನೀರನ್ನು ಇಂಗುಗುಂಡಿಗಳಿಗೆ ಹರಿಸುವುದರಿಂದ ಏನು ಲಾಭ?',
      hi: 'स्कूल की छत से वर्षा का पानी सोख्ता गड्ढे में एकत्र करने से क्या लाभ होता है?',
    },
    options: [
      { en: 'Recharge groundwater levels', kn: 'ಅಂತರ್ಜಲ ಮಟ್ಟ ಹೆಚ್ಚುತ್ತದೆ', hi: 'भूजल स्तर बढ़ता है' },
      { en: 'Dry up borewells', kn: 'ಬೋರ್‌ವೆಲ್ ಒಣಗುತ್ತದೆ', hi: 'बोरवेल सूख जाता है' },
      { en: 'Increase soil erosion', kn: 'ಮಣ್ಣಿನ ಸವಕಳಿ ಹೆಚ್ಚುತ್ತದೆ', hi: 'मिट्टी का कटाव बढ़ता है' },
      { en: 'Stop cloud formation', kn: 'ಮೋಡ ರಚನೆ ನಿಲ್ಲುತ್ತದೆ', hi: 'बादल बनना रुकता है' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Rooftop rainwater harvesting replenishes aquifers and borewells.',
      kn: 'ಮಳೆನೀರು ಕೊಯ್ಲು ಅಂತರ್ಜಲವನ್ನು ಮರುಪೂರಣಗೊಳಿಸುತ್ತದೆ.',
      hi: 'वर्षा जल संचयन से भूजल और बोरवेल का स्तर बढ़ता है।',
    },
  },
  {
    id: 'aq-sci-wat-m1',
    topicKey: 'water_cycle',
    difficulty: 'Medium',
    orderIndex: 3,
    prompt: {
      en: 'Which process forms clouds when rising water vapour cools high in the sky?',
      kn: 'ಆಕಾಶದಲ್ಲಿ ತಂಪಾದಾಗ ನೀರಿನ ಆವಿ ಮೋಡಗಳಾಗಿ ಬದಲಾಗುವ ಪ್ರಕ್ರಿಯೆ ಯಾವುದು?',
      hi: 'आसमान में ऊपर उठकर ठंडी हुई जल वाष्प से बादल बनने की प्रक्रिया क्या है?',
    },
    options: [
      { en: 'Condensation', kn: 'ಸಾಂದ್ರೀಕರಣ (Condensation)', hi: 'संघनन' },
      { en: 'Transpiration', kn: 'ಬಾಷ್ಪವಿಸರ್ಜನೆ', hi: 'वाष्पोत्सर्जन' },
      { en: 'Runoff', kn: 'ಹರಿವು', hi: 'अपवाह' },
      { en: 'Sieving', kn: 'ಜರಡಿ ಹಿಡಿಯುವುದು', hi: 'चालना' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Condensation turns water vapour back into tiny liquid droplets forming clouds.',
      kn: 'ಸಾಂದ್ರೀಕರಣದಿಂದ ನೀರಿನ ಆವಿ ಸಣ್ಣ ಹನಿಗಳಾಗಿ ಮೋಡವಾಗುತ್ತದೆ.',
      hi: 'संघनन से जल वाष्प पानी की छोटी बूंदों और बादलों में बदल जाती है।',
    },
  },
  {
    id: 'aq-sci-wat-m2',
    topicKey: 'water_cycle',
    difficulty: 'Medium',
    orderIndex: 4,
    prompt: {
      en: 'How do plants release water vapour into the air through their leaves?',
      kn: 'ಸಸ್ಯಗಳು ಎಲೆಗಳ ಮೂಲಕ ಗಾಳಿಗೆ ನೀರಿನ ಆವಿಯನ್ನು ಬಿಡುಗಡೆ ಮಾಡುವ ಪ್ರಕ್ರಿಯೆ ಯಾವುದು?',
      hi: 'पौधे पत्तियों के माध्यम से हवा में जल वाष्प किस प्रक्रिया द्वारा छोड़ते हैं?',
    },
    options: [
      { en: 'Transpiration', kn: 'ಬಾಷ್ಪವಿಸರ್ಜನೆ (Transpiration)', hi: 'वाष्पोत्सर्जन' },
      { en: 'Neutralization', kn: 'ತಟಸ್ಥೀಕರಣ', hi: 'उदासीनीकरण' },
      { en: 'Sedimentation', kn: 'ತಳ ಸೇರುವಿಕೆ', hi: 'अवसादन' },
      { en: 'Conduction', kn: 'ವಾಹಕತೆ', hi: 'चालन' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Transpiration releases water vapour through leaf stomata into the atmosphere.',
      kn: 'ಬಾಷ್ಪವಿಸರ್ಜನೆಯಿಂದ ಎಲೆಗಳ ಮೂಲಕ ನೀರಿನ ಆವಿ ಗಾಳಿಗೆ ಸೇರುತ್ತದೆ.',
      hi: 'वाष्पोत्सर्जन में पत्तियों के रंध्रों से जल वाष्प बाहर निकलती है।',
    },
  },
  {
    id: 'aq-sci-wat-h1',
    topicKey: 'water_cycle',
    difficulty: 'Hard',
    orderIndex: 5,
    prompt: {
      en: 'Why does drip irrigation save up to 50% more water than open flood irrigation in dry rural farms?',
      kn: 'ಒಣ ಪ್ರದೇಶದ ಹೊಲಗಳಲ್ಲಿ ಪ್ರವಾಹ ನೀರಾವರಿಗಿಂತ ಹನಿ ನೀರಾವರಿ 50% ಹೆಚ್ಚು ನೀರನ್ನು ಏಕೆ ಉಳಿಸುತ್ತದೆ?',
      hi: 'सूखे खेतों में बाढ़ सिंचाई की तुलना में ड्रिप सिंचाई 50% अधिक पानी क्यों बचाती है?',
    },
    options: [
      {
        en: 'It minimizes surface evaporation and deep percolation by wetting only the root zone slowly',
        kn: 'ಇದು ಬೇರುಗಳ ಭಾಗಕ್ಕೆ ಮಾತ್ರ ನಿಧಾನವಾಗಿ ನೀರು ನೀಡಿ ಆವಿಯಾಗುವಿಕೆ ಮತ್ತು ವ್ಯರ್ಥ ಹರಿವನ್ನು ತಡೆಯುತ್ತದೆ',
        hi: 'यह केवल जड़ क्षेत्र को धीरे-धीरे भिगोकर वाष्पीकरण और रिसाव से होने वाली बर्बादी रोकती है',
      },
      { en: 'It stops plant transpiration', kn: 'ಇದು ಬಾಷ್ಪವಿಸರ್ಜನೆ ನಿಲ್ಲಿಸುತ್ತದೆ', hi: 'यह वाष्पोत्सर्जन बंद कर देती है' },
      { en: 'It increases runoff speed', kn: 'ಹರಿವಿನ ವೇಗ ಹೆಚ್ಚಿಸುತ್ತದೆ', hi: 'बहाव की गति बढ़ाती है' },
      { en: 'It turns groundwater salty', kn: 'ಅಂತರ್ಜಲ ಉಪ್ಪಾಗಿಸುತ್ತದೆ', hi: 'भूजल खारा बनाती है' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Targeted root-zone delivery prevents open-surface evaporation and runoff waste.',
      kn: 'ಬೇರುಗಳಿಗೆ ನೇರವಾಗಿ ನೀರು ತಲುಪುವುದರಿಂದ ಆವಿಯಾಗುವ ನಷ್ಟ ತಪ್ಪುತ್ತದೆ.',
      hi: 'सीधे जड़ों तक पानी जाने से सतह पर वाष्पीकरण और बहाव की हानि नहीं होती।',
    },
  },
  {
    id: 'aq-sci-wat-h2',
    topicKey: 'water_cycle',
    difficulty: 'Hard',
    orderIndex: 6,
    prompt: {
      en: 'Why do paved concrete streets reduce village groundwater recharge compared to soil check-dams?',
      kn: 'ಮಣ್ಣಿನ ಚೆಕ್-ಡ್ಯಾಮ್‌ಗಳಿಗೆ ಹೋಲಿಸಿದರೆ ಕಾಂಕ್ರೀಟ್ ರಸ್ತೆಗಳು ಅಂತರ್ಜಲ ಮರುಪೂರಣವನ್ನು ಏಕೆ ಕಡಿಮೆ ಮಾಡುತ್ತವೆ?',
      hi: 'मिट्टी के चेक-डैम की तुलना में पक्की कंक्रीट सड़कें भूजल पुनर्भरण को क्यों कम करती हैं?',
    },
    options: [
      {
        en: 'Impermeable concrete blocks rainwater infiltration into underground soil layers',
        kn: 'ಕಾಂಕ್ರೀಟ್ ಮಳೆನೀರು ಮಣ್ಣಿನೊಳಗೆ ಇಂಗುವುದನ್ನು ತಡೆಯುತ್ತದೆ',
        hi: 'कंक्रीट बारिश के पानी को जमीन के अंदर रिसने से रोकती है',
      },
      { en: 'Concrete increases condensation', kn: 'ಕಾಂಕ್ರೀಟ್ ಸಾಂದ್ರೀಕರಣ ಹೆಚ್ಚಿಸುತ್ತದೆ', hi: 'कंक्रीट संघनन बढ़ाती है' },
      { en: 'Check-dams evaporate all water', kn: 'ಚೆಕ್-ಡ್ಯಾಮ್ ನೀರನ್ನು ಆವಿ ಮಾಡುತ್ತದೆ', hi: 'चेक-डैम सारा पानी भाप बना देते हैं' },
      { en: 'Soil cannot absorb rain', kn: 'ಮಣ್ಣು ಮಳೆನೀರನ್ನು ಹೀರುವುದಿಲ್ಲ', hi: 'मिट्टी पानी नहीं सोख सकती' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Porous soil and check-dams slow runoff so water percolates down into aquifers.',
      kn: 'ಮಣ್ಣಿನ ಚೆಕ್-ಡ್ಯಾಮ್ ನೀರಿನ ವೇಗ ತಗ್ಗಿಸಿ ಭೂಮಿಯೊಳಗೆ ಇಂಗಲು ಅವಕಾಶ ನೀಡುತ್ತದೆ.',
      hi: 'चेक-डैम पानी को रोककर जमीन के भीतर रिसने का समय देते हैं।',
    },
  },

  {
    id: 'aq-sci-soil-e1',
    topicKey: 'soil_acids',
    difficulty: 'Easy',
    orderIndex: 1,
    prompt: {
      en: 'How does lemon juice taste, and what type of substance is it?',
      kn: 'ನಿಂಬೆ ರಸದ ರುಚಿ ಹೇಗಿರುತ್ತದೆ ಮತ್ತು ಅದು ಯಾವ ರೀತಿಯ ಪದಾರ್ಥವಾಗಿದೆ?',
      hi: 'नींबू के रस का स्वाद कैसा होता है और यह किस प्रकार का पदार्थ है?',
    },
    options: [
      { en: 'Sour — it is an acid', kn: 'ಹುಳಿ — ಇದು ಆಮ್ಲವಾಗಿದೆ', hi: 'खट्टा — यह एक अम्ल है' },
      { en: 'Bitter — it is a base', kn: 'ಕಹಿ — ಇದು ಪ್ರತ್ಯಾಮ್ಲ', hi: 'कड़वा — यह एक क्षार है' },
      { en: 'Soapy — it is neutral', kn: 'ಸಾಬೂನಿನಂತೆ — ತಟಸ್ಥ', hi: 'साबुन जैसा — उदासीन' },
      { en: 'Salty — it is metal', kn: 'ಉಪ್ಪು — ಲೋಹ', hi: 'नमकीन — धातु' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Acids taste sour (like lemon and tamarind).',
      kn: 'ಆಮ್ಲಗಳು ಹುಳಿ ರುಚಿಯನ್ನು ಹೊಂದಿರುತ್ತವೆ.',
      hi: 'अम्ल स्वाद में खट्टे होते हैं।',
    },
  },
  {
    id: 'aq-sci-soil-e2',
    topicKey: 'soil_acids',
    difficulty: 'Easy',
    orderIndex: 2,
    prompt: {
      en: 'What colour does red litmus paper turn when dipped in soap solution (a base)?',
      kn: 'ಸಾಬೂನು ದ್ರಾವಣದಲ್ಲಿ (ಪ್ರತ್ಯಾಮ್ಲ) ಅದ್ದಿದಾಗ ಕೆಂಪು ಲಿಟ್ಮಸ್ ಕಾಗದ ಯಾವ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುತ್ತದೆ?',
      hi: 'साबुन के घोल (क्षार) में डुबोने पर लाल लिटमस पेपर किस रंग का हो जाता है?',
    },
    options: [
      { en: 'Blue', kn: 'ನೀಲಿ', hi: 'नीला' },
      { en: 'Stays red', kn: 'ಕೆಂಪಾಗಿಯೇ ಇರುತ್ತದೆ', hi: 'लाल रहता है' },
      { en: 'Yellow', kn: 'ಹಳದಿ', hi: 'पीला' },
      { en: 'Black', kn: 'ಕಪ್ಪು', hi: 'काला' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Bases turn red litmus paper blue.',
      kn: 'ಪ್ರತ್ಯಾಮ್ಲಗಳು ಕೆಂಪು ಲಿಟ್ಮಸ್ ಅನ್ನು ನೀಲಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗಿಸುತ್ತವೆ.',
      hi: 'क्षार लाल लिटमस को नीला कर देते हैं।',
    },
  },
  {
    id: 'aq-sci-soil-m1',
    topicKey: 'soil_acids',
    difficulty: 'Medium',
    orderIndex: 3,
    prompt: {
      en: 'What happens when yellow turmeric paste is mixed with a basic soap solution?',
      kn: 'ಹಳದಿ ಅರಿಶಿನ ಪೇಸ್ಟ್ ಅನ್ನು ಪ್ರತ್ಯಾಮ್ಲೀಯ ಸಾಬೂನು ದ್ರಾವಣದೊಂದಿಗೆ ಬೆರೆಸಿದಾಗ ಏನಾಗುತ್ತದೆ?',
      hi: 'पीले हल्दी पेस्ट को क्षारीय साबुन के घोल में मिलाने पर क्या होता है?',
    },
    options: [
      { en: 'It turns reddish-brown', kn: 'ಕೆಂಪು-ಕಂದು ಬಣ್ಣಕ್ಕೆ ತಿರುಗುತ್ತದೆ', hi: 'यह लाल-भूरे रंग का हो जाता है' },
      { en: 'It turns bright blue', kn: 'ನೀಲಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುತ್ತದೆ', hi: 'नीला हो जाता है' },
      { en: 'It becomes colourless', kn: 'ಬಣ್ಣರಹಿತವಾಗುತ್ತದೆ', hi: 'रंगहीन हो जाता है' },
      { en: 'It freezes', kn: 'ಘನವಾಗುತ್ತದೆ', hi: 'जम जाता है' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Turmeric is a natural indicator that stays yellow in acid/neutral solutions and turns reddish-brown in bases.',
      kn: 'ಅರಿಶಿನ ನೈಸರ್ಗಿಕ ಸೂಚಕವಾಗಿದ್ದು ಪ್ರತ್ಯಾಮ್ಲದಲ್ಲಿ ಕೆಂಪು-ಕಂದು ಬಣ್ಣಕ್ಕೆ ತಿರುಗುತ್ತದೆ.',
      hi: 'हल्दी एक प्राकृतिक सूचक है जो क्षार में लाल-भूरे रंग का हो जाता है।',
    },
  },
  {
    id: 'aq-sci-soil-m2',
    topicKey: 'soil_acids',
    difficulty: 'Medium',
    orderIndex: 4,
    prompt: {
      en: 'When an acid reacts with a base in the right amount, what is formed?',
      kn: 'ಆಮ್ಲ ಮತ್ತು ಪ್ರತ್ಯಾಮ್ಲ ಸರಿಯಾದ ಪ್ರಮಾಣದಲ್ಲಿ ವರ್ತಿಸಿದಾಗ ಏನು ಉಂಟಾಗುತ್ತದೆ?',
      hi: 'जब अम्ल और क्षार सही मात्रा में अभिक्रिया करते हैं, तो क्या बनता है?',
    },
    options: [
      { en: 'Salt and water (Neutralization)', kn: 'ಲವಣ ಮತ್ತು ನೀರು (ತಟಸ್ಥೀಕರಣ)', hi: 'लवण और जल (उदासीनीकरण)' },
      { en: 'Pure oxygen only', kn: 'ಶುದ್ಧ ಆಮ್ಲಜನಕ ಮಾತ್ರ', hi: 'केवल ऑक्सीजन' },
      { en: 'Only carbon dioxide', kn: 'ಕಾರ್ಬನ್ ಡೈಆಕ್ಸೈಡ್ ಮಾತ್ರ', hi: 'केवल कार्बन डाइऑक्साइड' },
      { en: 'Sugar crystals', kn: 'ಸಕ್ಕರೆ ಹರಳುಗಳು', hi: 'चीनी के क्रिस्टल' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Neutralization between an acid and a base produces salt and water.',
      kn: 'ತಟಸ್ಥೀಕರಣ ಕ್ರಿಯೆಯಲ್ಲಿ ಲವಣ ಮತ್ತು ನೀರು ಉತ್ಪತ್ತಿಯಾಗುತ್ತವೆ.',
      hi: 'उदासीनीकरण अभिक्रिया में लवण और जल बनते हैं।',
    },
  },
  {
    id: 'aq-sci-soil-h1',
    topicKey: 'soil_acids',
    difficulty: 'Hard',
    orderIndex: 5,
    prompt: {
      en: 'If farm soil has become overly acidic (pH 4.8) after heavy chemical fertilizer use, what should the farmer mix into the soil?',
      kn: 'ರಾಸಾಯನಿಕ ಗೊಬ್ಬರದಿಂದ ಮಣ್ಣು ಹೆಚ್ಚು ಆಮ್ಲೀಯವಾದಾಗ (pH 4.8) ರೈತರು ಮಣ್ಣಿಗೆ ಏನನ್ನು ಸೇರಿಸಬೇಕು?',
      hi: 'यदि रासायनिक खाद से खेत की मिट्टी बहुत अम्लीय (pH 4.8) हो जाए, तो किसान को मिट्टी में क्या मिलाना चाहिए?',
    },
    options: [
      {
        en: 'Quicklime or slaked lime (a base) to neutralize excess acidity',
        kn: 'ಹೆಚ್ಚುವರಿ ಆಮ್ಲೀಯತೆಯನ್ನು ತಟಸ್ಥಗೊಳಿಸಲು ಸುಣ್ಣ (ಪ್ರತ್ಯಾಮ್ಲ)',
        hi: 'अतिरिक्त अम्लता को उदासीन करने के लिए बुझा हुआ चूना (क्षार)',
      },
      { en: 'Vinegar', kn: 'ವಿನೆಗರ್', hi: 'सिरका' },
      { en: 'Lemon juice', kn: 'ನಿಂಬೆ ರಸ', hi: 'नींबू का रस' },
      { en: 'Hydrochloric acid', kn: 'ಹೈಡ್ರೋಕ್ಲೋರಿಕ್ ಆಮ್ಲ', hi: 'हाइड्रोक्लोरिक अम्ल' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Slaked lime (calcium hydroxide) is a base that neutralizes acidic soil toward healthy crop pH.',
      kn: 'ಸುಣ್ಣವು ಪ್ರತ್ಯಾಮ್ಲವಾಗಿದ್ದು ಮಣ್ಣಿನ ಆಮ್ಲೀಯತೆಯನ್ನು ಸಮತೋಲನಗೊಳಿಸುತ್ತದೆ.',
      hi: 'चूना एक क्षार है जो अम्लीय मिट्टी को उदासीन कर फसल के लिए उपयुक्त बनाता है।',
    },
  },
  {
    id: 'aq-sci-soil-h2',
    topicKey: 'soil_acids',
    difficulty: 'Hard',
    orderIndex: 6,
    prompt: {
      en: 'Conversely, if soil is too basic (alkaline), why does adding decaying organic compost help?',
      kn: 'ಮಣ್ಣು ಹೆಚ್ಚು ಪ್ರತ್ಯಾಮ್ಲೀಯವಾಗಿದ್ದರೆ ಸಾವಯವ ಗೊಬ್ಬರ ಸೇರಿಸುವುದರಿಂದ ಏಕೆ ಸಹಾಯವಾಗುತ್ತದೆ?',
      hi: 'यदि मिट्टी बहुत क्षारीय हो, तो उसमें जैविक खाद (कंपोस्ट) मिलाने से कैसे मदद मिलती है?',
    },
    options: [
      {
        en: 'Organic matter releases mild organic acids that neutralize excess soil alkalinity',
        kn: 'ಸಾವಯವ ಗೊಬ್ಬರವು ಸೌಮ್ಯ ಆಮ್ಲಗಳನ್ನು ಬಿಡುಗಡೆ ಮಾಡಿ ಹೆಚ್ಚುವರಿ ಪ್ರತ್ಯಾಮ್ಲೀಯತೆಯನ್ನು ತಟಸ್ಥಗೊಳಿಸುತ್ತದೆ',
        hi: 'जैविक खाद हल्के अम्ल छोड़ती है जो अतिरिक्त क्षारीयता को उदासीन करते हैं',
      },
      { en: 'Compost turns soil into plastic', kn: 'ಗೊಬ್ಬರ ಮಣ್ಣನ್ನು ಪ್ಲಾಸ್ಟಿಕ್ ಮಾಡುತ್ತದೆ', hi: 'खाद मिट्टी को प्लास्टिक बनाती है' },
      { en: 'Compost removes all water', kn: 'ಗೊಬ್ಬರ ನೀರನ್ನು ತೆಗೆಯುತ್ತದೆ', hi: 'खाद सारा पानी हटा देती है' },
      { en: 'Compost raises pH to 14', kn: 'pH ಅನ್ನು 14ಕ್ಕೆ ಏರಿಸುತ್ತದೆ', hi: 'pH को 14 तक बढ़ाती है' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Compost releases weak organic acids that bring alkaline soil pH down into the neutral crop range.',
      kn: 'ಕಾಂಪೋಸ್ಟ್ ಬಿಡುಗಡೆ ಮಾಡುವ ಸಾವಯವ ಆಮ್ಲಗಳು ಪ್ರತ್ಯಾಮ್ಲೀಯ ಮಣ್ಣನ್ನು ತಟಸ್ಥಗೊಳಿಸುತ್ತವೆ.',
      hi: 'कंपोस्ट में मौजूद कार्बनिक अम्ल क्षारीय मिट्टी के pH को संतुलित करते हैं।',
    },
  },
];

export const ADAPTIVE_QUESTION_BANK: StoredQuizQuestion[] = RAW_BANK.map(buildQuestion);
