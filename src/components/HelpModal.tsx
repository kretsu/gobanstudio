import React, { useState, useMemo, useEffect } from 'react';
import {
  HelpCircle,
  X,
  Search,
  Layers,
  Lock,
  Unlock,
  PenTool,
  Sliders,
  FileText,
  Download,
  Keyboard,
  Sparkles,
  GitBranch,
  Eye,
  EyeOff,
  Type,
  Hash,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  MoveRight,
  Minus,
  Radio,
  BookOpen,
  FolderOpen,
  Save,
  Image,
  ChevronRight
} from 'lucide-react';

export type HelpSectionId =
  | 'overview'
  | 'layers-variations'
  | 'locking'
  | 'markings-drawing'
  | 'playback-scrubber'
  | 'settings-themes'
  | 'lesson-notes'
  | 'file-export-standalone'
  | 'shortcuts';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: HelpSectionId;
}

interface SectionItem {
  id: HelpSectionId;
  title: string;
  icon: React.ReactNode;
  summary: string;
}

const SECTIONS: SectionItem[] = [
  {
    id: 'overview',
    title: 'Overview & Workspace',
    icon: <Sparkles className="w-4 h-4 text-amber-400" />,
    summary: 'Introduction to GobanStudio layout and core workflow'
  },
  {
    id: 'layers-variations',
    title: 'Layers & Variations',
    icon: <Layers className="w-4 h-4 text-indigo-400" />,
    summary: 'Root base game, branching variation trees, and subvariation overlays'
  },
  {
    id: 'locking',
    title: 'Locking & Protection',
    icon: <Lock className="w-4 h-4 text-rose-400" />,
    summary: 'Auto-branching variations (numbered from 1) and drawing overlays on locked layers'
  },
  {
    id: 'markings-drawing',
    title: 'Markings & Freehand Tools',
    icon: <PenTool className="w-4 h-4 text-emerald-400" />,
    summary: 'Letters (A..Z), numbers (1..N), shapes, arrows, lines, and laser pointer'
  },
  {
    id: 'playback-scrubber',
    title: 'Playback & Scrubber',
    icon: <Play className="w-4 h-4 text-cyan-400" />,
    summary: 'Move-by-move navigation, interactive scrubber, and slideshow autoplay'
  },
  {
    id: 'settings-themes',
    title: 'Themes & Display Settings',
    icon: <Sliders className="w-4 h-4 text-purple-400" />,
    summary: 'Studio UI themes (dark, light, cream, shell, slate), stone materials, board styles, and audio'
  },
  {
    id: 'lesson-notes',
    title: 'Commentary & Notes',
    icon: <FileText className="w-4 h-4 text-blue-400" />,
    summary: 'Lesson overview notes and per-variation tactical commentary'
  },
  {
    id: 'file-export-standalone',
    title: 'Files, SGF & Standalone',
    icon: <Download className="w-4 h-4 text-teal-400" />,
    summary: 'Project serialization (.gobanstudio), SGF trees, PNG export, and offline mode'
  },
  {
    id: 'shortcuts',
    title: 'Keyboard Shortcuts & Tips',
    icon: <Keyboard className="w-4 h-4 text-amber-300" />,
    summary: 'Quick keys, hotkeys, and productivity gestures'
  }
];

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
        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation Sidebar */}
          <div className="w-64 sm:w-72 border-r border-slate-800 bg-slate-900/50 flex flex-col flex-shrink-0 p-3 space-y-1 overflow-y-auto">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              Table of Contents
            </div>
            {filteredSections.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between group ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="flex-shrink-0">{sec.icon}</span>
                    <span className="truncate">{sec.title}</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${
                      isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                </button>
              );
            })}

            {filteredSections.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching topics found for &quot;{searchQuery}&quot;
              </div>
            )}
          </div>

          {/* Right Main Content Scroll Area */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-slate-950/30 text-sm leading-relaxed space-y-6">
            {activeSection === 'overview' && <OverviewSection onNavigate={setActiveSection} />}
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

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span>Tip: Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
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

/* =========================================================================
   SECTION SUB-COMPONENTS
   ========================================================================= */

function OverviewSection({ onNavigate }: { onNavigate: (id: HelpSectionId) => void }) {
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
}

function LayersVariationsSection() {
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
}

function LockingSection() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Lock className="w-5 h-5 text-rose-400" />
          <span>Locking & Layer Protection</span>
        </h3>
        <p className="text-slate-300 text-sm">
          Layer locking protects master game sequences and curated lesson diagrams from accidental alteration, while enabling seamless, non-destructive exploration through <strong>automatic branch and layer creation</strong>.
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
              1. Placing Stones on a Locked Layer &rarr; Auto-Creates Variation Layer
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
              Starts at Move 1
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            When you attempt to place a stone on any <strong>locked layer</strong> (such as the Root base game or a locked Joseki variation), GobanStudio does not block your input. Instead, it:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5 pl-2">
            <li><strong>Auto-creates a new Variation Layer</strong> branching from the current board position and step.</li>
            <li>Places the clicked stone as <strong>Move 1</strong> on this newly created variation layer.</li>
            <li>Subsequent stones continue numbering sequentially (<code className="text-amber-300 font-mono">1, 2, 3...</code>) on the new variation.</li>
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
}

