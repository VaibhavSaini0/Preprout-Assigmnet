import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTestContext } from '../context/TestContext';
import { apiService } from '../services/api';

export function useTestDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentTest, currentQuestions, loadTestAndQuestions } = useTestContext();

  const [pageLoading, setPageLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    if (id) {
      setPageLoading(true);
      setApiError(null);
      loadTestAndQuestions(id)
        .catch(() => setApiError('Failed to load test details.'))
        .finally(() => setPageLoading(false));
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

  const status = (currentTest?.status || 'draft').toLowerCase();
  const questionCount = currentQuestions.length;

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await apiService.deleteTest(id);
      navigate('/tracking');
    } catch {
      setApiError('Failed to delete test. Please try again.');
    } finally {
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  const goToEditTest = () => {
    if (!id) return;
    navigate(`/edit-test/${id}`, { state: { from: `/view-test/${id}` } });
  };

  const goToEditQuestions = () => {
    if (!id) return;
    navigate(`/test-view/${id}`);
  };

  return {
    navigate,
    id,
    currentTest,
    currentQuestions,
    pageLoading,
    apiError,
    deleteConfirm,
    setDeleteConfirm,
    deleting,
    showPreview,
    setShowPreview,
    testTypeLabel,
    status,
    questionCount,
    handleDelete,
    goToEditTest,
    goToEditQuestions,
  };
}
