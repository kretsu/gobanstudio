import { BoardMarking, GobanProject } from '../types/goban';

export function getNextLetterMark(existingMarkings: BoardMarking[] = []): string {
  const usedLetters = new Set(
    existingMarkings
      .filter(m => m.type === 'LB' && m.label && /^[A-Z]$/.test(m.label))
      .map(m => m.label!)
  );

  for (let i = 0; i < 26; i++) {
    const char = String.fromCharCode(65 + i);
    if (!usedLetters.has(char)) {
      return char;
    }
  }
  return 'Z';
}

export function getNextNumberMark(existingMarkings: BoardMarking[] = []): string {
  const usedNumbers = new Set(
    existingMarkings
      .filter(m => m.type === 'LB' && m.label && /^\d+$/.test(m.label))
      .map(m => parseInt(m.label!, 10))
  );

  let n = 1;
  while (usedNumbers.has(n)) {
    n++;
  }
  return String(n);
}

export function getActiveLayerMarkings(
  project: GobanProject,
  activeVariationId: string = 'root',
  activeSubLayerId: string | null = null
): BoardMarking[] {
  const isRoot = activeVariationId === 'root';
  const parent = isRoot ? project.root : project.variations.find(v => v.id === activeVariationId);
  if (!parent) return [];

  if (activeSubLayerId) {
    const activeSub = (parent.subLayers || []).find(s => s.id === activeSubLayerId);
    if (activeSub) {
      if (activeSub.locked) return [];
      return activeSub.markings || [];
    }
  }

  if (parent.locked) return [];

  return parent.markings || [];
}
