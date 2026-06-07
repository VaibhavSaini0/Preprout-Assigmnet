import { api } from './httpClient';
import type { Subject, Topic, SubTopic } from './httpClient';

// In-memory cache stores
const subjectsCache: { data: Subject[] | null } = { data: null };
const topicsCache: Record<string, Topic[]> = {};
const subTopicsCache: Record<string, SubTopic[]> = {};
const subTopicsMultiCache: Record<string, SubTopic[]> = {};

export const metaService = {
  async getSubjects(): Promise<Subject[]> {
    if (subjectsCache.data) {
      return subjectsCache.data;
    }
    const response = await api.get('/subjects');
    subjectsCache.data = response.data.data;
    return response.data.data;
  },

  async getTopics(subjectId: string): Promise<Topic[]> {
    if (topicsCache[subjectId]) {
      return topicsCache[subjectId];
    }
    const response = await api.get(`/topics/subject/${subjectId}`);
    topicsCache[subjectId] = response.data.data;
    return response.data.data;
  },

  async getSubTopics(topicId: string): Promise<SubTopic[]> {
    if (subTopicsCache[topicId]) {
      return subTopicsCache[topicId];
    }
    const response = await api.get(`/sub-topics/topic/${topicId}`);
    subTopicsCache[topicId] = response.data.data;
    return response.data.data;
  },

  async getSubTopicsMulti(topicIds: string[]): Promise<SubTopic[]> {
    if (!topicIds || topicIds.length === 0) return [];
    
    // Generate a stable key by sorting IDs
    const cacheKey = [...topicIds].sort().join(',');
    if (subTopicsMultiCache[cacheKey]) {
      return subTopicsMultiCache[cacheKey];
    }

    const response = await api.post('/sub-topics/multi-topics', { topicIds });
    subTopicsMultiCache[cacheKey] = response.data.data;
    return response.data.data;
  },

  clearCache() {
    subjectsCache.data = null;
    Object.keys(topicsCache).forEach((k) => delete topicsCache[k]);
    Object.keys(subTopicsCache).forEach((k) => delete subTopicsCache[k]);
    Object.keys(subTopicsMultiCache).forEach((k) => delete subTopicsMultiCache[k]);
  },
};
