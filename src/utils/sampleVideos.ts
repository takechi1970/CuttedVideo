import { VideoMetadata } from '../types';

/**
 * Creates an animated video blob directly in the browser with real audio
 * to allow testing the video splitter instantly.
 */
export async function generateSampleVideo(
  durationSeconds: number = 30,
  title: string = 'Video de Muestra',
  onProgress?: (percent: number) => void
): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920; // 9:16 vertical smartphone format
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo inicializar Canvas 2D');

  const fps = 25;
  const totalFrames = Math.floor(durationSeconds * fps);
  const stream = canvas.captureStream(fps);

  // Audio setup for realistic audio tone sync
  let audioContext: AudioContext | null = null;
  let dest: MediaStreamAudioDestinationNode | null = null;
  let oscillator: OscillatorNode | null = null;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioContext = new AudioContextClass();
    dest = audioContext.createMediaStreamDestination();

    oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(220, audioContext.currentTime);

    // Subtle gain modulation so it sounds like ambient tech rhythm
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(dest);
    oscillator.start();

    // Add audio track to stream
    const audioTrack = dest.stream.getAudioTracks()[0];
    if (audioTrack) {
      stream.addTrack(audioTrack);
    }
  } catch {
    // Audio optional if WebAudio is restricted
  }

  // Determine supported mime type
  const mimeTypes = [
    'video/mp4;codecs=avc1',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  let chosenMime = 'video/webm';
  for (const m of mimeTypes) {
    if (MediaRecorder.isTypeSupported(m)) {
      chosenMime = m;
      break;
    }
  }

  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(stream, {
    mimeType: chosenMime,
    videoBitsPerSecond: 3_000_000,
  });

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const recordingPromise = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: chosenMime }));
    recorder.onerror = (e) => reject(e);
  });

  recorder.start();

  // Render frames sequentially
  const startTime = Date.now();
  for (let frame = 0; frame < totalFrames; frame++) {
    const currentTimeSec = frame / fps;
    const progress = frame / totalFrames;

    // Draw frame background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    const hue1 = (frame * 1.5) % 360;
    const hue2 = (hue1 + 60) % 360;
    grad.addColorStop(0, `hsl(${hue1}, 75%, 18%)`);
    grad.addColorStop(1, `hsl(${hue2}, 85%, 8%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw animated grid elements
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    for (let x = 0; x < canvas.width; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Floating pulsing orb
    const orbY = canvas.height * 0.35 + Math.sin(frame * 0.1) * 60;
    const orbGrad = ctx.createRadialGradient(
      canvas.width / 2,
      orbY,
      20,
      canvas.width / 2,
      orbY,
      240
    );
    orbGrad.addColorStop(0, `hsla(${hue1}, 95%, 65%, 0.9)`);
    orbGrad.addColorStop(1, `hsla(${hue1}, 95%, 65%, 0)`);
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, orbY, 240, 0, Math.PI * 2);
    ctx.fill();

    // App Branding Badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.roundRect(canvas.width / 2 - 220, 160, 440, 70, 35);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CuttedVideo Android', canvas.width / 2, 206);

    // Title
    ctx.font = 'bold 56px sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(title, canvas.width / 2, canvas.height * 0.48);

    // Big Countdown / Current Second Display
    const remaining = Math.max(0, durationSeconds - currentTimeSec).toFixed(1);
    ctx.font = 'bold 120px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${currentTimeSec.toFixed(1)}s`, canvas.width / 2, canvas.height * 0.6);

    ctx.font = '28px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Tiempo total: ${durationSeconds}s · Restante: ${remaining}s`, canvas.width / 2, canvas.height * 0.65);

    // Progress Bar at bottom
    const barWidth = 840;
    const barX = (canvas.width - barWidth) / 2;
    const barY = canvas.height * 0.75;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, 24, 12);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth * progress, 24, 12);
    ctx.fill();

    // Segment Markers to visualize cuts
    const segmentDuration = 30; // e.g. 30s markers
    const totalSegments = Math.ceil(durationSeconds / segmentDuration);
    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(
      `Resolución: 1080x1920 (9:16) · Segmentos teóricos @30s: ${totalSegments}`,
      canvas.width / 2,
      canvas.height * 0.82
    );

    if (onProgress && frame % 10 === 0) {
      onProgress(Math.round((frame / totalFrames) * 100));
    }

    // Small delay to allow recorder to capture frame cleanly
    await new Promise((r) => setTimeout(r, 1000 / (fps * 2)));
  }

  recorder.stop();
  if (oscillator) {
    try {
      oscillator.stop();
    } catch {
      // ignore
    }
  }
  if (audioContext) {
    try {
      await audioContext.close();
    } catch {
      // ignore
    }
  }

  const recordedBlob = await recordingPromise;
  const fileName = `muestra_video_${durationSeconds}s.mp4`;
  return new File([recordedBlob], fileName, { type: chosenMime });
}
