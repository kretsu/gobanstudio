import {
  BoardMarking,
  DrawingPath,
  GobanProject,
  GoMove,
  Point,
  SubLayer,
  VariationLayer
} from '../types/goban';
import { BoardGrid, createEmptyGrid, playMoveOnGrid } from './goRules';

export interface DisplayStone extends Point {
  color: 'B' | 'W';
  number: number | null; // null if unnumbered (e.g. root stones in variation mode)
  isVariation: boolean;
  isSubLayer: boolean;
  isLastMove: boolean;
  sourceLayerId: string;
}

export interface ComputedDisplayState {
  grid: BoardGrid;
  stones: DisplayStone[];
  markings: BoardMarking[];
  drawings: DrawingPath[];
  isLocked: boolean;
  currentStep: number;
  totalSteps: number;
  activeLayerName: string;
  activeLayerType: 'root' | 'variation';
  activeVariation: VariationLayer | null;
  activeSubLayer: SubLayer | null;
  captures: { B: number; W: number };
}

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
 * Returns all descendant variation IDs under targetId (inclusive of targetId or exclusive).
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

export function computeDisplayState(
  project: GobanProject,
  activeVariationId: string,
  moveStepOverride?: number,
  activeSubLayerIdOverride?: string | null
): ComputedDisplayState {
  const isRoot = activeVariationId === 'root';
  const variation = isRoot ? null : project.variations.find(v => v.id === activeVariationId) || null;
  const effectiveActiveSubId = activeSubLayerIdOverride !== undefined ? activeSubLayerIdOverride : project.activeSubLayerId;

  const boardSize = project.boardSize;
  const stones: DisplayStone[] = [];
  const markings: BoardMarking[] = [];
  const drawings: DrawingPath[] = [];

  let grid = createEmptyGrid(boardSize);
  let captures = { B: 0, W: 0 };
  let isLocked = false;
  let activeLayerName = project.root.name || 'Root / Base Board';
  let activeLayerType: 'root' | 'variation' = 'root';

  if (isRoot) {
    isLocked = project.root.locked;
    activeLayerName = project.root.name || 'Main Game (Root)';
    activeLayerType = 'root';

    // 1. Initial setup stones
    for (const s of project.root.initialStones || []) {
      if (s.x >= 0 && s.x < boardSize && s.y >= 0 && s.y < boardSize) {
        grid[s.y][s.x] = s.color;
        stones.push({
          x: s.x,
          y: s.y,
          color: s.color,
          number: null,
          isVariation: false,
          isSubLayer: false,
          isLastMove: false,
          sourceLayerId: 'root'
        });
      }
    }

    // 2. Root moves
    const totalMoves = project.root.moves.length;
    const stepCount = moveStepOverride !== undefined ? Math.min(totalMoves, Math.max(0, moveStepOverride)) : totalMoves;

    for (let i = 0; i < stepCount; i++) {
      const m = project.root.moves[i];
      const res = playMoveOnGrid(grid, { x: m.x, y: m.y }, m.color, boardSize, true);
      grid = res.grid;
      if (res.capturedStones.length > 0) {
        if (m.color === 'B') captures.B += res.capturedStones.length;
        else captures.W += res.capturedStones.length;
      }
    }

    // In Root mode, stones display their sequence numbers (1..N)
    const moveMap = new Map<string, number>();
    for (let i = 0; i < stepCount; i++) {
      const m = project.root.moves[i];
      moveMap.set(`${m.x},${m.y}`, i + 1);
    }

    // Clear and rebuild final display stones
    stones.length = 0;
    const lastMovePoint = stepCount > 0 ? project.root.moves[stepCount - 1] : null;

    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        const color = grid[y][x];
        if (color) {
          const moveNum = moveMap.get(`${x},${y}`) || null;
          const isLast = lastMovePoint !== null && lastMovePoint.x === x && lastMovePoint.y === y;
          stones.push({
            x,
            y,
            color,
            number: moveNum,
            isVariation: false,
            isSubLayer: false,
            isLastMove: isLast,
            sourceLayerId: 'root'
          });
        }
      }
    }

    // Markings on root
    if (project.root.markings) {
      markings.push(...project.root.markings);
    }

    // Drawing sublayers on root
    for (const sub of project.root.subLayers || []) {
      if (sub.visible) {
        if (sub.markings) markings.push(...sub.markings);
        if (sub.drawings) drawings.push(...sub.drawings);
      }
    }

    const activeSub = effectiveActiveSubId
      ? (project.root.subLayers || []).find(s => s.id === effectiveActiveSubId) || null
      : null;

    return {
      grid,
      stones,
      markings,
      drawings,
      isLocked: activeSub ? activeSub.locked : isLocked,
      currentStep: stepCount,
      totalSteps: totalMoves,
      activeLayerName: activeSub ? `${project.root.name || 'Root'} › ${activeSub.name}` : activeLayerName,
      activeLayerType,
      activeVariation: null,
      activeSubLayer: activeSub,
      captures
    };
  } else if (variation) {
    isLocked = variation.locked;
    activeLayerName = variation.name;
    activeLayerType = 'variation';

    // Get the ancestor chain of variations leading to this variation
    const chain = getVariationAncestorChain(project, variation.id);
    const topVar = chain[0] || variation;

    // Root initial stones
    for (const s of project.root.initialStones || []) {
      if (s.x >= 0 && s.x < boardSize && s.y >= 0 && s.y < boardSize) {
        grid[s.y][s.x] = s.color;
      }
    }

    // Root moves up to branch point of the top variation
    const rootBranchPoint = topVar.branchPoint > 0
      ? Math.min(topVar.branchPoint, project.root.moves.length)
      : (topVar.branchPoint === 0 ? 0 : project.root.moves.length);

    for (let i = 0; i < rootBranchPoint; i++) {
      const m = project.root.moves[i];
      const res = playMoveOnGrid(grid, { x: m.x, y: m.y }, m.color, boardSize, true);
      grid = res.grid;
      if (res.capturedStones.length > 0) {
        if (m.color === 'B') captures.B += res.capturedStones.length;
        else captures.W += res.capturedStones.length;
      }
    }

    // Track variation stones and numbers
    const varMoveMap = new Map<string, { number: number; layerId: string }>();
    let cumulativeBranchPoint = 0;
    let targetVarStepCount = variation.moves.length;
    let lastVarMove: Point | null = null;

    // Play moves along the ancestor chain
    for (let k = 0; k < chain.length; k++) {
      const curVar = chain[k];
      const isTarget = k === chain.length - 1;
      const totalVarMoves = curVar.moves.length;

      let varStepCount: number;
      if (isTarget) {
        varStepCount = moveStepOverride !== undefined
          ? Math.min(totalVarMoves, Math.max(0, moveStepOverride))
          : totalVarMoves;
        targetVarStepCount = varStepCount;
        if (varStepCount > 0) {
          lastVarMove = curVar.moves[varStepCount - 1];
        }
      } else {
        const nextVar = chain[k + 1];
        const bp = nextVar.branchPoint !== undefined ? nextVar.branchPoint : totalVarMoves;
        varStepCount = bp > 0 ? Math.min(totalVarMoves, bp) : (bp === 0 ? 0 : totalVarMoves);
      }

      for (let i = 0; i < varStepCount; i++) {
        const m = curVar.moves[i];
        const res = playMoveOnGrid(grid, { x: m.x, y: m.y }, m.color, boardSize, true);
        grid = res.grid;

        // Numbering rule:
        // Top variation starts at 1 (1..M).
        // Child variation continues numbering from parent variation's branch point!
        const moveNum = (k === 0) ? (i + 1) : (cumulativeBranchPoint + i + 1);
        varMoveMap.set(`${m.x},${m.y}`, { number: moveNum, layerId: curVar.id });

        if (res.capturedStones.length > 0) {
          if (m.color === 'B') captures.B += res.capturedStones.length;
          else captures.W += res.capturedStones.length;
        }
      }

      // Update cumulative branch point for subsequent child variations
      if (k === 0) {
        cumulativeBranchPoint = varStepCount;
      } else {
        cumulativeBranchPoint += varStepCount;
      }
    }

    // Collect all final stones on the board
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        const color = grid[y][x];
        if (color) {
          const varInfo = varMoveMap.get(`${x},${y}`);
          const isVarStone = varInfo !== undefined;
          const isLast = lastVarMove !== null && lastVarMove.x === x && lastVarMove.y === y;

          stones.push({
            x,
            y,
            color,
            // Root stones in variation view have NO number; variation moves start from 1 or continue sequence
            number: isVarStone ? varInfo.number : null,
            isVariation: isVarStone,
            isSubLayer: false,
            isLastMove: isLast,
            sourceLayerId: isVarStone ? varInfo.layerId : 'root'
          });
        }
      }
    }

    // Variation Markings
    if (variation.markings) {
      markings.push(...variation.markings);
    }

    // Drawing sublayers under this variation
    for (const sub of variation.subLayers || []) {
      if (sub.visible) {
        if (sub.markings) markings.push(...sub.markings);
        if (sub.drawings) drawings.push(...sub.drawings);
      }
    }

    const activeSub = effectiveActiveSubId
      ? variation.subLayers.find(s => s.id === effectiveActiveSubId) || null
      : null;

    return {
      grid,
      stones,
      markings,
      drawings,
      isLocked: activeSub ? activeSub.locked : isLocked,
      currentStep: targetVarStepCount,
      totalSteps: variation.moves.length,
      activeLayerName: activeSub ? `${variation.name} › ${activeSub.name}` : activeLayerName,
      activeLayerType,
      activeVariation: variation,
      activeSubLayer: activeSub,
      captures
    };
  }

  return {
    grid,
    stones,
    markings,
    drawings,
    isLocked: false,
    currentStep: 0,
    totalSteps: 0,
    activeLayerName: 'Empty',
    activeLayerType: 'root',
    activeVariation: null,
    activeSubLayer: null,
    captures
  };
}

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

