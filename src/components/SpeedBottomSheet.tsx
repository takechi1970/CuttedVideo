import React from 'react';
import { X, Gauge, VolumeX, Volume2, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { formatDuration } from '../utils/videoProcessor';

interface SpeedBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  muteAudio: boolean;
  onMuteChange: (mute: boolean) => void;
  originalDuration: number;
  isDark: boolean;
}

export const SpeedBottomSheet: React.FC<SpeedBottomSheetProps> = ({
  isOpen,
  onClose,
  speed,
  onSpeedChange,
  muteAudio,
  onMuteChange,
  originalDuration,
  isDark,
}) => {
  if (!isOpen) return null;

  const presetRows = [
    [0.5, 0.75, 1.0, 1.25],
    [1.5, 1.7, 2.0],
  ];

  const standardPresets = [0.5, 0.75, 1.0, 1.25, 1.5, 1.7, 2.0];
  const isStandard = standardPresets.some((p) => Math.abs(speed - p) < 0.01);
  const [showCustomSlider, setShowCustomSlider] = React.useState<boolean>(!isStandard);

  const finalDuration = originalDuration > 0 ? originalDuration / speed : 0;
  const timeDiff = Math.abs(finalDuration - originalDuration);

  // Slider step of 0.05 (5 en 5 percent) from 0.25 to 3.00
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onSpeedChange(Math.round(val * 100) / 100);
  };

  const handleSelectPreset = (val: number) => {
    setShowCustomSlider(false);
    onSpeedChange(val);
  };

  const handleSelectCustom = () => {
    setShowCustomSlider(true);
  };

  const bgModal = isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-2xl';
  const bgSubtle = isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-slate-100 border-slate-200';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet panel */}
      <div
        className={`relative w-full rounded-t-3xl border-t p-5 pb-7 transition-transform duration-300 ease-out transform translate-y-0 shadow-2xl z-10 flex flex-col gap-4 max-h-[85%] overflow-y-auto ${bgModal}`}
      >
        {/* Drag handle */}
        <div className="w-12 h-1.5 rounded-full bg-slate-500/40 mx-auto -mt-1 cursor-pointer" onClick={onClose} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center font-bold">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Velocidad de Reproducción</h3>
              <p className={`text-[11px] ${textMuted}`}>Acelera o ralentiza sin distorsionar el tono</p>
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

        {/* Preset speed buttons: 2 rows of 4 buttons */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${textMuted}`}>
              Opciones de Velocidad
            </span>
            <span className="text-xs font-black font-mono text-indigo-500 px-2 py-0.5 rounded-md bg-indigo-500/10">
              {speed.toFixed(speed % 1 === 0 ? 1 : 2)}x
            </span>
          </div>

          {/* Row 1: 0.5x, 0.75x, 1.0x, 1.25x */}
          <div className="grid grid-cols-4 gap-2">
            {[0.5, 0.75, 1.0, 1.25].map((val) => {
              const isSelected = !showCustomSlider && Math.abs(speed - val) < 0.01;
              return (
                <button
                  key={val}
                  onClick={() => handleSelectPreset(val)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition active:scale-95 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : isDark
                      ? 'bg-slate-800/90 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {val.toFixed(val === 1 ? 1 : 2).replace('.00', '')}x
                </button>
              );
            })}
          </div>

          {/* Row 2: 1.5x, 1.7x, 2.0x, Personalizada */}
          <div className="grid grid-cols-4 gap-2">
            {[1.5, 1.7, 2.0].map((val) => {
              const isSelected = !showCustomSlider && Math.abs(speed - val) < 0.01;
              return (
                <button
                  key={val}
                  onClick={() => handleSelectPreset(val)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition active:scale-95 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : isDark
                      ? 'bg-slate-800/90 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {val.toFixed(val === 2 ? 1 : (val === 1.5 || val === 1.7 ? 1 : 2))}x
                </button>
              );
            })}

            {/* Button 4 in Row 2: Personalizada */}
            <button
              onClick={handleSelectCustom}
              className={`py-2.5 px-1 rounded-xl text-xs font-bold transition active:scale-95 truncate ${
                showCustomSlider
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : isDark
                  ? 'bg-slate-800/90 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Personalizada
            </button>
          </div>
        </div>

        {/* Custom speed Slider (shown ONLY when Personalizada is selected) */}
        {showCustomSlider && (
          <div className={`p-3.5 rounded-2xl border ${bgSubtle} space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <span>Slider de Velocidad Libre (de 5 en 5)</span>
              </span>
              <span className="text-xs font-black font-mono text-indigo-500 px-2 py-0.5 rounded-md bg-indigo-500/10">
                {speed.toFixed(2)}x
              </span>
            </div>

            <input
              type="range"
              min="0.25"
              max="3.00"
              step="0.05"
              value={speed}
              onChange={handleSliderChange}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-700/30 rounded-lg"
            />

            <div className={`flex justify-between text-[10px] font-mono ${textMuted}`}>
              <span>0.25x (Lento)</span>
              <span>1.0x (Normal)</span>
              <span>2.0x</span>
              <span>3.0x (Rápido)</span>
            </div>
          </div>
        )}

        {/* Live Duration Comparison Card */}
        <div className={`p-3.5 rounded-2xl border ${bgSubtle} space-y-2`}>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              Comparativa de Duración
            </span>
            <span className={`text-[10px] font-mono ${textMuted}`}>
              {speed === 1
                ? 'Misma duración'
                : speed > 1
                ? `Ahorras ${timeDiff.toFixed(1)}s`
                : `Se expande +${timeDiff.toFixed(1)}s`}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className={`text-[10px] block ${textMuted}`}>Original</span>
              <span className="text-xs font-bold font-mono">
                {formatDuration(originalDuration)} ({originalDuration.toFixed(1)}s)
              </span>
            </div>

            <div className={`p-2 rounded-xl border ${isDark ? 'bg-indigo-950/40 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
              <span className="text-[10px] block text-indigo-500 font-medium">Con {speed.toFixed(2)}x</span>
              <span className="text-xs font-bold font-mono text-indigo-500">
                {formatDuration(finalDuration)} ({finalDuration.toFixed(1)}s)
              </span>
            </div>
          </div>
        </div>

        {/* Audio Mute Checkbox */}
        <label
          className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer select-none transition ${
            muteAudio
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-500'
              : `${bgSubtle} hover:border-slate-600`
          }`}
        >
          <div className="flex items-center gap-2.5">
            {muteAudio ? <VolumeX className="w-4 h-4 text-amber-500" /> : <Volume2 className={`w-4 h-4 ${textMuted}`} />}
            <div>
              <span className="text-xs font-bold block">Silenciar audio en los clips</span>
              <span className={`text-[10px] block ${textMuted}`}>
                {muteAudio ? 'Los clips exportados no contendrán pista de audio' : 'El audio se mantiene con corrección de tono (pitch)'}
              </span>
            </div>
          </div>

          <input
            type="checkbox"
            checked={muteAudio}
            onChange={(e) => onMuteChange(e.target.checked)}
            className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
          />
        </label>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition active:scale-[0.99]"
        >
          Aplicar y Cerrar
        </button>
      </div>
    </div>
  );
};
