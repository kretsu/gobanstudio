import { GobanProject } from '../types/goban';
import { importSgfToProject } from '../engine/sgfParser';
import testJosekiSgf from '../sgf/test_joseki.sgf?raw';

const testJosekiProject = importSgfToProject(testJosekiSgf, 'test_joseki.sgf');

export const SAMPLE_LESSONS: { id: string; title: string; subtitle: string; project: GobanProject }[] = [
  {
    id: 'test-joseki',
    title: testJosekiProject.title,
    subtitle: 'Classic Joseki Variations and Branching Sequences',
    project: testJosekiProject
  }
];
