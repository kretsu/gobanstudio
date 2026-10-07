import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import {
  BoardMarking,
  BoardTheme,
  DrawingPath,
  DrawingPoint,
  MarkingType,
  NumberingMode,
  Point,
  StoneColor,
  StoneTheme,
  ToolType
} from '../types/goban';
import { DisplayStone, getNextLetterMark, getNextNumberMark } from '../engine/layerManager';
import { getStarPoints } from '../engine/goRules';
import { playStoneSound } from '../engine/soundEffects';
import {
  BoardDefs,
  BoardCoordinates,
  BoardGridLines,
  StoneRenderer,
  GhostStoneRenderer,
  MarkingRenderer,
  DrawingRenderer,
  BoardLockBadge
} from './board/index';

export interface GobanProps {
  boardSize: number;
  stones: DisplayStone[];
  markings: BoardMarking[];
  activeLayerMarkings?: BoardMarking[];
  drawings: DrawingPath[];
  isLocked: boolean;
  activeSubLayerLocked?: boolean;
  theme?: BoardTheme;
  stoneTheme?: StoneTheme;
  showCoordinates?: boolean;
  numberingMode?: NumberingMode;
  activeTool: ToolType;
  brushColor: string;
  brushWidth: number;
  soundEnabled?: boolean;
  onPlaceStone?: (point: Point, color?: StoneColor) => void;
  onRemoveStone?: (point: Point) => void;
  onAddMarking?: (marking: BoardMarking) => void;
  onRemoveMarking?: (point: Point) => void;
  onAddDrawing?: (path: DrawingPath) => void;
  onLockedActionAttempt?: () => void;
}

