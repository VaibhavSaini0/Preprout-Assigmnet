import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import TestInfoCard from '../components/TestInfoCard';
import QuestionPanel from '../components/QuestionPanel';
import { useTestContext } from '../context/TestContext';
import { apiService } from '../services/api';
import {
  IconCheck,
  IconCalendar,
  IconChevronDown,
} from '../components/icons/Icons';

const LIVE_UNTIL_OPTIONS = [
  ['Always Available', '1 Week', '2 Weeks'],
  ['3 Weeks', '1 Month', 'Custom Duration'],
];

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentTest, currentQuestions, loadTestAndQuestions } = useTestContext();

  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now');
  const [liveUntil, setLiveUntil] = useState('Always Available');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      loadTestAndQuestions(id);
    }
  }, [id, loadTestAndQuestions]);

  const handlePublish = async () => {
    if (!id) return;
    setLoading(true);
    setApiError(null);
    try {
      await apiService.publishTest(id);
      setPublishSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to publish test.';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = currentQuestions.length;
  const expectedCount = currentTest?.total_questions || completedCount;
  const allDone = completedCount > 0 && completedCount >= expectedCount;

  return (
    <AppLayout
      showQuestionPanel
      questionPanel={
        <QuestionPanel
          questions={currentQuestions}
          activeIndex={null}
          onSelect={() => undefined}
          onDelete={() => undefined}
          onAddNew={() => navigate(`/test-view/${id}`)}
          totalQuestionsExpected={expectedCount}
          readOnly
        />
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-lg mb-xl">
        <Breadcrumbs
          items={[
            { label: 'Test creation', to: '/dashboard' },
            { label: 'Create mock test', to: '/create-test' },
            { label: currentTest?.name || 'Preview' },
          ]}
        />
        <Button onClick={handlePublish} disabled={loading || publishSuccess}>
          {loading ? 'Publishing...' : 'Publish'}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-md mb-xl">
        <h2 className="text-lg font-semibold text-text-heading">Test created</h2>
        <span className="inline-flex items-center gap-sm bg-success-bg text-success text-sm font-semibold py-[6px] px-[14px] rounded-full">
          <IconCheck /> {allDone ? `All ${expectedCount} Questions done` : `${completedCount} Questions added`}
        </span>
      </div>

      {apiError && <Alert variant="error" className="mb-lg">{apiError}</Alert>}
      {publishSuccess && (
        <Alert variant="success" className="mb-lg">Test published successfully! Redirecting to dashboard...</Alert>
      )}

      <TestInfoCard showEdit />

      <section className="bg-bg-card border border-border rounded-lg p-2xl mt-xl">
        <h3 className="text-base font-semibold text-text-heading mb-lg">Publish Settings</h3>
        <div className="inline-flex bg-bg-sidebar-icon rounded-md p-[3px] mb-2xl">
          <button
            type="button"
            className={`py-2.5 px-6 rounded-sm text-sm font-medium transition duration-150 ${
              publishMode === 'now' ? 'bg-bg-card text-text-heading shadow-sm' : 'text-text-subtle'
            }`}
            onClick={() => setPublishMode('now')}
          >
            Publish Now
          </button>
          <button
            type="button"
            className={`py-2.5 px-6 rounded-sm text-sm font-medium transition duration-150 ${
              publishMode === 'schedule' ? 'bg-bg-card text-text-heading shadow-sm' : 'text-text-subtle'
            }`}
            onClick={() => setPublishMode('schedule')}
          >
            Schedule Publish
          </button>
        </div>

        {publishMode === 'schedule' && (
          <div className="mb-xl">
            <h3 className="text-base font-semibold text-text-heading mb-md">Select Date and Time</h3>
            <div className="grid grid-cols-2 gap-xl max-md:grid-cols-1 mb-xl">
              <div className="flex flex-col gap-sm">
                <label className="text-base font-medium text-text-main">Select Date</label>
                <div className="relative flex items-center w-full">
                  <input type="date" className="w-full h-input px-lg bg-bg-card border border-border-input rounded-md text-sm text-text-main font-medium outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(89,136,239,0.15)]" defaultValue="2026-06-05" />
                  <IconCalendar className="absolute right-4 pointer-events-none text-text-subtle" />
                </div>
              </div>
              <div className="flex flex-col gap-sm">
                <label className="text-base font-medium text-text-main">Select Time</label>
                <div className="relative flex items-center w-full">
                  <input type="time" className="w-full h-input px-lg bg-bg-card border border-border-input rounded-md text-sm text-text-main font-medium outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(89,136,239,0.15)]" defaultValue="10:00" />
                  <IconChevronDown className="absolute right-4 pointer-events-none text-text-subtle" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-xl">
          <h3 className="text-base font-semibold text-text-heading mb-xs">Live Until</h3>
          <p className="text-sm text-text-subtle mb-xl">
            Choose how long this test should remain available on the platform.
          </p>

          <div className="grid grid-cols-2 gap-x-2xl gap-y-lg mb-xl max-md:grid-cols-1">
            {LIVE_UNTIL_OPTIONS.flat().map((opt) => (
              <label key={opt} className="flex items-center gap-sm text-base font-medium cursor-pointer relative">
                <input
                  type="radio"
                  name="liveUntil"
                  value={opt}
                  checked={liveUntil === opt}
                  onChange={() => setLiveUntil(opt)}
                  className="peer absolute opacity-0 w-0 h-0"
                />
                <span className="w-[20px] h-[20px] border-2 border-border-input rounded-full shrink-0 relative transition duration-150 peer-checked:border-primary peer-checked:after:content-[''] peer-checked:after:absolute peer-checked:after:top-1/2 peer-checked:after:left-1/2 peer-checked:after:-translate-x-1/2 peer-checked:after:-translate-y-1/2 peer-checked:after:w-[10px] peer-checked:after:h-[10px] peer-checked:after:bg-primary peer-checked:after:rounded-full" />
                {opt}
              </label>
            ))}
          </div>

          {liveUntil === 'Custom Duration' && (
            <div className="grid grid-cols-2 gap-xl max-md:grid-cols-1">
              <div className="flex flex-col gap-sm">
                <label className="text-base font-medium text-text-main">Select End Date</label>
                <div className="relative flex items-center w-full">
                  <input type="date" className="w-full h-input px-lg bg-bg-card border border-border-input rounded-md text-sm text-text-main font-medium outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(89,136,239,0.15)]" defaultValue="2026-06-12" />
                  <IconCalendar className="absolute right-4 pointer-events-none text-text-subtle" />
                </div>
              </div>
              <div className="flex flex-col gap-sm">
                <label className="text-base font-medium text-text-main">Select End Time</label>
                <div className="relative flex items-center w-full">
                  <input type="time" className="w-full h-input px-lg bg-bg-card border border-border-input rounded-md text-sm text-text-main font-medium outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(89,136,239,0.15)]" defaultValue="23:59" />
                  <IconChevronDown className="absolute right-4 pointer-events-none text-text-subtle" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="flex justify-end gap-md mt-2xl max-sm:flex-col [&_button]:max-sm:w-full">
        <Button variant="secondary" onClick={() => navigate('/dashboard')} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handlePublish} disabled={loading || publishSuccess}>
          {loading ? 'Publishing...' : 'Confirm'}
        </Button>
      </div>
    </AppLayout>
  );
}
