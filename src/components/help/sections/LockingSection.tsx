import React from 'react';
import { AlertTriangle, CheckCircle2, GitBranch, Lock, PenTool, Sparkles } from 'lucide-react';

export const LockingSection: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Lock className="w-5 h-5 text-rose-400" />
          <span>Locking & Layer Protection</span>
        </h3>
        <p className="text-slate-300 text-sm">
          Layer locking protects master game sequences and curated lesson diagrams from accidental alteration, while enabling seamless, non-destructive exploration through <strong>automatic branch and layer creation</strong>. By default, all layers including the Root layer are locked after loading a project or SGF file.
        </p>
      </div>

      {/* Auto-Creation Highlights */}
      <div className="space-y-4">
        <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Automatic Branching & Layer Generation on Locked Layers</span>
        </h4>

        {/* Placing Stones on Locked Layer */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-amber-300 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-amber-400" />
              1. Placing Stones on a Locked Layer &rarr; Smart Navigation & Auto-Branching
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
              Smart Navigation
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            When you attempt to place a stone on any <strong>locked layer</strong> (such as the Root base game or a locked Joseki variation), GobanStudio does not block your input. Instead, it intelligently checks:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5 pl-2">
            <li><strong>Next Move in Sequence:</strong> If the played stone is the next move in the active locked sequence, it simply advances playback to show that move.</li>
            <li><strong>Existing Variations:</strong> If an existing child variation branching at this step starts with this move, it immediately navigates to that variation.</li>
            <li><strong>New Branch Creation:</strong> If the move does not exist in the active sequence or any child variation, it <strong>auto-creates a new Variation Layer</strong> branching from the current step.</li>
            <li>The locked parent layer remains completely protected, unaltered, and intact.</li>
          </ul>
        </div>

        {/* Drawing on Locked Layer */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-cyan-300 flex items-center gap-2">
              <PenTool className="w-4 h-4 text-cyan-400" />
              2. Drawing on a Locked Layer &rarr; Auto-Creates Drawing Overlay Layer
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
              Drawing Overlay
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            When you sketch with freehand brushes, tactical arrows, or straight lines on a locked layer (or on a locked sublayer):
          </p>
          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5 pl-2">
            <li>GobanStudio <strong>automatically creates a new Drawing Sublayer</strong> (e.g. <code className="text-cyan-300 font-mono">Drawing Overlay 1</code>).</li>
            <li>Your drawings and arrows are immediately saved onto the new sublayer without modifying the locked underlying board.</li>
            <li>You can annotate, highlight liberties, and draw attacking vectors freely without having to manually create or unlock layers first.</li>
          </ul>
        </div>
      </div>

      {/* Direct Modification & Deletion Guard */}
      <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/50 text-xs text-slate-300 space-y-2">
        <h4 className="font-bold text-rose-300 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>Protection Against Accidental Deletions & Destructive Edits</span>
        </h4>
        <p>
          Direct destructive actions—such as using the <strong>Stone Eraser / Remove Stone</strong> tool or deleting moves directly from a locked layer—are guarded and blocked with a warning toast. This guarantees that curated problem diagrams, master lecture trees, and canonical positions cannot be accidentally corrupted during classroom discussions.
        </p>
      </div>

      {/* How to Lock & Unlock */}
      <div className="space-y-3">
        <h4 className="font-bold text-sm text-slate-100">How to Lock & Unlock Layers:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-slate-800 text-rose-400 flex-shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-100 block mb-0.5">Toggle via Layer Menu:</strong>
              <span>Hover over any layer or sublayer in the Layer Panel, click the options menu (<code className="text-slate-400">...</code>), and choose <strong>Lock Layer</strong> or <strong>Unlock Layer</strong>.</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-slate-800 text-amber-400 flex-shrink-0">
              <span className="font-mono text-sm">🔒</span>
            </div>
            <div>
              <strong className="text-slate-100 block mb-0.5">Visual Lock Indicators:</strong>
              <span>Locked layers display a padlock icon in the Layer tree and a prominent <code className="text-amber-300">🔒 Editing Locked</code> or <code className="text-amber-300">🔒 Subvariation Locked</code> status in the top board header.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Why This Design Excels for Go Teaching */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Key Benefits for Teachers & Students</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
            <strong className="text-amber-300 block">1. Zero Friction Exploration</strong>
            <span>Click any intersection during a live lecture to immediately test a student proposal without worrying about creating branches in advance.</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
            <strong className="text-indigo-300 block">2. Clean Move Sequences</strong>
            <span>Every branched variation restarts numbering at 1, making move sequences crisp and easy for students to read.</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
            <strong className="text-cyan-300 block">3. Safe Live Markings</strong>
            <span>Draw arrows and highlights over master positions instantly without dirtying or modifying underlying games.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
