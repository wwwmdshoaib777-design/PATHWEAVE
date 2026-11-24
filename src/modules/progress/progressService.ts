import {
  ActivityRecord,
  Lesson,
  LessonProgressRecord,
  QuizAttemptRecord,
  StudentRosterRecord,
  SubjectId,
} from '../../types/domain';
import { storageService } from '../storage/storageService';

export interface TopicWeakArea {
  topicName: string;
  occurrences: number;
  accuracyPercent: number | null;
  source: 'roster_sample' | 'quiz_attempts';
}

export interface SubjectProgressSummary {
  subjectId: SubjectId;
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  completionPercent: number;
}

class ProgressService {
  async getStudentLessonProgress(studentId: string): Promise<LessonProgressRecord[]> {
    const adapter = await storageService.getAdapter();
    const all = await adapter.getAll<LessonProgressRecord>('progress');
    return all.filter((p) => p.studentId === studentId);
  }

  async markLessonViewed(studentId: string, lessonId: string): Promise<LessonProgressRecord> {
    const adapter = await storageService.getAdapter();
    const key = `${studentId}::${lessonId}`;
    const existing = await adapter.get<LessonProgressRecord>('progress', key);

    if (existing && existing.status === 'completed') {
      const updated: LessonProgressRecord = {
        ...existing,
        lastViewedAt: new Date().toISOString(),
      };
      await adapter.put('progress', key, updated);
      return updated;
    }

    const record: LessonProgressRecord = {
      lessonId,
      studentId,
      status: 'in_progress',
      completionPercent: existing?.completionPercent ?? 45,
      lastViewedAt: new Date().toISOString(),
    };
    await adapter.put('progress', key, record);
    return record;
  }

  async markLessonCompleted(studentId: string, lessonId: string): Promise<LessonProgressRecord> {
    const adapter = await storageService.getAdapter();
    const key = `${studentId}::${lessonId}`;
    const now = new Date().toISOString();
    const record: LessonProgressRecord = {
      lessonId,
      studentId,
      status: 'completed',
      completionPercent: 100,
      lastViewedAt: now,
      completedAt: now,
    };
    await adapter.put('progress', key, record);
    return record;
  }

  computeSubjectSummaries(
    lessons: Lesson[],
    progressRecords: LessonProgressRecord[]
  ): SubjectProgressSummary[] {
    const subjects: SubjectId[] = ['math', 'science'];
    return subjects.map((subjectId) => {
      const subjectLessons = lessons.filter((l) => l.subjectId === subjectId);
      const completedLessons = subjectLessons.filter((l) =>
        progressRecords.some((p) => p.lessonId === l.id && p.status === 'completed')
      ).length;
      const inProgressLessons = subjectLessons.filter((l) =>
        progressRecords.some((p) => p.lessonId === l.id && p.status === 'in_progress')
      ).length;
      const completionPercent =
        subjectLessons.length > 0
          ? Math.round((completedLessons / subjectLessons.length) * 100)
          : 0;

      return {
        subjectId,
        totalLessons: subjectLessons.length,
        completedLessons,
        inProgressLessons,
        completionPercent,
      };
    });
  }

  computeTopicWeakAreas(
    students: StudentRosterRecord[],
    attempts: QuizAttemptRecord[]
  ): TopicWeakArea[] {
    const topicMap = new Map<
      string,
      { rosterCount: number; quizTotal: number; quizCorrect: number }
    >();

    for (const student of students) {
      for (const topic of student.weakTopics) {
        const entry = topicMap.get(topic) ?? { rosterCount: 0, quizTotal: 0, quizCorrect: 0 };
        entry.rosterCount += 1;
        topicMap.set(topic, entry);
      }
    }

    for (const attempt of attempts) {
      for (const item of attempt.topicResults) {
        const label = item.topicLabel.en;
        const entry = topicMap.get(label) ?? { rosterCount: 0, quizTotal: 0, quizCorrect: 0 };
        entry.quizTotal += 1;
        if (item.correct) entry.quizCorrect += 1;
        topicMap.set(label, entry);
      }
    }

    const result: TopicWeakArea[] = [];
    for (const [topicName, stats] of topicMap.entries()) {
      const accuracyPercent =
        stats.quizTotal > 0 ? Math.round((stats.quizCorrect / stats.quizTotal) * 100) : null;
      result.push({
        topicName,
        occurrences: stats.rosterCount,
        accuracyPercent,
        source: stats.quizTotal > 0 ? 'quiz_attempts' : 'roster_sample',
      });
    }

    return result.sort((a, b) => {
      if (a.accuracyPercent !== null && b.accuracyPercent !== null) {
        return a.accuracyPercent - b.accuracyPercent;
      }
      return b.occurrences - a.occurrences;
    });
  }

  async logActivity(record: Omit<ActivityRecord, 'id' | 'timestamp'>): Promise<ActivityRecord> {
    const adapter = await storageService.getAdapter();
    const item: ActivityRecord = {
      ...record,
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    await adapter.put('activity', item.id, item);
    return item;
  }

  async getRecentActivity(): Promise<ActivityRecord[]> {
    const adapter = await storageService.getAdapter();
    const all = await adapter.getAll<ActivityRecord>('activity');
    return all
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);
  }
}

export const progressService = new ProgressService();
