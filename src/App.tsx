import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  BoardMarking,
  BoardTheme,
  DrawingPath,
  GobanProject,
  NumberingMode,
  Point,
  StoneColor,
  SubLayer,
  ToolType
} from './types/goban';
import {
  addSubLayer,
  addVariation,
  computeDisplayState,
  createNewProject,
  deleteVariation,
  duplicateVariation,
  getVariationAncestorChain,
  recordDrawing,
  recordMarking,
  recordMove
} from './engine/layerManager';
import {
  deserializeProjectFromJson,
  exportProjectToSgf,
  importSgfToProject,
  serializeProjectToJson
} from './engine/sgfParser';
import {SAMPLE_LESSONS} from './components/SampleLessons';
import {GobanBoard} from './components/GobanBoard';
import {LayerPanel} from './components/LayerPanel';
import {Toolbar} from './components/Toolbar';
import {Header} from './components/Header';
import {LessonNotes} from './components/LessonNotes';
import {AlertCircle, CheckCircle, Info} from 'lucide-react';

export const App: React.FC = () => {
  // Main Project State (Initializes with default sample lesson)
  const [project, setProject] = useState<GobanProject>(() => {
    return SAMPLE_LESSONS[0].project;
  });

  // Editor View State
  const [activeVariationId, setActiveVariationId] = useState<string>('root');
  const [activeSubLayerId, setActiveSubLayerId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('stone-alt');
  const [brushColor, setBrushColor] = useState<string>('#ef4444');
  const [brushWidth, setBrushWidth] = useState<number>(4);
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('kaya');
  const [showCoordinates, setShowCoordinates] = useState<boolean>(true);
  const [numberingMode, setNumberingMode] = useState<NumberingMode>('auto');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Playback / Navigation Scrubber State
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'info' | 'success' | 'warning' } | null>(null);

  const showToast = useCallback((text: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => (prev?.text === text ? null : prev));
    }, 3200);
  }, []);

  // Compute Active Display State
  const displayState = useMemo(() => {
    return computeDisplayState(project, activeVariationId, currentStep, activeSubLayerId);
  }, [project, activeVariationId, currentStep, activeSubLayerId]);

  // Sync step scrubber when switching variations
  const handleSelectVariation = useCallback((id: string) => {
    setActiveVariationId(id);
    setActiveSubLayerId(null);
    setProject(prev => ({
      ...prev,
      activeVariationId: id,
      activeSubLayerId: null
    }));
    const totalMoves = id === 'root'
      ? project.root.moves.length
      : project.variations.find(v => v.id === id)?.moves.length || 0;
    setCurrentStep(totalMoves);
    setIsPlaying(false);
  }, [project]);

  // Initial step setup on mount or project load
  useEffect(() => {
    const total = activeVariationId === 'root'
      ? project.root.moves.length
      : project.variations.find(v => v.id === activeVariationId)?.moves.length || 0;
    setCurrentStep(total);
  }, [activeVariationId, project.root.moves.length, project.variations]);

  // Auto-play slideshow timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= displayState.totalSteps) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 850);
    return () => clearInterval(interval);
  }, [isPlaying, displayState.totalSteps]);

  // Determine next stone color for stone-alt tool
  const getNextStoneColor = useCallback((): StoneColor => {
    const isRoot = activeVariationId === 'root';
    if (isRoot) {
      const moves = project.root.moves.slice(0, currentStep);
      if (moves.length === 0) return 'B';
      return moves[moves.length - 1].color === 'B' ? 'W' : 'B';
    }

    const targetVar = project.variations.find(v => v.id === activeVariationId);
    if (!targetVar) return 'B';

    const moves = targetVar.moves.slice(0, currentStep);
    if (moves.length > 0) {
      return moves[moves.length - 1].color === 'B' ? 'W' : 'B';
    }

    // Target variation has no moves yet: look up ancestor chain
    const chain = getVariationAncestorChain(project, activeVariationId);
    // Walk backwards from targetVar's parent up to root
    for (let k = chain.length - 2; k >= 0; k--) {
      const ancestor = chain[k];
      const nextChild = chain[k + 1];
      const bp = nextChild.branchPoint !== undefined ? nextChild.branchPoint : ancestor.moves.length;
      const ancMoves = ancestor.moves.slice(0, bp);
      if (ancMoves.length > 0) {
        return ancMoves[ancMoves.length - 1].color === 'B' ? 'W' : 'B';
      }
    }

    // Check root moves
    const topVar = chain[0] || targetVar;
    const rootBp = topVar.branchPoint > 0 ? topVar.branchPoint : (topVar.branchPoint === 0 ? 0 : project.root.moves.length);
    const rootMoves = project.root.moves.slice(0, rootBp);
    if (rootMoves.length > 0) {
      return rootMoves[rootMoves.length - 1].color === 'B' ? 'W' : 'B';
    }

    return 'B';
  }, [activeVariationId, currentStep, project]);

  // Place Stone Handler
  const handlePlaceStone = useCallback((point: Point, explicitColor?: StoneColor) => {
    const color = explicitColor || getNextStoneColor();
    const result = recordMove(project, activeVariationId, point, color, currentStep);

    if (result.error) {
      showToast(result.error, 'warning');
      return;
    }

    setProject(result.project);
    if (result.isNewVariation && result.newVariationId) {
      setActiveVariationId(result.newVariationId);
      setActiveSubLayerId(null);
      setCurrentStep(1);
      const newVar = result.project.variations.find(v => v.id === result.newVariationId);
      showToast(`Created variation "${newVar?.name || 'New Variation'}" on locked layer`, 'success');
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [project, activeVariationId, activeSubLayerId, currentStep, getNextStoneColor, showToast]);

  // Remove Stone Handler
  const handleRemoveStone = useCallback((point: Point) => {
    const isRoot = activeVariationId === 'root';
    const parent = isRoot ? project.root : project.variations.find(v => v.id === activeVariationId);
    if (!parent) return;

    if (activeSubLayerId) {
      const activeSub = (parent.subLayers || []).find(s => s.id === activeSubLayerId);
      if (activeSub) {
        if (activeSub.locked) {
          showToast(`Subvariation "${activeSub.name}" is locked for editing.`, 'warning');
          return;
        }
        setProject((prev) => {
          const updateSubs = (subs: SubLayer[]) =>
            subs.map((s) => {
              if (s.id === activeSubLayerId) {
                return {
                  ...s,
                  moves: (s.moves || []).filter((m) => !(m.x === point.x && m.y === point.y)),
                  initialStones: (s.initialStones || []).filter((st) => !(st.x === point.x && st.y === point.y))
                };
              }
              return s;
            });
          if (isRoot) {
            return { ...prev, root: { ...prev.root, subLayers: updateSubs(prev.root.subLayers) } };
          } else {
            return {
              ...prev,
              variations: prev.variations.map((v) =>
                v.id === activeVariationId ? { ...v, subLayers: updateSubs(v.subLayers) } : v
              )
            };
          }
        });
        return;
      }
    }

    if (parent.locked) {
      showToast('Layer is locked for editing.', 'warning');
      return;
    }

    setProject((prev) => {
      if (isRoot) {
        const updatedSubs = (prev.root.subLayers || []).map(s => ({ ...s, outdated: true }));
        const updatedVars = (prev.variations || []).map(v => ({
          ...v,
          outdated: true,
          subLayers: (v.subLayers || []).map(s => ({ ...s, outdated: true }))
        }));
        return {
          ...prev,
          root: {
            ...prev.root,
            moves: prev.root.moves.filter((m) => !(m.x === point.x && m.y === point.y)),
            initialStones: prev.root.initialStones.filter((s) => !(s.x === point.x && s.y === point.y)),
            subLayers: updatedSubs
          },
          variations: updatedVars
        };
      } else {
        return {
          ...prev,
          variations: prev.variations.map((v) => {
            if (v.id === activeVariationId) {
              const updatedSubs = (v.subLayers || []).map(s => ({ ...s, outdated: true }));
              return {
                ...v,
                moves: v.moves.filter((m) => !(m.x === point.x && m.y === point.y)),
                subLayers: updatedSubs
              };
            }
            return v;
          })
        };
      }
    });
  }, [project, activeVariationId, activeSubLayerId, showToast]);

  // Markings Handlers
  const handleAddMarking = useCallback((marking: BoardMarking) => {
    const result = recordMarking(project, activeVariationId, marking);

    if (result.error) {
      showToast(result.error, 'warning');
      return;
    }

    setProject(result.project);
    if (result.isNewSubLayer && result.newSubLayerId) {
      setActiveSubLayerId(result.newSubLayerId);
      const isRoot = activeVariationId === 'root';
      const subs = isRoot ? result.project.root.subLayers : result.project.variations.find(v => v.id === activeVariationId)?.subLayers;
      const newSub = subs?.find(s => s.id === result.newSubLayerId);
      showToast(`Created subvariation "${newSub?.name || 'Markings'}"`, 'info');
    }
  }, [project, activeVariationId, showToast]);

  const handleRemoveMarking = useCallback((point: Point) => {
    const isRoot = activeVariationId === 'root';
    const parent = isRoot ? project.root : project.variations.find(v => v.id === activeVariationId);
    if (!parent) return;

    if (activeSubLayerId) {
      const activeSub = (parent.subLayers || []).find(s => s.id === activeSubLayerId);
      if (activeSub) {
        if (activeSub.locked) {
          showToast(`Subvariation "${activeSub.name}" is locked.`, 'warning');
          return;
        }
        setProject((prev) => {
          const updateSubs = (subs: SubLayer[]) =>
            subs.map((s) => {
              if (s.id === activeSubLayerId) {
                return {
                  ...s,
                  markings: (s.markings || []).filter((m) => !(m.x === point.x && m.y === point.y))
                };
              }
              return s;
            });
          if (isRoot) {
            return { ...prev, root: { ...prev.root, subLayers: updateSubs(prev.root.subLayers) } };
          } else {
            return {
              ...prev,
              variations: prev.variations.map((v) =>
                v.id === activeVariationId ? { ...v, subLayers: updateSubs(v.subLayers) } : v
              )
            };
          }
        });
        return;
      }
    }

    if (parent.locked) {
      showToast('Layer is locked for editing.', 'warning');
      return;
    }

    setProject((prev) => {
      if (isRoot) {
        const updatedSubs = (prev.root.subLayers || []).map(s => ({ ...s, outdated: true }));
        const updatedVars = (prev.variations || []).map(v => ({
          ...v,
          outdated: true,
          subLayers: (v.subLayers || []).map(s => ({ ...s, outdated: true }))
        }));
        return {
          ...prev,
          root: {
            ...prev.root,
            markings: prev.root.markings.filter((m) => !(m.x === point.x && m.y === point.y)),
            subLayers: updatedSubs
          },
          variations: updatedVars
        };
      } else {
        return {
          ...prev,
          variations: prev.variations.map((v) => {
            if (v.id === activeVariationId) {
              const updatedSubs = (v.subLayers || []).map(s => ({ ...s, outdated: true }));
              return {
                ...v,
                markings: v.markings.filter((m) => !(m.x === point.x && m.y === point.y)),
                subLayers: updatedSubs
              };
            }
            return v;
          })
        };
      }
    });
  }, [project, activeVariationId, activeSubLayerId, showToast]);

  // Drawing Handlers
  const handleAddDrawing = useCallback((path: DrawingPath) => {
    const result = recordDrawing(project, activeVariationId, path, activeSubLayerId);

    if (result.error) {
      showToast(result.error, 'warning');
      return;
    }

    setProject(result.project);
    if (result.isNewSubLayer && result.newSubLayerId) {
      setActiveSubLayerId(result.newSubLayerId);
      const isRoot = activeVariationId === 'root';
      const subs = isRoot ? result.project.root.subLayers : result.project.variations.find(v => v.id === activeVariationId)?.subLayers;
      const newSub = subs?.find(s => s.id === result.newSubLayerId);
      showToast(`Created subvariation "${newSub?.name || 'Lesson Drawings'}"`, 'info');
    }
  }, [project, activeVariationId, activeSubLayerId, showToast]);

  const handleClearDrawings = useCallback(() => {
    setProject((prev) => {
      const clearSubs = (subs: SubLayer[]) =>
        subs.map((s) => ({ ...s, drawings: [] }));

      return {
        ...prev,
        root: { ...prev.root, subLayers: clearSubs(prev.root.subLayers) },
        variations: prev.variations.map((v) => ({ ...v, subLayers: clearSubs(v.subLayers) }))
      };
    });
    showToast('All freehand drawings cleared.', 'info');
  }, [showToast]);

  // Layer Management Handlers
  const handleAddVariation = useCallback((name: string, tags: string[], branchPoint?: number, parentId?: string) => {
    const { project: updated, newVariationId } = addVariation(
      project,
      name,
      tags,
      branchPoint !== undefined ? branchPoint : currentStep,
      parentId !== undefined ? parentId : activeVariationId
    );
    setProject(updated);
    setActiveVariationId(newVariationId);
    setActiveSubLayerId(null);
    setCurrentStep(0);
    showToast(`Created new variation "${name}"`, 'success');
  }, [project, currentStep, activeVariationId, showToast]);

  const handleAddSubLayer = useCallback((parentVarId: string, name: string, type: SubLayer['type'] = 'drawing') => {
    const { project: updated, newSubLayerId } = addSubLayer(
      project,
      parentVarId,
      name,
      type
    );
    setProject(updated);
    setActiveVariationId(parentVarId);
    setActiveSubLayerId(newSubLayerId);
    if (!activeTool.startsWith('draw-')) {
      setActiveTool('draw-pen');
    }
    showToast(`Added drawing overlay "${name}"`, 'success');
  }, [project, activeTool, showToast]);

  const handleSelectSubLayer = useCallback((vId: string, sId: string | null) => {
    setActiveVariationId(vId);
    setActiveSubLayerId(sId);
    setProject(prev => ({
      ...prev,
      activeVariationId: vId,
      activeSubLayerId: sId
    }));
    if (sId) {
      if (!activeTool.startsWith('draw-')) {
        setActiveTool('draw-pen');
      }
    }
  }, [activeTool]);

  const handleToggleLayerLock = useCallback((layerType: 'root' | 'variation' | 'sublayer', varId: string, subId?: string) => {
    setProject((prev) => {
      if (layerType === 'root') {
        const nextLocked = !prev.root.locked;
        showToast(nextLocked ? 'Root layer locked' : 'Root layer unlocked', 'info');
        return { ...prev, root: { ...prev.root, locked: nextLocked } };
      } else if (layerType === 'variation') {
        return {
          ...prev,
          variations: prev.variations.map((v) => {
            if (v.id === varId) {
              const nextLocked = !v.locked;
              showToast(nextLocked ? `Locked "${v.name}"` : `Unlocked "${v.name}"`, 'info');
              return { ...v, locked: nextLocked };
            }
            return v;
          })
        };
      } else if (layerType === 'sublayer' && subId) {
        const updateSubs = (subs: SubLayer[]) =>
          subs.map((s) => (s.id === subId ? { ...s, locked: !s.locked } : s));

        if (varId === 'root') {
          return { ...prev, root: { ...prev.root, subLayers: updateSubs(prev.root.subLayers) } };
        } else {
          return {
            ...prev,
            variations: prev.variations.map((v) =>
              v.id === varId ? { ...v, subLayers: updateSubs(v.subLayers) } : v
            )
          };
        }
      }
      return prev;
    });
  }, [showToast]);

  const handleToggleLayerVisibility = useCallback((layerType: 'root' | 'variation' | 'sublayer', varId: string, subId?: string) => {
    setProject((prev) => {
      if (layerType === 'root') {
        return { ...prev, root: { ...prev.root, visible: !prev.root.visible } };
      } else if (layerType === 'variation') {
        return {
          ...prev,
          variations: prev.variations.map((v) => (v.id === varId ? { ...v, visible: !v.visible } : v))
        };
      } else if (layerType === 'sublayer' && subId) {
        const updateSubs = (subs: SubLayer[]) =>
          subs.map((s) => (s.id === subId ? { ...s, visible: !s.visible } : s));

        if (varId === 'root') {
          return { ...prev, root: { ...prev.root, subLayers: updateSubs(prev.root.subLayers) } };
        } else {
          return {
            ...prev,
            variations: prev.variations.map((v) =>
              v.id === varId ? { ...v, subLayers: updateSubs(v.subLayers) } : v
            )
          };
        }
      }
      return prev;
    });
  }, []);

  const handleToggleDefaultVisibility = useCallback((varId: string, subId: string) => {
    setProject((prev) => {
      const updateSubs = (subs: SubLayer[]) =>
        subs.map((s) => (s.id === subId ? { ...s, defaultVisible: !s.defaultVisible } : s));

      if (varId === 'root') {
        return { ...prev, root: { ...prev.root, subLayers: updateSubs(prev.root.subLayers) } };
      } else {
        return {
          ...prev,
          variations: prev.variations.map((v) =>
            v.id === varId ? { ...v, subLayers: updateSubs(v.subLayers) } : v
          )
        };
      }
    });
  }, []);

  const handleDeleteVariation = useCallback((varId: string) => {
    const updated = deleteVariation(project, varId);
    setProject(updated);
    setActiveVariationId(updated.activeVariationId);
    setActiveSubLayerId(null);
    showToast('Variation deleted', 'info');
  }, [project, showToast]);

  const handleDeleteSubLayer = useCallback((parentVarId: string, subId: string) => {
    setProject((prev) => {
      const filterSubs = (subs: SubLayer[]) => subs.filter((s) => s.id !== subId);
      if (parentVarId === 'root') {
        return { ...prev, root: { ...prev.root, subLayers: filterSubs(prev.root.subLayers) } };
      } else {
        return {
          ...prev,
          variations: prev.variations.map((v) =>
            v.id === parentVarId ? { ...v, subLayers: filterSubs(v.subLayers) } : v
          )
        };
      }
    });
    setActiveSubLayerId(null);
    showToast('Drawing overlay deleted', 'info');
  }, [showToast]);

  const handleDuplicateVariation = useCallback((varId: string) => {
    const { project: updated, newVariationId } = duplicateVariation(project, varId);
    if (!newVariationId) return;
    setProject(updated);
    setActiveVariationId(newVariationId);
    setActiveSubLayerId(null);
    const v = updated.variations.find((item) => item.id === newVariationId);
    showToast(`Duplicated "${v?.name || 'Variation'}"`, 'success');
  }, [project, showToast]);

  const handleRenameVariation = useCallback((varId: string, newName: string) => {
    setProject((prev) => ({
      ...prev,
      variations: prev.variations.map((v) => (v.id === varId ? { ...v, name: newName } : v))
    }));
  }, []);

  const handleRenameSubLayer = useCallback((parentVarId: string, subId: string, newName: string) => {
    setProject((prev) => {
      const updateSubs = (subs: SubLayer[]) =>
        subs.map((s) => (s.id === subId ? { ...s, name: newName } : s));

      if (parentVarId === 'root') {
        return { ...prev, root: { ...prev.root, subLayers: updateSubs(prev.root.subLayers) } };
      } else {
        return {
          ...prev,
          variations: prev.variations.map((v) =>
            v.id === parentVarId ? { ...v, subLayers: updateSubs(v.subLayers) } : v
          )
        };
      }
    });
    showToast(`Renamed subvariation to "${newName}"`, 'info');
  }, [showToast]);

  const handleUpdateVariationTags = useCallback((varId: string, tags: string[]) => {
    setProject((prev) => ({
      ...prev,
      variations: prev.variations.map((v) => (v.id === varId ? { ...v, tags } : v))
    }));
  }, []);

  const handleRenameRoot = useCallback((newName: string) => {
    setProject((prev) => ({
      ...prev,
      root: { ...prev.root, name: newName }
    }));
  }, []);

  const handleToggleSubLayerOutdated = useCallback((varId: string, subId: string) => {
    setProject((prev) => {
      const isRoot = varId === 'root';
      const updateSubs = (subs: SubLayer[]) =>
        subs.map((s) => (s.id === subId ? { ...s, outdated: !s.outdated } : s));

      if (isRoot) {
        return { ...prev, root: { ...prev.root, subLayers: updateSubs(prev.root.subLayers || []) } };
      } else {
        return {
          ...prev,
          variations: prev.variations.map((v) =>
            v.id === varId ? { ...v, subLayers: updateSubs(v.subLayers || []) } : v
          )
        };
      }
    });
  }, []);

  const handleToggleVariationOutdated = useCallback((varId: string) => {
    setProject((prev) => ({
      ...prev,
      variations: prev.variations.map((v) =>
        v.id === varId ? { ...v, outdated: !v.outdated } : v
      )
    }));
  }, []);

  // File Persistence Handlers
  const handleNewProject = useCallback(() => {
    if (confirm('Create new Go lesson? Any unsaved changes in current session will be replaced.')) {
      setProject(createNewProject(19, 'New Go Lesson'));
      setActiveVariationId('root');
      setActiveSubLayerId(null);
      setCurrentStep(0);
      showToast('Created new lesson project', 'success');
    }
  }, [showToast]);

  const handleOpenFile = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      if (file.name.endsWith('.sgf')) {
        const imported = importSgfToProject(text, file.name);
        setProject(imported);
        setActiveVariationId('root');
        setCurrentStep(imported.root.moves.length);
        showToast(`Imported SGF file "${file.name}"`, 'success');
      } else {
        const loaded = deserializeProjectFromJson(text);
        setProject(loaded);
        setActiveVariationId('root');
        setCurrentStep(loaded.root.moves.length);
        showToast(`Loaded lesson project "${file.name}"`, 'success');
      }
    } catch (err) {
      showToast('Error opening file: ' + (err as Error).message, 'warning');
    }
  }, [showToast]);

  const handleSaveProject = useCallback(() => {
    const json = serializeProjectToJson(project);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/[^a-z0-9_-]/gi, '_')}.gobanstudio`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Saved lesson project as "${a.download}"`, 'success');
  }, [project, showToast]);

  const handleExportSgf = useCallback(() => {
    const sgf = exportProjectToSgf(project);
    const blob = new Blob([sgf], { type: 'application/x-go-sgf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/[^a-z0-9_-]/gi, '_')}.sgf`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported SGF as "${a.download}"`, 'success');
  }, [project, showToast]);

  const handleExportPng = useCallback(() => {
    // Render svg element to canvas then trigger image download
    const svgEl = document.querySelector('svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 1600, 1600);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `${project.title.replace(/[^a-z0-9_-]/gi, '_')}_board.png`;
      a.click();
      showToast('Exported board snapshot PNG', 'success');
    };
    img.src = url;
  }, [project.title, showToast]);

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentStep((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentStep((prev) => Math.min(displayState.totalSteps, prev + 1));
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentStep(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentStep(displayState.totalSteps);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayState.totalSteps]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Application Header */}
      <Header
        project={project}
        boardTheme={boardTheme}
        setBoardTheme={setBoardTheme}
        showCoordinates={showCoordinates}
        setShowCoordinates={setShowCoordinates}
        numberingMode={numberingMode}
        setNumberingMode={setNumberingMode}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        captures={displayState.captures}
        onNewProject={handleNewProject}
        onOpenFile={handleOpenFile}
        onSaveProject={handleSaveProject}
        onExportSgf={handleExportSgf}
        onExportPng={handleExportPng}
        onLoadSample={(s) => {
          setProject(s);
          setActiveVariationId('root');
          setActiveSubLayerId(null);
          setCurrentStep(s.root.moves.length);
          showToast(`Loaded sample "${s.title}"`, 'success');
        }}
        onUpdateTitle={(title) => setProject((p) => ({ ...p, title }))}
      />

      {/* Main Workspace (3 Columns: Layer Panel | Goban Board & Toolbar | Lesson Notes) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Photoshop-like Layer Panel */}
        <div className="w-80 flex-shrink-0 hidden md:flex flex-col">
          <LayerPanel
            project={project}
            activeVariationId={activeVariationId}
            activeSubLayerId={activeSubLayerId}
            onSelectVariation={handleSelectVariation}
            onSelectSubLayer={handleSelectSubLayer}
            onAddVariation={handleAddVariation}
            onAddSubLayer={handleAddSubLayer}
            onToggleLayerLock={handleToggleLayerLock}
            onToggleLayerVisibility={handleToggleLayerVisibility}
            onToggleDefaultVisibility={handleToggleDefaultVisibility}
            onDeleteVariation={handleDeleteVariation}
            onDeleteSubLayer={handleDeleteSubLayer}
            onDuplicateVariation={handleDuplicateVariation}
            onRenameVariation={handleRenameVariation}
            onRenameSubLayer={handleRenameSubLayer}
            onUpdateVariationTags={handleUpdateVariationTags}
            onRenameRoot={handleRenameRoot}
            onToggleSubLayerOutdated={handleToggleSubLayerOutdated}
            onToggleVariationOutdated={handleToggleVariationOutdated}
          />
        </div>

        {/* Middle Column: Interactive Goban Board & Toolbar */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-900/60 relative">
          {/* Active Variation Breadcrumb Bar */}
          <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-medium truncate">
              <span className="text-slate-400">Current Layer:</span>
              <span className="font-semibold text-slate-100 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                {displayState.activeLayerName}
              </span>
              {activeVariationId !== 'root' && (
                <span className="text-indigo-400 text-[11px]">
                  (Root stones un-numbered • Variation starts at 1)
                </span>
              )}
            </div>

            {displayState.isLocked && (
              <span className="text-amber-400 text-xs font-bold flex items-center gap-1">
                🔒 Editing Locked
              </span>
            )}
          </div>

          {/* Centered Board Container */}
          <div className="flex-1 flex items-center justify-center p-4 min-h-0 overflow-auto">
            <GobanBoard
              boardSize={project.boardSize}
              stones={displayState.stones}
              markings={displayState.markings}
              drawings={displayState.drawings}
              isLocked={displayState.isLocked}
              activeSubLayerLocked={!!displayState.activeSubLayer?.locked}
              theme={boardTheme}
              showCoordinates={showCoordinates}
              numberingMode={numberingMode}
              activeTool={activeTool}
              brushColor={brushColor}
              brushWidth={brushWidth}
              soundEnabled={soundEnabled}
              onPlaceStone={handlePlaceStone}
              onRemoveStone={handleRemoveStone}
              onAddMarking={handleAddMarking}
              onRemoveMarking={handleRemoveMarking}
              onAddDrawing={handleAddDrawing}
              onLockedActionAttempt={() =>
                showToast('This subvariation is locked for editing. Unlock it in Layer panel to modify.', 'warning')
              }
            />
          </div>

          {/* Bottom Toolbar & Sequence Scrubber */}
          <Toolbar
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            brushColor={brushColor}
            setBrushColor={setBrushColor}
            brushWidth={brushWidth}
            setBrushWidth={setBrushWidth}
            currentStep={currentStep}
            totalSteps={displayState.totalSteps}
            onStepChange={setCurrentStep}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying((p) => !p)}
            onClearDrawings={handleClearDrawings}
            isLocked={displayState.isLocked}
          />
        </div>

        {/* Right Column: Teacher Lesson Notes & Commentary */}
        <div className="w-80 flex-shrink-0 hidden lg:flex flex-col">
          <LessonNotes
            project={project}
            activeVariationId={activeVariationId}
            onUpdateProjectDescription={(desc) => setProject((p) => ({ ...p, description: desc }))}
            onUpdateVariationDescription={(vId, desc) =>
              setProject((p) => ({
                ...p,
                variations: p.variations.map((v) => (v.id === vId ? { ...v, description: desc } : v))
              }))
            }
          />
        </div>
      </div>

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-850 border border-slate-700 shadow-2xl text-xs font-medium text-slate-100 backdrop-blur animate-slide-up">
          {toastMessage.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
          {toastMessage.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400" />}
          {toastMessage.type === 'info' && <Info className="w-4 h-4 text-indigo-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
};
