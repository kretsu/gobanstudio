export type StoneColor = 'B' | 'W';

export interface Point {
  x: number; // 0-indexed (0 to boardSize - 1)
  y: number; // 0-indexed (0 to boardSize - 1)
}

export interface PlacedStone extends Point {
  color: StoneColor;
}

export interface GoMove extends Point {
  color: StoneColor;
  moveNumber: number; // 1-indexed relative to sequence
  comment?: string;
  timeSpent?: number;
}

export type MarkingType = 'TR' | 'SQ' | 'CR' | 'MA' | 'LB' | 'TB' | 'TW' | 'DIM';
// TR: Triangle, SQ: Square, CR: Circle, MA: Mark/Cross (X), LB: Label, TB: Territory Black, TW: Territory White, DIM: Dim area

export interface BoardMarking extends Point {
  type: MarkingType;
  label?: string; // Text for LB (e.g. 'A', '1', 'Ko')
  color?: string; // Optional custom color
}

export interface DrawingPoint {
  x: number; // Normalized 0..1 relative to board canvas or point coordinates
  y: number;
}

export interface DrawingPath {
  id: string;
  type: 'freeline' | 'arrow' | 'line';
  points: DrawingPoint[];
  color: string;
  width: number;
  opacity?: number;
}

export interface SubLayer {
  id: string;
  name: string;
  type: 'drawing' | 'markings' | 'stones' | 'mixed';
  locked: boolean;
  visible: boolean; // Current active visibility
  defaultVisible: boolean; // Persisted default visibility (defaults to false when loaded)
  outdated?: boolean; // True if subvariation is outdated because parent variation was changed; false if valid
  moves?: GoMove[];
  initialStones?: PlacedStone[];
  markings?: BoardMarking[];
  drawings?: DrawingPath[];
  notes?: string;
}

export interface VariationLayer {
  id: string;
  name: string;
  tags: string[];
  description: string;
  parentId?: string; // 'root' or another variation id (defaults to 'root')
  branchPoint: number; // Move number in parent layer where this branch forks (0 = from start)
  locked: boolean;
  visible: boolean;
  outdated?: boolean; // True if variation is outdated because parent was modified; false if valid
  moves: GoMove[];
  initialStones?: PlacedStone[];
  markings: BoardMarking[];
  subLayers: SubLayer[];
}

export interface RootLayer {
  id: 'root';
  name: string;
  locked: boolean;
  visible: boolean;
  moves: GoMove[];
  initialStones: PlacedStone[];
  markings: BoardMarking[];
  subLayers: SubLayer[];
}

export interface GobanProject {
  version: '1.0.0';
  title: string;
  description?: string;
  tags?: string[];
  boardSize: number; // 19, 13, 9
  rules: 'Japanese' | 'Chinese';
  komi: number;
  handicap: number;
  blackPlayer?: string;
  whitePlayer?: string;
  date?: string;
  root: RootLayer;
  variations: VariationLayer[];
  activeVariationId: string; // 'root' or variation id
  activeSubLayerId?: string | null; // active sublayer for editing, if any
}

export type BoardTheme = 'kaya' | 'wood' | 'slate' | 'paper' | 'dark';

export type ToolType = 
  | 'stone-alt' // Alternate B and W
  | 'stone-black'
  | 'stone-white'
  | 'stone-remove'
  | 'mark-triangle'
  | 'mark-square'
  | 'mark-circle'
  | 'mark-cross'
  | 'mark-label'
  | 'mark-number'
  | 'mark-territory-black'
  | 'mark-territory-white'
  | 'draw-pen'
  | 'draw-arrow'
  | 'draw-line'
  | 'draw-laser'
  | 'draw-eraser';

export type NumberingMode = 'auto' | 'all' | 'last-only' | 'none';
