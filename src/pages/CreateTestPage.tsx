import AppLayout from '../components/layout/AppLayout';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Tabs from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Modal from '../components/ui/Modal';
import { FormSkeleton } from '../components/ui/FormSkeleton';
import { useTestForm } from '../hooks/useTestForm';
import {
  InputField,
  SelectField,
  RadioGroup,
  NumberStepper,
  MultiSelectField,
} from '../components/ui/FormField';
import { IconTimer, IconQuestions } from '../components/icons/Icons';

const TEST_TABS = ['Chapter Wise', 'PYQ', 'Mock Test'];

function TestCreationForm({
  loading,
  testType,
  setTestType,
  testName,
  setTestName,
  selectedSubject,
  setSelectedSubject,
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
  subjectSelectOptions,
  topicSelectOptions,
  subTopicSelectOptions,
  calculatedTotalMarks,
  errors,
}: {
  loading: boolean;
  testType: string;
  setTestType: (v: string) => void;
  testName: string;
  setTestName: (v: string) => void;
  selectedSubject: string;
  setSelectedSubject: (v: string) => void;
  selectedTopics: string[];
  setSelectedTopics: (v: string[]) => void;
  selectedSubTopics: string[];
  setSelectedSubTopics: (v: string[]) => void;
  difficulty: string;
  setDifficulty: (v: string) => void;
  wrongAnswer: number;
  setWrongAnswer: (v: number) => void;
  unattempted: number;
  setUnattempted: (v: number) => void;
  correctAnswer: number;
  setCorrectAnswer: (v: number) => void;
  totalQuestions: number;
  setTotalQuestions: (v: number) => void;
  duration: number;
  setDuration: (v: number) => void;
  subjectSelectOptions: { value: string; label: string }[];
  topicSelectOptions: { value: string; label: string }[];
  subTopicSelectOptions: { value: string; label: string }[];
  calculatedTotalMarks: number;
  errors: Record<string, string>;
}) {
  return (
    <>
      <div className="mb-xl">
        <Tabs tabs={TEST_TABS} activeTab={testType} onChange={setTestType} />
      </div>

      {loading ? (
        <FormSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-x-2xl gap-y-xl mb-2xl max-md:grid-cols-1">
            <SelectField
              label="Subject"
              value={selectedSubject}
              onChange={setSelectedSubject}
              options={subjectSelectOptions}
              placeholder="Choose from Drop-down"
              disabled={loading}
              error={errors.subject}
            />
            <InputField
              label="Name of Test"
              placeholder="Enter name of Test"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              error={errors.testName}
              disabled={loading}
            />
            <MultiSelectField
              label="Topic"
              selectedValues={selectedTopics}
              onChange={setSelectedTopics}
              options={topicSelectOptions}
              placeholder={selectedSubject ? 'Choose from Drop-down' : 'First select a subject'}
              disabled={loading || !selectedSubject}
              error={errors.topics}
            />
            <MultiSelectField
              label="Sub Topic"
              selectedValues={selectedSubTopics}
              onChange={setSelectedSubTopics}
              options={subTopicSelectOptions}
              placeholder={selectedTopics.length > 0 ? 'Choose from Drop-down' : 'First select topics'}
              disabled={loading || selectedTopics.length === 0}
            />
            <InputField
              label="Duration (Minutes)"
              type="number"
              placeholder="Enter the time"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              error={errors.duration}
              disabled={loading}
            />
            <RadioGroup
              label="Test Difficulty Level"
              name="difficulty"
              options={['Easy', 'Medium', 'Difficult']}
              value={difficulty}
              onChange={setDifficulty}
            />
          </div>

          <div>
            <h3 className="text-base font-semibold text-text-heading mb-lg">Marking Scheme</h3>
            <div className="grid grid-cols-5 gap-lg max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
              <NumberStepper label="Wrong Answer" value={wrongAnswer} onChange={setWrongAnswer} />
              <NumberStepper label="Unattempted" value={unattempted} onChange={setUnattempted} />
              <NumberStepper label="Correct Answer" value={correctAnswer} onChange={setCorrectAnswer} />
              <InputField
                label="No of Questions"
                type="number"
                placeholder="Ex: 50"
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                error={errors.totalQuestions}
                disabled={loading}
              />
              <InputField
                label="Total Marks"
                placeholder="Ex: 250 Marks"
                value={`${calculatedTotalMarks} Marks`}
                disabled
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default function CreateTestPage() {
  const {
    navigate,
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
  } = useTestForm();

  const formProps = {
    loading: initialLoading,
    testType,
    setTestType,
    testName,
    setTestName,
    selectedSubject,
    setSelectedSubject,
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
    subjectSelectOptions: subjects.map((s) => ({ value: s.id, label: s.name })),
    topicSelectOptions: topicsOptions.map((t) => ({ value: t.id, label: t.name })),
    subTopicSelectOptions: subTopicsOptions.map((st) => ({ value: st.id, label: st.name })),
    calculatedTotalMarks,
    errors,
  };

  const footerActions = (
    <div className="flex items-center justify-end gap-md pt-xl mt-xl border-t border-border max-sm:flex-col [&_button]:max-sm:w-full">
      <Button
        variant="secondary"
        onClick={() => (isEditing ? goBack() : navigate('/dashboard'))}
        disabled={loading}
      >
        Cancel
      </Button>
      {!isEditing && (
        <Button variant="ghost" onClick={handleSaveAsDraft} disabled={loading || initialLoading}>
          {loading ? 'Saving...' : 'Save as Draft'}
        </Button>
      )}
      <Button onClick={isEditing ? handleSaveAsDraft : handleNext} disabled={loading || initialLoading}>
        {loading ? 'Saving...' : isEditing ? 'Save' : 'Next'}
      </Button>
    </div>
  );

  if (isEditing) {
    return (
      <AppLayout>
        <Breadcrumbs
          items={[
            { label: 'Test Tracking', to: '/tracking' },
            { label: 'Edit Test' },
          ]}
        />
        <Modal open onClose={goBack} title="Edit Test" size="xl">
          {apiError && <Alert variant="error" className="mb-lg">{apiError}</Alert>}
          <TestCreationForm {...formProps} />
          {footerActions}
        </Modal>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-row items-start justify-between gap-lg mb-xl flex-wrap max-md:flex-col">
        <Breadcrumbs
          items={[
            { label: 'Test Creation', to: '/create-test' },
            { label: 'Create Test', to: '/create-test' },
            { label: testType },
          ]}
        />
        <div className="flex items-center gap-sm h-input px-lg bg-bg-card border border-border-input rounded-md text-sm font-medium text-text-main shadow-sm">
          <IconTimer className="text-primary" />
          <span>{duration} min</span>
          <span className="text-border-input mx-xs">|</span>
          <IconQuestions className="text-primary" />
          <span>{totalQuestions} Q&apos;s</span>
        </div>
      </div>

      {apiError && <Alert variant="error" className="mb-lg">{apiError}</Alert>}

      <div className="bg-bg-card border border-border rounded-lg p-2xl shadow-card">
        <TestCreationForm {...formProps} />
        {footerActions}
      </div>
    </AppLayout>
  );
}
