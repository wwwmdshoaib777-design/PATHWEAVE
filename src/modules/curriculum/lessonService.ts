import {
  DownloadedLessonRecord,
  DownloadedMaterialRecord,
  LanguageCode,
  Lesson,
  LessonProgressRecord,
  LocalizedText,
  Subject,
  SubjectId,
} from '../../types/domain';
import { getTopicDefinition } from '../adaptive/adaptiveQuestionBank';
import { createUniqueId, storageService } from '../storage/storageService';
import { SAMPLE_LESSONS, SAMPLE_SUBJECTS } from './sampleCurriculum';

const LESSON_ASSET_CACHE = 'pathweave-lesson-assets-v1';

export interface CreateLocalLessonInput {
  subjectId: SubjectId;
  grade: number;
  topicKey?: string;
  topicText: string;
  title: string;
  description: string;
  content: string;
  language: LanguageCode;
  estimatedMinutes: number;
}

export type UpdateLocalLessonInput = CreateLocalLessonInput;

function buildLocalizedFromSingleLanguage(
  value: string,
  language: LanguageCode,
  existing?: LocalizedText
): LocalizedText {
  const trimmed = value.trim();
  if (!existing) {
    return {
      en: trimmed,
      kn: trimmed,
      hi: trimmed,
    };
  }

  // If the previous record was authored monolingually (all 3 slots identical),
  // keep all slots synchronized so switching UI languages never displays stale text.
  const isMonolingual = existing.en === existing.kn && existing.kn === existing.hi;
  if (isMonolingual) {
    return {
      en: trimmed,
      kn: trimmed,
      hi: trimmed,
    };
  }

  return {
    ...existing,
    [language]: trimmed,
  };
}

function resolveTopicLocalized(
  topicKey: string | undefined,
  topicText: string,
  language: LanguageCode,
  existing?: LocalizedText
): LocalizedText {
  const trimmed = topicText.trim();
  const def = topicKey ? getTopicDefinition(topicKey) : undefined;
  if (def && def.label[language].toLowerCase() === trimmed.toLowerCase()) {
    return def.label;
  }
  return buildLocalizedFromSingleLanguage(trimmed, language, existing);
}

function estimateLessonSizeKB(title: string, description: string, content: string): number {
  const byteEstimate = new TextEncoder().encode(`${title}${description}${content}`).length;
  return Math.max(24, Math.round(byteEstimate / 48) + 20);
}

class LessonService {
  isSampleLessonId(lessonId: string): boolean {
    return SAMPLE_LESSONS.some((l) => l.id === lessonId);
  }

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

    const sampleIds = new Set(SAMPLE_LESSONS.map((l) => l.id));
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

    const all = Array.from(byId.values());
    const createdLocal = all
      .filter((l) => !sampleIds.has(l.id))
      .sort(
        (a, b) =>
          new Date(b.updatedAt ?? b.createdAt).getTime() -
          new Date(a.updatedAt ?? a.createdAt).getTime()
      );
    const coreAndCustomizedSamples = all.filter((l) => sampleIds.has(l.id));

