import React from 'react';
import { StoneTheme } from '../../types/goban';

interface GhostStoneRendererProps {
  cx: number;
  cy: number;
  radius: number;
  isWhite: boolean;
  themeStyle: StoneTheme;
}

export const GhostStoneRenderer: React.FC<GhostStoneRendererProps> = ({
  cx,
  cy,
  radius,
  isWhite,
  themeStyle
}) => {
  if (themeStyle === 'flat') {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={isWhite ? '#ffffff' : '#0f172a'}
        stroke="#000000"
        strokeWidth={isWhite ? '2' : '0.6'}
        opacity={0.45}
      />
    );
  }

  const fillUrl = isWhite
    ? themeStyle === 'slate-shell'
      ? 'url(#shellWhiteGradient)'
      : themeStyle === 'glass'
      ? 'url(#glassWhiteGradient)'
      : themeStyle === 'yunzi'
      ? 'url(#yunziWhiteGradient)'
      : 'url(#classicWhiteGradient)'
    : themeStyle === 'slate-shell'
    ? 'url(#slateBlackGradient)'
    : themeStyle === 'glass'
    ? 'url(#glassBlackGradient)'
    : themeStyle === 'yunzi'
    ? 'url(#yunziBlackGradient)'
    : 'url(#classicBlackGradient)';

  return (
    <circle
      cx={cx}
      cy={cy}
      r={radius}
      fill={fillUrl}
      opacity={0.5}
      stroke={isWhite ? '#cbd5e1' : '#334155'}
      strokeWidth="0.8"
    />
  );
};
