import React, { useState, useEffect } from 'react';
import {
  GobanProject,
  SubLayer,
  VariationLayer
} from '../types/goban';
import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Copy,
  Tag,
  Edit2,
  Check,
  X,
  PenTool,
  Bookmark,
  Search,
  Sparkles,
  MoreVertical,
  CornerDownRight,
  GitBranch,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface LayerPanelProps {
  project: GobanProject;
  activeVariationId: string;
  activeSubLayerId: string | null;
  onSelectVariation: (id: string) => void;
  onSelectSubLayer: (variationId: string, subLayerId: string | null) => void;
  onAddVariation: (name: string, tags: string[], branchPoint?: number, parentId?: string) => void;
  onAddSubLayer: (parentVariationId: string, name: string, type: SubLayer['type']) => void;
  onToggleLayerLock: (layerType: 'root' | 'variation' | 'sublayer', variationId: string, subLayerId?: string) => void;
  onToggleLayerVisibility: (layerType: 'root' | 'variation' | 'sublayer', variationId: string, subLayerId?: string) => void;
  onToggleDefaultVisibility: (variationId: string, subLayerId: string) => void;
  onDeleteVariation: (variationId: string) => void;
  onDeleteSubLayer: (parentVariationId: string, subLayerId: string) => void;
  onDuplicateVariation: (variationId: string) => void;
  onRenameVariation: (variationId: string, newName: string) => void;
  onRenameSubLayer: (parentVariationId: string, subLayerId: string, newName: string) => void;
  onUpdateVariationTags: (variationId: string, tags: string[]) => void;
  onRenameRoot: (newName: string) => void;
  onToggleSubLayerOutdated?: (parentVariationId: string, subLayerId: string) => void;
  onToggleVariationOutdated?: (variationId: string) => void;
}

