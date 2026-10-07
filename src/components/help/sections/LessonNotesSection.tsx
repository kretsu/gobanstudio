import React from 'react';
import { FileText } from 'lucide-react';

export const LessonNotesSection: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          <span>Commentary & Lesson Notes</span>
        </h3>
        <p className="text-slate-300 text-sm">
          Keep comprehensive teaching notes, tactical questions, and student homework attached directly to your project.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs text-slate-300">
        <div>
          <strong className="text-blue-300 text-sm block mb-1">Two-Tier Commentary Structure:</strong>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong className="text-slate-100">Project Overview Notes:</strong> General lesson description, student rank recommendations, key takeaways, and lesson goals. Visible across the entire lesson.
            </li>
            <li>
              <strong className="text-slate-100">Variation-Specific Commentary:</strong> Dedicated tactical notes and move-by-move explanations for the active variation. When you switch variations in the Layer Panel, the commentary editor seamlessly switches to that variation&apos;s specific notes.
            </li>
          </ul>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300">
          <strong className="text-blue-300 block mb-0.5">SGF Serialization:</strong>
          <span>All notes and commentary are automatically preserved in both <code className="text-indigo-300">.gobanstudio</code> files and standard SGF <code className="text-indigo-300">C[...]</code> comment nodes upon export.</span>
        </div>
      </div>
    </div>
  );
};
