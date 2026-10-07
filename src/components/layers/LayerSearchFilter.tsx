import React from 'react';
import { Search, Tag, X } from 'lucide-react';

interface LayerSearchFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  allTags: string[];
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
}

export const LayerSearchFilter: React.FC<LayerSearchFilterProps> = ({
  searchQuery,
  setSearchQuery,
  allTags,
  selectedTag,
  setSelectedTag
}) => {
  return (
    <div className="p-3 border-b border-slate-800 flex flex-col gap-2 bg-slate-900/40">
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search variations and tags..."
          className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900/80 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3 text-indigo-400" />
              <span>Tags ({allTags.length})</span>
            </span>
            {selectedTag && (
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="text-indigo-400 hover:text-indigo-300 text-[10px] lowercase font-normal"
              >
                clear filter
              </button>
            )}
          </div>
          <div className="flex items-center flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-0.5 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors flex-shrink-0 ${
                selectedTag === null
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors flex items-center gap-1 flex-shrink-0 ${
                  selectedTag === tag
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                    : 'bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-750 border border-slate-700/60'
                }`}
              >
                <span>#{tag}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
