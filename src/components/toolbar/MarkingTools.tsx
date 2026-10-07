import React from 'react';
import { ToolType } from '../../types/goban';
import { Circle, Hash, Square, Triangle, Type, X } from 'lucide-react';

interface MarkingToolsProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
}

export const MarkingTools: React.FC<MarkingToolsProps> = ({ activeTool, setActiveTool }) => {
  return (
    <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700/70">
      <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">Marks</span>
      <button
        onClick={() => setActiveTool('mark-triangle')}
        className={`p-1.5 rounded-lg transition-all ${
          activeTool === 'mark-triangle' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
        }`}
        title="Triangle (TR)"
      >
        <Triangle className="w-4 h-4" />
      </button>

      <button
        onClick={() => setActiveTool('mark-square')}
        className={`p-1.5 rounded-lg transition-all ${
          activeTool === 'mark-square' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
        }`}
        title="Square (SQ)"
      >
        <Square className="w-4 h-4" />
      </button>

      <button
        onClick={() => setActiveTool('mark-circle')}
        className={`p-1.5 rounded-lg transition-all ${
          activeTool === 'mark-circle' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
        }`}
        title="Circle (CR)"
      >
        <Circle className="w-4 h-4" />
      </button>

      <button
        onClick={() => setActiveTool('mark-cross')}
        className={`p-1.5 rounded-lg transition-all ${
          activeTool === 'mark-cross' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
        }`}
        title="Cross / Mark (X)"
      >
        <X className="w-4 h-4" />
      </button>

      <button
        onClick={() => setActiveTool('mark-label')}
        className={`p-1.5 rounded-lg transition-all ${
          activeTool === 'mark-label' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
        }`}
        title="Letter Label (A..Z)"
      >
        <Type className="w-4 h-4" />
      </button>

      <button
        onClick={() => setActiveTool('mark-number')}
        className={`p-1.5 rounded-lg transition-all ${
          activeTool === 'mark-number' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
        }`}
        title="Number Label (1..N)"
      >
        <Hash className="w-4 h-4" />
      </button>
    </div>
  );
};
