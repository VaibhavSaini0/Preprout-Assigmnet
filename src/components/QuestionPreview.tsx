import { useState } from 'react';
import type { Question } from '../services/api';
import { IconChevronDown, IconCheck } from './icons/Icons';

interface QuestionPreviewProps {
  questions: Question[];
}

export default function QuestionPreview({ questions }: QuestionPreviewProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (questions.length === 0) {
    return (
      <div className="text-center py-xl text-text-subtle text-sm">
        No questions to preview yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-sm">
      {questions.map((q, idx) => {
        const isExpanded = expandedIndex === idx;
        const options = [
          { key: 'option1', label: 'A', text: q.option1 },
          { key: 'option2', label: 'B', text: q.option2 },
          { key: 'option3', label: 'C', text: q.option3 },
          { key: 'option4', label: 'D', text: q.option4 },
        ];

        return (
          <div
            key={q.id || `q-${idx}`}
            className="border border-border rounded-md overflow-hidden bg-bg-card transition-shadow duration-150 hover:shadow-sm"
          >
            <button
              type="button"
              className="w-full flex items-center justify-between gap-md p-lg px-xl text-left bg-transparent hover:bg-bg-page transition-colors"
              onClick={() => setExpandedIndex(isExpanded ? null : idx)}
              aria-expanded={isExpanded}
            >
              <div className="flex items-center gap-md min-w-0">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary-light text-primary-dark text-xs font-bold shrink-0">
                  {idx + 1}
                </span>
                <span className="text-sm font-medium text-text-heading truncate">
                  {q.question || `Question ${idx + 1} (empty)`}
                </span>
              </div>
              <IconChevronDown
                className={`shrink-0 text-text-subtle transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            {isExpanded && (
              <div className="px-xl pb-xl border-t border-border pt-lg animate-fade-in">
                <p className="text-sm text-text-main mb-lg leading-relaxed whitespace-pre-wrap">
                  {q.question || '—'}
                </p>

                <div className="flex flex-col gap-sm mb-lg">
                  {options.map(({ key, label, text }) => {
                    const isCorrect = q.correct_option === key;
                    return (
                      <div
                        key={key}
                        className={`flex items-center gap-md p-md px-lg rounded-md text-sm border ${
                          isCorrect
                            ? 'border-success bg-success-bg text-[#065f46]'
                            : 'border-border bg-bg-page text-text-main'
                        }`}
                      >
                        <span className="font-semibold w-5 shrink-0">{label}.</span>
                        <span className="flex-1">{text || '—'}</span>
                        {isCorrect && (
                          <span className="inline-flex items-center gap-xs text-xs font-semibold shrink-0">
                            <IconCheck width={12} height={12} /> Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="bg-primary-light/50 border border-primary/15 rounded-md p-md px-lg">
                    <p className="text-xs font-semibold text-primary-dark mb-xs">Solution</p>
                    <p className="text-sm text-text-main leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
