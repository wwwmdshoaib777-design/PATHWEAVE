import { Lesson, Subject } from '../../types/domain';

export const SAMPLE_SUBJECTS: Subject[] = [
  {
    id: 'math',
    code: 'MATH-68',
    title: {
      en: 'Mathematics',
      kn: 'ಗಣಿತ',
      hi: 'गणित',
    },
    description: {
      en: 'Fractions, ratios, linear equations, and practical geometry for rural school learners.',
      kn: 'ಭಿನ್ನರಾಶಿಗಳು, ಅನುಪಾತಗಳು, ಸರಳ ಸಮೀಕರಣಗಳು ಮತ್ತು ಪ್ರಾಯೋಗಿಕ ಜ್ಯಾಮಿತಿ.',
      hi: 'भिन्न, अनुपात, रैखिक समीकरण और व्यावहारिक ज्यामिति के मूलभूत पाठ।',
    },
    gradeRange: 'Grades 6–8',
    illustrationUrl: '/src/assets/images/subject_math_illustration_1795547393229.jpg',
    lessonCount: 4,
  },
  {
    id: 'science',
    code: 'SCI-68',
    title: {
      en: 'Science',
      kn: 'ವಿಜ್ಞಾನ',
      hi: 'विज्ञान',
    },
    description: {
      en: 'Plant nutrition, states of matter, simple electric circuits, and water conservation.',
      kn: 'ಸಸ್ಯ ಪೋಷಣೆ, ದ್ರವ್ಯದ ಸ್ಥಿತಿಗಳು, ಸರಳ ವಿದ್ಯುತ್ ಸರ್ಕ್ಯೂಟ್‌ಗಳು ಮತ್ತು ನೀರಿನ ಸಂರಕ್ಷಣೆ.',
      hi: 'पौधों में पोषण, पदार्थ की अवस्थाएँ, सरल विद्युत परिपथ और जल संरक्षण।',
    },
    gradeRange: 'Grades 6–8',
    illustrationUrl: '/src/assets/images/subject_science_illustration_1795547394183.jpg',
    lessonCount: 4,
  },
];

