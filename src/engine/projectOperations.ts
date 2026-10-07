import {
  BoardMarking,
  DrawingPath,
  GobanProject,
  GoMove,
  Point,
  SubLayer,
  VariationLayer
} from '../types/goban';
import { computeDisplayState } from './displayState';
import { getNextLetterMark } from './markings';
import { getDescendantVariationIds } from './variationTree';

export function createNewProject(boardSize: number = 19, title: string = 'Untitled Go Lesson'): GobanProject {
  return {
    version: '1.0.0',
    title,
    boardSize,
    rules: 'Japanese',
    komi: 6.5,
    handicap: 0,
    date: new Date().toISOString().split('T')[0],
    tags: ['Lesson', 'Variations'],
    root: {
      id: 'root',
      name: 'Base Game / Root',
      locked: false,
      visible: true,
      moves: [],
      initialStones: [],
      markings: [],
      subLayers: []
    },
    variations: [],
    activeVariationId: 'root',
    activeSubLayerId: null
  };
}

export function addVariation(
  project: GobanProject,
  name: string,
  tags: string[] = [],
  branchPoint?: number,
  parentId?: string
): { project: GobanProject; newVariationId: string } {
  const newId = `var_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const effectiveParentId = parentId !== undefined ? parentId : (project.activeVariationId || 'root');

  let effectiveBranchPoint = branchPoint;
  if (effectiveBranchPoint === undefined) {
    if (effectiveParentId === 'root') {
      effectiveBranchPoint = project.root.moves.length;
    } else {
      const parentVar = project.variations.find(v => v.id === effectiveParentId);
      effectiveBranchPoint = parentVar ? parentVar.moves.length : 0;
    }
  }

  const newVariation: VariationLayer = {
    id: newId,
    name: name || `Variation ${project.variations.length + 1}`,
    tags: tags.length > 0 ? tags : ['Branch'],
    description: '',
    parentId: effectiveParentId,
    branchPoint: effectiveBranchPoint,
    locked: false,
    visible: true,
    outdated: false,
    moves: [],
    markings: [],
    subLayers: []
  };

  const updatedProject: GobanProject = {
    ...project,
    variations: [...project.variations, newVariation],
    activeVariationId: newId,
    activeSubLayerId: null
  };

  return { project: updatedProject, newVariationId: newId };
}

export function addSubLayer(
  project: GobanProject,
  parentVariationId: string,
  name: string,
  type: 'drawing' | 'markings' | 'stones' | 'mixed' = 'drawing'
): { project: GobanProject; newSubLayerId: string } {
  const newSubId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  const newSubLayer: SubLayer = {
    id: newSubId,
    name: name || `Drawing Overlay`,
    type: type === 'stones' ? 'drawing' : type,
    locked: false,
    visible: true, // Visible when newly created during editing
    defaultVisible: false, // Default hidden when loading project
    outdated: false, // Valid when newly created
    moves: [],
    initialStones: [],
    markings: [],
    drawings: []
  };

  let updatedProject: GobanProject;

  if (parentVariationId === 'root') {
    updatedProject = {
      ...project,
      root: {
        ...project.root,
        subLayers: [...project.root.subLayers, newSubLayer]
      },
      activeSubLayerId: newSubId
    };
  } else {
    updatedProject = {
      ...project,
      variations: project.variations.map(v => {
        if (v.id === parentVariationId) {
          return {
            ...v,
            subLayers: [...v.subLayers, newSubLayer]
          };
        }
        return v;
      }),
      activeSubLayerId: newSubId
    };
  }

  return { project: updatedProject, newSubLayerId: newSubId };
}

export function recordMove(
  project: GobanProject,
  activeVariationId: string,
  point: Point,
  color: 'B' | 'W',
  currentStep: number
): { project: GobanProject; newVariationId?: string; isNewVariation: boolean; error?: string } {
  const isRoot = activeVariationId === 'root';
  const parent = isRoot ? project.root : project.variations.find(v => v.id === activeVariationId);
  if (!parent) return { project, isNewVariation: false, error: 'Parent layer not found' };

  if (point.x < 0 || point.x >= project.boardSize || point.y < 0 || point.y >= project.boardSize) {
    return { project, isNewVariation: false, error: 'Coordinates out of bounds' };
  }

  // Validate that the intersection is not already occupied by an existing stone
  const displayState = computeDisplayState(project, activeVariationId, currentStep);
  if (displayState.grid[point.y]?.[point.x] !== null) {
    return { project, isNewVariation: false, error: 'Intersection is already occupied' };
  }

  // If the parent variation (or root) is locked:
  // Auto-branch into a new child variation in the tree hierarchy!
  if (parent.locked) {
    const newVarId = `var_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    let varName: string;

    if (isRoot) {
      const rootChildren = project.variations.filter(v => !v.parentId || v.parentId === 'root');
      varName = `Variation ${rootChildren.length + 1}`;
    } else {
      const childVars = project.variations.filter(v => v.parentId === parent.id);
      varName = `${parent.name} - Seq ${childVars.length + 1}`;
    }

    const newVariation: VariationLayer = {
      id: newVarId,
      name: varName,
      tags: ['Sequence', `Step ${currentStep}`],
      description: '',
      parentId: isRoot ? 'root' : parent.id,
      branchPoint: currentStep,
      locked: false,
      visible: true,
      outdated: false,
      moves: [{ x: point.x, y: point.y, color, moveNumber: 1 }],
      markings: [],
      subLayers: []
    };

    const updatedProject: GobanProject = {
      ...project,
      variations: [...project.variations, newVariation],
      activeVariationId: newVarId,
      activeSubLayerId: null
    };

    return { project: updatedProject, newVariationId: newVarId, isNewVariation: true };
  }

  // Parent is unlocked: play directly on variation/root
  const newMove: GoMove = {
    x: point.x,
    y: point.y,
    color,
    moveNumber: currentStep + 1
  };

  let updatedProject: GobanProject;
  if (isRoot) {
    const updatedSubs = (project.root.subLayers || []).map(s => ({ ...s, outdated: true }));
    const updatedVars = (project.variations || []).map(v => ({
      ...v,
      outdated: true,
      subLayers: (v.subLayers || []).map(s => ({ ...s, outdated: true }))
    }));
    updatedProject = {
      ...project,
      root: {
        ...project.root,
        moves: [...project.root.moves.slice(0, currentStep), newMove],
        subLayers: updatedSubs
      },
      variations: updatedVars,
      activeSubLayerId: null
    };
  } else {
    // When a variation is changed, all sublayers under this variation and all descendant variations are marked as outdated
    const descendantIds = getDescendantVariationIds(project.variations, activeVariationId);
    updatedProject = {
      ...project,
      variations: project.variations.map(v => {
        if (v.id === activeVariationId) {
          const updatedSubs = (v.subLayers || []).map(s => ({ ...s, outdated: true }));
          return {
            ...v,
            moves: [...v.moves.slice(0, currentStep), newMove],
            subLayers: updatedSubs
          };
        }
        if (descendantIds.has(v.id)) {
          return {
            ...v,
            outdated: true,
            subLayers: (v.subLayers || []).map(s => ({ ...s, outdated: true }))
          };
        }
        return v;
      }),
      activeSubLayerId: null
    };
  }

  return { project: updatedProject, isNewVariation: false };
}

