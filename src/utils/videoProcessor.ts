import { PlaybackSpeed, OutputResolution, SegmentInfo, VideoMetadata } from '../types';

/**
 * Extracts metadata (duration, width, height, thumbnail, size) from a video File.
 */
export async function extractVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
    };

    video.onloadedmetadata = () => {
      // Seek a little bit in to grab a non-black thumbnail
      const seekTime = Math.min(0.5, Math.max(0.1, video.duration / 4));
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);

        const metadata: VideoMetadata = {
          name: file.name,
          size: file.size,
          duration: video.duration,
          width: video.videoWidth || 1080,
          height: video.videoHeight || 1920,
          mimeType: file.type || 'video/mp4',
          thumbnailUrl,
          fileUrl: URL.createObjectURL(file), // Persistent URL for processing
          file,
        };

        cleanup();
        resolve(metadata);
      } catch (err) {
        cleanup();
        reject(new Error('Error al generar miniatura del video: ' + (err as Error).message));
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('El formato del video no es compatible o el archivo está dañado.'));
    };
  });
}

/**
 * Calculates segments based on:
 * - Original video duration
 * - Speed multiplier (e.g. 1.5x speed makes video 1/1.5 = 0.66x shorter)
 * - Max duration per segment
 */
export function calculateSegments(
  originalDuration: number,
  speed: number,
  maxDurationSeconds: number,
  baseName: string = 'clip'
): { estimatedTotalDuration: number; segments: SegmentInfo[] } {
  if (originalDuration <= 0 || maxDurationSeconds <= 0 || speed <= 0) {
    return { estimatedTotalDuration: 0, segments: [] };
  }

  // Estimated final duration after speed alteration
  const estimatedTotalDuration = originalDuration / speed;
  const numSegments = Math.ceil(estimatedTotalDuration / maxDurationSeconds);
  const segments: SegmentInfo[] = [];

  // Clean base name without extension
  const cleanName = baseName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');

  for (let i = 0; i < numSegments; i++) {
    const outputDuration = Math.min(
      maxDurationSeconds,
      estimatedTotalDuration - i * maxDurationSeconds
    );
    const sourceStartTime = i * maxDurationSeconds * speed;
    const sourceEndTime = Math.min(originalDuration, sourceStartTime + outputDuration * speed);

    const padIndex = (i + 1).toString().padStart(3, '0');
    const fileName = `${cleanName}_${padIndex}.mp4`;

    segments.push({
      index: i + 1,
      fileName,
      sourceStartTime,
      sourceEndTime,
      outputDuration,
      status: 'pending',
      progress: 0,
    });
  }

  return { estimatedTotalDuration, segments };
}

/**
 * Calculates output dimensions based on target resolution setting and original dimensions.
 * Will downscale to target resolution (480p, 720p, 1080p, custom) or preserve original.
 * Never upscales.
 */
export function calculateTargetDimensions(
  origW: number,
  origH: number,
  resolution: OutputResolution,
  customHeight?: number
): { width: number; height: number } {
  if (resolution === 'original') {
    return { width: origW, height: origH };
  }

  let targetMax = 1920;

  switch (resolution) {
    case '1080p':
      targetMax = 1920;
      break;
    case '720p':
      targetMax = 1280;
      break;
    case '480p':
      targetMax = 854;
      break;
    case 'custom':
      targetMax = customHeight && customHeight > 0 ? customHeight : 1080;
      break;
  }

  const majorAxis = Math.max(origW, origH);
  if (majorAxis <= targetMax && resolution !== 'custom') {
    // Original is already smaller than or equal to target, keep original
    return { width: origW, height: origH };
  }

  const scale = targetMax / majorAxis;
  let w = Math.round(origW * scale);
  let h = Math.round(origH * scale);

  // Ensure even dimensions for video codecs (divisible by 2)
  if (w % 2 !== 0) w -= 1;
  if (h % 2 !== 0) h -= 1;

  return { width: Math.max(160, w), height: Math.max(160, h) };
}

/**
 * Format bytes to readable string (e.g. 14.5 MB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Format seconds to mm:ss or hh:mm:ss
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => n.toString().padStart(2, '0');

  if (h > 0) {
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(m)}:${pad(s)}`;
}

export interface ProcessingCallbacks {
  onSegmentStart: (index: number) => void;
  onSegmentProgress: (index: number, progress: number, overallProgress: number) => void;
  onSegmentComplete: (index: number, completedSegment: SegmentInfo) => void;
  onError: (error: string) => void;
}

/**
 * Processes a single video segment using Canvas rendering and MediaRecorder.
 * Preserves video aspect ratio, scales to target resolution, applies playback speed,
 * and records the exact time slice to an independent video file.
 */
