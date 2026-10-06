import { describe, it, expect } from 'vitest';
import {
  computeBoardState,
  getGroup,
  parseSgfCoordinate,
  formatSgfCoordinate,
  playMoveOnGrid,
  createEmptyGrid,
  getStarPoints
} from './goRules';
import {
  createNewProject,
  addVariation,
  addSubLayer,
  computeDisplayState,
  getVariationAncestorChain,
  getDescendantVariationIds,
  recordDrawing,
  recordMove,
  recordMarking,
  getNextLetterMark,
  getNextNumberMark,
  getActiveLayerMarkings,
  toggleSubLayerOutdated,
  markSubLayersOutdated,
  toggleVariationOutdated,
  markVariationsOutdated,
  deleteVariation,
  duplicateVariation
} from './layerManager';
import {
  exportProjectToSgf,
  importSgfToProject,
  serializeProjectToJson,
  deserializeProjectFromJson
} from './sgfParser';
import { SAMPLE_LESSONS } from '../components/SampleLessons';

describe('Go Engine & Rules', () => {
  it('correctly handles stone placement and liberties', () => {
    const grid = createEmptyGrid(19);
    const res1 = playMoveOnGrid(grid, { x: 3, y: 3 }, 'B', 19);
    expect(res1.success).toBe(true);

    const group = getGroup(res1.grid, { x: 3, y: 3 }, 19);
    expect(group).not.toBeNull();
    expect(group?.liberties.length).toBe(4);
  });

  it('correctly executes captures of surrounded stones', () => {
    const grid = createEmptyGrid(19);
    // Put white stone at (1, 1)
    let g = playMoveOnGrid(grid, { x: 1, y: 1 }, 'W', 19).grid;
    // Surround with black stones at (0, 1), (2, 1), (1, 0), (1, 2)
    g = playMoveOnGrid(g, { x: 0, y: 1 }, 'B', 19).grid;
    g = playMoveOnGrid(g, { x: 2, y: 1 }, 'B', 19).grid;
    g = playMoveOnGrid(g, { x: 1, y: 0 }, 'B', 19).grid;
    const finalMove = playMoveOnGrid(g, { x: 1, y: 2 }, 'B', 19);

    expect(finalMove.success).toBe(true);
    expect(finalMove.capturedStones.length).toBe(1);
    expect(finalMove.capturedStones[0]).toEqual({ x: 1, y: 1 });
    expect(finalMove.grid[1][1]).toBeNull(); // Captured!
  });

  it('correctly captures multi-stone connected groups', () => {
    const grid = createEmptyGrid(19);
    // 2 White stones at (1,1) and (1,2)
    let g = playMoveOnGrid(grid, { x: 1, y: 1 }, 'W', 19).grid;
    g = playMoveOnGrid(g, { x: 1, y: 2 }, 'W', 19).grid;

    // Surround with Black stones
    g = playMoveOnGrid(g, { x: 1, y: 0 }, 'B', 19).grid;
    g = playMoveOnGrid(g, { x: 1, y: 3 }, 'B', 19).grid;
    g = playMoveOnGrid(g, { x: 0, y: 1 }, 'B', 19).grid;
    g = playMoveOnGrid(g, { x: 0, y: 2 }, 'B', 19).grid;
    g = playMoveOnGrid(g, { x: 2, y: 1 }, 'B', 19).grid;
    const finalMove = playMoveOnGrid(g, { x: 2, y: 2 }, 'B', 19);

    expect(finalMove.success).toBe(true);
    expect(finalMove.capturedStones.length).toBe(2);
    expect(finalMove.grid[1][1]).toBeNull();
    expect(finalMove.grid[2][1]).toBeNull();
  });

  it('calculates accurate star points for 19x19, 13x13, and 9x9', () => {
    expect(getStarPoints(19).length).toBe(9);
    expect(getStarPoints(13).length).toBe(5);
    expect(getStarPoints(9).length).toBe(5);
  });

  it('correctly parses and formats SGF coordinates', () => {
    expect(parseSgfCoordinate('dd')).toEqual({ x: 3, y: 3 });
    expect(parseSgfCoordinate('pd')).toEqual({ x: 15, y: 3 });
    expect(formatSgfCoordinate({ x: 3, y: 3 })).toBe('dd');
  });
});

