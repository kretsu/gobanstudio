import React, {useRef, useState} from 'react';
import {BoardTheme, GobanProject, NumberingMode} from '../types/goban';
import {SAMPLE_LESSONS} from './SampleLessons';
import {BookOpen, Check, ChevronDown, FileCode, FilePlus, FolderOpen, Image, Save, Sliders} from 'lucide-react';

interface HeaderProps {
  project: GobanProject;
  boardTheme: BoardTheme;
  setBoardTheme: (theme: BoardTheme) => void;
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
}

export const Header: React.FC<HeaderProps> = ({
  project,
  boardTheme,
  setBoardTheme,
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
  onUpdateTitle
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSampleMenuOpen, setIsSampleMenuOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(project.title);

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
      <div className="hidden lg:flex items-center gap-3 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-slate-950 border border-slate-600 inline-block" />
          <span className="text-slate-300">Captures: <strong className="text-white">{captures.B}</strong></span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-white border border-slate-300 inline-block" />
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
        <div className="relative">
          <button
            onClick={() => setIsSampleMenuOpen(!isSampleMenuOpen)}
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
        <div className="relative">
          <button
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
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

        {/* Board Settings Modal Toggle */}
        <div className="relative">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Board Display & Audio Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {isSettingsOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 text-xs space-y-3">
              <div className="font-bold text-slate-300 border-b border-slate-800 pb-1.5">
                Display & Preferences
              </div>

              {/* Theme Picker */}
              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Board Theme</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['kaya', 'wood', 'slate', 'paper', 'dark'] as BoardTheme[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setBoardTheme(t)}
                      className={`px-2 py-1 rounded text-center capitalize text-[11px] font-medium transition-colors ${
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
                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Stone Numbers</label>
                <div className="grid grid-cols-2 gap-1">
                  {(['auto', 'all', 'last-only', 'none'] as NumberingMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setNumberingMode(m)}
                      className={`px-2 py-1 rounded text-center capitalize text-[10px] font-medium transition-colors ${
                        numberingMode === m ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      {m === 'auto' ? 'Auto (Root/Var)' : m === 'last-only' ? 'Last Move' : m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">Show Coordinates</span>
                  <input
                    type="checkbox"
                    checked={showCoordinates}
                    onChange={(e) => setShowCoordinates(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">Sound Effects</span>
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
