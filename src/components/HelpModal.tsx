import React, { useState, useMemo, useEffect } from 'react';
import {
  HelpCircle,
  X,
  Search,
  ChevronRight
} from 'lucide-react';
import {
  HelpSectionId,
  SECTIONS,
  OverviewSection,
  LayersVariationsSection,
  LockingSection,
  MarkingsDrawingSection,
  PlaybackScrubberSection,
  SettingsThemesSection,
  LessonNotesSection,
  FileExportStandaloneSection,
  ShortcutsSection
} from './help/index';

export type { HelpSectionId };

export interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: HelpSectionId;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  initialSection = 'overview'
}) => {
  const [activeSection, setActiveSection] = useState<HelpSectionId>(initialSection);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return SECTIONS;
    const q = searchQuery.toLowerCase();
    return SECTIONS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      {/* Modal Container */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden text-slate-100">
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md border border-indigo-400/40">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
                GobanStudio Help & Documentation
                <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  User Guide
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Master layers, variations, markings, locking, and interactive teaching tools
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative hidden sm:block w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search features, tools, rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Help (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Layout: Sidebar + Main Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          
          {/* Sidebar Nav */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/40 p-3 overflow-y-auto flex-shrink-0 flex md:flex-col gap-1.5">
            {filteredSections.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex-shrink-0">{sec.icon}</span>
                    <span className="truncate">{sec.title}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400 hidden md:block flex-shrink-0" />}
                </button>
              );
            })}

            {filteredSections.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching topics found
              </div>
            )}
          </div>

          {/* Main Topic Content Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-900/60">
            {activeSection === 'overview' && (
              <OverviewSection onNavigate={(id) => setActiveSection(id)} />
            )}
            {activeSection === 'layers-variations' && <LayersVariationsSection />}
            {activeSection === 'locking' && <LockingSection />}
            {activeSection === 'markings-drawing' && <MarkingsDrawingSection />}
            {activeSection === 'playback-scrubber' && <PlaybackScrubberSection />}
            {activeSection === 'settings-themes' && <SettingsThemesSection />}
            {activeSection === 'lesson-notes' && <LessonNotesSection />}
            {activeSection === 'file-export-standalone' && <FileExportStandaloneSection />}
            {activeSection === 'shortcuts' && <ShortcutsSection />}
          </div>
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-mono">
              Esc
            </kbd>
            <span>anytime to return to your board</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow"
          >
            Got it, Let&apos;s Play
          </button>
        </div>

      </div>
    </div>
  );
};
