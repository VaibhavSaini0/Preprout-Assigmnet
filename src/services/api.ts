import axios from 'axios';

const BASE_URL = import.meta.env.DEV
  ? '/api'
  : 'https://admin-moderator-backend-staging.up.railway.app/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10s timeout to prevent hanging on backend failure
});

// Automatically inject JWT token into header if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('preproute_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface Subject {
  id: string;
  name: string;
}

export interface Topic {
  id: string;
  name: string;
  subject_id: string;
}

export interface SubTopic {
  id: string;
  name: string;
  topic_id: string;
}

export interface Question {
  id?: string;
  type: 'mcq';
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: string;
  explanation?: string;
  difficulty?: string;
  topic_id?: string;
  sub_topic_id?: string;
  media_url?: string;
  test_id: string;
}

export interface Test {
  id: string;
  name: string;
  type: string;
  subject: string;
  topics: string[];
  sub_topics?: string[];
  correct_marks: number;
  wrong_marks: number;
  unattempt_marks: number;
  difficulty: string;
  total_time: number;
  total_marks: number;
  total_questions: number;
  status: 'draft' | 'live' | null;
  created_at?: string;
  questions?: string[];
}

// Check if Mock Mode is enabled
export const isMockMode = (): boolean => {
  const isMock = localStorage.getItem('preproute_mock_mode') === 'true';
  if (isMock) {
    initializeMockDatabase();
  }
  return isMock;
};

export const setMockMode = (enabled: boolean) => {
  localStorage.setItem('preproute_mock_mode', enabled ? 'true' : 'false');
  if (enabled) {
    initializeMockDatabase();
  }
};

// Mock Database Initialisation
const initializeMockDatabase = () => {
  if (!localStorage.getItem('mock_tests')) {
    const mockTests: Test[] = [
      {
        id: 'mock-test-1',
        name: 'Mathematics Algebra Practice',
        type: 'chapter wise',
        subject: 'subj-math',
        topics: ['topic-alg'],
        sub_topics: ['subtopic-lineq'],
        correct_marks: 4,
        wrong_marks: -1,
        unattempt_marks: 0,
        difficulty: 'medium',
        total_time: 60,
        total_questions: 1,
        total_marks: 4,
        status: 'live',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        questions: ['mock-q-1']
      },
      {
        id: 'mock-test-2',
        name: 'English Grammar Basics',
        type: 'chapter wise',
        subject: 'subj-eng',
        topics: ['topic-gram'],
        sub_topics: ['subtopic-parts'],
        correct_marks: 5,
        wrong_marks: 0,
        unattempt_marks: 0,
        difficulty: 'easy',
        total_time: 30,
        total_questions: 0,
        total_marks: 0,
        status: 'draft',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        questions: []
      }
    ];
    localStorage.setItem('mock_tests', JSON.stringify(mockTests));
  }

  if (!localStorage.getItem('mock_questions')) {
    const mockQuestions: Question[] = [
      {
        id: 'mock-q-1',
        type: 'mcq',
        question: 'Solve for x: 3x - 7 = 11.',
        option1: 'x = 4',
        option2: 'x = 6',
        option3: 'x = 5',
        option4: 'x = 7',
        correct_option: 'option2',
        explanation: '3x = 11 + 7 => 3x = 18 => x = 6.',
        difficulty: 'medium',
        topic_id: 'topic-alg',
        sub_topic_id: 'subtopic-lineq',
        test_id: 'mock-test-1'
      }
    ];
    localStorage.setItem('mock_questions', JSON.stringify(mockQuestions));
  }
};

// Static Mock Metadata
const MOCK_SUBJECTS: Subject[] = [
  { id: 'subj-math', name: 'Mathematics' },
  { id: 'subj-sci', name: 'Science' },
  { id: 'subj-eng', name: 'English' }
];

const MOCK_TOPICS: Topic[] = [
  { id: 'topic-alg', name: 'Algebra', subject_id: 'subj-math' },
  { id: 'topic-geom', name: 'Geometry', subject_id: 'subj-math' },
  { id: 'topic-phys', name: 'Physics', subject_id: 'subj-sci' },
  { id: 'topic-chem', name: 'Chemistry', subject_id: 'subj-sci' },
  { id: 'topic-gram', name: 'Grammar & Usage', subject_id: 'subj-eng' },
  { id: 'topic-writ', name: 'Writing Skills', subject_id: 'subj-eng' }
];

