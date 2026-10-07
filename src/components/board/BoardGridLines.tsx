import React from 'react';
import { Point } from '../../types/goban';

interface BoardGridLinesProps {
  boardSize: number;
  margin: number;
  cellSize: number;
  boardDimension: number;
  lineColor: string;
  starColor: string;
  starPoints: Point[];
  getSvgCoords: (p: Point) => { cx: number; cy: number };
}

export const BoardGridLines: React.FC<BoardGridLinesProps> = ({
  boardSize,
  margin,
  cellSize,
  boardDimension,
  lineColor,
  starColor,
  starPoints,
  getSvgCoords
}) => {
  return (
    <>
      {/* Grid Lines */}
      <g stroke={lineColor} strokeWidth="1.6" strokeLinecap="round">
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
      <g fill={starColor}>
        {starPoints.map((sp, idx) => {
          const { cx, cy } = getSvgCoords(sp);
          return <circle key={`star_${idx}`} cx={cx} cy={cy} r={boardSize === 19 ? 4.2 : 3.5} />;
        })}
      </g>
    </>
  );
};
