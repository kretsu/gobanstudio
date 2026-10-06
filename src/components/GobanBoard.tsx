import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import {
  BoardMarking,
  BoardTheme,
  DrawingPath,
  DrawingPoint,
  GoMove,
  MarkingType,
  NumberingMode,
  Point,
  StoneColor,
  ToolType
} from '../types/goban';
import { DisplayStone, getNextLetterMark, getNextNumberMark } from '../engine/layerManager';
import { getStarPoints, getXCoordinateLabel, getYCoordinateLabel } from '../engine/goRules';
import { playStoneSound } from '../engine/soundEffects';

interface GobanBoardProps {
  boardSize: number;
  stones: DisplayStone[];
  markings: BoardMarking[];
  activeLayerMarkings?: BoardMarking[];
  drawings: DrawingPath[];
  isLocked: boolean;
  activeSubLayerLocked?: boolean;
  theme?: BoardTheme;
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

export const GobanBoard: React.FC<GobanBoardProps> = ({
  boardSize,
  stones,
  markings,
  activeLayerMarkings,
  drawings,
  isLocked,
  activeSubLayerLocked = false,
  theme = 'kaya',
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

  const stoneRadius = cellSize * 0.485;
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

  // Pointer interactions
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const isDrawingTool = activeTool.startsWith('draw-');

    if (isDrawingTool) {
      const pt = getNormalizedPointFromEvent(e);
      if (activeTool === 'draw-pen') {
        setIsDrawing(true);
        setCurrentPathPoints([pt]);
      } else if (activeTool === 'draw-arrow' || activeTool === 'draw-line') {
        setIsDrawing(true);
        setArrowStart(pt);
        setArrowCurrent(pt);
      } else if (activeTool === 'draw-laser') {
        setIsDrawing(true);
        setCurrentPathPoints([pt]);
        setLaserTrails(prev => [...prev, { id: `laser_${Date.now()}`, points: [pt], timestamp: Date.now() }]);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const pt = getGridPointFromEvent(e);
    setHoverPoint(pt);

    if (isDrawing) {
      const normPt = getNormalizedPointFromEvent(e);
      if (activeTool === 'draw-pen') {
        setCurrentPathPoints(prev => [...prev, normPt]);
      } else if (activeTool === 'draw-arrow' || activeTool === 'draw-line') {
        setArrowCurrent(normPt);
      } else if (activeTool === 'draw-laser') {
        setCurrentPathPoints(prev => [...prev, normPt]);
        setLaserTrails(prev => {
          if (prev.length === 0) return prev;
          const last = prev[prev.length - 1];
          const updated = { ...last, points: [...last.points, normPt], timestamp: Date.now() };
          return [...prev.slice(0, -1), updated];
        });
      }
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
      if (activeTool === 'stone-alt') {
        onPlaceStone?.(pt);
        if (soundEnabled) playStoneSound();
      } else if (activeTool === 'stone-black') {
        onPlaceStone?.(pt, 'B');
        if (soundEnabled) playStoneSound();
      } else if (activeTool === 'stone-white') {
        onPlaceStone?.(pt, 'W');
        if (soundEnabled) playStoneSound();
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

  // Convert normalized points array to SVG path string
  const renderPathD = (points: DrawingPoint[]) => {
    if (points.length < 2) return '';
    const p0 = points[0];
    let d = `M ${p0.x * boardDimension} ${p0.y * boardDimension}`;
    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      d += ` L ${p.x * boardDimension} ${p.y * boardDimension}`;
    }
    return d;
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
        <defs>
          {/* Obsidian Black Stone Radial Gradient */}
          <radialGradient id="blackStoneGradient" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#4a4d52" />
            <stop offset="25%" stopColor="#282a2d" />
            <stop offset="70%" stopColor="#141517" />
            <stop offset="100%" stopColor="#080809" />
          </radialGradient>

          {/* Pearl White Stone Radial Gradient */}
          <radialGradient id="whiteStoneGradient" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#f1f3f5" />
            <stop offset="85%" stopColor="#d5d9de" />
            <stop offset="100%" stopColor="#b0b6be" />
          </radialGradient>

          {/* Stone Drop Shadow */}
          <filter id="stoneShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="3" dy="4" stdDeviation="3.5" floodColor="#000000" floodOpacity="0.45" />
          </filter>

          {/* Arrowhead marker definition */}
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
          >
            <polygon points="0 1, 8 4, 0 7" fill={brushColor} />
          </marker>
        </defs>

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
          <g className="font-mono font-semibold text-[15px]" fill={themeStyles.coordColor} style={{ userSelect: 'none' }}>
            {Array.from({ length: boardSize }).map((_, i) => {
              const xPos = margin + i * cellSize;
              const yPos = margin + i * cellSize;
              const xLabel = getXCoordinateLabel(i);
              const yLabel = getYCoordinateLabel(i, boardSize);

              return (
                <React.Fragment key={`coord_${i}`}>
                  {/* Top & Bottom X coordinates */}
                  <text x={xPos} y={margin - 12} textAnchor="middle" dominantBaseline="middle">
                    {xLabel}
                  </text>
                  <text x={xPos} y={boardDimension - margin + 14} textAnchor="middle" dominantBaseline="middle">
                    {xLabel}
                  </text>

                  {/* Left & Right Y coordinates */}
                  <text x={margin - 14} y={yPos} textAnchor="middle" dominantBaseline="middle">
                    {yLabel}
                  </text>
                  <text x={boardDimension - margin + 14} y={yPos} textAnchor="middle" dominantBaseline="middle">
                    {yLabel}
                  </text>
                </React.Fragment>
              );
            })}
          </g>
        )}

        {/* Grid Lines */}
        <g stroke={themeStyles.lineColor} strokeWidth="1.6" strokeLinecap="round">
          {Array.from({ length: boardSize }).map((_, i) => {
            const coord = margin + i * cellSize;
            const start = margin;
            const end = boardDimension - margin;
            return (
              <React.Fragment key={`line_${i}`}>
                {/* Horizontal line */}
                <line x1={start} y1={coord} x2={end} y2={coord} />
                {/* Vertical line */}
                <line x1={coord} y1={start} x2={coord} y2={end} />
              </React.Fragment>
            );
          })}
        </g>

        {/* Star Points (Hoshi) */}
        <g fill={themeStyles.starColor}>
          {starPoints.map((sp, idx) => {
            const { cx, cy } = getSvgCoords(sp);
            return <circle key={`star_${idx}`} cx={cx} cy={cy} r={boardSize === 19 ? 4.2 : 3.5} />;
          })}
        </g>

        {/* Placed Stones */}
        <g>
          {stones.map((stone) => {
            const { cx, cy } = getSvgCoords(stone);
            const isBlack = stone.color === 'B';
            const showNumber =
              numberingMode === 'none'
                ? false
                : numberingMode === 'last-only'
                ? stone.isLastMove
                : stone.number !== null;

            return (
              <g key={`stone_${stone.x}_${stone.y}`}>
                {/* 3D Rendered Stone with Drop Shadow */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={stoneRadius}
                  fill={isBlack ? 'url(#blackStoneGradient)' : 'url(#whiteStoneGradient)'}
                  filter="url(#stoneShadow)"
                  stroke={isBlack ? '#111' : '#c5cbd3'}
                  strokeWidth={isBlack ? '0.5' : '1'}
                />

                {/* Last Move Ring Indicator */}
                {stone.isLastMove && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={showNumber ? stoneRadius - 2.5 : stoneRadius * 0.38}
                    fill="none"
                    stroke={isBlack ? '#38bdf8' : '#2563eb'}
                    strokeWidth={showNumber ? '2.5' : '3.2'}
                  />
                )}

                {/* Move Number Typography */}
                {showNumber && stone.number !== null && (
                  <text
                    x={cx}
                    y={cy + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isBlack ? '#ffffff' : '#0f172a'}
                    fontSize={stone.number > 99 ? `${cellSize * 0.36}px` : `${cellSize * 0.44}px`}
                    fontWeight="700"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    style={{ pointerEvents: 'none' }}
                  >
                    {stone.number}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Board Markings Layer */}
        <g style={{ pointerEvents: 'none' }}>
          {markings.map((mark, idx) => {
            const { cx, cy } = getSvgCoords(mark);
            const stoneAtPoint = stoneMap.get(`${mark.x},${mark.y}`);
            const defaultMarkColor = stoneAtPoint
              ? stoneAtPoint.color === 'B'
                ? '#ffffff'
                : '#1e293b'
              : '#dc2626';
            const color = mark.color || defaultMarkColor;
            const size = cellSize * 0.55;

            switch (mark.type) {
              case 'TR': // Triangle
                const h = size * 0.866;
                const points = `${cx},${cy - h * 0.6} ${cx - size / 2},${cy + h * 0.4} ${cx + size / 2},${cy + h * 0.4}`;
                return (
                  <polygon
                    key={`mark_tr_${idx}`}
                    points={points}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                );
              case 'SQ': // Square
                const half = size * 0.42;
                return (
                  <rect
                    key={`mark_sq_${idx}`}
                    x={cx - half}
                    y={cy - half}
                    width={half * 2}
                    height={half * 2}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                );
              case 'CR': // Circle
                return (
                  <circle
                    key={`mark_cr_${idx}`}
                    cx={cx}
                    cy={cy}
                    r={size * 0.42}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                  />
                );
              case 'MA': // Cross (X)
                const d = size * 0.38;
                return (
                  <g key={`mark_ma_${idx}`} stroke={color} strokeWidth="3.2" strokeLinecap="round">
                    <line x1={cx - d} y1={cy - d} x2={cx + d} y2={cy + d} />
                    <line x1={cx + d} y1={cy - d} x2={cx - d} y2={cy + d} />
                  </g>
                );
              case 'LB': // Label
                const labelText = mark.label || 'A';
                const labelLen = labelText.length;
                const fontSize =
                  labelLen > 2
                    ? `${cellSize * 0.32}px`
                    : labelLen > 1
                    ? `${cellSize * 0.38}px`
                    : `${cellSize * 0.46}px`;

                return (
                  <g key={`mark_lb_${idx}`}>
                    {!stoneAtPoint && (
                      <circle cx={cx} cy={cy} r={cellSize * 0.38} fill="#ffffff" stroke="#334155" strokeWidth="1.5" />
                    )}
                    <text
                      x={cx}
                      y={cy + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={stoneAtPoint ? (stoneAtPoint.color === 'B' ? '#fff' : '#000') : '#0f172a'}
                      fontSize={fontSize}
                      fontWeight="bold"
                    >
                      {labelText}
                    </text>
                  </g>
                );
              case 'TB': // Territory Black
                return (
                  <rect
                    key={`mark_tb_${idx}`}
                    x={cx - cellSize * 0.2}
                    y={cy - cellSize * 0.2}
                    width={cellSize * 0.4}
                    height={cellSize * 0.4}
                    fill="#0f172a"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />
                );
              case 'TW': // Territory White
                return (
                  <rect
                    key={`mark_tw_${idx}`}
                    x={cx - cellSize * 0.2}
                    y={cy - cellSize * 0.2}
                    width={cellSize * 0.4}
                    height={cellSize * 0.4}
                    fill="#ffffff"
                    stroke="#0f172a"
                    strokeWidth="1.2"
                  />
                );
              default:
                return null;
            }
          })}
        </g>

        {/* Freehand Vector Drawings Layer */}
        <g style={{ pointerEvents: 'none' }}>
          {drawings.map((draw) => {
            if (draw.type === 'freeline') {
              return (
                <path
                  key={draw.id}
                  d={renderPathD(draw.points)}
                  fill="none"
                  stroke={draw.color}
                  strokeWidth={draw.width * 1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={draw.opacity ?? 0.9}
                />
              );
            } else if (draw.type === 'arrow' && draw.points.length >= 2) {
              const p1 = draw.points[0];
              const p2 = draw.points[1];
              const x1 = p1.x * boardDimension;
              const y1 = p1.y * boardDimension;
              const x2 = p2.x * boardDimension;
              const y2 = p2.y * boardDimension;

              // Calculate arrowhead geometry
              const angle = Math.atan2(y2 - y1, x2 - x1);
              const headLen = 16 + draw.width * 2;
              const a1X = x2 - headLen * Math.cos(angle - Math.PI / 6);
              const a1Y = y2 - headLen * Math.sin(angle - Math.PI / 6);
              const a2X = x2 - headLen * Math.cos(angle + Math.PI / 6);
              const a2Y = y2 - headLen * Math.sin(angle + Math.PI / 6);

              return (
                <g key={draw.id}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={draw.color}
                    strokeWidth={draw.width * 1.5}
                    strokeLinecap="round"
                  />
                  <polygon
                    points={`${x2},${y2} ${a1X},${a1Y} ${a2X},${a2Y}`}
                    fill={draw.color}
                  />
                </g>
              );
            } else if (draw.type === 'line' && draw.points.length >= 2) {
              const p1 = draw.points[0];
              const p2 = draw.points[1];
              return (
                <line
                  key={draw.id}
                  x1={p1.x * boardDimension}
                  y1={p1.y * boardDimension}
                  x2={p2.x * boardDimension}
                  y2={p2.y * boardDimension}
                  stroke={draw.color}
                  strokeWidth={draw.width * 1.5}
                  strokeLinecap="round"
                />
              );
            }
            return null;
          })}

          {/* Active Freehand Path Preview while user is drawing */}
          {isDrawing && activeTool === 'draw-pen' && currentPathPoints.length > 1 && (
            <path
              d={renderPathD(currentPathPoints)}
              fill="none"
              stroke={brushColor}
              strokeWidth={brushWidth * 1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.85}
            />
          )}

          {/* Active Arrow Preview while dragging */}
          {isDrawing && activeTool === 'draw-arrow' && arrowStart && arrowCurrent && (
            <line
              x1={arrowStart.x * boardDimension}
              y1={arrowStart.y * boardDimension}
              x2={arrowCurrent.x * boardDimension}
              y2={arrowCurrent.y * boardDimension}
              stroke={brushColor}
              strokeWidth={brushWidth * 1.5}
              strokeDasharray="6 3"
              strokeLinecap="round"
            />
          )}

          {/* Laser Pointer Trails */}
          {laserTrails.map(trail => {
            const age = Date.now() - trail.timestamp;
            const laserOpacity = Math.max(0, 1 - age / 1400);
            return (
              <path
                key={trail.id}
                d={renderPathD(trail.points)}
                fill="none"
                stroke="#ff0055"
                strokeWidth={7}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={laserOpacity}
                filter="drop-shadow(0 0 6px #ff0055)"
              />
            );
          })}
        </g>

        {/* Hover Ghost Stone Preview */}
        {hoverPoint && !isDrawing && activeTool.startsWith('stone-') && activeTool !== 'stone-remove' && !stoneMap.has(`${hoverPoint.x},${hoverPoint.y}`) && (
          <g style={{ pointerEvents: 'none' }}>
            <circle
              cx={getSvgCoords(hoverPoint).cx}
              cy={getSvgCoords(hoverPoint).cy}
              r={stoneRadius}
              fill={activeTool === 'stone-white' ? '#ffffff' : activeTool === 'stone-black' ? '#111111' : '#222222'}
              opacity={0.45}
            />
          </g>
        )}
      </svg>

      {/* Layer Locked Status Watermark Badge */}
      {activeSubLayerLocked ? (
        <div className="absolute top-4 right-4 bg-amber-500/90 text-slate-900 font-bold text-xs uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md backdrop-blur flex items-center gap-1.5 pointer-events-none">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Subvariation Locked
        </div>
      ) : isLocked ? (
        <div className="absolute top-4 right-4 bg-amber-500/80 text-slate-900 font-bold text-xs tracking-wider px-2.5 py-1 rounded-md shadow-md backdrop-blur flex items-center gap-1.5 pointer-events-none">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Variation Locked (Drawings & Moves branch to Subvariation)
        </div>
      ) : null}
    </div>
  );
};
