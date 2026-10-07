export interface SgfNode {
  props: Map<string, string[]>;
  children: SgfNode[];
}

export function parseSgfText(sgfContent: string): SgfNode | null {
  let pos = 0;
  const len = sgfContent.length;

  function skipWhitespace() {
    while (pos < len && /\s/.test(sgfContent[pos])) {
      pos++;
    }
  }

  function parseValue(): string {
    let val = '';
    while (pos < len) {
      const ch = sgfContent[pos];
      if (ch === '\\') {
        pos++;
        if (pos < len) {
          val += sgfContent[pos];
          pos++;
        }
      } else if (ch === ']') {
        pos++;
        break;
      } else {
        val += ch;
        pos++;
      }
    }
    return val;
  }

  function parseNode(): SgfNode | null {
    skipWhitespace();
    if (pos >= len || sgfContent[pos] !== ';') return null;
    pos++; // skip ';'

    const props = new Map<string, string[]>();

    while (pos < len) {
      skipWhitespace();
      if (pos >= len || sgfContent[pos] === ';' || sgfContent[pos] === '(' || sgfContent[pos] === ')') {
        break;
      }

      // Read prop ident
      let propIdent = '';
      while (pos < len && /[A-Z]/.test(sgfContent[pos])) {
        propIdent += sgfContent[pos];
        pos++;
      }

      if (!propIdent) {
        pos++;
        continue;
      }

      const values: string[] = [];
      while (pos < len) {
        skipWhitespace();
        if (pos < len && sgfContent[pos] === '[') {
          pos++; // skip '['
          values.push(parseValue());
        } else {
          break;
        }
      }

      props.set(propIdent, values);
    }

    return { props, children: [] };
  }

  function parseTree(): SgfNode[] {
    skipWhitespace();
    if (pos >= len || sgfContent[pos] !== '(') return [];
    pos++; // skip '('

    const nodes: SgfNode[] = [];

    while (pos < len) {
      skipWhitespace();
      if (pos >= len) break;
      const ch = sgfContent[pos];
      if (ch === ')') {
        pos++; // skip ')'
        break;
      } else if (ch === ';') {
        const node = parseNode();
        if (node) {
          if (nodes.length > 0) {
            nodes[nodes.length - 1].children.push(node);
          }
          nodes.push(node);
        }
      } else if (ch === '(') {
        const subTrees = parseTree();
        if (nodes.length > 0 && subTrees.length > 0) {
          nodes[nodes.length - 1].children.push(subTrees[0]);
        }
      } else {
        pos++;
      }
    }

    return nodes;
  }

  const all = parseTree();
  return all.length > 0 ? all[0] : null;
}
