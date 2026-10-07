import React from 'react';

export type HelpSectionId =
  | 'overview'
  | 'layers-variations'
  | 'locking'
  | 'markings-drawing'
  | 'playback-scrubber'
  | 'settings-themes'
  | 'lesson-notes'
  | 'file-export-standalone'
  | 'shortcuts';

export interface SectionItem {
  id: HelpSectionId;
  title: string;
  icon: React.ReactNode;
  summary: string;
}
