import React from 'react';
import { ToolType } from '../../types/goban';
import { Minus, MoveRight, Pen, Sparkles, Trash, Undo2 } from 'lucide-react';

interface DrawingToolsProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  onClearDrawings: () => void;
  onUndoDrawing?: () => void;
}

export const DrawingTools: React.FC<DrawingToolsProps> = ({
  activeTool,
  setActiveTool,
  onClearDrawings,
  onUndoDrawing
}) => {
  return (
    <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700/70">
      <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">Drawing</span>
      <button
        onClick={() => setActiveTool('draw-pen')}
        className={`p-1.5 rounded-lg transition-all ${
          activeTool === 'draw-pen' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
        }`}
        title="Freehand Pen"
      >
        <Pen className="w-4 h-4" />
      </button>

      <button
        onClick={() => setActiveTool('draw-arrow')}
        className={`p-1.5 rounded-lg transition-all ${
          activeTool === 'draw-arrow' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
        }`}
        title="Directional Arrow"
      >
        <MoveRight className="w-4 h-4" />
      </button>

      <button
        onClick={() => setActiveTool('draw-line')}
        className={`p-1.5 rounded-lg transition-all ${
          activeTool === 'draw-line' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
        }`}
        title="Straight Line"
      >
        <Minus className="w-4 h-4" />
      </button>

      <button
        onClick={() => setActiveTool('draw-laser')}
        className={`p-1.5 rounded-lg transition-all ${
          activeTool === 'draw-laser' ? 'bg-rose-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
        }`}
        title="Live Laser Pointer (Fades out)"
      >
        <Sparkles className="w-4 h-4 text-rose-400" />
      </button>

      {onUndoDrawing && (
        <button
          onClick={onUndoDrawing}
          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
          title="Undo last drawing stroke"
        >
          <Undo2 className="w-4 h-4" />
        </button>
      )}

      <button
        onClick={onClearDrawings}
        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
        title="Clear all drawings on active layer"
      >
        <Trash className="w-4 h-4" />
      </button>
    </div>
  );
};
