import { GobanProject, SubLayer, VariationLayer } from '../types/goban';

export function serializeProjectToJson(project: GobanProject): string {
  return JSON.stringify(project, null, 2);
}

export function deserializeProjectFromJson(jsonString: string): GobanProject {
  const parsed = JSON.parse(jsonString) as GobanProject;
  if (!parsed || parsed.version !== '1.0.0' || !parsed.root) {
    throw new Error('Invalid .gobanstudio project file format');
  }

  // Helper to migrate legacy stone sublayers to child variations
  const migratedVariations: VariationLayer[] = [];

  function migrateSubLayers(parentId: string, parentMovesCount: number, subLayers: SubLayer[] = []): SubLayer[] {
    const remainingSubs: SubLayer[] = [];
    for (const sub of subLayers) {
      if (sub.type === 'stones' && sub.moves && sub.moves.length > 0) {
        migratedVariations.push({
          id: sub.id,
          name: sub.name,
          tags: ['Sequence'],
          description: sub.notes || '',
          parentId,
          branchPoint: parentMovesCount,
          locked: sub.locked ?? false,
          visible: true,
          outdated: sub.outdated ?? false,
          moves: sub.moves,
          markings: sub.markings || [],
          subLayers: []
        });
      } else {
        sub.visible = sub.defaultVisible ?? false;
        sub.outdated = sub.outdated ?? false;
        sub.type = 'drawing';
        remainingSubs.push(sub);
      }
    }
    return remainingSubs;
  }

  if (parsed.root.subLayers) {
    parsed.root.subLayers = migrateSubLayers('root', parsed.root.moves?.length || 0, parsed.root.subLayers);
  }

  for (const v of parsed.variations || []) {
    v.parentId = v.parentId || 'root';
    v.outdated = v.outdated ?? false;
    if (v.subLayers) {
      v.subLayers = migrateSubLayers(v.id, v.moves?.length || 0, v.subLayers);
    }
  }

  if (migratedVariations.length > 0) {
    parsed.variations = [...(parsed.variations || []), ...migratedVariations];
  }

  return parsed;
}
