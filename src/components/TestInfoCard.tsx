import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTestContext } from '../context/TestContext';
import { apiService } from '../services/api';
import { IconEdit, IconTimer, IconQuestions, IconMarks } from './icons/Icons';

interface TestInfoCardProps {
  onEdit?: () => void;
  showEdit?: boolean;
}

export default function TestInfoCard({ onEdit, showEdit = true }: TestInfoCardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentTest, subjects } = useTestContext();
  const [topicNames, setTopicNames] = useState<string[]>([]);
  const [subTopicNames, setSubTopicNames] = useState<string[]>([]);
  const topicsJson = JSON.stringify(currentTest?.topics || []);
  const subTopicsJson = JSON.stringify(currentTest?.sub_topics || []);

  useEffect(() => {
    if (!currentTest?.subject) return;

    const loadLabels = async () => {
      try {
        const subjectId =
          subjects.find((s) => s.id === currentTest.subject)?.id ||
          subjects.find(
            (s) => s.name.toLowerCase() === (currentTest.subject || '').toLowerCase()
          )?.id ||
          currentTest.subject;
        const topics = await apiService.getTopics(subjectId);
        setTopicNames(
          (currentTest.topics || [])
            .map((tid) => topics.find((t) => t.id === tid)?.name)
            .filter((name): name is string => Boolean(name)),
        );

        if (currentTest.topics?.length) {
          const subTopics = await apiService.getSubTopicsMulti(currentTest.topics);
          setSubTopicNames(
            (currentTest.sub_topics || [])
              .map((stid) => subTopics.find((st) => st.id === stid)?.name)
              .filter((name): name is string => Boolean(name)),
          );
        } else {
          setSubTopicNames([]);
        }
      } catch {
        setTopicNames(currentTest.topics || []);
        setSubTopicNames(currentTest.sub_topics || []);
      }
    };

    loadLabels();
  }, [currentTest?.id, currentTest?.subject, topicsJson, subTopicsJson]);

  if (!currentTest) return null;

  const handleEditClick = () => {
    if (onEdit) onEdit();
    else navigate(`/edit-test/${currentTest.id}`, { state: { from: location.pathname } });
  };

  const subjectName =
    subjects.find((s) => s.id === currentTest.subject)?.name || currentTest.subject || 'Unknown';

  const difficultyLabels: Record<string, string> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Difficult',
  };
  const difficulty = currentTest.difficulty
    ? difficultyLabels[currentTest.difficulty.toLowerCase()] ||
      currentTest.difficulty.charAt(0).toUpperCase() + currentTest.difficulty.slice(1)
    : 'Medium';

  const testTypeLabels: Record<string, string> = {
    chapterwise: 'Chapter Wise',
    pyq: 'PYQ',
    mock: 'Mock Test',
  };
  const testType = currentTest.type
    ? testTypeLabels[currentTest.type.toLowerCase()] || currentTest.type
    : 'Chapter Wise';

  const difficultyKey = (currentTest.difficulty || 'medium').toLowerCase();
  const difficultyClass =
    difficultyKey === 'easy'
      ? 'bg-badge-easy-bg text-badge-easy'
      : difficultyKey === 'medium'
        ? 'bg-[#fef3c7] text-[#d97706]'
        : 'bg-danger-bg text-danger';

  return (
    <div className="bg-bg-card border border-border rounded-lg p-xl px-2xl relative shadow-card max-sm:p-lg">
      <div className="flex items-start justify-between gap-lg mb-lg">
        <div className="flex flex-wrap items-center gap-md min-w-0">
          <span className="bg-badge-chapter text-white text-xs font-semibold px-[12px] py-1 rounded-full shrink-0">
            {testType}
          </span>
          <span className="text-base font-semibold text-text-heading truncate">{currentTest.name}</span>
          <span className={`inline-flex items-center gap-xs text-xs font-semibold px-[12px] py-1 rounded-full shrink-0 ${difficultyClass}`}>
            {difficulty}
          </span>
        </div>
        {showEdit && (
          <button
            type="button"
            className="flex items-center justify-center w-9 h-9 rounded-md text-primary bg-primary-light transition-colors duration-150 hover:bg-primary/20 shrink-0"
            onClick={handleEditClick}
            aria-label="Edit test details"
          >
            <IconEdit />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-md mb-xl">
        <div className="flex items-center flex-wrap gap-sm text-sm">
          <span className="font-medium text-text-subtle min-w-[80px]">Subject</span>
          <span className="font-medium text-text-heading">{subjectName}</span>
        </div>
        <div className="flex items-start flex-wrap gap-sm text-sm">
          <span className="font-medium text-text-subtle min-w-[80px] pt-0.5">Topic</span>
          <div className="flex flex-wrap gap-sm">
            {topicNames.length > 0 ? (
              topicNames.map((name) => (
                <span key={name} className="bg-badge-topic-bg border border-badge-topic-border text-badge-topic-text text-xs font-medium px-[10px] py-0.5 rounded-full">
                  {name}
                </span>
              ))
            ) : (
              <span className="text-text-subtle">—</span>
            )}
          </div>
        </div>
        {subTopicNames.length > 0 && (
          <div className="flex items-start flex-wrap gap-sm text-sm">
            <span className="font-medium text-text-subtle min-w-[80px] pt-0.5">Sub Topic</span>
            <div className="flex flex-wrap gap-sm">
              {subTopicNames.map((name) => (
                <span key={name} className="bg-badge-topic-bg border border-badge-topic-border text-badge-topic-text text-xs font-medium px-[10px] py-0.5 rounded-full">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-sm max-sm:justify-start max-sm:flex-wrap">
        {[
          { icon: <IconTimer />, label: `${currentTest.total_time} Min` },
          { icon: <IconQuestions />, label: `${currentTest.total_questions} Q's` },
          {
            icon: <IconMarks />,
            label: `${currentTest.total_marks || currentTest.total_questions * currentTest.correct_marks} Marks`,
          },
        ].map(({ icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-xs border border-border-input px-[14px] py-[6px] rounded-md text-xs text-text-main bg-bg-page font-medium"
          >
            {icon} {label}
          </span>
        ))}
      </div>
    </div>
  );
}
