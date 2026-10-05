import React, { useState, useEffect } from 'react';
import { GobanProject, VariationLayer } from '../types/goban';
import { FileText, Save, Tag, Info } from 'lucide-react';

interface LessonNotesProps {
  project: GobanProject;
  activeVariationId: string;
  onUpdateProjectDescription: (desc: string) => void;
  onUpdateVariationDescription: (variationId: string, desc: string) => void;
}

export const LessonNotes: React.FC<LessonNotesProps> = ({
  project,
  activeVariationId,
  onUpdateProjectDescription,
  onUpdateVariationDescription
}) => {
  const isRoot = activeVariationId === 'root';
  const activeVariation = isRoot
    ? null
    : project.variations.find((v) => v.id === activeVariationId) || null;

  const initialNotes = isRoot
    ? project.description || ''
    : activeVariation?.description || '';

  const [notes, setNotes] = useState(initialNotes);

  useEffect(() => {
    const nextVal = isRoot
      ? project.description || ''
      : project.variations.find((v) => v.id === activeVariationId)?.description || '';
    setNotes(nextVal);
  }, [activeVariationId, project]);

  const handleNotesChange = (val: string) => {
    setNotes(val);
    if (isRoot) {
      onUpdateProjectDescription(val);
    } else {
      onUpdateVariationDescription(activeVariationId, val);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-800/90 border-t md:border-t-0 md:border-l border-slate-700/80 p-4 select-none backdrop-blur">
      <div className="flex items-center justify-between pb-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          <h3 className="font-semibold text-xs text-slate-100 uppercase tracking-wide">
            Teacher Notes & Commentary
          </h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-indigo-950 text-indigo-300 border border-indigo-800/40">
          {isRoot ? 'Root Game' : activeVariation?.name || 'Variation'}
        </span>
      </div>

      <div className="flex-1 py-3 flex flex-col">
        <textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder={`Enter teaching instructions, student questions, or tactical rationale for ${
            isRoot ? 'the main game' : activeVariation?.name || 'this variation'
          }...`}
          className="w-full flex-1 p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none font-sans leading-relaxed"
        />
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-700/60">
        <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
        <span>Auto-saved and stored into .gobanstudio & SGF comments</span>
      </div>
    </div>
  );
};
