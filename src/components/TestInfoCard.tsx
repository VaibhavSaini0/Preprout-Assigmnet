import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestContext } from '../context/TestContext';
import { apiService } from '../services/api';
import { IconEdit, IconTimer, IconQuestions, IconMarks } from './icons/Icons';

interface TestInfoCardProps {
  onEdit?: () => void;
  showEdit?: boolean;
}

export default function TestInfoCard({ onEdit, showEdit = true }: TestInfoCardProps) {
  const navigate = useNavigate();
  const { currentTest, subjects } = useTestContext();
  const [topicNames, setTopicNames] = useState<string[]>([]);
  const [subTopicNames, setSubTopicNames] = useState<string[]>([]);

  useEffect(() => {
    if (!currentTest?.subject) return;

    const loadLabels = async () => {
      try {
        const topics = await apiService.getTopics(currentTest.subject);
        setTopicNames(
          (currentTest.topics || [])
            .map((id) => topics.find((t) => t.id === id)?.name)
            .filter((name): name is string => Boolean(name)),
        );

        if (currentTest.topics?.length) {
          const subTopics = await apiService.getSubTopicsMulti(currentTest.topics);
          setSubTopicNames(
            (currentTest.sub_topics || [])
              .map((id) => subTopics.find((st) => st.id === id)?.name)
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
  }, [currentTest]);

  if (!currentTest) return null;

  const handleEditClick = () => {
    if (onEdit) {
      onEdit();
    } else {
      navigate(`/edit-test/${currentTest.id}`);
    }
  };

  const subjectName =
    subjects.find((s) => s.id === currentTest.subject)?.name || currentTest.subject || 'Unknown';

  const difficulty = currentTest.difficulty
    ? currentTest.difficulty.charAt(0).toUpperCase() + currentTest.difficulty.slice(1)
    : 'Medium';

  const testType = currentTest.type
    ? currentTest.type
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : 'Chapter Wise';

  const difficultyClass =
    difficulty.toLowerCase() === 'easy'
      ? 'bg-badge-easy-bg text-badge-easy text-xs font-semibold px-[12px] py-1 rounded-full'
      : difficulty.toLowerCase() === 'medium'
        ? 'bg-[#fef3c7] text-[#d97706] text-xs font-semibold px-[12px] py-1 rounded-full'
        : 'bg-danger-bg text-danger text-xs font-semibold px-[12px] py-1 rounded-full';

  return (
    <div className="bg-bg-card border border-border rounded-lg p-xl px-2xl relative max-sm:p-lg">
      <div className="flex items-start justify-between mb-lg">
        <div className="flex flex-wrap items-center gap-md">
          <span className="bg-badge-chapter text-white text-xs font-semibold px-[12px] py-1 rounded-full">{testType}</span>
          <span className="text-base font-semibold text-text-heading">{currentTest.name}</span>
          <span className={difficultyClass}>✔ {difficulty}</span>
        </div>
        {showEdit && (
          <button
            type="button"
            className="flex items-center justify-center w-8 h-8 rounded-sm text-primary bg-primary-light transition-colors duration-150 hover:bg-primary/20"
            onClick={handleEditClick}
            aria-label="Edit test details"
          >
            <IconEdit />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-md mb-xl">
        <div className="flex items-center flex-wrap gap-sm text-sm">
          <span className="font-medium text-text-main min-w-[70px]">Subject</span>
          <span className="text-text-subtle">:</span>
          <span className="font-medium">{subjectName}</span>
        </div>
        <div className="flex items-center flex-wrap gap-sm text-sm">
          <span className="font-medium text-text-main min-w-[70px]">Topic</span>
          <span className="text-text-subtle">:</span>
          <div className="flex flex-wrap gap-sm">
            {topicNames.length > 0 ? (
              topicNames.map((name) => (
                <span key={name} className="bg-badge-topic-bg border border-badge-topic-border text-badge-topic-text text-xs font-medium px-[10px] py-0.5 rounded-full">
                  {name}
                </span>
              ))
            ) : (
              <span className="font-medium">—</span>
            )}
          </div>
        </div>
        {subTopicNames.length > 0 && (
          <div className="flex items-center flex-wrap gap-sm text-sm">
            <span className="font-medium text-text-main min-w-[70px]">Sub Topic</span>
            <span className="text-text-subtle">:</span>
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
        <span className="inline-flex items-center gap-xs border border-border-input px-[14px] py-[6px] rounded-md text-xs text-text-main bg-bg-card font-medium">
          <IconTimer /> {currentTest.total_time} Min
        </span>
        <span className="inline-flex items-center gap-xs border border-border-input px-[14px] py-[6px] rounded-md text-xs text-text-main bg-bg-card font-medium">
          <IconQuestions /> {currentTest.total_questions} Q&apos;s
        </span>
        <span className="inline-flex items-center gap-xs border border-border-input px-[14px] py-[6px] rounded-md text-xs text-text-main bg-bg-card font-medium">
          <IconMarks />{' '}
          {currentTest.total_marks || currentTest.total_questions * currentTest.correct_marks} Marks
        </span>
      </div>
    </div>
  );
}
