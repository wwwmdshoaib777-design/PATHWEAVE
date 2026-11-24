import { Quiz, QuizAttemptRecord, StoredQuizQuestion } from '../../types/domain';
import { ADAPTIVE_QUESTION_BANK, normalizeTopicKey } from '../adaptive/adaptiveQuestionBank';
import { createUniqueId, storageService } from '../storage/storageService';
import { SAMPLE_QUIZZES } from './sampleQuizzes';

class QuizService {
  async ensureQuizzesSeeded(): Promise<Quiz[]> {
    const adapter = await storageService.getAdapter();
    const [existingQuizzes, existingQuestions] = await Promise.all([
      adapter.getAll<Quiz>('quizzes'),
      adapter.getAll<StoredQuizQuestion>('quizQuestions'),
    ]);

    const existingQuizById = new Map(existingQuizzes.map((q) => [q.id, q]));
    const existingQuestionById = new Map(existingQuestions.map((q) => [q.id, q]));

    // Seed or upgrade standard sample quizzes non-destructively
    const quizWrites: Promise<void>[] = [];
    const questionWrites: Promise<void>[] = [];

    for (const quiz of SAMPLE_QUIZZES) {
      const storedQuiz = existingQuizById.get(quiz.id);
      const needsQuizUpgrade =
        !storedQuiz || storedQuiz.questions.some((q) => !('difficulty' in q) || !q.difficulty);
      if (needsQuizUpgrade) {
        quizWrites.push(adapter.put('quizzes', quiz.id, quiz));
      }

      quiz.questions.forEach((question, idx) => {
        const storedQ: StoredQuizQuestion = {
          ...question,
          quizId: quiz.id,
          subjectId: quiz.subjectId,
          orderIndex: idx,
        };
        const existingQ = existingQuestionById.get(storedQ.id);
        if (!existingQ || !existingQ.difficulty || existingQ.topicKey !== storedQ.topicKey) {
          questionWrites.push(adapter.put('quizQuestions', storedQ.id, storedQ));
        }
      });
    }

    // Seed or upgrade full deterministic adaptive question bank into IndexedDB
    for (const bankQuestion of ADAPTIVE_QUESTION_BANK) {
      const existingQ = existingQuestionById.get(bankQuestion.id);
      if (!existingQ || !existingQ.difficulty || !existingQ.languages) {
        questionWrites.push(adapter.put('quizQuestions', bankQuestion.id, bankQuestion));
      }
    }

    if (quizWrites.length > 0 || questionWrites.length > 0) {
      await Promise.all([...quizWrites, ...questionWrites]);
    }

    const [updatedQuizzes, updatedQuestions] = await Promise.all([
      adapter.getAll<Quiz>('quizzes'),
      adapter.getAll<StoredQuizQuestion>('quizQuestions'),
    ]);

    return this.assembleQuizzesFromDb(updatedQuizzes, updatedQuestions);
  }

  private assembleQuizzesFromDb(quizzes: Quiz[], questions: StoredQuizQuestion[]): Quiz[] {
    const orderById = new Map(SAMPLE_QUIZZES.map((q, idx) => [q.id, idx]));
    return quizzes
      .filter((q) => !q.isAdaptiveExercise)
      .sort((a, b) => (orderById.get(a.id) ?? 99) - (orderById.get(b.id) ?? 99))
      .map((quiz) => {
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

  async getAllQuestionsFromDb(): Promise<StoredQuizQuestion[]> {
    await this.ensureQuizzesSeeded();
    const adapter = await storageService.getAdapter();
    return adapter.getAll<StoredQuizQuestion>('quizQuestions');
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
        questionId: question.id,
        topicKey: normalizeTopicKey(question.topicKey),
        topicLabel: question.topicLabel,
        difficulty: question.difficulty ?? quiz.targetDifficulty ?? 'Medium',
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
      mode: quiz.isAdaptiveExercise ? 'adaptive_practice' : 'standard_quiz',
      targetDifficulty: quiz.targetDifficulty,
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
