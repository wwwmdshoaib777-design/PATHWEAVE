import {
  DownloadedLessonRecord,
  DownloadedMaterialRecord,
  Lesson,
  Subject,
  SubjectId,
} from '../../types/domain';
import { createUniqueId, storageService } from '../storage/storageService';
import { SAMPLE_LESSONS, SAMPLE_SUBJECTS } from './sampleCurriculum';

const LESSON_ASSET_CACHE = 'pathweave-lesson-assets-v1';

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
  async ensureSubjectsSeeded(): Promise<Subject[]> {
    const adapter = await storageService.getAdapter();
    const existing = await adapter.getAll<Subject>('subjects');
    if (existing.length === 0) {
      await Promise.all(SAMPLE_SUBJECTS.map((sub) => adapter.put('subjects', sub.id, sub)));
      return SAMPLE_SUBJECTS;
    }
    return existing;
  }

  async getSubjects(): Promise<Subject[]> {
    const [seededSubjects, allLessons] = await Promise.all([
      this.ensureSubjectsSeeded(),
      this.getAllLessons(),
    ]);
    return seededSubjects.map((subject) => ({
      ...subject,
      lessonCount: allLessons.filter((l) => l.subjectId === subject.id).length,
    }));
  }

  async getAllLessons(): Promise<Lesson[]> {
    const adapter = await storageService.getAdapter();
    const [localLessons, downloadedRecords] = await Promise.all([
      adapter.getAll<Lesson>('materials'),
      adapter.getAll<DownloadedLessonRecord>('downloadedLessons'),
    ]);

    const byId = new Map<string, Lesson>();
    for (const lesson of SAMPLE_LESSONS) {
      byId.set(lesson.id, lesson);
    }
    for (const lesson of localLessons) {
      byId.set(lesson.id, lesson);
    }
    for (const downloaded of downloadedRecords) {
      if (!byId.has(downloaded.id)) {
        byId.set(downloaded.id, downloaded.lesson);
      }
    }

    return Array.from(byId.values());
  }

  async getLessonById(lessonId: string): Promise<Lesson | undefined> {
    const adapter = await storageService.getAdapter();
    const downloaded = await adapter.get<DownloadedLessonRecord>('downloadedLessons', lessonId);
    if (downloaded) {
      return downloaded.lesson;
    }
    const lessons = await this.getAllLessons();
    return lessons.find((l) => l.id === lessonId);
  }

  async getDownloadedLessons(): Promise<DownloadedLessonRecord[]> {
    const adapter = await storageService.getAdapter();
    const records = await adapter.getAll<DownloadedLessonRecord>('downloadedLessons');
    return records.sort(
      (a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime()
    );
  }

  async getDownloadedMaterials(): Promise<DownloadedMaterialRecord[]> {
    const adapter = await storageService.getAdapter();
    const [legacyDownloads, fullDownloads] = await Promise.all([
      adapter.getAll<DownloadedMaterialRecord>('downloads'),
      adapter.getAll<DownloadedLessonRecord>('downloadedLessons'),
    ]);

    const byId = new Map<string, DownloadedMaterialRecord>();
    for (const d of legacyDownloads) {
      byId.set(d.lessonId, d);
    }
    for (const full of fullDownloads) {
      byId.set(full.id, {
        lessonId: full.id,
        downloadedAt: full.downloadedAt,
        sizeKB: full.sizeKB,
        packetVersion: full.packetVersion,
      });
    }
    return Array.from(byId.values());
  }

  private async cacheLessonAssets(subjectId: SubjectId): Promise<string[]> {
    const subject = SAMPLE_SUBJECTS.find((s) => s.id === subjectId);
    const urls = subject?.illustrationUrl ? [subject.illustrationUrl] : [];
    if (urls.length === 0 || typeof window === 'undefined' || !('caches' in window)) {
      return [];
    }

    const cached: string[] = [];
    try {
      const cache = await caches.open(LESSON_ASSET_CACHE);
      for (const url of urls) {
        try {
          const match = await cache.match(url);
          if (!match) {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response.clone());
              cached.push(url);
            }
          } else {
            cached.push(url);
          }
        } catch {
          // Asset may already be in SW precache or offline; continue safely
        }
      }
    } catch {
      // Cache API unavailable in restricted environment
    }
    return cached;
  }

  async saveLessonOffline(lesson: Lesson): Promise<DownloadedLessonRecord> {
    const adapter = await storageService.getAdapter();
    const now = new Date().toISOString();
    const cachedAssetUrls = await this.cacheLessonAssets(lesson.subjectId);

    const fullRecord: DownloadedLessonRecord = {
      id: lesson.id,
      lesson,
      downloadedAt: now,
      sizeKB: lesson.sizeKB,
      packetVersion: '1.0.0',
      cachedAssetUrls,
    };

    const metaRecord: DownloadedMaterialRecord = {
      lessonId: lesson.id,
      downloadedAt: now,
      sizeKB: lesson.sizeKB,
      packetVersion: '1.0.0',
    };

    await Promise.all([
      adapter.put('downloadedLessons', lesson.id, fullRecord),
      adapter.put('downloads', lesson.id, metaRecord),
    ]);

    return fullRecord;
  }

  async removeOfflineLesson(lessonId: string): Promise<void> {
    const adapter = await storageService.getAdapter();
    await Promise.all([
      adapter.delete('downloadedLessons', lessonId),
      adapter.delete('downloads', lessonId),
    ]);
  }

  async createLocalLesson(input: CreateLocalLessonInput): Promise<Lesson> {
    const adapter = await storageService.getAdapter();
    const now = new Date().toISOString();
    const id = createUniqueId(`local-${input.subjectId}`);

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
    // Automatically store teacher-created local lessons in downloadedLessons so students can view offline too
    await this.saveLessonOffline(newLesson);
    return newLesson;
  }

  async deleteLocalLesson(lessonId: string): Promise<void> {
    const adapter = await storageService.getAdapter();
    await Promise.all([
      adapter.delete('materials', lessonId),
      adapter.delete('downloadedLessons', lessonId),
      adapter.delete('downloads', lessonId),
    ]);
  }
}

export const lessonService = new LessonService();