function MarkingsDrawingSection() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <PenTool className="w-5 h-5 text-emerald-400" />
          <span>Goban Markings & Freehand Vector Drawing</span>
        </h3>
        <p className="text-slate-300 text-sm">
          Annotate tactical patterns, stone relationships, territory, and attacking directions with standard SGF markings and vector drawing tools.
        </p>
      </div>

      {/* Standard SGF Markings */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
          <span>Standard Goban Markings (SGF Compatible)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold">
              <Type className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-200 block">Letter Labels (A .. Z)</strong>
              <span className="text-slate-400">Sequential letters allocated independently per layer. Automatically reuses lowest available letter when marks are removed.</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-200 block">Number Labels (1 .. N)</strong>
              <span className="text-slate-400">Sequential numeric marks (1, 2, 3...) per layer. Auto-scales font size for 2-digit and 3-digit labels.</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-slate-800 text-cyan-400 flex items-center justify-center font-bold text-base">
              ▲ ■ ● ✖
            </div>
            <div>
              <strong className="text-slate-200 block">Geometric Shapes (TR, SQ, CR, MA)</strong>
              <span className="text-slate-400">Triangle (TR), Square (SQ), Circle (CR), and Cross (MA) to highlight vital points and eye shapes.</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-xs">
              TB / TW
            </div>
            <div>
              <strong className="text-slate-200 block">Territory Indicators (TB / TW)</strong>
              <span className="text-slate-400">Mark intersections as Black Territory or White Territory during endgame scoring demonstrations.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Freehand Vector Tools */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h4 className="font-bold text-sm text-amber-300 flex items-center gap-2">
          <span>Freehand Vector & Lecture Tools</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-slate-800 text-rose-400 flex items-center justify-center">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-200 block">Pen / Brush Tool</strong>
              <span className="text-slate-400">Freehand smooth vector stroke drawing. Customize brush color (Red, Amber, Emerald, Blue, Purple) and thickness (2px - 8px).</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-slate-800 text-amber-400 flex items-center justify-center">
              <MoveRight className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-200 block">Tactical Arrow Tool</strong>
              <span className="text-slate-400">Click and drag from start intersection to target intersection to draw crisp directional arrows showing attacks, liberties, or ladders.</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-slate-800 text-cyan-400 flex items-center justify-center">
              <Minus className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-200 block">Straight Line Tool</strong>
              <span className="text-slate-400">Click and drag to connect two points on the board, demonstrating connections, moyo boundaries, and cutting lines.</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-slate-800 text-rose-500 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-200 block">Live Laser Pointer</strong>
              <span className="text-slate-400">A fading glowing red spotlight for live online lectures and presentations. Highlights areas instantly without leaving permanent marks.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlaybackScrubberSection() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Play className="w-5 h-5 text-cyan-400" />
          <span>Playback & Sequence Scrubber</span>
        </h3>
        <p className="text-slate-300 text-sm">
          Navigate through move sequences with precision using the bottom timeline controls.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
        <div className="space-y-2">
          <strong className="text-slate-100 text-sm block">Timeline Controls:</strong>
          <ul className="list-disc list-inside space-y-1.5 text-slate-300">
            <li><strong>First Move (|<kbd>&lt;</kbd>):</strong> Rewinds to the starting position (step 0).</li>
            <li><strong>Previous Move (<kbd>&lt;</kbd>):</strong> Steps back one move in the active sequence.</li>
            <li><strong>Play / Pause Slideshow:</strong> Autoplays moves at an optimal lecture cadence (~850ms per move).</li>
            <li><strong>Next Move (<kbd>&gt;</kbd>):</strong> Plays the next move in sequence.</li>
            <li><strong>Last Move (<kbd>&gt;</kbd>|):</strong> Advances immediately to the final move of the active sequence.</li>
            <li><strong>Interactive Scrubber Slider:</strong> Drag the slider freely to scrub to any exact move number in real-time.</li>
          </ul>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300 space-y-1">
          <strong className="text-cyan-300 block">💡 Variation Independence:</strong>
          <span>When you switch variations in the Layer Panel, the scrubber automatically adjusts its total steps to match the selected variation&apos;s length.</span>
        </div>
      </div>
    </div>
  );
}

