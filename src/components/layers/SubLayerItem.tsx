import React from 'react';
import { SubLayer } from '../../types/goban';
import { Check, Edit2, Eye, EyeOff, Lock, MoreVertical, PenTool, Trash2, Unlock, X } from 'lucide-react';

interface SubLayerItemProps {
  sub: SubLayer;
  parentVariationId: string;
  isActive: boolean;
  editingId: string | null;
  editNameValue: string;
  setEditNameValue: (val: string) => void;
  setEditingId: (id: string | null) => void;
  handleSaveRename: () => void;
  handleStartRename: (id: string, currentName: string, parentVarId?: string) => void;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  onSelectSubLayer: (variationId: string, subLayerId: string | null) => void;
  onToggleLayerVisibility: (layerType: 'root' | 'variation' | 'sublayer', variationId: string, subLayerId?: string) => void;
  onToggleLayerLock: (layerType: 'root' | 'variation' | 'sublayer', variationId: string, subLayerId?: string) => void;
  onDeleteSubLayer: (parentVariationId: string, subLayerId: string) => void;
  onToggleSubLayerOutdated?: (parentVariationId: string, subLayerId: string) => void;
}

export const SubLayerItem: React.FC<SubLayerItemProps> = ({
  sub,
  parentVariationId,
  isActive,
  editingId,
  editNameValue,
  setEditNameValue,
  setEditingId,
  handleSaveRename,
  handleStartRename,
  menuOpenId,
  setMenuOpenId,
  onSelectSubLayer,
  onToggleLayerVisibility,
  onToggleLayerLock,
  onDeleteSubLayer,
  onToggleSubLayerOutdated
}) => {
  const isEditing = editingId === sub.id;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelectSubLayer(parentVariationId, sub.id);
      }}
      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer select-none ${
        isActive
          ? 'bg-indigo-900/40 border-indigo-500/60 text-indigo-100 shadow-sm'
          : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-800/40 hover:border-slate-700'
      }`}
    >
      {isEditing ? (
        <div
          className="flex items-center gap-1.5 flex-1 min-w-0"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <PenTool className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <input
            type="text"
            value={editNameValue}
            onChange={(e) => setEditNameValue(e.target.value)}
            className="bg-slate-900 text-xs px-2 py-1 rounded-lg border border-indigo-500 text-slate-100 flex-1 focus:outline-none focus:ring-1 focus:ring-indigo-400 min-w-0 select-text"
            autoFocus
            onFocus={(e) => e.target.select()}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation();
                handleSaveRename();
              } else if (e.key === 'Escape') {
                e.stopPropagation();
                setEditingId(null);
              }
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSaveRename();
            }}
            className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/60 rounded flex-shrink-0"
            title="Save"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEditingId(null);
            }}
            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 rounded flex-shrink-0"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {/* Outdated Status Dot */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSubLayerOutdated?.(parentVariationId, sub.id);
              }}
              title={
                sub.outdated
                  ? 'Marked outdated. Click to mark valid.'
                  : 'Valid drawing overlay. Click to toggle.'
              }
              className="p-0.5 rounded hover:bg-slate-800 transition-colors flex-shrink-0"
            >
              <span
                className={`w-2 h-2 rounded-full inline-block ${
                  sub.outdated
                    ? 'bg-rose-500 ring-2 ring-rose-500/30'
                    : 'bg-emerald-500 ring-2 ring-emerald-500/30'
                }`}
              />
            </button>

            <PenTool className="w-3 h-3 text-cyan-400 flex-shrink-0" />
            <span className="truncate text-[11px] font-medium">{sub.name}</span>
            {sub.outdated && (
              <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 flex-shrink-0">
                outdated
              </span>
            )}
          </div>

          {/* Controls: Visibility, Persistent Lock, Options */}
          <div
            className="relative flex items-center gap-1 flex-shrink-0"
            data-layer-menu
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleLayerVisibility('sublayer', parentVariationId, sub.id);
              }}
              className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                sub.visible ? 'text-indigo-300' : 'text-slate-500'
              }`}
              title={sub.visible ? 'Hide drawing overlay' : 'Show drawing overlay'}
            >
              {sub.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleLayerLock('sublayer', parentVariationId, sub.id);
              }}
              className="p-1 rounded hover:bg-slate-800 transition-colors"
              title={sub.locked ? 'Locked drawing overlay. Click to unlock.' : 'Unlocked. Click to lock.'}
            >
              {sub.locked ? (
                <Lock className="w-3 h-3 text-amber-400" />
              ) : (
                <Unlock className="w-3 h-3 text-slate-500 hover:text-slate-300" />
              )}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpenId(menuOpenId === sub.id ? null : sub.id);
              }}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Options"
            >
              <MoreVertical className="w-3 h-3" />
            </button>

            {/* Sublayer Menu */}
            {menuOpenId === sub.id && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-slate-900 border border-slate-700 rounded-lg shadow-xl shadow-black/50 py-1 z-30 divide-y divide-slate-800">
                <div className="py-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartRename(sub.id, sub.name, parentVariationId);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-indigo-600/30 hover:text-white flex items-center gap-2"
                  >
                    <Edit2 className="w-3 h-3 text-slate-400" />
                    <span>Rename</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(null);
                      onToggleLayerLock('sublayer', parentVariationId, sub.id);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-indigo-600/30 hover:text-white flex items-center gap-2"
                  >
                    {sub.locked ? (
                      <>
                        <Unlock className="w-3 h-3 text-amber-400" />
                        <span>Unlock</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Lock</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="py-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(null);
                      onDeleteSubLayer(parentVariationId, sub.id);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 flex items-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete Overlay</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
