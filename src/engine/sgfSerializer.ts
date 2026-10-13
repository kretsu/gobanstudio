import {
  BoardMarking,
  GobanProject,
  GoMove,
  PlacedStone,
  VariationLayer
} from '../types/goban';
import { formatSgfCoordinate, parseSgfCoordinate } from './coordinates';
import { createNewProject } from './projectOperations';
import { parseSgfText, SgfNode } from './sgfAst';

function extractMarkings(props: Map<string, string[]>): BoardMarking[] {
  const marks: BoardMarking[] = [];
  const markTypes: { key: string; type: BoardMarking['type'] }[] = [
    { key: 'TR', type: 'TR' },
    { key: 'SQ', type: 'SQ' },
    { key: 'CR', type: 'CR' },
    { key: 'MA', type: 'MA' },
    { key: 'TB', type: 'TB' },
    { key: 'TW', type: 'TW' }
  ];

  for (const mt of markTypes) {
    const items = props.get(mt.key) || [];
    for (const item of items) {
      const pt = parseSgfCoordinate(item);
      if (pt) marks.push({ ...pt, type: mt.type });
    }
  }

  const labels = props.get('LB') || [];
  for (const lb of labels) {
    const parts = lb.split(':');
    if (parts.length >= 2) {
      const pt = parseSgfCoordinate(parts[0]);
      if (pt) marks.push({ ...pt, type: 'LB', label: parts.slice(1).join(':') });
    }
  }

  return marks;
}

function extractMove(node: SgfNode, currentMoveCount: number): GoMove | null {
  const bMove = node.props.get('B')?.[0];
  const wMove = node.props.get('W')?.[0];
  const comment = node.props.get('C')?.[0];

  if (bMove !== undefined) {
    if (bMove === '' || bMove === 'tt') {
      return {
        x: -1,
        y: -1,
        pass: true,
        color: 'B',
        moveNumber: currentMoveCount + 1,
        comment
      };
    }
    const pt = parseSgfCoordinate(bMove);
    if (pt) {
      return {
        x: pt.x,
        y: pt.y,
        color: 'B',
        moveNumber: currentMoveCount + 1,
        comment
      };
    }
  } else if (wMove !== undefined) {
    if (wMove === '' || wMove === 'tt') {
      return {
        x: -1,
        y: -1,
        pass: true,
        color: 'W',
        moveNumber: currentMoveCount + 1,
        comment
      };
    }
    const pt = parseSgfCoordinate(wMove);
    if (pt) {
      return {
        x: pt.x,
        y: pt.y,
        color: 'W',
        moveNumber: currentMoveCount + 1,
        comment
      };
    }
  }
  return null;
}

