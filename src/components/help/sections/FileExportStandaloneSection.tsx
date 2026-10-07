import React from 'react';
import { Download, FolderOpen, Image, Save, Sparkles } from 'lucide-react';

export const FileExportStandaloneSection: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Download className="w-5 h-5 text-teal-400" />
          <span>File Formats, SGF Export & Standalone Offline App</span>
        </h3>
        <p className="text-slate-300 text-sm">
          GobanStudio provides versatile serialization and zero-dependency offline distribution.
        </p>
      </div>

      <div className="space-y-4 text-xs">
        {/* Project Format */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-sm text-indigo-300">
            <Save className="w-4 h-4" />
            <span>Native Project File (.gobanstudio)</span>
          </div>
          <p className="text-slate-300">
            Stores the complete rich studio state: layer hierarchies, sublayers, lock statuses, default visibility flags, tags, teacher commentary, vector brush drawings, and arrows.
          </p>
        </div>

        {/* Standard SGF */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
            <FolderOpen className="w-4 h-4" />
            <span>Standard SGF Export & Import (.sgf)</span>
          </div>
          <p className="text-slate-300">
            Exports multi-branch variation trees, stone moves, comments, and standard Go markings (TR, SQ, CR, MA, LB, TB, TW). Compatible with all major Go programs (OGS, KGS, Sabaki, KaTrain, Fox).
          </p>
        </div>

        {/* PNG Export */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-sm text-cyan-300">
            <Image className="w-4 h-4" />
            <span>Board Image Export (PNG Snapshot)</span>
          </div>
          <p className="text-slate-300">
            Exports a crisp, high-resolution PNG image of the current board state including stones, markings, and vector drawings for use in slides, homework sheets, or articles.
          </p>
        </div>

        {/* Standalone Offline Build */}
        <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-900/60 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-teal-300">
            <Sparkles className="w-4 h-4" />
            <span>Standalone Single-File Build (100% Offline / No Server)</span>
          </div>
          <p className="text-slate-300">
            GobanStudio can be packaged into a single, fully self-contained HTML file:
          </p>
          <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-teal-300 font-mono text-[11px] overflow-x-auto">
            npm run build:standalone
          </pre>
          <p className="text-slate-400">
            This generates <code className="text-slate-200">dist-standalone/index.html</code> (with all scripts, styles, and assets inlined). You can open it directly from disk in any browser (<code className="text-slate-200">file://</code>) or share it on a USB flash drive with zero installation.
          </p>
        </div>
      </div>
    </div>
  );
};
