import React from 'react';
import { Play } from 'lucide-react';

export const PlaybackScrubberSection: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Play className="w-5 h-5 text-cyan-400" />
          <span>Playback & Sequence Scrubber</span>
        </h3>
        <p className="text-slate-300 text-sm">
          Navigate through move sequences with precision using the bottom timeline controls.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
        <div className="space-y-2">
          <strong className="text-slate-100 text-sm block">Timeline Controls:</strong>
          <ul className="list-disc list-inside space-y-1.5 text-slate-300">
            <li><strong>First Move (|<kbd>&lt;</kbd>):</strong> Rewinds to the starting position (step 0).</li>
            <li><strong>Previous Move (<kbd>&lt;</kbd>):</strong> Steps back one move in the active sequence.</li>
            <li><strong>Play / Pause Slideshow:</strong> Autoplays moves at an optimal lecture cadence (~850ms per move).</li>
            <li><strong>Next Move (<kbd>&gt;</kbd>):</strong> Plays the next move in sequence.</li>
            <li><strong>Last Move (<kbd>&gt;</kbd>|):</strong> Advances immediately to the final move of the active sequence.</li>
            <li><strong>Interactive Scrubber Slider:</strong> Drag the slider freely to scrub to any exact move number in real-time.</li>
          </ul>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300 space-y-1">
          <strong className="text-cyan-300 block">💡 Variation Independence:</strong>
          <span>When you switch variations in the Layer Panel, the scrubber automatically adjusts its total steps to match the selected variation&apos;s length.</span>
        </div>
      </div>
    </div>
  );
};
