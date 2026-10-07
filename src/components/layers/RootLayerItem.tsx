import React from 'react';
import { GobanProject, SubLayer } from '../../types/goban';
import {
  Bookmark,
  Check,
  ChevronDown,
  ChevronRight,
  Edit2,
  GitBranch,
  Lock,
  MoreVertical,
  PenTool,
  Unlock,
  X
} from 'lucide-react';
import { SubLayerItem } from './SubLayerItem';

interface RootLayerItemProps {
  project: GobanProject;
  activeVariationId: string;
  activeSubLayerId: string | null;
  isRootExpanded: boolean;
  onToggleRootExpand: (e: React.MouseEvent) => void;
  onSelectVariation: (id: string) => void;
  onSelectSubLayer: (variationId: string, subLayerId: string | null) => void;
  editingId: string | null;
  editNameValue: string;
  setEditNameValue: (val: string) => void;
  setEditingId: (id: string | null) => void;
  handleSaveRename: () => void;
  handleStartRename: (id: string, currentName: string, parentVarId?: string) => void;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  onToggleLayerLock: (layerType: 'root' | 'variation' | 'sublayer', variationId: string, subLayerId?: string) => void;
  onToggleLayerVisibility: (layerType: 'root' | 'variation' | 'sublayer', variationId: string, subLayerId?: string) => void;
  onAddVariation: (name: string, tags: string[], branchPoint?: number, parentId?: string) => void;
  onAddSubLayer: (parentVariationId: string, name: string, type: SubLayer['type']) => void;
  onDeleteSubLayer: (parentVariationId: string, subLayerId: string) => void;
  onToggleSubLayerOutdated?: (parentVariationId: string, subLayerId: string) => void;
}

export const RootLayerItem: React.FC<RootLayerItemProps> = ({
  project,
  activeVariationId,
  activeSubLayerId,
  isRootExpanded,
  onToggleRootExpand,
  onSelectVariation,
  onSelectSubLayer,
  editingId,
  editNameValue,
  setEditNameValue,
  setEditingId,
  handleSaveRename,
  handleStartRename,
  menuOpenId,
  setMenuOpenId,
  onToggleLayerLock,
  onToggleLayerVisibility,
  onAddVariation,
  onAddSubLayer,
  onDeleteSubLayer,
  onToggleSubLayerOutdated
}) => {
  const isEditing = editingId === 'root';
  const isRootActive = activeVariationId === 'root' && activeSubLayerId === null;
  const rootSubLayers = project.root.subLayers || [];

  return (
    <div
      className={`flex flex-col rounded-xl border transition-all ${
        isRootActive
          ? 'bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-950/40 ring-1 ring-indigo-500/50'
          : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
      }`}
    >
      <div
        onClick={() => onSelectVariation('root')}
        className="p-3 flex items-center justify-between cursor-pointer"
      >
        {isEditing ? (
          <div
            className="flex items-center gap-1.5 flex-1 min-w-0"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Bookmark className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <input
              type="text"
              value={editNameValue}
              onChange={(e) => setEditNameValue(e.target.value)}
              className="bg-slate-900 text-xs px-2.5 py-1.5 rounded-lg border border-indigo-500 text-slate-100 flex-1 focus:outline-none focus:ring-1 focus:ring-indigo-400 min-w-0 select-text"
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
              className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/60 rounded-lg flex-shrink-0"
              title="Save (Enter)"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEditingId(null);
              }}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 rounded-lg flex-shrink-0"
              title="Cancel (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {rootSubLayers.length > 0 && (
                <button
                  type="button"
                  onClick={onToggleRootExpand}
                  className="p-0.5 -ml-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex-shrink-0"
                  title={isRootExpanded ? 'Collapse root overlays' : 'Expand root overlays'}
                >
                  {isRootExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
              <Bookmark className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-100 truncate">
                  {project.root.name || 'Root / Base Board'}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400">
                    {project.root.moves.length} moves • {project.root.initialStones.length} setup stones
                  </span>
                  {!isRootExpanded && rootSubLayers.length > 0 && (
                    <span className="bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 px-1.5 py-0.2 rounded text-[9px] flex items-center gap-1">
                      <PenTool className="w-2.5 h-2.5" />
                      {rootSubLayers.length} {rootSubLayers.length === 1 ? 'overlay' : 'overlays'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Root Action Controls */}
            <div
              className="relative flex items-center gap-1"
              data-layer-menu
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Persistent Lock Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLayerLock('root', 'root');
                }}
                className="p-1 rounded-md hover:bg-slate-800 transition-colors"
                title={project.root.locked ? 'Root locked for editing. Click to unlock.' : 'Root unlocked. Click to lock.'}
              >
                {project.root.locked ? (
                  <Lock className="w-3.5 h-3.5 text-amber-400 hover:text-amber-300" />
                ) : (
                  <Unlock className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
                )}
              </button>

              {/* Three Dots Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(menuOpenId === 'root' ? null : 'root');
                }}
                className={`p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ${
                  menuOpenId === 'root' ? 'bg-slate-800 text-indigo-300 ring-1 ring-slate-700' : ''
                }`}
                title="Root options"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {/* Root Dropdown Menu */}
              {menuOpenId === 'root' && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-slate-900 border border-slate-700 rounded-lg shadow-xl shadow-black/50 py-1 z-30">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartRename('root', project.root.name);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-indigo-600/30 hover:text-white flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Rename</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(null);
                      const childCount = project.variations.filter((v) => !v.parentId || v.parentId === 'root').length;
                      onAddVariation(`Variation ${childCount + 1}`, ['Branch'], project.root.moves.length, 'root');
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-indigo-600/30 hover:text-white flex items-center gap-2"
                  >
                    <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Add Variation</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(null);
                      onAddSubLayer('root', 'Drawing Overlay', 'drawing');
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-indigo-600/30 hover:text-white flex items-center gap-2"
                  >
                    <PenTool className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Add Drawing Overlay</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(null);
                      onToggleLayerLock('root', 'root');
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-indigo-600/30 hover:text-white flex items-center gap-2"
                  >
                    {project.root.locked ? (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Unlock</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Lock for Editing</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Root Drawing Sublayers */}
      {isRootExpanded && rootSubLayers.length > 0 && (
        <div className="px-3 pb-2 pt-0.5 flex flex-col gap-1 border-t border-slate-800/60 bg-slate-950/30 rounded-b-xl">
          {rootSubLayers.map((sub) => {
            const isSubActive = activeVariationId === 'root' && activeSubLayerId === sub.id;
            return (
              <SubLayerItem
                key={sub.id}
                sub={sub}
                parentVariationId="root"
                isActive={isSubActive}
                editingId={editingId}
                editNameValue={editNameValue}
                setEditNameValue={setEditNameValue}
                setEditingId={setEditingId}
                handleSaveRename={handleSaveRename}
                handleStartRename={handleStartRename}
                menuOpenId={menuOpenId}
                setMenuOpenId={setMenuOpenId}
                onSelectSubLayer={onSelectSubLayer}
                onToggleLayerVisibility={onToggleLayerVisibility}
                onToggleLayerLock={onToggleLayerLock}
                onDeleteSubLayer={onDeleteSubLayer}
                onToggleSubLayerOutdated={onToggleSubLayerOutdated}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
