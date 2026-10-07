import React from 'react';
import { BoardMarking, Point } from '../../types/goban';
import { DisplayStone } from '../../engine/layerManager';

interface MarkingRendererProps {
  markings: BoardMarking[];
  stoneMap: Map<string, DisplayStone>;
  cellSize: number;
  getSvgCoords: (p: Point) => { cx: number; cy: number };
}

export const MarkingRenderer: React.FC<MarkingRendererProps> = ({
  markings,
  stoneMap,
  cellSize,
  getSvgCoords
}) => {
  return (
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
          case 'TR': { // Triangle
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
          }
          case 'SQ': { // Square
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
          }
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
          case 'MA': { // Cross (X)
            const d = size * 0.38;
            return (
              <g key={`mark_ma_${idx}`} stroke={color} strokeWidth="3.2" strokeLinecap="round">
                <line x1={cx - d} y1={cy - d} x2={cx + d} y2={cy + d} />
                <line x1={cx + d} y1={cy - d} x2={cx - d} y2={cy + d} />
              </g>
            );
          }
          case 'LB': { // Label
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
          }
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
  );
};
