import React from 'react';
import { Loader2, XCircle, CheckCircle2, Film, AlertTriangle } from 'lucide-react';
import { ExportProgressState } from '../types';

interface ProcessingProgressSheetProps {
  progressState: ExportProgressState;
  onCancel: () => void;
  targetFolder?: string;
}

export const ProcessingProgressSheet: React.FC<ProcessingProgressSheetProps> = ({
  progressState,
  onCancel,
  targetFolder = 'Movies/VideoSplit',
}) => {
  if (!progressState.isExporting && !progressState.error) return null;

  const currentSegment = progressState.segments[progressState.currentSegmentIndex - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-6">
        {/* Title & Status */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <h3 className="text-lg font-bold text-slate-100">
                Dividiendo y procesando video...
              </h3>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Guardando en <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Galería de fotos</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-indigo-400">
              {progressState.overallPercent}%
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span>Progreso General</span>
            <span>
              Clip {progressState.currentSegmentIndex} de {progressState.totalSegments}
            </span>
          </div>
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full transition-all duration-200"
              style={{ width: `${progressState.overallPercent}%` }}
            />
          </div>
        </div>

        {/* Current Segment Card */}
        {currentSegment && (
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-slate-200 truncate max-w-[200px]">
                  {currentSegment.fileName}
                </span>
              </div>
              <span className="text-slate-400 font-mono">
                {currentSegment.outputDuration.toFixed(1)}s
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Codificando segmento</span>
                <span>{progressState.currentSegmentPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-400 rounded-full transition-all duration-150"
                  style={{ width: `${progressState.currentSegmentPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Segments mini-list */}
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {progressState.segments.map((seg) => (
            <div
              key={seg.index}
              className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs ${
                seg.status === 'completed'
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                  : seg.status === 'processing'
                  ? 'bg-indigo-500/15 text-indigo-200 border border-indigo-500/30'
                  : 'bg-slate-800/30 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-2">
                {seg.status === 'completed' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : seg.status === 'processing' ? (
                  <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
                )}
                <span className="truncate max-w-[190px]">{seg.fileName}</span>
              </div>
              <span className="font-mono text-[11px]">
                {seg.status === 'completed'
                  ? 'Listo'
                  : seg.status === 'processing'
                  ? `${seg.progress}%`
                  : 'En cola'}
              </span>
            </div>
          ))}
        </div>

        {/* Error message */}
        {progressState.error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{progressState.error}</span>
          </div>
        )}

        {/* Cancel Button */}
        <div className="pt-2">
          <button
            onClick={onCancel}
            className="w-full py-3 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Cancelar Procesamiento (No dejar archivos corruptos)
          </button>
        </div>
      </div>
    </div>
  );
};
