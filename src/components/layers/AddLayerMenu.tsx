import React from 'react';
import { GobanProject, SubLayer } from '../../types/goban';
import { GitBranch, PenTool, Plus } from 'lucide-react';

interface AddLayerMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  project: GobanProject;
  activeVariationId: string;
  onAddVariation: (name: string, tags: string[], branchPoint?: number, parentId?: string) => void;
  onAddSubLayer: (parentVariationId: string, name: string, type: SubLayer['type']) => void;
  setManuallyToggled: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export const AddLayerMenu: React.FC<AddLayerMenuProps> = ({
  isOpen,
  onToggle,
  onClose,
  project,
  activeVariationId,
  onAddVariation,
  onAddSubLayer,
  setManuallyToggled
}) => {
  return (
    <div className="relative" data-layer-menu>
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Layer</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-40 divide-y divide-slate-800 animate-in fade-in duration-150">
          <div className="py-1">
            <button
              onClick={() => {
                onClose();
                const isRoot = activeVariationId === 'root';
                const parent = isRoot ? project.root : project.variations.find((v) => v.id === activeVariationId);
                const childCount = project.variations.filter((v) => (v.parentId || 'root') === activeVariationId).length;
                const name = isRoot
                  ? `Variation ${childCount + 1}`
                  : `${parent?.name || 'Var'} - Branch ${childCount + 1}`;
                onAddVariation(
                  name,
                  ['Branch'],
                  isRoot ? project.root.moves.length : parent?.moves.length,
                  activeVariationId
                );
                if (!isRoot) {
                  setManuallyToggled((prev) => ({ ...prev, [activeVariationId]: true }));
                }
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
                onClose();
                onAddSubLayer(activeVariationId, 'Drawing Overlay', 'drawing');
                if (activeVariationId !== 'root') {
                  setManuallyToggled((prev) => ({ ...prev, [activeVariationId]: true }));
                }
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
  );
};
