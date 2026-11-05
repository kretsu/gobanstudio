import React from 'react';
import { SubLayer, VariationLayer } from '../../types/goban';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Edit2,
  Eye,
  EyeOff,
  GitBranch,
  Lock,
  MoreVertical,
  PenTool,
  Plus,
  Tag,
  Trash2,
  Unlock,
  X
} from 'lucide-react';
import { SubLayerItem } from './SubLayerItem';

interface VariationItemProps {
  variation: VariationLayer;
  depth: number;
  allVariations: VariationLayer[];
  activeVariationId: string;
  activeSubLayerId: string | null;
  isAncestorActive: boolean;
  isExpanded: boolean;
  onToggleExpand: (vId: string, e?: React.MouseEvent) => void;
  onSelectVariation: (vId: string) => void;
  onSelectSubLayer: (variationId: string, subLayerId: string | null) => void;
  editingId: string | null;
  editNameValue: string;
  setEditNameValue: (val: string) => void;
  setEditingId: (id: string | null) => void;
  handleSaveRename: () => void;
  handleStartRename: (id: string, currentName: string, parentVarId?: string) => void;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  tagInputVarId: string | null;
  setTagInputVarId: (id: string | null) => void;
  tagInputValue: string;
  setTagInputValue: (val: string) => void;
  handleAddTag: (variationId: string) => void;
  handleRemoveTag: (variationId: string, tagToRemove: string) => void;
  onToggleLayerVisibility: (layerType: 'root' | 'variation' | 'sublayer', variationId: string, subLayerId?: string) => void;
  onToggleLayerLock: (layerType: 'root' | 'variation' | 'sublayer', variationId: string, subLayerId?: string) => void;
  onDeleteVariation: (variationId: string) => void;
  onDuplicateVariation: (variationId: string) => void;
  onAddVariation: (name: string, tags: string[], branchPoint?: number, parentId?: string) => void;
  onAddSubLayer: (parentVariationId: string, name: string, type: SubLayer['type']) => void;
  onDeleteSubLayer: (parentVariationId: string, subLayerId: string) => void;
  onToggleVariationOutdated?: (variationId: string) => void;
  onToggleSubLayerOutdated?: (parentVariationId: string, subLayerId: string) => void;
  setManuallyToggled: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  renderChildVariations?: (parentId: string, depth: number) => React.ReactNode;
}

