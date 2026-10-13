import { Point } from '../types/goban';

export function getStarPoints(size: number): Point[] {
  if (size === 19) {
    const coords = [3, 9, 15];
    const stars: Point[] = [];
    for (const x of coords) {
      for (const y of coords) {
        stars.push({ x, y });
      }
    }
    return stars;
  }
  if (size === 13) {
    return [
      { x: 3, y: 3 }, { x: 9, y: 3 },
      { x: 6, y: 6 },
      { x: 3, y: 9 }, { x: 9, y: 9 }
    ];
  }
  if (size === 9) {
    return [
      { x: 2, y: 2 }, { x: 6, y: 2 },
      { x: 4, y: 4 },
      { x: 2, y: 6 }, { x: 6, y: 6 }
    ];
  }
  return [];
}

const LETTERS = 'ABCDEFGHJKLMNOPQRST'; // standard Go coordinate letters (skipping 'I')

export function getXCoordinateLabel(x: number): string {
  if (x >= 0 && x < LETTERS.length) {
    return LETTERS[x];
  }
  return String.fromCharCode(65 + x);
}

export function getYCoordinateLabel(y: number, size: number): string {
  return String(size - y);
}

export function parseSgfCoordinate(coord: string): Point | null {
  if (!coord || coord.length < 2 || coord === 'tt') return null;
  const x = coord.charCodeAt(0) - 97; // 'a' -> 0
  const y = coord.charCodeAt(1) - 97;
  return { x, y };
}

export function formatSgfCoordinate(p: Point & { pass?: boolean }): string {
  if (p.pass || p.x < 0 || p.y < 0) return '';
  return String.fromCharCode(97 + p.x) + String.fromCharCode(97 + p.y);
}