export function recordDrawing(
  project: GobanProject,
  activeVariationId: string,
  path: DrawingPath,
  activeSubLayerIdOverride?: string | null
): { project: GobanProject; newSubLayerId?: string; isNewSubLayer: boolean; error?: string } {
  const isRoot = activeVariationId === 'root';
  const parent = isRoot ? project.root : project.variations.find(v => v.id === activeVariationId);
  if (!parent) return { project, isNewSubLayer: false, error: 'Parent layer not found' };

  // Check if an active sublayer is selected
  const activeSubId = activeSubLayerIdOverride !== undefined ? activeSubLayerIdOverride : project.activeSubLayerId;
  const activeSub = activeSubId ? (parent.subLayers || []).find(s => s.id === activeSubId) : null;

  if (activeSub && !activeSub.locked) {
    // Selected unlocked sublayer -> continue adding drawing to it
    const currentDrawings = activeSub.drawings || [];
    const updatedSubLayers = (parent.subLayers || []).map(s =>
      s.id === activeSubId ? { ...s, visible: true, drawings: [...currentDrawings, path] } : s
    );

    let updatedProject: GobanProject;
    if (isRoot) {
      updatedProject = {
        ...project,
        activeSubLayerId: activeSubId,
        root: { ...project.root, subLayers: updatedSubLayers }
      };
    } else {
      updatedProject = {
        ...project,
        activeSubLayerId: activeSubId,
        variations: project.variations.map(v =>
          v.id === activeVariationId ? { ...v, subLayers: updatedSubLayers } : v
        )
      };
    }
    return { project: updatedProject, isNewSubLayer: false };
  }

  // Active sublayer is locked OR no sublayer selected:
  // Auto-create a new drawing subvariation
  const drawSubs = (parent.subLayers || []).filter(s => s.type === 'drawing');
  const subName = `Drawing Overlay ${drawSubs.length + 1}`;
  const newSubId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  const newSubLayer: SubLayer = {
    id: newSubId,
    name: subName,
    type: 'drawing',
    locked: false,
    visible: true,
    defaultVisible: false,
    outdated: false,
    drawings: [path],
    moves: [],
    initialStones: [],
    markings: []
  };

  let updatedProject: GobanProject;
  if (isRoot) {
    updatedProject = {
      ...project,
      root: {
        ...project.root,
        subLayers: [...(project.root.subLayers || []), newSubLayer]
      },
      activeSubLayerId: newSubId
    };
  } else {
    updatedProject = {
      ...project,
      variations: project.variations.map(v =>
        v.id === activeVariationId
          ? { ...v, subLayers: [...(v.subLayers || []), newSubLayer] }
          : v
      ),
      activeSubLayerId: newSubId
    };
  }

  return { project: updatedProject, newSubLayerId: newSubId, isNewSubLayer: true };
}

