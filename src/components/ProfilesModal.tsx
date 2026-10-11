import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check, RefreshCw, Smartphone } from 'lucide-react';
import { SplitProfile } from '../types';

interface ProfilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: SplitProfile[];
  onSaveProfile: (profile: SplitProfile) => void;
  onDeleteProfile: (id: string) => void;
  onResetDefaults: () => void;
}

export const ProfilesModal: React.FC<ProfilesModalProps> = ({
  isOpen,
  onClose,
  profiles,
  onSaveProfile,
  onDeleteProfile,
  onResetDefaults,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDuration, setEditDuration] = useState<number>(30);
  const [editDescription, setEditDescription] = useState('');

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPlatform, setNewPlatform] = useState('Personalizado');
  const [newDuration, setNewDuration] = useState<number>(45);

  if (!isOpen) return null;

  const startEdit = (p: SplitProfile) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditDuration(p.maxDurationSeconds);
    setEditDescription(p.description);
  };

  const saveEdit = (id: string) => {
    const existing = profiles.find((p) => p.id === id);
    if (!existing) return;
    onSaveProfile({
      ...existing,
      name: editName.trim() || existing.name,
      maxDurationSeconds: Math.max(1, editDuration),
      description: editDescription.trim(),
    });
    setEditingId(null);
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const newId = `profile_${Date.now()}`;
    onSaveProfile({
      id: newId,
      name: newName.trim(),
      platform: newPlatform,
      maxDurationSeconds: Math.max(1, newDuration),
      description: `Límite configurado de ${newDuration}s`,
      isEditable: true,
      isCustom: true,
    });
    setIsCreatingNew(false);
    setNewName('');
    setNewDuration(45);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Gestor de Perfiles de Destino
              </h3>
              <p className="text-xs text-slate-400">
                Personaliza los límites de tiempo de cada red social
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

        {/* Notice */}
        <div className="bg-slate-950/60 px-5 py-2.5 border-b border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
          <span>Los límites de plataformas cambian constantemente. Aquí puedes modificarlos libremente.</span>
          <button
            onClick={onResetDefaults}
            title="Restablecer perfiles predeterminados"
            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium shrink-0 ml-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Restaurar
          </button>
        </div>

        {/* List of profiles */}
        <div className="p-5 overflow-y-auto space-y-3">
          {profiles.map((p) => {
            const isEditing = editingId === p.id;
            return (
              <div
                key={p.id}
                className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 transition hover:border-slate-600"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400">Nombre del Perfil</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Duración máxima por clip (segundos)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="600"
                          value={editDuration}
                          onChange={(e) => setEditDuration(parseInt(e.target.value) || 1)}
                          className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                        <span className="text-xs text-slate-400">segundos</span>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-700"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => saveEdit(p.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Guardar Cambios
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-200">{p.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {p.maxDurationSeconds}s máx
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{p.description}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(p)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:bg-slate-700 transition"
                        title="Editar duración"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {p.isCustom && (
                        <button
                          onClick={() => onDeleteProfile(p.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition"
                          title="Eliminar perfil personalizado"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* New Profile form */}
          {isCreatingNew ? (
            <div className="bg-slate-800/80 border border-indigo-500/40 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Nuevo Perfil de Segmentación
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400">Nombre (ej: Telegram Story)</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej. Facebook Stories"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Duración máxima (segundos)</label>
                  <input
                    type="number"
                    min="1"
                    max="600"
                    value={newDuration}
                    onChange={(e) => setNewDuration(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setIsCreatingNew(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Crear Perfil
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreatingNew(true)}
              className="w-full py-3 border border-dashed border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/5 rounded-2xl text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Añadir Nuevo Perfil Personalizado
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
