import React from 'react';

interface BoardLockBadgeProps {
  isLocked: boolean;
  activeSubLayerLocked?: boolean;
}

export const BoardLockBadge: React.FC<BoardLockBadgeProps> = ({
  isLocked,
  activeSubLayerLocked = false
}) => {
  if (activeSubLayerLocked) {
    return (
      <div className="absolute top-4 right-4 bg-amber-500/90 text-slate-900 font-bold text-xs uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md backdrop-blur flex items-center gap-1.5 pointer-events-none">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Subvariation Locked
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="absolute top-4 right-4 bg-amber-500/80 text-slate-900 font-bold text-xs tracking-wider px-2.5 py-1 rounded-md shadow-md backdrop-blur flex items-center gap-1.5 pointer-events-none">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Variation Locked (Drawings & Moves branch to Subvariation)
      </div>
    );
  }

  return null;
};