export function importSgfToProject(sgfText: string, filename?: string): GobanProject {
  const rootNode = parseSgfText(sgfText);
  if (!rootNode) {
    throw new Error('Invalid or unparseable SGF format');
  }

  const projectTitle = rootNode.props.get('GN')?.[0] || rootNode.props.get('EV')?.[0] || rootNode.props.get('N')?.[0] || filename?.replace(/\.[^/.]+$/, '') || 'Imported SGF Game';
  const sizeStr = rootNode.props.get('SZ')?.[0];
  const boardSize = sizeStr ? parseInt(sizeStr, 10) || 19 : 19;
  const komiStr = rootNode.props.get('KM')?.[0];
  const komi = komiStr ? parseFloat(komiStr) || 6.5 : 6.5;
  const rules = (rootNode.props.get('RU')?.[0]?.toLowerCase().includes('chinese') ? 'Chinese' : 'Japanese') as 'Japanese' | 'Chinese';
  const blackPlayer = rootNode.props.get('PB')?.[0];
  const whitePlayer = rootNode.props.get('PW')?.[0];
  const date = rootNode.props.get('DT')?.[0] || new Date().toISOString().split('T')[0];

  const project = createNewProject(boardSize, projectTitle);
  project.root.locked = true; // All layers including root are locked by default after load
  project.komi = komi;
  project.rules = rules;
  project.blackPlayer = blackPlayer;
  project.whitePlayer = whitePlayer;
  project.date = date;

  // Extract initial setup stones from root node
  const initialStones: PlacedStone[] = [];
  const addBlack = rootNode.props.get('AB') || [];
  for (const coord of addBlack) {
    const pt = parseSgfCoordinate(coord);
    if (pt) initialStones.push({ ...pt, color: 'B' });
  }
  const addWhite = rootNode.props.get('AW') || [];
  for (const coord of addWhite) {
    const pt = parseSgfCoordinate(coord);
    if (pt) initialStones.push({ ...pt, color: 'W' });
  }
  project.root.initialStones = initialStones;

  project.root.markings = extractMarkings(rootNode.props);

  // Traverse main line for root moves TILL the first branching point
  const rootMoves: GoMove[] = [];
  let curr: SgfNode | null = rootNode;

  while (curr) {
    if (curr.props.has('B') || curr.props.has('W')) {
      const m = extractMove(curr, rootMoves.length);
      if (m) {
        rootMoves.push(m);
      }
    }

    const nodeMarks = extractMarkings(curr.props);
    if (nodeMarks.length > 0) {
      project.root.markings.push(...nodeMarks);
    }

    if (curr.children.length === 0) {
      // Leaf node: straight sequence with no variations
      curr = null;
      break;
    } else if (curr.children.length === 1) {
      // Single continuation
      curr = curr.children[0];
    } else {
      // First branching point encountered!
      // Root moves sequence ends here at curr.
      break;
    }
  }

  project.root.moves = rootMoves;

  let varCounter = 1;

  function processVariationTree(
    startNode: SgfNode,
    parentId: string,
    branchPoint: number,
    index: number,
    parentName?: string
  ) {
    const varMoves: GoMove[] = [];
    const varMarks: BoardMarking[] = [];
    let varDesc = '';
    let explicitName: string | undefined = undefined;

    let vCurr: SgfNode | null = startNode;

    while (vCurr) {
      const nodeName = vCurr.props.get('N')?.[0];
      if (nodeName && !explicitName) {
        const rawName = nodeName.trim();
        const newlineIdx = rawName.indexOf('\n');
        if (newlineIdx !== -1) {
          const namePart = rawName.substring(0, newlineIdx).trim();
          const descPart = rawName.substring(newlineIdx + 1).trim();
          if (namePart) explicitName = namePart;
          if (descPart) varDesc += (varDesc ? '\n' : '') + descPart;
        } else {
          explicitName = rawName;
        }
      }

      const comment = vCurr.props.get('C')?.[0];
      if (comment) {
        varDesc += (varDesc ? '\n' : '') + comment;
      }

      const m = extractMove(vCurr, varMoves.length);
      if (m) {
        varMoves.push(m);
      }

      const marks = extractMarkings(vCurr.props);
      if (marks.length > 0) {
        varMarks.push(...marks);
      }

      if (vCurr.children.length === 0) {
        vCurr = null;
        break;
      } else if (vCurr.children.length === 1) {
        vCurr = vCurr.children[0];
      } else {
        // Branching point inside this variation
        break;
      }
    }

    const varId = `var_${Date.now()}_${Math.random().toString(36).substr(2, 6)}_${varCounter++}`;
    const defaultName = parentId === 'root'
      ? `Variation ${index}`
      : `${parentName || 'Var'} - Branch ${index}`;
    const finalName = explicitName || defaultName;

    const newVariation: VariationLayer = {
      id: varId,
      name: finalName,
      tags: ['Branch', `Move ${branchPoint}`],
      description: varDesc,
      parentId,
      branchPoint,
      locked: true, // All variation layers locked by default after load
      visible: true,
      outdated: false,
      moves: varMoves,
      markings: varMarks,
      subLayers: []
    };

    project.variations.push(newVariation);

    if (vCurr && vCurr.children.length > 1) {
      for (let cIdx = 0; cIdx < vCurr.children.length; cIdx++) {
        processVariationTree(
          vCurr.children[cIdx],
          varId,
          varMoves.length,
          cIdx + 1,
          finalName
        );
      }
    }
  }

  // If we stopped at a branching node (children.length > 1), recursively process all its children
  if (curr && curr.children.length > 1) {
    for (let idx = 0; idx < curr.children.length; idx++) {
      processVariationTree(
        curr.children[idx],
        'root',
        rootMoves.length,
        idx + 1
      );
    }
  }

  return project;
}

function escapeSgfValue(val: string): string {
  return (val || '').replace(/\\/g, '\\\\').replace(/\]/g, '\\]');
}

