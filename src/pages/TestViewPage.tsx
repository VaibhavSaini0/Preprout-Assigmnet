import { useRef, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import TestInfoCard from '../components/TestInfoCard';
import QuestionPanel from '../components/QuestionPanel';
import { SelectField, TextAreaField, InputField } from '../components/ui/FormField';
import { useQuestionEditor } from '../hooks/useQuestionEditor';
import {
  IconTrash,
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
} from '../components/icons/Icons';

const EDITOR_TOOLS = [
  { label: 'B', title: 'Bold (coming soon)' },
  { label: 'I', title: 'Italic (coming soon)' },
  { label: 'U', title: 'Underline (coming soon)' },
  { label: '≡', title: 'Align (coming soon)' },
  { label: '•', title: 'List (coming soon)' },
];

export default function TestViewPage() {
  const {
    navigate,
    currentTest,
    currentQuestions,
    loading,
    activeIndex,
    questionText,
    setQuestionText,
    option1,
    setOption1,
    option2,
    setOption2,
    option3,
    setOption3,
    option4,
    setOption4,
    correctOption,
    setCorrectOption,
    explanation,
    setExplanation,
    qDifficulty,
    setQDifficulty,
    qTopicId,
    setQTopicId,
    qSubTopicId,
    setQSubTopicId,
    mediaUrl,
    setMediaUrl,
    testTopics,
    testSubTopics,
    pageError,
    pageLoading,
    deleteConfirm,
    setDeleteConfirm,
    handleSelectQuestion,
    handleAddNewQuestion,
    confirmDeleteQuestion,
    executeDeleteQuestion,
    handleClearForm,
    handleDeleteAllEdits,
    executeReset,
    handleSaveAndContinue,
    handleCSVUpload,
    handleFormatText,
  } = useQuestionEditor();

  const editorRef = useRef<HTMLDivElement>(null);

  // Sync contentEditable innerHTML with questionText state natively
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== questionText) {
      editorRef.current.innerHTML = questionText;
    }
  }, [questionText, activeIndex]);

  if (pageLoading) {
    return (
      <AppLayout>
        <Spinner label="Loading test..." className="py-32" />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      showQuestionPanel
      questionPanel={
        <QuestionPanel
          questions={currentQuestions}
          activeIndex={activeIndex}
          onSelect={handleSelectQuestion}
          onDelete={(idx, e) => { e.stopPropagation(); confirmDeleteQuestion(idx); }}
          onAddNew={handleAddNewQuestion}
          totalQuestionsExpected={currentTest?.total_questions || 50}
        />
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-lg mb-xl">
        <Breadcrumbs
          items={[
            { label: 'Test Creation', to: '/create-test' },
            { label: 'Create Test', to: '/create-test' },
            { label: currentTest?.name || 'Questions' },
          ]}
        />
        <Button onClick={handleSaveAndContinue} disabled={loading}>
          {loading ? 'Saving...' : 'Next: Preview & Publish'}
        </Button>
      </div>

      <TestInfoCard />

      {pageError && <Alert variant="error" className="mt-lg">{pageError}</Alert>}

      <section className="bg-bg-card border border-border rounded-lg p-2xl mt-xl shadow-card">
        <div className="flex items-center justify-between flex-wrap gap-md mb-lg">
          <h2 className="text-lg font-semibold text-primary">
            Question {(activeIndex !== null ? activeIndex + 1 : 0)} / {currentQuestions.length}
          </h2>
          <div className="flex gap-sm items-center">
            <button
              type="button"
              className="flex items-center gap-xs px-lg py-sm border border-primary/30 rounded-md text-sm font-medium text-primary-dark bg-primary-light hover:bg-primary/20 transition duration-150"
              onClick={handleAddNewQuestion}
            >
              + MCQ
            </button>
            <button
              type="button"
              className="flex items-center gap-xs px-lg py-sm border border-border rounded-md text-sm font-medium text-text-main hover:bg-bg-page transition duration-150"
              onClick={() => document.getElementById('csv-file-input')?.click()}
              title="Upload questions from a CSV file"
            >
              📤 Upload CSV
            </button>
            <input
              id="csv-file-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  const text = event.target?.result as string;
                  if (text) handleCSVUpload(text);
                };
                reader.readAsText(file);
                e.target.value = ''; // Reset input to allow uploading same file
              }}
            />
          </div>
        </div>

        <button
          type="button"
          className="flex items-center gap-xs text-sm text-danger mb-lg hover:underline"
          onClick={handleDeleteAllEdits}
        >
          <IconTrash width={14} height={14} /> Reset Question Edits
        </button>

        <div className="flex flex-wrap gap-xs p-sm border border-border border-b-0 rounded-t-md bg-bg-page">
          {[
            { label: 'B', title: 'Bold', cmd: 'bold' },
            { label: 'I', title: 'Italic', cmd: 'italic' },
            { label: 'U', title: 'Underline', cmd: 'underline' },
          ].map(({ label, title, cmd }) => (
            <button
              key={label}
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-md text-sm font-semibold text-text-main hover:bg-bg-tab-active hover:text-primary-dark transition duration-150"
              onClick={() => handleFormatText(cmd)}
              title={title}
            >
              {label}
            </button>
          ))}
          {EDITOR_TOOLS.slice(3).map(({ label, title }) => (
            <button
              key={label}
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-sm text-sm font-semibold text-text-subtle cursor-not-allowed opacity-50"
              disabled
              title={title}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative mb-xl">
          <div
            ref={editorRef}
            contentEditable
            onInput={(e) => setQuestionText(e.currentTarget.innerHTML)}
            onBlur={(e) => setQuestionText(e.currentTarget.innerHTML)}
            className="w-full min-h-[140px] max-h-[280px] p-lg pr-[48px] border border-border rounded-b-md outline-none text-base focus:border-primary focus:shadow-[0_0_0_3px_rgba(89,136,239,0.12)] transition-shadow bg-bg-card overflow-y-auto"
          />
          <button
            type="button"
            className="absolute bottom-md right-md text-text-subtle p-xs hover:text-danger transition-colors z-10"
            onClick={handleClearForm}
            aria-label="Clear form"
          >
            <IconTrash />
          </button>
        </div>

        <InputField
          label="Media URL (optional)"
          placeholder="https://example.com/image.png"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          disabled={loading}
          className="mb-xl"
        />

        <p className="text-sm font-medium text-text-main mb-md">Type options below & select the correct answer</p>
        <div className="flex flex-col gap-md mb-xl">
          {[
            { id: 'option1', val: option1, setVal: setOption1, letter: 'A' },
            { id: 'option2', val: option2, setVal: setOption2, letter: 'B' },
            { id: 'option3', val: option3, setVal: setOption3, letter: 'C' },
            { id: 'option4', val: option4, setVal: setOption4, letter: 'D' },
          ].map(({ id: optId, val, setVal, letter }) => {
            const isCorrect = correctOption === optId;
            return (
              <div key={optId} className="flex items-center gap-md">
                <button
                  type="button"
                  className={`w-7 h-7 border-2 rounded-full shrink-0 flex items-center justify-center transition-all duration-150 ${
                    isCorrect ? 'bg-success border-success text-white' : 'border-border-input hover:border-primary'
                  }`}
                  onClick={() => setCorrectOption(optId)}
                  title="Mark as correct answer"
                >
                  {isCorrect ? <IconCheck width={12} height={12} /> : <span className="text-xs font-semibold text-text-subtle">{letter}</span>}
                </button>
                <input
                  type="text"
                  placeholder={`Option ${letter}`}
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  disabled={loading}
                  className={`flex-1 h-input px-lg border rounded-md outline-none focus:border-primary transition-all ${
                    isCorrect ? 'border-success bg-success-bg/30' : 'border-border-input'
                  }`}
                />
                <button type="button" className="text-text-subtle p-sm hover:text-danger transition-colors" onClick={() => setVal('')}>
                  <IconTrash width={14} height={14} />
                </button>
              </div>
            );
          })}
        </div>

        <TextAreaField
          label="Add Solution / Explanation"
          placeholder="Explain the solution here..."
          rows={3}
          value={explanation}
          onChange={setExplanation}
        />

        <div className="flex justify-center gap-md mt-xl">
          <button
            type="button"
            disabled={activeIndex === null || activeIndex === 0}
            onClick={() => activeIndex !== null && handleSelectQuestion(activeIndex - 1)}
            className="h-9 flex items-center gap-xs px-lg border border-border rounded-md text-text-subtle text-xs font-medium hover:enabled:bg-bg-tab-active hover:enabled:text-primary disabled:opacity-40 transition-colors"
          >
            <IconChevronLeft /> Previous
          </button>
          <button
            type="button"
            disabled={activeIndex === null || activeIndex === currentQuestions.length - 1}
            onClick={() => activeIndex !== null && handleSelectQuestion(activeIndex + 1)}
            className="h-9 flex items-center gap-xs px-lg border border-border rounded-md text-text-subtle text-xs font-medium hover:enabled:bg-bg-tab-active hover:enabled:text-primary disabled:opacity-40 transition-colors"
          >
            Next <IconChevronRight />
          </button>
        </div>
      </section>

      <section className="bg-bg-card border border-border rounded-lg p-2xl mt-xl shadow-card">
        <h3 className="text-base font-semibold text-text-heading mb-lg">Question settings</h3>
        <div className="grid grid-cols-3 gap-xl max-lg:grid-cols-1">
          <SelectField
            label="Level of Difficulty"
            value={qDifficulty}
            onChange={setQDifficulty}
            options={[
              { value: 'easy', label: 'Easy' },
              { value: 'medium', label: 'Medium' },
              { value: 'hard', label: 'Difficult' },
            ]}
          />
          <SelectField
            label="Topic"
            value={qTopicId}
            onChange={setQTopicId}
            options={testTopics.map((t) => ({ value: t.id, label: t.name }))}
            placeholder="Select Topic"
          />
          <SelectField
            label="Sub-topic"
            value={qSubTopicId}
            onChange={setQSubTopicId}
            options={testSubTopics.map((st) => ({ value: st.id, label: st.name }))}
            placeholder="Select Sub-topic"
          />
        </div>
      </section>

      <div className="flex justify-between items-center mt-xl mb-0 gap-md max-sm:flex-col [&_button]:max-sm:w-full">
        <Button variant="danger" onClick={() => navigate('/dashboard')} disabled={loading}>
          Exit Test Creation
        </Button>
        <Button onClick={handleSaveAndContinue} disabled={loading}>
          {loading ? 'Saving...' : 'Next: Preview & Publish'}
        </Button>
      </div>

      <ConfirmDialog
        open={deleteConfirm?.type === 'question'}
        title="Delete Question"
        message={`Are you sure you want to delete Question ${(deleteConfirm?.index ?? 0) + 1}?`}
        confirmLabel="Delete"
        onConfirm={executeDeleteQuestion}
        onCancel={() => setDeleteConfirm(null)}
      />
      <ConfirmDialog
        open={deleteConfirm?.type === 'reset'}
        title="Reset Question"
        message="This will clear all content for the current question. Continue?"
        confirmLabel="Reset"
        onConfirm={executeReset}
        onCancel={() => setDeleteConfirm(null)}
      />
    </AppLayout>
  );
}
