import React from 'react';
import { Layers, ShieldCheck, Zap, HardDrive, Cpu, Film, GitBranch } from 'lucide-react';

export const Media3ArchitectureGuide: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              Arquitectura Técnica: AndroidX Media3 Transformer
            </h2>
            <p className="text-xs text-slate-400">
              Pipeline de procesamiento de video acelerado por hardware sin librerías externas pesadas ni servicios en la nube
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Key Technical Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pillar 1: Transformer Engine */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-indigo-400">
            <Zap className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-100">1. Media3 Transformer & Clipping</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            A diferencia de antiguos scripts con MediaMuxer o binarios FFmpeg gigantes, <strong className="text-slate-100">Media3 Transformer</strong> utiliza los códecs acelerados por hardware del chipset del teléfono (MediaCodec + SurfaceTexture en OpenGL ES).
          </p>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
            <div className="text-indigo-400">// Recorte exacto por segmento:</div>
            <div>MediaItem.ClippingConfiguration.Builder()</div>
            <div>&nbsp;&nbsp;.setStartPositionMs(startMs)</div>
            <div>&nbsp;&nbsp;.setEndPositionMs(endMs)</div>
            <div>&nbsp;&nbsp;.build()</div>
          </div>
        </div>

        {/* Pillar 2: Speed & Sonic Audio */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-sky-400">
            <Cpu className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-100">2. Control de Velocidad con Sonic</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Al acelerar a 1,5x o ralentizar a 0,5x, Media3 sincroniza el stream de video y usa <strong className="text-slate-100">SonicAudioProcessor</strong> para reescalar el tiempo del audio manteniendo el tono (pitch) natural de la voz humana sin efecto "ardilla" o distorsión.
          </p>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
            <div className="text-sky-400">// Audio con preservación de tono:</div>
            <div>val sonic = SonicAudioProcessor().apply &#123;</div>
            <div>&nbsp;&nbsp;setSpeed(speed.multiplier)</div>
            <div>&nbsp;&nbsp;setPitch(1.0f) // Preserva tono vocal</div>
            <div>&#125;</div>
          </div>
        </div>

        {/* Pillar 3: Presentation & Resolution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <Film className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-100">3. Escala y Resolución (OpenGL)</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Las reducciones de resolución a 1080p, 720p o 480p se ejecutan mediante <strong className="text-slate-100">Presentation</strong> de <code className="text-emerald-400 font-mono text-[10px]">media3-effect</code> con shaders GL. Conserva la orientación vertical/horizontal original sin estirar el aspecto de imagen.
          </p>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
            <div className="text-emerald-400">// Escala de resolución segura:</div>
            <div>val effect = if (isPortrait) &#123;</div>
            <div>&nbsp;&nbsp;Presentation.createForHeight(1920)</div>
            <div>&#125; else &#123;</div>
            <div>&nbsp;&nbsp;Presentation.createForWidth(1920)</div>
            <div>&#125;</div>
          </div>
        </div>

        {/* Pillar 4: MediaStore & Non-Overwrite */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-400">
            <HardDrive className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-100">4. Almacenamiento MediaStore</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Los videos se guardan en el directorio público <strong className="text-slate-100">Movies/VideoSplit</strong>. Emplea la bandera <code className="text-amber-400 font-mono text-[10px]">IS_PENDING = 1</code> durante la escritura y <code className="text-amber-400 font-mono text-[10px]">IS_PENDING = 0</code> al terminar para evitar que la galería muestre archivos a medio escribir.
          </p>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
            <div className="text-amber-400">// Ubicación pública en Galería:</div>
            <div>put(RELATIVE_PATH, "Movies/VideoSplit")</div>
            <div>put(IS_PENDING, 1) // Oculto hasta terminar</div>
            <div>// Genera nombres secuenciales clip_001.mp4</div>
          </div>
        </div>
      </div>

      {/* Calculation Formula Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-indigo-400" />
          Fórmula de Segmentación y Cambio de Velocidad
        </h3>
        <p className="text-xs text-slate-300">
          La aplicación calcula con precisión el número de segmentos en base a la duración final proyectada tras el cambio de velocidad:
        </p>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 space-y-2">
          <div>1. <span className="text-indigo-400">Duración Final Proyectada</span>: <code className="text-sky-300">T_final = DuracionOriginal / Velocidad</code></div>
          <div>2. <span className="text-indigo-400">Total de Segmentos</span>: <code className="text-sky-300">N = ceil(T_final / LimitePerfilSegundos)</code></div>
          <div>3. <span className="text-indigo-400">Tiempos de Corte en el Video Origen</span>:</div>
          <div className="pl-4 text-slate-400">
            Segmento i: [ Inicio = i * Limite * Velocidad, Fin = Inicio + (DuracionSalida * Velocidad) ]
          </div>
        </div>
      </div>
    </div>
  );
};