export const Goban: React.FC<GobanProps> = ({
  boardSize,
  stones,
  markings,
  activeLayerMarkings,
  drawings,
  isLocked,
  activeSubLayerLocked = false,
  theme = 'kaya',
  stoneTheme = 'slate-shell',
  showCoordinates = true,
  numberingMode = 'auto',
  activeTool,
  brushColor = '#ef4444',
  brushWidth = 4,
  soundEnabled = true,
  onPlaceStone,
  onRemoveStone,
  onAddMarking,
  onRemoveMarking,
  onAddDrawing,
  onLockedActionAttempt
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverPoint, setHoverPoint] = useState<Point | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPathPoints, setCurrentPathPoints] = useState<DrawingPoint[]>([]);
  const [arrowStart, setArrowStart] = useState<DrawingPoint | null>(null);
  const [arrowCurrent, setArrowCurrent] = useState<DrawingPoint | null>(null);
  const [laserTrails, setLaserTrails] = useState<{ id: string; points: DrawingPoint[]; timestamp: number }[]>([]);

  // Coordinate geometry calculation
  const margin = showCoordinates ? 36 : 22;
  const boardDimension = 800; // viewBox size
  const gridWidth = boardDimension - margin * 2;
  const cellSize = gridWidth / (boardSize - 1);
  const stoneRadius = cellSize * 0.485;

  // Convert board grid point (0..size-1) to SVG coordinates
  const getSvgCoords = useCallback((p: Point) => {
    return {
      cx: margin + p.x * cellSize,
      cy: margin + p.y * cellSize
    };
  }, [margin, cellSize]);

  // Convert client mouse event to board grid Point (0..size-1)
  const getGridPointFromEvent = useCallback((e: React.MouseEvent<SVGSVGElement>): Point | null => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const scaleX = boardDimension / rect.width;
    const scaleY = boardDimension / rect.height;

    const svgX = clientX * scaleX;
    const svgY = clientY * scaleY;

    const gx = Math.round((svgX - margin) / cellSize);
    const gy = Math.round((svgY - margin) / cellSize);

    if (gx >= 0 && gx < boardSize && gy >= 0 && gy < boardSize) {
      return { x: gx, y: gy };
    }
    return null;
  }, [margin, cellSize, boardSize]);

  // Convert client mouse event to normalized 0..1 DrawingPoint
  const getNormalizedPointFromEvent = useCallback((e: React.MouseEvent<SVGSVGElement>): DrawingPoint => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    return {
      x: Math.max(0, Math.min(1, clientX / rect.width)),
      y: Math.max(0, Math.min(1, clientY / rect.height))
    };
  }, []);

  const starPoints = useMemo(() => getStarPoints(boardSize), [boardSize]);

  // Fast stone map for lookup
  const stoneMap = useMemo(() => {
    const map = new Map<string, DisplayStone>();
    for (const s of stones) {
      map.set(`${s.x},${s.y}`, s);
    }
    return map;
  }, [stones]);

  // Fast marking map
  const markingMap = useMemo(() => {
    const map = new Map<string, BoardMarking>();
    for (const m of markings) {
      map.set(`${m.x},${m.y}`, m);
    }
    return map;
  }, [markings]);

  // Theme styling configurations
  const themeStyles = useMemo(() => {
    switch (theme) {
      case 'kaya':
        return {
          bgGradient: 'linear-gradient(135deg, #dfb170 0%, #d49f57 50%, #c98e41 100%)',
          woodPattern: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.15) 100%)',
          lineColor: '#2b1d0c',
          coordColor: '#533c1d',
          starColor: '#2b1d0c',
          border: 'border-[#a87431]',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.65)'
        };
      case 'wood':
        return {
          bgGradient: 'linear-gradient(135deg, #e8c187 0%, #d8ad6a 100%)',
          woodPattern: 'none',
          lineColor: '#3a2510',
          coordColor: '#614324',
          starColor: '#3a2510',
          border: 'border-[#b88c4a]',
          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.55)'
        };
      case 'slate':
        return {
          bgGradient: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
          woodPattern: 'none',
          lineColor: '#64748b',
          coordColor: '#94a3b8',
          starColor: '#94a3b8',
          border: 'border-slate-700',
          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.7)'
        };
      case 'paper':
        return {
          bgGradient: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
          woodPattern: 'none',
          lineColor: '#1e293b',
          coordColor: '#475569',
          starColor: '#0f172a',
          border: 'border-slate-300',
          boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.2)'
        };
      case 'dark':
      default:
        return {
          bgGradient: 'linear-gradient(135deg, #1e2024 0%, #141619 100%)',
          woodPattern: 'none',
          lineColor: '#475569',
          coordColor: '#64748b',
          starColor: '#94a3b8',
          border: 'border-slate-800',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
        };
    }
  }, [theme]);

  // Handle laser pointer fade animation
  useEffect(() => {
    if (laserTrails.length === 0) return;
    const timer = setInterval(() => {
      const now = Date.now();
      setLaserTrails(prev => prev.filter(t => now - t.timestamp < 1400));
    }, 100);
    return () => clearInterval(timer);
  }, [laserTrails.length]);

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    // Left click only
    if (e.button !== 0) return;

    // Drawing tools
    if (activeTool === 'draw-pen') {
      setIsDrawing(true);
      const pt = getNormalizedPointFromEvent(e);
      setCurrentPathPoints([pt]);
    } else if (activeTool === 'draw-arrow' || activeTool === 'draw-line') {
      setIsDrawing(true);
      const pt = getNormalizedPointFromEvent(e);
      setArrowStart(pt);
      setArrowCurrent(pt);
    } else if (activeTool === 'draw-laser') {
      const pt = getNormalizedPointFromEvent(e);
      setLaserTrails(prev => [
        ...prev,
        { id: `laser_${Date.now()}_${Math.random()}`, points: [pt], timestamp: Date.now() }
      ]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const gridPt = getGridPointFromEvent(e);
    setHoverPoint(gridPt);

    if (activeTool === 'draw-laser' && e.buttons === 1) {
      const pt = getNormalizedPointFromEvent(e);
      setLaserTrails(prev => {
        if (prev.length === 0) {
          return [{ id: `laser_${Date.now()}`, points: [pt], timestamp: Date.now() }];
        }
        const last = prev[prev.length - 1];
        if (Date.now() - last.timestamp < 350) {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...last,
            points: [...last.points, pt]
          };
          return updated;
        } else {
          return [...prev, { id: `laser_${Date.now()}`, points: [pt], timestamp: Date.now() }];
        }
      });
      return;
    }

    if (!isDrawing) return;

    if (activeTool === 'draw-pen') {
      const pt = getNormalizedPointFromEvent(e);
      setCurrentPathPoints(prev => [...prev, pt]);
    } else if (activeTool === 'draw-arrow' || activeTool === 'draw-line') {
      const pt = getNormalizedPointFromEvent(e);
      setArrowCurrent(pt);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDrawing) {
      setIsDrawing(false);

      if (activeTool === 'draw-pen' && currentPathPoints.length > 1) {
        onAddDrawing?.({
          id: `draw_${Date.now()}`,
          type: 'freeline',
          points: currentPathPoints,
          color: brushColor,
          width: brushWidth
        });
      } else if ((activeTool === 'draw-arrow' || activeTool === 'draw-line') && arrowStart && arrowCurrent) {
        onAddDrawing?.({
          id: `draw_${Date.now()}`,
          type: activeTool === 'draw-arrow' ? 'arrow' : 'line',
          points: [arrowStart, arrowCurrent],
          color: brushColor,
          width: brushWidth
        });
      }

      setCurrentPathPoints([]);
      setArrowStart(null);
      setArrowCurrent(null);
      return;
    }

    // Grid click actions (stones, markings)
    const pt = getGridPointFromEvent(e);
    if (!pt) return;

    if (activeTool === 'stone-alt' || activeTool === 'stone-black' || activeTool === 'stone-white') {
      const isOccupied = stoneMap.has(`${pt.x},${pt.y}`);
      if (activeTool === 'stone-alt') {
        onPlaceStone?.(pt);
        if (soundEnabled && !isOccupied) playStoneSound();
      } else if (activeTool === 'stone-black') {
        onPlaceStone?.(pt, 'B');
        if (soundEnabled && !isOccupied) playStoneSound();
      } else if (activeTool === 'stone-white') {
        onPlaceStone?.(pt, 'W');
        if (soundEnabled && !isOccupied) playStoneSound();
      }
    } else if (activeTool === 'stone-remove') {
      if (isLocked || activeSubLayerLocked) {
        onLockedActionAttempt?.();
        return;
      }
      onRemoveStone?.(pt);
    } else if (activeTool.startsWith('mark-')) {
      const existing = markingMap.get(`${pt.x},${pt.y}`);
      if (existing) {
        onRemoveMarking?.(pt);
      } else {
        let type: MarkingType = 'TR';
        let label: string | undefined = undefined;
        const currentLayerMarks = activeLayerMarkings || markings;

        if (activeTool === 'mark-triangle') type = 'TR';
        else if (activeTool === 'mark-square') type = 'SQ';
        else if (activeTool === 'mark-circle') type = 'CR';
        else if (activeTool === 'mark-cross') type = 'MA';
        else if (activeTool === 'mark-label') {
          type = 'LB';
          label = getNextLetterMark(currentLayerMarks);
        } else if (activeTool === 'mark-number') {
          type = 'LB';
          label = getNextNumberMark(currentLayerMarks);
        } else if (activeTool === 'mark-territory-black') type = 'TB';
        else if (activeTool === 'mark-territory-white') type = 'TW';

        onAddMarking?.({
          x: pt.x,
          y: pt.y,
          type,
          label
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setHoverPoint(null);
    if (isDrawing) {
      setIsDrawing(false);
      setCurrentPathPoints([]);
      setArrowStart(null);
      setArrowCurrent(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-[850px] aspect-square rounded-2xl shadow-2xl p-2 select-none border-4 transition-all duration-300 ${themeStyles.border}`}
      style={{
        background: themeStyles.bgGradient,
        boxShadow: themeStyles.boxShadow
      }}
    >
      <svg
        viewBox={`0 0 ${boardDimension} ${boardDimension}`}
        className="w-full h-full cursor-crosshair overflow-visible"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <BoardDefs brushColor={brushColor} />

        {/* Board Background texture overlay */}
        <rect
          x="0"
          y="0"
          width={boardDimension}
          height={boardDimension}
          fill="none"
          rx="12"
        />

        {/* Coordinates */}
        {showCoordinates && (
          <BoardCoordinates
            boardSize={boardSize}
            margin={margin}
            cellSize={cellSize}
            boardDimension={boardDimension}
            coordColor={themeStyles.coordColor}
          />
        )}

        {/* Grid Lines & Star Points */}
        <BoardGridLines
          boardSize={boardSize}
          margin={margin}
          cellSize={cellSize}
          boardDimension={boardDimension}
          lineColor={themeStyles.lineColor}
          starColor={themeStyles.starColor}
          starPoints={starPoints}
          getSvgCoords={getSvgCoords}
        />

        {/* Placed Stones */}
        <StoneRenderer
          stones={stones}
          stoneRadius={stoneRadius}
          cellSize={cellSize}
          stoneTheme={stoneTheme}
          numberingMode={numberingMode}
          getSvgCoords={getSvgCoords}
        />

        {/* Board Markings Layer */}
        <MarkingRenderer
          markings={markings}
          stoneMap={stoneMap}
          cellSize={cellSize}
          getSvgCoords={getSvgCoords}
        />

        {/* Freehand Vector Drawings Layer */}
        <DrawingRenderer
          drawings={drawings}
          boardDimension={boardDimension}
          isDrawing={isDrawing}
          activeTool={activeTool}
          currentPathPoints={currentPathPoints}
          brushColor={brushColor}
          brushWidth={brushWidth}
          arrowStart={arrowStart}
          arrowCurrent={arrowCurrent}
          laserTrails={laserTrails}
        />

        {/* Hover Ghost Stone Preview */}
        {hoverPoint && !isDrawing && activeTool.startsWith('stone-') && activeTool !== 'stone-remove' && !stoneMap.has(`${hoverPoint.x},${hoverPoint.y}`) && (
          <g style={{ pointerEvents: 'none' }}>
            <GhostStoneRenderer
              cx={getSvgCoords(hoverPoint).cx}
              cy={getSvgCoords(hoverPoint).cy}
              radius={stoneRadius}
              isWhite={activeTool === 'stone-white' || (activeTool === 'stone-alt' && stones.length % 2 === 1)}
              themeStyle={stoneTheme}
            />
          </g>
        )}
      </svg>

      {/* Layer Locked Status Watermark Badge */}
      <BoardLockBadge
        isLocked={isLocked}
        activeSubLayerLocked={activeSubLayerLocked}
      />
    </div>
  );
};
