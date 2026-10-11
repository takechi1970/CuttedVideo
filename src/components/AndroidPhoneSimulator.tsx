import React, { useState, useRef, useEffect } from 'react';
import {
  Film,
  Scissors,
  Gauge,
  Sliders,
  Sparkles,
  Play,
  Pause,
  Upload,
  ArrowLeft,
  Volume2,
  VolumeX,
  Layers,
  Clock,
  HardDrive,
  Sun,
  Moon,
  Monitor,
  CheckCircle2,
  ChevronRight,
  Maximize2,
  RotateCcw,
  Share2,
  Download,
  AlertCircle,
  Video,
  Check,
} from 'lucide-react';
import JSZip from 'jszip';
import {
  OutputResolution,
  VideoMetadata,
  SplitProfile,
  SegmentInfo,
  ExportProgressState,
  ThemeMode,
  CutPreset,
  AppPreferences,
} from '../types';
import {
  calculateSegments,
  calculateTargetDimensions,
  formatBytes,
  formatDuration,
  processSingleSegment,
  extractVideoMetadata,
} from '../utils/videoProcessor';
import { generateSampleVideo } from '../utils/sampleVideos';
import { SpeedBottomSheet } from './SpeedBottomSheet';
import { QualityBottomSheet } from './QualityBottomSheet';
import { CutsBottomSheet } from './CutsBottomSheet';

const PREFS_STORAGE_KEY = 'cuttedvideo_user_config_v2';
const SPEED_BACKUP_KEY = 'cuttedvideo_pref_speed';

const DEFAULT_PREFS: AppPreferences = {
  theme: 'auto',
  speed: 1.0,
  muteAudio: false,
  quality: 'original',
  customHeight: 720,
  cutPreset: '30s',
  customCutSeconds: 45,
};

function loadStoredPreferences(): AppPreferences {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const backupSpeed = localStorage.getItem(SPEED_BACKUP_KEY);
    const speed = backupSpeed ? parseFloat(backupSpeed) : (parsed.speed ?? DEFAULT_PREFS.speed);
    return { ...DEFAULT_PREFS, ...parsed, speed: isNaN(speed) ? 1.0 : speed };
  } catch {
    return DEFAULT_PREFS;
  }
}

function saveStoredPreferences(prefs: AppPreferences) {
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
    localStorage.setItem(SPEED_BACKUP_KEY, prefs.speed.toString());
  } catch {
    // ignore
  }
}

interface AndroidPhoneSimulatorProps {
  profiles?: SplitProfile[];
  onSaveProfile?: (profile: SplitProfile) => void;
  onDeleteProfile?: (id: string) => void;
  onResetProfiles?: () => void;
}

