import axios from 'axios';

// Use relative /api in all environments — Vite proxies locally, Vercel rewrites in production
const BASE_URL = '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30s timeout to accommodate backend cold starts/wakeups
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


