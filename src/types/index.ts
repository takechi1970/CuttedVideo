export type PlaybackSpeed = number;

export type OutputResolution = 'original' | '1080p' | '720p' | '480p' | 'custom';

export type ThemeMode = 'auto' | 'light' | 'dark';

export type CutPreset = '30s' | '60s' | '90s' | 'custom';

export interface AppPreferences {
  theme: ThemeMode;
  speed: number;
  muteAudio: boolean;
  quality: OutputResolution;
  customHeight: number;
  cutPreset: CutPreset;
  customCutSeconds: number;
}

export interface VideoMetadata {
  name: string;
  size: number; // bytes
  duration: number; // seconds
  width: number;
  height: number;
  mimeType: string;
  thumbnailUrl: string;
  fileUrl: string;
  file?: File;
  fps?: number;
}

export interface SplitProfile {
  id: string;
  name: string;
  platform: string;
  maxDurationSeconds: number;
  description: string;
  isEditable: boolean;
  isCustom?: boolean;
}

export interface SegmentInfo {
  index: number;
  fileName: string;
  sourceStartTime: number; // in original video time (seconds)
  sourceEndTime: number;
  outputDuration: number; // estimated output duration (seconds)
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number; // 0 - 100
  blob?: Blob;
  blobUrl?: string;
  fileSizeBytes?: number;
  error?: string;
}

export interface ExportProgressState {
  isExporting: boolean;
  currentSegmentIndex: number;
  totalSegments: number;
  overallPercent: number;
  currentSegmentPercent: number;
  segments: SegmentInfo[];
  error?: string;
  isCancelled: boolean;
  isCompleted: boolean;
  elapsedTimeSeconds: number;
}

export interface AndroidProjectFile {
  path: string;
  name: string;
  language: 'kotlin' | 'groovy' | 'xml' | 'markdown' | 'properties';
  category: 'build' | 'source' | 'res' | 'docs';
  content: string;
  description: string;
}