export const SAMPLE_LESSONS: Lesson[] = [
  {
    id: 'math-fractions-01',
    subjectId: 'math',
    grade: 6,
    topic: {
      en: 'Fractions & Decimals',
      kn: 'ಭಿನ್ನರಾಶಿಗಳು ಮತ್ತು ದಶಮಾಂಶಗಳು',
      hi: 'भिन्न और दशमलव',
    },
    title: {
      en: 'Understanding Equivalent Fractions in Daily Measurement',
      kn: 'ದೈನಂದಿನ ಅಳತೆಯಲ್ಲಿ ಸಮಾನ ಭಿನ್ನರಾಶಿಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದು',
      hi: 'दैनिक मापन में समतुल्य भिन्नों को समझना',
    },
    summary: {
      en: 'Learn how equal parts of a whole stay equivalent when sharing grain, land plots, or water containers.',
      kn: 'ಧಾನ್ಯ, ಭೂಮಿ ಅಥವಾ ನೀರನ್ನು ಹಂಚುವಾಗ ಸಮಾನ ಭಾಗಗಳು ಹೇಗೆ ಸಮಾನ ಭಿನ್ನರಾಶಿಗಳಾಗಿರುತ್ತವೆ ಎಂಬುದನ್ನು ಕಲಿಯಿರಿ.',
      hi: 'जानें कि अनाज, खेत के हिस्से या पानी बाँटते समय समान भाग कैसे समतुल्य रहते हैं।',
    },
    estimatedMinutes: 15,
    sizeKB: 142,
    origin: 'sample',
    createdAt: '2026-01-10T09:00:00.000Z',
    sections: [
      {
        heading: {
          en: '1. What Makes Two Fractions Equivalent?',
          kn: '1. ಎರಡು ಭಿನ್ನರಾಶಿಗಳು ಸಮಾನವಾಗುವುದು ಹೇಗೆ?',
          hi: '1. दो भिन्न समतुल्य कब होते हैं?',
        },
        body: {
          en: 'If a farmer divides a field into 2 equal parts and plants 1 part, that is 1/2. If the same field is divided into 4 equal strips and 2 strips are planted, that is 2/4. The planted area has not changed—both 1/2 and 2/4 represent the exact same portion.',
          kn: 'ಒಬ್ಬ ರೈತ ಹೊಲವನ್ನು 2 ಸಮಾನ ಭಾಗಗಳಾಗಿ ವಿಂಗಡಿಸಿ 1 ಭಾಗದಲ್ಲಿ ಬೆಳೆ ಬೆಳೆದರೆ ಅದು 1/2. ಅದೇ ಹೊಲವನ್ನು 4 ಭಾಗಗಳಾಗಿ ವಿಂಗಡಿಸಿ 2 ಭಾಗಗಳಲ್ಲಿ ಬೆಳೆ ಬೆಳೆದರೆ ಅದು 2/4. ಬೆಳೆದ ಪ್ರದೇಶ ಬದಲಾಗಿಲ್ಲ.',
          hi: 'यदि एक किसान खेत को 2 बराबर भागों में बाँटकर 1 भाग में खेती करता है, तो वह 1/2 है। यदि उसी खेत को 4 भागों में बाँटकर 2 भाग बोए जाएँ, तो वह 2/4 है—दोनों बराबर क्षेत्र हैं।',
        },
        keyTakeaway: {
          en: 'Multiplying or dividing both numerator and denominator by the same non-zero number keeps the value unchanged.',
          kn: 'ಅಂಶ ಮತ್ತು ಛೇದವನ್ನು ಒಂದೇ ಶೂನ್ಯೇತರ ಸಂಖ್ಯೆಯಿಂದ ಗುಣಿಸಿದರೆ ಅಥವಾ ಭಾಗಿಸಿದರೆ ಮೌಲ್ಯ ಬದಲಾಗುವುದಿಲ್ಲ.',
          hi: 'अंश और हर दोनों को एक ही शून्येतर संख्या से गुणा या भाग करने पर भिन्न का मान नहीं बदलता।',
        },
      },
      {
        heading: {
          en: '2. Simplifying Fractions for Fast Calculation',
          kn: '2. ವೇಗದ ಲೆಕ್ಕಾಚಾರಕ್ಕಾಗಿ ಭಿನ್ನರಾಶಿಗಳನ್ನು ಸರಳಗೊಳಿಸುವುದು',
          hi: '2. सरल गणना के लिए भिन्नों को छोटा रूप देना',
        },
        body: {
          en: 'Divide both top and bottom numbers by their Highest Common Factor (HCF). For example, 6/8 divided by 2 becomes 3/4. Working with smaller denominators makes addition and comparison much faster without a calculator.',
          kn: 'ಅಂಶ ಮತ್ತು ಛೇದವನ್ನು ಅವುಗಳ ಮ.ಸಾ.ಅ (HCF) ನಿಂದ ಭಾಗಿಸಿ. ಉದಾಹರಣೆಗೆ, 6/8 ಅನ್ನು 2 ರಿಂದ ಭಾಗಿಸಿದರೆ 3/4 ಆಗುತ್ತದೆ.',
          hi: 'अंश और हर को उनके महत्तम समापवर्तक (HCF) से भाग दें। उदाहरण के लिए, 6/8 को 2 से भाग देने पर 3/4 मिलता है।',
        },
      },
    ],
  },
  {
    id: 'math-ratios-02',
    subjectId: 'math',
    grade: 7,
    topic: {
      en: 'Ratios & Proportions',
      kn: 'ಅನುಪಾತ ಮತ್ತು ಸಮಾನುಪಾತ',
      hi: 'अनुपात और समानुपात',
    },
    title: {
      en: 'Ratios in Seed Mixing and Map Scales',
      kn: 'ಬೀಜ ಮಿಶ್ರಣ ಮತ್ತು ನಕ್ಷೆ ಮಾಪಕಗಳಲ್ಲಿ ಅನುಪಾತಗಳು',
      hi: 'बीज मिश्रण और मानचित्र पैमाने में अनुपात',
    },
    summary: {
      en: 'Compare two quantities using ratios and scale recipes, fertilizers, and village distances accurately.',
      kn: 'ಅನುಪಾತಗಳನ್ನು ಬಳಸಿ ಎರಡು ಪ್ರಮಾಣಗಳನ್ನು ಹೋಲಿಸಿ ಮತ್ತು ಗೊಬ್ಬರ, ದೂರವನ್ನು ನಿಖರವಾಗಿ ಲೆಕ್ಕಹಾಕಿ.',
      hi: 'अनुपात का उपयोग करके दो मात्राओं की तुलना करें और दूरी या मिश्रण की सटीक गणना सीखें।',
    },
    estimatedMinutes: 18,
    sizeKB: 168,
    origin: 'sample',
    createdAt: '2026-01-12T09:00:00.000Z',
    sections: [
      {
        heading: {
          en: '1. Writing and Reading a Ratio',
          kn: '1. ಅನುಪಾತವನ್ನು ಬರೆಯುವುದು ಮತ್ತು ಓದುವುದು',
          hi: '1. अनुपात को लिखना और पढ़ना',
        },
        body: {
          en: 'A ratio compares two quantities with the same unit. If you mix 2 buckets of compost with 5 buckets of soil, the ratio of compost to soil is 2:5. Order matters: 2:5 is not the same as 5:2.',
          kn: 'ಒಂದೇ ಘಟಕದ ಎರಡು ಪ್ರಮಾಣಗಳನ್ನು ಅನುಪಾತವು ಹೋಲಿಸುತ್ತದೆ. 2 ಬಕೆಟ್ ಗೊಬ್ಬರವನ್ನು 5 ಬಕೆಟ್ ಮಣ್ಣಿನೊಂದಿಗೆ ಬೆರೆಸಿದರೆ ಅನುಪಾತ 2:5 ಆಗುತ್ತದೆ.',
          hi: 'अनुपात समान इकाई वाली दो मात्राओं की तुलना करता है। यदि 2 बाल्टी खाद में 5 बाल्टी मिट्टी मिलाई जाए, तो अनुपात 2:5 होगा।',
        },
        keyTakeaway: {
          en: 'Always convert both quantities to the same unit before writing a ratio (e.g., cm to cm, grams to grams).',
          kn: 'ಅನುಪಾತ ಬರೆಯುವ ಮೊದಲು ಎರಡೂ ಪ್ರಮಾಣಗಳನ್ನು ಒಂದೇ ಘಟಕಕ್ಕೆ ಪರಿವರ್ತಿಸಿ.',
          hi: 'अनुपात लिखने से पहले दोनों मात्राओं को एक ही इकाई में बदलें।',
        },
      },
      {
        heading: {
          en: '2. Direct Proportion & Scaling Up',
          kn: '2. ನೇರ ಸಮಾನುಪಾತ ಮತ್ತು ಪ್ರಮಾಣ ಹೆಚ್ಚಿಸುವುದು',
          hi: '2. प्रत्यक्ष समानुपात और मात्रा बढ़ाना',
        },
        body: {
          en: 'If 3 notebooks cost ₹90, then 1 notebook costs ₹30, and 7 notebooks cost 7 × ₹30 = ₹210. Finding the value for 1 unit first (unitary method) solves most rural market and farm proportion problems.',
          kn: '3 ನೋಟ್‌ಬುಕ್‌ಗಳ ಬೆಲೆ ₹90 ಆದರೆ, 1 ನೋಟ್‌ಬುಕ್‌ಗೆ ₹30. ಆದ್ದರಿಂದ 7 ನೋಟ್‌ಬುಕ್‌ಗಳ ಬೆಲೆ ₹210.',
          hi: 'यदि 3 कॉपियों की कीमत ₹90 है, तो 1 कॉपी ₹30 की होगी और 7 कॉपियाँ ₹210 की होंगी।',
        },
      },
    ],
  },
  {
    id: 'math-geometry-03',
    subjectId: 'math',
    grade: 7,
    topic: {
      en: 'Area & Perimeter',
      kn: 'ವಿಸ್ತೀರ್ಣ ಮತ್ತು ಸುತ್ತಳತೆ',
      hi: 'क्षेत्रफल और परिमाप',
    },
    title: {
      en: 'Fencing & Land Area: Perimeter vs Area',
      kn: 'ಬೇಲಿ ಮತ್ತು ಭೂಮಿ ವಿಸ್ತೀರ್ಣ: ಸುತ್ತಳತೆ ಮತ್ತು ವಿಸ್ತೀರ್ಣ',
      hi: 'बाड़ और भूमि क्षेत्र: परिमाप बनाम क्षेत्रफल',
    },
    summary: {
      en: 'Distinguish between boundary length (perimeter) and surface coverage (area) for rectangles and triangles.',
      kn: 'ಆಯತ ಮತ್ತು ತ್ರಿಕೋನಗಳ ಸುತ್ತಳತೆ (ಬೇಲಿ ಉದ್ದ) ಮತ್ತು ವಿಸ್ತೀರ್ಣದ ನಡುವಿನ ವ್ಯತ್ಯಾಸವನ್ನು ತಿಳಿಯಿರಿ.',
      hi: 'आयत और त्रिभुज के लिए बाहरी लंबाई (परिमाप) और अंदर की सतह (क्षेत्रफल) के अंतर को समझें।',
    },
    estimatedMinutes: 20,
    sizeKB: 194,
    origin: 'sample',
    createdAt: '2026-01-14T09:00:00.000Z',
    sections: [
      {
        heading: {
          en: '1. Perimeter Measures the Boundary',
          kn: '1. ಸುತ್ತಳತೆ ಗಡಿಯನ್ನು ಅಳೆಯುತ್ತದೆ',
          hi: '1. परिमाप बाहरी सीमा को मापता है',
        },
        body: {
          en: 'To build a fence around a rectangular school garden of length 18 m and width 12 m, you add all four sides: 2 × (18 + 12) = 60 m. Perimeter is always measured in linear units like m or cm.',
          kn: '18 ಮೀ ಉದ್ದ ಮತ್ತು 12 ಮೀ ಅಗಲದ ಆಯತಾಕಾರದ ತೋಟಕ್ಕೆ ಬೇಲಿ ಹಾಕಲು ನಾಲ್ಕು ಬದಿಗಳನ್ನು ಕೂಡಿಸಿ: 2 × (18 + 12) = 60 ಮೀ.',
          hi: '18 मीटर लंबे और 12 मीटर चौड़े आयताकार बगीचे में बाड़ लगाने के लिए चारों भुजाएँ जोड़ें: 2 × (18 + 12) = 60 मीटर।',
        },
      },
      {
        heading: {
          en: '2. Area Measures the Surface Inside',
          kn: '2. ವಿಸ್ತೀರ್ಣ ಒಳಗಿನ ಮೇಲ್ಮೈಯನ್ನು ಅಳೆಯುತ್ತದೆ',
          hi: '2. क्षेत्रफल अंदर की सतह को मापता है',
        },
        body: {
          en: 'To find how many square tiles or seeds fit inside that 18 m × 12 m garden, multiply length by width: 18 × 12 = 216 sq m. For a triangle, Area = (1/2) × base × height.',
          kn: 'ಒಳಗಿನ ಜಾಗವನ್ನು ಕಂಡುಹಿಡಿಯಲು ಉದ್ದ ಮತ್ತು ಅಗಲವನ್ನು ಗುಣಿಸಿ: 18 × 12 = 216 ಚ.ಮೀ. ತ್ರಿಕೋನದ ವಿಸ್ತೀರ್ಣ = (1/2) × ಪಾದ × ಎತ್ತರ.',
          hi: 'बगीचे के अंदर की जगह निकालने के लिए लंबाई × चौड़ाई करें: 18 × 12 = 216 वर्ग मीटर। त्रिभुज के लिए क्षेत्रफल = (1/2) × आधार × ऊँचाई।',
        },
      },
    ],
  },
  {
    id: 'math-algebra-04',
    subjectId: 'math',
    grade: 8,
    topic: {
      en: 'Linear Equations',
      kn: 'ರೇಖೀಯ ಸಮೀಕರಣಗಳು',
      hi: 'रैखिक समीकरण',
    },
    title: {
      en: 'Balancing Simple Linear Equations in One Variable',
      kn: 'ಒಂದು ಚರಾಕ್ಷರದ ಸರಳ ರೇಖೀಯ ಸಮೀಕರಣಗಳನ್ನು ಸಮತೋಲನಗೊಳಿಸುವುದು',
      hi: 'एक चर वाले सरल रैखिक समीकरणों को संतुलित करना',
    },
    summary: {
      en: 'Solve unknown values step by step using the weighing-scale balance principle.',
      kn: 'ತಕ್ಕಡಿ ಸಮತೋಲನ ನಿಯಮವನ್ನು ಬಳಸಿ ಅಜ್ಞಾತ ಮೌಲ್ಯಗಳನ್ನು ಹಂತ ಹಂತವಾಗಿ ಕಂಡುಹಿಡಿಯಿರಿ.',
      hi: 'तराजू के संतुलन सिद्धांत से अज्ञात मान (x) को चरणबद्ध तरीके से हल करना सीखें।',
    },
    estimatedMinutes: 22,
    sizeKB: 175,
    origin: 'sample',
    createdAt: '2026-01-16T09:00:00.000Z',
    sections: [
      {
        heading: {
          en: '1. The Balance Scale Rule',
          kn: '1. ತಕ್ಕಡಿ ಸಮತೋಲನ ನಿಯಮ',
          hi: '1. तराजू का संतुलन नियम',
        },
        body: {
          en: 'An equation like 3x + 5 = 20 works like a two-pan weighing scale. Whatever operation you perform on the left side, you must perform on the right side to keep both sides equal.',
          kn: '3x + 5 = 20 ಎಂಬ ಸಮೀಕರಣವು ತಕ್ಕಡಿಯಂತೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ. ಎಡಭಾಗದಲ್ಲಿ ಮಾಡುವ ಬದಲಾವಣೆಯನ್ನು ಬಲಭಾಗದಲ್ಲೂ ಮಾಡಬೇಕು.',
          hi: 'समीकरण 3x + 5 = 20 एक तराजू की तरह है। बाईं ओर जो भी संक्रिया की जाती है, वही दाईं ओर भी करनी होती है।',
        },
        keyTakeaway: {
          en: 'Subtract 5 from both sides (3x = 15), then divide by 3 to isolate x = 5.',
          kn: 'ಎರಡೂ ಬದಿಗಳಿಂದ 5 ಕಳೆಯಿರಿ (3x = 15), ನಂತರ 3 ರಿಂದ ಭಾಗಿಸಿ x = 5 ಪಡೆಯಿರಿ.',
          hi: 'दोनों पक्षों से 5 घटाएँ (3x = 15), फिर 3 से भाग देकर x = 5 प्राप्त करें।',
        },
      },
    ],
  },
  {
    id: 'sci-photosynthesis-01',
    subjectId: 'science',
    grade: 7,
    topic: {
      en: 'Plant Nutrition',
      kn: 'ಸಸ್ಯಗಳಲ್ಲಿ ಪೋಷಣೆ',
      hi: 'पादपों में पोषण',
    },
    title: {
      en: 'How Green Plants Make Food: Photosynthesis',
      kn: 'ಹಸಿರು ಸಸ್ಯಗಳು ಆಹಾರವನ್ನು ಹೇಗೆ ತಯಾರಿಸುತ್ತವೆ: ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ',
      hi: 'हरे पौधे भोजन कैसे बनाते हैं: प्रकाश संश्लेषण',
    },
    summary: {
      en: 'Understand sunlight, chlorophyll, carbon dioxide, and water working inside leaf cells.',
      kn: 'ಎಲೆಗಳ ಕೋಶಗಳಲ್ಲಿ ಸೂರ್ಯನ ಬೆಳಕು, ಕ್ಲೋರೋಫಿಲ್, ಕಾರ್ಬನ್ ಡೈಆಕ್ಸೈಡ್ ಮತ್ತು ನೀರು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತವೆ ಎಂಬುದನ್ನು ತಿಳಿಯಿರಿ.',
      hi: 'जानें कि पत्तियों में सूर्य के प्रकाश, क्लोरोफिल, कार्बन डाइऑक्साइड और पानी से भोजन कैसे बनता है।',
    },
    estimatedMinutes: 16,
    sizeKB: 188,
    origin: 'sample',
    createdAt: '2026-01-11T09:00:00.000Z',
    sections: [
      {
        heading: {
          en: '1. Inputs and Outputs of Photosynthesis',
          kn: '1. ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆಯ ಅಗತ್ಯಗಳು ಮತ್ತು ಉತ್ಪನ್ನಗಳು',
          hi: '1. प्रकाश संश्लेषण के आवश्यक तत्व और उत्पाद',
        },
        body: {
          en: 'Roots absorb water and minerals from soil and carry them through xylem vessels to leaves. Stomata (tiny pores on the underside of leaves) take in carbon dioxide from air. Using sunlight captured by green chlorophyll, leaves produce glucose and release oxygen.',
          kn: 'ಬೇರುಗಳು ಮಣ್ಣಿನಿಂದ ನೀರು ಮತ್ತು ಖನಿಜಗಳನ್ನು ಹೀರಿಕೊಂಡು ಎಲೆಗಳಿಗೆ ಸಾಗಿಸುತ್ತವೆ. ಪತ್ರರಂಧ್ರಗಳು ಗಾಳಿಯಿಂದ CO2 ಪಡೆಯುತ್ತವೆ. ಕ್ಲೋರೋಫಿಲ್ ಸಹಾಯದಿಂದ ಸಸ್ಯಗಳು ಆಹಾರ (ಗ್ಲೂಕೋಸ್) ಮತ್ತು ಆಮ್ಲಜನಕವನ್ನು ಉತ್ಪಾದಿಸುತ್ತವೆ.',
          hi: 'जड़ें मिट्टी से पानी और खनिज सोखकर पत्तियों तक पहुँचाती हैं। रंध्र (स्टोमेटा) हवा से कार्बन डाइऑक्साइड लेते हैं। क्लोरोफिल और सूर्य के प्रकाश से पत्तियाँ ग्लूकोज बनाती हैं और ऑक्सीजन छोड़ती हैं।',
        },
        keyTakeaway: {
          en: 'Word equation: Carbon Dioxide + Water —(Sunlight & Chlorophyll)→ Glucose + Oxygen.',
          kn: 'ಸಮೀಕರಣ: ಕಾರ್ಬನ್ ಡೈಆಕ್ಸೈಡ್ + ನೀರು → ಗ್ಲೂಕೋಸ್ + ಆಮ್ಲಜನಕ.',
          hi: 'समीकरण: कार्बन डाइऑक्साइड + जल —(सूर्य का प्रकाश व क्लोरोफिल)→ ग्लूकोज + ऑक्सीजन।',
        },
      },
    ],
  },
  {
    id: 'sci-circuits-02',
    subjectId: 'science',
    grade: 6,
    topic: {
      en: 'Electricity & Circuits',
      kn: 'ವಿದ್ಯುತ್ ಮತ್ತು ಸರ್ಕ್ಯೂಟ್‌ಗಳು',
      hi: 'विद्युत तथा परिपथ',
    },
    title: {
      en: 'Closed Circuits, Conductors, and Safe Switches',
      kn: 'ಮುಚ್ಚಿದ ಸರ್ಕ್ಯೂಟ್‌ಗಳು, ವಾಹಕಗಳು ಮತ್ತು ಸುರಕ್ಷಿತ ಸ್ವಿಚ್‌ಗಳು',
      hi: 'बंद परिपथ, सुचालक और सुरक्षित स्विच',
    },
    summary: {
      en: 'Explore why a torch bulb glows only in a complete closed loop and test conductors vs insulators.',
      kn: 'ಸಂಪೂರ್ಣ ಮುಚ್ಚಿದ ಮಾರ್ಗದಲ್ಲಿ ಮಾತ್ರ ಬಲ್ಬ್ ಏಕೆ ಉರಿಯುತ್ತದೆ ಮತ್ತು ವಾಹಕ-ಅವಾಹಕಗಳ ವ್ಯತ್ಯಾಸವನ್ನು ತಿಳಿಯಿರಿ.',
      hi: 'जानें कि बल्ब केवल पूर्ण बंद परिपथ में ही क्यों जलता है और सुचालक व कुचालक में क्या अंतर है।',
    },
    estimatedMinutes: 15,
    sizeKB: 164,
    origin: 'sample',
    createdAt: '2026-01-13T09:00:00.000Z',
    sections: [
      {
        heading: {
          en: '1. Complete Path from Cell to Bulb',
          kn: '1. ಸೆಲ್‌ನಿಂದ ಬಲ್ಬ್‌ವರೆಗೆ ಪೂರ್ಣ ಮಾರ್ಗ',
          hi: '1. सेल से बल्ब तक पूर्ण मार्ग',
        },
        body: {
          en: 'Electric current flows from the positive (+) terminal of a dry cell through the switch and bulb filament back to the negative (-) terminal. If a switch is open or a wire is broken, the circuit is incomplete and the bulb stays off.',
          kn: 'ವಿದ್ಯುತ್ ಪ್ರವಾಹವು ಸೆಲ್‌ನ ಧನ (+) ತುದಿಯಿಂದ ಬಲ್ಬ್ ಮೂಲಕ ಋಣ (-) ತುದಿಗೆ ಹರಿಯುತ್ತದೆ. ಸ್ವಿಚ್ ತೆರೆದಿದ್ದರೆ ಮಾರ್ಗ ಮುರಿಯುತ್ತದೆ.',
          hi: 'विद्युत धारा सेल के धनात्मक (+) सिरे से स्विच और बल्ब से होकर ऋणात्मक (-) सिरे तक बहती है। स्विच खुला होने पर परिपथ टूट जाता है।',
        },
      },
      {
        heading: {
          en: '2. Conductors vs Insulators',
          kn: '2. ವಿದ್ಯುತ್ ವಾಹಕಗಳು ಮತ್ತು ಅವಾಹಕಗಳು',
          hi: '2. विद्युत सुचालक बनाम कुचालक',
        },
        body: {
          en: 'Metals such as copper, aluminium, and iron allow electric current to pass easily (conductors). Plastic, dry wood, and rubber block electric current (insulators) and protect our hands on wire coatings and switch covers.',
          kn: 'ತಾಮ್ರ, ಅಲ್ಯೂಮಿನಿಯಂ ಮತ್ತು ಕಬ್ಬಿಣ ವಿದ್ಯುತ್ ವಾಹಕಗಳು. ಪ್ಲಾಸ್ಟಿಕ್, ಒಣ ಮರ ಮತ್ತು ರಬ್ಬರ್ ಅವಾಹಕಗಳಾಗಿ ಸುರಕ್ಷತೆ ನೀಡುತ್ತವೆ.',
          hi: 'तांबा, एल्युमीनियम और लोहा सुचालक हैं। प्लास्टिक, सूखी लकड़ी और रबर कुचालक हैं जो हमें बिजली के झटके से बचाते हैं।',
        },
      },
    ],
  },
  {
    id: 'sci-water-03',
    subjectId: 'science',
    grade: 7,
    topic: {
      en: 'Water Conservation',
      kn: 'ನೀರಿನ ಸಂರಕ್ಷಣೆ',
      hi: 'जल संरक्षण',
    },
    title: {
      en: 'The Water Cycle, Groundwater Recharge, and Drip Irrigation',
      kn: 'ಜಲಚಕ್ರ, ಅಂತರ್ಜಲ ಮರುಪೂರಣ ಮತ್ತು ಹನಿ ನೀರಾವರಿ',
      hi: 'जल चक्र, भूजल पुनर्भरण और ड्रिप सिंचाई',
    },
    summary: {
      en: 'Connect evaporation and condensation with rainwater harvesting and water-saving farm methods.',
      kn: 'ಆವಿಯಾಗುವಿಕೆ ಮತ್ತು ಸಾಂದ್ರೀಕರಣವನ್ನು ಮಳೆನೀರು ಕೊಯ್ಲು ಮತ್ತು ಹನಿ ನೀರಾವರಿಯೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಿ.',
      hi: 'वाष्पीकरण और संघनन को वर्षा जल संचयन और कृषि में पानी बचाने के तरीकों से जोड़कर समझें।',
    },
    estimatedMinutes: 17,
    sizeKB: 152,
    origin: 'sample',
    createdAt: '2026-01-15T09:00:00.000Z',
    sections: [
      {
        heading: {
          en: '1. Evaporation, Condensation, and Precipitation',
          kn: '1. ಆವಿಯಾಗುವಿಕೆ, ಸಾಂದ್ರೀಕರಣ ಮತ್ತು ಮಳೆ',
          hi: '1. वाष्पीकरण, संघनन और वर्षण',
        },
        body: {
          en: 'Solar heat turns surface water from ponds and leaves into water vapour (evaporation & transpiration). High in the cool sky, vapour condenses into tiny droplets forming clouds, returning as rain.',
          kn: 'ಸೂರ್ಯನ ಶಾಖದಿಂದ ನೀರು ಆವಿಯಾಗಿ ಮೇಲಕ್ಕೆ ಏರುತ್ತದೆ. ತಂಪಾದ ಆಕಾಶದಲ್ಲಿ ಮೋಡಗಳಾಗಿ ಸಾಂದ್ರೀಕರಣಗೊಂಡು ಮಳೆಯಾಗಿ ಬೀಳುತ್ತದೆ.',
          hi: 'सूर्य की गर्मी से जल वाष्प बनकर ऊपर उठता है। ऊंचाई पर ठंडा होकर यह बादलों में संघनित होता है और वर्षा के रूप में लौटता है।',
        },
      },
      {
        heading: {
          en: '2. Saving Water in Rural Villages',
          kn: '2. ಗ್ರಾಮಗಳಲ್ಲಿ ನೀರಿನ ಉಳಿತಾಯ',
          hi: '2. ग्रामीण क्षेत्रों में जल संरक्षण',
        },
        body: {
          en: 'Rooftop rainwater harvesting directs rain into recharge pits to raise borewell water tables. Drip irrigation delivers drops directly near crop roots, cutting evaporation loss dramatically.',
          kn: 'ಮೇಲ್ಛಾವಣಿ ಮಳೆನೀರು ಕೊಯ್ಲು ಅಂತರ್ಜಲ ಮಟ್ಟವನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ. ಹನಿ ನೀರಾವರಿ ಬೆಳೆಗಳ ಬೇರುಗಳಿಗೆ ನೇರವಾಗಿ ನೀರು ತಲುಪಿಸುತ್ತದೆ.',
          hi: 'छत से वर्षा जल संचयन भूजल स्तर को बढ़ाता है। ड्रिप सिंचाई सीधे पौधों की जड़ों तक बूंद-बूंद पानी पहुँचाकर बर्बादी रोकती है।',
        },
      },
    ],
  },
  {
    id: 'sci-matter-04',
    subjectId: 'science',
    grade: 8,
    topic: {
      en: 'Acids, Bases & Soil pH',
      kn: 'ಆಮ್ಲಗಳು, ಪ್ರತ್ಯಾಮ್ಲಗಳು ಮತ್ತು ಮಣ್ಣಿನ pH',
      hi: 'अम्ल, क्षार और मिट्टी का pH',
    },
    title: {
      en: 'Natural Indicators and Soil Health Testing',
      kn: 'ನೈಸರ್ಗಿಕ ಸೂಚಕಗಳು ಮತ್ತು ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಪರೀಕ್ಷೆ',
      hi: 'प्राकृतिक सूचक और मिट्टी के स्वास्थ्य की जाँच',
    },
    summary: {
      en: 'Identify acids and bases using turmeric or litmus indicators and learn how soil neutralization works.',
      kn: 'ಅರಿಶಿನ ಅಥವಾ ಲಿಟ್ಮಸ್ ಸೂಚಕಗಳಿಂದ ಆಮ್ಲ ಮತ್ತು ಪ್ರತ್ಯಾಮ್ಲಗಳನ್ನು ಗುರುತಿಸಿ ಮಣ್ಣಿನ ತಟಸ್ಥೀಕರಣ ತಿಳಿಯಿರಿ.',
      hi: 'हल्दी या लिटमस सूचक से अम्ल और क्षार की पहचान करें और मिट्टी के उदासीनीकरण को समझें।',
    },
    estimatedMinutes: 19,
    sizeKB: 180,
    origin: 'sample',
    createdAt: '2026-01-17T09:00:00.000Z',
    sections: [
      {
        heading: {
          en: '1. Acids, Bases, and Litmus Tests',
          kn: '1. ಆಮ್ಲಗಳು, ಪ್ರತ್ಯಾಮ್ಲಗಳು ಮತ್ತು ಲಿಟ್ಮಸ್ ಪರೀಕ್ಷೆ',
          hi: '1. अम्ल, क्षार और लिटमस परीक्षण',
        },
        body: {
          en: 'Acids (such as lemon juice or tamarind) turn blue litmus paper red. Bases (such as soap solution or baking soda) feel soapy and turn red litmus paper blue. Turmeric paste turns reddish-brown in a basic solution.',
          kn: 'ಆಮ್ಲಗಳು (ನಿಂಬೆ ರಸ) ನೀಲಿ ಲಿಟ್ಮಸ್ ಅನ್ನು ಕೆಂಪು ಬಣ್ಣಕ್ಕೆ ತಿರುಗಿಸುತ್ತವೆ. ಪ್ರತ್ಯಾಮ್ಲಗಳು (ಸಾಬೂನು ದ್ರಾವಣ) ಕೆಂಪು ಲಿಟ್ಮಸ್ ಅನ್ನು ನೀಲಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗಿಸುತ್ತವೆ.',
          hi: 'अम्ल (नींबू या इमली) नीले लिटमस को लाल कर देते हैं। क्षार (साबुन का घोल) लाल लिटमस को नीला कर देते हैं और हल्दी को भूरा-लाल करते हैं।',
        },
        keyTakeaway: {
          en: 'When soil becomes too acidic from excess fertilizer, farmers add quicklime (a base) to neutralize it.',
          kn: 'ಮಣ್ಣು ಹೆಚ್ಚು ಆಮ್ಲೀಯವಾದಾಗ ರೈತರು ಸುಣ್ಣ (ಪ್ರತ್ಯಾಮ್ಲ) ಸೇರಿಸಿ ಸಮತೋಲನಗೊಳಿಸುತ್ತಾರೆ.',
          hi: 'जब मिट्टी अधिक अम्लीय हो जाती है, तो किसान उसे उदासीन करने के लिए बुझा हुआ चूना (क्षार) मिलाते हैं।',
        },
      },
    ],
  },
];
