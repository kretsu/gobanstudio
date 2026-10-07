import React from 'react';
import { BoardTheme, NumberingMode, StoneTheme, UiTheme } from '../../types/goban';
import { Palette, Sliders } from 'lucide-react';

interface HeaderSettingsMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  uiTheme: UiTheme;
  setUiTheme: (theme: UiTheme) => void;
  stoneTheme: StoneTheme;
  setStoneTheme: (theme: StoneTheme) => void;
  boardTheme: BoardTheme;
  setBoardTheme: (theme: BoardTheme) => void;
  numberingMode: NumberingMode;
  setNumberingMode: (mode: NumberingMode) => void;
  showCoordinates: boolean;
  setShowCoordinates: (show: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export const HeaderSettingsMenu: React.FC<HeaderSettingsMenuProps> = ({
  isOpen,
  onToggle,
  uiTheme,
  setUiTheme,
  stoneTheme,
  setStoneTheme,
  boardTheme,
  setBoardTheme,
  numberingMode,
  setNumberingMode,
  showCoordinates,
  setShowCoordinates,
  soundEnabled,
  setSoundEnabled
}) => {
  return (
    <div className="relative" data-header-menu>
      <button
        onClick={onToggle}
        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
        title="Themes, Display & Audio Preferences"
      >
        <Sliders className="w-4 h-4" />
      </button>

      {isOpen && (
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
  );
};
