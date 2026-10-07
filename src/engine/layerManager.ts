export type {
  DisplayStone,
  ComputedDisplayState
} from './displayState';
export {
  computeDisplayState
} from './displayState';

export {
  getVariationAncestorChain,
  getDescendantVariationIds,
  toggleVariationOutdated,
  markVariationsOutdated,
  deleteVariation,
  duplicateVariation
} from './variationTree';

export {
  getNextLetterMark,
  getNextNumberMark,
  getActiveLayerMarkings
} from './markings';

export {
  createNewProject,
  addVariation,
  addSubLayer,
  recordMove,
  recordDrawing,
  recordMarking,
  toggleSubLayerOutdated,
  markSubLayersOutdated
} from './projectOperations';