export function recordMarking(
  project: GobanProject,
  activeVariationId: string,
  marking: BoardMarking,
  activeSubLayerIdOverride?: string | null
): { project: GobanProject; newSubLayerId?: string; isNewSubLayer: boolean; error?: string } {
  const isRoot = activeVariationId === 'root';
  const parent = isRoot ? project.root : project.variations.find(v => v.id === activeVariationId);
  if (!parent) return { project, isNewSubLayer: false, error: 'Parent layer not found' };

  const activeSubId = activeSubLayerIdOverride !== undefined ? activeSubLayerIdOverride : project.activeSubLayerId;
  const activeSub = activeSubId ? (parent.subLayers || []).find(s => s.id === activeSubId) : null;

  let effectiveMarking = marking;
  if (effectiveMarking.type === 'LB' && effectiveMarking.label === undefined) {
    const currentLayerMarks = activeSub && !activeSub.locked
      ? (activeSub.markings || [])
      : (!parent.locked ? (parent.markings || []) : []);
    effectiveMarking = { ...effectiveMarking, label: getNextLetterMark(currentLayerMarks) };
  }

  if (activeSub && !activeSub.locked) {
    const currentMarks = activeSub.markings || [];
    const updatedSubLayers = (parent.subLayers || []).map(s =>
      s.id === activeSubId
        ? {
            ...s,
            visible: true,
            markings: [...currentMarks.filter(m => !(m.x === effectiveMarking.x && m.y === effectiveMarking.y)), effectiveMarking]
          }
        : s
    );

    let updatedProject: GobanProject;
    if (isRoot) {
      updatedProject = {
        ...project,
        activeSubLayerId: activeSubId,
        root: { ...project.root, subLayers: updatedSubLayers }
      };
    } else {
      updatedProject = {
        ...project,
        activeSubLayerId: activeSubId,
        variations: project.variations.map(v =>
          v.id === activeVariationId ? { ...v, subLayers: updatedSubLayers } : v
        )
      };
    }
    return { project: updatedProject, isNewSubLayer: false };
  }

  if (parent.locked || (activeSub && activeSub.locked)) {
    const markSubs = (parent.subLayers || []).filter(s => s.type === 'drawing' || s.type === 'markings');
    const subName = `Drawing Overlay ${markSubs.length + 1}`;
    const newSubId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const newSubLayer: SubLayer = {
      id: newSubId,
      name: subName,
      type: 'drawing',
      locked: false,
      visible: true,
      defaultVisible: false,
      outdated: false,
      markings: [effectiveMarking],
      moves: [],
      initialStones: [],
      drawings: []
    };

    let updatedProject: GobanProject;
    if (isRoot) {
      updatedProject = {
        ...project,
        root: {
          ...project.root,
          subLayers: [...(project.root.subLayers || []), newSubLayer]
        },
        activeSubLayerId: newSubId
      };
    } else {
      updatedProject = {
        ...project,
        variations: project.variations.map(v =>
          v.id === activeVariationId
            ? { ...v, subLayers: [...(v.subLayers || []), newSubLayer] }
            : v
        ),
        activeSubLayerId: newSubId
      };
    }

    return { project: updatedProject, newSubLayerId: newSubId, isNewSubLayer: true };
  }

  // Adding marking directly to variation marks all existing subvariations under this layer as outdated
  let updatedProject: GobanProject;
  if (isRoot) {
    const marks = project.root.markings || [];
    const updatedSubs = (project.root.subLayers || []).map(s => ({ ...s, outdated: true }));
    const updatedVars = (project.variations || []).map(v => ({
      ...v,
      outdated: true,
      subLayers: (v.subLayers || []).map(s => ({ ...s, outdated: true }))
    }));
    updatedProject = {
      ...project,
      root: {
        ...project.root,
        markings: [...marks.filter(m => !(m.x === effectiveMarking.x && m.y === effectiveMarking.y)), effectiveMarking],
        subLayers: updatedSubs
      },
      variations: updatedVars
    };
  } else {
    const descendantIds = getDescendantVariationIds(project.variations, activeVariationId);
    updatedProject = {
      ...project,
      variations: project.variations.map(v => {
        if (v.id === activeVariationId) {
          const marks = v.markings || [];
          const updatedSubs = (v.subLayers || []).map(s => ({ ...s, outdated: true }));
          return {
            ...v,
            markings: [...marks.filter(m => !(m.x === effectiveMarking.x && m.y === effectiveMarking.y)), effectiveMarking],
            subLayers: updatedSubs
          };
        }
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

  return { project: updatedProject, isNewSubLayer: false };
}

export function toggleSubLayerOutdated(
  project: GobanProject,
  parentVariationId: string,
  subLayerId: string
): GobanProject {
  const isRoot = parentVariationId === 'root';
  const updateSubs = (subs: SubLayer[]) =>
    subs.map(s => (s.id === subLayerId ? { ...s, outdated: !s.outdated } : s));

  if (isRoot) {
    return {
      ...project,
      root: {
        ...project.root,
        subLayers: updateSubs(project.root.subLayers || [])
      }
    };
  }

  return {
    ...project,
    variations: project.variations.map(v =>
      v.id === parentVariationId ? { ...v, subLayers: updateSubs(v.subLayers || []) } : v
    )
  };
}

export function markSubLayersOutdated(
  project: GobanProject,
  parentVariationId: string
): GobanProject {
  const isRoot = parentVariationId === 'root';
  const updateSubs = (subs: SubLayer[]) =>
    subs.map(s => ({ ...s, outdated: true }));

  if (isRoot) {
    return {
      ...project,
      root: {
        ...project.root,
        subLayers: updateSubs(project.root.subLayers || [])
      }
    };
  }

  return {
    ...project,
    variations: project.variations.map(v =>
      v.id === parentVariationId ? { ...v, subLayers: updateSubs(v.subLayers || []) } : v
    )
  };
}
