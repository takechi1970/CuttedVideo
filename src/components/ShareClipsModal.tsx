import React, { useState } from 'react';
import {
  X,
  Share2,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Sparkles,
  Smartphone,
  ExternalLink,
  Download,
  Play,
  Pause,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SegmentInfo } from '../types';
import { formatBytes, formatDuration } from '../utils/videoProcessor';

interface ShareClipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  segments: SegmentInfo[];
  baseVideoName: string;
}

export const ShareClipsModal: React.FC<ShareClipsModalProps> = ({
  isOpen,
  onClose,
  segments,
  baseVideoName,
}) => {
  const [sharedIndices, setSharedIndices] = useState<Record<number, boolean>>({});
  const [copiedCaptionIndex, setCopiedCaptionIndex] = useState<number | null>(null);
  const [isSharingAll, setIsSharingAll] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const completedSegments = segments
    .filter((s) => s.status === 'completed' && (s.blob || s.blobUrl))
    .sort((a, b) => a.index - b.index);

  const total = completedSegments.length;

  const handleShareAll = async () => {
    setIsSharingAll(true);
    setShareFeedback(null);

    try {
      // Intentar compartir vía Web Share API si está soportado
      const files: File[] = [];
      for (const seg of completedSegments) {
        if (seg.blob) {
          files.push(new File([seg.blob], seg.fileName, { type: 'video/mp4' }));
        } else if (seg.blobUrl) {
          const res = await fetch(seg.blobUrl);
          const b = await res.blob();
          files.push(new File([b], seg.fileName, { type: 'video/mp4' }));
        }
      }

      if (navigator.canShare && navigator.canShare({ files })) {
        await navigator.share({
          files,
          title: `Clips ${baseVideoName}`,
        });

        // Marcar todos como compartidos
        const allShared: Record<number, boolean> = {};
        completedSegments.forEach((s) => (allShared[s.index] = true));
        setSharedIndices(allShared);
        setShareFeedback(`¡Los ${total} clips se compartieron en orden con éxito!`);
      } else {
        // En navegadores de escritorio o sin soporte de compartir múltiples archivos directamente
        setShareFeedback(
          'Tu navegador no soporta enviar múltiples archivos a la vez. Usa los botones individuales a continuación para compartir cada parte en orden correlativo.'
        );
      }
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        setShareFeedback(
          'Usa el envío clip por clip a continuación para enviarlos ordenadamente a tu app preferida.'
        );
      }
    } finally {
      setIsSharingAll(false);
    }
  };

  const handleShareSingle = async (seg: SegmentInfo) => {
    setShareFeedback(null);
    try {
      let file: File | null = null;
      if (seg.blob) {
        file = new File([seg.blob], seg.fileName, { type: 'video/mp4' });
      } else if (seg.blobUrl) {
        const res = await fetch(seg.blobUrl);
        const b = await res.blob();
        file = new File([b], seg.fileName, { type: 'video/mp4' });
      }

      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Clip ${seg.index}`,
        });
        setSharedIndices((prev) => ({ ...prev, [seg.index]: true }));
      } else if (seg.blobUrl) {
        // Fallback: descargar clip con aviso para adjuntar
        const a = document.createElement('a');
        a.href = seg.blobUrl;
        a.download = seg.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setSharedIndices((prev) => ({ ...prev, [seg.index]: true }));
        setShareFeedback(`Clip ${seg.index} descargado listo para adjuntar en WhatsApp/Instagram.`);
      }
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        console.error(err);
      }
    }
  };

  const handleCopyCaption = (index: number) => {
    const text = `Parte ${index}/${total}`;
    navigator.clipboard.writeText(text);
    setCopiedCaptionIndex(index);
    setTimeout(() => setCopiedCaptionIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-emerald-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Compartir Clips en Orden
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                  1 al {total}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Envía tus videos a WhatsApp, Instagram, Telegram o TikTok en la secuencia exacta.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center gap-2.5 text-xs text-indigo-300">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Orden garantizado:</strong> Al compartir en orden (Parte 1 ➔ Parte 2 ➔ ...), tus seguidores verán tu historia o video sin saltos de tiempo.
          </span>
        </div>

        {/* Feedback message if any */}
        {shareFeedback && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{shareFeedback}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Main Action: Share All in Order */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-800/60 to-indigo-950/40 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  Opción 1 · Envío Múltiple
                </span>
                <h4 className="text-sm font-semibold text-slate-100">
                  Compartir todos los clips juntos ({total} partes)
                </h4>
              </div>
              <span className="text-xs font-mono bg-slate-900/80 px-2 py-1 rounded-md text-emerald-300 border border-emerald-500/20">
                1 ➔ {total}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Abre el menú de compartir de Android/sistema con todos los videos adjuntos en orden correlativo.
            </p>
            <button
              onClick={handleShareAll}
              disabled={isSharingAll || total === 0}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition active:scale-[0.98] disabled:opacity-50"
            >
              <Share2 className="w-4 h-4" />
              {isSharingAll ? 'Preparando clips...' : `Compartir ${total} clips en orden`}
            </button>
          </div>

          {/* Secondary Option: Share Step-by-Step */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Opción 2 · Envío Paso a Paso (Recomendado para Estados de WhatsApp)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 px-1">
              Comparte cada clip uno tras otro. El check verde ✓ te recordará cuáles ya enviaste:
            </p>

            <div className="space-y-2 pt-1">
              {completedSegments.map((seg) => {
                const isShared = sharedIndices[seg.index];
                const isCopied = copiedCaptionIndex === seg.index;

                return (
                  <div
                    key={seg.index}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isShared
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition ${
                          isShared
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        {isShared ? <Check className="w-5 h-5 stroke-[3]" /> : `#${seg.index}`}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200">
                            Parte {seg.index} de {total}
                          </span>
                          {isShared && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-medium">
                              Enviado
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate font-mono">
                          {seg.fileName} · {formatDuration(seg.outputDuration)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Copy caption */}
                      <button
                        onClick={() => handleCopyCaption(seg.index)}
                        className={`p-2 rounded-xl text-xs transition border ${
                          isCopied
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200'
                        }`}
                        title="Copiar texto de pie de foto ('Parte X/Y')"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      {/* Share Single */}
                      <button
                        onClick={() => handleShareSingle(seg)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                          isShared
                            ? 'bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/40 border border-emerald-500/30'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                        }`}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{isShared ? 'Reenviar' : `Enviar #${seg.index}`}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {Object.keys(sharedIndices).length} de {total} compartidos
          </span>
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