describe('Layer Manager & Tree Variations Numbering System', () => {
  it('numbers stones 1..N in Root, unnumbered in Variation with variation starting at 1, and child variations continuing numbering', () => {
    let project = createNewProject(19, 'Lesson Test');
    // Add 3 moves to root: move 1 Black (3,3), move 2 White (15,3), move 3 Black (15,15)
    project.root.moves = [
      { x: 3, y: 3, color: 'B', moveNumber: 1 },
      { x: 15, y: 3, color: 'W', moveNumber: 2 },
      { x: 15, y: 15, color: 'B', moveNumber: 3 }
    ];

    // Compute display state for Root
    const rootState = computeDisplayState(project, 'root');
    expect(rootState.stones.length).toBe(3);
    const stone1 = rootState.stones.find(s => s.x === 3 && s.y === 3);
    const stone2 = rootState.stones.find(s => s.x === 15 && s.y === 3);
    const stone3 = rootState.stones.find(s => s.x === 15 && s.y === 15);
    expect(stone1?.number).toBe(1);
    expect(stone2?.number).toBe(2);
    expect(stone3?.number).toBe(3);

    // Create a variation branching from move 2 of root (branchPoint: 2, parentId: 'root')
    const varRes = addVariation(project, 'Corner Joseki Variation', ['Joseki'], 2, 'root');
    project = varRes.project;
    const varId = varRes.newVariationId;

    // Add 2 variation moves: move 1 White (3,15), move 2 Black (9,9)
    project.variations[0].moves = [
      { x: 3, y: 15, color: 'W', moveNumber: 1 },
      { x: 9, y: 9, color: 'B', moveNumber: 2 }
    ];

    // Compute display state for Variation
    const varState = computeDisplayState(project, varId);
    expect(varState.stones.length).toBe(4); // 2 root stones + 2 variation stones

    // Check root stones on variation board -> must have null / no number!
    const varRootStone1 = varState.stones.find(s => s.x === 3 && s.y === 3);
    const varRootStone2 = varState.stones.find(s => s.x === 15 && s.y === 3);
    expect(varRootStone1?.number).toBeNull();
    expect(varRootStone2?.number).toBeNull();

    // Check variation stones -> must start from 1!
    const varStone1 = varState.stones.find(s => s.x === 3 && s.y === 15);
    const varStone2 = varState.stones.find(s => s.x === 9 && s.y === 9);
    expect(varStone1?.number).toBe(1);
    expect(varStone2?.number).toBe(2);

    // Create child variation under varId branching at move 2 of varId (branchPoint: 2, parentId: varId)
    const childVarRes = addVariation(project, 'Child Sub-variation', ['Continuation'], 2, varId);
    project = childVarRes.project;
    const childVarId = childVarRes.newVariationId;

    // Add 2 moves to child variation: move 3 White (10,10), move 4 Black (11,11)
    project.variations[1].moves = [
      { x: 10, y: 10, color: 'W', moveNumber: 1 },
      { x: 11, y: 11, color: 'B', moveNumber: 2 }
    ];

    // Compute display state for Child Variation
    const childVarState = computeDisplayState(project, childVarId);
    expect(childVarState.stones.length).toBe(6); // 2 root + 2 parent var + 2 child var

    // Root stones unnumbered
    expect(childVarState.stones.find(s => s.x === 3 && s.y === 3)?.number).toBeNull();
    expect(childVarState.stones.find(s => s.x === 15 && s.y === 3)?.number).toBeNull();

    // Parent variation stones numbered 1, 2
    expect(childVarState.stones.find(s => s.x === 3 && s.y === 15)?.number).toBe(1);
    expect(childVarState.stones.find(s => s.x === 9 && s.y === 9)?.number).toBe(2);

    // Child variation stones continue numbering from 3 and 4!
    expect(childVarState.stones.find(s => s.x === 10 && s.y === 10)?.number).toBe(3);
    expect(childVarState.stones.find(s => s.x === 11 && s.y === 11)?.number).toBe(4);
  });

  it('auto-creates child variation when placing stones on a locked variation and continues move numbering', () => {
    let project = createNewProject(19, 'Locked Variation Auto-Branch Test');
    const { project: p1, newVariationId: varId } = addVariation(project, 'Variation 1', ['Main'], 0, 'root');
    project = p1;

    // Add 2 moves to Variation 1 (moves 1 and 2)
    project.variations[0].moves = [
      { x: 16, y: 16, color: 'B', moveNumber: 1 },
      { x: 16, y: 3, color: 'W', moveNumber: 2 }
    ];
    project.variations[0].locked = true;

    // Place stone on locked variation -> creates a new child variation under varId
    const res1 = recordMove(project, varId, { x: 3, y: 3 }, 'B', 2);
    expect(res1.isNewVariation).toBe(true);
    expect(res1.newVariationId).toBeDefined();
    project = res1.project;

    // Verify child variation is created with parentId = varId
    const childVar = project.variations.find(v => v.id === res1.newVariationId);
    expect(childVar).toBeDefined();
    expect(childVar?.parentId).toBe(varId);
    expect(childVar?.branchPoint).toBe(2);
    expect(childVar?.moves.length).toBe(1);
    expect(childVar?.moves[0].color).toBe('B');

    // Place second stone on this active unlocked child variation
    const res2 = recordMove(project, childVar!.id, { x: 15, y: 3 }, 'W', 1);
    expect(res2.isNewVariation).toBe(false);
    project = res2.project;

    const updatedChild = project.variations.find(v => v.id === res1.newVariationId);
    expect(updatedChild?.moves.length).toBe(2);

    // Verify display state: Variation 1 stones (1..2) and Child Variation stones continuing from 3..4
    const disp = computeDisplayState(project, childVar!.id);
    expect(disp.stones.find(s => s.x === 16 && s.y === 16)?.number).toBe(1);
    expect(disp.stones.find(s => s.x === 16 && s.y === 3)?.number).toBe(2);
    expect(disp.stones.find(s => s.x === 3 && s.y === 3)?.number).toBe(3);
    expect(disp.stones.find(s => s.x === 15 && s.y === 3)?.number).toBe(4);
  });

  it('keeps drawing sublayers hidden by default upon loading', () => {
    let project = createNewProject(19, 'Sublayer Test');
    const { project: p1, newVariationId } = addVariation(project, 'Branch 1');
    const { project: p2, newSubLayerId } = addSubLayer(p1, newVariationId, 'Teacher Annotations', 'drawing');

    p2.variations[0].subLayers[0].drawings = [
      {
        id: 'draw1',
        type: 'freeline',
        color: '#ff0000',
        width: 3,
        points: [{ x: 0.1, y: 0.1 }, { x: 0.2, y: 0.2 }]
      }
    ];

    const serialized = serializeProjectToJson(p2);
    const loaded = deserializeProjectFromJson(serialized);

    // Default visible must be false when loaded
    expect(loaded.variations[0].subLayers[0].visible).toBe(false);

    // Compute display state: drawings should not show when sublayer is invisible
    const dispState1 = computeDisplayState(loaded, newVariationId);
    expect(dispState1.drawings.length).toBe(0);

    // When teacher enables sublayer visibility during lesson:
    loaded.variations[0].subLayers[0].visible = true;
    const dispState2 = computeDisplayState(loaded, newVariationId);
    expect(dispState2.drawings.length).toBe(1);
  });

  it('properly tracks layer lock status', () => {
    const project = createNewProject(19, 'Lock Test');
    project.root.locked = true;

    const rootState = computeDisplayState(project, 'root');
    expect(rootState.isLocked).toBe(true);
  });

  it('auto-creates drawing overlay sublayer when drawing on locked variation', () => {
    let project = createNewProject(19, 'Locked Drawing Test');
    const { project: p1, newVariationId: varId } = addVariation(project, 'Variation 1');
    project = p1;
    project.variations[0].locked = true;

    // Draw on locked variation without existing sublayer -> should create a new drawing sublayer
    const path1 = {
      id: 'd1',
      type: 'freeline' as const,
      points: [{ x: 0.1, y: 0.1 }, { x: 0.2, y: 0.2 }],
      color: '#ff0000',
      width: 4
    };
    const res1 = recordDrawing(project, varId, path1);
    expect(res1.isNewSubLayer).toBe(true);
    expect(res1.newSubLayerId).toBeDefined();
    project = res1.project;

    // Verify drawing sublayer is created
    const sub1 = project.variations[0].subLayers.find(s => s.id === res1.newSubLayerId);
    expect(sub1).toBeDefined();
    expect(sub1?.type).toBe('drawing');
    expect(sub1?.drawings?.length).toBe(1);

    // Draw second path on selected drawing sublayer
    const path2 = {
      id: 'd2',
      type: 'arrow' as const,
      points: [{ x: 0.3, y: 0.3 }, { x: 0.4, y: 0.4 }],
      color: '#00ff00',
      width: 4
    };
    const res2 = recordDrawing(project, varId, path2, res1.newSubLayerId);
    expect(res2.isNewSubLayer).toBe(false);
    project = res2.project;

    const updatedSub1 = project.variations[0].subLayers.find(s => s.id === res1.newSubLayerId);
    expect(updatedSub1?.drawings?.length).toBe(2);
  });

  it('flags child variations and subvariations as outdated when parent variation or root is modified', () => {
    let project = createNewProject(19, 'Outdated Test');
    // Root moves
    project.root.moves = [
      { x: 3, y: 3, color: 'B', moveNumber: 1 },
      { x: 15, y: 3, color: 'W', moveNumber: 2 }
    ];

    // Add variation 1
    const { project: p1, newVariationId: var1Id } = addVariation(project, 'Var 1', ['Main'], 2, 'root');
    project = p1;
    project.variations[0].moves = [{ x: 3, y: 15, color: 'B', moveNumber: 1 }];

    // Add subvariation under Var 1
    const { project: p2, newSubLayerId: subId } = addSubLayer(project, var1Id, 'Annotations', 'drawing');
    project = p2;

    // Add child variation under Var 1
    const { project: p3, newVariationId: childVarId } = addVariation(project, 'Child Var', ['Sub'], 1, var1Id);
    project = p3;

    expect(project.variations[0].outdated).toBe(false);
    expect(project.variations[0].subLayers[0].outdated).toBe(false);
    expect(project.variations[1].outdated).toBe(false);

    // Modifying Var 1 by placing a new move directly on it should flag its sublayers and child variation as outdated
    const res = recordMove(project, var1Id, { x: 9, y: 9 }, 'W', 1);
    project = res.project;

    const var1 = project.variations.find(v => v.id === var1Id);
    const childVar = project.variations.find(v => v.id === childVarId);
    expect(var1?.subLayers[0].outdated).toBe(true);
    expect(childVar?.outdated).toBe(true);
  });

  it('flags all variations and subvariations as outdated when root layer is modified', () => {
    let project = createNewProject(19, 'Root Outdated Test');
    project.root.moves = [{ x: 3, y: 3, color: 'B', moveNumber: 1 }];

    const { project: p1, newVariationId: var1Id } = addVariation(project, 'Var 1', [], 1, 'root');
    const { project: p2, newSubLayerId: subId } = addSubLayer(p1, var1Id, 'Drawings', 'drawing');
    project = p2;

    expect(project.variations[0].outdated).toBe(false);
    expect(project.variations[0].subLayers[0].outdated).toBe(false);

    // Modify root by placing a second move
    const res = recordMove(project, 'root', { x: 15, y: 3 }, 'W', 1);
    project = res.project;

    expect(project.variations[0].outdated).toBe(true);
    expect(project.variations[0].subLayers[0].outdated).toBe(true);
  });

  it('allows manual toggling of outdated status on variations and drawing sublayers', () => {
    let project = createNewProject(19, 'Toggle Outdated Test');
    const { project: p1, newVariationId: varId } = addVariation(project, 'Var 1');
    const { project: p2, newSubLayerId: subId } = addSubLayer(p1, varId, 'Drawing', 'drawing');
    project = p2;

    expect(project.variations[0].outdated).toBe(false);
    expect(project.variations[0].subLayers[0].outdated).toBe(false);

    // Toggle variation outdated status
    project = toggleVariationOutdated(project, varId);
    expect(project.variations[0].outdated).toBe(true);

    project = toggleVariationOutdated(project, varId);
    expect(project.variations[0].outdated).toBe(false);

    // Toggle sublayer outdated status
    project = toggleSubLayerOutdated(project, varId, subId);
    expect(project.variations[0].subLayers[0].outdated).toBe(true);

    project = toggleSubLayerOutdated(project, varId, subId);
    expect(project.variations[0].subLayers[0].outdated).toBe(false);
  });

  it('correctly identifies only the single last placed stone in active variation sequence', () => {
    let project = createNewProject(19, 'Last Stone Selection Test');
    project.root.moves = [
      { x: 3, y: 3, color: 'B', moveNumber: 1 },
      { x: 15, y: 3, color: 'W', moveNumber: 2 }
    ];

    const { project: p1, newVariationId: varId } = addVariation(project, 'Variation 1', [], 2, 'root');
    project = p1;
    project.variations[0].moves = [
      { x: 3, y: 15, color: 'B', moveNumber: 1 },
      { x: 15, y: 15, color: 'W', moveNumber: 2 }
    ];

    const varState = computeDisplayState(project, varId);
    const lastStones = varState.stones.filter(s => s.isLastMove);
    expect(lastStones.length).toBe(1);
    expect(lastStones[0].x).toBe(15);
    expect(lastStones[0].y).toBe(15);
  });

  it('migrates legacy stone sublayers to child variations upon deserialization', () => {
    const legacyJson = JSON.stringify({
      version: '1.0.0',
      title: 'Legacy Project',
      boardSize: 19,
      rules: 'Japanese',
      komi: 6.5,
      handicap: 0,
      root: {
        id: 'root',
        name: 'Root',
        locked: false,
        visible: true,
        moves: [{ x: 3, y: 3, color: 'B', moveNumber: 1 }],
        initialStones: [],
        markings: [],
        subLayers: []
      },
      variations: [
        {
          id: 'var1',
          name: 'Variation 1',
          tags: ['Main'],
          description: '',
          branchPoint: 1,
          locked: true,
          visible: true,
          outdated: false,
          moves: [{ x: 15, y: 3, color: 'W', moveNumber: 1 }],
          markings: [],
          subLayers: [
            {
              id: 'sub_stone_seq',
              name: 'Follow-up Sequence',
              type: 'stones',
              locked: false,
              visible: true,
              defaultVisible: false,
              outdated: false,
              moves: [
                { x: 3, y: 15, color: 'B', moveNumber: 2 },
                { x: 15, y: 15, color: 'W', moveNumber: 3 }
              ]
            }
          ]
        }
      ],
      activeVariationId: 'var1'
    });

    const project = deserializeProjectFromJson(legacyJson);
    expect(project.variations.length).toBe(2);
    const migrated = project.variations.find(v => v.id === 'sub_stone_seq');
    expect(migrated).toBeDefined();
    expect(migrated?.parentId).toBe('var1');
    expect(migrated?.moves.length).toBe(2);
    expect(project.variations[0].subLayers.length).toBe(0);
  });

  it('correctly cascades deletion of child variations when a parent variation is deleted', () => {
    let project = createNewProject(19, 'Cascade Delete Test');
    const { project: p1, newVariationId: v1 } = addVariation(project, 'Parent Var', [], 0, 'root');
    const { project: p2, newVariationId: v2 } = addVariation(p1, 'Child Var', [], 0, v1);
    const { project: p3, newVariationId: v3 } = addVariation(p2, 'Grandchild Var', [], 0, v2);
    project = p3;

    expect(project.variations.length).toBe(3);

    // Delete Parent Var (v1) -> Should delete v1, v2, and v3
    project = deleteVariation(project, v1);
    expect(project.variations.length).toBe(0);
    expect(project.activeVariationId).toBe('root');
  });

  it('roundtrips project to SGF and preserves variation tree branches', () => {
    let project = createNewProject(19, 'SGF Tree Export Test');
    project.root.moves = [
      { x: 3, y: 3, color: 'B', moveNumber: 1 },
      { x: 15, y: 3, color: 'W', moveNumber: 2 }
    ];

    const { project: p1, newVariationId: v1 } = addVariation(project, 'Variation A', [], 2, 'root');
    project = p1;
    project.variations[0].moves = [{ x: 3, y: 15, color: 'B', moveNumber: 1 }];

    const sgfText = exportProjectToSgf(project);
    expect(sgfText).toContain('(;GM[1]');
    expect(sgfText).toContain(';B[dd]');
    expect(sgfText).toContain(';W[pd]');
    expect(sgfText).toContain('Variation A');
  });

  it('correctly imports SGF where root is the sequence till the first branching point, and recursively creates variation hierarchies', () => {
    // SGF with 2 moves in root, then branching into 2 variations at move 2,
    // where Variation 1 branches further into 2 sub-variations
    const sgf = `(;GM[1]SZ[19]KM[6.5]GN[Branching Joseki Test]
      ;B[pd] ;W[dp]
      (
        ;B[pp] ;W[dd] N[Corner Attachment]
        (
          ;B[cf] ;W[fc] N[High Approach]
        )
        (
          ;B[cc] ;W[dc] N[3-3 Invasion]
        )
      )
      (
        ;B[qp] ;W[dc] N[Low Approach]
      )
    )`;

    const imported = importSgfToProject(sgf);
    expect(imported.title).toBe('Branching Joseki Test');
    expect(imported.boardSize).toBe(19);

    // Root should contain only the moves till the first branching point (moves 1 and 2: B[pd], W[dp])
    expect(imported.root.moves.length).toBe(2);
    expect(imported.root.moves[0]).toMatchObject({ x: 15, y: 3, color: 'B', moveNumber: 1 });
    expect(imported.root.moves[1]).toMatchObject({ x: 3, y: 15, color: 'W', moveNumber: 2 });

    // There should be 4 variations total:
    // 1. "Corner Attachment" (child of root, branchPoint 2, 2 moves)
    // 2. "High Approach" (child of Corner Attachment, branchPoint 2, 2 moves)
    // 3. "3-3 Invasion" (child of Corner Attachment, branchPoint 2, 2 moves)
    // 4. "Low Approach" (child of root, branchPoint 2, 2 moves)
    expect(imported.variations.length).toBe(4);

    const cornerVar = imported.variations.find(v => v.name === 'Corner Attachment');
    expect(cornerVar).toBeDefined();
    expect(cornerVar?.parentId).toBe('root');
    expect(cornerVar?.branchPoint).toBe(2);
    expect(cornerVar?.moves.length).toBe(2);
    expect(cornerVar?.moves[0]).toMatchObject({ x: 15, y: 15, color: 'B' }); // B[pp]
    expect(cornerVar?.moves[1]).toMatchObject({ x: 3, y: 3, color: 'W' }); // W[dd]

    const lowVar = imported.variations.find(v => v.name === 'Low Approach');
    expect(lowVar).toBeDefined();
    expect(lowVar?.parentId).toBe('root');
    expect(lowVar?.branchPoint).toBe(2);
    expect(lowVar?.moves.length).toBe(2);
    expect(lowVar?.moves[0]).toMatchObject({ x: 16, y: 15, color: 'B' }); // B[qp]

    const highVar = imported.variations.find(v => v.name === 'High Approach');
    expect(highVar).toBeDefined();
    expect(highVar?.parentId).toBe(cornerVar?.id);
    expect(highVar?.branchPoint).toBe(2);
    expect(highVar?.moves.length).toBe(2);
    expect(highVar?.moves[0]).toMatchObject({ x: 2, y: 5, color: 'B' }); // B[cf]

    const sanSanVar = imported.variations.find(v => v.name === '3-3 Invasion');
    expect(sanSanVar).toBeDefined();
    expect(sanSanVar?.parentId).toBe(cornerVar?.id);
    expect(sanSanVar?.branchPoint).toBe(2);
    expect(sanSanVar?.moves.length).toBe(2);
    expect(sanSanVar?.moves[0]).toMatchObject({ x: 2, y: 2, color: 'B' }); // B[cc]

    // Verify display state calculation for child variation preserves numbering continuity
    const highState = computeDisplayState(imported, highVar!.id);
    // Ancestor chain = [Corner Attachment, High Approach]
    // Root moves = 2 unnumbered stones
    // Corner Attachment moves = 2 unnumbered stones in child view, with High Approach continuing as moves 3 and 4
    const stones = highState.stones;
    const cfStone = stones.find(s => s.x === 2 && s.y === 5);
    const fcStone = stones.find(s => s.x === 5 && s.y === 2);
    expect(cfStone?.number).toBe(3);
    expect(fcStone?.number).toBe(4);
  });

  it('imports linear SGF with no branching entirely into root', () => {
    const sgf = '(;GM[1]SZ[19] ;B[pd] ;W[dp] ;B[pq])';
    const imported = importSgfToProject(sgf);
    expect(imported.root.moves.length).toBe(3);
    expect(imported.variations.length).toBe(0);
  });

  it('correctly loads test_joseki.sgf as the sample lesson in SAMPLE_LESSONS', () => {
    expect(SAMPLE_LESSONS.length).toBe(1);
    const sample = SAMPLE_LESSONS[0];
    expect(sample.title).toBe('3-4 One-Space High Approach The One-Space Pincer');
    expect(sample.project.root.moves.length).toBe(3);
    expect(sample.project.variations.length).toBeGreaterThan(0);
  });

  describe('Letter and Number Markings per layer', () => {
    it('generates sequential letter marks from A to Z independently per layer', () => {
      let project = createNewProject(19, 'Markings Test');

      // Add letter marks to root
      const markA = { x: 3, y: 3, type: 'LB' as const, label: getNextLetterMark(getActiveLayerMarkings(project, 'root')) };
      expect(markA.label).toBe('A');
      project = recordMarking(project, 'root', markA).project;

      const markB = { x: 3, y: 4, type: 'LB' as const, label: getNextLetterMark(getActiveLayerMarkings(project, 'root')) };
      expect(markB.label).toBe('B');
      project = recordMarking(project, 'root', markB).project;

      const markC = { x: 3, y: 5, type: 'LB' as const, label: getNextLetterMark(getActiveLayerMarkings(project, 'root')) };
      expect(markC.label).toBe('C');
      project = recordMarking(project, 'root', markC).project;

      // Add a variation - its layer markings start from 'A' again
      const { project: pVar, newVariationId: varId } = addVariation(project, 'Variation 1', [], 0, 'root');
      project = pVar;

      const varMarkA = { x: 10, y: 10, type: 'LB' as const, label: getNextLetterMark(getActiveLayerMarkings(project, varId)) };
      expect(varMarkA.label).toBe('A');
      project = recordMarking(project, varId, varMarkA).project;

      const varMarkB = { x: 10, y: 11, type: 'LB' as const, label: getNextLetterMark(getActiveLayerMarkings(project, varId)) };
      expect(varMarkB.label).toBe('B');
      project = recordMarking(project, varId, varMarkB).project;

      // Check root markings are intact (A, B, C)
      expect(project.root.markings?.map(m => m.label)).toEqual(['A', 'B', 'C']);
      // Check variation markings are (A, B)
      const v = project.variations.find(v => v.id === varId);
      expect(v?.markings?.map(m => m.label)).toEqual(['A', 'B']);
    });

    it('generates sequential number marks from 1 to N independently per layer', () => {
      let project = createNewProject(19, 'Number Marks Test');

      // Add number marks 1..3 to root
      const mark1 = { x: 2, y: 2, type: 'LB' as const, label: getNextNumberMark(getActiveLayerMarkings(project, 'root')) };
      expect(mark1.label).toBe('1');
      project = recordMarking(project, 'root', mark1).project;

      const mark2 = { x: 2, y: 3, type: 'LB' as const, label: getNextNumberMark(getActiveLayerMarkings(project, 'root')) };
      expect(mark2.label).toBe('2');
      project = recordMarking(project, 'root', mark2).project;

      const mark3 = { x: 2, y: 4, type: 'LB' as const, label: getNextNumberMark(getActiveLayerMarkings(project, 'root')) };
      expect(mark3.label).toBe('3');
      project = recordMarking(project, 'root', mark3).project;

      expect(project.root.markings?.map(m => m.label)).toEqual(['1', '2', '3']);

      // Add variation and number marks to it
      const { project: pVar, newVariationId: varId } = addVariation(project, 'Var Number Test', [], 0, 'root');
      project = pVar;

      const vMark1 = { x: 5, y: 5, type: 'LB' as const, label: getNextNumberMark(getActiveLayerMarkings(project, varId)) };
      expect(vMark1.label).toBe('1');
      project = recordMarking(project, varId, vMark1).project;

      const vMark2 = { x: 5, y: 6, type: 'LB' as const, label: getNextNumberMark(getActiveLayerMarkings(project, varId)) };
      expect(vMark2.label).toBe('2');
      project = recordMarking(project, varId, vMark2).project;

      const v = project.variations.find(item => item.id === varId);
      expect(v?.markings?.map(m => m.label)).toEqual(['1', '2']);
    });

    it('reuses available letter / number slot when existing mark is removed or skipped', () => {
      const markings = [
        { x: 0, y: 0, type: 'LB' as const, label: 'A' },
        { x: 0, y: 1, type: 'LB' as const, label: 'C' }
      ];
      expect(getNextLetterMark(markings)).toBe('B');

      const numMarkings = [
        { x: 0, y: 0, type: 'LB' as const, label: '1' },
        { x: 0, y: 1, type: 'LB' as const, label: '3' }
      ];
      expect(getNextNumberMark(numMarkings)).toBe('2');
    });

    it('correctly handles letter and number marks on sublayers', () => {
      let project = createNewProject(19, 'Sublayer Marks Test');
      const { project: pSub, newSubLayerId: subId } = addSubLayer(project, 'root', 'drawing');
      project = pSub;

      const subMarks = getActiveLayerMarkings(project, 'root', subId);
      const markA = { x: 4, y: 4, type: 'LB' as const, label: getNextLetterMark(subMarks) };
      expect(markA.label).toBe('A');

      const res = recordMarking(project, 'root', markA, subId);
      project = res.project;

      const updatedSubMarks = getActiveLayerMarkings(project, 'root', subId);
      expect(updatedSubMarks.length).toBe(1);
      expect(updatedSubMarks[0].label).toBe('A');

      const markB = { x: 4, y: 5, type: 'LB' as const, label: getNextLetterMark(updatedSubMarks) };
      expect(markB.label).toBe('B');
    });
  });
});
