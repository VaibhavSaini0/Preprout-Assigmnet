import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTestContext } from '../context/TestContext';
import { apiService, metaService } from '../services/api';
import type { Topic, SubTopic, Question } from '../services/api';
import { parseQuestionsCSV } from '../services/csvHelper';

function normalizeDifficulty(value?: string): string {
  if (!value) return 'medium';
  const lower = value.toLowerCase();
  return lower === 'difficult' ? 'hard' : lower;
}

export function useQuestionEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    subjects,
    currentTest,
    currentQuestions,
    setCurrentQuestions,
    loadTestAndQuestions,
    saveCurrentQuestionsToDB,
    loading,
  } = useTestContext();

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
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
  const [testTopics, setTestTopics] = useState<Topic[]>([]);
  const [testSubTopics, setTestSubTopics] = useState<SubTopic[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'question' | 'reset';
    index?: number;
  } | null>(null);

  useEffect(() => {
    if (id) {
      setPageLoading(true);
      loadTestAndQuestions(id).finally(() => setPageLoading(false));
    }
  }, [id]);

  useEffect(() => {
    if (currentTest) {
      const loadMetadata = async () => {
        try {
          // currentTest.subject may be a name string (from GET /tests response).
          // Resolve it to a UUID before fetching topics.
          const freshSubjects = await metaService.getSubjects();
          const knownSubjects = freshSubjects.length > 0 ? freshSubjects : subjects;
          const subjectEntry =
            knownSubjects.find((s) => s.id === currentTest.subject) ||
            knownSubjects.find(
              (s) => s.name.toLowerCase() === (currentTest.subject || '').toLowerCase()
            );
          const subjectId = subjectEntry ? subjectEntry.id : currentTest.subject;

          const allTopics = await apiService.getTopics(subjectId);
          setTestTopics(allTopics.filter((t) => currentTest.topics.includes(t.id)));
          if (currentTest.topics.length > 0) {
            const allSubTopics = await apiService.getSubTopicsMulti(currentTest.topics);
            setTestSubTopics(
              allSubTopics.filter((st) => currentTest.sub_topics?.includes(st.id))
            );
          }
        } catch (err) {
          console.error('Failed to load topic metadata', err);
        }
      };
      loadMetadata();
    }
  }, [currentTest]);

  useEffect(() => {
    if (currentQuestions.length > 0 && activeIndex === null) {
      setActiveIndex(0);
      loadQuestionIntoForm(0, currentQuestions);
    } else if (
      currentQuestions.length === 0 &&
      activeIndex === null &&
      currentTest &&
      !pageLoading
    ) {
      handleAddNewQuestion();
    }
  }, [currentQuestions, currentTest, pageLoading]);

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
    setQDifficulty(normalizeDifficulty(q.difficulty));
    setQTopicId(q.topic_id || '');
    setQSubTopicId(q.sub_topic_id || '');
    setMediaUrl(q.media_url || '');
  };

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
      difficulty: normalizeDifficulty(qDifficulty),
      topic_id: qTopicId || undefined,
      sub_topic_id: qSubTopicId || undefined,
      media_url: mediaUrl || undefined,
      test_id: id || '',
    };
    return nextList;
  };

  const handleSelectQuestion = (index: number) => {
    if (activeIndex === index) return;
    setPageError(null);
    const updatedList = syncFormToQuestions(activeIndex, currentQuestions);
    setCurrentQuestions(updatedList);
    setActiveIndex(index);
    loadQuestionIntoForm(index, updatedList);
  };

  const handleAddNewQuestion = () => {
    setPageError(null);
    let list = currentQuestions;
    if (activeIndex !== null) list = syncFormToQuestions(activeIndex, currentQuestions);

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

  const confirmDeleteQuestion = (index: number) => {
    if (currentQuestions.length <= 1) {
      setPageError('A test requires at least 1 question.');
      return;
    }
    setDeleteConfirm({ type: 'question', index });
  };

  const executeDeleteQuestion = () => {
    if (deleteConfirm?.type !== 'question' || deleteConfirm.index === undefined) return;
    const index = deleteConfirm.index;
    const updatedList = currentQuestions.filter((_, idx) => idx !== index);
    let nextActiveIndex = activeIndex;
    if (activeIndex === index) nextActiveIndex = index > 0 ? index - 1 : 0;
    else if (activeIndex !== null && activeIndex > index) nextActiveIndex = activeIndex - 1;
    setCurrentQuestions(updatedList);
    setActiveIndex(nextActiveIndex);
    if (nextActiveIndex !== null) loadQuestionIntoForm(nextActiveIndex, updatedList);
    setDeleteConfirm(null);
  };

  const handleClearForm = () => {
    setQuestionText('');
    setOption1('');
    setOption2('');
    setOption3('');
    setOption4('');
    setCorrectOption('option1');
    setExplanation('');
    setMediaUrl('');
  };

  const handleDeleteAllEdits = () => setDeleteConfirm({ type: 'reset' });

  const executeReset = () => {
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
    setDeleteConfirm(null);
  };

  const handleSaveAndContinue = async () => {
    setPageError(null);
    const finalQuestionsList = syncFormToQuestions(activeIndex, currentQuestions);
    setCurrentQuestions(finalQuestionsList);

    if (finalQuestionsList.length === 0) {
      setPageError('A test must contain at least 1 question.');
      return;
    }

    for (let i = 0; i < finalQuestionsList.length; i++) {
      const q = finalQuestionsList[i];
      if (
        !q.question?.trim() ||
        !q.option1?.trim() ||
        !q.option2?.trim() ||
        !q.option3?.trim() ||
        !q.option4?.trim()
      ) {
        setActiveIndex(i);
        loadQuestionIntoForm(i, finalQuestionsList);
        setPageError(
          `Question ${i + 1} is incomplete. Fill in the question text and all 4 options.`
        );
        return;
      }
    }

    try {
      await saveCurrentQuestionsToDB();
      navigate(`/confirmation/${id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save questions.';
      setPageError(message);
    }
  };

  const handleCSVUpload = (csvText: string) => {
    try {
      const parsed = parseQuestionsCSV(csvText);
      if (parsed.length === 0) {
        setPageError('No valid questions found in the CSV. Make sure headers match.');
        return;
      }

      let list = currentQuestions;
      if (activeIndex !== null) {
        list = syncFormToQuestions(activeIndex, currentQuestions);
      }

      const nextList = [...list];
      parsed.forEach((q) => {
        nextList.push({
          ...q,
          test_id: id || '',
        } as Question);
      });
      setCurrentQuestions(nextList);

      const firstNewIdx = nextList.length - parsed.length;
      setActiveIndex(firstNewIdx);
      loadQuestionIntoForm(firstNewIdx, nextList);
      setPageError(null);
    } catch (err: any) {
      setPageError(err.message || 'Failed to parse CSV.');
    }
  };

  const handleFormatText = (command: string) => {
    document.execCommand(command, false, undefined);
  };

  return {
    navigate,
    id,
    currentTest,
    currentQuestions,
    loading,
    activeIndex,
    setActiveIndex,
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
    setPageError,
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
  };
}
