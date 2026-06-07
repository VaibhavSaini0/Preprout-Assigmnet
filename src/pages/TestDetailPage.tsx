import AppLayout from '../components/layout/AppLayout';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import TestInfoCard from '../components/TestInfoCard';
import QuestionPreview from '../components/QuestionPreview';
import { useTestDetail } from '../hooks/useTestDetail';
import { IconChevronDown, IconEdit, IconTrash } from '../components/icons/Icons';

const STATUS_STYLES: Record<string, string> = {
  live: 'bg-success-bg text-success',
  draft: 'bg-primary-light text-primary-dark',
};

export default function TestDetailPage() {
  const {
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
  } = useTestDetail();

  if (pageLoading) {
    return (
      <AppLayout>
        <Spinner label="Loading test..." className="py-32" />
      </AppLayout>
    );
  }

  if (!currentTest) {
    return (
      <AppLayout>
        <Alert variant="error" className="mb-lg">{apiError || 'Test not found.'}</Alert>
        <Button variant="secondary" onClick={() => navigate('/tracking')}>
          Back to Test Tracking
        </Button>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-wrap items-center justify-between gap-lg mb-xl">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'Test Tracking', to: '/tracking' },
            { label: currentTest.name },
          ]}
        />
        <div className="flex flex-wrap items-center gap-sm">
          <Button variant="secondary" onClick={goToEditTest}>
            <span className="inline-flex items-center gap-xs">
              <IconEdit width={16} height={16} /> Edit Test
            </span>
          </Button>
          <Button variant="secondary" onClick={goToEditQuestions}>
            Edit Questions
          </Button>
          <Button variant="danger" onClick={() => setDeleteConfirm(true)} disabled={deleting}>
            <span className="inline-flex items-center gap-xs">
              <IconTrash width={16} height={16} /> Delete
            </span>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-md mb-xl">
        <h1 className="text-2xl font-semibold text-text-heading">{currentTest.name}</h1>
        <span
          className={`inline-flex items-center gap-xs text-xs font-semibold uppercase tracking-wide px-md py-[4px] rounded-full ${
            STATUS_STYLES[status] || STATUS_STYLES.draft
          }`}
        >
          {status}
        </span>
        <span className="text-sm text-text-subtle">
          {testTypeLabel} · {questionCount} question{questionCount !== 1 ? 's' : ''}
        </span>
      </div>

      {apiError && <Alert variant="error" className="mb-lg">{apiError}</Alert>}

      <TestInfoCard showEdit onEdit={goToEditTest} />

      <section className="bg-bg-card border border-border rounded-lg mt-xl shadow-card overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between p-xl px-2xl text-left hover:bg-bg-page/50 transition-colors"
          onClick={() => setShowPreview((v) => !v)}
        >
          <h3 className="text-base font-semibold text-text-heading">
            Questions ({questionCount})
          </h3>
          <IconChevronDown
            className={`text-text-subtle transition-transform duration-200 ${showPreview ? 'rotate-180' : ''}`}
          />
        </button>
        {showPreview && (
          <div className="px-2xl pb-2xl border-t border-border pt-xl">
            <QuestionPreview questions={currentQuestions} />
          </div>
        )}
      </section>

      {status === 'draft' && (
        <div className="flex justify-end mt-2xl">
          <Button onClick={() => navigate(`/confirmation/${id}`)}>
            Continue to Publish
          </Button>
        </div>
      )}

      <div className="flex justify-start mt-xl">
        <Button variant="secondary" onClick={() => navigate('/tracking')}>
          Back to Test Tracking
        </Button>
      </div>

      <ConfirmDialog
        open={deleteConfirm}
        title="Delete Test"
        message={`Are you sure you want to delete "${currentTest.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(false)}
      />
    </AppLayout>
  );
}