const MOCK_SUBTOPICS: SubTopic[] = [
  { id: 'subtopic-lineq', name: 'Linear Equations', topic_id: 'topic-alg' },
  { id: 'subtopic-quad', name: 'Quadratic Equations', topic_id: 'topic-alg' },
  { id: 'subtopic-tri', name: 'Triangles', topic_id: 'topic-geom' },
  { id: 'subtopic-circ', name: 'Circles', topic_id: 'topic-geom' },
  { id: 'subtopic-mech', name: 'Mechanics', topic_id: 'topic-phys' },
  { id: 'subtopic-thermo', name: 'Thermodynamics', topic_id: 'topic-phys' },
  { id: 'subtopic-parts', name: 'Parts of Speech', topic_id: 'topic-gram' },
  { id: 'subtopic-tenses', name: 'Verb Tenses', topic_id: 'topic-gram' }
];

// Helper to generate UUIDs locally
const generateUUID = () => {
  return 'local-uuid-' + Math.random().toString(36).substr(2, 9);
};

export const apiService = {
  // Authentication
  async login(userId: string, password: string) {
    if (isMockMode()) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (userId === 'vedant-admin' && password === 'vedant123') {
        const token = 'mock-jwt-token-value';
        const user = { userId, name: 'Vedant Admin (Mock)', role: 'Admin' };
        localStorage.setItem('preproute_token', token);
        localStorage.setItem('preproute_user', JSON.stringify(user));
        return { success: true, data: { token, user } };
      } else {
        return { success: false, message: 'Invalid username or password' };
      }
    }

    const response = await api.post('/auth/login', { userId, password });
    if (response.data.success) {
      localStorage.setItem('preproute_token', response.data.data.token);
      localStorage.setItem('preproute_user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('preproute_token');
    localStorage.removeItem('preproute_user');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('preproute_token');
  },

  // Subjects, Topics, Sub-topics
  async getSubjects(): Promise<Subject[]> {
    if (isMockMode()) return MOCK_SUBJECTS;
    const response = await api.get('/subjects');
    return response.data.data;
  },

  async getTopics(subjectId: string): Promise<Topic[]> {
    if (isMockMode()) return MOCK_TOPICS.filter(t => t.subject_id === subjectId);
    const response = await api.get(`/topics/subject/${subjectId}`);
    return response.data.data;
  },

  async getSubTopics(topicId: string): Promise<SubTopic[]> {
    if (isMockMode()) return MOCK_SUBTOPICS.filter(st => st.topic_id === topicId);
    const response = await api.get(`/sub-topics/topic/${topicId}`);
    return response.data.data;
  },

  async getSubTopicsMulti(topicIds: string[]): Promise<SubTopic[]> {
    if (!topicIds || topicIds.length === 0) return [];
    if (isMockMode()) {
      return MOCK_SUBTOPICS.filter(st => topicIds.includes(st.topic_id));
    }
    const response = await api.post('/sub-topics/multi-topics', { topicIds });
    return response.data.data;
  },

  // Tests
  async getTests(): Promise<Test[]> {
    if (isMockMode()) {
      return JSON.parse(localStorage.getItem('mock_tests') || '[]');
    }
    const response = await api.get('/tests');
    return response.data.data;
  },

  async getTestById(id: string): Promise<Test> {
    if (isMockMode()) {
      const tests: Test[] = JSON.parse(localStorage.getItem('mock_tests') || '[]');
      const test = tests.find(t => t.id === id);
      if (!test) throw new Error('Test not found');
      return test;
    }
    const response = await api.get(`/tests/${id}`);
    return response.data.data;
  },

  async createTest(testData: Partial<Test>): Promise<Test> {
    if (isMockMode()) {
      const tests: Test[] = JSON.parse(localStorage.getItem('mock_tests') || '[]');
      const newTest: Test = {
        id: generateUUID(),
        name: testData.name || 'Untitled Test',
        type: testData.type || 'chapter wise',
        subject: testData.subject || '',
        topics: testData.topics || [],
        sub_topics: testData.sub_topics || [],
        correct_marks: testData.correct_marks || 4,
        wrong_marks: testData.wrong_marks || 0,
        unattempt_marks: testData.unattempt_marks || 0,
        difficulty: testData.difficulty || 'medium',
        total_time: testData.total_time || 60,
        total_questions: testData.total_questions || 0,
        total_marks: testData.total_marks || 0,
        status: testData.status || 'draft',
        created_at: new Date().toISOString(),
        questions: []
      };
      tests.unshift(newTest);
      localStorage.setItem('mock_tests', JSON.stringify(tests));
      return newTest;
    }
    const response = await api.post('/tests', testData);
    return response.data.data;
  },

  async updateTest(id: string, testData: Partial<Test>): Promise<Test> {
    if (isMockMode()) {
      const tests: Test[] = JSON.parse(localStorage.getItem('mock_tests') || '[]');
      const idx = tests.findIndex(t => t.id === id);
      if (idx === -1) throw new Error('Test not found');
      
      const updated = {
        ...tests[idx],
        ...testData,
        // Preserve ID
        id
      };
      tests[idx] = updated;
      localStorage.setItem('mock_tests', JSON.stringify(tests));
      return updated;
    }
    const response = await api.put(`/tests/${id}`, testData);
    return response.data.data;
  },

  async publishTest(id: string): Promise<Test> {
    if (isMockMode()) {
      return this.updateTest(id, { status: 'live' });
    }
    const response = await api.put(`/tests/${id}`, { status: 'live' });
    return response.data.data;
  },

  async deleteTest(id: string): Promise<void> {
    if (isMockMode()) {
      const tests: Test[] = JSON.parse(localStorage.getItem('mock_tests') || '[]');
      const filtered = tests.filter(t => t.id !== id);
      localStorage.setItem('mock_tests', JSON.stringify(filtered));
      
      // Also delete orphan questions
      const questions: Question[] = JSON.parse(localStorage.getItem('mock_questions') || '[]');
      const filteredQs = questions.filter(q => q.test_id !== id);
      localStorage.setItem('mock_questions', JSON.stringify(filteredQs));
      return;
    }
    await api.delete(`/tests/${id}`);
  },

  // Questions
  async createQuestionsBulk(questionsData: Partial<Question>[]): Promise<Question[]> {
    if (isMockMode()) {
      let dbQuestions: Question[] = JSON.parse(localStorage.getItem('mock_questions') || '[]');
      
      // Clean up existing questions for this test to avoid orphaned records in mock storage
      const targetTestId = questionsData[0]?.test_id;
      if (targetTestId) {
        dbQuestions = dbQuestions.filter(q => q.test_id !== targetTestId);
      }

      const savedQuestions: Question[] = [];

      questionsData.forEach(q => {
        const newQ: Question = {
          id: generateUUID(),
          type: 'mcq',
          question: q.question || '',
          option1: q.option1 || '',
          option2: q.option2 || '',
          option3: q.option3 || '',
          option4: q.option4 || '',
          correct_option: q.correct_option || 'option1',
          explanation: q.explanation || '',
          difficulty: q.difficulty || 'medium',
          topic_id: q.topic_id || '',
          sub_topic_id: q.sub_topic_id || '',
          media_url: q.media_url || '',
          test_id: q.test_id || ''
        };
        dbQuestions.push(newQ);
        savedQuestions.push(newQ);
      });

      localStorage.setItem('mock_questions', JSON.stringify(dbQuestions));
      return savedQuestions;
    }
    const response = await api.post('/questions/bulk', { questions: questionsData });
    return response.data.data;
  },

  async fetchQuestionsBulk(questionIds: string[]): Promise<Question[]> {
    if (!questionIds || questionIds.length === 0) return [];
    if (isMockMode()) {
      const questions: Question[] = JSON.parse(localStorage.getItem('mock_questions') || '[]');
      return questions.filter(q => q.id && questionIds.includes(q.id));
    }
    const response = await api.post('/questions/fetchBulk', { question_ids: questionIds });
    return response.data.data;
  }
};
