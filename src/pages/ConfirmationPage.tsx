import AppLayout from '../components/layout/AppLayout';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import TestInfoCard from '../components/TestInfoCard';
import QuestionPanel from '../components/QuestionPanel';
import QuestionPreview from '../components/QuestionPreview';
import { useTestPreview } from '../hooks/useTestPreview';
import { IconCheck, IconCalendar, IconChevronDown } from '../components/icons/Icons';

const LIVE_UNTIL_OPTIONS = [
  ['Always Available', '1 Week', '2 Weeks'],
  ['3 Weeks', '1 Month', 'Custom Duration'],
];

export default function ConfirmationPage() {
  const {
    navigate,
    id,
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
  } = useTestPreview();

  if (pageLoading) {
    return (
      <AppLayout>
        <Spinner label="Loading preview..." className="py-32" />
      </AppLayout>
    );
  }

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
            { label: 'Test Creation', to: '/dashboard' },
            { label: testTypeLabel, to: '/create-test' },
            { label: 'Preview & Publish' },
          ]}
        />
        <Button onClick={handlePublish} disabled={loading || publishSuccess || !allDone}>
          {loading ? 'Publishing...' : 'Publish'}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-md mb-xl">
        <h2 className="text-xl font-semibold text-text-heading">Test created</h2>
        <span className={`inline-flex items-center gap-sm text-sm font-semibold py-[6px] px-[14px] rounded-full ${
          allDone ? 'bg-success-bg text-success' : 'bg-[#fef3c7] text-[#d97706]'
        }`}>
          <IconCheck width={14} height={14} />
          {allDone ? `All ${expectedCount} Questions done` : `${completedCount} of ${expectedCount} Questions`}
        </span>
      </div>

      {apiError && <Alert variant="error" className="mb-lg">{apiError}</Alert>}
      {publishSuccess && (
        <Alert variant="success" className="mb-lg">Test published successfully! Redirecting to dashboard...</Alert>
      )}
      {!allDone && (
        <Alert variant="info" className="mb-lg">
          Add all {expectedCount} questions before publishing.{' '}
          <button type="button" className="underline font-semibold" onClick={() => navigate(`/test-view/${id}`)}>
            Go to question editor
          </button>
        </Alert>
      )}

      <TestInfoCard showEdit />

      <section className="bg-bg-card border border-border rounded-lg mt-xl shadow-card overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between p-xl px-2xl text-left hover:bg-bg-page/50 transition-colors"
          onClick={() => setShowPreview((v) => !v)}
        >
          <h3 className="text-base font-semibold text-text-heading">
            Question Preview ({completedCount})
          </h3>
          <IconChevronDown className={`text-text-subtle transition-transform duration-200 ${showPreview ? 'rotate-180' : ''}`} />
        </button>
        {showPreview && (
          <div className="px-2xl pb-2xl border-t border-border pt-xl">
            <QuestionPreview questions={currentQuestions} />
          </div>
        )}
      </section>

      <section className="bg-bg-card border border-border rounded-lg p-2xl mt-xl shadow-card">
        <h3 className="text-base font-semibold text-text-heading mb-lg">Publish Settings</h3>

        <div className="inline-flex bg-bg-page rounded-md p-[3px] mb-2xl border border-border">
          {(['now', 'schedule'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              className={`py-2.5 px-6 rounded-sm text-sm font-medium transition duration-150 ${
                publishMode === mode
                  ? 'bg-bg-card text-text-heading shadow-sm border border-border'
                  : 'text-text-subtle hover:text-text-main'
              }`}
              onClick={() => setPublishMode(mode)}
            >
              {mode === 'now' ? 'Publish Now' : 'Schedule Publish'}
            </button>
          ))}
        </div>

        {publishMode === 'schedule' && (
          <div className="mb-xl animate-fade-in">
            <h4 className="text-sm font-semibold text-text-heading mb-md">Select Date and Time</h4>
            <div className="grid grid-cols-2 gap-xl max-md:grid-cols-1">
              <div className="flex flex-col gap-sm">
                <label className="text-sm font-medium text-text-main">Select Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full h-input px-lg bg-bg-card border border-border-input rounded-md text-sm outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(89,136,239,0.12)]"
                  />
                  <IconCalendar className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-subtle" />
                </div>
              </div>
              <div className="flex flex-col gap-sm">
                <label className="text-sm font-medium text-text-main">Select Time</label>
                <div className="relative">
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full h-input px-lg bg-bg-card border border-border-input rounded-md text-sm outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(89,136,239,0.12)]"
                  />
                  <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-subtle" />
                </div>
              </div>
            </div>
            <p className="text-xs text-text-subtle mt-sm">
              The test will go live automatically at the selected date and time.
            </p>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-text-heading mb-xs">Live Until</h4>
          <p className="text-sm text-text-subtle mb-xl">
            Choose how long this test should remain available on the platform.
          </p>

          <div className="grid grid-cols-2 gap-x-2xl gap-y-lg mb-xl max-md:grid-cols-1">
            {LIVE_UNTIL_OPTIONS.flat().map((opt) => (
              <label key={opt} className="flex items-center gap-sm text-sm font-medium cursor-pointer">
                <input
                  type="radio"
                  name="liveUntil"
                  value={opt}
                  checked={liveUntil === opt}
                  onChange={() => setLiveUntil(opt)}
                  className="peer sr-only"
                />
                <span className="w-[20px] h-[20px] border-2 border-border-input rounded-full shrink-0 relative transition duration-150 peer-checked:border-primary peer-checked:after:content-[''] peer-checked:after:absolute peer-checked:after:top-1/2 peer-checked:after:left-1/2 peer-checked:after:-translate-x-1/2 peer-checked:after:-translate-y-1/2 peer-checked:after:w-[10px] peer-checked:after:h-[10px] peer-checked:after:bg-primary peer-checked:after:rounded-full" />
                {opt}
              </label>
            ))}
          </div>

          {liveUntil === 'Custom Duration' && (
            <div className="grid grid-cols-2 gap-xl max-md:grid-cols-1 animate-fade-in">
              <div className="flex flex-col gap-sm">
                <label className="text-sm font-medium text-text-main">Select End Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-input px-lg bg-bg-card border border-border-input rounded-md text-sm outline-none focus:border-primary"
                  />
                  <IconCalendar className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-subtle" />
                </div>
              </div>
              <div className="flex flex-col gap-sm">
                <label className="text-sm font-medium text-text-main">Select End Time</label>
                <div className="relative">
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full h-input px-lg bg-bg-card border border-border-input rounded-md text-sm outline-none focus:border-primary"
                  />
                  <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-subtle" />
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
        <Button onClick={handlePublish} disabled={loading || publishSuccess || !allDone}>
          {loading ? 'Publishing...' : 'Confirm'}
        </Button>
      </div>
    </AppLayout>
  );
}
