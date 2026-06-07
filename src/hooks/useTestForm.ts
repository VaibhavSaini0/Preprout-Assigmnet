import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTestContext } from '../context/TestContext';
import { apiService, metaService } from '../services/api';
import type { Topic, SubTopic, Test } from '../services/api';

const TEST_TYPE_TO_API: Record<string, string> = {
  'chapter wise': 'chapterwise',
  pyq: 'pyq',
  'mock test': 'mock',
};

const TEST_TYPE_FROM_API: Record<string, string> = {
  chapterwise: 'Chapter Wise',
  pyq: 'PYQ',
  mock: 'Mock Test',
};

function toApiTestType(label: string): string {
  return TEST_TYPE_TO_API[label.toLowerCase()] || label.toLowerCase().replace(/\s+/g, '');
}

function fromApiTestType(value: string): string {
  return TEST_TYPE_FROM_API[value.toLowerCase()] || value;
}

const DIFFICULTY_TO_API: Record<string, string> = {
  easy: 'easy',
  medium: 'medium',
  difficult: 'hard',
  hard: 'hard',
};

const DIFFICULTY_FROM_API: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Difficult',
};

function toApiDifficulty(label: string): string {
  return DIFFICULTY_TO_API[label.toLowerCase()] || label.toLowerCase();
}

function fromApiDifficulty(value: string): string {
  return DIFFICULTY_FROM_API[value.toLowerCase()] || value;
}