    return [...createdLocal, ...coreAndCustomizedSamples];
  }

  async getLessonById(lessonId: string): Promise<Lesson | undefined> {
    const adapter = await storageService.getAdapter();
    const material = await adapter.get<Lesson>('materials', lessonId);
    if (material) {
      return material;
    }
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

    const topicText = input.topicText.trim() || 'Classroom Topic';
    const titleText = input.title.trim();
    const descriptionText = input.description.trim() || titleText;
    const contentText = input.content.trim();

    const newLesson: Lesson = {
      id,
      subjectId: input.subjectId,
      grade: input.grade,
      topicKey: input.topicKey || undefined,
      topic: resolveTopicLocalized(input.topicKey, topicText, input.language),
      title: buildLocalizedFromSingleLanguage(titleText, input.language),
      summary: buildLocalizedFromSingleLanguage(descriptionText, input.language),
      estimatedMinutes: Math.max(5, Math.min(120, Number(input.estimatedMinutes) || 15)),
      sizeKB: estimateLessonSizeKB(titleText, descriptionText, contentText),
      origin: 'local',
      authoredLanguage: input.language,
      createdAt: now,
      updatedAt: now,
      sections: [
        {
          heading: {
            en: 'Classroom Lesson Content',
            kn: 'ತರಗತಿ ಪಾಠದ ವಿಷಯ',
            hi: 'कक्षा पाठ सामग्री',
          },
          body: buildLocalizedFromSingleLanguage(contentText, input.language),
        },
      ],
    };

    await adapter.put('materials', newLesson.id, newLesson);
    // Cache locally so students can open teacher-created lessons offline immediately
    await this.saveLessonOffline(newLesson);
    return newLesson;
  }

  async updateLocalLesson(lessonId: string, input: UpdateLocalLessonInput): Promise<Lesson> {
    const adapter = await storageService.getAdapter();
    const existing = await this.getLessonById(lessonId);
    if (!existing) {
      throw new Error(`Lesson ${lessonId} could not be found in local storage.`);
    }

    const now = new Date().toISOString();
    const topicText = input.topicText.trim() || 'Classroom Topic';
    const titleText = input.title.trim();
    const descriptionText = input.description.trim() || titleText;
    const contentText = input.content.trim();

    const existingPrimarySection = existing.sections[0];
    const updatedLesson: Lesson = {
      ...existing,
      subjectId: input.subjectId,
      grade: input.grade,
      topicKey: input.topicKey || existing.topicKey,
      topic: resolveTopicLocalized(input.topicKey, topicText, input.language, existing.topic),
      title: buildLocalizedFromSingleLanguage(titleText, input.language, existing.title),
      summary: buildLocalizedFromSingleLanguage(descriptionText, input.language, existing.summary),
      estimatedMinutes: Math.max(5, Math.min(120, Number(input.estimatedMinutes) || 15)),
      sizeKB: estimateLessonSizeKB(titleText, descriptionText, contentText),
      origin: 'local',
      authoredLanguage: input.language,
      createdAt: existing.createdAt,
      updatedAt: now,
      sections: [
        {
          heading: existingPrimarySection?.heading ?? {
            en: 'Classroom Lesson Content',
            kn: 'ತರಗತಿ ಪಾಠದ ವಿಷಯ',
            hi: 'कक्षा पाठ सामग्री',
          },
          body: buildLocalizedFromSingleLanguage(
            contentText,
            input.language,
            existingPrimarySection?.body
          ),
          ...(existingPrimarySection?.keyTakeaway
            ? { keyTakeaway: existingPrimarySection.keyTakeaway }
            : {}),
        },
      ],
    };

    await adapter.put('materials', updatedLesson.id, updatedLesson);

    // Keep offline download stores synchronized so students never read stale cached versions
    const existingDownloaded = await adapter.get<DownloadedLessonRecord>(
      'downloadedLessons',
      updatedLesson.id
    );
    if (existingDownloaded || !this.isSampleLessonId(updatedLesson.id)) {
      await this.saveLessonOffline(updatedLesson);
    }

    return updatedLesson;
  }

  async deleteLocalLesson(lessonId: string): Promise<void> {
    const adapter = await storageService.getAdapter();
    await Promise.all([
      adapter.delete('materials', lessonId),
      adapter.delete('downloadedLessons', lessonId),
      adapter.delete('downloads', lessonId),
    ]);

    // Remove progress entries only for pure teacher-created lessons (preserve sample progress on revert)
    if (!this.isSampleLessonId(lessonId)) {
      const allProgress = await adapter.getAll<LessonProgressRecord>('progress');
      const stale = allProgress.filter((p) => p.lessonId === lessonId);
      await Promise.all(
        stale.map((p) => adapter.delete('progress', `${p.studentId}::${p.lessonId}`))
      );
    }
  }
}

export const lessonService = new LessonService();
