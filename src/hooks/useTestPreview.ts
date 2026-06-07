import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTestContext } from '../context/TestContext';
import { apiService } from '../services/api';

export function useTestPreview() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentTest, currentQuestions, loadTestAndQuestions } = useTestContext();

  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now');
  const [liveUntil, setLiveUntil] = useState('Always Available');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('10:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('23:59');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    if (id) {
      setPageLoading(true);
      loadTestAndQuestions(id).finally(() => setPageLoading(false));
    }
  }, [id, loadTestAndQuestions]);

  const testTypeLabel = useMemo(() => {
    if (!currentTest?.type) return 'Chapter Wise';
    const map: Record<string, string> = {
      chapterwise: 'Chapter Wise',
      pyq: 'PYQ',
      mock: 'Mock Test',
    };
    return map[currentTest.type.toLowerCase()] || currentTest.type;
  }, [currentTest]);

  const completedCount = currentQuestions.length;
  const expectedCount = currentTest?.total_questions || completedCount;
  const allDone = completedCount > 0 && completedCount >= expectedCount;

  const handlePublish = async () => {
    if (!id) return;
    setLoading(true);
    setApiError(null);
    try {
      await apiService.publishTest(id);
      setPublishSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to publish test.');
    } finally {
      setLoading(false);
    }
  };

  return {
    navigate,
    id,
    currentTest,
    currentQuestions,
    publishMode,
    setPublishMode,
    liveUntil,
    setLiveUntil,
    scheduleDate,
    setScheduleDate,
    scheduleTime,
    setScheduleTime,
    endDate,
    setEndDate,
    endTime,
    setEndTime,
    loading,
    pageLoading,
    apiError,
    publishSuccess,
    showPreview,
    setShowPreview,
    testTypeLabel,
    completedCount,
    expectedCount,
    allDone,
    handlePublish,
  };
}
