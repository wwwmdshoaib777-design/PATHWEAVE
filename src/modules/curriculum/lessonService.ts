import { DownloadedMaterialRecord, Lesson, Subject, SubjectId } from '../../types/domain';
import { storageService } from '../storage/storageService';
import { SAMPLE_LESSONS, SAMPLE_SUBJECTS } from './sampleCurriculum';

export interface CreateLocalLessonInput {
  subjectId: SubjectId;
  grade: number;
  topicEn: string;
  titleEn: string;
  summaryEn: string;
  bodyEn: string;
  estimatedMinutes: number;
}

class LessonService {
  async getSubjects(): Promise<Subject[]> {
    const allLessons = await this.getAllLessons();
    return SAMPLE_SUBJECTS.map((subject) => ({
      ...subject,
      lessonCount: allLessons.filter((l) => l.subjectId === subject.id).length,
    }));
  }

  async getAllLessons(): Promise<Lesson[]> {
    const adapter = await storageService.getAdapter();
    const localLessons = await adapter.getAll<Lesson>('materials');
    return [...SAMPLE_LESSONS, ...localLessons];
  }

  async getLessonById(lessonId: string): Promise<Lesson | undefined> {
    const lessons = await this.getAllLessons();
    return lessons.find((l) => l.id === lessonId);
  }

  async createLocalLesson(input: CreateLocalLessonInput): Promise<Lesson> {
    const adapter = await storageService.getAdapter();
    const now = new Date().toISOString();
    const id = `local-${input.subjectId}-${Date.now()}`;

    const newLesson: Lesson = {
      id,
      subjectId: input.subjectId,
      grade: input.grade,
      topic: {
        en: input.topicEn.trim(),
        kn: input.topicEn.trim(),
        hi: input.topicEn.trim(),
      },
      title: {
        en: input.titleEn.trim(),
        kn: input.titleEn.trim(),
        hi: input.titleEn.trim(),
      },
      summary: {
        en: input.summaryEn.trim(),
        kn: input.summaryEn.trim(),
        hi: input.summaryEn.trim(),
      },
      estimatedMinutes: Math.max(5, input.estimatedMinutes),
      sizeKB: Math.max(24, Math.round((input.bodyEn.length + input.summaryEn.length) / 8)),
      origin: 'local',
      createdAt: now,
      sections: [
        {
          heading: {
            en: 'Classroom Lesson Content',
            kn: 'ತರಗತಿ ಪಾಠದ ವಿಷಯ',
            hi: 'कक्षा पाठ सामग्री',
          },
          body: {
            en: input.bodyEn.trim(),
            kn: input.bodyEn.trim(),
            hi: input.bodyEn.trim(),
          },
        },
      ],
    };

    await adapter.put('materials', newLesson.id, newLesson);
    return newLesson;
  }

  async deleteLocalLesson(lessonId: string): Promise<void> {
    const adapter = await storageService.getAdapter();
    await adapter.delete('materials', lessonId);
  }

  async getDownloadedMaterials(): Promise<DownloadedMaterialRecord[]> {
    const adapter = await storageService.getAdapter();
    return adapter.getAll<DownloadedMaterialRecord>('downloads');
  }

  async saveLessonOffline(lesson: Lesson): Promise<DownloadedMaterialRecord> {
    const adapter = await storageService.getAdapter();
    const record: DownloadedMaterialRecord = {
      lessonId: lesson.id,
      downloadedAt: new Date().toISOString(),
      sizeKB: lesson.sizeKB,
      packetVersion: '1.0.0',
    };
    await adapter.put('downloads', lesson.id, record);
    return record;
  }

  async removeOfflineLesson(lessonId: string): Promise<void> {
    const adapter = await storageService.getAdapter();
    await adapter.delete('downloads', lessonId);
  }
}

export const lessonService = new LessonService();