export async function processSingleSegment(
  videoSourceUrl: string,
  segment: SegmentInfo,
  speed: number,
  targetWidth: number,
  targetHeight: number,
  signal: AbortSignal,
  onProgress: (percent: number) => void,
  muteAudio: boolean = false
): Promise<{ blob: Blob; url: string; size: number }> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      return reject(new DOMException('Procesamiento cancelado por el usuario', 'AbortError'));
    }

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoSourceUrl;
    video.muted = muteAudio; // Capture audio only if not muted
    video.playbackRate = speed;
    video.preservesPitch = true;

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return reject(new Error('No se pudo inicializar contexto Canvas'));
    }

    let mediaRecorder: MediaRecorder | null = null;
    let animationFrameId: number | null = null;
    let audioContext: AudioContext | null = null;
    let audioSource: MediaElementAudioSourceNode | null = null;
    let audioDestination: MediaStreamAudioDestinationNode | null = null;
    const recordedChunks: Blob[] = [];
    let hasStarted = false;

    const cleanup = () => {
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      video.pause();
      video.src = '';
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(() => {});
      }
    };

    signal.addEventListener('abort', () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        try {
          mediaRecorder.stop();
        } catch {
          // ignore
        }
      }
      cleanup();
      reject(new DOMException('Operación cancelada por el usuario', 'AbortError'));
    });

    // Report initial progress immediately
    onProgress(5);

    const startRecordingAndDrawLoop = async () => {
      if (hasStarted || signal.aborted) return;
      hasStarted = true;
      onProgress(10);

      try {
        // Setup canvas video stream (25 or 30 fps)
        const canvasStream = canvas.captureStream(30);

        // Setup audio stream via Web Audio API if available and not muted
        if (!muteAudio) {
          try {
            const AudioContextClass =
              window.AudioContext ||
              (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            audioContext = new AudioContextClass();
            audioSource = audioContext.createMediaElementSource(video);
            audioDestination = audioContext.createMediaStreamDestination();
            audioSource.connect(audioDestination);
            audioSource.connect(audioContext.destination); // Optional monitor

            const audioTracks = audioDestination.stream.getAudioTracks();
            if (audioTracks.length > 0) {
              canvasStream.addTrack(audioTracks[0]);
            }
          } catch {
            // Audio routing may fail on some browsers due to cross-origin or autoplay restrictions
          }
        }

        // Determine supported recorder mime type
        const preferredTypes = [
          'video/mp4;codecs=avc1',
          'video/mp4',
          'video/webm;codecs=vp9,opus',
          'video/webm;codecs=vp8,opus',
          'video/webm',
        ];
        let chosenMime = 'video/webm';
        for (const mime of preferredTypes) {
          if (MediaRecorder.isTypeSupported(mime)) {
            chosenMime = mime;
            break;
          }
        }

        mediaRecorder = new MediaRecorder(canvasStream, {
          mimeType: chosenMime,
          videoBitsPerSecond: targetWidth > 1280 ? 4_500_000 : 2_500_000,
        });

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          cleanup();
          if (signal.aborted) {
            return reject(new DOMException('Operación cancelada', 'AbortError'));
          }

          const blob = new Blob(recordedChunks, { type: chosenMime });
          const url = URL.createObjectURL(blob);
          resolve({ blob, url, size: blob.size });
        };

        mediaRecorder.onerror = (e) => {
          cleanup();
          reject(new Error('Error de codificación en MediaRecorder: ' + e));
        };

        // Start recording
        mediaRecorder.start(100);

        // Frame rendering loop
        const totalDurationToSlice = Math.max(0.1, segment.sourceEndTime - segment.sourceStartTime);
        const startWallClock = performance.now();
        const expectedWallClockMs = Math.max(100, (totalDurationToSlice / Math.max(0.1, speed)) * 1000);

        const drawLoop = () => {
          if (signal.aborted) return;

          // Draw scaled frame with letterbox/fit
          ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

          const videoElapsed = Math.max(0, video.currentTime - segment.sourceStartTime);
          const videoPercent = (videoElapsed / totalDurationToSlice) * 100;

          const clockElapsed = performance.now() - startWallClock;
          const clockPercent = (clockElapsed / expectedWallClockMs) * 100;

          const currentPercent = Math.min(99, Math.max(10, Math.round(Math.max(videoPercent, clockPercent))));
          onProgress(currentPercent);

          if (video.currentTime >= segment.sourceEndTime || video.ended || clockElapsed >= expectedWallClockMs + 300) {
            onProgress(100);
            if (mediaRecorder && mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
            return;
          }

          animationFrameId = requestAnimationFrame(drawLoop);
        };

        try {
          await video.play();
        } catch {
          // Fallback if browser audio policy requires muting
          video.muted = true;
          try {
            await video.play();
          } catch {
            // Continue loop with clock
          }
        }
        drawLoop();
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onloadedmetadata = () => {
      onProgress(7);
      if (Math.abs(video.currentTime - segment.sourceStartTime) < 0.05) {
        startRecordingAndDrawLoop();
      } else {
        video.currentTime = segment.sourceStartTime;
      }
    };

    video.onseeked = () => {
      if (signal.aborted) return;
      startRecordingAndDrawLoop();
    };

    // Safety timeout in case seeked/metadata takes too long or fails to trigger
    setTimeout(() => {
      if (!hasStarted && !signal.aborted) {
        startRecordingAndDrawLoop();
      }
    }, 600);

    video.onerror = (e) => {
      cleanup();
      reject(new Error('No se pudo decodificar el video: ' + e));
    };
  });
}
