import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Users, 
  FileText, 
  CheckCircle, 
  FolderOpen, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Search
} from 'lucide-react';
import { Appointment, Patient } from '../types';

interface DashboardViewProps {
  appointments: Appointment[];
  patients: Patient[];
  onOpenPatientChart: (patientId: string) => void;
  onAddPatientClick: () => void;
  onAddAppointmentClick: () => void;
  searchQuery: string;
}

export default function DashboardView({ 
  appointments, 
  patients, 
  onOpenPatientChart, 
  onAddPatientClick,
  onAddAppointmentClick,
  searchQuery 
}: DashboardViewProps) {
  const [selectedDay, setSelectedDay] = useState<number>(24);
  const [labReviewed, setLabReviewed] = useState(false);
  const [rxSigned, setRxSigned] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Filter appointments based on top header search query
  const filteredAppointments = appointments.filter(app => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      app.patientName.toLowerCase().includes(query) ||
      app.patientId.toLowerCase().includes(query) ||
      app.reason.toLowerCase().includes(query)
    );
  });

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => {
      setShowToast(null);
    }, 3000);
  };

  const handleReviewLab = () => {
    setLabReviewed(true);
    triggerToast("Resultados de laboratorio revisados y archivados en el expediente de T. Higgins.");
  };

  const handleSignRx = () => {
    setRxSigned(true);
    triggerToast("3 recetas firmadas y enviadas a la cola de la farmacia.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Buenos Días, Dr. Miller</h2>
          <p className="text-sm text-slate-500 font-medium">Aquí tiene su resumen clínico para hoy, 24 de Octubre.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onAddPatientClick}
            className="px-4 py-2 bg-white border border-indigo-600 text-indigo-600 font-bold text-xs rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2 shadow-sm cursor-pointer active:scale-98"
          >
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Añadir Paciente</span>
          </button>
        </div>
      </div>

      {/* Grid: Stats & Mini-Calendar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Stats Columns (Spans 8 cols) */}
        <div className="xl:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Stat Card 1: Today Appointments */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md">HOY</span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{appointments.length + 10}</h3>
              <p className="text-xs text-slate-500 font-medium">Citas Programadas</p>
            </div>
          </div>

          {/* Stat Card 2: New Patients This Week */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md">ESTA SEMANA</span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight">8</h3>
              <p className="text-xs text-slate-500 font-medium">Nuevos Pacientes Registrados</p>
            </div>
          </div>

          {/* Stat Card 3: Pending Rx Review */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
            {/* Soft decorative striped warning pattern on background */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #FFC107 25%, transparent 25%, transparent 75%, #FFC107 75%, #FFC107)',
              backgroundPosition: '0 0',
              backgroundSize: '20px 20px'
            }} />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center border border-amber-200">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <span className="bg-amber-100 text-amber-800 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md">PENDIENTE</span>
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{rxSigned ? '2' : '5'}</h3>
              <p className="text-xs text-slate-500 font-medium">Recetas por Revisar</p>
            </div>
          </div>
        </div>

        {/* Mini Calendar (Spans 4 cols) */}
        <div className="xl:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-slate-800">Octubre 2024</h3>
            <div className="flex space-x-1 text-slate-400">
              <button className="p-1 rounded hover:bg-slate-50 transition-colors cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
              <button className="p-1 rounded hover:bg-slate-50 transition-colors cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2">
            <div>D</div><div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Days placeholder for calendar view of October 2024 */}
            <div className="text-slate-300 py-1">29</div>
            <div className="text-slate-300 py-1">30</div>
            {[...Array(31)].map((_, i) => {
              const day = i + 1;
              const isToday = day === selectedDay;
              const hasApt = day === 7 || day === 12 || day === 24 || day === 26;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`py-1 rounded-lg relative font-medium cursor-pointer transition-all ${
                    isToday 
                      ? 'bg-indigo-600 text-white font-bold shadow-sm' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {day}
                  {hasApt && !isToday && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Main Agenda & Side Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Today's Agenda (Spans 8 cols) */}
        <div className="xl:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              Agenda de Hoy ({selectedDay === 24 ? filteredAppointments.length : 0})
            </h3>
            <button 
              onClick={onAddAppointmentClick}
              className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agendar Cita</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            {selectedDay !== 24 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-sm font-medium">No hay citas programadas para el {selectedDay} de Octubre de 2024.</p>
                <button 
                  onClick={() => setSelectedDay(24)}
                  className="mt-2 text-xs text-indigo-600 font-bold hover:underline"
                >
                  Volver a hoy (24)
                </button>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-sm font-medium">Ninguna cita coincide con su filtro de búsqueda.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hora</th>
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Paciente</th>
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Motivo</th>
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.map((app) => {
                    // Extract initials
                    const initials = app.patientName.split(' ').map(n => n[0]).join('');
                    
                    return (
                      <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 text-xs font-bold text-slate-700 whitespace-nowrap">
                          {app.time}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shadow-sm border border-indigo-100">
                              {initials}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{app.patientName}</p>
                              <p className="text-[10px] text-slate-500 font-mono">ID: {app.patientId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-xs text-slate-600 font-medium">
                          {app.reason}
                        </td>
                        <td className="p-4">
                          <span className={`inline-block font-bold text-[10px] px-2.5 py-0.5 rounded-md ${
                            app.status === 'ARRIVED' 
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                              : app.status === 'CHECKING IN'
                              ? 'bg-slate-100 text-slate-600 border border-slate-200'
                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}>
                            {app.status === 'ARRIVED' ? 'LLEGÓ' : app.status === 'CHECKING IN' ? 'REGISTRÁNDOSE' : 'PROGRAMADO'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => onOpenPatientChart(app.patientId)}
                            title="Open Patient Chart"
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-all active:scale-90 cursor-pointer"
                          >
                            <FolderOpen className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Action Required & Alerts (Spans 4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Action Required Box */}
          <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-5 shadow-sm">
            <h4 className="font-bold text-amber-800 text-sm mb-3.5 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Acción Requerida</span>
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800">Revisar Resultados de Lab</p>
                  <p className="text-[10px] text-slate-500">T. Higgins - Escaneo OCT</p>
                </div>
                <button
                  disabled={labReviewed}
                  onClick={handleReviewLab}
                  className={`text-xs font-bold px-3 py-1 rounded transition-all border ${
                    labReviewed
                      ? 'text-slate-400 bg-slate-100 border-slate-200 cursor-not-allowed'
                      : 'text-indigo-600 border-indigo-600/30 bg-white hover:bg-indigo-50 active:scale-95 cursor-pointer font-semibold'
                  }`}
                >
                  {labReviewed ? 'Revisado' : 'Revisar'}
                </button>
              </li>

              <li className="flex items-start justify-between gap-4 border-t border-amber-200/50 pt-3.5">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800">Firmar Recetas (3)</p>
                  <p className="text-[10px] text-slate-500">Autorización Pendiente</p>
                </div>
                <button
                  disabled={rxSigned}
                  onClick={handleSignRx}
                  className={`text-xs font-bold px-3 py-1 rounded transition-all border ${
                    rxSigned
                      ? 'text-slate-400 bg-slate-100 border-slate-200 cursor-not-allowed'
                      : 'text-indigo-600 border-indigo-600/30 bg-white hover:bg-indigo-50 active:scale-95 cursor-pointer font-semibold'
                  }`}
                >
                  {rxSigned ? 'Firmado' : 'Firmar'}
                </button>
              </li>
            </ul>
          </div>

          {/* System Status Banner */}
          <div className="bg-gradient-to-br from-indigo-50/50 to-indigo-100/30 border border-indigo-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[10px] font-bold text-indigo-700 tracking-widest uppercase">ESTADO DEL SISTEMA</h4>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Todas las modalidades de imagen oftálmica, escáneres OCT y autorrefractómetros están conectados de forma segura y sincronizando datos normalmente.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Action Notifications/Toasts */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-gray-900 text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-xl z-50 flex items-center gap-2 border border-gray-800"
          >
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
