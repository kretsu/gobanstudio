import React from 'react';
import { GobanProject } from '../../types/goban';
import { SAMPLE_LESSONS } from '../SampleLessons';
import { BookOpen, ChevronDown } from 'lucide-react';

interface HeaderSampleMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onLoadSample: (sampleProject: GobanProject) => void;
}

export const HeaderSampleMenu: React.FC<HeaderSampleMenuProps> = ({
  isOpen,
  onToggle,
  onClose,
  onLoadSample
}) => {
  return (
    <div className="relative" data-header-menu>
      <button
        onClick={onToggle}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/60"
        title="Load sample lessons"
      >
        <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
        <span className="hidden md:inline">Samples</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs">
          <div className="px-3 py-1 font-bold text-slate-400 text-[10px] uppercase tracking-wider">
            Pre-Loaded Lesson Material
          </div>
          {SAMPLE_LESSONS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => {
                onLoadSample(sample.project);
                onClose();
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-indigo-600/30 text-slate-200 transition-colors flex flex-col gap-0.5"
            >
              <span className="font-semibold text-slate-100">{sample.title}</span>
              <span className="text-[10px] text-slate-400">{sample.subtitle}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
