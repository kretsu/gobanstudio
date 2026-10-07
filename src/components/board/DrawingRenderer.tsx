import React from 'react';
import { DrawingPath, DrawingPoint, ToolType } from '../../types/goban';

interface DrawingRendererProps {
  drawings: DrawingPath[];
  boardDimension: number;
  isDrawing: boolean;
  activeTool: ToolType;
  currentPathPoints: DrawingPoint[];
  brushColor: string;
  brushWidth: number;
  arrowStart: DrawingPoint | null;
  arrowCurrent: DrawingPoint | null;
  laserTrails: { id: string; points: DrawingPoint[]; timestamp: number }[];
}

export const renderPathD = (points: DrawingPoint[], boardDimension: number) => {
  if (points.length < 2) return '';
  const p0 = points[0];
  let d = `M ${p0.x * boardDimension} ${p0.y * boardDimension}`;
  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    d += ` L ${p.x * boardDimension} ${p.y * boardDimension}`;
  }
  return d;
};

export const DrawingRenderer: React.FC<DrawingRendererProps> = ({
  drawings,
  boardDimension,
  isDrawing,
  activeTool,
  currentPathPoints,
  brushColor,
  brushWidth,
  arrowStart,
  arrowCurrent,
  laserTrails
}) => {
  return (
    <g style={{ pointerEvents: 'none' }}>
      {drawings.map((draw) => {
        if (draw.type === 'freeline') {
          return (
            <path
              key={draw.id}
              d={renderPathD(draw.points, boardDimension)}
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
          d={renderPathD(currentPathPoints, boardDimension)}
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
      {laserTrails.map((trail) => {
        const age = Date.now() - trail.timestamp;
        const laserOpacity = Math.max(0, 1 - age / 1400);
        return (
          <path
            key={trail.id}
            d={renderPathD(trail.points, boardDimension)}
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
  );
};
