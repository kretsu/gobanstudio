import React from 'react';

interface HeaderCapturesProps {
  captures: { B: number; W: number };
}

export const HeaderCaptures: React.FC<HeaderCapturesProps> = ({ captures }) => {
  return (
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
  );
};
