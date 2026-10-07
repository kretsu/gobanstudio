import React from 'react';
import { HelpSectionId } from '../HelpModal';
import {
  ChevronDown,
  Download,
  HelpCircle,
  Keyboard,
  Layers,
  Lock,
  PenTool,
  Sparkles
} from 'lucide-react';

interface HeaderHelpMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onOpenHelp: (section?: HelpSectionId) => void;
  onClose: () => void;
}

export const HeaderHelpMenu: React.FC<HeaderHelpMenuProps> = ({
  isOpen,
  onToggle,
  onOpenHelp,
  onClose
}) => {
  return (
    <div className="relative" data-header-menu>
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/60"
        title="Help, User Guide & Keyboard Shortcuts"
      >
        <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
        <span className="hidden md:inline">Help</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between">
            <span>GobanStudio Help</span>
            <span className="font-mono text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">
              F1 / ?
            </span>
          </div>

          <button
            onClick={() => {
              onOpenHelp('overview');
              onClose();
            }}
            className="w-full text-left px-3.5 py-2 hover:bg-indigo-600/30 text-slate-200 transition-colors flex items-center gap-2.5"
          >
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div>
              <div className="font-semibold">Complete User Guide</div>
              <div className="text-[10px] text-slate-400">Overview, workspace & quick start</div>
            </div>
          </button>

          <button
            onClick={() => {
              onOpenHelp('layers-variations');
              onClose();
            }}
            className="w-full text-left px-3.5 py-2 hover:bg-indigo-600/30 text-slate-200 transition-colors flex items-center gap-2.5"
          >
            <Layers className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <div>
              <div className="font-semibold">Layers & Variations</div>
              <div className="text-[10px] text-slate-400">Root base, branching trees & sublayers</div>
            </div>
          </button>

          <button
            onClick={() => {
              onOpenHelp('locking');
              onClose();
            }}
            className="w-full text-left px-3.5 py-2 hover:bg-indigo-600/30 text-slate-200 transition-colors flex items-center gap-2.5"
          >
            <Lock className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <div>
              <div className="font-semibold">Locking & Protection</div>
              <div className="text-[10px] text-slate-400">Locking layers during live teaching</div>
            </div>
          </button>

          <button
            onClick={() => {
              onOpenHelp('markings-drawing');
              onClose();
            }}
            className="w-full text-left px-3.5 py-2 hover:bg-indigo-600/30 text-slate-200 transition-colors flex items-center gap-2.5"
          >
            <PenTool className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div>
              <div className="font-semibold">Markings & Drawing Tools</div>
              <div className="text-[10px] text-slate-400">Letters A-Z, 1-N, arrows, shapes & laser</div>
            </div>
          </button>

          <button
            onClick={() => {
              onOpenHelp('file-export-standalone');
              onClose();
            }}
            className="w-full text-left px-3.5 py-2 hover:bg-indigo-600/30 text-slate-200 transition-colors flex items-center gap-2.5"
          >
            <Download className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <div>
              <div className="font-semibold">File Formats & Standalone App</div>
              <div className="text-[10px] text-slate-400">.gobanstudio, SGF, PNG & Offline mode</div>
            </div>
          </button>

          <button
            onClick={() => {
              onOpenHelp('shortcuts');
              onClose();
            }}
            className="w-full text-left px-3.5 py-2 hover:bg-indigo-600/30 text-slate-200 transition-colors flex items-center gap-2.5 border-t border-slate-800"
          >
            <Keyboard className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <div>
              <div className="font-semibold">Keyboard Shortcuts</div>
              <div className="text-[10px] text-slate-400">Navigation, playback & quick keys</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
