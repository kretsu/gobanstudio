import React from 'react';
import { ChevronDown, FileCode, Image, Save } from 'lucide-react';

interface HeaderExportMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onSaveProject: () => void;
  onExportSgf: () => void;
  onExportPng: () => void;
}

export const HeaderExportMenu: React.FC<HeaderExportMenuProps> = ({
  isOpen,
  onToggle,
  onSaveProject,
  onExportSgf,
  onExportPng
}) => {
  return (
    <div className="relative" data-header-menu>
      <button
        onClick={onToggle}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
        title="Save or Export"
      >
        <Save className="w-3.5 h-3.5" />
        <span>Save / Export</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs">
          <button
            onClick={onSaveProject}
            className="w-full text-left px-3.5 py-2 hover:bg-indigo-600/30 text-slate-200 transition-colors flex items-center gap-2.5"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="font-semibold">Save Project (.gobanstudio)</div>
              <div className="text-[10px] text-slate-400">Complete layers, drawings & tags</div>
            </div>
          </button>

          <button
            onClick={onExportSgf}
            className="w-full text-left px-3.5 py-2 hover:bg-indigo-600/30 text-slate-200 transition-colors flex items-center gap-2.5"
          >
            <FileCode className="w-4 h-4 text-amber-400" />
            <div>
              <div className="font-semibold">Export SGF (.sgf)</div>
              <div className="text-[10px] text-slate-400">Standard multi-variation tree</div>
            </div>
          </button>

          <button
            onClick={onExportPng}
            className="w-full text-left px-3.5 py-2 hover:bg-indigo-600/30 text-slate-200 transition-colors flex items-center gap-2.5"
          >
            <Image className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="font-semibold">Export Board Image (PNG)</div>
              <div className="text-[10px] text-slate-400">High-resolution slide snapshot</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
