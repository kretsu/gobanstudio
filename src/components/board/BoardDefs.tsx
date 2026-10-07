import React from 'react';

interface BoardDefsProps {
  brushColor: string;
}

export const BoardDefs: React.FC<BoardDefsProps> = ({ brushColor }) => {
  return (
    <defs>
      {/* Classic Stone Gradients */}
      <radialGradient id="classicBlackGradient" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#4a4d52" />
        <stop offset="25%" stopColor="#282a2d" />
        <stop offset="70%" stopColor="#141517" />
        <stop offset="100%" stopColor="#080809" />
      </radialGradient>
      <radialGradient id="classicWhiteGradient" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="60%" stopColor="#f1f3f5" />
        <stop offset="85%" stopColor="#d5d9de" />
        <stop offset="100%" stopColor="#b0b6be" />
      </radialGradient>

      {/* Slate & Shell Gradients */}
      <radialGradient id="slateBlackGradient" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#383d45" />
        <stop offset="35%" stopColor="#202327" />
        <stop offset="75%" stopColor="#111315" />
        <stop offset="100%" stopColor="#08090a" />
      </radialGradient>
      <radialGradient id="shellWhiteGradient" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="45%" stopColor="#fbf7ed" />
        <stop offset="80%" stopColor="#ece2ce" />
        <stop offset="100%" stopColor="#d5c5ad" />
      </radialGradient>

      {/* Glass Stone Gradients */}
      <radialGradient id="glassBlackGradient" cx="35%" cy="28%" r="70%">
        <stop offset="0%" stopColor="#585e68" />
        <stop offset="25%" stopColor="#22252a" />
        <stop offset="70%" stopColor="#0a0b0d" />
        <stop offset="100%" stopColor="#000000" />
      </radialGradient>
      <radialGradient id="glassWhiteGradient" cx="32%" cy="28%" r="70%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="40%" stopColor="#f1f7fc" />
        <stop offset="80%" stopColor="#cfe0ee" />
        <stop offset="100%" stopColor="#a3bbd1" />
      </radialGradient>

      {/* Yunzi Stone Gradients */}
      <radialGradient id="yunziBlackGradient" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#2a3831" />
        <stop offset="40%" stopColor="#16221d" />
        <stop offset="80%" stopColor="#0a120e" />
        <stop offset="100%" stopColor="#060908" />
      </radialGradient>
      <radialGradient id="yunziWhiteGradient" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#fffdf8" />
        <stop offset="45%" stopColor="#ede6d3" />
        <stop offset="80%" stopColor="#ded3b9" />
        <stop offset="100%" stopColor="#c5b697" />
      </radialGradient>

      {/* Stone Drop Shadows */}
      <filter id="stoneShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="3" dy="4" stdDeviation="3.5" floodColor="#000000" floodOpacity="0.45" />
      </filter>
      <filter id="stoneShadowSoft" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="2" dy="3" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.35" />
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
  );
};
