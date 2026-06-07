import { api } from './httpClient';
import type { Question } from './httpClient';

export const questionService = {
  async createQuestionsBulk(questionsData: Partial<Question>[]): Promise<Question[]> {
    const response = await api.post('/questions/bulk', { questions: questionsData });
    return response.data.data;
  },

  async fetchQuestionsBulk(questionIds: string[]): Promise<Question[]> {
    if (!questionIds || questionIds.length === 0) return [];
    const response = await api.post('/questions/fetchBulk', { question_ids: questionIds });
    return response.data.data;
  },
};