export const VariationItem: React.FC<VariationItemProps> = ({
  variation: v,
  depth,
  allVariations,
  activeVariationId,
  activeSubLayerId,
  isAncestorActive,
  isExpanded,
  onToggleExpand,
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
  tagInputVarId,
  setTagInputVarId,
  tagInputValue,
  setTagInputValue,
  handleAddTag,
  handleRemoveTag,
  onToggleLayerVisibility,
  onToggleLayerLock,
  onDeleteVariation,
  onDuplicateVariation,
  onAddVariation,
  onAddSubLayer,
  onDeleteSubLayer,
  onToggleVariationOutdated,
  onToggleSubLayerOutdated,
  setManuallyToggled,
  renderChildVariations
}) => {
  const isVarActive = activeVariationId === v.id && activeSubLayerId === null;
  const isDescendantActive = activeVariationId === v.id || isAncestorActive;
  const childVariationsCount = allVariations.filter((item) => item.parentId === v.id).length;
  const subLayersCount = (v.subLayers || []).length;
  const isEditing = editingId === v.id;
  const itemRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isVarActive && itemRef.current) {
      itemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isVarActive]);

  const handleVariationNameClick = (vId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(vId);
    onSelectVariation(vId);
  };

  return (
    <div ref={itemRef} className={`relative flex flex-col ${depth > 0 ? 'ml-3 pl-2.5 border-l-2 border-indigo-500/20' : ''}`}>
      {/* Variation Row Card */}
      <div
        onClick={() => onSelectVariation(v.id)}
        className={`group/var relative flex flex-col my-1 rounded-xl border transition-all cursor-pointer select-none ${
          isVarActive
            ? 'bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-950/40 ring-1 ring-indigo-500/50'
            : isDescendantActive
            ? 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
            : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
        }`}
      >
        <div
          className={`flex justify-between gap-2 ${
            isExpanded ? 'p-2.5 items-start' : 'px-2.5 py-1.5 items-center min-h-[36px]'
          }`}
        >
          {isEditing ? (
            /* Full-width Inline Rename Mode */
            <div
              className="flex items-center gap-2 flex-1 min-w-0"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVariationOutdated?.(v.id);
                }}
                title={v.outdated ? 'Marked outdated. Click to mark valid.' : 'Valid variation. Click to toggle.'}
                className="p-1 rounded hover:bg-slate-800 transition-colors flex-shrink-0"
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full inline-block ${
                    v.outdated
                      ? 'bg-rose-500 ring-2 ring-rose-500/30'
                      : 'bg-emerald-500 ring-2 ring-emerald-500/30'
                  }`}
                />
              </button>
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
            /* Normal Display Row */
            <>
              {isExpanded ? (
                <div className="flex items-start gap-1.5 flex-1 min-w-0">
                  {/* Expand/Collapse Chevron */}
                  <button
                    type="button"
                    onClick={(e) => onToggleExpand(v.id, e)}
                    className="mt-0.5 p-0.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex-shrink-0"
                    title="Collapse variation"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Outdated Status Dot */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVariationOutdated?.(v.id);
                    }}
                    title={v.outdated ? 'Marked outdated (parent changed). Click to mark valid.' : 'Valid variation. Click to toggle.'}
                    className="mt-0.5 p-0.5 rounded hover:bg-slate-800 transition-colors flex-shrink-0"
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full inline-block ${
                        v.outdated
                          ? 'bg-rose-500 ring-2 ring-rose-500/30'
                          : 'bg-emerald-500 ring-2 ring-emerald-500/30'
                      }`}
                    />
                  </button>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div
                      className="flex items-center gap-1.5 cursor-pointer"
                      onClick={(e) => handleVariationNameClick(v.id, e)}
                    >
                      <span
                        className={`text-xs font-medium truncate ${
                          isVarActive ? 'text-indigo-200 font-semibold' : 'text-slate-200 hover:text-white'
                        }`}
                        title={(v.name || '').split('\n')[0].trim()}
                      >
                        {(v.name || '').split('\n')[0].trim()}
                      </span>
                      {v.outdated && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 flex-shrink-0">
                          outdated
                        </span>
                      )}
                    </div>

                    {/* Move & Branch Metadata */}
                    <div className="flex items-center flex-wrap gap-1 mt-1 text-[10px] text-slate-400">
                      <span className="bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-300">
                        {v.moves.length} moves
                      </span>
                      {v.branchPoint > 0 && (
                        <span className="bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-400">
                          from move {v.branchPoint}
                        </span>
                      )}
                      {childVariationsCount > 0 && (
                        <span className="bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 px-1.5 py-0.5 rounded text-[9px] flex items-center gap-1">
                          <GitBranch className="w-2.5 h-2.5" />
                          {childVariationsCount} {childVariationsCount === 1 ? 'branch' : 'branches'}
                        </span>
                      )}
                      {subLayersCount > 0 && (
                        <span className="bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 px-1.5 py-0.5 rounded text-[9px] flex items-center gap-1">
                          <PenTool className="w-2.5 h-2.5" />
                          {subLayersCount} {subLayersCount === 1 ? 'overlay' : 'overlays'}
                        </span>
                      )}
                    </div>

                    {/* Tags Area */}
                    <div className="flex items-center flex-wrap gap-1 mt-1.5">
                      {(v.tags || []).map((t) => (
                        <span
                          key={t}
                          className="bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 px-1.5 py-0.5 rounded text-[9px] flex items-center gap-1 group/tag"
                        >
                          #{t}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveTag(v.id, t);
                            }}
                            className="opacity-0 group-hover/tag:opacity-100 hover:text-rose-400 transition-opacity"
                            title={`Remove tag #${t}`}
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}

                      {tagInputVarId === v.id ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={tagInputValue}
                            onChange={(e) => setTagInputValue(e.target.value)}
                            placeholder="New tag..."
                            className="w-20 px-1.5 py-0.5 text-[9px] bg-slate-900 border border-indigo-500 rounded text-slate-100 placeholder-slate-500 focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.stopPropagation();
                                handleAddTag(v.id);
                              } else if (e.key === 'Escape') {
                                e.stopPropagation();
                                setTagInputVarId(null);
                                setTagInputValue('');
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddTag(v.id);
                            }}
                            className="text-emerald-400 hover:text-emerald-300 p-0.5"
                          >
                            <Check className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTagInputVarId(null);
                              setTagInputValue('');
                            }}
                            className="text-slate-400 hover:text-slate-300 p-0.5"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTagInputVarId(v.id);
                            setTagInputValue('');
                          }}
                          className="text-[9px] text-slate-500 hover:text-indigo-300 hover:bg-slate-800/60 px-1.5 py-0.5 rounded border border-dashed border-slate-700/60 transition-colors flex items-center gap-0.5"
                          title="Add tag to variation"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>Tag</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Collapsed View */
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => onToggleExpand(v.id, e)}
                    className="p-0.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex-shrink-0"
                    title="Expand variation"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVariationOutdated?.(v.id);
                    }}
                    title={v.outdated ? 'Marked outdated (parent changed). Click to mark valid.' : 'Valid variation. Click to toggle.'}
                    className="p-0.5 rounded hover:bg-slate-800 transition-colors flex-shrink-0"
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full inline-block ${
                        v.outdated
                          ? 'bg-rose-500 ring-2 ring-rose-500/30'
                          : 'bg-emerald-500 ring-2 ring-emerald-500/30'
                      }`}
                    />
                  </button>

                  <div
                    className="flex items-center gap-1.5 min-w-0 flex-1 cursor-pointer"
                    onClick={(e) => handleVariationNameClick(v.id, e)}
                  >
                    <span
                      className={`text-xs font-medium truncate ${
                        isVarActive ? 'text-indigo-200 font-semibold' : 'text-slate-200 hover:text-white'
                      }`}
                      title={(v.name || '').split('\n')[0].trim()}
                    >
                      {(v.name || '').split('\n')[0].trim()}
                    </span>
                    {v.outdated && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 flex-shrink-0">
                        outdated
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Right Actions: Visibility, Lock & Options Menu */}
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
                    onToggleLayerVisibility('variation', v.id);
                  }}
                  className={`p-1 rounded-md hover:bg-slate-800 transition-colors ${
                    v.visible !== false ? 'text-indigo-300 hover:text-indigo-200' : 'text-slate-500 hover:text-slate-400'
                  }`}
                  title={v.visible !== false ? 'Hide variation' : 'Show variation'}
                >
                  {v.visible !== false ? (
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLayerLock('variation', v.id);
                  }}
                  className="p-1 rounded-md hover:bg-slate-800 transition-colors"
                  title={v.locked ? 'Locked for editing. Click to unlock.' : 'Unlocked for editing. Click to lock.'}
                >
                  {v.locked ? (
                    <Lock className="w-3.5 h-3.5 text-amber-400 hover:text-amber-300" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(menuOpenId === v.id ? null : v.id);
                  }}
                  className={`p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ${
                    menuOpenId === v.id ? 'bg-slate-800 text-indigo-300 ring-1 ring-slate-700' : ''
                  }`}
                  title="Variation options"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {/* Dropdown Menu */}
                {menuOpenId === v.id && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl shadow-black/60 py-1 z-30 divide-y divide-slate-800">
                    <div className="py-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartRename(v.id, v.name);
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
                          setTagInputVarId(v.id);
                          setTagInputValue('');
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-indigo-600/30 hover:text-white flex items-center gap-2"
                      >
                        <Tag className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Add Tag</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(null);
                          onAddVariation(
                            `${v.name} - Seq ${childVariationsCount + 1}`,
                            ['Sequence'],
                            v.moves.length,
                            v.id
                          );
                          setManuallyToggled((prev) => ({ ...prev, [v.id]: true }));
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-indigo-600/30 hover:text-white flex items-center gap-2"
                      >
                        <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Add Sub-Variation</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(null);
                          onAddSubLayer(v.id, 'Drawing Overlay', 'drawing');
                          setManuallyToggled((prev) => ({ ...prev, [v.id]: true }));
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-indigo-600/30 hover:text-white flex items-center gap-2"
                      >
                        <PenTool className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Add Drawing Overlay</span>
                      </button>
                    </div>

                    <div className="py-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(null);
                          onDuplicateVariation(v.id);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-indigo-600/30 hover:text-white flex items-center gap-2"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Duplicate</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(null);
                          onToggleLayerLock('variation', v.id);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-indigo-600/30 hover:text-white flex items-center gap-2"
                      >
                        {v.locked ? (
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

                    <div className="py-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(null);
                          onDeleteVariation(v.id);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Variation</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Drawing Sublayers of this variation */}
        {isExpanded && subLayersCount > 0 && (
          <div className="px-2.5 pb-2 pt-0.5 flex flex-col gap-1 border-t border-slate-800/60 bg-slate-950/30 rounded-b-xl">
            {v.subLayers.map((sub) => {
              const isSubActive = activeVariationId === v.id && activeSubLayerId === sub.id;
              return (
                <SubLayerItem
                  key={sub.id}
                  sub={sub}
                  parentVariationId={v.id}
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

      {/* Child Variations (Nested Tree Recursion) */}
      {isExpanded && renderChildVariations?.(v.id, depth + 1)}
    </div>
  );
};
