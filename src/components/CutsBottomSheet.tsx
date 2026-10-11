import React from 'react';
import { X, Scissors, Check, Sparkles, Layers, Clock, Film } from 'lucide-react';
import { CutPreset, SegmentInfo } from '../types';
import { formatDuration } from '../utils/videoProcessor';

interface CutsBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  cutPreset: CutPreset;
  onCutPresetChange: (preset: CutPreset) => void;
  customSeconds: number;
  onCustomSecondsChange: (sec: number) => void;
  effectiveCutSeconds: number;
  segments: SegmentInfo[];
  totalEffectiveDuration: number;
  isDark: boolean;
}

export const CutsBottomSheet: React.FC<CutsBottomSheetProps> = ({
  isOpen,
  onClose,
  cutPreset,
  onCutPresetChange,
  customSeconds,
  onCustomSecondsChange,
  effectiveCutSeconds,
  segments,
  totalEffectiveDuration,
  isDark,
}) => {
  if (!isOpen) return null;

  const presets: { id: CutPreset; label: string; desc: string; tag: string }[] = [
    {
      id: '30s',
      label: '30 seg',
      desc: 'Límite clásico',
      tag: 'WhatsApp / Telegram',
    },
    {
      id: '60s',
      label: '60 seg',
      desc: '1 minuto exacto',
      tag: 'Reels / TikTok',
    },
    {
      id: '90s',
      label: '90 seg',
      desc: '1:30 minutos',
      tag: 'Instagram Stories',
    },
    {
      id: 'custom',
      label: 'Personalizada',
      desc: `${customSeconds}s libre`,
      tag: 'Slider 5s a 180s',
    },
  ];

  const bgModal = isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-2xl';
  const bgSubtle = isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-slate-100 border-slate-200';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative w-full rounded-t-3xl border-t p-5 pb-7 transition-transform duration-300 ease-out transform translate-y-0 shadow-2xl z-10 flex flex-col gap-4 max-h-[82%] overflow-y-auto ${bgModal}`}
      >
        {/* Drag handle */}
        <div className="w-12 h-1.5 rounded-full bg-slate-500/40 mx-auto -mt-1 cursor-pointer" onClick={onClose} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Duración de los Cortes</h3>
              <p className={`text-[11px] ${textMuted}`}>Elige la duración máxima por cada clip</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Cuts Buttons: Dos hileras de dos cada uno, botones más grandes */}
        <div className="space-y-1.5">
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${textMuted}`}>
            Modo de Segmentación
          </span>
          <div className="grid grid-cols-2 gap-3">
            {presets.map((btn) => {
              const isSelected = cutPreset === btn.id;
              return (
                <button
                  key={btn.id}
                  onClick={() => onCutPresetChange(btn.id)}
                  className={`p-4 rounded-2xl border text-left transition relative active:scale-[0.98] ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                      : `${bgSubtle} hover:border-slate-500`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold">{btn.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <span className={`text-[11px] block mt-1 ${textMuted}`}>{btn.desc}</span>
                  <span className="inline-block mt-1.5 text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                    {btn.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom duration Slider (de 5 en 5, 5s a 180s) */}
        {cutPreset === 'custom' && (
          <div className={`p-3.5 rounded-2xl border ${bgSubtle} space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Duración de Corte Personalizada</span>
              <span className="text-xs font-mono font-bold text-emerald-500 px-2 py-0.5 rounded-md bg-emerald-500/10">
                {customSeconds} segundos
              </span>
            </div>

            <input
              type="range"
              min="5"
              max="180"
              step="5"
              value={customSeconds}
              onChange={(e) => onCustomSecondsChange(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-700/30 rounded-lg"
            />

            <div className={`flex justify-between text-[10px] font-mono ${textMuted}`}>
              <span>5s</span>
              <span>30s</span>
              <span>60s</span>
              <span>120s</span>
              <span>180s</span>
            </div>
          </div>
        )}

        {/* Real-time Math and Breakdown */}
        <div className={`p-3.5 rounded-2xl border ${bgSubtle} space-y-2.5`}>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              Resultado Calculado
            </span>
            <span className="text-xs font-mono font-bold text-emerald-500">
              {segments.length} {segments.length === 1 ? 'clip' : 'clips'} en total
            </span>
          </div>

          {/* Timeline visualization */}
          <div className="space-y-1">
            <div className="flex h-4 w-full rounded-md overflow-hidden bg-slate-950 border border-slate-800 gap-0.5 p-0.5">
              {segments.map((seg) => {
                const widthPercent = totalEffectiveDuration > 0
                  ? (seg.outputDuration / totalEffectiveDuration) * 100
                  : 100 / (segments.length || 1);
                return (
                  <div
                    key={seg.index}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-[2px] flex items-center justify-center text-[8px] font-mono text-slate-950 font-bold truncate px-0.5"
                    style={{ width: `${Math.max(6, widthPercent)}%` }}
                    title={`Clip ${seg.index}: ${seg.outputDuration.toFixed(1)}s`}
                  >
                    #{seg.index}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed segments list */}
          <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
            {segments.map((seg) => (
              <div
                key={seg.index}
                className={`flex items-center justify-between text-[11px] p-1.5 rounded-lg ${
                  isDark ? 'bg-slate-900/60' : 'bg-white'
                }`}
              >
                <span className="font-semibold text-xs">Clip #{seg.index}</span>
                <span className={`font-mono text-[10px] ${textMuted}`}>
                  {formatDuration(seg.sourceStartTime)} → {formatDuration(seg.sourceEndTime)}
                </span>
                <span className="font-mono font-bold text-emerald-500">
                  {seg.outputDuration.toFixed(1)}s
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition active:scale-[0.99]"
        >
          Aplicar y Cerrar
        </button>
      </div>
    </div>
  );
};