export function useTestForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;
  const returnTo = (location.state as { from?: string } | null)?.from;

  const goBack = () => {
    if (returnTo) {
      navigate(returnTo);
    } else {
      navigate(-1);
    }
  };
  const { subjects, fetchSubjects, setCurrentTest, currentTest } = useTestContext();
  const isInitialLoadRef = useRef(isEditing);

  const [testName, setTestName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [testType, setTestType] = useState('Chapter Wise');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedSubTopics, setSelectedSubTopics] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState('Medium');
  const [wrongAnswer, setWrongAnswer] = useState(-1);
  const [unattempted, setUnattempted] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState(5);
  const [totalQuestions, setTotalQuestions] = useState(50);
  const [duration, setDuration] = useState(60);
  const [topicsOptions, setTopicsOptions] = useState<Topic[]>([]);
  const [subTopicsOptions, setSubTopicsOptions] = useState<SubTopic[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      const loadTestData = async () => {
        setInitialLoading(true);
        setApiError(null);
        try {
          // Ensure subjects are loaded so we can resolve subject name → ID
          // Use metaService directly to get a fresh list (avoids stale closure on subjects state)
          const freshSubjects = await metaService.getSubjects();
          fetchSubjects(); // also update context state
          const test = await apiService.getTestById(id);
          setCurrentTest(test);
          setTestName(test.name);

          // test.subject may be a UUID or a subject name depending on the API.
          // Resolve it to the actual subject ID by checking both cases.
          const resolvedSubjectId = (() => {
            const byId = freshSubjects.find((s) => s.id === test.subject);
            if (byId) return byId.id;
            // Try matching by name (case-insensitive)
            const byName = freshSubjects.find(
              (s) => s.name.toLowerCase() === (test.subject || '').toLowerCase()
            );
            return byName ? byName.id : test.subject;
          })();
          setSelectedSubject(resolvedSubjectId);

          setTestType(test.type ? fromApiTestType(test.type) : 'Chapter Wise');
          setDifficulty(test.difficulty ? fromApiDifficulty(test.difficulty) : 'Medium');
          setWrongAnswer(test.wrong_marks);
          setUnattempted(test.unattempt_marks);
          setCorrectAnswer(test.correct_marks);
          setTotalQuestions(test.total_questions);
          setDuration(test.total_time);

          // GET /tests/:id may return topic/sub_topic names — resolve to UUIDs for the form
          const allTopics = await apiService.getTopics(resolvedSubjectId);
          setTopicsOptions(allTopics);
          const resolvedTopicIds = (test.topics || [])
            .map((value) => {
              const byId = allTopics.find((t) => t.id === value);
              if (byId) return byId.id;
              const byName = allTopics.find(
                (t) => t.name.toLowerCase() === String(value).toLowerCase()
              );
              return byName?.id;
            })
            .filter((id): id is string => Boolean(id));
          setSelectedTopics(resolvedTopicIds);

          if (resolvedTopicIds.length > 0) {
            const allSubTopics = await apiService.getSubTopicsMulti(resolvedTopicIds);
            setSubTopicsOptions(allSubTopics);
            const resolvedSubTopicIds = (test.sub_topics || [])
              .map((value) => {
                const byId = allSubTopics.find((st) => st.id === value);
                if (byId) return byId.id;
                const byName = allSubTopics.find(
                  (st) => st.name.toLowerCase() === String(value).toLowerCase()
                );
                return byName?.id;
              })
              .filter((id): id is string => Boolean(id));
            setSelectedSubTopics(resolvedSubTopicIds);
          } else {
            setSubTopicsOptions([]);
            setSelectedSubTopics([]);
          }

          setTimeout(() => {
            isInitialLoadRef.current = false;
          }, 100);
        } catch {
          setApiError('Failed to load test details for editing.');
        } finally {
          setInitialLoading(false);
        }
      };
      loadTestData();
    }
  }, [isEditing, id, setCurrentTest]);

  useEffect(() => {
    if (selectedSubject) {
      apiService
        .getTopics(selectedSubject)
        .then((topics) => {
          setTopicsOptions(topics);
          if (!isInitialLoadRef.current) {
            setSelectedTopics((prev) =>
              prev.filter((tid) => topics.some((t) => t.id === tid))
            );
          }
        })
        .catch(console.error);
    } else {
      setTopicsOptions([]);
      if (!isInitialLoadRef.current) setSelectedTopics([]);
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedTopics.length > 0) {
      apiService
        .getSubTopicsMulti(selectedTopics)
        .then((subTopics) => {
          setSubTopicsOptions(subTopics);
          if (!isInitialLoadRef.current) {
            setSelectedSubTopics((prev) =>
              prev.filter((stid) => subTopics.some((st) => st.id === stid))
            );
          }
        })
        .catch(console.error);
    } else {
      setSubTopicsOptions([]);
      if (!isInitialLoadRef.current) setSelectedSubTopics([]);
    }
  }, [selectedTopics]);

  useEffect(() => {
    if (isInitialLoadRef.current) return;
    setSelectedSubTopics((prev) =>
      prev.filter((stId) => subTopicsOptions.some((opt) => opt.id === stId))
    );
  }, [subTopicsOptions]);

  const calculatedTotalMarks = useMemo(
    () => totalQuestions * correctAnswer,
    [totalQuestions, correctAnswer]
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!testName.trim()) newErrors.testName = 'Test name is required';
    if (!selectedSubject) newErrors.subject = 'Subject is required';
    if (selectedTopics.length === 0) newErrors.topics = 'At least one topic must be selected';
    if (duration <= 0) newErrors.duration = 'Duration must be greater than 0';
    if (totalQuestions <= 0) newErrors.totalQuestions = 'Number of questions must be greater than 0';
    if (correctAnswer <= 0) newErrors.correctAnswer = 'Correct marks must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPayload = (): Partial<Test> => {
    const payload: Partial<Test> = {
      name: testName.trim(),
      type: toApiTestType(testType),
      subject: selectedSubject,
      topics: selectedTopics,
      sub_topics: selectedSubTopics,
      correct_marks: correctAnswer,
      wrong_marks: wrongAnswer,
      unattempt_marks: unattempted,
      difficulty: toApiDifficulty(difficulty),
      total_time: duration,
      total_marks: calculatedTotalMarks,
      total_questions: totalQuestions,
    };
    if (isEditing && currentTest?.status) {
      payload.status = currentTest.status;
    } else if (!isEditing) {
      payload.status = 'draft';
    }
    return payload;
  };

  const handleSaveAsDraft = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setApiError(null);
    try {
      if (isEditing && id) {
        const payload = getPayload();
        console.log('[useTestForm] updateTest payload:', payload);
        await apiService.updateTest(id, payload);
        goBack();
      } else {
        const payload = getPayload();
        console.log('[useTestForm] createTest payload:', payload);
        await apiService.createTest(payload);
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const axiosMsg = (err as any)?.response?.data?.message || (err as any)?.response?.data?.error;
      const msg = axiosMsg || (err instanceof Error ? err.message : 'Failed to save test as draft.');
      console.error('[useTestForm] createTest/updateTest error:', (err as any)?.response?.data);
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setApiError(null);
    try {
      let savedTest: Test;
      if (isEditing && id) {
        const payload = getPayload();
        console.log('[useTestForm] updateTest payload:', payload);
        savedTest = await apiService.updateTest(id, payload);
      } else {
        const payload = getPayload();
        console.log('[useTestForm] createTest payload:', payload);
        savedTest = await apiService.createTest(payload);
      }
      setCurrentTest(savedTest);
      navigate(`/test-view/${savedTest.id}`);
    } catch (err: unknown) {
      const axiosMsg = (err as any)?.response?.data?.message || (err as any)?.response?.data?.error;
      const msg = axiosMsg || (err instanceof Error ? err.message : 'Failed to save test details.');
      console.error('[useTestForm] createTest/updateTest error:', (err as any)?.response?.data);
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    navigate,
    id,
    isEditing,
    subjects,
    testName,
    setTestName,
    selectedSubject,
    setSelectedSubject,
    testType,
    setTestType,
    selectedTopics,
    setSelectedTopics,
    selectedSubTopics,
    setSelectedSubTopics,
    difficulty,
    setDifficulty,
    wrongAnswer,
    setWrongAnswer,
    unattempted,
    setUnattempted,
    correctAnswer,
    setCorrectAnswer,
    totalQuestions,
    setTotalQuestions,
    duration,
    setDuration,
    topicsOptions,
    subTopicsOptions,
    errors,
    loading,
    initialLoading,
    apiError,
    calculatedTotalMarks,
    handleSaveAsDraft,
    handleNext,
    goBack,
  };
}
