import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import TestInfoCard from '../components/TestInfoCard';
import QuestionPanel from '../components/QuestionPanel';
import { SelectField, TextAreaField } from '../components/ui/FormField';
import { useTestContext } from '../context/TestContext';
import { apiService } from '../services/api';
import type { Topic, SubTopic, Question } from '../services/api';
import {
  IconTrash,
  IconDownload,
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
} from '../components/icons/Icons';

export default function TestViewPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    currentTest,
    currentQuestions,
    setCurrentQuestions,
    loadTestAndQuestions,
    saveCurrentQuestionsToDB,
    loading
  } = useTestContext();

  // Active question index
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Editor form state
  const [questionText, setQuestionText] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');
  const [correctOption, setCorrectOption] = useState('option1');
  const [explanation, setExplanation] = useState('');
  const [qDifficulty, setQDifficulty] = useState('medium');
  const [qTopicId, setQTopicId] = useState('');
  const [qSubTopicId, setQSubTopicId] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');

  // Dropdown lists from backend
  const [testTopics, setTestTopics] = useState<Topic[]>([]);
  const [testSubTopics, setTestSubTopics] = useState<SubTopic[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // 1. Fetch test details and questions on mount
  useEffect(() => {
    if (id) {
      loadTestAndQuestions(id);
    }
  }, [id]);

  // 2. Fetch all topic and subtopic metadata for dropdowns based on test configuration
  useEffect(() => {
    if (currentTest) {
      const loadMetadata = async () => {
        try {
          // Fetch topics for subject
          const allTopics = await apiService.getTopics(currentTest.subject);
          const filteredTopics = allTopics.filter(t => currentTest.topics.includes(t.id));
          setTestTopics(filteredTopics);

          // Fetch sub-topics for topics
          if (currentTest.topics.length > 0) {
            const allSubTopics = await apiService.getSubTopicsMulti(currentTest.topics);
            const filteredSub = allSubTopics.filter(st => currentTest.sub_topics?.includes(st.id));
            setTestSubTopics(filteredSub);
          }
        } catch (err) {
          console.error('Failed to load topic metadata', err);
        }
      };
      loadMetadata();
    }
  }, [currentTest]);

  // 3. Set default active index when questions load
  useEffect(() => {
    if (currentQuestions.length > 0 && activeIndex === null) {
      setActiveIndex(0);
      loadQuestionIntoForm(0, currentQuestions);
    } else if (currentQuestions.length === 0 && activeIndex === null && currentTest) {
      // Start with a default empty question
      handleAddNewQuestion();
    }
  }, [currentQuestions, currentTest]);

  // Load a question's data into the form states
  const loadQuestionIntoForm = (index: number, list: Question[]) => {
    const q = list[index];
    if (!q) return;

    setQuestionText(q.question || '');
    setOption1(q.option1 || '');
    setOption2(q.option2 || '');
    setOption3(q.option3 || '');
    setOption4(q.option4 || '');
    setCorrectOption(q.correct_option || 'option1');
    setExplanation(q.explanation || '');
    setQDifficulty(q.difficulty || 'medium');
    setQTopicId(q.topic_id || '');
    setQSubTopicId(q.sub_topic_id || '');
    setMediaUrl(q.media_url || '');
  };

  // Syncs the active form fields back into the local questions state
  const syncFormToQuestions = (index: number | null, list: Question[]): Question[] => {
    if (index === null || index < 0 || index >= list.length) return list;
    const nextList = [...list];
    nextList[index] = {
      ...nextList[index],
      type: 'mcq',
      question: questionText,
      option1,
      option2,
      option3,
      option4,
      correct_option: correctOption,
      explanation,
      difficulty: qDifficulty,
      topic_id: qTopicId || undefined,
      sub_topic_id: qSubTopicId || undefined,
      media_url: mediaUrl || undefined,
      test_id: id || '',
    };
    return nextList;
  };

  // Switch questions
  const handleSelectQuestion = (index: number) => {
    if (activeIndex === index) return;
    setPageError(null);
    setSaveSuccess(null);

    // Save previous active question
    const updatedList = syncFormToQuestions(activeIndex, currentQuestions);
    setCurrentQuestions(updatedList);

    // Switch index
    setActiveIndex(index);
    loadQuestionIntoForm(index, updatedList);
  };

  // Create new question
  const handleAddNewQuestion = () => {
    setPageError(null);
    setSaveSuccess(null);

    let list = currentQuestions;
    if (activeIndex !== null) {
      list = syncFormToQuestions(activeIndex, currentQuestions);
    }

    const newQ: Question = {
      type: 'mcq',
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correct_option: 'option1',
      difficulty: 'medium',
      test_id: id || '',
    };

    const nextList = [...list, newQ];
    setCurrentQuestions(nextList);
    const newIdx = nextList.length - 1;

    // Load new empty form
    setActiveIndex(newIdx);
    setQuestionText('');
    setOption1('');
    setOption2('');
    setOption3('');
    setOption4('');
    setCorrectOption('option1');
    setExplanation('');
    setQDifficulty('medium');
    setQTopicId('');
    setQSubTopicId('');
    setMediaUrl('');
  };

  // Delete a question
  const handleDeleteQuestion = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setPageError(null);
    setSaveSuccess(null);

    if (currentQuestions.length <= 1) {
      setPageError('A test requires at least 1 question. You cannot delete this question.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete Question ${index + 1}?`)) return;

    // Filter out the question
    const updatedList = currentQuestions.filter((_, idx) => idx !== index);
    
    // Shift active index
    let nextActiveIndex = activeIndex;
    if (activeIndex === index) {
      nextActiveIndex = index > 0 ? index - 1 : 0;
    } else if (activeIndex !== null && activeIndex > index) {
      nextActiveIndex = activeIndex - 1;
    }

    setCurrentQuestions(updatedList);
    setActiveIndex(nextActiveIndex);
    
    if (nextActiveIndex !== null) {
      loadQuestionIntoForm(nextActiveIndex, updatedList);
    }
  };

  // Clear active question form
  const handleClearForm = () => {
    setQuestionText('');
    setOption1('');
    setOption2('');
    setOption3('');
    setOption4('');
    setCorrectOption('option1');
    setExplanation('');
    setQDifficulty('medium');
    setQTopicId('');
    setQSubTopicId('');
    setMediaUrl('');
  };

  // Clear all question edits
  const handleDeleteAllEdits = () => {
    if (window.confirm('Are you sure you want to reset all edits? This clears all question contents.')) {
      handleClearForm();
      if (activeIndex !== null) {
        const nextList = [...currentQuestions];
        nextList[activeIndex] = {
          type: 'mcq',
          question: '',
          option1: '',
          option2: '',
          option3: '',
          option4: '',
          correct_option: 'option1',
          difficulty: 'medium',
          test_id: id || '',
        };
        setCurrentQuestions(nextList);
      }
    }
  };

  // Next / Save & Continue action
  const handleSaveAndContinue = async () => {
    setPageError(null);
    setSaveSuccess(null);

    // 1. Sync current form state to questions
    const finalQuestionsList = syncFormToQuestions(activeIndex, currentQuestions);
    setCurrentQuestions(finalQuestionsList);

    // 2. Validate list
    if (finalQuestionsList.length === 0) {
      setPageError('A test must contain at least 1 question.');
      return;
    }

    // Check if any question has blank fields
    for (let i = 0; i < finalQuestionsList.length; i++) {
      const q = finalQuestionsList[i];
      if (!q.question?.trim() || !q.option1?.trim() || !q.option2?.trim() || !q.option3?.trim() || !q.option4?.trim()) {
        setActiveIndex(i);
        loadQuestionIntoForm(i, finalQuestionsList);
        setPageError(`Question ${i + 1} is incomplete. Please provide question text, all 4 options, and the correct option.`);
        return;
      }
    }

    // 3. Save to backend via context
    try {
      await saveCurrentQuestionsToDB();
      setSaveSuccess('Questions saved successfully!');
      // Navigate to Page 5: Preview & Publish
      navigate(`/confirmation/${id}`);
    } catch (err: any) {
      console.error(err);
      setPageError(err.response?.data?.message || err.message || 'Failed to save questions to backend.');
    }
  };

  return (
    <AppLayout 
      showQuestionPanel 
      questionPanel={
        <QuestionPanel 
          questions={currentQuestions}
          activeIndex={activeIndex}
          onSelect={handleSelectQuestion}
          onDelete={handleDeleteQuestion}
          onAddNew={handleAddNewQuestion}
          totalQuestionsExpected={currentTest?.total_questions || 50}
        />
      }
    >
      <div className="mb-xl">
        <Breadcrumbs
          items={[
            { label: 'Test Creation', to: '/create-test' },
            { label: 'Create Test', to: '/create-test' },
            { label: currentTest?.name || 'Chapter Wise' },
          ]}
        />
      </div>

      <TestInfoCard />

      {pageError && (
        <Alert variant="error" className="mt-lg">{pageError}</Alert>
      )}

      {saveSuccess && (
        <Alert variant="success" className="mt-lg">{saveSuccess}</Alert>
      )}

      <section className="bg-bg-card border border-border rounded-lg p-2xl mt-xl">
        <div className="flex items-center justify-between flex-wrap gap-md mb-md">
          <h2 className="text-lg font-semibold text-primary">
            Question {(activeIndex !== null ? activeIndex + 1 : 0)} / {currentQuestions.length}
          </h2>
          <div className="flex gap-sm">
            <button 
              type="button" 
              className="flex items-center gap-xs p-sm px-lg border border-border rounded-md text-sm font-medium text-text-main bg-bg-card hover:bg-bg-tab-active transition duration-150"
              onClick={handleAddNewQuestion}
            >
              + MCQ
            </button>
            <button
              type="button"
              className="flex items-center gap-xs p-sm px-lg border border-border rounded-md text-sm font-medium text-text-main bg-bg-card hover:bg-bg-tab-active transition duration-150"
              disabled
            >
              <IconDownload /> CSV
            </button>
          </div>
        </div>

        <button 
          type="button" 
          className="flex items-center gap-xs text-sm text-danger mb-lg hover:underline cursor-pointer"
          onClick={handleDeleteAllEdits}
        >
          <IconTrash /> Reset Question Edits
        </button>

        <div className="flex flex-wrap gap-xs p-sm border border-border border-b-0 rounded-t-md bg-bg-sidebar-icon">
          {['B', 'I', 'U', 'S', '🔗', '≡', '•', '🖼', 'Complex Formula'].map((tool) => (
            <button
              key={tool}
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-sm text-sm font-semibold text-text-main hover:bg-border"
              disabled
            >
              {tool}
            </button>
          ))}
        </div>

        <div className="relative mb-xl">
          <textarea 
            placeholder="Type your question here..." 
            className="w-full min-h-[140px] p-lg pr-[48px] border border-border rounded-b-md resize-y outline-none text-base focus:border-primary" 
            rows={5}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            disabled={loading}
          />
          <button 
            type="button" 
            className="absolute bottom-md right-md text-text-subtle p-xs hover:text-danger transition-colors" 
            onClick={handleClearForm}
            aria-label="Clear form"
          >
            <IconTrash />
          </button>
        </div>

        <p className="text-sm font-medium text-text-main mb-md">Type options below & select the checkmark for correct answer</p>
        <div className="flex flex-col gap-md mb-xl">
          {[
            { id: 'option1', val: option1, setVal: setOption1 },
            { id: 'option2', val: option2, setVal: setOption2 },
            { id: 'option3', val: option3, setVal: setOption3 },
            { id: 'option4', val: option4, setVal: setOption4 }
          ].map(({ id: optId, val, setVal }) => {
            const isCorrect = correctOption === optId;
            return (
              <div 
                key={optId} 
                className="flex items-center gap-md"
              >
                <button
                  type="button"
                  className={`w-6 h-6 border-2 border-border-input rounded-full shrink-0 flex items-center justify-center bg-transparent cursor-pointer transition-all duration-150 hover:border-primary ${
                    isCorrect ? 'bg-success border-success' : ''
                  }`}
                  onClick={() => setCorrectOption(optId)}
                  title="Mark as correct answer"
                >
                  {isCorrect ? <IconCheck style={{ width: 12, height: 12, color: 'white' }} /> : <span />}
                </button>
                <input
                  type="text"
                  placeholder={`Type Option (${optId.replace('option', '')})`}
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  disabled={loading}
                  className={`flex-1 h-input px-lg border rounded-md outline-none focus:border-primary transition-all ${
                    isCorrect ? 'border-success shadow-[0_0_0_1px_rgba(16,185,129,0.15)]' : 'border-border-input'
                  }`}
                />
                <button 
                  type="button" 
                  className="text-text-subtle p-sm hover:text-danger transition-colors"
                  onClick={() => setVal('')}
                  title="Clear option"
                >
                  <IconTrash />
                </button>
              </div>
            );
          })}
        </div>

        <TextAreaField 
          label="Add Solution / Explanation" 
          placeholder="Explain the solution detail here..." 
          rows={3}
          value={explanation}
          onChange={setExplanation}
        />

        <div className="flex justify-center gap-md mt-xl">
          <button 
            type="button" 
            aria-label="Previous question"
            disabled={activeIndex === null || activeIndex === 0}
            onClick={() => activeIndex !== null && handleSelectQuestion(activeIndex - 1)}
            className="h-9 flex items-center justify-center gap-xs px-lg border border-border rounded-md text-text-subtle text-xs font-medium transition-colors duration-150 hover:enabled:bg-bg-tab-active hover:enabled:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IconChevronLeft /> Previous Question
          </button>
          <button 
            type="button" 
            aria-label="Next question"
            disabled={activeIndex === null || activeIndex === currentQuestions.length - 1}
            onClick={() => activeIndex !== null && handleSelectQuestion(activeIndex + 1)}
            className="h-9 flex items-center justify-center gap-xs px-lg border border-border rounded-md text-text-subtle text-xs font-medium transition-colors duration-150 hover:enabled:bg-bg-tab-active hover:enabled:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next Question <IconChevronRight />
          </button>
        </div>
      </section>

      <section className="bg-bg-card border border-border rounded-lg p-2xl mt-xl">
        <h3 className="text-base font-semibold text-text-heading mb-lg">Question settings</h3>
        <div className="grid grid-cols-3 gap-xl max-lg:grid-cols-1">
          <SelectField 
            label="Level of Difficulty" 
            value={qDifficulty}
            onChange={setQDifficulty}
            options={[
              { value: 'easy', label: 'Easy' },
              { value: 'medium', label: 'Medium' },
              { value: 'difficult', label: 'Difficult' }
            ]}
          />
          <SelectField 
            label="Topic" 
            value={qTopicId}
            onChange={setQTopicId}
            options={testTopics.map(t => ({ value: t.id, label: t.name }))}
            placeholder="Select Topic"
          />
          <SelectField 
            label="Sub-topic" 
            value={qSubTopicId}
            onChange={setQSubTopicId}
            options={testSubTopics.map(st => ({ value: st.id, label: st.name }))}
            placeholder="Select Sub-topic"
          />
        </div>
      </section>

      <div className="flex justify-between items-center mt-2xl gap-md max-sm:flex-col [&_button]:max-sm:w-full">
        <Button 
          variant="danger" 
          onClick={() => navigate('/dashboard')}
          disabled={loading}
        >
          Exit Test Creation
        </Button>
        <Button 
          onClick={handleSaveAndContinue}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Next: Preview & Publish'}
        </Button>
      </div>
    </AppLayout>
  );
}
