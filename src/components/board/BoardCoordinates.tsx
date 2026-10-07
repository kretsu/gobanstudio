import React from 'react';
import { getXCoordinateLabel, getYCoordinateLabel } from '../../engine/goRules';

interface BoardCoordinatesProps {
  boardSize: number;
  margin: number;
  cellSize: number;
  boardDimension: number;
  coordColor: string;
}

export const BoardCoordinates: React.FC<BoardCoordinatesProps> = ({
  boardSize,
  margin,
  cellSize,
  boardDimension,
  coordColor
}) => {
  return (
    <g className="font-mono font-semibold text-[15px]" fill={coordColor} style={{ userSelect: 'none' }}>
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
  );
};
