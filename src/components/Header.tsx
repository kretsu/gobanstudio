import React, { useState, useRef, useEffect } from 'react';
import {BoardTheme, GobanProject, NumberingMode, StoneTheme, UiTheme} from '../types/goban';
import {SAMPLE_LESSONS} from './SampleLessons';
import {HelpSectionId} from './HelpModal';
import {
  BookOpen,
  Check,
  ChevronDown,
  Download,
  FileCode,
  FilePlus,
  FolderOpen,
  HelpCircle,
  Image,
  Keyboard,
  Layers,
  Lock,
  Palette,
  PenTool,
  Save,
  Sliders,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';

interface HeaderProps {
  project: GobanProject;
  boardTheme: BoardTheme;
  setBoardTheme: (theme: BoardTheme) => void;
  stoneTheme: StoneTheme;
  setStoneTheme: (theme: StoneTheme) => void;
  uiTheme: UiTheme;
  setUiTheme: (theme: UiTheme) => void;
  showCoordinates: boolean;
  setShowCoordinates: (show: boolean) => void;
  numberingMode: NumberingMode;
  setNumberingMode: (mode: NumberingMode) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  captures: { B: number; W: number };
  onNewProject: () => void;
  onOpenFile: (file: File) => void;
  onSaveProject: () => void;
  onExportSgf: () => void;
  onExportPng: () => void;
  onLoadSample: (sampleProject: GobanProject) => void;
  onUpdateTitle: (title: string) => void;
  onOpenHelp: (section?: HelpSectionId) => void;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  boardTheme,
  setBoardTheme,
  stoneTheme,
  setStoneTheme,
  uiTheme,
  setUiTheme,
  showCoordinates,
  setShowCoordinates,
  numberingMode,
  setNumberingMode,
  soundEnabled,
  setSoundEnabled,
  captures,
  onNewProject,
  onOpenFile,
  onSaveProject,
  onExportSgf,
  onExportPng,
  onLoadSample,
  onUpdateTitle,
  onOpenHelp
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSampleMenuOpen, setIsSampleMenuOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(project.title);

  // Close dropdown menus when user clicks outside or presses Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent | PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('[data-header-menu]')) {
        return;
      }
      setIsSampleMenuOpen(false);
      setIsExportMenuOpen(false);
      setIsHelpMenuOpen(false);
      setIsSettingsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSampleMenuOpen(false);
        setIsExportMenuOpen(false);
        setIsHelpMenuOpen(false);
        setIsSettingsOpen(false);
      }
    };

    if (isSampleMenuOpen || isExportMenuOpen || isHelpMenuOpen || isSettingsOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSampleMenuOpen, isExportMenuOpen, isHelpMenuOpen, isSettingsOpen]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onOpenFile(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleTitleSubmit = () => {
    onUpdateTitle(titleValue.trim() || 'Untitled Go Lesson');
    setIsEditingTitle(false);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-700/80 px-4 py-2.5 flex items-center justify-between gap-4 select-none z-30 shadow-md">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".gobanstudio,.gobanshow,.goban,.sgf,.json"
        className="hidden"
      />

      {/* Left: App Branding & Project Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md border border-amber-400/40">
            <span className="font-bold text-slate-950 text-xs tracking-tighter">碁</span>
          </div>
          <span className="font-extrabold text-slate-100 tracking-tight text-sm hidden sm:inline">
            GobanStudio
          </span>
        </div>

        <div className="h-4 w-px bg-slate-700 hidden sm:block" />

        {/* Editable Lesson Title */}
        {isEditingTitle ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              className="bg-slate-800 text-xs font-semibold px-2 py-1 rounded border border-indigo-500 text-slate-100 focus:outline-none"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
            />
            <button
              onClick={handleTitleSubmit}
              className="p-1 text-emerald-400 hover:text-emerald-300"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => {
              setTitleValue(project.title);
              setIsEditingTitle(true);
            }}
            className="flex items-center gap-1.5 cursor-pointer group"
            title="Click to rename lesson"
          >
            <span className="font-semibold text-xs text-slate-200 group-hover:text-indigo-300 transition-colors truncate max-w-xs md:max-w-md">
              {project.title}
            </span>
            <span className="text-[10px] text-slate-500 group-hover:text-slate-400">✏️</span>
          </div>
        )}
      </div>

      {/* Center: Prisoners / Captures counter */}
      <div className="hidden lg:flex items-center gap-3 bg-slate-800/80 px-3.5 py-1 rounded-full border border-slate-700/80 text-xs font-mono shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border border-slate-700 inline-block shadow-sm" style={{ backgroundColor: '#18181b' }} />
          <span className="text-slate-300">Captures: <strong className="text-white">{captures.B}</strong></span>
        </div>
        <div className="h-3 w-px bg-slate-700/80" />
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border border-slate-300 inline-block shadow-sm" style={{ backgroundColor: '#ffffff' }} />
          <span className="text-slate-300">Captures: <strong className="text-white">{captures.W}</strong></span>
        </div>
      </div>

      {/* Right: Actions, Menus & Mode Switcher */}
      <div className="flex items-center gap-2">
        {/* File Actions */}
        <button
          onClick={onNewProject}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="New Lesson"
        >
          <FilePlus className="w-4 h-4" />
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/60"
          title="Open .gobanstudio or .sgf file from disk"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Open</span>
        </button>

        {/* Sample Lessons Dropdown */}
        <div className="relative" data-header-menu>
          <button
            onClick={() => {
              setIsSampleMenuOpen(!isSampleMenuOpen);
              setIsExportMenuOpen(false);
              setIsHelpMenuOpen(false);
              setIsSettingsOpen(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/60"
            title="Load sample lessons"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Samples</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {isSampleMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs">
              <div className="px-3 py-1 font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                Pre-Loaded Lesson Material
              </div>
              {SAMPLE_LESSONS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => {
                    onLoadSample(sample.project);
                    setIsSampleMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-indigo-600/30 text-slate-200 transition-colors flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-slate-100">{sample.title}</span>
                  <span className="text-[10px] text-slate-400">{sample.subtitle}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Save & Export Dropdown */}
        <div className="relative" data-header-menu>
          <button
            onClick={() => {
              setIsExportMenuOpen(!isExportMenuOpen);
              setIsSampleMenuOpen(false);
              setIsHelpMenuOpen(false);
              setIsSettingsOpen(false);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
            title="Save or Export"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save / Export</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {isExportMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs">
              <button
                onClick={() => {
                  onSaveProject();
                  setIsExportMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-indigo-600/30 text-slate-200 transition-colors flex items-center gap-2.5"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-semibold">Save Project (.gobanstudio)</div>
                  <div className="text-[10px] text-slate-400">Complete layers, drawings & tags</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onExportSgf();
                  setIsExportMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-indigo-600/30 text-slate-200 transition-colors flex items-center gap-2.5"
              >
                <FileCode className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-semibold">Export SGF (.sgf)</div>
                  <div className="text-[10px] text-slate-400">Standard multi-variation tree</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onExportPng();
                  setIsExportMenuOpen(false);
                }}
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

        {/* Help Menu Dropdown */}
        <div className="relative" data-header-menu>
          <button
            onClick={() => {
              setIsHelpMenuOpen(!isHelpMenuOpen);
              setIsSampleMenuOpen(false);
              setIsExportMenuOpen(false);
              setIsSettingsOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/60"
            title="Help, User Guide & Keyboard Shortcuts"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Help</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {isHelpMenuOpen && (
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
                  setIsHelpMenuOpen(false);
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
                  setIsHelpMenuOpen(false);
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
                  setIsHelpMenuOpen(false);
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
                  setIsHelpMenuOpen(false);
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
                  setIsHelpMenuOpen(false);
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
                  setIsHelpMenuOpen(false);
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

        {/* Board & UI Settings Modal Toggle */}
        <div className="relative" data-header-menu>
          <button
            onClick={() => {
              setIsSettingsOpen(!isSettingsOpen);
              setIsSampleMenuOpen(false);
              setIsExportMenuOpen(false);
              setIsHelpMenuOpen(false);
            }}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
            title="Themes, Display & Audio Preferences"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {isSettingsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3.5 z-50 text-xs space-y-3.5 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between font-bold text-slate-100 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-indigo-400" />
                  Studio Themes & Settings
                </span>
              </div>

              {/* UI Theme Picker */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-400 text-[10px] uppercase font-bold">Studio UI Theme</label>
                  <span className="text-[10px] text-slate-500 capitalize">{uiTheme}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'dark' as UiTheme, label: 'Dark Studio', color: 'bg-slate-950 border-slate-700' },
                    { id: 'light' as UiTheme, label: 'Light Studio', color: 'bg-slate-100 border-slate-300' },
                    { id: 'cream' as UiTheme, label: 'Warm Cream', color: 'bg-[#f7f3e8] border-[#d8cbb5]' },
                    { id: 'shell' as UiTheme, label: 'Shell & Sand', color: 'bg-[#ece7de] border-[#c7bea9]' },
                    { id: 'slate' as UiTheme, label: 'Deep Slate', color: 'bg-[#070c18] border-[#23395f]' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setUiTheme(item.id)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[11px] font-medium transition-all ${
                        uiTheme === item.id
                          ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 ${item.color}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stone Theme Picker */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-400 text-[10px] uppercase font-bold">Stone Theme</label>
                  <span className="text-[10px] text-slate-500 capitalize">
                    {stoneTheme === 'slate-shell'
                      ? 'Slate & Shell'
                      : stoneTheme === 'flat'
                      ? 'Newspaper'
                      : stoneTheme}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { id: 'slate-shell' as StoneTheme, label: 'Slate & Shell', desc: 'Natural clam shell & slate texture' },
                    { id: 'glass' as StoneTheme, label: 'Glass Stones', desc: 'High-gloss Japanese / Korean glass' },
                    { id: 'yunzi' as StoneTheme, label: 'Yunzi Stones', desc: 'Translucent jade emerald glow' },
                    { id: 'flat' as StoneTheme, label: 'Newspaper Flat', desc: 'Crisp publication & diagram print' },
                    { id: 'classic' as StoneTheme, label: 'Classic 3D', desc: 'Polished obsidian & pearl satin' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStoneTheme(s.id)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all ${
                        stoneTheme === s.id
                          ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      <div>
                        <div className="text-[11px] font-semibold">{s.label}</div>
                        <div className={`text-[9px] ${stoneTheme === s.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {s.desc}
                        </div>
                      </div>
                      <div className="flex items-center -space-x-1 flex-shrink-0 ml-2">
                        <span className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-700" />
                        <span className="w-3.5 h-3.5 rounded-full bg-slate-100 border border-slate-300" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Board Theme Picker */}
              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1.5">Goban Board Theme</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['kaya', 'wood', 'slate', 'paper', 'dark'] as BoardTheme[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setBoardTheme(t)}
                      className={`px-2 py-1 rounded-lg text-center capitalize text-[11px] font-medium transition-colors ${
                        boardTheme === t ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Numbering Style */}
              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1.5">Stone Numbers</label>
                <div className="grid grid-cols-2 gap-1">
                  {(['auto', 'all', 'last-only', 'none'] as NumberingMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setNumberingMode(m)}
                      className={`px-2 py-1 rounded-lg text-center capitalize text-[10px] font-medium transition-colors ${
                        numberingMode === m ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      {m === 'auto' ? 'Auto (Root/Var)' : m === 'last-only' ? 'Last Move' : m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300 text-xs">Show Coordinates</span>
                  <input
                    type="checkbox"
                    checked={showCoordinates}
                    onChange={(e) => setShowCoordinates(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300 text-xs">Sound Effects</span>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
