import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Terminal,
  Usb,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  X,
  FileCode,
} from 'lucide-react';
import { downloadAndroidProjectZip } from '../utils/zipExporter';

interface ApkGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkGuideModal: React.FC<ApkGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeStep, setActiveStep] = useState<'mac' | 'studio' | 'terminal' | 'phone'>('mac');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Cómo Generar el APK e Instalarlo en tu Android
              </h2>
              <p className="text-xs text-slate-400">
                Guía completa paso a paso para tener CuttedVideo funcionando en tu teléfono
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Method Switcher Tabs */}
        <div className="grid grid-cols-4 p-1.5 bg-slate-950/70 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveStep('mac')}
            className={`py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition text-[11px] sm:text-xs ${
              activeStep === 'mac'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🍎 Mac + VS Code
          </button>
          <button
            onClick={() => setActiveStep('studio')}
            className={`py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition text-[11px] sm:text-xs ${
              activeStep === 'studio'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5 hidden sm:inline" />
            Android Studio
          </button>
          <button
            onClick={() => setActiveStep('terminal')}
            className={`py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition text-[11px] sm:text-xs ${
              activeStep === 'terminal'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 hidden sm:inline" />
            Comandos Gradle
          </button>
          <button
            onClick={() => setActiveStep('phone')}
            className={`py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition text-[11px] sm:text-xs ${
              activeStep === 'phone'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Usb className="w-3.5 h-3.5 hidden sm:inline" />
            En el Teléfono
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Method: Mac + VS Code */}
          {activeStep === 'mac' && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-300 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-200">
                  <span>💡 Para tu Mac Mini y primera vez compilando:</span>
                </div>
                <p className="leading-relaxed">
                  ¿Se puede hacer en <strong>VS Code</strong>? <strong>Sí</strong>, pero para que VS Code pueda compilar Android necesitas instalar manualmente <strong>Java JDK 17</strong> y el <strong>Android SDK</strong>.
                </p>
                <p className="leading-relaxed font-semibold text-emerald-300">
                  ⭐ Recomendación sincera: Descarga Android Studio para Mac. Es gratis, oficial de Google y se instala en 2 minutos con TODO configurado automáticamente (Java, SDK y drivers).
                </p>
              </div>

              {/* Option A in Mac: VS Code Terminal */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs uppercase tracking-wider text-indigo-400">
                  Paso a paso para compilar desde VS Code en tu Mac Mini:
                </h4>

                <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3.5 space-y-2 text-xs text-slate-300">
                  <div className="font-bold text-slate-200">1. Verificar si tienes Java instalado</div>
                  <p>Abre la terminal integrada en VS Code (<code>Ctrl + `</code> o menú Terminal &gt; New Terminal) y escribe:</p>
                  <div className="bg-slate-950 p-2 rounded-lg font-mono text-emerald-400 flex items-center justify-between">
                    <span>java -version</span>
                    <button
                      onClick={() => copyToClipboard('java -version', 'java_v')}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedCmd === 'java_v' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Si dice <code>command not found</code>, instálalo con Homebrew: <code>brew install openjdk@17</code>.
                  </p>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3.5 space-y-2 text-xs text-slate-300">
                  <div className="font-bold text-slate-200">2. Abrir la carpeta del proyecto en VS Code</div>
                  <p>
                    Descarga el archivo ZIP del proyecto, descomprímelo y en VS Code selecciona <strong>File &gt; Open Folder</strong> y elige <code>CuttedVideo-Android</code>.
                  </p>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3.5 space-y-2 text-xs text-slate-300">
                  <div className="font-bold text-slate-200">3. Ejecutar la compilación en la Terminal de VS Code</div>
                  <p>En la terminal integrada escribe:</p>
                  <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-emerald-400 flex items-center justify-between">
                    <span>./gradlew assembleDebug</span>
                    <button
                      onClick={() => copyToClipboard('./gradlew assembleDebug', 'mac_build')}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedCmd === 'mac_build' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Gradle descargará automáticamente las librerías de Media3 y compilará el archivo en:
                    <br />
                    <code className="text-indigo-300 font-mono">app/build/outputs/apk/debug/app-debug.apk</code>
                  </p>
                </div>

                {/* Secret Trick for Mac to Android */}
                <div className="bg-indigo-950/30 border border-indigo-500/40 rounded-xl p-3.5 space-y-2 text-xs text-slate-300">
                  <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <span>⚡ Truco fácil para pasarlo de tu Mac Mini a tu teléfono sin cables:</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Abre <strong>WhatsApp Web</strong> o <strong>Telegram Web</strong> en el navegador de tu Mac Mini. Arrastra el archivo <code>app-debug.apk</code> a tu chat personal o "Mensajes Guardados". Luego en tu teléfono Android, abre el mensaje, toca el archivo e instálalo en 10 segundos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Method 1: Android Studio */}
          {activeStep === 'studio' && (
            <div className="space-y-4">
              <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-2xl p-4 text-xs text-indigo-300 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
                <div>
                  <strong>Es la forma más sencilla:</strong> No necesitas escribir comandos. Android Studio compila el APK y lo envía directamente a la pantalla de tu móvil con un solo clic.
                </div>
              </div>

              {/* Step 1 */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs uppercase tracking-wider text-indigo-400">
                  Paso 1: Descargar y descomprimir el proyecto
                </h4>
                <p className="text-xs text-slate-300">
                  Haz clic en el siguiente botón para descargar el código fuente empaquetado:
                </p>
                <button
                  onClick={downloadAndroidProjectZip}
                  className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition"
                >
                  <Download className="w-4 h-4" />
                  Descargar CuttedVideo-Android-Studio-Project.zip
                </button>
                <p className="text-[11px] text-slate-500">
                  Descomprime el archivo ZIP en una carpeta de tu preferencia (ej. en <code>Documentos/CuttedVideo</code>).
                </p>
              </div>

              {/* Step 2 */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs uppercase tracking-wider text-indigo-400">
                  Paso 2: Abrir en Android Studio
                </h4>
                <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1 pl-1">
                  <li>Abre <strong>Android Studio</strong> (versión Ladybug, Koala o superior con JDK 17).</li>
                  <li>Selecciona <strong>File &gt; Open...</strong> (o <em>Open Existing Project</em>).</li>
                  <li>Selecciona la carpeta descomprimida <code>CuttedVideo-Android</code>.</li>
                  <li>Espera unos segundos a que Gradle sincronice las librerías de <strong>Media3 Transformer</strong> y <strong>Jetpack Compose</strong> (verás una barra de progreso inferior).</li>
                </ol>
              </div>

              {/* Step 3 */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs uppercase tracking-wider text-indigo-400">
                  Paso 3: Generar el APK o Instalar Directamente
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Option A: Run directly on phone */}
                  <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3 space-y-1.5">
                    <span className="text-xs font-bold text-emerald-400 block">Opción A: Instalar directamente</span>
                    <p className="text-[11px] text-slate-300">
                      Conecta tu teléfono por cable USB con <em>Depuración por USB</em> activa. Tu móvil aparecerá en el menú superior. Pulsa el botón verde <strong>Run 'app' (Play ▶)</strong> o presiona <kbd className="bg-slate-900 px-1 rounded">Shift + F10</kbd>. La app se abrirá en tu teléfono automáticamente.
                    </p>
                  </div>

                  {/* Option B: Build APK file */}
                  <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3 space-y-1.5">
                    <span className="text-xs font-bold text-sky-400 block">Opción B: Generar archivo .APK</span>
                    <p className="text-[11px] text-slate-300">
                      En el menú superior ve a:
                      <br />
                      <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>.
                      <br />
                      Al finalizar aparecerá una notificación con el enlace <strong>"locate"</strong> para acceder al archivo <code>app-debug.apk</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Method 2: Terminal */}
          {activeStep === 'terminal' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Si prefieres compilar sin abrir la interfaz de Android Studio, puedes generar el APK mediante la línea de comandos con el wrapper de Gradle:
              </p>

              {/* Command 1 */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">1. Navegar a la carpeta descomprimida:</span>
                  <button
                    onClick={() => copyToClipboard('cd CuttedVideo-Android', 'cmd1')}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
                  >
                    {copiedCmd === 'cmd1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copiar
                  </button>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-200">
                  cd CuttedVideo-Android
                </div>
              </div>

              {/* Command 2 */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">2. Compilar el APK (Windows o Linux/Mac):</span>
                  <button
                    onClick={() => copyToClipboard('./gradlew assembleDebug', 'cmd2')}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
                  >
                    {copiedCmd === 'cmd2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copiar
                  </button>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 space-y-1">
                  <div className="text-slate-500"># En Linux / macOS:</div>
                  <div className="text-emerald-400">./gradlew assembleDebug</div>
                  <div className="text-slate-500 mt-2"># En Windows (CMD o PowerShell):</div>
                  <div className="text-emerald-400">gradlew.bat assembleDebug</div>
                </div>
              </div>

              {/* Output path */}
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-1">
                <span className="text-xs font-bold text-slate-200 block">¿Dónde queda guardado el APK generado?</span>
                <code className="text-indigo-300 font-mono text-xs block bg-slate-900 p-2 rounded-lg break-all">
                  app/build/outputs/apk/debug/app-debug.apk
                </code>
              </div>

              {/* Command 3: ADB install */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">3. Instalar en el teléfono conectado por USB con ADB:</span>
                  <button
                    onClick={() => copyToClipboard('adb install -r app/build/outputs/apk/debug/app-debug.apk', 'cmd3')}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
                  >
                    {copiedCmd === 'cmd3' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copiar
                  </button>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-200">
                  adb install -r app/build/outputs/apk/debug/app-debug.apk
                </div>
              </div>
            </div>
          )}

          {/* Method 3: Phone settings */}
          {activeStep === 'phone' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider text-indigo-400">
                  A. Activar "Opciones de Desarrollador" y "Depuración USB" en Android
                </h4>
                <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5 pl-1 leading-relaxed">
                  <li>Abre la app de <strong>Ajustes</strong> o <strong>Configuración</strong> en tu teléfono.</li>
                  <li>Ve a <strong>Acerca del teléfono</strong> (o <em>Información de software</em>).</li>
                  <li>Busca la opción <strong>Número de compilación</strong> (Build number) y tócala <strong>7 veces seguidas</strong>. El teléfono mostrará un mensaje indicando: <em>"¡Ahora eres desarrollador!"</em>.</li>
                  <li>Regresa a Ajustes &gt; <strong>Sistema</strong> &gt; <strong>Opciones de desarrollador</strong>.</li>
                  <li>Activa el interruptor <strong>Depuración por USB</strong> (USB Debugging).</li>
                  <li>Al conectar el cable USB a la computadora, aparecerá un aviso en la pantalla del móvil: pulsa <strong>"Permitir siempre desde esta computadora"</strong>.</li>
                </ol>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider text-indigo-400">
                  B. Si vas a instalar el archivo .APK manualmente (sin cable USB)
                </h4>
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-2 text-xs text-slate-300">
                  <p>
                    Puedes enviarte el archivo <code>app-debug.apk</code> por <strong>WhatsApp, Telegram, Google Drive</strong> o transferirlo por cable a la carpeta <em>Descargas</em> de tu teléfono.
                  </p>
                  <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-lg text-[11px] text-amber-300">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      Al tocar el archivo APK en tu administrador de archivos, Android te pedirá habilitar <strong>"Permitir instalar aplicaciones desconocidas"</strong> para esa aplicación. Confirma la autorización y presiona <strong>"Instalar"</strong>.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            CuttedVideo · Compatible con Android 8.0 a 14+ (API 26-34)
          </span>
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
