import React from 'react';
import { ToolType } from '../types/goban';
import {
  Circle,
  Square,
  Triangle,
  X,
  Type,
  Pen,
  MoveRight,
  Minus,
  Sparkles,
  Eraser,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Trash
} from 'lucide-react';

interface ToolbarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  brushColor: string;
  setBrushColor: (color: string) => void;
  brushWidth: number;
  setBrushWidth: (width: number) => void;
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClearDrawings: () => void;
  isLocked: boolean;
}

const COLOR_PALETTE = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Black', hex: '#0f172a' }
];

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
  brushColor,
  setBrushColor,
  brushWidth,
  setBrushWidth,
  currentStep,
  totalSteps,
  onStepChange,
  isPlaying,
  onTogglePlay,
  onClearDrawings,
  isLocked
}) => {
  return (
    <div className="flex flex-col gap-3 bg-slate-850/90 border-t border-slate-700/80 p-3 select-none backdrop-blur shadow-lg">
      {/* Top row: Tools categories */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Stone Tools */}
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

        {/* Go Markings Tools */}
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
            title="Letter Label (LB)"
          >
            <Type className="w-4 h-4" />
          </button>
        </div>

        {/* Freehand Drawing & Vector Tools */}
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

          <button
            onClick={onClearDrawings}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Clear all drawings on active layer"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>

        {/* Color Palette & Brush Size (Visible when in drawing mode) */}
        {activeTool.startsWith('draw-') && (
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/70">
            <div className="flex items-center gap-1">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setBrushColor(c.hex)}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    brushColor === c.hex ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-80 hover:opacity-100 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            <div className="flex items-center gap-1 text-xs text-slate-300">
              <button
                onClick={() => setBrushWidth(2)}
                className={`px-1.5 py-0.5 rounded font-mono ${brushWidth === 2 ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
              >
                S
              </button>
              <button
                onClick={() => setBrushWidth(4)}
                className={`px-1.5 py-0.5 rounded font-mono ${brushWidth === 4 ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
              >
                M
              </button>
              <button
                onClick={() => setBrushWidth(7)}
                className={`px-1.5 py-0.5 rounded font-mono ${brushWidth === 7 ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
              >
                L
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom row: Sequence step playback & Scrubber */}
      <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-700/40">
        {/* Navigation Step Buttons */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700/70">
          <button
            onClick={() => onStepChange(0)}
            disabled={currentStep === 0}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="First Move (Home)"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => onStepChange(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Previous Move (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            disabled={totalSteps === 0}
            className={`p-1.5 rounded-lg transition-all ${
              isPlaying ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            } disabled:opacity-30 disabled:pointer-events-none`}
            title={isPlaying ? 'Pause Slideshow' : 'Play Moves (Space)'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={() => onStepChange(Math.min(totalSteps, currentStep + 1))}
            disabled={currentStep >= totalSteps}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Next Move (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onStepChange(totalSteps)}
            disabled={currentStep >= totalSteps}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Last Move (End)"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Move Step Slider & Number counter */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <input
            type="range"
            min="0"
            max={totalSteps}
            value={currentStep}
            onChange={(e) => onStepChange(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="font-mono text-xs font-semibold text-slate-300 whitespace-nowrap min-w-[70px] text-right">
            {currentStep} / {totalSteps}
          </div>
        </div>
      </div>
    </div>
  );
};
