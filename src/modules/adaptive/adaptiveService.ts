import {
  AdaptiveRecommendationRecord,
  Quiz,
  QuizAttemptRecord,
  StoredQuizQuestion,
  TopicPerformanceAnalysis,
} from '../../types/domain';
import { storageService } from '../storage/storageService';
import {
  analyzeStudentTopicPerformance,
  buildAdaptiveExerciseQuiz,
  computeStudentAdaptiveRecommendations,
} from './adaptiveEngine';

class AdaptiveService {
  async getSavedRecommendationsForStudent(
    studentId: string
  ): Promise<AdaptiveRecommendationRecord[]> {
    const adapter = await storageService.getAdapter();
    const all = await adapter.getAll<AdaptiveRecommendationRecord>('adaptiveRecommendations');
    return all
      .filter((r) => r.studentId === studentId)
      .sort((a, b) => {
        if (a.isWeakTopic !== b.isWeakTopic) return a.isWeakTopic ? -1 : 1;
        if (a.needsPrerequisiteRevision !== b.needsPrerequisiteRevision) {
          return a.needsPrerequisiteRevision ? -1 : 1;
        }
        return a.recentAccuracyPercent - b.recentAccuracyPercent;
      });
  }

  async getAllSavedRecommendations(): Promise<AdaptiveRecommendationRecord[]> {
    const adapter = await storageService.getAdapter();
    return adapter.getAll<AdaptiveRecommendationRecord>('adaptiveRecommendations');
  }

  async getTopicAnalysesForStudent(studentId: string): Promise<TopicPerformanceAnalysis[]> {
    const adapter = await storageService.getAdapter();
    const [attempts, questions] = await Promise.all([
      adapter.getAll<QuizAttemptRecord>('quizAttempts'),
      adapter.getAll<StoredQuizQuestion>('quizQuestions'),
    ]);
    return analyzeStudentTopicPerformance(studentId, attempts, questions);
  }

  /**
   * Recomputes adaptive recommendations deterministically from IndexedDB quizAttempts
   * and quizQuestions, then persists them into IndexedDB adaptiveRecommendations store.
   */
  async recomputeAndSaveForStudent(studentId: string): Promise<{
    analyses: TopicPerformanceAnalysis[];
    recommendations: AdaptiveRecommendationRecord[];
  }> {
    const adapter = await storageService.getAdapter();
    const [attempts, questions, existingRecs] = await Promise.all([
      adapter.getAll<QuizAttemptRecord>('quizAttempts'),
      adapter.getAll<StoredQuizQuestion>('quizQuestions'),
      adapter.getAll<AdaptiveRecommendationRecord>('adaptiveRecommendations'),
    ]);

    const { analyses, recommendations } = computeStudentAdaptiveRecommendations(
      studentId,
      attempts,
      questions
    );

    const newIds = new Set(recommendations.map((r) => r.id));
    const staleForStudent = existingRecs.filter(
      (r) => r.studentId === studentId && !newIds.has(r.id)
    );

    await Promise.all([
      ...staleForStudent.map((stale) => adapter.delete('adaptiveRecommendations', stale.id)),
      ...recommendations.map((rec) => adapter.put('adaptiveRecommendations', rec.id, rec)),
    ]);

    return { analyses, recommendations };
  }

  async createAdaptiveQuizFromRecommendation(
    recommendation: AdaptiveRecommendationRecord
  ): Promise<Quiz> {
    const adapter = await storageService.getAdapter();
    const questions = await adapter.getAll<StoredQuizQuestion>('quizQuestions');
    return buildAdaptiveExerciseQuiz(recommendation, questions);
  }
}

export const adaptiveService = new AdaptiveService();
