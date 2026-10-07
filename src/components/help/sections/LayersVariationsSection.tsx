import React from 'react';
import { AlertTriangle, Eye, GitBranch, Layers } from 'lucide-react';

export const LayersVariationsSection: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <span>Working with Layers & Variations</span>
        </h3>
        <p className="text-slate-300 text-sm">
          GobanStudio structures Go positions hierarchically, giving you complete isolation and clarity for complex branching game trees.
        </p>
      </div>

      {/* Layer Types Grid */}
      <div className="space-y-4">
        {/* Root Layer */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-amber-300 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              Root Layer (Background / Base Game)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Move numbering: 1 .. N
            </span>
          </div>
          <p className="text-xs text-slate-300">
            The foundation of the lesson. It contains the base game sequence or initial problem setup. When viewing the Root Layer, moves are numbered sequentially from 1 to the last stone.
          </p>
        </div>

        {/* Variation Layers */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-indigo-300 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-indigo-400" />
              Variation Layers (Branching Trees)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Variation restarts at move 1
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Created under the Root Layer or nested under another variation. When viewing a variation:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pl-2">
            <li><strong>Root stones</strong> are displayed without numbers to provide clear board context.</li>
            <li><strong>Variation moves</strong> start counting from <strong>1</strong>, making student reading intuitive.</li>
            <li>Custom <strong>tags</strong> (e.g. <span className="text-indigo-400 font-mono">#Joseki</span>, <span className="text-rose-400 font-mono">#Mistake</span>, <span className="text-emerald-400 font-mono">#Tesuji</span>) can be attached for quick filtering.</li>
          </ul>
        </div>

        {/* Sublayers / Overlays */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-cyan-300 flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              Subvariation Layers (Overlays & Trial Sequences)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Default Hidden Option
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Sublayers are lightweight overlays attached to any layer. Use them for temporary trial stones, tactical markings, or freehand drawing annotations.
          </p>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-slate-200">💡 Interactive Lesson Technique:</div>
            <div>
              Set a sublayer&apos;s <em>Default Visibility</em> to hidden. When you load the lesson file in class, the trial variation or markings stay hidden until you click the eye icon to reveal the answer!
            </div>
          </div>
        </div>

        {/* Outdated Stale Indicator */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Outdated / Stale Layer Indicator</span>
          </div>
          <p className="text-xs text-slate-300">
            If you edit or delete parent moves on the Root layer after creating child variations or overlays, GobanStudio automatically flags affected sublayers with an <strong>Outdated</strong> badge, alerting you that the branch may need adjustments.
          </p>
        </div>
      </div>

      {/* Layer Actions Reference Table */}
      <div className="space-y-2">
        <h4 className="font-bold text-sm text-slate-200">Layer Operations:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2">
            <span className="font-semibold text-indigo-400 min-w-24">Add Variation:</span>
            <span className="text-slate-300">Click &quot;+ Add Layer&quot; at the top of the Layer Panel. Specify name, parent, and tags.</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2">
            <span className="font-semibold text-indigo-400 min-w-24">Add Sublayer:</span>
            <span className="text-slate-300">Click &quot;+ Subvariation&quot; on any layer row to create an overlay for markings or trial moves.</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2">
            <span className="font-semibold text-indigo-400 min-w-24">Rename / Tag:</span>
            <span className="text-slate-300">Click the layer options menu (<code className="text-slate-400">...</code>) to rename or edit variation tags.</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2">
            <span className="font-semibold text-indigo-400 min-w-24">Duplicate:</span>
            <span className="text-slate-300">Create an exact clone of a variation to explore multiple branching sub-options without losing work.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
