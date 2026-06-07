import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestContext } from '../context/TestContext';
import { apiService } from '../services/api';
import type { Test } from '../services/api';

export function useDashboard() {
  const navigate = useNavigate();
  const { subjects, fetchSubjects, resetCurrentTest } = useTestContext();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Test | null>(null);

  const fetchTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getTests();
      setTests(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to fetch tests. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchTests();
  }, []);

  const subjectMap = useMemo(() => {
    const map: Record<string, string> = {};
    subjects.forEach((s) => {
      map[s.id] = s.name;
    });
    return map;
  }, [subjects]);

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      const nameMatch = test.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const mappedSubjectName = subjectMap[test.subject] || test.subject || '';
      const selectedSubjectName = subjectMap[selectedSubject] || '';
      const subjectMatch =
        !selectedSubject ||
        test.subject === selectedSubject ||
        mappedSubjectName.toLowerCase() === selectedSubjectName.toLowerCase();
      const statusMatch =
        !selectedStatus ||
        (test.status || 'draft').toLowerCase() === selectedStatus.toLowerCase();
      return nameMatch && subjectMatch && statusMatch;
    });
  }, [tests, searchTerm, selectedSubject, selectedStatus, subjectMap]);

  const stats = useMemo(
    () => ({
      total: tests.length,
      live: tests.filter((t) => (t.status || 'draft') === 'live').length,
      draft: tests.filter((t) => (t.status || 'draft') === 'draft').length,
    }),
    [tests]
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiService.deleteTest(deleteTarget.id);
    } catch {
      // Fall through to local removal
    }
    setTests((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleCreateNew = () => {
    resetCurrentTest();
    navigate('/create-test');
  };

  return {
    navigate,
    subjects,
    tests,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedSubject,
    setSelectedSubject,
    selectedStatus,
    setSelectedStatus,
    deleteTarget,
    setDeleteTarget,
    subjectMap,
    filteredTests,
    stats,
    fetchTests,
    handleDelete,
    handleCreateNew,
  };
}
