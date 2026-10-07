import { GobanProject, VariationLayer } from '../types/goban';

/**
 * Returns the ancestor chain of variations from top-level down to the target variation.
 * E.g. [TopLevelVar, SubVar, TargetVar]
 */
export function getVariationAncestorChain(
  project: GobanProject,
  variationId: string
): VariationLayer[] {
  const chain: VariationLayer[] = [];
  let currentId: string | undefined = variationId;
  const visited = new Set<string>();

  while (currentId && currentId !== 'root') {
    if (visited.has(currentId)) break; // Prevent circular hierarchy
    visited.add(currentId);
    const v = project.variations.find(item => item.id === currentId);
    if (!v) break;
    chain.unshift(v);
    currentId = v.parentId || 'root';
  }

  return chain;
}

/**
 * Returns all descendant variation IDs under targetId (inclusive of targetId).
 */
export function getDescendantVariationIds(
  variations: VariationLayer[],
  targetId: string
): Set<string> {
  const ids = new Set<string>([targetId]);
  let added = true;
  while (added) {
    added = false;
    for (const v of variations) {
      if (v.parentId && ids.has(v.parentId) && !ids.has(v.id)) {
        ids.add(v.id);
        added = true;
      }
    }
  }
  return ids;
}

export function toggleVariationOutdated(
  project: GobanProject,
  variationId: string
): GobanProject {
  return {
    ...project,
    variations: project.variations.map(v =>
      v.id === variationId ? { ...v, outdated: !v.outdated } : v
    )
  };
}

export function markVariationsOutdated(
  project: GobanProject,
  sourceVariationId?: string
): GobanProject {
  if (!sourceVariationId || sourceVariationId === 'root') {
    return {
      ...project,
      variations: project.variations.map(v => ({
        ...v,
        outdated: true,
        subLayers: (v.subLayers || []).map(s => ({ ...s, outdated: true }))
      }))
    };
  }

  const descendantIds = getDescendantVariationIds(project.variations, sourceVariationId);
  return {
    ...project,
    variations: project.variations.map(v => {
      if (descendantIds.has(v.id)) {
        return {
          ...v,
          outdated: true,
          subLayers: (v.subLayers || []).map(s => ({ ...s, outdated: true }))
        };
      }
      return v;
    })
  };
}

export function deleteVariation(
  project: GobanProject,
  variationId: string
): GobanProject {
  const descendantIds = getDescendantVariationIds(project.variations, variationId);
  const remainingVariations = project.variations.filter(v => !descendantIds.has(v.id));

  let nextActiveVarId = project.activeVariationId;
  if (descendantIds.has(project.activeVariationId)) {
    const deletedVar = project.variations.find(v => v.id === variationId);
    nextActiveVarId = (deletedVar && deletedVar.parentId && deletedVar.parentId !== 'root' && remainingVariations.some(v => v.id === deletedVar.parentId))
      ? deletedVar.parentId
      : 'root';
  }

  return {
    ...project,
    variations: remainingVariations,
    activeVariationId: nextActiveVarId,
    activeSubLayerId: null
  };
}

export function duplicateVariation(
  project: GobanProject,
  variationId: string
): { project: GobanProject; newVariationId: string } {
  const orig = project.variations.find(v => v.id === variationId);
  if (!orig) return { project, newVariationId: '' };

  const newId = `var_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const clonedVar: VariationLayer = {
    ...orig,
    id: newId,
    name: `${orig.name} (Copy)`,
    locked: false,
    outdated: false,
    moves: [...orig.moves],
    markings: [...orig.markings],
    subLayers: (orig.subLayers || []).map(s => ({
      ...s,
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      drawings: s.drawings ? [...s.drawings] : [],
      markings: s.markings ? [...s.markings] : []
    }))
  };

  return {
    project: {
      ...project,
      variations: [...project.variations, clonedVar],
      activeVariationId: newId,
      activeSubLayerId: null
    },
    newVariationId: newId
  };
}
