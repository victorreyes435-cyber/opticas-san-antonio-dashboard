import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, Image, Video, RefreshCw, RefreshCcw, User, Shield, AlertCircle, Upload } from 'lucide-react';
import { UserProfile } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onChangeProfile: (profile: UserProfile) => void;
  onLogout?: () => void;
}

const PRESET_PROFILES = {
  receptionist: {
    name: 'Laura Gómez',
    role: 'Recepcionista' as const,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  technologist: {
    name: 'Dr. S. Miller',
    role: 'Tecnólogo Médico' as const,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'
  }
};

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
];

export default function UserProfileModal({ isOpen, onClose, profile, onChangeProfile, onLogout }: UserProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'switch' | 'customize'>('switch');
  
  // Customization Form State
  const [customName, setCustomName] = useState(profile.name);
  const [customRole, setCustomRole] = useState<UserProfile['role']>(profile.role);
  const [customAvatar, setCustomAvatar] = useState(profile.avatar);

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync custom inputs when profile changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCustomName(profile.name);
      setCustomRole(profile.role);
      setCustomAvatar(profile.avatar);
      setCameraError(null);
      setIsCameraActive(false);
    }
  }, [isOpen, profile]);

  // Cleanup camera stream on close or unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 300 }, height: { ideal: 300 }, facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Error starting camera:', err);
      setCameraError('No se pudo acceder a la cámara. Por favor verifica los permisos o conecta una.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // We want a square crop for the avatar
        const size = Math.min(video.videoWidth, video.videoHeight);
        const startX = (video.videoWidth - size) / 2;
        const startY = (video.videoHeight - size) / 2;
        
        canvas.width = 150;
        canvas.height = 150;
        
        context.drawImage(
          video,
          startX, startY, size, size, // source rect
          0, 0, 150, 150 // destination rect
        );
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCustomAvatar(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyPresetProfile = (presetKey: 'receptionist' | 'technologist') => {
    const selected = PRESET_PROFILES[presetKey];
    onChangeProfile(selected);
    onClose();
  };

  const handleSaveCustomProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    
    onChangeProfile({
      name: customName,
      role: customRole,
      avatar: customAvatar
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-200">
              Configuración de Usuario
            </h3>
          </div>
          <button 
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 bg-slate-50 text-xs">
          <button
            onClick={() => {
              stopCamera();
              setActiveTab('switch');
            }}
            className={`flex-1 py-3 text-center font-bold tracking-wide transition-colors border-b-2 uppercase ${
              activeTab === 'switch' 
                ? 'border-indigo-600 text-indigo-600 bg-white' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Cambiar Rol Rápido
          </button>
          <button
            onClick={() => setActiveTab('customize')}
            className={`flex-1 py-3 text-center font-bold tracking-wide transition-colors border-b-2 uppercase ${
              activeTab === 'customize' 
                ? 'border-indigo-600 text-indigo-600 bg-white' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Personalizar Perfil
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 text-xs">
          {activeTab === 'switch' ? (
            <div className="space-y-4">
              <p className="text-slate-500 mb-2 leading-relaxed">
                Seleccione un rol predefinido para simular la interfaz de usuario de la clínica:
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                {/* Receptionist Preset */}
                <button
                  onClick={() => handleApplyPresetProfile('receptionist')}
                  className={`flex items-center gap-4 p-4 border rounded-xl text-left transition-all hover:bg-slate-50/80 active:scale-98 ${
                    profile.role === 'Recepcionista' 
                      ? 'border-indigo-500 bg-indigo-50/30' 
                      : 'border-slate-200'
                  }`}
                >
                  <img
                    src={PRESET_PROFILES.receptionist.avatar}
                    alt="Laura Gómez Avatar"
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800 text-sm">
                        {PRESET_PROFILES.receptionist.name}
                      </p>
                      {profile.role === 'Recepcionista' && (
                        <span className="bg-indigo-600 text-white rounded-full p-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <p className="text-indigo-600 font-semibold text-[10px] uppercase tracking-wide mt-0.5">
                      {PRESET_PROFILES.receptionist.role}
                    </p>
                    <p className="text-slate-400 text-[10px] mt-1">
                      Agendar citas, ingresar pacientes y gestionar recepción.
                    </p>
                  </div>
                </button>

                {/* Technologist Preset */}
                <button
                  onClick={() => handleApplyPresetProfile('technologist')}
                  className={`flex items-center gap-4 p-4 border rounded-xl text-left transition-all hover:bg-slate-50/80 active:scale-98 ${
                    profile.role === 'Tecnólogo Médico' 
                      ? 'border-indigo-500 bg-indigo-50/30' 
                      : 'border-slate-200'
                  }`}
                >
                  <img
                    src={PRESET_PROFILES.technologist.avatar}
                    alt="Dr. Miller Avatar"
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800 text-sm">
                        {PRESET_PROFILES.technologist.name}
                      </p>
                      {profile.role === 'Tecnólogo Médico' && (
                        <span className="bg-indigo-600 text-white rounded-full p-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <p className="text-indigo-600 font-semibold text-[10px] uppercase tracking-wide mt-0.5">
                      {PRESET_PROFILES.technologist.role}
                    </p>
                    <p className="text-slate-400 text-[10px] mt-1">
                      Reffracción, emitir recetas de lentes, notas clínicas y exámenes.
                    </p>
                  </div>
                </button>
              </div>

              {onLogout && (
                <div className="pt-4 mt-4 border-t border-slate-100 flex">
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      onClose();
                      onLogout();
                    }}
                    className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer text-center"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSaveCustomProfile} className="space-y-4">
              
              {/* Profile Image Customize Section */}
              <div className="flex flex-col items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="relative">
                  <img
                    src={customAvatar}
                    alt="Custom Avatar Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md bg-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1.5 rounded-full shadow-sm">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                </div>

                {isCameraActive ? (
                  <div className="w-full flex flex-col items-center gap-3">
                    {/* Live Camera Feed */}
                    <div className="w-48 h-48 rounded-lg overflow-hidden border border-slate-200 bg-black relative">
                      <video 
                        ref={videoRef}
                        className="w-full h-full object-cover transform -scale-x-100"
                        playsInline
                        muted
                      />
                    </div>
                    
                    <div className="flex gap-2 w-full max-w-xs">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Capturar</span>
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 justify-center mt-1">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95 text-[11px]"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Usar Cámara</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-1.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95 text-[11px]"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir Foto</span>
                    </button>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}

                {cameraError && (
                  <div className="text-rose-600 font-medium flex items-start gap-1.5 text-[10px] mt-1 text-center max-w-xs">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{cameraError}</span>
                  </div>
                )}

                {/* Preset Avatar Selection Gallery */}
                <div className="w-full pt-3 border-t border-slate-200/60">
                  <p className="text-center font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-2">
                    O elegir de la galería de médicos
                  </p>
                  <div className="flex justify-center gap-2 overflow-x-auto pb-1">
                    {AVATAR_PRESETS.map((pUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCustomAvatar(pUrl)}
                        className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all hover:scale-105 ${
                          customAvatar === pUrl ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-slate-200'
                        }`}
                      >
                        <img src={pUrl} alt="gallery" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Form Input fields */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400 uppercase">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 font-semibold text-gray-700 focus:outline-none focus:border-indigo-600"
                    placeholder="ej. Dra. Jenkins"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-400 uppercase">Rol Clínico</label>
                  <select
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 px-3 font-semibold text-gray-700 focus:outline-none cursor-pointer"
                  >
                    <option value="Recepcionista">Recepcionista</option>
                    <option value="Tecnólogo Médico">Tecnólogo Médico</option>
                  </select>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      onClose();
                      onLogout();
                    }}
                    className="mr-auto px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Cerrar Sesión
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    onClose();
                  }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-500 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
      
      {/* Hidden canvas for image capture snap */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
