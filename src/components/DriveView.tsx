import React, { useState, useEffect } from 'react';
import { HardDrive, Folder, File, Plus, Upload, Trash2, Search, RefreshCw, ExternalLink, FileText, FileImage, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
}

export default function DriveView() {
  const { googleToken, signIn } = useAuth();
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  useEffect(() => {
    if (googleToken) {
      fetchFiles();
    }
  }, [googleToken]);

  const fetchFiles = async (query = '') => {
    if (!googleToken) return;
    setLoading(true);
    setError(null);
    try {
      let q = "trashed = false";
      if (query) {
        q += ` and name contains '${query.replace(/'/g, "\\'")}'`;
      }
      const url = `https://www.googleapis.com/drive/v3/files?pageSize=30&fields=files(id,name,mimeType,size,webViewLink,iconLink)&q=${encodeURIComponent(q)}&orderBy=folder,name`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${googleToken}` }
      });
      
      if (!res.ok) {
        throw new Error('Error al conectar con Drive. Por favor reconecta.');
      }
      
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err: any) {
      console.error(err);
      setError('No se pudieron recuperar los archivos de Google Drive.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFiles(searchQuery);
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleToken || !newFolderName.trim()) return;
    setCreatingFolder(true);
    setError(null);

    try {
      const res = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newFolderName,
          mimeType: 'application/vnd.google-apps.folder'
        })
      });

      if (!res.ok) {
        throw new Error('Error al crear la carpeta');
      }

      setNewFolderName('');
      setShowNewFolderModal(false);
      fetchFiles();
    } catch (err: any) {
      console.error(err);
      setError('Error al crear la carpeta clínica en Google Drive.');
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleDeleteFile = async (id: string, name: string) => {
    if (!googleToken) return;
    const confirmed = window.confirm(`¿Estás completamente seguro de que deseas eliminar "${name}" de Google Drive?`);
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${googleToken}` }
      });

      if (!res.ok) {
        throw new Error('No se pudo eliminar el archivo');
      }

      setFiles(prev => prev.filter(f => f.id !== id));
    } catch (err: any) {
      console.error(err);
      setError(`No se pudo eliminar "${name}". Verifica tus permisos.`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!googleToken || !fileList || fileList.length === 0) return;
    const file = fileList[0];

    setUploading(true);
    setError(null);

    try {
      // Step 1: Read file as ArrayBuffer or Base64
      const reader = new FileReader();
      const fileLoaded = new Promise<string | ArrayBuffer | null>((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsArrayBuffer(file);
      });

      const arrayBuffer = await fileLoaded;
      if (!arrayBuffer) throw new Error('Error al leer el archivo local.');

      // Step 2: Multipart upload
      const metadata = {
        name: file.name,
        mimeType: file.type || 'application/octet-stream'
      };

      const boundary = '-------OphthalmoProBoundary314159';
      const delimiter = `\r\n--${boundary}\r\n`;
      const close_delim = `\r\n--${boundary}--`;

      const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
      
      // Convert ArrayBuffer to binary string
      const bytes = new Uint8Array(arrayBuffer as ArrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }

      const fileHeader = `${delimiter}Content-Type: ${metadata.mimeType}\r\nContent-Transfer-Encoding: base64\r\n\r\n${btoa(binary)}\r\n`;
      const multipartBody = metadataPart + fileHeader + close_delim;

      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartBody
      });

      if (!res.ok) {
        throw new Error('Error al subir el archivo');
      }

      fetchFiles();
    } catch (err: any) {
      console.error(err);
      setError('Fallo al subir el archivo a Google Drive.');
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytesStr?: string) => {
    if (!bytesStr) return 'N/A';
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!googleToken) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-6 max-w-xl mx-auto my-12 text-xs">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-pulse">
          <HardDrive className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Expedientes Clínicos en Google Drive</h3>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
            Guarda de forma segura los reportes de exámenes, tomografías OCT, topografías corneales y recetas oftalmológicas de tus pacientes directamente en Google Drive.
          </p>
        </div>
        <button
          onClick={signIn}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer"
        >
          <HardDrive className="w-4 h-4 text-white" />
          <span>Conectar con Google Drive</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-xs">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
            <HardDrive className="w-5 h-5 text-indigo-600" />
            <span>Expedientes Clínicos (Google Drive)</span>
          </h2>
          <p className="text-slate-400 dark:text-slate-500 mt-1">Sube, organiza y visualiza documentos clínicos oficiales, escaneos y recetas en la nube.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95">
            {uploading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{uploading ? 'Subiendo Archivo...' : 'Subir Examen Clínico'}</span>
            <input type="file" onChange={handleFileUpload} className="hidden" disabled={uploading} />
          </label>

          <button
            onClick={() => setShowNewFolderModal(true)}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer active:scale-95"
          >
            <Folder className="w-4 h-4" />
            <span>Crear Carpeta</span>
          </button>

          <button
            onClick={() => fetchFiles()}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
            title="Sincronizar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl text-red-800 dark:text-red-200 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Main Files Display */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-md mb-6">
          <input
            type="text"
            placeholder="Buscar archivos clínicos por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-850 dark:text-white rounded-xl py-2.5 pl-3 pr-10 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button type="submit" className="absolute right-3 top-2.5 text-slate-400 hover:text-indigo-600">
            <Search className="w-4 h-4" />
          </button>
        </form>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium">Cargando expedientes desde Google Drive...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-20 text-slate-400 dark:text-slate-500 space-y-3">
            <HardDrive className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="font-bold text-sm">No se encontraron archivos en Google Drive</p>
            <p className="text-[10px] max-w-sm mx-auto">Prueba creando una nueva carpeta o subiendo tus reportes de diagnóstico y recetas utilizando los botones superiores.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3 pl-2">Nombre</th>
                  <th className="pb-3">Tipo</th>
                  <th className="pb-3">Tamaño</th>
                  <th className="pb-3 text-right pr-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                {files.map((file) => {
                  const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                  return (
                    <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/40 transition-colors">
                      <td className="py-3.5 pl-2 flex items-center gap-3">
                        {isFolder ? (
                          <Folder className="w-5 h-5 text-amber-500 shrink-0" />
                        ) : file.mimeType.startsWith('image/') ? (
                          <FileImage className="w-5 h-5 text-indigo-500 shrink-0" />
                        ) : (
                          <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                        )}
                        <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-md">
                          {file.name}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-400">
                        {isFolder ? 'Carpeta clínica' : file.mimeType.split('/').pop()?.toUpperCase() || 'Archivo'}
                      </td>
                      <td className="py-3.5 text-slate-400 font-mono">
                        {isFolder ? '--' : formatSize(file.size)}
                      </td>
                      <td className="py-3.5 text-right pr-4">
                        <div className="flex items-center justify-end gap-3">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-950 dark:text-slate-300 dark:hover:text-indigo-400 rounded-lg transition-colors cursor-pointer"
                              title="Abrir en Drive"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteFile(file.id, file.name)}
                            className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 dark:bg-slate-800 dark:hover:bg-red-950/50 dark:text-slate-300 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar de Drive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-3">
              <Folder className="w-5 h-5 text-indigo-600" />
              <span>Crear Carpeta Clínica</span>
            </h3>
            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
              Ingresa el nombre de la carpeta (ej. "Pacientes - Sam Reyes") para agrupar reportes y escáneres en Google Drive.
            </p>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Nombre de la carpeta"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-slate-850 dark:text-white rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 transition-colors font-semibold"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewFolderName('');
                    setShowNewFolderModal(false);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingFolder}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white font-bold rounded-xl transition-colors cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  {creatingFolder && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  <span>Crear</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
