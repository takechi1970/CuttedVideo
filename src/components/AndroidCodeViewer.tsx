import React, { useState } from 'react';
import { ANDROID_PROJECT_FILES } from '../data/androidProjectFiles';
import { AndroidProjectFile } from '../types';
import { downloadAndroidProjectZip } from '../utils/zipExporter';
import {
  FileCode,
  FolderTree,
  Download,
  Copy,
  Check,
  Search,
  ExternalLink,
  Smartphone,
  Layers,
  Cpu,
} from 'lucide-react';

export const AndroidCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidProjectFile>(ANDROID_PROJECT_FILES[5]); // Default to VideoTransformerEngine.kt
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = ANDROID_PROJECT_FILES.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      await downloadAndroidProjectZip();
      setIsZipping(false);
    } catch (err) {
      setIsZipping(false);
      console.error(err);
      alert('Error generando archivo ZIP: ' + (err as Error).message);
    }
  };

  return (
    <div className="flex flex-col h-[780px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Banner & Actions */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Código Fuente Nativo Android (Kotlin + Jetpack Compose)
            </h2>
            <p className="text-xs text-slate-400">
              AndroidX Media3 Transformer 1.3.1 · Material 3 · MediaStore Exporter
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition active:scale-95"
            title="Descargar ZIP generado en el navegador del proyecto Android Studio"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isZipping ? 'Generando ZIP...' : 'Descargar Proyecto Android (.zip)'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar File Explorer + Code Editor */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        {/* Explorer Sidebar */}
        <div className="md:col-span-4 border-r border-slate-800 bg-slate-950/60 flex flex-col h-full">
          {/* Search bar */}
          <div className="p-3 border-b border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar archivos Kotlin, Gradle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Estructura del Proyecto
            </div>
            {filteredFiles.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <FileCode
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isSelected ? 'text-indigo-400' : 'text-slate-500'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[11px] font-medium truncate text-slate-200">
                      {file.name}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate font-mono">
                      {file.path}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick info footer */}
          <div className="p-3 bg-slate-900/60 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            <span>Target: Android API 26-34 (Android 8.0 - 14+)</span>
          </div>
        </div>

        {/* Code Content Area */}
        <div className="md:col-span-8 flex flex-col h-full bg-slate-950">
          {/* File Tab Header */}
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-xs font-semibold text-slate-200 truncate">
                {selectedFile.path}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                {selectedFile.language}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          {/* File description note */}
          <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800/60 text-xs text-slate-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>{selectedFile.description}</span>
          </div>

          {/* Source Code with Line Numbers */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 leading-relaxed bg-slate-950">
            <pre className="overflow-x-auto">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