export function getNextLetterMark(existingMarkings: BoardMarking[] = []): string {
  const usedLetters = new Set(
    existingMarkings
      .filter(m => m.type === 'LB' && m.label && /^[A-Z]$/.test(m.label))
      .map(m => m.label!)
  );

  for (let i = 0; i < 26; i++) {
    const char = String.fromCharCode(65 + i);
    if (!usedLetters.has(char)) {
      return char;
    }
  }
  return 'Z';
}

export function getNextNumberMark(existingMarkings: BoardMarking[] = []): string {
  const usedNumbers = new Set(
    existingMarkings
      .filter(m => m.type === 'LB' && m.label && /^\d+$/.test(m.label))
      .map(m => parseInt(m.label!, 10))
  );

  let n = 1;
  while (usedNumbers.has(n)) {
    n++;
  }
  return String(n);
}

export function getActiveLayerMarkings(
  project: GobanProject,
  activeVariationId: string = 'root',
  activeSubLayerId: string | null = null
): BoardMarking[] {
  const isRoot = activeVariationId === 'root';
  const parent = isRoot ? project.root : project.variations.find(v => v.id === activeVariationId);
  if (!parent) return [];

  if (activeSubLayerId) {
    const activeSub = (parent.subLayers || []).find(s => s.id === activeSubLayerId);
    if (activeSub) {
      if (activeSub.locked) return [];
      return activeSub.markings || [];
    }
  }

  if (parent.locked) return [];

  return parent.markings || [];
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
