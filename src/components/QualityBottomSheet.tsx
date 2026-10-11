import React from 'react';
import { X, Sliders, Check, Sparkles, Monitor, Smartphone, Video } from 'lucide-react';
import { OutputResolution } from '../types';
import { calculateTargetDimensions } from '../utils/videoProcessor';

interface QualityBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  resolution: OutputResolution;
  onResolutionChange: (res: OutputResolution) => void;
  customHeight: number;
  onCustomHeightChange: (height: number) => void;
  originalWidth: number;
  originalHeight: number;
  isDark: boolean;
}

export const QualityBottomSheet: React.FC<QualityBottomSheetProps> = ({
  isOpen,
  onClose,
  resolution,
  onResolutionChange,
  customHeight,
  onCustomHeightChange,
  originalWidth,
  originalHeight,
  isDark,
}) => {
  if (!isOpen) return null;

  const targetDims = calculateTargetDimensions(
    originalWidth,
    originalHeight,
    resolution,
    customHeight
  );

  const aspectRatio =
    originalWidth > 0 && originalHeight > 0
      ? originalHeight > originalWidth
        ? '9:16 (Vertical)'
        : originalWidth > originalHeight
        ? '16:9 (Horizontal)'
        : '1:1 (Cuadrado)'
      : 'Auto';

  const buttons: { id: OutputResolution; label: string; desc: string; tag: string }[] = [
    {
      id: '1080p',
      label: '1080p Full HD',
      desc: '1080p máxima nitidez',
      tag: 'Reels / TikTok',
    },
    {
      id: '720p',
      label: '720p HD',
      desc: '720p balanceado y rápido',
      tag: 'WhatsApp / Web',
    },
    {
      id: '480p',
      label: '480p SD',
      desc: '480p liviano y veloz',
      tag: 'Exportación rápida',
    },
    {
      id: 'custom',
      label: 'Personalizada',
      desc: resolution === 'original' ? `${originalHeight}p Original` : `${customHeight}p a medida`,
      tag: 'Control manual',
    },
  ];

  const bgModal = isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-2xl';
  const bgSubtle = isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-slate-100 border-slate-200';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative w-full rounded-t-3xl border-t p-5 pb-7 transition-transform duration-300 ease-out transform translate-y-0 shadow-2xl z-10 flex flex-col gap-4 max-h-[85%] overflow-y-auto ${bgModal}`}
      >
        {/* Drag handle */}
        <div className="w-12 h-1.5 rounded-full bg-slate-500/40 mx-auto -mt-1 cursor-pointer" onClick={onClose} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-500 flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Calidad y Resolución</h3>
              <p className={`text-[11px] ${textMuted}`}>Ajusta el peso y definición de tus clips</p>
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

        {/* 4 Resolution Buttons: 1080, 720, 480, Personalizada */}
        <div className="space-y-1.5">
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${textMuted}`}>
            Selecciona la Calidad
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            {buttons.map((btn) => {
              const isSelected =
                btn.id === 'custom'
                  ? resolution === 'custom' || resolution === 'original'
                  : resolution === btn.id;
              return (
                <button
                  key={btn.id}
                  onClick={() => onResolutionChange(btn.id)}
                  className={`p-3.5 rounded-2xl border text-left transition relative active:scale-[0.98] ${
                    isSelected
                      ? 'border-sky-500 bg-sky-500/10 text-sky-500 shadow-sm ring-1 ring-sky-500/30'
                      : `${bgSubtle} hover:border-slate-500`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold">{btn.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-sky-500" />}
                  </div>
                  <span className={`text-[10px] block mt-0.5 ${textMuted}`}>{btn.desc}</span>
                  <span className="inline-block mt-1 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-400">
                    {btn.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Resolution Slider & Original Button if 'custom' or 'original' is active */}
        {(resolution === 'custom' || resolution === 'original') && (
          <div className={`p-3.5 rounded-2xl border ${bgSubtle} space-y-3 animate-in fade-in slide-in-from-top-2 duration-200`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold block">Resolución Personalizada</span>
                <span className={`text-[10px] ${textMuted}`}>Ajusta la altura en píxeles</span>
              </div>

              {/* Botoncito más pequeño: "Original" */}
              <button
                onClick={() => {
                  onResolutionChange('original');
                  if (originalHeight > 0) onCustomHeightChange(originalHeight);
                }}
                className={`py-1 px-2.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 transition ${
                  resolution === 'original'
                    ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                    : isDark
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300 shadow-xs'
                }`}
                title="Preservar la resolución nativa sin reescalar"
              >
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span>Original ({originalHeight}p)</span>
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className={textMuted}>Altura seleccionada:</span>
                <span className="font-bold text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded">
                  {resolution === 'original' ? `${originalHeight}p (Nativo)` : `${customHeight}p`}
                </span>
              </div>

              <input
                type="range"
                min="360"
                max="1440"
                step="20"
                value={resolution === 'original' ? originalHeight : customHeight}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  onResolutionChange('custom');
                  onCustomHeightChange(val);
                }}
                className="w-full accent-sky-500 cursor-pointer h-2 bg-slate-700/30 rounded-lg"
              />

              <div className={`flex justify-between text-[10px] font-mono ${textMuted}`}>
                <span>360p (Mín)</span>
                <span>720p (HD)</span>
                <span>1080p (FHD)</span>
                <span>1440p (2K)</span>
              </div>
            </div>
          </div>
        )}

        {/* Useful Technical Info Summary */}
        <div className={`p-3.5 rounded-2xl border ${bgSubtle} space-y-2`}>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-sky-500" />
              Detalles de Salida
            </span>
            <span className="text-[10px] font-mono text-sky-500 font-bold">
              {targetDims.width} × {targetDims.height} px
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className={`text-[10px] block ${textMuted}`}>Proporción</span>
              <span className="text-[11px] font-bold">{aspectRatio}</span>
            </div>
            <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className={`text-[10px] block ${textMuted}`}>Códec</span>
              <span className="text-[11px] font-bold">H.264 / AVC</span>
            </div>
            <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className={`text-[10px] block ${textMuted}`}>Contenedor</span>
              <span className="text-[11px] font-bold">MP4 Universal</span>
            </div>
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/30 transition active:scale-[0.99]"
        >
          Aplicar y Cerrar
        </button>
      </div>
    </div>
  );
};
