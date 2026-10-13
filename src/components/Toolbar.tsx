import React from 'react';
import { ToolType } from '../types/goban';
import {
  StoneTools,
  MarkingTools,
  DrawingTools,
  BrushControls,
  PlaybackScrubber
} from './toolbar/index';

export interface ToolbarProps {
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
  onUndoDrawing?: () => void;
  onPassMove?: () => void;
  isLocked: boolean;
}

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
  onUndoDrawing,
  onPassMove
}) => {
  return (
    <div className="flex flex-col gap-3 bg-slate-850/90 border-t border-slate-700/80 p-3 select-none backdrop-blur shadow-lg">
      {/* Top row: Tools categories */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Stone Tools */}
        <StoneTools
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          onPass={onPassMove}
        />

        {/* Go Markings Tools */}
        <MarkingTools activeTool={activeTool} setActiveTool={setActiveTool} />

        {/* Freehand Drawing & Vector Tools */}
        <DrawingTools
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          onClearDrawings={onClearDrawings}
          onUndoDrawing={onUndoDrawing}
        />

        {/* Color Palette & Brush Size (Visible when in drawing mode) */}
        {activeTool.startsWith('draw-') && (
          <BrushControls
            brushColor={brushColor}
            setBrushColor={setBrushColor}
            brushWidth={brushWidth}
            setBrushWidth={setBrushWidth}
          />
        )}
      </div>

      {/* Bottom row: Sequence step playback & Scrubber */}
      <PlaybackScrubber
        currentStep={currentStep}
        totalSteps={totalSteps}
        onStepChange={onStepChange}
        isPlaying={isPlaying}
        onTogglePlay={onTogglePlay}
      />
    </div>
  );
};
