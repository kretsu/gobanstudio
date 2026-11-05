import React, { useState, useEffect, useRef } from 'react';
import {
  GobanProject,
  SubLayer,
  VariationLayer
} from '../types/goban';
import { Layers } from 'lucide-react';
import {
  LayerSearchFilter,
  AddLayerMenu,
  RootLayerItem,
  VariationItem
} from './layers/index';
import { getVariationAncestorChain } from '../engine/variationTree';

export interface LayerPanelProps {
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

function isAncestorOfVariation(
  potentialAncestorId: string,
  currentActiveId: string,
  variations: VariationLayer[]
): boolean {
  if (currentActiveId === 'root' || !currentActiveId) return false;
  let curr = variations.find((v) => v.id === currentActiveId);
  while (curr && curr.parentId && curr.parentId !== 'root') {
    if (curr.parentId === potentialAncestorId) return true;
    curr = variations.find((v) => v.id === curr!.parentId);
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

  // Ensure active variation and all its ancestor variations are expanded whenever activeVariationId changes
  useEffect(() => {
    if (!activeVariationId || activeVariationId === 'root') return;

    const chain = getVariationAncestorChain(project, activeVariationId);
    const ancestorIds = chain.slice(0, -1).map((v) => v.id);

    setManuallyToggled((prev) => {
      const next = { ...prev };
      let changed = false;

      // Expand all ancestor variations leading to the active variation
      for (const ancId of ancestorIds) {
        if (!next[ancId]) {
          next[ancId] = true;
          changed = true;
        }
      }

      // Expand the active variation itself so its contents / sublayers are visible
      if (!next[activeVariationId]) {
        next[activeVariationId] = true;
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [activeVariationId, project]);

  const isVariationExpanded = (vId: string) => {
    if (manuallyToggled[vId] !== undefined) {
      return manuallyToggled[vId];
    }
    // Auto-expand by default if this variation is active or an ancestor of the active variation
    if (vId === activeVariationId || isAncestorOfVariation(vId, activeVariationId, project.variations)) {
      return true;
    }
    return false;
  };

  const handleToggleExpand = (vId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setManuallyToggled((prev) => ({
      ...prev,
      [vId]: !isVariationExpanded(vId)
    }));
  };

  const handleSelectVariation = (id: string) => {
    const chain = getVariationAncestorChain(project, id);
    const ancestorIds = chain.slice(0, -1).map((v) => v.id);

    setManuallyToggled((prev) => {
      const next = { ...prev, [id]: true };
      for (const ancId of ancestorIds) {
        next[ancId] = true;
      }
      return next;
    });
    onSelectVariation(id);
    onSelectSubLayer(id, null);
  };

  const isRootExpanded =
    activeVariationId === 'root' || (manuallyToggled['root'] ?? (activeVariationId === 'root'));

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
  const allTags = Array.from(new Set(project.variations.flatMap((v) => v.tags || [])));

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
  const renderVariationTree = (parentId: string = 'root', depth: number = 0): React.ReactNode => {
    const children = filteredVariations.filter((v) => (v.parentId || 'root') === parentId);
    if (children.length === 0) return null;

    return children.map((v) => {
      const isAncestorActive = isAncestorOfVariation(v.id, activeVariationId, project.variations);
      const isExpanded = isVariationExpanded(v.id);

      return (
        <VariationItem
          key={v.id}
          variation={v}
          depth={depth}
          allVariations={project.variations}
          activeVariationId={activeVariationId}
          activeSubLayerId={activeSubLayerId}
          isAncestorActive={isAncestorActive}
          isExpanded={isExpanded}
          onToggleExpand={handleToggleExpand}
          onSelectVariation={handleSelectVariation}
          onSelectSubLayer={onSelectSubLayer}
          editingId={editingId}
          editNameValue={editNameValue}
          setEditNameValue={setEditNameValue}
          setEditingId={setEditingId}
          handleSaveRename={handleSaveRename}
          handleStartRename={handleStartRename}
          menuOpenId={menuOpenId}
          setMenuOpenId={setMenuOpenId}
          tagInputVarId={tagInputVarId}
          setTagInputVarId={setTagInputVarId}
          tagInputValue={tagInputValue}
          setTagInputValue={setTagInputValue}
          handleAddTag={handleAddTag}
          handleRemoveTag={handleRemoveTag}
          onToggleLayerVisibility={onToggleLayerVisibility}
          onToggleLayerLock={onToggleLayerLock}
          onDeleteVariation={onDeleteVariation}
          onDuplicateVariation={onDuplicateVariation}
          onAddVariation={onAddVariation}
          onAddSubLayer={onAddSubLayer}
          onDeleteSubLayer={onDeleteSubLayer}
          onToggleVariationOutdated={onToggleVariationOutdated}
          onToggleSubLayerOutdated={onToggleSubLayerOutdated}
          setManuallyToggled={setManuallyToggled}
          renderChildVariations={renderVariationTree}
        />
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
        <AddLayerMenu
          isOpen={isAddMenuOpen}
          onToggle={() => setIsAddMenuOpen(!isAddMenuOpen)}
          onClose={() => setIsAddMenuOpen(false)}
          project={project}
          activeVariationId={activeVariationId}
          onAddVariation={onAddVariation}
          onAddSubLayer={onAddSubLayer}
          setManuallyToggled={setManuallyToggled}
        />
      </div>

      {/* Search and Tag Filtering */}
      <LayerSearchFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        allTags={allTags}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
      />

      {/* Layer Hierarchy List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* ROOT / BASE BOARD LAYER */}
        <RootLayerItem
          project={project}
          activeVariationId={activeVariationId}
          activeSubLayerId={activeSubLayerId}
          isRootExpanded={isRootExpanded}
          onToggleRootExpand={(e) => {
            e.stopPropagation();
            setManuallyToggled((prev) => ({
              ...prev,
              root: !isRootExpanded
            }));
          }}
          onSelectVariation={handleSelectVariation}
          onSelectSubLayer={onSelectSubLayer}
          editingId={editingId}
          editNameValue={editNameValue}
          setEditNameValue={setEditNameValue}
          setEditingId={setEditingId}
          handleSaveRename={handleSaveRename}
          handleStartRename={handleStartRename}
          menuOpenId={menuOpenId}
          setMenuOpenId={setMenuOpenId}
          onToggleLayerLock={onToggleLayerLock}
          onToggleLayerVisibility={onToggleLayerVisibility}
          onAddVariation={onAddVariation}
          onAddSubLayer={onAddSubLayer}
          onDeleteSubLayer={onDeleteSubLayer}
          onToggleSubLayerOutdated={onToggleSubLayerOutdated}
        />

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
            <div className="space-y-1">{renderVariationTree('root', 0)}</div>
          )}
        </div>
      </div>
    </div>
  );
};
