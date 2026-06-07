import AppLayout from '../components/layout/AppLayout';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useDashboard } from '../hooks/useDashboard';
import {
  IconSearch,
  IconEdit,
  IconTrash,
  IconEye,
  IconTimer,
  IconQuestions,
  IconTestCreation,
  IconMarks,
} from '../components/icons/Icons';

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  medium: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  difficult: 'bg-red-50 text-red-600 ring-1 ring-red-200',
  hard: 'bg-red-50 text-red-600 ring-1 ring-red-200',
};

const STATUS_STYLES: Record<string, string> = {
  live: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  draft: 'bg-primary-light text-primary-dark ring-1 ring-primary/20',
};

const TABLE_HEADERS = [
  'Test Details',
  'Created',
  'Difficulty',
  'Marking',
  'Questions',
  'Duration',
  'Status',
  'Actions',
];

export default function TestTrackingPage() {
  const {
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
    fetchTests,
    handleDelete,
    handleCreateNew,
  } = useDashboard();

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-2xl">
        <Breadcrumbs items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Test Tracking' }]} />
        <div className="flex items-end justify-between mt-md gap-lg flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-text-heading">Test Tracking</h1>
            <p className="text-sm text-text-subtle mt-xs">
              Track, search, and manage all test instances in real-time
            </p>
          </div>
          <Button onClick={handleCreateNew}>+ Create New Test</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-md mb-xl flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-sm bg-bg-card border border-border-input rounded-lg px-lg h-[42px] w-[260px] transition duration-200 focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(89,136,239,0.12)] max-md:w-full">
          <IconSearch className="w-4 h-4 text-text-subtle shrink-0" />
          <input
            type="text"
            placeholder="Search tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-none bg-transparent outline-none text-sm w-full text-text-main placeholder:text-text-subtle"
            aria-label="Search tests"
          />
        </div>

        {/* Subject filter */}
        <select
          className="h-[42px] px-lg border border-border-input rounded-lg bg-bg-card text-text-main outline-none text-sm cursor-pointer min-w-[150px] transition duration-200 focus:border-primary focus:shadow-[0_0_0_3px_rgba(89,136,239,0.12)] max-md:w-full"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          aria-label="Filter by Subject"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          className="h-[42px] px-lg border border-border-input rounded-lg bg-bg-card text-text-main outline-none text-sm cursor-pointer min-w-[140px] transition duration-200 focus:border-primary focus:shadow-[0_0_0_3px_rgba(89,136,239,0.12)] max-md:w-full"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          aria-label="Filter by Status"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="live">Live</option>
        </select>

        {/* Result count */}
        {!loading && !error && (
          <span className="ml-auto text-xs text-text-subtle font-medium">
            {filteredTests.length} test{filteredTests.length !== 1 ? 's' : ''} found
          </span>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-bg-card border border-border rounded-xl shadow-card overflow-hidden">
        {loading ? (
          <Spinner label="Loading tests..." className="py-20" />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-[60px] px-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-danger-bg flex items-center justify-center mb-lg">
              <span className="text-danger text-2xl">!</span>
            </div>
            <p className="text-danger font-medium mb-lg">{error}</p>
            <Button onClick={fetchTests}>Retry</Button>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[72px] px-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mb-lg shadow-sm">
              <IconTestCreation className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text-heading mb-xs">No tests found</h3>
            <p className="text-text-subtle text-sm mb-2xl max-w-[380px] leading-relaxed">
              {tests.length === 0
                ? 'Get started by creating your first test and adding questions.'
                : 'No tests match your current filters. Try adjusting or clearing them.'}
            </p>
            {tests.length === 0 && (
              <Button onClick={handleCreateNew}>Create First Test</Button>
            )}
          </div>
        ) : (
          <div
            className="overflow-x-auto custom-scrollbar"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}
          >
            <table className="w-full border-collapse text-left min-w-[780px]">
              <thead>
                <tr className="bg-bg-page/80 border-b border-border">
                  {TABLE_HEADERS.map((h) => (
                    <th
                      key={h}
                      className="py-md px-xl text-[11px] font-bold uppercase tracking-widest text-text-subtle whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTests.map((test, idx) => {
                  const subjectName = subjectMap[test.subject] || test.subject || 'Unknown';
                  const status = (test.status || 'draft').toLowerCase();
                  const difficulty = (test.difficulty || 'medium').toLowerCase();
                  const isEven = idx % 2 === 0;

                  return (
                    <tr
                      key={test.id}
                      className={`group transition-colors duration-100 hover:bg-primary-light/30 ${isEven ? '' : 'bg-bg-page/30'}`}
                    >
                      {/* Test Details */}
                      <td className="py-md px-xl align-middle">
                        <div className="flex items-start gap-sm">
                          <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center shrink-0 mt-[1px]">
                            <IconTestCreation className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold text-text-heading text-sm leading-snug max-w-[220px] truncate">
                              {test.name}
                            </div>
                            <div className="text-xs text-text-subtle mt-[2px]">{subjectName}</div>
                          </div>
                        </div>
                      </td>

                      {/* Created */}
                      <td className="py-md px-xl align-middle whitespace-nowrap">
                        <span className="text-xs text-text-subtle">
                          {test.created_at
                            ? new Date(test.created_at).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </span>
                      </td>

                      {/* Difficulty */}
                      <td className="py-md px-xl align-middle">
                        <span
                          className={`inline-flex items-center px-md py-[3px] rounded-full text-[11px] font-semibold uppercase tracking-wide ${
                            DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES.medium
                          }`}
                        >
                          {difficulty}
                        </span>
                      </td>

                      {/* Marking */}
                      <td className="py-md px-xl align-middle whitespace-nowrap">
                        <div className="flex items-center gap-xs">
                          <IconMarks className="w-3.5 h-3.5 text-text-subtle shrink-0" />
                          <span className="text-xs text-text-main font-medium">
                            <span className="text-success font-semibold">+{test.correct_marks}</span>
                            <span className="text-text-subtle mx-[3px]">/</span>
                            <span className="text-danger font-semibold">{test.wrong_marks}</span>
                            <span className="text-text-subtle mx-[3px]">/</span>
                            <span className="text-text-subtle">{test.unattempt_marks}</span>
                          </span>
                        </div>
                      </td>

                      {/* Questions */}
                      <td className="py-md px-xl align-middle whitespace-nowrap">
                        <div className="flex items-center gap-xs text-xs text-text-main font-medium">
                          <IconQuestions className="w-3.5 h-3.5 text-text-subtle" />
                          {test.total_questions || 0}
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-md px-xl align-middle whitespace-nowrap">
                        <div className="flex items-center gap-xs text-xs text-text-main font-medium">
                          <IconTimer className="w-3.5 h-3.5 text-text-subtle" />
                          {test.total_time} min
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-md px-xl align-middle">
                        <span
                          className={`inline-flex items-center gap-xs px-md py-[3px] rounded-full text-[11px] font-semibold uppercase tracking-wide ${
                            STATUS_STYLES[status] || STATUS_STYLES.draft
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${status === 'live' ? 'bg-emerald-500' : 'bg-primary'}`}
                          />
                          {status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-md px-xl align-middle">
                        <div className="flex items-center gap-xs opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-text-subtle transition duration-150 hover:bg-primary-light hover:text-primary-dark"
                            title="Edit test"
                            onClick={() =>
                              navigate(`/edit-test/${test.id}`, { state: { from: '/tracking' } })
                            }
                            aria-label="Edit test"
                          >
                            <IconEdit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-text-subtle transition duration-150 hover:bg-bg-tab-active hover:text-text-heading"
                            title="View test"
                            onClick={() => navigate(`/view-test/${test.id}`)}
                            aria-label="View test"
                          >
                            <IconEye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-text-subtle transition duration-150 hover:bg-danger-bg hover:text-danger"
                            title="Delete test"
                            onClick={() => setDeleteTarget(test)}
                            aria-label="Delete test"
                          >
                            <IconTrash className="w-4 h-4" />
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

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Test"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppLayout>
  );
}
