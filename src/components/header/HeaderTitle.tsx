import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface HeaderTitleProps {
  title: string;
  onUpdateTitle: (title: string) => void;
}

export const HeaderTitle: React.FC<HeaderTitleProps> = ({ title, onUpdateTitle }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(title);

  const handleTitleSubmit = () => {
    onUpdateTitle(titleValue.trim() || 'Untitled Go Lesson');
    setIsEditingTitle(false);
  };

  if (isEditingTitle) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          className="bg-slate-800 text-xs font-semibold px-2 py-1 rounded border border-indigo-500 text-slate-100 focus:outline-none"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
        />
        <button
          onClick={handleTitleSubmit}
          className="p-1 text-emerald-400 hover:text-emerald-300"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => {
        setTitleValue(title);
        setIsEditingTitle(true);
      }}
      className="flex items-center gap-1.5 cursor-pointer group"
      title="Click to rename lesson"
    >
      <span className="font-semibold text-xs text-slate-200 group-hover:text-indigo-300 transition-colors truncate max-w-xs md:max-w-md">
        {title}
      </span>
      <span className="text-[10px] text-slate-500 group-hover:text-slate-400">✏️</span>
    </div>
  );
};
