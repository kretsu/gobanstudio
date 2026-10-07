import {
  BoardMarking,
  DrawingPath,
  GobanProject,
  Point,
  SubLayer,
  VariationLayer
} from '../types/goban';
import { BoardGrid, createEmptyGrid, playMoveOnGrid } from './goRules';
import { getVariationAncestorChain } from './variationTree';

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
