import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Tabs from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { useTestContext } from '../context/TestContext';
import { apiService } from '../services/api';
import type { Topic, SubTopic, Test } from '../services/api';
import {
  InputField,
  SelectField,
  RadioGroup,
  NumberStepper,
  MultiSelectField,
} from '../components/ui/FormField';
import { IconTimer, IconQuestions, IconClose } from '../components/icons/Icons';

const TEST_TABS = ['Chapter Wise', 'PYQ', 'Mock Test'];

export default function CreateTestPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;
  const { subjects, fetchSubjects, setCurrentTest } = useTestContext();

  const isInitialLoadRef = useRef(isEditing);

  const [testName, setTestName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [testType, setTestType] = useState('Chapter Wise');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedSubTopics, setSelectedSubTopics] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState('Medium');
  const [wrongAnswer, setWrongAnswer] = useState(-1);
  const [unattempted, setUnattempted] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState(5);
  const [totalQuestions, setTotalQuestions] = useState(50);
  const [duration, setDuration] = useState(60);
  const [topicsOptions, setTopicsOptions] = useState<Topic[]>([]);
  const [subTopicsOptions, setSubTopicsOptions] = useState<SubTopic[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      const loadTestData = async () => {
        setLoading(true);
        setApiError(null);
        try {
          const test = await apiService.getTestById(id);
          setCurrentTest(test);
          setTestName(test.name);
          setSelectedSubject(test.subject);
          setTestType(
            test.type
              ? test.type.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
              : 'Chapter Wise',
          );
          setDifficulty(
            test.difficulty
              ? test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1)
              : 'Medium',
          );
          setWrongAnswer(test.wrong_marks);
          setUnattempted(test.unattempt_marks);
          setCorrectAnswer(test.correct_marks);
          setTotalQuestions(test.total_questions);
          setDuration(test.total_time);
          setSelectedTopics(test.topics || []);
          setSelectedSubTopics(test.sub_topics || []);
          setTimeout(() => {
            isInitialLoadRef.current = false;
          }, 100);
        } catch {
          setApiError('Failed to load test details for editing.');
        } finally {
          setLoading(false);
        }
      };
      loadTestData();
    }
  }, [isEditing, id, setCurrentTest]);

  useEffect(() => {
    if (selectedSubject) {
      apiService.getTopics(selectedSubject).then((topics) => {
        setTopicsOptions(topics);
        if (!isInitialLoadRef.current) {
          setSelectedTopics((prev) => prev.filter((id) => topics.some((t) => t.id === id)));
        }
      }).catch(console.error);
    } else {
      setTopicsOptions([]);
      if (!isInitialLoadRef.current) {
        setSelectedTopics([]);
      }
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedTopics.length > 0) {
      apiService.getSubTopicsMulti(selectedTopics).then((subTopics) => {
        setSubTopicsOptions(subTopics);
        if (!isInitialLoadRef.current) {
          setSelectedSubTopics((prev) => prev.filter((id) => subTopics.some((st) => st.id === id)));
        }
      }).catch(console.error);
    } else {
      setSubTopicsOptions([]);
      if (!isInitialLoadRef.current) {
        setSelectedSubTopics([]);
      }
    }
  }, [selectedTopics]);

  // Data integrity safeguard: Filter out selected subtopics that no longer belong to selected topics
  useEffect(() => {
    setSelectedSubTopics((prev) =>
      prev.filter((stId) => subTopicsOptions.some((opt) => opt.id === stId))
    );
  }, [subTopicsOptions]);


  const calculatedTotalMarks = useMemo(
    () => totalQuestions * correctAnswer,
    [totalQuestions, correctAnswer],
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!testName.trim()) newErrors.testName = 'Test name is required';
    if (!selectedSubject) newErrors.subject = 'Subject is required';
    if (selectedTopics.length === 0) newErrors.topics = 'At least one topic must be selected';
    if (duration <= 0) newErrors.duration = 'Duration must be greater than 0';
    if (totalQuestions <= 0) newErrors.totalQuestions = 'Number of questions must be greater than 0';
    if (correctAnswer <= 0) newErrors.correctAnswer = 'Correct marks must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPayload = (status: 'draft' | 'live' | null): Partial<Test> => ({
    name: testName.trim(),
    type: testType.toLowerCase(),
    subject: selectedSubject,
    topics: selectedTopics,
    sub_topics: selectedSubTopics,
    correct_marks: correctAnswer,
    wrong_marks: wrongAnswer,
    unattempt_marks: unattempted,
    difficulty: difficulty.toLowerCase(),
    total_time: duration,
    total_marks: calculatedTotalMarks,
    total_questions: totalQuestions,
    status,
  });

  const handleSaveAsDraft = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setApiError(null);
    try {
      const payload = getPayload('draft');
      if (isEditing && id) {
        await apiService.updateTest(id, payload);
      } else {
        await apiService.createTest(payload);
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save test as draft.';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setApiError(null);
    try {
      const payload = getPayload('draft');
      const savedTest =
        isEditing && id
          ? await apiService.updateTest(id, payload)
          : await apiService.createTest(payload);
      setCurrentTest(savedTest);
      navigate(`/test-view/${savedTest.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save test details.';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  const subjectSelectOptions = subjects.map((s) => ({ value: s.id, label: s.name }));
  const topicSelectOptions = topicsOptions.map((t) => ({ value: t.id, label: t.name }));
  const subTopicSelectOptions = subTopicsOptions.map((st) => ({ value: st.id, label: st.name }));

  return (
    <AppLayout>
      {isEditing ? (
        <div className="flex items-center justify-between mb-xl border-b border-border pb-md">
          <h1 className="text-lg font-semibold text-text-heading">Edit Test creation</h1>
          <button
            type="button"
            className="flex items-center justify-center w-9 h-9 rounded-full text-text-subtle bg-transparent transition-colors duration-150 hover:bg-bg-tab-active hover:text-text-heading"
            onClick={() => navigate('/dashboard')}
            aria-label="Close"
          >
            <IconClose />
          </button>
        </div>
      ) : (
        <div className="flex flex-row items-start justify-between gap-lg mb-xl flex-wrap max-md:flex-col">
          <Breadcrumbs
            items={[
              { label: 'Test Creation', to: '/create-test' },
              { label: 'Create Test', to: '/create-test' },
              { label: testType },
            ]}
          />
          <div className="flex items-center gap-lg">
            <div className="flex items-center gap-sm h-input px-lg bg-bg-card border border-border-input rounded-md text-sm font-medium text-text-main">
              <IconTimer />
              <span>{duration} min</span>
              <span className="text-border-input mx-xs">|</span>
              <IconQuestions />
              <span>{totalQuestions} Q&apos;s</span>
            </div>
          </div>
        </div>
      )}

      <div className="mb-xl">
        <Tabs tabs={TEST_TABS} activeTab={testType} onChange={setTestType} />
      </div>

      {apiError && <Alert variant="error" className="mb-lg">{apiError}</Alert>}

      <div className="bg-bg-card border border-border rounded-lg p-2xl">
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

        <div className="mb-2xl">
          <h3 className="text-base font-semibold text-text-heading mb-lg">Marking Scheme:</h3>
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

        <div className="flex items-center justify-between flex-wrap gap-lg pt-lg border-t border-border max-sm:flex-col max-sm:items-stretch">
          <div className="flex gap-md ml-auto max-sm:ml-0 [&_button]:max-sm:flex-1">
            <Button variant="secondary" onClick={() => navigate('/dashboard')} disabled={loading}>
              Cancel
            </Button>
            {isEditing ? (
              <Button onClick={handleSaveAsDraft} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={loading}>
                {loading ? 'Saving...' : 'Next'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
