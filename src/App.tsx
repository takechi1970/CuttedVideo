import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Code2,
  BookOpen,
  Scissors,
  Download,
  Github,
  CheckCircle,
  Sparkles,
  ExternalLink,
  Layers,
  Film,
  HardDrive,
  HelpCircle,
} from 'lucide-react';
import { AndroidPhoneSimulator } from './components/AndroidPhoneSimulator';
import { AndroidCodeViewer } from './components/AndroidCodeViewer';
import { Media3ArchitectureGuide } from './components/Media3ArchitectureGuide';
import { ApkGuideModal } from './components/ApkGuideModal';
import { AppLogo } from './components/AppLogo';
import { INITIAL_PROFILES } from './data/defaultProfiles';
import { SplitProfile } from './types';
import { downloadAndroidProjectZip } from './utils/zipExporter';

type ActiveTab = 'simulator' | 'code' | 'architecture';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('simulator');
  const [isApkGuideOpen, setIsApkGuideOpen] = useState(false);
  const [profiles, setProfiles] = useState<SplitProfile[]>(() => {
    try {
      const saved = localStorage.getItem('cuttedvideo_profiles');
      return saved ? JSON.parse(saved) : INITIAL_PROFILES;
    } catch {
      return INITIAL_PROFILES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cuttedvideo_profiles', JSON.stringify(profiles));
    } catch {
      // ignore
    }
  }, [profiles]);

  const handleSaveProfile = (updatedProfile: SplitProfile) => {
    setProfiles((prev) => {
      const idx = prev.findIndex((p) => p.id === updatedProfile.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = updatedProfile;
        return next;
      }
      return [...prev, updatedProfile];
    });
  };

  const handleDeleteProfile = (id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
  };

  const handleResetProfiles = () => {
    setProfiles(INITIAL_PROFILES);
  };

  const [isDownloadingAndroidZip, setIsDownloadingAndroidZip] = useState(false);

  const handleDownloadFullZip = async () => {
    try {
      setIsDownloadingAndroidZip(true);
      await downloadAndroidProjectZip();
      setTimeout(() => setIsDownloadingAndroidZip(false), 2000);
    } catch (e) {
      setIsDownloadingAndroidZip(false);
      console.error(e);
      alert('Error generando .zip: ' + (e as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Application Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <AppLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-tight text-white">CuttedVideo</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Android Nativo
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Jetpack Compose · Material 3 · AndroidX Media3 Transformer
              </p>
            </div>
          </div>

          {/* Navigation Segmented Tabs */}
          <nav className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'simulator'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Simulador</span> Android
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'code'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span className="hidden sm:inline">Código Fuente</span> Kotlin
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'architecture'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Guía</span> Media3
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsApkGuideOpen(true)}
              className="py-2 px-2.5 sm:px-3 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              title="Ver guía para generar el APK e instalarlo en tu móvil"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Guía APK</span>
            </button>

            <button
              onClick={handleDownloadFullZip}
              disabled={isDownloadingAndroidZip}
              className="py-2 px-3 sm:px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition active:scale-95"
              title="Descargar archivo .zip con el proyecto completo Kotlin para Android Studio"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloadingAndroidZip ? 'Generando .ZIP...' : 'Descargar .ZIP'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Context, Features & Technical Highlights */}
            <div className="lg:col-span-6 space-y-6">
              {/* Prominent Direct ZIP Download Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-900/60 border-2 border-indigo-500/40 shadow-xl space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        Código Fuente Nativo Android (.ZIP)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-300">
                      Proyecto completo para Android Studio con <code className="text-indigo-300 font-mono">VideoTransformerEngine.kt</code>, MediaStore, y Jetpack Compose.
                    </p>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    onClick={handleDownloadFullZip}
                    disabled={isDownloadingAndroidZip}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span>
                      {isDownloadingAndroidZip
                        ? 'Generando y descargando archivo .ZIP...'
                        : 'Descargar Código Fuente Android (.ZIP)'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Solución 100% Nativa sin Servidores ni IA de Pago</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  Divide videos para WhatsApp, Reels y Redes Sociales a tu medida.
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Prueba la aplicación directamente en este simulador interactivo de alta fidelidad o examina el código fuente nativo de Android en Kotlin con Jetpack Compose y AndroidX Media3 Transformer.
                </p>
              </div>

              {/* Feature Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    ⚡
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">Velocidad 0,5x a 2x</h3>
                  <p className="text-xs text-slate-400">
                    Calcula los segmentos en base a la duración final acelerada y preserva el tono de voz mediante <code className="text-indigo-300 font-mono">SonicAudioProcessor</code>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xs">
                    📐
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">Resolución Adaptable</h3>
                  <p className="text-xs text-slate-400">
                    Original, 1080p, 720p o 480p respetando la orientación vertical/horizontal con OpenGL shaders.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    📁
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">Movies/VideoSplit</h3>
                  <p className="text-xs text-slate-400">
                    Guardado seguro en MediaStore con nombres secuenciales y prevención contra sobreescritura accidental.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                    🎯
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">Perfiles Editables</h3>
                  <p className="text-xs text-slate-400">
                    Límites configurables para WhatsApp Estados (30s y 60s), Reels (90s), Historias (60s), TikTok y duración personalizada.
                  </p>
                </div>
              </div>

              {/* Instructions banner */}
              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-indigo-300">
                  <CheckCircle className="w-4 h-4 text-indigo-400" />
                  <span>Procesamiento Real Integrado en el Navegador</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  En el simulador móvil de la derecha puedes subir un video propio o hacer clic en <strong>"Videos de Prueba"</strong> para generar un video animado al instante. Al presionar "Dividir", el motor cortará el archivo en clips MP4 reales listos para descargar.
                </p>
              </div>

              {/* Quick links */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setIsApkGuideOpen(true)}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20"
                >
                  <Smartphone className="w-4 h-4" />
                  ¿Cómo generar e instalar el APK?
                </button>
                <span className="text-slate-700">·</span>
                <button
                  onClick={() => setActiveTab('code')}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition"
                >
                  <Code2 className="w-4 h-4" />
                  Ver código Kotlin
                </button>
                <span className="text-slate-700">·</span>
                <button
                  onClick={() => setActiveTab('architecture')}
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1.5 transition"
                >
                  <BookOpen className="w-4 h-4" />
                  Documentación Media3
                </button>
              </div>
            </div>

            {/* Right Column: Interactive Android Device Simulator */}
            <div className="lg:col-span-6 flex justify-center">
              <AndroidPhoneSimulator
                profiles={profiles}
                onSaveProfile={handleSaveProfile}
                onDeleteProfile={handleDeleteProfile}
                onResetProfiles={handleResetProfiles}
              />
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-4">
            <AndroidCodeViewer />
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="space-y-4">
            <Media3ArchitectureGuide />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong className="text-slate-400">CuttedVideo</strong> · Diseñado con AndroidX Media3 Transformer, Jetpack Compose y Material 3.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>MediaStore: <code className="text-indigo-400 font-mono">Movies/VideoSplit</code></span>
            <span>·</span>
            <span>API 26-34</span>
          </div>
        </div>
      </footer>

      {/* APK Installation Guide Modal */}
      <ApkGuideModal
        isOpen={isApkGuideOpen}
        onClose={() => setIsApkGuideOpen(false)}
      />
    </div>
  );
}
