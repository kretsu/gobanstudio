import React from 'react';
import { Hash, Minus, MoveRight, PenTool, Radio, Type } from 'lucide-react';

export const MarkingsDrawingSection: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <PenTool className="w-5 h-5 text-emerald-400" />
          <span>Goban Markings & Freehand Vector Drawing</span>
        </h3>
        <p className="text-slate-300 text-sm">
          Annotate tactical patterns, stone relationships, territory, and attacking directions with standard SGF markings and vector drawing tools.
        </p>
      </div>

      {/* Standard SGF Markings */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
          <span>Standard Goban Markings (SGF Compatible)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold">
              <Type className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-200 block">Letter Labels (A .. Z)</strong>
              <span className="text-slate-400">Sequential letters allocated independently per layer. Automatically reuses lowest available letter when marks are removed.</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-200 block">Number Labels (1 .. N)</strong>
              <span className="text-slate-400">Sequential numeric marks (1, 2, 3...) per layer. Auto-scales font size for 2-digit and 3-digit labels.</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-slate-800 text-cyan-400 flex items-center justify-center font-bold text-base">
              ▲ ■ ● ✖
            </div>
            <div>
              <strong className="text-slate-200 block">Geometric Shapes (TR, SQ, CR, MA)</strong>
              <span className="text-slate-400">Triangle (TR), Square (SQ), Circle (CR), and Cross (MA) to highlight vital points and eye shapes.</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-xs">
              TB / TW
            </div>
            <div>
              <strong className="text-slate-200 block">Territory Indicators (TB / TW)</strong>
              <span className="text-slate-400">Mark intersections as Black Territory or White Territory during endgame scoring demonstrations.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Freehand Vector Tools */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h4 className="font-bold text-sm text-amber-300 flex items-center gap-2">
          <span>Freehand Vector & Lecture Tools</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-slate-800 text-rose-400 flex items-center justify-center">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-200 block">Pen / Brush Tool</strong>
              <span className="text-slate-400">Freehand smooth vector stroke drawing. Customize brush color (Red, Amber, Emerald, Blue, Purple) and thickness (2px - 8px).</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-slate-800 text-amber-400 flex items-center justify-center">
              <MoveRight className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-200 block">Tactical Arrow Tool</strong>
              <span className="text-slate-400">Click and drag from start intersection to target intersection to draw crisp directional arrows showing attacks, liberties, or ladders.</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-slate-800 text-cyan-400 flex items-center justify-center">
              <Minus className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-200 block">Straight Line Tool</strong>
              <span className="text-slate-400">Click and drag to connect two points on the board, demonstrating connections, moyo boundaries, and cutting lines.</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-slate-800 text-rose-500 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-200 block">Live Laser Pointer</strong>
              <span className="text-slate-400">A fading glowing red spotlight for live online lectures and presentations. Highlights areas instantly without leaving permanent marks.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
