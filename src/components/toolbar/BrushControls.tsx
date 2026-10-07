import React from 'react';

export const COLOR_PALETTE = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Black', hex: '#0f172a' }
];

interface BrushControlsProps {
  brushColor: string;
  setBrushColor: (color: string) => void;
  brushWidth: number;
  setBrushWidth: (width: number) => void;
}

export const BrushControls: React.FC<BrushControlsProps> = ({
  brushColor,
  setBrushColor,
  brushWidth,
  setBrushWidth
}) => {
  return (
    <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/70">
      <div className="flex items-center gap-1">
        {COLOR_PALETTE.map((c) => (
          <button
            key={c.hex}
            onClick={() => setBrushColor(c.hex)}
            className={`w-5 h-5 rounded-full transition-transform ${
              brushColor === c.hex
                ? 'scale-125 ring-2 ring-white shadow-md'
                : 'opacity-80 hover:opacity-100 hover:scale-110'
            }`}
            style={{ backgroundColor: c.hex }}
            title={c.name}
          />
        ))}
      </div>

      <div className="h-4 w-px bg-slate-700 mx-1" />

      <div className="flex items-center gap-1 text-xs text-slate-300">
        <button
          onClick={() => setBrushWidth(2)}
          className={`px-1.5 py-0.5 rounded font-mono ${
            brushWidth === 2 ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
          }`}
        >
          S
        </button>
        <button
          onClick={() => setBrushWidth(4)}
          className={`px-1.5 py-0.5 rounded font-mono ${
            brushWidth === 4 ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
          }`}
        >
          M
        </button>
        <button
          onClick={() => setBrushWidth(7)}
          className={`px-1.5 py-0.5 rounded font-mono ${
            brushWidth === 7 ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
          }`}
        >
          L
        </button>
      </div>
    </div>
  );
};
