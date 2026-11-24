import { LanguageCode, StudentRosterRecord, UserProfile, UserRole } from '../../types/domain';
import { storageService } from '../storage/storageService';
import {
  DEMO_STUDENT_PROFILE,
  DEMO_TEACHER_PROFILE,
  SAMPLE_STUDENT_ROSTER,
} from './sampleProfiles';

const PREF_ROLE_KEY = 'active_role';
const PREF_LANG_KEY = 'preferred_language';

export interface CreateStudentInput {
  name: string;
  grade: number;
  preferredLanguage: LanguageCode;
}

class RoleService {
  getProfileForRole(role: UserRole, language: LanguageCode): UserProfile {
    const base = role === 'student' ? DEMO_STUDENT_PROFILE : DEMO_TEACHER_PROFILE;
    return {
      ...base,
      preferredLanguage: language,
    };
  }

  async getSavedPreferences(): Promise<{ role: UserRole; language: LanguageCode }> {
    const adapter = await storageService.getAdapter();
    const role = (await adapter.get<UserRole>('preferences', PREF_ROLE_KEY)) ?? 'student';
    const language = (await adapter.get<LanguageCode>('preferences', PREF_LANG_KEY)) ?? 'en';
    return { role, language };
  }

  async saveRolePreference(role: UserRole): Promise<void> {
    const adapter = await storageService.getAdapter();
    await adapter.put('preferences', PREF_ROLE_KEY, role);
  }

  async saveLanguagePreference(language: LanguageCode): Promise<void> {
    const adapter = await storageService.getAdapter();
    await adapter.put('preferences', PREF_LANG_KEY, language);
  }

  async getAllStudents(): Promise<StudentRosterRecord[]> {
    const adapter = await storageService.getAdapter();
    const localStudents = await adapter.getAll<StudentRosterRecord>('students');
    return [...SAMPLE_STUDENT_ROSTER, ...localStudents];
  }

  async addLocalStudent(input: CreateStudentInput): Promise<StudentRosterRecord> {
    const adapter = await storageService.getAdapter();
    const record: StudentRosterRecord = {
      id: `student-local-${Date.now()}`,
      name: input.name.trim(),
      grade: input.grade,
      preferredLanguage: input.preferredLanguage,
      lessonsCompleted: 0,
      averageScore: 0,
      weakTopics: [],
      lastActiveAt: new Date().toISOString(),
      origin: 'local',
    };
    await adapter.put('students', record.id, record);
    return record;
  }

  async deleteLocalStudent(studentId: string): Promise<void> {
    const adapter = await storageService.getAdapter();
    await adapter.delete('students', studentId);
  }
}

export const roleService = new RoleService();
