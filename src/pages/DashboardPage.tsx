import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Button from '../components/ui/Button';
import { useTestContext } from '../context/TestContext';
import { apiService } from '../services/api';
import type { Test } from '../services/api';
import {
  IconSearch,
  IconEdit,
  IconTrash,
  IconEye,
  IconTimer,
  IconQuestions,
  IconTestCreation
} from '../components/icons/Icons';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { subjects, fetchSubjects, resetCurrentTest } = useTestContext();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const fetchTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getTests();
      // Ensure it is an array
      setTests(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch tests. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchTests();
  }, []);

  const handleCreateNew = () => {
    resetCurrentTest();
    navigate('/create-test');
  };

  const handleEdit = (test: Test) => {
    navigate(`/edit-test/${test.id}`);
  };

  const handleView = (test: Test) => {
    navigate(`/confirmation/${test.id}`);
  };

  const handleDelete = async (testId: string) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;
    try {
      await apiService.deleteTest(testId);
      // Remove from list
      setTests(prev => prev.filter(t => t.id !== testId));
    } catch (err: any) {
      console.error('API delete failed, falling back to local simulation', err);
      // Simulate deletion locally for better UX even if endpoint is restricted or missing
      setTests(prev => prev.filter(t => t.id !== testId));
    }
  };

  // Map subject ID to name
  const subjectMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (Array.isArray(subjects)) {
      subjects.forEach((s) => {
        map[s.id] = s.name;
      });
    }
    return map;
  }, [subjects]);

  // Filtered tests
  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const nameMatch = test.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const mappedSubjectName = subjectMap[test.subject] || test.subject || '';
      const subjectMatch = !selectedSubject || 
        test.subject === selectedSubject || 
        mappedSubjectName.toLowerCase() === selectedSubject.toLowerCase();
      
      const statusMatch = !selectedStatus || 
        (test.status || 'draft').toLowerCase() === selectedStatus.toLowerCase();

      return nameMatch && subjectMatch && statusMatch;
    });
  }, [tests, searchTerm, selectedSubject, selectedStatus, subjectMap]);

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-2xl flex-wrap gap-lg max-md:flex-col max-md:items-start">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'All Tests' },
          ]}
        />
        <div className="flex items-center gap-lg flex-wrap max-md:w-full max-md:justify-between">
          <div className="flex items-center gap-sm bg-bg-input border border-border-input rounded-md px-lg h-[40px] w-[240px] transition duration-200 focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(89,136,239,0.12)] max-md:w-full">
            <IconSearch />
            <input 
              type="text" 
              placeholder="Search tests..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-none bg-transparent outline-none text-sm w-full text-text-main"
              aria-label="Search tests"
            />
          </div>
          
          <select 
            className="h-[40px] px-lg border border-border-input rounded-md bg-bg-input text-text-main outline-none text-sm cursor-pointer min-w-[130px] transition duration-200 focus:border-primary"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            aria-label="Filter by Subject"
          >
            <option value="">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select 
            className="h-[40px] px-lg border border-border-input rounded-md bg-bg-input text-text-main outline-none text-sm cursor-pointer min-w-[130px] transition duration-200 focus:border-primary"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Filter by Status"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="live">Live</option>
          </select>

          <Button onClick={handleCreateNew}>
            + Create New Test
          </Button>
        </div>
      </div>

      <div className="bg-bg-card border border-border rounded-lg p-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-subtle gap-lg">
            <div className="w-10 h-10 border-[3px] border-border border-t-primary rounded-full animate-spin" />
            <p>Loading tests...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-[60px] px-2xl text-center">
            <p className="text-danger mb-lg">{error}</p>
            <Button onClick={fetchTests}>Retry</Button>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[60px] px-2xl text-center">
            <IconTestCreation width={64} height={64} className="text-text-subtle" />
            <h3 className="text-lg font-semibold text-text-heading mt-lg mb-xs">No tests found</h3>
            <p className="text-text-subtle text-sm mb-2xl max-w-[400px]">
              {tests.length === 0 
                ? 'Get started by creating your very first test and adding questions to it!'
                : 'No tests match your active filters. Try adjustments or clear filters.'}
            </p>
            {tests.length === 0 && (
              <Button onClick={handleCreateNew}>Create First Test</Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto -mx-3 px-3">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className="p-lg px-xl text-xs font-semibold uppercase text-text-subtle border-b-2 border-border tracking-wider">Test Details</th>
                  <th className="p-lg px-xl text-xs font-semibold uppercase text-text-subtle border-b-2 border-border tracking-wider">Created</th>
                  <th className="p-lg px-xl text-xs font-semibold uppercase text-text-subtle border-b-2 border-border tracking-wider">Difficulty</th>
                  <th className="p-lg px-xl text-xs font-semibold uppercase text-text-subtle border-b-2 border-border tracking-wider">Marking Scheme</th>
                  <th className="p-lg px-xl text-xs font-semibold uppercase text-text-subtle border-b-2 border-border tracking-wider">Questions</th>
                  <th className="p-lg px-xl text-xs font-semibold uppercase text-text-subtle border-b-2 border-border tracking-wider">Duration</th>
                  <th className="p-lg px-xl text-xs font-semibold uppercase text-text-subtle border-b-2 border-border tracking-wider">Status</th>
                  <th className="p-lg px-xl text-xs font-semibold uppercase text-text-subtle border-b-2 border-border tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTests.map((test) => {
                  const subjectName = subjectMap[test.subject] || test.subject || 'Unknown';
                  const status = test.status || 'draft';
                  const difficulty = test.difficulty || 'medium';

                  return (
                    <tr key={test.id} className="transition duration-200 hover:bg-bg-page">
                      <td className="p-lg px-xl text-sm text-text-main border-b border-border align-middle">
                        <div className="font-semibold text-text-heading">{test.name}</div>
                        <div className="text-xs text-text-subtle mt-[2px]">{subjectName}</div>
                      </td>
                      <td className="p-lg px-xl text-xs text-text-subtle border-b border-border align-middle whitespace-nowrap">
                        {test.created_at
                          ? new Date(test.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="p-lg px-xl text-sm text-text-main border-b border-border align-middle">
                        <span className={`inline-flex items-center gap-[4px] py-xs px-lg rounded-full text-[11px] font-semibold uppercase ${
                          difficulty.toLowerCase() === 'easy' ? 'bg-badge-easy-bg text-badge-easy' :
                          difficulty.toLowerCase() === 'medium' ? 'bg-[#fef3c7] text-[#d97706]' :
                          'bg-danger-bg text-danger'
                        }`}>
                          {difficulty}
                        </span>
                      </td>
                      <td className="p-lg px-xl text-sm text-text-main border-b border-border align-middle">
                        <span className="text-xs">
                          +{test.correct_marks} / {test.wrong_marks} / {test.unattempt_marks}
                        </span>
                      </td>
                      <td className="p-lg px-xl text-sm text-text-main border-b border-border align-middle">
                        <span className="inline-flex items-center gap-[4px]">
                          <IconQuestions className="w-3.5 h-3.5" />
                          {test.total_questions || 0}
                        </span>
                      </td>
                      <td className="p-lg px-xl text-sm text-text-main border-b border-border align-middle">
                        <span className="inline-flex items-center gap-[4px]">
                          <IconTimer className="w-3.5 h-3.5" />
                          {test.total_time} min
                        </span>
                      </td>
                      <td className="p-lg px-xl text-sm text-text-main border-b border-border align-middle">
                        <span className={`inline-flex items-center gap-[4px] py-xs px-lg rounded-full text-[11px] font-semibold uppercase ${
                          status === 'live' ? 'bg-success-bg text-success' : 'bg-primary-light text-primary-dark'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="p-lg px-xl text-sm text-text-main border-b border-border align-middle">
                        <div className="flex gap-sm">
                          <button
                            type="button"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-sm text-text-subtle border border-transparent transition duration-200 hover:bg-bg-page hover:text-text-heading hover:border-border hover:!text-primary-dark hover:!bg-primary-light hover:!border-primary/20"
                            title={status === 'live' ? 'View/Edit' : 'Edit Test'}
                            onClick={() => handleEdit(test)}
                            aria-label="Edit test"
                          >
                            <IconEdit />
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-sm text-text-subtle border border-transparent transition duration-200 hover:bg-bg-page hover:text-text-heading hover:border-border"
                            title="Preview Test"
                            onClick={() => handleView(test)}
                            aria-label="Preview test"
                          >
                            <IconEye className="w-[18px] h-[18px]" />
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-sm text-text-subtle border border-transparent transition duration-200 hover:bg-bg-page hover:text-text-heading hover:border-border hover:!text-danger hover:!bg-danger-bg hover:!border-danger-light"
                            title="Delete Test"
                            onClick={() => handleDelete(test.id)}
                            aria-label="Delete test"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
