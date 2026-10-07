import React, { useState, useRef, useEffect } from 'react';
import { BoardTheme, GobanProject, NumberingMode, StoneTheme, UiTheme } from '../types/goban';
import { HelpSectionId } from './HelpModal';
import { FilePlus, FolderOpen } from 'lucide-react';
import {
  HeaderTitle,
  HeaderCaptures,
  HeaderSampleMenu,
  HeaderExportMenu,
  HeaderHelpMenu,
  HeaderSettingsMenu
} from './header/index';

export interface HeaderProps {
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
        <HeaderTitle title={project.title} onUpdateTitle={onUpdateTitle} />
      </div>

      {/* Center: Prisoners / Captures counter */}
      <HeaderCaptures captures={captures} />

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
        <HeaderSampleMenu
          isOpen={isSampleMenuOpen}
          onToggle={() => {
            setIsSampleMenuOpen(!isSampleMenuOpen);
            setIsExportMenuOpen(false);
            setIsHelpMenuOpen(false);
            setIsSettingsOpen(false);
          }}
          onClose={() => setIsSampleMenuOpen(false)}
          onLoadSample={onLoadSample}
        />

        {/* Save & Export Dropdown */}
        <HeaderExportMenu
          isOpen={isExportMenuOpen}
          onToggle={() => {
            setIsExportMenuOpen(!isExportMenuOpen);
            setIsSampleMenuOpen(false);
            setIsHelpMenuOpen(false);
            setIsSettingsOpen(false);
          }}
          onSaveProject={onSaveProject}
          onExportSgf={onExportSgf}
          onExportPng={onExportPng}
        />

        {/* Help Menu Dropdown */}
        <HeaderHelpMenu
          isOpen={isHelpMenuOpen}
          onToggle={() => {
            setIsHelpMenuOpen(!isHelpMenuOpen);
            setIsSampleMenuOpen(false);
            setIsExportMenuOpen(false);
            setIsSettingsOpen(false);
          }}
          onOpenHelp={onOpenHelp}
          onClose={() => setIsHelpMenuOpen(false)}
        />

        {/* Board & UI Settings Modal Toggle */}
        <HeaderSettingsMenu
          isOpen={isSettingsOpen}
          onToggle={() => {
            setIsSettingsOpen(!isSettingsOpen);
            setIsSampleMenuOpen(false);
            setIsExportMenuOpen(false);
            setIsHelpMenuOpen(false);
          }}
          uiTheme={uiTheme}
          setUiTheme={setUiTheme}
          stoneTheme={stoneTheme}
          setStoneTheme={setStoneTheme}
          boardTheme={boardTheme}
          setBoardTheme={setBoardTheme}
          numberingMode={numberingMode}
          setNumberingMode={setNumberingMode}
          showCoordinates={showCoordinates}
          setShowCoordinates={setShowCoordinates}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
        />
      </div>
    </header>
  );
};
