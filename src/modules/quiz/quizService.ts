import { Quiz, QuizAttemptRecord, StoredQuizQuestion } from '../../types/domain';
import { createUniqueId, storageService } from '../storage/storageService';
import { SAMPLE_QUIZZES } from './sampleQuizzes';

class QuizService {
  async ensureQuizzesSeeded(): Promise<Quiz[]> {
    const adapter = await storageService.getAdapter();
    const existingQuizzes = await adapter.getAll<Quiz>('quizzes');
    const existingQuestions = await adapter.getAll<StoredQuizQuestion>('quizQuestions');

    if (existingQuizzes.length === 0 || existingQuestions.length === 0) {
      await Promise.all(
        SAMPLE_QUIZZES.map(async (quiz) => {
          await adapter.put('quizzes', quiz.id, quiz);
          await Promise.all(
            quiz.questions.map((question, idx) => {
              const storedQ: StoredQuizQuestion = {
                ...question,
                quizId: quiz.id,
                subjectId: quiz.subjectId,
                orderIndex: idx,
              };
              return adapter.put('quizQuestions', storedQ.id, storedQ);
            })
          );
        })
      );
      return SAMPLE_QUIZZES;
    }

    return this.assembleQuizzesFromDb(existingQuizzes, existingQuestions);
  }

  private assembleQuizzesFromDb(quizzes: Quiz[], questions: StoredQuizQuestion[]): Quiz[] {
    return quizzes.map((quiz) => {
      const matched = questions
        .filter((q) => q.quizId === quiz.id)
        .sort((a, b) => a.orderIndex - b.orderIndex);
      return {
        ...quiz,
        questions: matched.length > 0 ? matched : quiz.questions,
      };
    });
  }

  async getQuizzesFromDb(): Promise<Quiz[]> {
    return this.ensureQuizzesSeeded();
  }

  getQuizzes(): Quiz[] {
    return SAMPLE_QUIZZES;
  }

  async getQuizByIdFromDb(quizId: string): Promise<Quiz | undefined> {
    const quizzes = await this.getQuizzesFromDb();
    return quizzes.find((q) => q.id === quizId);
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
      id: createUniqueId('attempt'),
      quizId: quiz.id,
      subjectId: quiz.subjectId,
      studentId,
      score,
      totalQuestions,
      percentage,
      answers: { ...answers },
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
