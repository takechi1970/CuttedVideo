import React, { useState } from 'react';
import { CheckCircle, Download, Film, FolderCheck, Play, Pause, Archive, Share2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SegmentInfo } from '../types';
import { formatBytes, formatDuration } from '../utils/videoProcessor';
import { downloadClipsZip } from '../utils/zipExporter';
import { ShareClipsModal } from './ShareClipsModal';

interface ResultSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  segments: SegmentInfo[];
  baseVideoName: string;
}

export const ResultSummaryModal: React.FC<ResultSummaryModalProps> = ({
  isOpen,
  onClose,
  segments,
  baseVideoName,
}) => {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Trigger celebration confetti when opened
  React.useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const completedSegments = segments.filter((s) => s.status === 'completed' && s.blobUrl);
  const totalSizeBytes = completedSegments.reduce((acc, s) => acc + (s.fileSizeBytes || s.blob?.size || 0), 0);

  const handleDownloadAllZip = async () => {
    try {
      setIsZipping(true);
      await downloadClipsZip(completedSegments, baseVideoName);
      setIsZipping(false);
    } catch (err) {
      setIsZipping(false);
      console.error(err);
      alert('Error empaquetando clips en ZIP: ' + (err as Error).message);
    }
  };

  const handleDownloadSingle = (seg: SegmentInfo) => {
    if (!seg.blobUrl) return;
    const a = document.createElement('a');
    a.href = seg.blobUrl;
    a.download = seg.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
          {/* Header */}
          <div className="p-6 text-center space-y-2 border-b border-slate-800 bg-gradient-to-b from-indigo-950/40 to-slate-900">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">
              ¡Clips Exportados con Éxito!
            </h3>
            <p className="text-xs text-slate-300 font-medium">
              Se guardaron <span className="font-extrabold text-emerald-400">{completedSegments.length} clips</span> en la Galería de fotos.
            </p>

            <div className="inline-flex items-center gap-2 bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-700 text-xs text-emerald-300 font-mono">
              <FolderCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Galería de fotos</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 p-3 bg-slate-950/70 border-b border-slate-800 text-center divide-x divide-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Clips Creados</span>
              <span className="font-bold text-slate-200 text-sm">{completedSegments.length} partes</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Espacio Total</span>
              <span className="font-bold text-slate-200 text-sm">{formatBytes(totalSizeBytes)}</span>
            </div>
          </div>

          {/* Quick Share Banner */}
          <div className="p-3 bg-gradient-to-r from-emerald-950/40 to-teal-950/30 border-b border-emerald-500/20 flex items-center justify-between px-4">
            <div className="flex items-center gap-2 text-xs text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Comparte en WhatsApp, Instagram o TikTok en orden</span>
            </div>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="py-1 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1 transition"
            >
              <Share2 className="w-3 h-3" />
              Compartir ahora
            </button>
          </div>

          {/* Clips List */}
          <div className="p-5 overflow-y-auto space-y-3">
            {completedSegments.map((seg) => {
              const isPlaying = playingIndex === seg.index;
              return (
                <div
                  key={seg.index}
                  className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 space-y-3 transition hover:border-slate-600"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                        #{seg.index}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200 font-mono">
                          {seg.fileName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Duración: {formatDuration(seg.outputDuration)} · {formatBytes(seg.fileSizeBytes || seg.blob?.size || 0)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPlayingIndex(isPlaying ? null : seg.index)}
                        className={`p-2 rounded-xl text-xs font-medium transition ${
                          isPlaying
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-slate-700/60 hover:bg-slate-700 text-slate-300'
                        }`}
                        title={isPlaying ? 'Pausar vista previa' : 'Reproducir clip'}
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleDownloadSingle(seg)}
                        className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 transition"
                        title="Descargar este clip en MP4"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Video Player Preview */}
                  {isPlaying && seg.blobUrl && (
                    <div className="rounded-xl overflow-hidden bg-black aspect-video relative flex items-center justify-center border border-slate-700 animate-in fade-in">
                      <video
                        src={seg.blobUrl}
                        controls
                        autoPlay
                        playsInline
                        className="max-h-56 w-full object-contain"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-2">
            <button
              onClick={() => setIsShareModalOpen(true)}
              disabled={completedSegments.length === 0}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/40 transition active:scale-[0.98]"
            >
              <Share2 className="w-4 h-4" />
              Compartir clips en orden (1 al {completedSegments.length})
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleDownloadAllZip}
                disabled={isZipping || completedSegments.length === 0}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700/60 transition"
              >
                <Archive className="w-3.5 h-3.5 text-indigo-400" />
                {isZipping ? 'Generando ZIP...' : 'Descargar ZIP'}
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para compartir clips en orden */}
      <ShareClipsModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        segments={completedSegments}
        baseVideoName={baseVideoName}
      />
    </>
  );
};

