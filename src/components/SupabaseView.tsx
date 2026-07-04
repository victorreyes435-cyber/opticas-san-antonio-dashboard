import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRightLeft, 
  Copy, 
  Code, 
  CloudLightning, 
  DownloadCloud, 
  UploadCloud, 
  RefreshCw, 
  Table, 
  Info,
  Check,
  Server
} from 'lucide-react';
import { 
  isSupabaseConfigured, 
  supabaseService, 
  SUPABASE_SQL_SCHEMA
} from '../lib/supabase';
import { Patient, Appointment, Prescription } from '../types';

interface SupabaseViewProps {
  localPatients: Patient[];
  localAppointments: Appointment[];
  localPrescriptions: Prescription[];
  onSyncData: (data: {
    patients?: Patient[];
    appointments?: Appointment[];
    prescriptions?: Prescription[];
  }) => void;
}

export default function SupabaseView({
  localPatients,
  localAppointments,
  localPrescriptions,
  onSyncData
}: SupabaseViewProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Remote stats
  const [remoteStats, setRemoteStats] = useState({
    patients: 0,
    appointments: 0,
    prescriptions: 0,
    loaded: false
  });

  // active sub-tab for inspection
  const [activeSubTab, setActiveSubTab] = useState<'sql' | 'status' | 'data'>('status');
  const [selectedTable, setSelectedTable] = useState<'patients' | 'appointments' | 'prescriptions'>('patients');
  
  // Loaded preview data
  const [remotePatients, setRemotePatients] = useState<Patient[]>([]);
  const [remoteAppointments, setRemoteAppointments] = useState<Appointment[]>([]);
  const [remotePrescriptions, setRemotePrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    if (isSupabaseConfigured) {
      loadRemoteStats();
    }
  }, []);

  const loadRemoteStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await supabaseService.fetchPatients();
      const a = await supabaseService.fetchAppointments();
      const r = await supabaseService.fetchPrescriptions();

      setRemotePatients(p);
      setRemoteAppointments(a);
      setRemotePrescriptions(r);

      setRemoteStats({
        patients: p.length,
        appointments: a.length,
        prescriptions: r.length,
        loaded: true
      });
    } catch (err: any) {
      console.error(err);
      setError('No se pudo establecer conexión con las tablas de Supabase. Asegúrate de haber ejecutado el script SQL en el Editor de Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Push local data to Supabase
  const handlePushData = async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      let patientsPushed = 0;
      let apptsPushed = 0;
      let rxPushed = 0;

      // 1. Push patients
      for (const p of localPatients) {
        await supabaseService.upsertPatient(p);
        patientsPushed++;
      }

      // 2. Push appointments
      for (const a of localAppointments) {
        await supabaseService.upsertAppointment(a);
        apptsPushed++;
      }

      // 3. Push prescriptions
      for (const r of localPrescriptions) {
        await supabaseService.upsertPrescription(r);
        rxPushed++;
      }

      setSuccess(`¡Sincronización de subida exitosa! Se exportaron ${patientsPushed} pacientes, ${apptsPushed} citas y ${rxPushed} recetas de lentes a Supabase.`);
      await loadRemoteStats();
    } catch (err: any) {
      console.error(err);
      setError(`Error al exportar datos: ${err.message || 'Verifica la configuración del RLS y las tablas.'}`);
    } finally {
      setLoading(false);
    }
  };

  // Pull remote data from Supabase to local state
  const handlePullData = async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const remoteP = await supabaseService.fetchPatients();
      const remoteA = await supabaseService.fetchAppointments();
      const remoteR = await supabaseService.fetchPrescriptions();

      onSyncData({
        patients: remoteP,
        appointments: remoteA,
        prescriptions: remoteR
      });

      setSuccess(`¡Sincronización de bajada exitosa! Se importaron ${remoteP.length} pacientes, ${remoteA.length} citas y ${remoteR.length} recetas desde tu base de datos de Supabase.`);
      await loadRemoteStats();
    } catch (err: any) {
      console.error(err);
      setError(`Error al importar datos: ${err.message || 'Verifica la conexión.'}`);
    } finally {
      setLoading(false);
    }
  };

  const getUrl = () => {
    return ((import.meta as any).env?.VITE_SUPABASE_URL) || 'No configurada';
  };

  const getAnonKeySet = () => {
    return !!((import.meta as any).env?.VITE_SUPABASE_ANON_KEY);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-xs">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span>Sincronización Cloud Supabase</span>
            </h2>
            <p className="text-slate-400 dark:text-slate-500 mt-0.5">Sincroniza pacientes, citas y recetas médicas con tu base de datos relacional PostgreSQL de Supabase.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          {isSupabaseConfigured ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold rounded-lg border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Supabase Activo
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold rounded-lg border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Configuración Pendiente
            </span>
          )}
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="font-semibold">{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-200 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Primary Navigation tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveSubTab('status')}
          className={`pb-3 px-4 font-bold border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'status' 
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Estado y Sincronización
        </button>
        <button
          onClick={() => setActiveSubTab('sql')}
          className={`pb-3 px-4 font-bold border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'sql' 
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Esquema SQL
        </button>
        {isSupabaseConfigured && (
          <button
            onClick={() => {
              setActiveSubTab('data');
              loadRemoteStats();
            }}
            className={`pb-3 px-4 font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'data' 
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Explorador de Datos Supabase
          </button>
        )}
      </div>

      {/* Tab: Status and Sync */}
      {activeSubTab === 'status' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card: Configuration Check */}
          <div className="md:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5 text-sm">
              <Server className="w-4 h-4 text-indigo-600" />
              <span>Detalles del Servidor</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg space-y-1 border border-slate-150 dark:border-slate-800">
                <p className="font-bold text-[10px] text-slate-400 uppercase">Supabase Endpoint URL</p>
                <p className="font-mono text-slate-600 dark:text-slate-300 break-all">
                  {getUrl()}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg space-y-1 border border-slate-150 dark:border-slate-800">
                <p className="font-bold text-[10px] text-slate-400 uppercase">Clave Anon Pública (API Key)</p>
                <p className="font-mono text-slate-600 dark:text-slate-300 break-all">
                  {getAnonKeySet() ? '••••••••••••••••••••••••' : 'No configurada'}
                </p>
              </div>
            </div>

            {!isSupabaseConfigured && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-150 dark:border-amber-800/50 space-y-2 text-amber-900 dark:text-amber-200 leading-normal animate-pulse">
                <p className="font-bold flex items-center gap-1 text-[11px]">
                  <Info className="w-3.5 h-3.5 text-amber-500" />
                  <span>Configuración Requerida</span>
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Para conectar tu base de datos de Supabase, agrega las siguientes variables de entorno en el menú de <strong>Secrets / Configuración</strong> en AI Studio:
                </p>
                <ul className="list-disc pl-4 text-[10px] font-mono space-y-0.5 text-slate-500 dark:text-slate-400">
                  <li className="font-bold">VITE_SUPABASE_URL</li>
                  <li className="font-bold">VITE_SUPABASE_ANON_KEY</li>
                </ul>
              </div>
            )}
          </div>

          {/* Card: Sync Actions */}
          <div className="md:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-5">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
              <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
              <span>Acciones de Sincronización</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 border border-slate-150 dark:border-slate-800 rounded-xl text-center space-y-2">
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{localPatients.length}</span>
                <p className="font-bold text-slate-500 uppercase text-[9px] tracking-wider">Pacientes Locales</p>
                {remoteStats.loaded && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">En Supabase: {remoteStats.patients}</p>
                )}
              </div>

              <div className="p-4 border border-slate-150 dark:border-slate-800 rounded-xl text-center space-y-2">
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{localAppointments.length}</span>
                <p className="font-bold text-slate-500 uppercase text-[9px] tracking-wider">Citas Médicas</p>
                {remoteStats.loaded && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">En Supabase: {remoteStats.appointments}</p>
                )}
              </div>

              <div className="p-4 border border-slate-150 dark:border-slate-800 rounded-xl text-center space-y-2">
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{localPrescriptions.length}</span>
                <p className="font-bold text-slate-500 uppercase text-[9px] tracking-wider">Recetas Optométricas</p>
                {remoteStats.loaded && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">En Supabase: {remoteStats.prescriptions}</p>
                )}
              </div>
            </div>

            {isSupabaseConfigured ? (
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  disabled={loading}
                  onClick={handlePushData}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white font-bold p-3 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98 transition-all"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Subir todo a Supabase (Push)</span>
                </button>
                <button
                  disabled={loading}
                  onClick={handlePullData}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold p-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
                >
                  <DownloadCloud className="w-4 h-4" />
                  <span>Descargar desde Supabase (Pull)</span>
                </button>
                <button
                  disabled={loading}
                  onClick={loadRemoteStats}
                  className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 cursor-pointer"
                  title="Refrescar estado"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-slate-400 space-y-2">
                <CloudLightning className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-750" />
                <p className="font-semibold text-xs text-slate-600 dark:text-slate-300">Sincronización deshabilitada</p>
                <p className="text-[10px] max-w-sm mx-auto text-slate-500 leading-normal">
                  Agrega las variables de conexión en la sección de variables de entorno de AI Studio para activar la persistencia PostgreSQL en tiempo real.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: SQL Schema */}
      {activeSubTab === 'sql' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5 text-sm">
                <Code className="w-4 h-4 text-indigo-600" />
                <span>Script de Inicialización PostgreSQL</span>
              </h3>
              <p className="text-slate-400 dark:text-slate-500 mt-0.5">Crea las tablas correspondientes en tu panel de Supabase SQL Editor para habilitar la sincronización de datos.</p>
            </div>
            <button
              onClick={handleCopySQL}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Script'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-900 text-indigo-200 font-mono text-[11px] rounded-lg overflow-x-auto max-h-96 border border-slate-800">
            {SUPABASE_SQL_SCHEMA}
          </pre>
        </div>
      )}

      {/* Tab: Data Explorer */}
      {activeSubTab === 'data' && isSupabaseConfigured && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-slate-800 dark:text-white text-sm">Tablas del Sistema en Supabase</span>
            </div>

            <div className="flex gap-2">
              {[
                { id: 'patients', label: 'Pacientes' },
                { id: 'appointments', label: 'Citas' },
                { id: 'prescriptions', label: 'Recetas' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTable(tab.id as any)}
                  className={`px-3 py-1.5 font-bold rounded-lg cursor-pointer transition-all ${
                    selectedTable === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : selectedTable === 'patients' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-500 font-bold">
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">Nombre</th>
                    <th className="p-2.5">Nacimiento</th>
                    <th className="p-2.5">Teléfono</th>
                    <th className="p-2.5">Sexo</th>
                  </tr>
                </thead>
                <tbody>
                  {remotePatients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">No hay datos en esta tabla.</td>
                    </tr>
                  ) : (
                    remotePatients.map(p => (
                      <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 font-medium text-slate-700 dark:text-slate-300">
                        <td className="p-2.5 font-mono text-[10px] text-slate-400">{p.id}</td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white">{p.name}</td>
                        <td className="p-2.5">{p.dob}</td>
                        <td className="p-2.5">{p.phone || 'N/A'}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold rounded text-[10px]">
                            {p.sex}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : selectedTable === 'appointments' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-500 font-bold">
                    <th className="p-2.5">Paciente</th>
                    <th className="p-2.5">Hora</th>
                    <th className="p-2.5">Sala</th>
                    <th className="p-2.5">Prioridad</th>
                    <th className="p-2.5">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {remoteAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">No hay datos en esta tabla.</td>
                    </tr>
                  ) : (
                    remoteAppointments.map(a => (
                      <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 font-medium text-slate-700 dark:text-slate-300">
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white">{a.patientName}</td>
                        <td className="p-2.5 font-mono">{a.time}</td>
                        <td className="p-2.5">{a.room}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 font-bold rounded text-[10px] ${
                            a.priority === 'High' ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}>
                            {a.priority || 'Normal'}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 font-bold rounded text-[10px] ${
                            a.status === 'COMPLETED' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' :
                            a.status === 'ARRIVED' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-500 font-bold">
                    <th className="p-2.5">Paciente</th>
                    <th className="p-2.5">Fecha</th>
                    <th className="p-2.5">Médico</th>
                    <th className="p-2.5">Ojo Izq (SPH/CYL)</th>
                    <th className="p-2.5">Ojo Der (SPH/CYL)</th>
                    <th className="p-2.5">Tipo de Cristal</th>
                  </tr>
                </thead>
                <tbody>
                  {remotePrescriptions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">No hay datos en esta tabla.</td>
                    </tr>
                  ) : (
                    remotePrescriptions.map(r => (
                      <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 font-medium text-slate-700 dark:text-slate-300">
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white">{r.patientName}</td>
                        <td className="p-2.5">{r.date}</td>
                        <td className="p-2.5">{r.doctorName}</td>
                        <td className="p-2.5 font-mono">{r.os?.sph || '0.00'} / {r.os?.cyl || '0.00'}</td>
                        <td className="p-2.5 font-mono">{r.od?.sph || '0.00'} / {r.od?.cyl || '0.00'}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold rounded text-[10px]">
                            {r.lensType}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
