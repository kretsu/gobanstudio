import { GoMove, PlacedStone, Point, StoneColor } from '../types/goban';

export type BoardGrid = (StoneColor | null)[][];

export interface BoardState {
  grid: BoardGrid;
  lastMove: Point | null;
  captures: {
    B: number; // captured white stones (held by Black)
    W: number; // captured black stones (held by White)
  };
  historyGrid: BoardGrid[]; // grid at each step for undo / step
}

export function createEmptyGrid(size: number): BoardGrid {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

export function cloneGrid(grid: BoardGrid): BoardGrid {
  return grid.map(row => [...row]);
}

export function getAdjacentPoints(p: Point, size: number): Point[] {
  const adj: Point[] = [];
  if (p.x > 0) adj.push({ x: p.x - 1, y: p.y });
  if (p.x < size - 1) adj.push({ x: p.x + 1, y: p.y });
  if (p.y > 0) adj.push({ x: p.x, y: p.y - 1 });
  if (p.y < size - 1) adj.push({ x: p.x, y: p.y + 1 });
  return adj;
}

export interface GroupResult {
  stones: Point[];
  liberties: Point[];
  color: StoneColor;
}

export function getGroup(grid: BoardGrid, start: Point, size: number): GroupResult | null {
  const color = grid[start.y]?.[start.x];
  if (!color) return null;

  const visitedStones: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const visitedLiberties: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const stones: Point[] = [];
  const liberties: Point[] = [];
  const queue: Point[] = [start];

  visitedStones[start.y][start.x] = true;

  while (queue.length > 0) {
    const curr = queue.shift()!;
    stones.push(curr);

    const neighbors = getAdjacentPoints(curr, size);
    for (const n of neighbors) {
      const neighborColor = grid[n.y][n.x];
      if (neighborColor === null) {
        if (!visitedLiberties[n.y][n.x]) {
          visitedLiberties[n.y][n.x] = true;
          liberties.push(n);
        }
      } else if (neighborColor === color) {
        if (!visitedStones[n.y][n.x]) {
          visitedStones[n.y][n.x] = true;
          queue.push(n);
        }
      }
    }
  }

  return { stones, liberties, color };
}

export interface MoveExecutionResult {
  success: boolean;
  grid: BoardGrid;
  capturedStones: Point[];
  error?: 'OCCUPIED' | 'SUICIDE' | 'OUT_OF_BOUNDS';
}

export function playMoveOnGrid(
  grid: BoardGrid,
  move: Point,
  color: StoneColor,
  size: number,
  allowSuicide: boolean = false
): MoveExecutionResult {
  if (move.x < 0 || move.x >= size || move.y < 0 || move.y >= size) {
    return { success: false, grid, capturedStones: [], error: 'OUT_OF_BOUNDS' };
  }

  if (grid[move.y][move.x] !== null) {
    return { success: false, grid, capturedStones: [], error: 'OCCUPIED' };
  }

  const nextGrid = cloneGrid(grid);
  nextGrid[move.y][move.x] = color;

  const opponentColor: StoneColor = color === 'B' ? 'W' : 'B';
  const neighbors = getAdjacentPoints(move, size);
  const capturedStones: Point[] = [];

  // Check captures of opponent groups
  for (const n of neighbors) {
    if (nextGrid[n.y][n.x] === opponentColor) {
      const group = getGroup(nextGrid, n, size);
      if (group && group.liberties.length === 0) {
        for (const s of group.stones) {
          if (nextGrid[s.y][s.x] !== null) {
            nextGrid[s.y][s.x] = null;
            capturedStones.push(s);
          }
        }
      }
    }
  }

  // Check suicide for the played stone
  const selfGroup = getGroup(nextGrid, move, size);
  if (selfGroup && selfGroup.liberties.length === 0) {
    if (!allowSuicide) {
      return { success: false, grid, capturedStones: [], error: 'SUICIDE' };
    }
  }

  return {
    success: true,
    grid: nextGrid,
    capturedStones
  };
}

export function computeBoardState(
  boardSize: number,
  initialStones: PlacedStone[] = [],
  moves: GoMove[] = [],
  moveLimit?: number
): BoardState {
  let grid = createEmptyGrid(boardSize);
  let captures = { B: 0, W: 0 };
  const historyGrid: BoardGrid[] = [cloneGrid(grid)];

  // Place initial setup stones
  for (const stone of initialStones) {
    if (stone.x >= 0 && stone.x < boardSize && stone.y >= 0 && stone.y < boardSize) {
      grid[stone.y][stone.x] = stone.color;
    }
  }
  historyGrid[0] = cloneGrid(grid);

  let lastMove: Point | null = null;
  const count = moveLimit !== undefined ? Math.min(moves.length, Math.max(0, moveLimit)) : moves.length;

  for (let i = 0; i < count; i++) {
    const m = moves[i];
    const res = playMoveOnGrid(grid, { x: m.x, y: m.y }, m.color, boardSize, true);
    grid = res.grid;
    lastMove = { x: m.x, y: m.y };

    if (res.capturedStones.length > 0) {
      if (m.color === 'B') {
        captures.B += res.capturedStones.length;
      } else {
        captures.W += res.capturedStones.length;
      }
    }
    historyGrid.push(cloneGrid(grid));
  }

  return {
    grid,
    lastMove,
    captures,
    historyGrid
  };
}

export function getStarPoints(size: number): Point[] {
  if (size === 19) {
    const coords = [3, 9, 15];
    const stars: Point[] = [];
    for (const x of coords) {
      for (const y of coords) {
        stars.push({ x, y });
      }
    }
    return stars;
  }
  if (size === 13) {
    return [
      { x: 3, y: 3 }, { x: 9, y: 3 },
      { x: 6, y: 6 },
      { x: 3, y: 9 }, { x: 9, y: 9 }
    ];
  }
  if (size === 9) {
    return [
      { x: 2, y: 2 }, { x: 6, y: 2 },
      { x: 4, y: 4 },
      { x: 2, y: 6 }, { x: 6, y: 6 }
    ];
  }
  return [];
}

const LETTERS = 'ABCDEFGHJKLMNOPQRST'; // standard Go coordinate letters (skipping 'I')

export function getXCoordinateLabel(x: number): string {
  if (x >= 0 && x < LETTERS.length) {
    return LETTERS[x];
  }
  return String.fromCharCode(65 + x);
}

export function getYCoordinateLabel(y: number, size: number): string {
  return String(size - y);
}

export function parseSgfCoordinate(coord: string): Point | null {
  if (!coord || coord.length < 2) return null;
  const x = coord.charCodeAt(0) - 97; // 'a' -> 0
  const y = coord.charCodeAt(1) - 97;
  return { x, y };
}

export function formatSgfCoordinate(p: Point): string {
  return String.fromCharCode(97 + p.x) + String.fromCharCode(97 + p.y);
}
