import React from 'react';
import { NumberingMode, Point, StoneTheme } from '../../types/goban';
import { DisplayStone } from '../../engine/layerManager';

interface StoneRendererProps {
  stones: DisplayStone[];
  stoneRadius: number;
  cellSize: number;
  stoneTheme: StoneTheme;
  numberingMode: NumberingMode;
  getSvgCoords: (p: Point) => { cx: number; cy: number };
}

export const renderStoneShape = (
  cx: number,
  cy: number,
  radius: number,
  isBlack: boolean,
  themeStyle: StoneTheme
) => {
  switch (themeStyle) {
    case 'slate-shell':
      if (isBlack) {
        return (
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="url(#slateBlackGradient)"
            filter="url(#stoneShadowSoft)"
            stroke="#16181b"
            strokeWidth="0.6"
          />
        );
      } else {
        return (
          <g>
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="url(#shellWhiteGradient)"
              filter="url(#stoneShadowSoft)"
              stroke="#c2b39b"
              strokeWidth="0.75"
            />
            {/* Clam Shell Natural Grain Striations */}
            <path
              d={`M ${cx - radius * 0.72} ${cy - radius * 0.42} Q ${cx} ${cy - radius * 0.6} ${cx + radius * 0.72} ${cy - radius * 0.32}`}
              fill="none"
              stroke="#7e6c56"
              strokeWidth="0.6"
              opacity="0.16"
              pointerEvents="none"
            />
            <path
              d={`M ${cx - radius * 0.88} ${cy - radius * 0.02} Q ${cx} ${cy - radius * 0.22} ${cx + radius * 0.86} ${cy + radius * 0.08}`}
              fill="none"
              stroke="#7e6c56"
              strokeWidth="0.65"
              opacity="0.18"
              pointerEvents="none"
            />
            <path
              d={`M ${cx - radius * 0.76} ${cy + radius * 0.44} Q ${cx} ${cy + radius * 0.24} ${cx + radius * 0.74} ${cy + radius * 0.5}`}
              fill="none"
              stroke="#7e6c56"
              strokeWidth="0.6"
              opacity="0.16"
              pointerEvents="none"
            />
          </g>
        );
      }
    case 'glass':
      if (isBlack) {
        return (
          <g>
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="url(#glassBlackGradient)"
              filter="url(#stoneShadowSoft)"
              stroke="#0a0a0c"
              strokeWidth="0.75"
            />
            {/* Glossy top-left specular reflection curve */}
            <path
              d={`M ${cx - radius * 0.5} ${cy - radius * 0.4} A ${radius * 0.55} ${radius * 0.3} 0 0 1 ${cx + radius * 0.2} ${cy - radius * 0.55}`}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
              opacity="0.45"
              strokeLinecap="round"
              pointerEvents="none"
            />
          </g>
        );
      } else {
        return (
          <g>
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="url(#glassWhiteGradient)"
              filter="url(#stoneShadowSoft)"
              stroke="#9ab2c7"
              strokeWidth="0.75"
            />
            {/* Glass high-light reflection ellipse */}
            <ellipse
              cx={cx - radius * 0.28}
              cy={cy - radius * 0.3}
              rx={radius * 0.35}
              ry={radius * 0.2}
              fill="#ffffff"
              opacity="0.6"
              transform={`rotate(-25 ${cx - radius * 0.28} ${cy - radius * 0.3})`}
              pointerEvents="none"
            />
          </g>
        );
      }
    case 'yunzi':
      if (isBlack) {
        return (
          <g>
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="url(#yunziBlackGradient)"
              filter="url(#stoneShadowSoft)"
              stroke="#0a0f0d"
              strokeWidth="0.75"
            />
            {/* Translucent jadeite rim glow */}
            <circle
              cx={cx}
              cy={cy}
              r={radius - 1.2}
              fill="none"
              stroke="#10b981"
              strokeWidth="1.3"
              opacity="0.32"
              pointerEvents="none"
            />
          </g>
        );
      } else {
        return (
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="url(#yunziWhiteGradient)"
            filter="url(#stoneShadowSoft)"
            stroke="#b3a486"
            strokeWidth="0.75"
          />
        );
      }
    case 'flat':
      return (
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill={isBlack ? '#0f172a' : '#ffffff'}
          stroke="#000000"
          strokeWidth={isBlack ? '0.6' : '2'}
        />
      );
    case 'classic':
    default:
      return (
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill={isBlack ? 'url(#classicBlackGradient)' : 'url(#classicWhiteGradient)'}
          filter="url(#stoneShadow)"
          stroke={isBlack ? '#111' : '#c5cbd3'}
          strokeWidth={isBlack ? '0.5' : '1'}
        />
      );
  }
};

export const StoneRenderer: React.FC<StoneRendererProps> = ({
  stones,
  stoneRadius,
  cellSize,
  stoneTheme,
  numberingMode,
  getSvgCoords
}) => {
  return (
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
            {/* Rendered Stone according to stoneTheme */}
            {renderStoneShape(cx, cy, stoneRadius, isBlack, stoneTheme)}

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
                fill={isBlack ? '#ffffff' : stoneTheme === 'flat' ? '#000000' : '#0f172a'}
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
  );
};
