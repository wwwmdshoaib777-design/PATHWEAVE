import { StudentRosterRecord, UserProfile } from '../../types/domain';

export const DEMO_STUDENT_PROFILE: UserProfile = {
  id: 'student-ananya-01',
  role: 'student',
  name: 'Chinmayi',
  schoolName: 'Government Higher Primary School, Hosakote',
  district: 'Bengaluru Rural',
  gradeOrSubject: 'Grade 7',
  preferredLanguage: 'en',
};

export const DEMO_TEACHER_PROFILE: UserProfile = {
  id: 'teacher-raghav-01',
  role: 'teacher',
  name: 'Raghavendra Kulkarni',
  schoolName: 'Government Higher Primary School, Hosakote',
  district: 'Bengaluru Rural',
  gradeOrSubject: 'Mathematics & Science (Grades 6–8)',
  preferredLanguage: 'en',
};

export const SAMPLE_STUDENT_ROSTER: StudentRosterRecord[] = [
  {
    id: 'student-ananya-01',
    name: 'Chinmayi',
    grade: 7,
    preferredLanguage: 'kn',
    lessonsCompleted: 4,
    averageScore: 82,
    weakTopics: ['Linear Equations'],
    lastActiveAt: '2026-11-23T14:20:00.000Z',
    origin: 'sample',
  },
  {
    id: 'student-karthik-02',
    name: 'Karthik Naik',
    grade: 7,
    preferredLanguage: 'kn',
    lessonsCompleted: 3,
    averageScore: 68,
    weakTopics: ['Area & Perimeter', 'Acids, Bases & Soil pH'],
    lastActiveAt: '2026-11-23T11:05:00.000Z',
    origin: 'sample',
  },
  {
    id: 'student-meena-03',
    name: 'Meena Kumari',
    grade: 6,
    preferredLanguage: 'hi',
    lessonsCompleted: 5,
    averageScore: 88,
    weakTopics: ['Ratios & Proportions'],
    lastActiveAt: '2026-11-22T16:45:00.000Z',
    origin: 'sample',
  },
  {
    id: 'student-suresh-04',
    name: 'Suresh Patil',
    grade: 8,
    preferredLanguage: 'en',
    lessonsCompleted: 2,
    averageScore: 54,
    weakTopics: ['Linear Equations', 'Electricity & Circuits', 'Area & Perimeter'],
    lastActiveAt: '2026-11-21T10:15:00.000Z',
    origin: 'sample',
  },
  {
    id: 'student-kavya-05',
    name: 'Kavya Hegde',
    grade: 8,
    preferredLanguage: 'kn',
    lessonsCompleted: 6,
    averageScore: 91,
    weakTopics: ['Water Conservation'],
    lastActiveAt: '2026-11-24T08:30:00.000Z',
    origin: 'sample',
  },
];
