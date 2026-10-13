import React from 'react';
import { ToolType } from '../../types/goban';
import { Eraser, SkipForward } from 'lucide-react';

interface StoneToolsProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  onPass?: () => void;
}

export const StoneTools: React.FC<StoneToolsProps> = ({ activeTool, setActiveTool, onPass }) => {
  return (
    <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700/70">
      <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">Stones</span>
      <button
        onClick={() => setActiveTool('stone-alt')}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
          activeTool === 'stone-alt'
            ? 'bg-indigo-600 text-white shadow'
            : 'text-slate-300 hover:bg-slate-800'
        }`}
        title="Alternate Black and White (Default)"
      >
        <div className="flex items-center -space-x-1">
          <span className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-700 inline-block" />
          <span className="w-3.5 h-3.5 rounded-full bg-white border border-slate-300 inline-block" />
        </div>
        <span>Auto B/W</span>
      </button>

      <button
        onClick={() => setActiveTool('stone-black')}
        className={`p-1.5 rounded-lg transition-all ${
          activeTool === 'stone-black'
            ? 'bg-indigo-600 text-white shadow ring-2 ring-indigo-400'
            : 'text-slate-300 hover:bg-slate-800'
        }`}
        title="Place Black stone"
      >
        <span className="w-4 h-4 rounded-full bg-slate-950 border border-slate-600 inline-block shadow-sm" />
      </button>

      <button
        onClick={() => setActiveTool('stone-white')}
        className={`p-1.5 rounded-lg transition-all ${
          activeTool === 'stone-white'
            ? 'bg-indigo-600 text-white shadow ring-2 ring-indigo-400'
            : 'text-slate-300 hover:bg-slate-800'
        }`}
        title="Place White stone"
      >
        <span className="w-4 h-4 rounded-full bg-white border border-slate-300 inline-block shadow-sm" />
      </button>

      {onPass && (
        <button
          onClick={onPass}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Pass Move"
        >
          <SkipForward className="w-3.5 h-3.5 text-amber-400" />
          <span>Pass</span>
        </button>
      )}

      <button
        onClick={() => setActiveTool('stone-remove')}
        className={`p-1.5 rounded-lg transition-all ${
          activeTool === 'stone-remove'
            ? 'bg-rose-600 text-white shadow'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        }`}
        title="Remove stone"
      >
        <Eraser className="w-4 h-4" />
      </button>
    </div>
  );
};