function isAncestorOfVariation(potentialAncestorId: string, currentActiveId: string, variations: VariationLayer[]): boolean {
  if (currentActiveId === 'root' || !currentActiveId) return false;
  let curr = variations.find(v => v.id === currentActiveId);
  while (curr && curr.parentId && curr.parentId !== 'root') {
    if (curr.parentId === potentialAncestorId) return true;
    curr = variations.find(v => v.id === curr!.parentId);
  }
  return false;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  project,
  activeVariationId,
  activeSubLayerId,
  onSelectVariation,
  onSelectSubLayer,
  onAddVariation,
  onAddSubLayer,
  onToggleLayerLock,
  onToggleLayerVisibility,
  onToggleDefaultVisibility,
  onDeleteVariation,
  onDeleteSubLayer,
  onDuplicateVariation,
  onRenameVariation,
  onRenameSubLayer,
  onUpdateVariationTags,
  onRenameRoot,
  onToggleSubLayerOutdated,
  onToggleVariationOutdated
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');
  const [editingParentVarId, setEditingParentVarId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [tagInputVarId, setTagInputVarId] = useState<string | null>(null);
  const [tagInputValue, setTagInputValue] = useState('');
  const [manuallyToggled, setManuallyToggled] = useState<Record<string, boolean>>({});

  const isVariationExpanded = (vId: string) => {
    const isSelectedOrAncestor = activeVariationId === vId || isAncestorOfVariation(vId, activeVariationId, project.variations);
    if (manuallyToggled[vId] !== undefined) {
      return manuallyToggled[vId];
    }
    return isSelectedOrAncestor;
  };

  const handleToggleExpand = (vId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setManuallyToggled(prev => ({
      ...prev,
      [vId]: !isVariationExpanded(vId)
    }));
  };

  const handleSelectVariation = (id: string) => {
    if (manuallyToggled[id] === false) {
      setManuallyToggled(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
    onSelectVariation(id);
    onSelectSubLayer(id, null);
  };

  const isRootExpanded = activeVariationId === 'root' || (manuallyToggled['root'] ?? (activeVariationId === 'root'));

  // Close open dropdown menus on click outside or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent | PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('[data-layer-menu]')) {
        return;
      }
      setMenuOpenId(null);
      setIsAddMenuOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpenId(null);
        setIsAddMenuOpen(false);
      }
    };
    if (menuOpenId || isAddMenuOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpenId, isAddMenuOpen]);

  // Collect all unique tags in the project
  const allTags = Array.from(
    new Set(project.variations.flatMap((v) => v.tags || []))
  );

  // Filter variations based on search query and selected tag
  const filteredVariations = project.variations.filter((v) => {
    const matchesSearch =
      searchQuery === '' ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.tags && v.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesTag = !selectedTag || (v.tags && v.tags.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  const handleStartRename = (id: string, currentName: string, parentVarId?: string) => {
    setEditingId(id);
    setEditNameValue(currentName);
    setEditingParentVarId(parentVarId || null);
    setMenuOpenId(null);
  };

  const handleSaveRename = () => {
    if (!editingId || !editNameValue.trim()) {
      setEditingId(null);
      return;
    }
    if (editingId === 'root') {
      onRenameRoot(editNameValue.trim());
    } else if (editingParentVarId) {
      onRenameSubLayer(editingParentVarId, editingId, editNameValue.trim());
    } else {
      onRenameVariation(editingId, editNameValue.trim());
    }
    setEditingId(null);
  };

  const handleAddTag = (variationId: string) => {
    if (!tagInputValue.trim()) {
      setTagInputVarId(null);
      return;
    }
    const variation = project.variations.find((v) => v.id === variationId);
    if (variation) {
      const updatedTags = Array.from(new Set([...(variation.tags || []), tagInputValue.trim()]));
      onUpdateVariationTags(variationId, updatedTags);
    }
    setTagInputValue('');
    setTagInputVarId(null);
  };

  const handleRemoveTag = (variationId: string, tagToRemove: string) => {
    const variation = project.variations.find((v) => v.id === variationId);
    if (variation) {
      const updatedTags = (variation.tags || []).filter((t) => t !== tagToRemove);
      onUpdateVariationTags(variationId, updatedTags);
    }
  };

  // Recursive renderer for variation tree hierarchy
  const renderVariationTree = (parentId: string = 'root', depth: number = 0) => {
    const children = filteredVariations.filter((v) => (v.parentId || 'root') === parentId);
    if (children.length === 0) return null;

    return children.map((v) => {
      const isVarActive = activeVariationId === v.id && activeSubLayerId === null;
      const isDescendantActive = activeVariationId === v.id || isAncestorOfVariation(v.id, activeVariationId, project.variations);
      const isExpanded = isVariationExpanded(v.id);
      const childVariationsCount = project.variations.filter(item => item.parentId === v.id).length;
      const subLayersCount = (v.subLayers || []).length;
      const hasExpandableContent = childVariationsCount > 0 || subLayersCount > 0;

      return (
        <div key={v.id} className={`relative flex flex-col ${depth > 0 ? 'ml-3 pl-2.5 border-l-2 border-indigo-500/20' : ''}`}>
          {/* Variation Row Card */}
          <div
            onClick={() => handleSelectVariation(v.id)}
            className={`group/var relative flex flex-col my-1 rounded-xl border transition-all cursor-pointer select-none ${
              isVarActive
                ? 'bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-950/40 ring-1 ring-indigo-500/50'
                : isDescendantActive
                ? 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
            }`}
          >
            <div className="p-2.5 flex items-start justify-between gap-2">
              {editingId === v.id ? (
                /* Full-width Inline Rename Mode (hides icons for maximum editing room) */
                <div
                  className="flex items-center gap-2 flex-1 min-w-0"
                  onClick={e => e.stopPropagation()}
                  onPointerDown={e => e.stopPropagation()}
                  onMouseDown={e => e.stopPropagation()}
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
                    <span className={`w-2.5 h-2.5 rounded-full inline-block ${v.outdated ? 'bg-rose-500 ring-2 ring-rose-500/30' : 'bg-emerald-500 ring-2 ring-emerald-500/30'}`} />
                  </button>
                  <input
                    type="text"
                    value={editNameValue}
                    onChange={e => setEditNameValue(e.target.value)}
                    className="bg-slate-900 text-xs px-2.5 py-1.5 rounded-lg border border-indigo-500 text-slate-100 flex-1 focus:outline-none focus:ring-1 focus:ring-indigo-400 min-w-0 select-text"
                    autoFocus
                    onFocus={e => e.target.select()}
                    onPointerDown={e => e.stopPropagation()}
                    onMouseDown={e => e.stopPropagation()}
                    onKeyDown={e => {
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
                  <div className="flex items-start gap-1.5 flex-1 min-w-0">
                    {/* Expand/Collapse Chevron (if variation has children or sublayers) */}
                    {hasExpandableContent ? (
                      <button
                        type="button"
                        onClick={(e) => handleToggleExpand(v.id, e)}
                        className="mt-0.5 p-0.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex-shrink-0"
                        title={isExpanded ? 'Collapse variation' : 'Expand variation'}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>
                    ) : (
                      <span className="w-3.5 flex-shrink-0" />
                    )}

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
                      <span className={`w-2.5 h-2.5 rounded-full inline-block ${v.outdated ? 'bg-rose-500 ring-2 ring-rose-500/30' : 'bg-emerald-500 ring-2 ring-emerald-500/30'}`} />
                    </button>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-medium truncate ${isVarActive ? 'text-indigo-200 font-semibold' : 'text-slate-200'}`}>
                          {v.name}
                        </span>
                        {v.outdated && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 flex-shrink-0">
                            outdated
                          </span>
                        )}
                      </div>

                      {/* Details & Tags */}
                      <div className="flex items-center flex-wrap gap-1 mt-1 text-[10px] text-slate-400">
                        <span className="bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-300">
                          {v.moves.length} moves
                        </span>
                        {v.branchPoint > 0 && (
                          <span className="bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-400">
                            from move {v.branchPoint}
                          </span>
                        )}
                        {!isExpanded && childVariationsCount > 0 && (
                          <span className="bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 px-1.5 py-0.5 rounded text-[9px] flex items-center gap-1">
                            <GitBranch className="w-2.5 h-2.5" />
                            {childVariationsCount} {childVariationsCount === 1 ? 'branch' : 'branches'}
                          </span>
                        )}
                        {!isExpanded && subLayersCount > 0 && (
                          <span className="bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 px-1.5 py-0.5 rounded text-[9px] flex items-center gap-1">
                            <PenTool className="w-2.5 h-2.5" />
                            {subLayersCount} {subLayersCount === 1 ? 'overlay' : 'overlays'}
                          </span>
                        )}
                        {(v.tags || []).map((t) => (
                          <span
                            key={t}
                            className="bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 px-1.5 py-0.5 rounded text-[9px] flex items-center gap-1 group/tag"
                          >
                            #{t}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveTag(v.id, t);
                              }}
                              className="opacity-0 group-hover/tag:opacity-100 hover:text-rose-400 transition-opacity"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Persistent Lock Icon & Three Dots Menu (Visible ALWAYS until rename) */}
                  <div
                    className="relative flex items-center gap-1 flex-shrink-0"
                    data-layer-menu
                    onClick={e => e.stopPropagation()}
                    onPointerDown={e => e.stopPropagation()}
                    onMouseDown={e => e.stopPropagation()}
                  >
                    {/* Persistent Lock / Unlock Button */}
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

                    {/* Three Dots Menu Button */}
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
                              onAddVariation(`${v.name} - Seq ${childVariationsCount + 1}`, ['Sequence'], v.moves.length, v.id);
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
            {isExpanded && (v.subLayers || []).length > 0 && (
              <div className="px-2.5 pb-2 pt-0.5 flex flex-col gap-1 border-t border-slate-800/60 bg-slate-950/30 rounded-b-xl">
                {v.subLayers.map((sub) => {
                  const isSubActive = activeVariationId === v.id && activeSubLayerId === sub.id;

                  return (
                    <div
                      key={sub.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSubLayer(v.id, sub.id);
                      }}
                      className={`flex items-center justify-between px-2 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer select-none ${
                        isSubActive
                          ? 'bg-indigo-900/40 border-indigo-500/60 text-indigo-100 shadow-sm'
                          : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-800/40 hover:border-slate-700'
                      }`}
                    >
                      {editingId === sub.id ? (
                        <div
                          className="flex items-center gap-1.5 flex-1 min-w-0"
                          onClick={e => e.stopPropagation()}
                          onPointerDown={e => e.stopPropagation()}
                          onMouseDown={e => e.stopPropagation()}
                        >
                          <PenTool className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                          <input
                            type="text"
                            value={editNameValue}
                            onChange={e => setEditNameValue(e.target.value)}
                            className="bg-slate-900 text-xs px-2 py-1 rounded-lg border border-indigo-500 text-slate-100 flex-1 focus:outline-none focus:ring-1 focus:ring-indigo-400 min-w-0 select-text"
                            autoFocus
                            onFocus={e => e.target.select()}
                            onPointerDown={e => e.stopPropagation()}
                            onMouseDown={e => e.stopPropagation()}
                            onKeyDown={e => {
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
                                onToggleSubLayerOutdated?.(v.id, sub.id);
                              }}
                              title={sub.outdated ? 'Marked outdated (variation changed). Click to mark valid.' : 'Valid drawing overlay. Click to toggle.'}
                              className="p-0.5 rounded hover:bg-slate-800 transition-colors flex-shrink-0"
                            >
                              <span className={`w-2 h-2 rounded-full inline-block ${sub.outdated ? 'bg-rose-500 ring-2 ring-rose-500/30' : 'bg-emerald-500 ring-2 ring-emerald-500/30'}`} />
                            </button>

                            <PenTool className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                            <span className="truncate text-[11px] font-medium">{sub.name}</span>
                            {sub.outdated && (
                              <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 flex-shrink-0">
                                outdated
                              </span>
                            )}
                          </div>

                          {/* Right Controls: Visibility, Persistent Lock & Options Menu */}
                          <div
                            className="relative flex items-center gap-1 flex-shrink-0"
                            data-layer-menu
                            onClick={e => e.stopPropagation()}
                            onPointerDown={e => e.stopPropagation()}
                            onMouseDown={e => e.stopPropagation()}
                          >
                            {/* Eye Visibility Toggle */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleLayerVisibility('sublayer', v.id, sub.id);
                              }}
                              className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                                sub.visible ? 'text-indigo-300' : 'text-slate-500'
                              }`}
                              title={sub.visible ? 'Hide drawing overlay' : 'Show drawing overlay'}
                            >
                              {sub.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            </button>

                            {/* Persistent Lock Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleLayerLock('sublayer', v.id, sub.id);
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

                            {/* Three Dots Menu Button */}
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
                              <div className="absolute right-0 top-full mt-1 w-44 bg-slate-900 border border-slate-700 rounded-lg shadow-xl shadow-black/60 py-1 z-30 divide-y divide-slate-800">
                                <div className="py-0.5">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartRename(sub.id, sub.name, v.id);
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
                                      onToggleLayerLock('sublayer', v.id, sub.id);
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
                                      onDeleteSubLayer(v.id, sub.id);
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
                })}
              </div>
            )}
          </div>

          {/* Child Variations (Nested Tree Recursion) */}
          {isExpanded && renderVariationTree(v.id, depth + 1)}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 border-l border-slate-800 select-none">
      {/* Panel Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Layer Hierarchy
          </h2>
        </div>

        {/* Add Layer Menu */}
        <div className="relative" data-layer-menu>
          <button
            onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Layer</span>
          </button>

          {isAddMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-40 divide-y divide-slate-800 animate-in fade-in duration-150">
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsAddMenuOpen(false);
                    const isRoot = activeVariationId === 'root';
                    const parent = isRoot ? project.root : project.variations.find(v => v.id === activeVariationId);
                    const childCount = project.variations.filter(v => (v.parentId || 'root') === activeVariationId).length;
                    const name = isRoot ? `Variation ${childCount + 1}` : `${parent?.name || 'Var'} - Branch ${childCount + 1}`;
                    onAddVariation(name, ['Branch'], isRoot ? project.root.moves.length : parent?.moves.length, activeVariationId);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-indigo-600/30 hover:text-white flex items-center gap-2.5 transition-colors"
                >
                  <GitBranch className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="font-medium">New Variation</div>
                    <div className="text-[10px] text-slate-400">Branch from active variation</div>
                  </div>
                </button>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsAddMenuOpen(false);
                    onAddSubLayer(activeVariationId, 'Drawing Overlay', 'drawing');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-indigo-600/30 hover:text-white flex items-center gap-2.5 transition-colors"
                >
                  <PenTool className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="font-medium">Drawing Overlay</div>
                    <div className="text-[10px] text-slate-400">Visual annotations on layer</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search and Tag Filtering */}
      <div className="p-3 border-b border-slate-800 flex flex-col gap-2 bg-slate-900/40">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search variations and tags..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900/80 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors flex-shrink-0 ${
                selectedTag === null
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors flex items-center gap-1 flex-shrink-0 ${
                  selectedTag === tag
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Tag className="w-2.5 h-2.5" />
                <span>{tag}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Layer Hierarchy List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* ROOT / BASE BOARD LAYER */}
        <div
          className={`flex flex-col rounded-xl border transition-all ${
            activeVariationId === 'root' && activeSubLayerId === null
              ? 'bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-950/40 ring-1 ring-indigo-500/50'
              : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
          }`}
        >
          <div
            onClick={() => handleSelectVariation('root')}
            className="p-3 flex items-center justify-between cursor-pointer"
          >
            {editingId === 'root' ? (
              <div
                className="flex items-center gap-1.5 flex-1 min-w-0"
                onClick={e => e.stopPropagation()}
                onPointerDown={e => e.stopPropagation()}
                onMouseDown={e => e.stopPropagation()}
              >
                <Bookmark className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <input
                  type="text"
                  value={editNameValue}
                  onChange={e => setEditNameValue(e.target.value)}
                  className="bg-slate-900 text-xs px-2.5 py-1.5 rounded-lg border border-indigo-500 text-slate-100 flex-1 focus:outline-none focus:ring-1 focus:ring-indigo-400 min-w-0 select-text"
                  autoFocus
                  onFocus={e => e.target.select()}
                  onPointerDown={e => e.stopPropagation()}
                  onMouseDown={e => e.stopPropagation()}
                  onKeyDown={e => {
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
                  {(project.root.subLayers || []).length > 0 ? (
                    <button
                      type="button"
                      onClick={(e) => handleToggleExpand('root', e)}
                      className="p-0.5 -ml-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex-shrink-0"
                      title={isRootExpanded ? 'Collapse root overlays' : 'Expand root overlays'}
                    >
                      {isRootExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  ) : null}
                  <Bookmark className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-slate-100 truncate">
                      {project.root.name || 'Root / Base Board'}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400">
                        {project.root.moves.length} moves • {project.root.initialStones.length} setup stones
                      </span>
                      {!isRootExpanded && (project.root.subLayers || []).length > 0 && (
                        <span className="bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 px-1.5 py-0.2 rounded text-[9px] flex items-center gap-1">
                          <PenTool className="w-2.5 h-2.5" />
                          {project.root.subLayers.length} {project.root.subLayers.length === 1 ? 'overlay' : 'overlays'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Root Action Controls: Persistent Lock Icon & Three Dots Menu (Always visible except during rename) */}
                <div
                  className="relative flex items-center gap-1"
                  data-layer-menu
                  onClick={e => e.stopPropagation()}
                  onPointerDown={e => e.stopPropagation()}
                  onMouseDown={e => e.stopPropagation()}
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
                          const childCount = project.variations.filter(v => !v.parentId || v.parentId === 'root').length;
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
          {isRootExpanded && (project.root.subLayers || []).length > 0 && (
            <div className="px-3 pb-2 pt-0.5 flex flex-col gap-1 border-t border-slate-800/60 bg-slate-950/30 rounded-b-xl">
              {project.root.subLayers.map((sub) => {
                const isSubActive = activeVariationId === 'root' && activeSubLayerId === sub.id;

                return (
                  <div
                    key={sub.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSubLayer('root', sub.id);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer select-none ${
                      isSubActive
                        ? 'bg-indigo-900/40 border-indigo-500/60 text-indigo-100 shadow-sm'
                        : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    {editingId === sub.id ? (
                      <div
                        className="flex items-center gap-1.5 flex-1 min-w-0"
                        onClick={e => e.stopPropagation()}
                        onPointerDown={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                      >
                        <PenTool className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        <input
                          type="text"
                          value={editNameValue}
                          onChange={e => setEditNameValue(e.target.value)}
                          className="bg-slate-900 text-xs px-2 py-1 rounded-lg border border-indigo-500 text-slate-100 flex-1 focus:outline-none focus:ring-1 focus:ring-indigo-400 min-w-0 select-text"
                          autoFocus
                          onFocus={e => e.target.select()}
                          onPointerDown={e => e.stopPropagation()}
                          onMouseDown={e => e.stopPropagation()}
                          onKeyDown={e => {
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
                              onToggleSubLayerOutdated?.('root', sub.id);
                            }}
                            title={sub.outdated ? 'Marked outdated (root changed). Click to mark valid.' : 'Valid drawing overlay. Click to toggle.'}
                            className="p-0.5 rounded hover:bg-slate-800 transition-colors flex-shrink-0"
                          >
                            <span className={`w-2 h-2 rounded-full inline-block ${sub.outdated ? 'bg-rose-500 ring-2 ring-rose-500/30' : 'bg-emerald-500 ring-2 ring-emerald-500/30'}`} />
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
                          onClick={e => e.stopPropagation()}
                          onPointerDown={e => e.stopPropagation()}
                          onMouseDown={e => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleLayerVisibility('sublayer', 'root', sub.id);
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
                              onToggleLayerLock('sublayer', 'root', sub.id);
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
                                    handleStartRename(sub.id, sub.name, 'root');
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
                                    onToggleLayerLock('sublayer', 'root', sub.id);
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
                                    onDeleteSubLayer('root', sub.id);
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
              })}
            </div>
          )}
        </div>

        {/* VARIATIONS TREE HIERARCHY */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Variations ({project.variations.length})
            </span>
          </div>

          {filteredVariations.length === 0 ? (
            <div className="p-4 text-center border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
              No variations found. Click &quot;Add Layer&quot; to create a new variation.
            </div>
          ) : (
            <div className="space-y-1">
              {renderVariationTree('root', 0)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
