import { IconDoubleChevronRight, IconCollapse, IconCheck, IconTrash } from './icons/Icons';
import type { Question } from '../services/api';

interface QuestionPanelProps {
  questions: Question[];
  activeIndex: number | null;
  onSelect: (index: number) => void;
  onDelete: (index: number, e: React.MouseEvent) => void;
  onAddNew: () => void;
  totalQuestionsExpected: number;
  readOnly?: boolean;
  onCollapse?: () => void;
}

export default function QuestionPanel({
  questions = [],
  activeIndex,
  onSelect,
  onDelete,
  onAddNew,
  totalQuestionsExpected = 50,
  readOnly = false,
  onCollapse,
}: QuestionPanelProps) {
  const completedCount = questions.filter(
    (q) => q.question && q.option1 && q.option2 && q.option3 && q.option4 && q.correct_option,
  ).length;

  return (
    <div className="flex flex-col min-w-0 overflow-x-hidden">
      <div className="flex items-center justify-between mb-md">
        <div className="flex items-center gap-sm">
          <h3 className="text-sm font-semibold text-text-heading">Question creation</h3>
          {onCollapse && (
            <button
              type="button"
              className="inline-flex items-center justify-center text-text-subtle w-6 h-6 rounded-sm hover:bg-bg-tab-active hover:text-text-heading transition-colors"
              onClick={onCollapse}
              title="Collapse Panel"
              aria-label="Collapse panel"
            >
              <IconCollapse />
            </button>
          )}
        </div>
        {!readOnly && (
          <button
            type="button"
            className="bg-primary-light text-primary-dark text-xs font-semibold px-md py-[4px] rounded-md border border-primary/20 hover:bg-primary hover:text-white transition duration-150"
            onClick={onAddNew}
          >
            + New
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mb-lg">
        <p className="text-xs text-text-subtle">
          Total Questions · {questions.length} / {totalQuestionsExpected}
        </p>
        <span className="text-xs font-medium text-success">{completedCount} done</span>
      </div>

      <div className="w-full h-1.5 bg-border rounded-full mb-lg overflow-hidden">
        <div
          className="h-full bg-success rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, (completedCount / totalQuestionsExpected) * 100)}%` }}
        />
      </div>

      <ul className="list-none flex flex-col gap-sm overflow-y-auto max-h-[calc(100vh-18rem)] pr-1">
        {questions.map((q, idx) => {
          const isActive = activeIndex === idx;
          const isDone = !!(q.question && q.option1 && q.option2 && q.option3 && q.option4 && q.correct_option);

          return (
            <li key={q.id || `question-${idx}`} className="min-w-0">
              <div className="flex items-center gap-xs w-full min-w-0">
                <button
                  type="button"
                  onClick={() => !readOnly && onSelect(idx)}
                  className={`flex items-center gap-sm flex-1 min-w-0 p-md bg-bg-card border rounded-md text-sm font-medium text-left transition duration-150 ${
                    isActive
                      ? 'border-primary bg-bg-tab-active text-primary-dark'
                      : isDone
                        ? 'border-success/40 bg-success-bg/40 text-[#047857] hover:border-success'
                        : 'border-border text-text-main hover:border-primary/50'
                  } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                  disabled={readOnly}
                >
                  <span
                    className={`flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 ${
                      isDone ? 'bg-success border-success text-white' : 'border-border-input'
                    }`}
                  >
                    {isDone && <IconCheck width={10} height={10} />}
                  </span>
                  <span className="flex-1 truncate">Question {idx + 1}</span>
                  <IconDoubleChevronRight className={`shrink-0 ${isDone ? 'text-success' : 'text-text-subtle'}`} />
                </button>
                {!readOnly && (
                  <button
                    type="button"
                    className="flex items-center justify-center w-8 h-8 rounded-md text-text-subtle shrink-0 hover:bg-danger-bg hover:text-danger transition duration-150"
                    onClick={(e) => onDelete(idx, e)}
                    title="Delete Question"
                    aria-label={`Delete Question ${idx + 1}`}
                  >
                    <IconTrash width={14} height={14} />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {!readOnly && (
        <button
          type="button"
          className="mt-lg flex items-center justify-center w-full p-md bg-bg-card border border-dashed border-primary rounded-md text-primary-dark font-semibold text-sm hover:bg-primary-light transition duration-150"
          onClick={onAddNew}
        >
          + Add MCQ Question
        </button>
      )}
    </div>
  );
}
