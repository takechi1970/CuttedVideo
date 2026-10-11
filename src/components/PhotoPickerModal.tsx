import React, { useState, useRef } from 'react';
import { Video, Upload, Sparkles, X, Check, Clock, Film } from 'lucide-react';
import { generateSampleVideo } from '../utils/sampleVideos';

interface PhotoPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile: (file: File) => void;
}

export const PhotoPickerModal: React.FC<PhotoPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectFile,
}) => {
  const [activeTab, setActiveTab] = useState<'picker' | 'samples'>('picker');
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);
  const [sampleProgress, setSampleProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onSelectFile(e.target.files[0]);
      onClose();
    }
  };

  const handleGenerateSample = async (durationSec: number, title: string) => {
    try {
      setIsGeneratingSample(true);
      setSampleProgress(0);
      const sampleFile = await generateSampleVideo(durationSec, title, (p) => {
        setSampleProgress(p);
      });
      setIsGeneratingSample(false);
      onSelectFile(sampleFile);
      onClose();
    } catch (err) {
      setIsGeneratingSample(false);
      console.error(err);
      alert('Error generando video de muestra: ' + (err as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Android Photo Picker Header */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                Selector de fotos y videos
              </h3>
              <p className="text-xs text-slate-400">Android Photo Picker · MediaStore</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Picker Mode Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-950/60 border-b border-slate-800 mx-4 my-3 rounded-xl text-sm font-medium">
          <button
            onClick={() => setActiveTab('picker')}
            className={`py-2 px-3 rounded-lg transition text-xs sm:text-sm flex items-center justify-center gap-2 ${
              activeTab === 'picker'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            Subir de mi Galería
          </button>
          <button
            onClick={() => setActiveTab('samples')}
            className={`py-2 px-3 rounded-lg transition text-xs sm:text-sm flex items-center justify-center gap-2 ${
              activeTab === 'samples'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Videos de Prueba
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {activeTab === 'picker' ? (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileInput}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-500/40 hover:border-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">
                    Selecciona cualquier video de tu teléfono o PC
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Compatible con MP4, WebM, MOV, 3GP, MKV y videos verticales de smartphone.
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-2 py-2 px-5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20"
                >
                  Explorar Archivos Locales
                </button>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-xs text-slate-400 flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-slate-300 font-medium">Privacidad y Rendimiento Nativo:</span> El procesamiento se realiza 100% de forma local en tu dispositivo mediante Media3 Transformer. Ningún video se envía a servidores externos ni consume datos móviles.
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                ¿No tienes un video a mano? Genera al instante un video vertical animado con audio para probar el recorte, cambio de velocidad y exportación:
              </p>

              {isGeneratingSample ? (
                <div className="bg-slate-800/80 rounded-2xl p-6 border border-indigo-500/30 text-center space-y-3">
                  <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-medium text-slate-200">
                    Sintetizando video de muestra en memoria ({sampleProgress}%)...
                  </p>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full transition-all duration-150"
                      style={{ width: `${sampleProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {/* Sample 1: 35s */}
                  <div
                    onClick={() => handleGenerateSample(35, 'Clip Corto de Prueba')}
                    className="p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-indigo-500/50 rounded-xl cursor-pointer transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        35s
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-200">Video Corto (35 seg)</div>
                        <div className="text-xs text-slate-400">Ideal para probar división rápida en 2 clips de WhatsApp (30s + 5s)</div>
                      </div>
                    </div>
                    <span className="text-xs text-indigo-400 font-medium">Generar</span>
                  </div>

                  {/* Sample 2: 75s */}
                  <div
                    onClick={() => handleGenerateSample(75, 'Reel / Historia Extendida')}
                    className="p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-indigo-500/50 rounded-xl cursor-pointer transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                        75s
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-200">Video Mediano (75 seg - 1m 15s)</div>
                        <div className="text-xs text-slate-400">Produce 3 estados de WhatsApp o 2 historias de Instagram</div>
                      </div>
                    </div>
                    <span className="text-xs text-indigo-400 font-medium">Generar</span>
                  </div>

                  {/* Sample 3: 120s */}
                  <div
                    onClick={() => handleGenerateSample(120, 'Video de Alta Duración')}
                    className="p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-indigo-500/50 rounded-xl cursor-pointer transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                        120s
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-200">Video Largo (2 minutos)</div>
                        <div className="text-xs text-slate-400">Prueba cómo acelerar a 1.5x o 2x reduce el número de clips</div>
                      </div>
                    </div>
                    <span className="text-xs text-indigo-400 font-medium">Generar</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