function formatMarkingsSgf(markings?: BoardMarking[]): string {
  if (!markings || markings.length === 0) return '';
  let res = '';
  const tr = markings.filter(m => m.type === 'TR');
  const sq = markings.filter(m => m.type === 'SQ');
  const cr = markings.filter(m => m.type === 'CR');
  const ma = markings.filter(m => m.type === 'MA');
  const tb = markings.filter(m => m.type === 'TB');
  const tw = markings.filter(m => m.type === 'TW');
  const lb = markings.filter(m => m.type === 'LB');

  if (tr.length > 0) res += `TR${tr.map(m => `[${formatSgfCoordinate(m)}]`).join('')}`;
  if (sq.length > 0) res += `SQ${sq.map(m => `[${formatSgfCoordinate(m)}]`).join('')}`;
  if (cr.length > 0) res += `CR${cr.map(m => `[${formatSgfCoordinate(m)}]`).join('')}`;
  if (ma.length > 0) res += `MA${ma.map(m => `[${formatSgfCoordinate(m)}]`).join('')}`;
  if (tb.length > 0) res += `TB${tb.map(m => `[${formatSgfCoordinate(m)}]`).join('')}`;
  if (tw.length > 0) res += `TW${tw.map(m => `[${formatSgfCoordinate(m)}]`).join('')}`;
  if (lb.length > 0) res += `LB${lb.map(m => `[${formatSgfCoordinate(m)}:${escapeSgfValue(m.label || '')}]`).join('')}`;

  return res;
}

export function exportProjectToSgf(project: GobanProject): string {
  let sgf = '(;GM[1]FF[4]CA[UTF-8]AP[GobanStudio:1.0.0]';
  sgf += `SZ[${project.boardSize}]`;
  sgf += `KM[${project.komi}]`;
  sgf += `RU[${project.rules}]`;
  if (project.title) sgf += `GN[${escapeSgfValue(project.title)}]`;
  if (project.blackPlayer) sgf += `PB[${escapeSgfValue(project.blackPlayer)}]`;
  if (project.whitePlayer) sgf += `PW[${escapeSgfValue(project.whitePlayer)}]`;
  if (project.date) sgf += `DT[${escapeSgfValue(project.date)}]`;
  if (project.description) sgf += `C[${escapeSgfValue(project.description)}]`;

  // Root initial stones
  const bInitial = project.root.initialStones.filter(s => s.color === 'B');
  const wInitial = project.root.initialStones.filter(s => s.color === 'W');
  if (bInitial.length > 0) {
    sgf += `AB${bInitial.map(s => `[${formatSgfCoordinate(s)}]`).join('')}`;
  }
  if (wInitial.length > 0) {
    sgf += `AW${wInitial.map(s => `[${formatSgfCoordinate(s)}]`).join('')}`;
  }

  // Root markings
  sgf += formatMarkingsSgf(project.root.markings);

  // Helper to recursively serialize any sequence and its child variations
  function serializeTree(parentId: string, moves: GoMove[], startIndex: number): string {
    let out = '';
    const childVariations = project.variations.filter(v => (v.parentId || 'root') === parentId);

    // Group child variations by branchPoint
    const varMap = new Map<number, VariationLayer[]>();
    for (const cv of childVariations) {
      const bp = cv.branchPoint;
      if (!varMap.has(bp)) varMap.set(bp, []);
      varMap.get(bp)!.push(cv);
    }

    for (let i = startIndex; i < moves.length; i++) {
      const m = moves[i];
      const moveProp = m.color === 'B' ? 'B' : 'W';
      out += `;${moveProp}[${formatSgfCoordinate(m)}]`;
      if (m.comment) {
        out += `C[${escapeSgfValue(m.comment)}]`;
      }

      // Check if any variation branches after this move (i.e. branchPoint === i + 1)
      const branches = varMap.get(i + 1);
      if (branches && branches.length > 0) {
        // Main continuation branch
        const restOfSeq = serializeTree(parentId, moves, i + 1);
        let branchStr = `(${restOfSeq})`;

        for (const bv of branches) {
          let vStr = `(;N[${escapeSgfValue(bv.name)}]`;
          if (bv.description) vStr += `C[${escapeSgfValue(bv.description)}]`;
          vStr += formatMarkingsSgf(bv.markings);
          vStr += serializeTree(bv.id, bv.moves, 0);
          vStr += ')';
          branchStr += vStr;
        }

        out += branchStr;
        return out;
      }
    }

    return out;
  }

  // Check 0-branches off root
  const rootZeroBranches = project.variations.filter(v => (!v.parentId || v.parentId === 'root') && v.branchPoint === 0);
  if (rootZeroBranches.length > 0) {
    const mainSeq = serializeTree('root', project.root.moves, 0);
    let allBranches = '';
    if (mainSeq) {
      allBranches += `(${mainSeq})`;
    }
    for (const bv of rootZeroBranches) {
      let vStr = `(;N[${escapeSgfValue(bv.name)}]`;
      if (bv.description) vStr += `C[${escapeSgfValue(bv.description)}]`;
      vStr += formatMarkingsSgf(bv.markings);
      vStr += serializeTree(bv.id, bv.moves, 0);
      vStr += ')';
      allBranches += vStr;
    }
    sgf += allBranches + ')';
    return sgf;
  }

  sgf += serializeTree('root', project.root.moves, 0);
  sgf += ')';
  return sgf;
}
