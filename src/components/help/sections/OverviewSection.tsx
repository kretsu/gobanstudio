import React from 'react';
import { HelpSectionId } from '../helpTypes';
import { FileText, Layers, PenTool } from 'lucide-react';

export const OverviewSection: React.FC<{ onNavigate: (id: HelpSectionId) => void }> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <span>Welcome to GobanStudio</span>
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          <strong>GobanStudio</strong> is a specialized Go (Weiqi / Baduk) lesson studio designed for Go teachers, coaches, and students.
          Unlike traditional SGF viewers that flatten move trees into confusing linear lists, GobanStudio introduces
          a <strong>photo editor-style multi-layered architecture</strong> with independent variation branches, transparent annotation overlays,
          and robust layer locking.
        </p>
      </div>

      {/* 3-Column Studio Workspace Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wide">
            <Layers className="w-4 h-4" />
            <span>1. Left: Layer Panel</span>
          </div>
          <p className="text-xs text-slate-300">
            Manage the Root game, branch variations, and subvariation overlays. Lock layers against accidental edits, toggle student visibility, and organize tags.
          </p>
          <button
            onClick={() => onNavigate('layers-variations')}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1"
          >
            Learn about Layers &rarr;
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
            <PenTool className="w-4 h-4" />
            <span>2. Center: Goban & Tools</span>
          </div>
          <p className="text-xs text-slate-300">
            Interactive 19×19 Goban with stone placement, sequential letters (A..Z) & numbers (1..N), tactical arrows, freehand lines, and laser pointer.
          </p>
          <button
            onClick={() => onNavigate('markings-drawing')}
            className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1"
          >
            Explore Markings & Tools &rarr;
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wide">
            <FileText className="w-4 h-4" />
            <span>3. Right: Lesson Notes</span>
          </div>
          <p className="text-xs text-slate-300">
            Record lesson objectives, study guides, and per-variation tactical commentary to accompany your live lectures or exported study files.
          </p>
          <button
            onClick={() => onNavigate('lesson-notes')}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1"
          >
            View Notes Guide &rarr;
          </button>
        </div>
      </div>

      {/* Core Workflow Steps */}
      <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-900/60 space-y-3">
        <h4 className="font-bold text-sm text-indigo-200">Recommended Teacher Workflow:</h4>
        <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300">
          <li><strong>Set up the Base Game:</strong> Place the main game stones or problem diagram on the <em>Root Layer</em> and lock it once finished.</li>
          <li><strong>Create Variation Branches:</strong> Click <em>&quot;+ Add Layer&quot;</em> in the Layer Panel to explore alternative responses or Joseki lines.</li>
          <li><strong>Add Sublayer Overlays:</strong> Add trial sequences or tactical markings on sublayers. Set them to hidden by default so you can reveal them interactively during class.</li>
          <li><strong>Illustrate Tactics:</strong> Use arrows and number/letter markings to highlight key shapes, liberties, and attacking directions.</li>
          <li><strong>Save & Share:</strong> Save the project as <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">.gobanstudio</code> or export standard SGF / high-res PNG images for worksheets.</li>
        </ol>
      </div>
    </div>
  );
};