export const AndroidPhoneSimulator: React.FC<AndroidPhoneSimulatorProps> = () => {
  // 1. Initial State from Persistence
  const [prefs, setPrefs] = useState<AppPreferences>(loadStoredPreferences);

  // Sync state helpers
  const { theme, speed, muteAudio, quality, customHeight, cutPreset, customCutSeconds } = prefs;

  const updatePref = <K extends keyof AppPreferences>(key: K, value: AppPreferences[K]) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      saveStoredPreferences(next);
      return next;
    });
  };

  // 2. System Theme Detection (Auto / Light / Dark)
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isDark = theme === 'dark' || (theme === 'auto' && systemIsDark);

  // 3. Screen State ('upload' | 'editor' | 'export')
  const [screen, setScreen] = useState<'upload' | 'editor' | 'export'>('upload');
  const [selectedVideo, setSelectedVideo] = useState<VideoMetadata | null>(null);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // 4. Video Player State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isPreviewMuted, setIsPreviewMuted] = useState(false);

  // Active Bottom Sheet Modal in Editor ('speed' | 'quality' | 'cuts' | null)
  const [activeSheet, setActiveSheet] = useState<'speed' | 'quality' | 'cuts' | null>(null);

  // 5. Export & Progress State
  const [exportState, setExportState] = useState<ExportProgressState>({
    isExporting: false,
    currentSegmentIndex: 0,
    totalSegments: 0,
    overallPercent: 0,
    currentSegmentPercent: 0,
    segments: [],
    isCancelled: false,
    isCompleted: false,
    elapsedTimeSeconds: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview playing clip in final results list
  const [playingClipIndex, setPlayingClipIndex] = useState<number | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // 6. Calculations for cuts and duration
  const effectiveCutSeconds =
    cutPreset === '30s'
      ? 30
      : cutPreset === '60s'
      ? 60
      : cutPreset === '90s'
      ? 90
      : Math.max(5, customCutSeconds);

  const { estimatedTotalDuration, segments } = selectedVideo
    ? calculateSegments(selectedVideo.duration, speed, effectiveCutSeconds, selectedVideo.name)
    : { estimatedTotalDuration: 0, segments: [] };

  const targetDims = selectedVideo
    ? calculateTargetDimensions(selectedVideo.width, selectedVideo.height, quality, customHeight)
    : { width: 1080, height: 1920 };

  // 7. Video Player Controls & Speed Synchronization
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.playbackRate = speed;
      videoRef.current.preservesPitch = true;
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Playback policy fallback to muted:', err);
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsPreviewMuted(true);
            videoRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
          }
        });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setVideoCurrentTime(time);
    }
  };

  // Ensure speed is updated live when user changes speed in sheet
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      videoRef.current.preservesPitch = true;
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  }, [speed]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isPreviewMuted || muteAudio;
    }
  }, [isPreviewMuted, muteAudio]);

  // 8. Video Selection Handler (DO NOT reset speed!)
  const handleSelectVideoFile = async (file: File) => {
    try {
      const meta = await extractVideoMetadata(file);
      setSelectedVideo(meta);
      setVideoDuration(meta.duration);
      setVideoCurrentTime(0);
      setIsPlaying(false);
      setScreen('editor');
    } catch (err) {
      console.error(err);
      alert('Error cargando el video: ' + (err as Error).message);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectVideoFile(e.target.files[0]);
    }
  };

  const handleQuickSample = async () => {
    try {
      setIsGeneratingSample(true);
      const sampleFile = await generateSampleVideo(105, 'video_demo');
      setIsGeneratingSample(false);
      handleSelectVideoFile(sampleFile);
    } catch (err) {
      setIsGeneratingSample(false);
      console.error(err);
      alert('Error creando video de muestra: ' + (err as Error).message);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectVideoFile(e.dataTransfer.files[0]);
    }
  };

  // 9. Process & Export Handler (Switches directly to Screen 3 'export')
  const handleStartExport = async () => {
    if (!selectedVideo || segments.length === 0) return;

    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }

    setScreen('export');

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const initialSegments: SegmentInfo[] = segments.map((s) => ({
      ...s,
      status: 'pending',
      progress: 0,
    }));

    setExportState({
      isExporting: true,
      currentSegmentIndex: 1,
      totalSegments: segments.length,
      overallPercent: 0,
      currentSegmentPercent: 2,
      segments: initialSegments,
      isCancelled: false,
      isCompleted: false,
      elapsedTimeSeconds: 0,
    });

    for (let i = 0; i < initialSegments.length; i++) {
      if (signal.aborted) {
        setExportState((prev) => ({ ...prev, isExporting: false, isCancelled: true }));
        return;
      }

      const currentSeg = initialSegments[i];

      setExportState((prev) => {
        const updated = [...prev.segments];
        updated[i] = { ...updated[i], status: 'processing', progress: 5 };
        return {
          ...prev,
          currentSegmentIndex: i + 1,
          currentSegmentPercent: 5,
          segments: updated,
        };
      });

      try {
        const { blob, url, size } = await processSingleSegment(
          selectedVideo.fileUrl,
          currentSeg,
          speed,
          targetDims.width,
          targetDims.height,
          signal,
          (segPercent) => {
            setExportState((prev) => {
              const segFraction = 1 / initialSegments.length;
              const overall = Math.min(
                99,
                Math.round((i * segFraction + (segPercent / 100) * segFraction) * 100)
              );
              return {
                ...prev,
                currentSegmentPercent: Math.max(1, segPercent),
                overallPercent: Math.max(prev.overallPercent, overall),
              };
            });
          },
          muteAudio
        );

        const doneSegment: SegmentInfo = {
          ...currentSeg,
          status: 'completed',
          progress: 100,
          blob,
          blobUrl: url,
          fileSizeBytes: size,
        };

        setExportState((prev) => {
          const updated = [...prev.segments];
          updated[i] = doneSegment;
          return {
            ...prev,
            segments: updated,
            currentSegmentPercent: 100,
            overallPercent: Math.round(((i + 1) / initialSegments.length) * 100),
          };
        });
      } catch (err: unknown) {
        if ((err as Error).name === 'AbortError' || signal.aborted) {
          setExportState((prev) => ({ ...prev, isExporting: false, isCancelled: true }));
          return;
        }

        setExportState((prev) => ({
          ...prev,
          isExporting: false,
          error: `Error procesando clip ${i + 1}: ${(err as Error).message}`,
        }));
        return;
      }
    }

    setExportState((prev) => ({
      ...prev,
      isExporting: false,
      isCompleted: true,
      currentSegmentPercent: 100,
      overallPercent: 100,
    }));
  };

  const handleCancelExport = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setExportState((prev) => ({
      ...prev,
      isExporting: false,
      isCancelled: true,
    }));
    setScreen('editor');
  };

  // 10. Actions for Screen 3: Share All & Download All ZIP
  const completedSegments = exportState.segments.filter(
    (s) => s.status === 'completed' && (s.blob || s.blobUrl)
  );

  const handleDownloadAllZip = async () => {
    if (completedSegments.length === 0) return;
    setIsZipping(true);
    setShareFeedback(null);
    try {
      const zip = new JSZip();
      for (const seg of completedSegments) {
        if (seg.blob) {
          zip.file(seg.fileName, seg.blob);
        } else if (seg.blobUrl) {
          const res = await fetch(seg.blobUrl);
          const b = await res.blob();
          zip.file(seg.fileName, b);
        }
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(zipBlob);
      const base = selectedVideo?.name ? selectedVideo.name.replace(/\.[^/.]+$/, '') : 'video';
      a.download = `${base}_clips.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setShareFeedback(`¡Archivo ${base}_clips.zip descargado con éxito!`);
    } catch (err) {
      console.error(err);
      alert('Error descargando ZIP: ' + (err as Error).message);
    } finally {
      setIsZipping(false);
    }
  };

  const handleShareAllClips = async () => {
    if (completedSegments.length === 0) return;
    setShareFeedback(null);
    try {
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
        // Requirement 6: NO accompanying promotional text message!
        await navigator.share({
          files,
          title: `Clips`,
        });
        setShareFeedback(`¡Los ${completedSegments.length} clips se compartieron con éxito!`);
      } else {
        await handleDownloadAllZip();
      }
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        await handleDownloadAllZip();
      }
    }
  };

  // Color Styles based on isDark
  const themeBg = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const themeCard = isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const themeTextMuted = isDark ? 'text-slate-400' : 'text-slate-600';

  return (
    <div
      className={`relative w-full max-w-[390px] h-[780px] rounded-[48px] p-3 shadow-2xl border-4 transition-colors duration-300 flex flex-col justify-between overflow-hidden select-none ${
        isDark ? 'border-slate-800 bg-slate-950 shadow-indigo-950/40' : 'border-slate-300 bg-slate-100 shadow-slate-300'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Android Status Bar */}
      <div
        className={`px-6 pt-1 pb-1 flex items-center justify-between text-xs font-semibold tracking-wider transition-colors ${themeTextMuted}`}
      >
        <span>10:30</span>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span>5G</span>
          <span>98%</span>
        </div>
      </div>

      {/* ========================================================
          PANTALLA 1: PANTALLA PRINCIPAL (BIENVENIDA & SUBIR VIDEO)
          Requisito 1: Elimina el icono de la tijera y el titulo CuttedVideo
          ======================================================== */}
      {screen === 'upload' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="flex-1 flex flex-col justify-between p-5 overflow-hidden animate-in fade-in duration-300 relative"
        >
          {/* Top Bar: Solo el Selector superior derecho: "Auto", "Claro", "Oscuro" con iconos */}
          <div className="flex items-center justify-end pt-1">
            <div
              className={`p-1 rounded-xl border flex items-center text-[10px] font-bold transition ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              {(
                [
                  { id: 'auto', label: 'Auto', icon: Monitor },
                  { id: 'light', label: 'Claro', icon: Sun },
                  { id: 'dark', label: 'Oscuro', icon: Moon },
                ] as const
              ).map((m) => {
                const isActive = theme === m.id;
                const IconComp = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => updatePref('theme', m.id)}
                    className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : isDark
                        ? 'text-slate-400 hover:text-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <IconComp className="w-3 h-3" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hero: Sin tijeras ni CuttedVideo */}
          <div className="flex flex-col items-center text-center my-auto space-y-4">
            <div className="w-16 h-16 rounded-[22px] p-[2px] bg-gradient-to-tr from-indigo-500 via-sky-400 to-emerald-400 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[20px] flex items-center justify-center">
                <Film className="w-8 h-8 text-indigo-400" />
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-black tracking-tight">
                Corta tus Videos al Segundo
              </h1>
              <p className={`text-xs max-w-[260px] mx-auto ${themeTextMuted}`}>
                Divide clips perfectos para WhatsApp, Instagram Reels y TikTok sin perder calidad.
              </p>
            </div>

            {/* Clear Concise Instructions */}
            <div
              className={`w-full max-w-[320px] rounded-2xl border p-3.5 text-left text-xs space-y-2 ${themeCard}`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-500 flex items-center justify-center font-bold text-[11px]">
                  1
                </span>
                <span className="text-xs">Sube tu video (MP4, MOV o WebM)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-500 flex items-center justify-center font-bold text-[11px]">
                  2
                </span>
                <span className="text-xs">Ajusta velocidad, calidad y duración</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-500 flex items-center justify-center font-bold text-[11px]">
                  3
                </span>
                <span className="text-xs">Exporta y comparte en tu galería</span>
              </div>
            </div>
          </div>

          {/* Bottom Actions: Upload Button & Quick Sample Demo */}
          <div className="space-y-2.5 pb-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2.5 shadow-xl transition-all duration-200 active:scale-[0.98] ${
                isDraggingFile
                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{isDraggingFile ? '¡Suelta tu video aquí!' : 'Subir Archivo de Video'}</span>
            </button>

            <button
              onClick={handleQuickSample}
              disabled={isGeneratingSample}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition active:scale-[0.99] ${
                isDark
                  ? 'border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                {isGeneratingSample ? 'Creando demo...' : 'O probar con video de muestra rápido'}
              </span>
            </button>

            {/* Android Navigation Bar Pill */}
            <div className="pt-2">
              <div className="w-28 h-1 bg-slate-500/30 rounded-full mx-auto" />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PANTALLA 2: PANTALLA DE EDICIÓN & CORTES (VIDEO + MENÚ INFERIOR)
          Requisito 2: El video se reproduce a la velocidad elegida
          Requisito 3: Se guarda la configuración de velocidad
          ======================================================== */}
      {screen === 'editor' && selectedVideo && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden relative animate-in fade-in duration-300">
          {/* Top Bar: Botón 'Cambiar Video' a la izquierda y 'Cortar y Procesar' a la derecha */}
          <div
            className={`px-3.5 py-2.5 border-b flex items-center justify-between z-30 ${
              isDark ? 'bg-slate-950/95 border-slate-800/80' : 'bg-white/95 border-slate-200 shadow-sm'
            }`}
          >
            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.pause();
                setIsPlaying(false);
                setScreen('upload');
              }}
              className={`flex items-center gap-1.5 text-xs font-bold transition px-3 py-1.5 rounded-xl border active:scale-95 shadow-sm ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
              }`}
              title="Volver a la pantalla principal para elegir otro video"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
              <span>Cambiar Video</span>
            </button>

            <button
              onClick={handleStartExport}
              className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-extrabold text-[11px] flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition active:scale-95"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Cortar y Procesar</span>
            </button>
          </div>

          {/* Video Player with Audio, Controls & Playback Speed */}
          <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-start overflow-hidden">
            <div
              className={`relative w-full aspect-video bg-black rounded-2xl overflow-hidden border shadow-lg flex items-center justify-center group ${
                isDark ? 'border-slate-800' : 'border-slate-300'
              }`}
            >
              <video
                ref={videoRef}
                src={selectedVideo.fileUrl}
                playsInline
                autoPlay
                loop
                onClick={togglePlay}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setVideoDuration(videoRef.current.duration || selectedVideo.duration);
                    videoRef.current.playbackRate = speed;
                    videoRef.current.preservesPitch = true;
                    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {
                      if (videoRef.current) {
                        videoRef.current.muted = true;
                        setIsPreviewMuted(true);
                        videoRef.current.playbackRate = speed;
                        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
                      }
                    });
                  }
                }}
                onCanPlay={() => {
                  if (videoRef.current) {
                    videoRef.current.playbackRate = speed;
                    videoRef.current.preservesPitch = true;
                    if (videoRef.current.paused) {
                      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {
                        if (videoRef.current) {
                          videoRef.current.muted = true;
                          setIsPreviewMuted(true);
                          videoRef.current.playbackRate = speed;
                          videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
                        }
                      });
                    }
                  }
                }}
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setVideoCurrentTime(videoRef.current.currentTime);
                  }
                }}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-full object-contain cursor-pointer"
              />

              {/* Center Play/Pause button overlay */}
              <button
                onClick={togglePlay}
                className={`absolute inset-0 flex items-center justify-center bg-black/25 transition-opacity ${
                  isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-950/80 backdrop-blur border border-white/20 text-white flex items-center justify-center shadow-xl hover:scale-110 transition">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </div>
              </button>

              {/* Bottom Scrubber Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col gap-1 z-10">
                <input
                  type="range"
                  min="0"
                  max={videoDuration || 1}
                  step="0.1"
                  value={videoCurrentTime}
                  onChange={handleSeek}
                  className="w-full h-1 accent-indigo-500 cursor-pointer bg-white/20 rounded-lg"
                />

                <div className="flex items-center justify-between text-[10px] text-white/90 font-mono">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={togglePlay}
                      className="p-0.5 hover:text-indigo-400 transition"
                    >
                      {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </button>
                    <span>{formatDuration(videoCurrentTime)}</span>
                    <span className="text-white/40">/</span>
                    <span>{formatDuration(videoDuration)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-indigo-500/80 text-white px-1.5 py-0.2 rounded font-mono font-bold">
                      {speed}x
                    </span>
                    <button
                      onClick={() => setIsPreviewMuted(!isPreviewMuted)}
                      className="p-0.5 hover:text-indigo-400 transition"
                    >
                      {isPreviewMuted || muteAudio ? (
                        <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Metadata Pills */}
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className={`p-1.5 rounded-xl border ${themeCard}`}>
                <span className={`text-[9px] block ${themeTextMuted}`}>Duración</span>
                <span className="text-[11px] font-bold font-mono">
                  {selectedVideo.duration.toFixed(1)}s
                </span>
              </div>
              <div className={`p-1.5 rounded-xl border ${themeCard}`}>
                <span className={`text-[9px] block ${themeTextMuted}`}>Resolución</span>
                <span className="text-[11px] font-bold font-mono">
                  {selectedVideo.width}×{selectedVideo.height}
                </span>
              </div>
              <div className={`p-1.5 rounded-xl border ${themeCard}`}>
                <span className={`text-[9px] block ${themeTextMuted}`}>Tamaño</span>
                <span className="text-[11px] font-bold font-mono">
                  {formatBytes(selectedVideo.size)}
                </span>
              </div>
              <div className={`p-1.5 rounded-xl border ${themeCard}`}>
                <span className={`text-[9px] block ${themeTextMuted}`}>Clips</span>
                <span className="text-[11px] font-black font-mono text-emerald-500">
                  {segments.length}
                </span>
              </div>
            </div>

            {/* Timeline Visual & Summary Cards */}
            <div className={`p-2.5 rounded-2xl border space-y-1.5 ${themeCard}`}>
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Esquema de Clips ({segments.length} partes)</span>
                </span>
                <span className={`text-[10px] font-mono ${themeTextMuted}`}>
                  {effectiveCutSeconds}s máx
                </span>
              </div>

              {/* Segment Bars Preview */}
              <div className="flex items-center gap-1 w-full h-3 rounded-lg overflow-hidden bg-slate-800/40 p-0.5">
                {segments.map((seg, idx) => (
                  <div
                    key={idx}
                    className="h-full rounded-sm bg-gradient-to-r from-indigo-500 to-sky-400 flex-1 hover:brightness-125 transition"
                    title={`Clip ${seg.index}: ${seg.outputDuration.toFixed(1)}s`}
                  />
                ))}
              </div>

              {/* Explanation of Clips breakdown */}
              <div className="text-[10px] font-medium text-slate-400 flex items-center justify-between pt-0.5">
                <span>
                  Total: <strong className="text-indigo-400">{segments.length} clips</strong>
                  {segments.length > 1 && (
                    <span className="text-[9px] text-slate-500 ml-1">
                      ({segments.length - 1} de {effectiveCutSeconds}s + 1 de{' '}
                      {segments[segments.length - 1]?.outputDuration.toFixed(1)}s)
                    </span>
                  )}
                </span>
                <span className="font-mono text-[9px] text-emerald-400">
                  {estimatedTotalDuration.toFixed(1)}s final a {speed}x
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Bar: 3 Main Editing Modals */}
          <div
            className={`p-2.5 border-t flex items-center justify-around z-20 ${
              isDark ? 'bg-slate-950/95 border-slate-800/80' : 'bg-white/95 border-slate-200'
            }`}
          >
            {/* Velocidad */}
            <button
              onClick={() => setActiveSheet('speed')}
              className={`flex-1 py-2 px-1 flex flex-col items-center gap-1 rounded-xl transition ${
                activeSheet === 'speed'
                  ? 'bg-indigo-600/15 text-indigo-400'
                  : themeTextMuted + ' hover:text-indigo-400'
              }`}
            >
              <Gauge className="w-4 h-4" />
              <span className="text-[10px] font-bold">Velocidad ({speed}x)</span>
            </button>

            {/* Calidad */}
            <button
              onClick={() => setActiveSheet('quality')}
              className={`flex-1 py-2 px-1 flex flex-col items-center gap-1 rounded-xl transition ${
                activeSheet === 'quality'
                  ? 'bg-indigo-600/15 text-indigo-400'
                  : themeTextMuted + ' hover:text-indigo-400'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span className="text-[10px] font-bold">
                Calidad ({quality === 'custom' ? `${customHeight}p` : quality})
              </span>
            </button>

            {/* Cortes */}
            <button
              onClick={() => setActiveSheet('cuts')}
              className={`flex-1 py-2 px-1 flex flex-col items-center gap-1 rounded-xl transition ${
                activeSheet === 'cuts'
                  ? 'bg-indigo-600/15 text-indigo-400'
                  : themeTextMuted + ' hover:text-indigo-400'
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span className="text-[10px] font-bold">Cortes ({effectiveCutSeconds}s)</span>
            </button>
          </div>

          {/* Modal 1: Velocidad */}
          <SpeedBottomSheet
            isOpen={activeSheet === 'speed'}
            onClose={() => setActiveSheet(null)}
            speed={speed}
            onSpeedChange={(val) => updatePref('speed', val)}
            muteAudio={muteAudio}
            onMuteChange={(val) => updatePref('muteAudio', val)}
            originalDuration={selectedVideo.duration}
            isDark={isDark}
          />

          {/* Modal 2: Calidad */}
          <QualityBottomSheet
            isOpen={activeSheet === 'quality'}
            onClose={() => setActiveSheet(null)}
            resolution={quality}
            onResolutionChange={(val) => updatePref('quality', val)}
            customHeight={customHeight}
            onCustomHeightChange={(val) => updatePref('customHeight', val)}
            originalWidth={selectedVideo.width}
            originalHeight={selectedVideo.height}
            isDark={isDark}
          />

          {/* Modal 3: Cortes */}
          <CutsBottomSheet
            isOpen={activeSheet === 'cuts'}
            onClose={() => setActiveSheet(null)}
            cutPreset={cutPreset}
            onCutPresetChange={(val) => updatePref('cutPreset', val)}
            customSeconds={customCutSeconds}
            onCustomSecondsChange={(val) => updatePref('customCutSeconds', val)}
            effectiveCutSeconds={effectiveCutSeconds}
            segments={segments}
            totalEffectiveDuration={estimatedTotalDuration}
            isDark={isDark}
          />
        </div>
      )}

      {/* ========================================================
          PANTALLA 3: ÚLTIMA PANTALLA (PROCESAMIENTO & RESULTADO FINAL)
          Requisito 4: Dos porcentajes (el del clip actual y el total global)
          Requisito 5: Una sola última pantalla continua con toda la info
          Requisito 6: Sin mensaje de texto que acompañe cada clip exportado
          ======================================================== */}
      {screen === 'export' && selectedVideo && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden relative animate-in fade-in duration-300">
          {/* Top Bar de la Pantalla 3 */}
          <div
            className={`px-3.5 py-2.5 border-b flex items-center justify-between z-30 ${
              isDark ? 'bg-slate-950/95 border-slate-800/80' : 'bg-white/95 border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  exportState.isCompleted
                    ? 'bg-emerald-400'
                    : exportState.isExporting
                    ? 'bg-indigo-500 animate-pulse'
                    : 'bg-amber-400'
                }`}
              />
              <span className="font-bold text-xs">
                {exportState.isCompleted
                  ? 'Clips Listos en Galería'
                  : exportState.isExporting
                  ? 'Procesando Clips...'
                  : 'Exportación Detenida'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {exportState.isExporting ? (
                <button
                  onClick={handleCancelExport}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition"
                >
                  Cancelar
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedVideo(null);
                    setScreen('upload');
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-indigo-400 hover:bg-indigo-500/10 border border-indigo-500/20 transition"
                >
                  Nuevo Video
                </button>
              )}
            </div>
          </div>

          {/* Contenido Principal de la Pantalla 3 (Con Scroll si es necesario) */}
          <div className="flex-1 p-3.5 space-y-3 overflow-y-auto">
            {/* ESTADO A: DURANTE EL PROCESAMIENTO */}
            {exportState.isExporting && (
              <div className="space-y-3 animate-in fade-in">
                {/* 1. Indicador del Clip Actual (% y Barra) */}
                <div className={`p-3.5 rounded-2xl border ${themeCard} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5" />
                      Clip {exportState.currentSegmentIndex} de {exportState.totalSegments}
                    </span>
                    <span className="text-base font-black font-mono text-indigo-400">
                      {exportState.currentSegmentPercent}%
                    </span>
                  </div>

                  {/* Barra de progreso del clip actual */}
                  <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden p-0.5">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-sky-400 h-full rounded-full transition-all duration-150"
                      style={{ width: `${exportState.currentSegmentPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Procesando fotogramas continuos</span>
                    <span>{effectiveCutSeconds}s máx</span>
                  </div>
                </div>

                {/* 2. Indicador del Total Global (% y Barra) */}
                <div className={`p-3.5 rounded-2xl border ${themeCard} space-y-2 bg-gradient-to-br from-indigo-950/20 to-emerald-950/20`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold block text-emerald-400">
                        Progreso Total Global
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Guardando en Galería de fotos
                      </span>
                    </div>
                    <span className="text-xl font-black font-mono text-emerald-400">
                      {exportState.overallPercent}%
                    </span>
                  </div>

                  {/* Barra de progreso global */}
                  <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden p-0.5">
                    <div
                      className="bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${exportState.overallPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>
                      Completados: {exportState.segments.filter((s) => s.status === 'completed').length} / {exportState.totalSegments}
                    </span>
                    <span className="text-emerald-400 font-semibold animate-pulse">
                      Guardando en Galería
                    </span>
                  </div>
                </div>

                {/* Resumen de Ajustes Aplicados */}
                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                  <div className={`p-2 rounded-xl border ${themeCard}`}>
                    <span className="text-slate-400 block text-[9px]">Velocidad</span>
                    <span className="font-bold font-mono text-indigo-400">{speed}x</span>
                  </div>
                  <div className={`p-2 rounded-xl border ${themeCard}`}>
                    <span className="text-slate-400 block text-[9px]">Resolución</span>
                    <span className="font-bold font-mono text-sky-400">
                      {targetDims.width}×{targetDims.height}
                    </span>
                  </div>
                  <div className={`p-2 rounded-xl border ${themeCard}`}>
                    <span className="text-slate-400 block text-[9px]">Por Clip</span>
                    <span className="font-bold font-mono text-emerald-400">{effectiveCutSeconds}s</span>
                  </div>
                </div>

                {/* Lista de Clips en Proceso */}
                <div className="space-y-1.5 pt-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${themeTextMuted}`}>
                    Secuencia de Clips
                  </span>
                  <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
                    {exportState.segments.map((seg) => (
                      <div
                        key={seg.index}
                        className={`p-2 rounded-xl border flex items-center justify-between text-[11px] ${
                          seg.status === 'completed'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : seg.status === 'processing'
                            ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-200'
                            : 'bg-slate-900/40 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {seg.status === 'completed' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : seg.status === 'processing' ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                          )}
                          <span className="font-semibold">Clip #{seg.index}</span>
                        </div>
                        <span className="font-mono text-[10px]">
                          {seg.status === 'completed'
                            ? `${seg.outputDuration.toFixed(1)}s (Listo)`
                            : seg.status === 'processing'
                            ? `${exportState.currentSegmentPercent}%`
                            : `${seg.outputDuration.toFixed(1)}s (Pendiente)`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ESTADO B: RESULTADO FINAL (EN LA MISMA PANTALLA) */}
            {exportState.isCompleted && (
              <div className="space-y-3.5 animate-in fade-in">
                {/* Hero de Éxito */}
                <div className={`p-4 rounded-3xl border text-center space-y-2 bg-gradient-to-b from-emerald-950/30 to-slate-900/60 ${themeCard}`}>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/15">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-emerald-400">
                      ¡Se guardaron {completedSegments.length} clips en la Galería de fotos!
                    </h2>
                    <p className={`text-[11px] ${themeTextMuted} mt-0.5`}>
                      Tus clips están ordenados correlativamente y listos para publicar en redes.
                    </p>
                  </div>
                </div>

                {/* Feedback Toast si se compartió */}
                {shareFeedback && (
                  <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-xs text-indigo-300 text-center font-medium animate-in fade-in">
                    {shareFeedback}
                  </div>
                )}

                {/* Botón Principal: Compartir Todos los Clips (Sin mensaje de texto) */}
                <div className="space-y-2">
                  <button
                    onClick={handleShareAllClips}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:brightness-110 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition active:scale-[0.98]"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Compartir todos los clips</span>
                  </button>

                  <button
                    onClick={handleDownloadAllZip}
                    disabled={isZipping}
                    className={`w-full py-2.5 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.99] ${
                      isDark
                        ? 'border-slate-800 bg-slate-900/80 text-slate-200 hover:bg-slate-800'
                        : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{isZipping ? 'Empaquetando ZIP...' : 'Descargar todos (ZIP)'}</span>
                  </button>
                </div>

                {/* Desglose Detallado de Cada Clip con Duración y Reproducción */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span>Duración de cada Clip</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {completedSegments.length} archivos MP4
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[175px] overflow-y-auto pr-1">
                    {completedSegments.map((seg) => {
                      const isPlayingThis = playingClipIndex === seg.index;
                      return (
                        <div
                          key={seg.index}
                          className={`p-2.5 rounded-xl border flex flex-col gap-2 transition ${themeCard}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center">
                                {seg.index}
                              </span>
                              <div className="text-left">
                                <span className="text-xs font-bold block">{seg.fileName}</span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  Duración: <strong className="text-emerald-400">{seg.outputDuration.toFixed(1)}s</strong> · {formatBytes(seg.fileSizeBytes || 0)}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => setPlayingClipIndex(isPlayingThis ? null : seg.index)}
                              className={`p-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                                isPlayingThis
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/25'
                              }`}
                            >
                              {isPlayingThis ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                              <span>{isPlayingThis ? 'Pausa' : 'Ver'}</span>
                            </button>
                          </div>

                          {/* Mini Reproductor Inline si se pulsa "Ver" */}
                          {isPlayingThis && (seg.blobUrl || seg.blob) && (
                            <div className="w-full aspect-video rounded-lg overflow-hidden bg-black mt-1">
                              <video
                                src={seg.blobUrl || (seg.blob ? URL.createObjectURL(seg.blob) : undefined)}
                                controls
                                autoPlay
                                playsInline
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tarjetas de Información Relevante */}
                <div className={`p-3 rounded-2xl border space-y-1.5 text-xs ${themeCard}`}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Ruta de guardado:</span>
                    <span className="font-semibold text-emerald-400">Galería &gt; Películas / CuttedVideo</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Velocidad aplicada:</span>
                    <span className="font-mono font-bold">{speed}x</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Resolución:</span>
                    <span className="font-mono font-bold">{targetDims.width}×{targetDims.height}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Sincronización de audio:</span>
                    <span className="font-semibold text-emerald-400">100% continua</span>
                  </div>
                </div>

                {/* Botón para volver a editar */}
                <button
                  onClick={() => setScreen('editor')}
                  className="w-full py-2 text-center text-xs text-slate-400 hover:text-slate-200 transition"
                >
                  Volver al Editor de video
                </button>
              </div>
            )}

            {/* ESTADO C: ERROR O CANCELADO */}
            {exportState.isCancelled && !exportState.isCompleted && (
              <div className={`p-4 rounded-2xl border text-center space-y-3 ${themeCard}`}>
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <div>
                  <h3 className="text-sm font-bold">Exportación Cancelada</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Puedes regresar al editor o volver a iniciar el proceso cuando desees.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setScreen('editor')}
                    className="flex-1 py-2 rounded-xl border border-slate-700 text-xs font-semibold"
                  >
                    Volver al Editor
                  </button>
                  <button
                    onClick={handleStartExport}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Android Navigation Bar Pill */}
          <div className="p-2 border-t border-slate-800/40">
            <div className="w-28 h-1 bg-slate-500/30 rounded-full mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
};
