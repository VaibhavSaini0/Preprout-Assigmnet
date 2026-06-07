import { api } from './httpClient';
import type { Test } from './httpClient';

export const testService = {
  async getTests(): Promise<Test[]> {
    const response = await api.get('/tests');
    return response.data.data;
  },

  async getTestById(id: string): Promise<Test> {
    const response = await api.get(`/tests/${id}`);
    return response.data.data;
  },

  async createTest(testData: Partial<Test>): Promise<Test> {
    const response = await api.post('/tests', testData);
    return response.data.data;
  },

  async updateTest(id: string, testData: Partial<Test>): Promise<Test> {
    const response = await api.put(`/tests/${id}`, testData);
    return response.data.data;
  },

  async publishTest(id: string): Promise<Test> {
    const response = await api.put(`/tests/${id}`, { status: 'live' });
    return response.data.data;
  },

  async deleteTest(id: string): Promise<void> {
    await api.delete(`/tests/${id}`);
  },
};
