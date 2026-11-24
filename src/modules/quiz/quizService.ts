import { Quiz, QuizAttemptRecord } from '../../types/domain';
import { storageService } from '../storage/storageService';
import { SAMPLE_QUIZZES } from './sampleQuizzes';

class QuizService {
  getQuizzes(): Quiz[] {
    return SAMPLE_QUIZZES;
  }

  getQuizById(quizId: string): Quiz | undefined {
    return SAMPLE_QUIZZES.find((q) => q.id === quizId);
  }

  async submitQuizAttempt(
    quiz: Quiz,
    studentId: string,
    answers: Record<string, number>
  ): Promise<QuizAttemptRecord> {
    const topicResults = quiz.questions.map((question) => {
      const selected = answers[question.id];
      const correct = selected === question.correctIndex;
      return {
        topicKey: question.topicKey,
        topicLabel: question.topicLabel,
        correct,
      };
    });

    const score = topicResults.filter((r) => r.correct).length;
    const totalQuestions = quiz.questions.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    const record: QuizAttemptRecord = {
      id: `attempt-${quiz.id}-${Date.now()}`,
      quizId: quiz.id,
      subjectId: quiz.subjectId,
      studentId,
      score,
      totalQuestions,
      percentage,
      answers,
      topicResults,
      submittedAt: new Date().toISOString(),
    };

    const adapter = await storageService.getAdapter();
    await adapter.put('quizAttempts', record.id, record);
    return record;
  }

  async getAttemptsForStudent(studentId: string): Promise<QuizAttemptRecord[]> {
    const adapter = await storageService.getAdapter();
    const all = await adapter.getAll<QuizAttemptRecord>('quizAttempts');
    return all
      .filter((a) => a.studentId === studentId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  async getAllAttempts(): Promise<QuizAttemptRecord[]> {
    const adapter = await storageService.getAdapter();
    const all = await adapter.getAll<QuizAttemptRecord>('quizAttempts');
    return all.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }
}

export const quizService = new QuizService();