function SettingsThemesSection() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-purple-400" />
          <span>Themes, Stones & Board Display Settings</span>
        </h3>
        <p className="text-slate-300 text-sm">
          Customize the aesthetic and auditory experience for teaching, streaming, classroom projection, or book diagrams.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Studio UI Themes */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <strong className="text-purple-300 text-sm block">Studio UI Themes</strong>
          <p className="text-slate-300">
            Tailor the full studio workspace interface to your lighting and aesthetic preference:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li><strong className="text-slate-200">Dark Studio:</strong> High-contrast midnight theme optimized for low-light coaching.</li>
            <li><strong className="text-slate-200">Light Studio:</strong> Clean, bright modern studio with crisp cards and borders.</li>
            <li><strong className="text-slate-200">Warm Cream:</strong> Japanese washi & parchment cream tones with warm earthy accents.</li>
            <li><strong className="text-slate-200">Shell & Sand:</strong> Organic warm oyster shell mineral tones with sage/teal accents.</li>
            <li><strong className="text-slate-200">Deep Slate:</strong> Nordic blue-slate dark palette with vibrant ice blue highlights.</li>
          </ul>
        </div>

        {/* Stone Themes */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <strong className="text-purple-300 text-sm block">Stone Themes & Textures</strong>
          <p className="text-slate-300">
            Choose authentic materials and rendering styles for Go stones:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li><strong className="text-slate-200">Slate & Shell:</strong> Nachiguro slate and natural Hamaguri clam shell with delicate growth striations.</li>
            <li><strong className="text-slate-200">Glass Stones:</strong> High-gloss Shin-Garasu glass with brilliant curved specular highlights.</li>
            <li><strong className="text-slate-200">Yunzi Stones:</strong> Traditional Yunnan sintered stones with characteristic translucent jadeite-emerald rim glow.</li>
            <li><strong className="text-slate-200">Newspaper Flat:</strong> Minimalist, high-contrast monochrome vector style for publications, textbooks, and printing.</li>
            <li><strong className="text-slate-200">Classic 3D:</strong> Polished satin obsidian black and pearl white with realistic drop shadows.</li>
          </ul>
        </div>

        {/* Board Themes */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <strong className="text-purple-300 text-sm block">Goban Board Themes</strong>
          <p className="text-slate-300">
            Choose from 5 carefully tuned board wood and stone surfaces:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li><strong className="text-slate-200">Kaya:</strong> Traditional warm Japanese Hyuga kaya timber grain.</li>
            <li><strong className="text-slate-200">Wood:</strong> Classic golden oak timber texture.</li>
            <li><strong className="text-slate-200">Slate:</strong> Modern architectural cool stone surface.</li>
            <li><strong className="text-slate-200">Paper:</strong> Clean, crisp high-contrast white paper print style.</li>
            <li><strong className="text-slate-200">Dark:</strong> Deep charcoal board for low-strain night study.</li>
          </ul>
        </div>

        {/* Stone Numbering */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <strong className="text-purple-300 text-sm block">Stone Numbering Modes</strong>
          <p className="text-slate-300">
            Control how move numbers appear on placed stones:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li><strong className="text-slate-200">Auto (Default):</strong> Root moves numbered 1..N. When viewing variations, root stones are unnumbered while variation moves start at 1.</li>
            <li><strong className="text-slate-200">All:</strong> Always show move numbers on all stones.</li>
            <li><strong className="text-slate-200">Last Move:</strong> Only display a highlight circle on the latest played stone.</li>
            <li><strong className="text-slate-200">None:</strong> Clean presentation mode without any numbers.</li>
          </ul>
        </div>

        {/* Coordinates & Sound */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 sm:col-span-2">
          <strong className="text-purple-300 text-sm block">Coordinates & Sound Effects</strong>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
            <div>
              <strong>Coordinates Toggle:</strong> Display or hide standard Go grid coordinates (A..T along the top/bottom, 1..19 along the sides).
            </div>
            <div>
              <strong>Sound Effects:</strong> Realistic physical stone placement sounds using Web Audio API synthesis without external audio file latency.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LessonNotesSection() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          <span>Commentary & Lesson Notes</span>
        </h3>
        <p className="text-slate-300 text-sm">
          Keep comprehensive teaching notes, tactical questions, and student homework attached directly to your project.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs text-slate-300">
        <div>
          <strong className="text-blue-300 text-sm block mb-1">Two-Tier Commentary Structure:</strong>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong className="text-slate-100">Project Overview Notes:</strong> General lesson description, student rank recommendations, key takeaways, and lesson goals. Visible across the entire lesson.
            </li>
            <li>
              <strong className="text-slate-100">Variation-Specific Commentary:</strong> Dedicated tactical notes and move-by-move explanations for the active variation. When you switch variations in the Layer Panel, the commentary editor seamlessly switches to that variation&apos;s specific notes.
            </li>
          </ul>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300">
          <strong className="text-blue-300 block mb-0.5">SGF Serialization:</strong>
          <span>All notes and commentary are automatically preserved in both <code className="text-indigo-300">.gobanstudio</code> files and standard SGF <code className="text-indigo-300">C[...]</code> comment nodes upon export.</span>
        </div>
      </div>
    </div>
  );
}

function FileExportStandaloneSection() {
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
}

function ShortcutsSection() {
  const shortcutList = [
    { key: 'Left / Right Arrow', action: 'Previous / Next move in sequence' },
    { key: 'Home / End', action: 'Jump to First / Last move' },
    { key: 'Space', action: 'Toggle Play / Pause slideshow' },
    { key: 'Esc', action: 'Close Help / Deselect menu' },
    { key: 'Click Intersection', action: 'Place stone / Add active marking' },
    { key: 'Click Existing Stone / Mark', action: 'Remove stone / marking (or toggle)' },
    { key: 'Click & Drag', action: 'Draw freehand line / tactical arrow / straight line' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Keyboard className="w-5 h-5 text-amber-300" />
          <span>Keyboard Shortcuts & Quick Actions</span>
        </h3>
        <p className="text-slate-300 text-sm">
          Speed up your lesson preparation and live presentations with intuitive controls.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="pb-2.5 font-semibold">Shortcut / Gesture</th>
              <th className="pb-2.5 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {shortcutList.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30">
                <td className="py-2.5 pr-4">
                  <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-amber-300 font-mono text-[11px] shadow-sm">
                    {item.key}
                  </kbd>
                </td>
                <td className="py-2.5 text-slate-300">{item.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
