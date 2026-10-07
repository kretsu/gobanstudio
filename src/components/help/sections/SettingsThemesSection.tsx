import React from 'react';
import { Sliders } from 'lucide-react';

export const SettingsThemesSection: React.FC = () => {
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
};
