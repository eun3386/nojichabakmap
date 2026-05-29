'use client';

import React from 'react';

interface TagFilterProps {
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
}

const AVAILABLE_TAGS = ['초보OK', '솔로가능', '화장실有', '바다', '강', '산'] as const;

export default function TagFilter({
  selectedTags,
  onToggleTag,
}: TagFilterProps): React.JSX.Element {
  return (
    <div className="w-full py-4 overflow-x-auto scrollbar-none">
      <div className="flex gap-2 min-w-max px-4">
        {AVAILABLE_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag);

          return (
            <button
              key={tag}
              onClick={() => onToggleTag(tag)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 active:scale-95 shadow-md flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : 'bg-slate-800/80 text-slate-300 border border-slate-700/50 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{tag}</span>
              {isSelected && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
