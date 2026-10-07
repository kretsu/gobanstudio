import React from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, SkipBack, SkipForward } from 'lucide-react';

interface PlaybackScrubberProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const PlaybackScrubber: React.FC<PlaybackScrubberProps> = ({
  currentStep,
  totalSteps,
  onStepChange,
  isPlaying,
  onTogglePlay
}) => {
  return (
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
  );
};
