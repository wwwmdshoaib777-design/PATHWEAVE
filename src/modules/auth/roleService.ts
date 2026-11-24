import { LanguageCode, StudentRosterRecord, UserProfile, UserRole } from '../../types/domain';
import { createUniqueId, storageService } from '../storage/storageService';
import {
  DEMO_STUDENT_PROFILE,
  DEMO_TEACHER_PROFILE,
  SAMPLE_STUDENT_ROSTER,
} from './sampleProfiles';

const PREF_ROLE_KEY = 'active_role';
const PREF_LANG_KEY = 'preferred_language';
const PREF_OFFLINE_TEST_KEY = 'offline_test_mode';

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

  async ensureProfilesSeeded(): Promise<UserProfile> {
    const adapter = await storageService.getAdapter();
    const existing = await adapter.get<UserProfile>('studentProfiles', DEMO_STUDENT_PROFILE.id);
    if (!existing) {
      await adapter.put('studentProfiles', DEMO_STUDENT_PROFILE.id, DEMO_STUDENT_PROFILE);
      return DEMO_STUDENT_PROFILE;
    }
    if (existing.name !== DEMO_STUDENT_PROFILE.name) {
      const updated = { ...existing, name: DEMO_STUDENT_PROFILE.name };
      await adapter.put('studentProfiles', DEMO_STUDENT_PROFILE.id, updated);
      return updated;
    }
    return existing;
  }

  async getStudentProfileFromDb(): Promise<UserProfile> {
    return this.ensureProfilesSeeded();
  }

  async updateStudentPreferredLanguage(language: LanguageCode): Promise<void> {
    const adapter = await storageService.getAdapter();
    const profile = await this.ensureProfilesSeeded();
    await adapter.put('studentProfiles', profile.id, {
      ...profile,
      preferredLanguage: language,
    });
  }

  async getSavedPreferences(): Promise<{
    role: UserRole;
    language: LanguageCode;
    offlineTestMode: boolean;
  }> {
    const adapter = await storageService.getAdapter();
    const role = (await adapter.get<UserRole>('preferences', PREF_ROLE_KEY)) ?? 'student';
    const language = (await adapter.get<LanguageCode>('preferences', PREF_LANG_KEY)) ?? 'en';
    const offlineTestMode =
      (await adapter.get<boolean>('preferences', PREF_OFFLINE_TEST_KEY)) ?? false;
    return { role, language, offlineTestMode };
  }

  async saveRolePreference(role: UserRole): Promise<void> {
    const adapter = await storageService.getAdapter();
    await adapter.put('preferences', PREF_ROLE_KEY, role);
  }

  async saveLanguagePreference(language: LanguageCode): Promise<void> {
    const adapter = await storageService.getAdapter();
    await adapter.put('preferences', PREF_LANG_KEY, language);
    await this.updateStudentPreferredLanguage(language);
  }

  async saveOfflineTestMode(enabled: boolean): Promise<void> {
    const adapter = await storageService.getAdapter();
    await adapter.put('preferences', PREF_OFFLINE_TEST_KEY, enabled);
  }

  async getAllStudents(): Promise<StudentRosterRecord[]> {
    const adapter = await storageService.getAdapter();
    const localStudents = await adapter.getAll<StudentRosterRecord>('students');
    const seen = new Set<string>();
    const combined: StudentRosterRecord[] = [];

    for (const s of [...SAMPLE_STUDENT_ROSTER, ...localStudents]) {
      if (!seen.has(s.id)) {
        seen.add(s.id);
        combined.push(s);
      }
    }
    return combined;
  }

  async addLocalStudent(input: CreateStudentInput): Promise<StudentRosterRecord> {
    const adapter = await storageService.getAdapter();
    const record: StudentRosterRecord = {
      id: createUniqueId('student-local'),
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
