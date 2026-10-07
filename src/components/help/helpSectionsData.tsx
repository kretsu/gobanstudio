import React from 'react';
import { SectionItem } from './helpTypes';
import {
  Download,
  FileText,
  Keyboard,
  Layers,
  Lock,
  PenTool,
  Play,
  Sliders,
  Sparkles
} from 'lucide-react';

export const SECTIONS: SectionItem[] = [
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
