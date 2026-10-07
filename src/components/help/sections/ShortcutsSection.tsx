import React from 'react';
import { Keyboard } from 'lucide-react';

export const ShortcutsSection: React.FC = () => {
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
};
