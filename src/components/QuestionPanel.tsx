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
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-md">
        <div className="flex items-center gap-sm">
          <h3 className="text-sm font-semibold text-text-heading">Question creation</h3>
          {onCollapse && (
            <button
              type="button"
              className="inline-flex items-center justify-center bg-transparent text-text-subtle border-none cursor-pointer w-6 h-6 rounded-sm transition duration-150 hover:bg-bg-tab-active hover:text-text-heading"
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
            className="bg-primary-light text-primary-dark text-xs font-semibold px-md py-[4px] rounded-sm border border-primary/20 transition duration-150 hover:bg-primary hover:text-white"
            onClick={onAddNew}
            title="Add New Question"
          >
            + New
          </button>
        )}
      </div>
      
      <p className="text-xs text-text-subtle mb-lg">
        Total Questions <span className="mx-[2px]">·</span> {questions.length} / {totalQuestionsExpected}
      </p>
      
      <ul className="list-none flex flex-col gap-sm overflow-y-auto flex-1 pr-1">
        {questions.map((q, idx) => {
          const isActive = activeIndex === idx;
          const isDone = !!(q.question && q.option1 && q.option2 && q.option3 && q.option4 && q.correct_option);

          let itemClasses = "flex items-center gap-sm flex-1 p-md bg-bg-card border border-border rounded-md text-sm font-medium text-text-main text-left transition duration-150 hover:border-primary";
          if (isActive) {
            itemClasses += " border-primary bg-bg-tab-active";
          }
          if (isDone) {
            itemClasses += " !border-success !bg-[#ecfdf5] !text-[#047857]";
          }

          return (
            <li key={idx}>
              <div className="flex items-center gap-xs w-full">
                <button
                  type="button"
                  onClick={() => onSelect(idx)}
                  className={itemClasses}
                  disabled={readOnly && activeIndex === null}
                >
                  <span
                    className={`flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 text-white ${
                      isDone ? 'bg-success border-success' : 'border-border-input'
                    }`}
                  >
                    {isDone && <IconCheck width={10} height={10} />}
                  </span>
                  <span className="flex-1">Question {idx + 1}</span>
                  <div className={isDone ? 'text-success shrink-0' : 'text-text-subtle shrink-0'}>
                    <IconDoubleChevronRight />
                  </div>
                </button>
                {!readOnly && (
                  <button
                    type="button"
                    className="flex items-center justify-center w-8 h-8 rounded-sm text-text-subtle border border-transparent shrink-0 transition duration-150 hover:bg-danger-bg hover:text-danger hover:border-danger-light"
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
          className="mt-lg flex items-center justify-center w-full p-md bg-bg-card border border-dashed border-primary rounded-md text-primary-dark font-semibold text-sm transition duration-150 hover:bg-primary-light"
          onClick={onAddNew}
        >
          + Add MCQ Question
        </button>
      )}
    </div>
  );
}
