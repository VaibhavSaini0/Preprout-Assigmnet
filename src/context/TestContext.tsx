import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authService, metaService, testService, questionService } from '../services';
import type { Subject, Question, Test } from '../services';

interface TestContextType {
  user: any | null;
  token: string | null;
  login: (userId: string, password: string) => Promise<void>;
  logout: () => void;
  subjects: Subject[];
  fetchSubjects: () => Promise<void>;
  currentTest: Test | null;
  setCurrentTest: React.Dispatch<React.SetStateAction<Test | null>>;
  currentQuestions: Question[];
  setCurrentQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  loadTestAndQuestions: (testId: string) => Promise<void>;
  saveCurrentQuestionsToDB: () => Promise<void>;
  resetCurrentTest: () => void;
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

export function TestProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('preproute_token');
    const savedUser = localStorage.getItem('preproute_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = useCallback(async (userId: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(userId, password);
      if (res.success) {
        setToken(res.data.token);
        setUser(res.data.user);
      } else {
        throw new Error(res.message || 'Login failed');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to login. Please try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetCurrentTest = useCallback(() => {
    setCurrentTest(null);
    setCurrentQuestions([]);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    metaService.clearCache();
    setUser(null);
    setToken(null);
    resetCurrentTest();
  }, [resetCurrentTest]);

  const fetchSubjects = useCallback(async () => {
    try {
      const data = await metaService.getSubjects();
      setSubjects(data);
    } catch (err: any) {
      console.error('Failed to fetch subjects', err);
    }
  }, []);

  const loadTestAndQuestions = useCallback(async (testId: string) => {
    setLoading(true);
    setError(null);
    try {
      const test = await testService.getTestById(testId);
      setCurrentTest(test);
      if (test.questions && test.questions.length > 0) {
        const questions = await questionService.fetchQuestionsBulk(test.questions);
        setCurrentQuestions(questions);
      } else {
        setCurrentQuestions([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load test details.');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveCurrentQuestionsToDB = useCallback(async () => {
    if (!currentTest) return;
    setLoading(true);
    setError(null);
    try {
      const freshSubjects = await metaService.getSubjects();
      const subjectEntry =
        freshSubjects.find((s) => s.id === currentTest.subject) ||
        freshSubjects.find(
          (s) => s.name.toLowerCase() === (currentTest.subject || '').toLowerCase()
        );
      const subjectId = subjectEntry?.id || currentTest.subject;

      const questionsToPost = currentQuestions.map((q) => {
        const { id, topic_id, sub_topic_id, ...cleanQ } = q;
        return {
          ...cleanQ,
          test_id: currentTest.id,
          subject: subjectId,
        };
      });

      if (questionsToPost.length === 0) {
        // Just clear the test's questions
        const updated = await testService.updateTest(currentTest.id, {
          questions: [],
          total_questions: 0,
          total_marks: 0
        });
        setCurrentTest(updated);
        return;
      }

      // Bulk create questions
      const savedQuestions = await questionService.createQuestionsBulk(questionsToPost);
      const newQuestionIds = savedQuestions.map(q => q.id || '');
      
      // Calculate new total marks
      const totalMarks = newQuestionIds.length * currentTest.correct_marks;

      // Update test with new question list
      const updatedTest = await testService.updateTest(currentTest.id, {
        questions: newQuestionIds,
        total_questions: newQuestionIds.length,
        total_marks: totalMarks
      });

      setCurrentTest(updatedTest);
      setCurrentQuestions(savedQuestions);
    } catch (err: any) {
      setError(err.message || 'Failed to save questions.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentTest, currentQuestions]);

  return (
    <TestContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        subjects,
        fetchSubjects,
        currentTest,
        setCurrentTest,
        currentQuestions,
        setCurrentQuestions,
        loadTestAndQuestions,
        saveCurrentQuestionsToDB,
        resetCurrentTest,
        loading,
        error,
        setError
      }}
    >
      {children}
    </TestContext.Provider>
  );
}

export function useTestContext() {
  const context = useContext(TestContext);
  if (context === undefined) {
    throw new Error('useTestContext must be used within a TestProvider');
  }
  return context;
}
