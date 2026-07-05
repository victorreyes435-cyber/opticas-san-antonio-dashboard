import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Users, 
  FileText, 
  CheckCircle,
  Check,
  Clock, 
  FolderOpen, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Search,
  MessageSquare,
  Phone,
  BarChart2,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Appointment, Patient } from '../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Cell
} from 'recharts';
// @ts-ignore
import opticaLogo from '../assets/images/optica_logo_1783040422387.jpg';

interface DashboardViewProps {
  appointments: Appointment[];
  patients: Patient[];
  onOpenPatientChart: (patientId: string) => void;
  onAddPatientClick: () => void;
  onAddAppointmentClick: () => void;
  searchQuery: string;
  userProfile?: {
    name: string;
    role: string;
  };
}

export default function DashboardView({ 
  appointments, 
  patients, 
  onOpenPatientChart, 
  onAddPatientClick,
  onAddAppointmentClick,
  searchQuery,
  userProfile
}: DashboardViewProps) {
  const todayDateObj = new Date();
  const currentYear = todayDateObj.getFullYear();
  const currentMonthNum = todayDateObj.getMonth();
  const currentDay = todayDateObj.getDate();
  const currentMonthName = todayDateObj.toLocaleDateString('es-ES', { month: 'long' });
  const capitalizedMonthName = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

  const [selectedDay, setSelectedDay] = useState<number>(currentDay);
  const [labReviewed, setLabReviewed] = useState(false);
  const [rxSigned, setRxSigned] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Calendar calculations
  const firstDayInstance = new Date(currentYear, currentMonthNum, 1);
  const startingDayOfWeek = firstDayInstance.getDay(); // 0 = Sunday, 1 = Monday, ...
  const daysInMonth = new Date(currentYear, currentMonthNum + 1, 0).getDate();
  const prevDaysInMonth = new Date(currentYear, currentMonthNum, 0).getDate();
  const prevMonthDaysToShow = startingDayOfWeek;

  // WhatsApp reminder state
  const [waSelectedApp, setWaSelectedApp] = useState<Appointment | null>(null);
  const [waPhone, setWaPhone] = useState<string>('');
  const [waMessage, setWaMessage] = useState<string>('');

  const handleOpenWaModal = (app: Appointment) => {
    setWaSelectedApp(app);
    const patient = patients.find(p => p.id === app.patientId);
    const phone = patient ? patient.phone : '';
    setWaPhone(phone);
    
    const techName = app.technologistId === 'dr_reynolds' 
      ? 'Dr. Reynolds' 
      : app.technologistId === 'sarah_chen' 
      ? 'Dra. Sarah Chen (OD)' 
      : 'Especialista';
      
    const apptDate = `${selectedDay} de ${capitalizedMonthName} de ${currentYear}`;
    const msg = `Hola *${app.patientName}*, le recordamos su cita programada para el día *${apptDate}* a las *${app.time}* con el especialista *${techName}* en *Ópticas San Antonio*. Por favor, confirme su asistencia respondiendo a este mensaje. ¡Le esperamos!`;
    setWaMessage(msg);
  };

  // Data for occupancy trends chart (daily simulated clinic occupancy dynamically matching the last 7 days)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const occupancyData = last7Days.map((d, index) => {
    const label = `${d.getDate()} ${d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')}`;
    const isToday = index === 6;
    const count = isToday ? appointments.length : (10 + (d.getDate() % 12));
    const pct = Math.min(100, count * 15);
    return { name: label, citas: count, ocupacion: pct };
  });

  // Calculate actual appointments count by specialist/technologist
  const techCounts = appointments.reduce((acc, app) => {
    acc[app.technologistId] = (acc[app.technologistId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Dynamic specialist data merged with typical historical data for display
  const specialistData = [
    { 
      name: 'Dr. Reynolds', 
      citas: (techCounts['dr_reynolds'] || 0) + 24, 
      departamento: 'Oftalmología', 
      color: '#6366f1',
      colorLight: '#e0e7ff'
    },
    { 
      name: 'Dra. S. Chen', 
      citas: (techCounts['sarah_chen'] || 0) + 31, 
      departamento: 'Optometría', 
      color: '#10b981',
      colorLight: '#d1fae5'
    },
    { 
      name: 'Marcus Pierce', 
      citas: (techCounts['marcus_pierce'] || 0) + 18, 
      departamento: 'Asistencia', 
      color: '#a855f7',
      colorLight: '#f3e8ff'
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg border border-slate-800 text-xs font-sans">
          <p className="font-bold mb-1 text-slate-300">{label}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} className="font-semibold text-[11px] flex items-center gap-1" style={{ color: item.color }}>
              <span>{item.name}:</span>
              <span className="text-white font-bold">{item.value}{item.unit || ''}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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

  const selectedDateStr = `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const todayDateStr = `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;

  const appointmentsForSelectedDay = filteredAppointments.filter(app => {
    if (app.date) {
      return app.date === selectedDateStr;
    } else {
      return selectedDateStr === todayDateStr;
    }
  });

  // Helper to parse HH:MM AM/PM into minutes since midnight for sorting
  const timeToMinutes = (timeStr: string) => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3]?.toUpperCase() || (hours >= 8 && hours < 12 ? 'AM' : 'PM');
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  // Filter out completed and find the 3 most important pending appointments for today (or selected day) by priority (High first) and then by time
  const importantUpcomingAppointments = [...appointmentsForSelectedDay]
    .filter(app => app.status !== 'COMPLETED')
    .sort((a, b) => {
      const aHigh = a.priority === 'High' ? 1 : 0;
      const bHigh = b.priority === 'High' ? 1 : 0;
      if (aHigh !== bHigh) {
        return bHigh - aHigh; // High priority first
      }
      return timeToMinutes(a.time) - timeToMinutes(b.time); // Earliest first
    })
    .slice(0, 3);

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
    <div className="space-y-6">
      {/* Optica San Antonio Logo Banner */}
      <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center gap-5 z-10 w-full sm:w-auto">
          <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-800 shrink-0 bg-black flex items-center justify-center p-1.5 shadow-md">
            <img 
              src={opticaLogo} 
              alt="Óptica San Antonio Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2.5">
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-900 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Sucursal San Antonio
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight mt-1">Óptica San Antonio</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-md leading-normal">
              Tecnología oftálmica y lentes de alta precisión para su salud visual.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 z-10 shrink-0 w-full sm:w-auto justify-center sm:justify-start">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sincronización Clínica</div>
            <div className="text-xs font-bold text-emerald-400 font-mono">EN LÍNEA Y ACTIVO</div>
          </div>
        </div>
      </div>

      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Buenos Días, {userProfile?.name || 'Doctor'}</h2>
          <p className="text-sm text-slate-500 font-medium">
            Aquí tiene su resumen clínico para hoy, {todayDateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}.
          </p>
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

      {/* Vista Compacta: Próximas Citas Importantes */}
      <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 border border-indigo-100 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Próximas Citas Destacadas</h3>
              <p className="text-[11px] text-slate-500 font-medium">Priorizadas por urgencia de examen y horario</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
            Hoy: {appointmentsForSelectedDay.filter(app => app.status !== 'COMPLETED').length} Pendientes
          </span>
        </div>

        {importantUpcomingAppointments.length === 0 ? (
          <div className="bg-white/80 border border-dashed border-slate-200 rounded-xl p-5 text-center text-slate-400 text-xs font-medium">
            No hay citas pendientes destacadas para el día seleccionado.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {importantUpcomingAppointments.map((app) => {
              const initials = app.patientName.split(' ').map(n => n[0]).join('');
              const isHigh = app.priority === 'High';
              return (
                <motion.div
                  key={app.id}
                  whileHover={{ y: -2 }}
                  className={`bg-white border rounded-xl p-4 shadow-xs transition-all relative overflow-hidden flex flex-col justify-between ${
                    isHigh ? 'border-rose-200 ring-1 ring-rose-50' : 'border-slate-100'
                  }`}
                >
                  {/* Subtle Top Indicator Accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    isHigh ? 'bg-rose-500' : 'bg-indigo-500'
                  }`} />
                  
                  <div className="space-y-2.5">
                    {/* Header: Time & Priority badge */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{app.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isHigh && (
                          <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-md">
                            Alta
                          </span>
                        )}
                        {app.isConfirmed ? (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5" title="Asistencia Confirmada">
                            <Check className="w-2.5 h-2.5" />
                            Conf.
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5" title="Confirmación Pendiente">
                            <Clock className="w-2.5 h-2.5" />
                            Pend.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Patient & Exam Details */}
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs shrink-0 border ${
                        isHigh 
                          ? 'bg-rose-50 text-rose-600 border-rose-100' 
                          : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                      }`}>
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{app.patientName}</p>
                        <p className="text-[10px] font-medium text-slate-500 truncate">{app.reason}</p>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100 my-2.5" />

                  {/* Footer Action row */}
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-semibold text-slate-400">
                      Sala: <span className="text-slate-700 font-bold">
                        {app.room === 'Room 1 (OCT)' ? 'Sala 1' : app.room === 'Room 2 (Visual Field)' ? 'Sala 2' : 'Sala 3'}
                      </span>
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleOpenWaModal(app)}
                        title="Avisar por WhatsApp"
                        className="p-1 text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-150 rounded transition-all active:scale-90 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenPatientChart(app.patientId)}
                        title="Ver Expediente"
                        className="p-1 text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-150 rounded transition-all active:scale-90 cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
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
            <h3 className="text-sm font-bold text-slate-800">{capitalizedMonthName} {currentYear}</h3>
            <div className="flex space-x-1 text-slate-400">
              <button className="p-1 rounded hover:bg-slate-50 transition-colors cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
              <button className="p-1 rounded hover:bg-slate-50 transition-colors cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2">
            <div>D</div><div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Previous month's days placeholders */}
            {[...Array(prevMonthDaysToShow)].map((_, i) => {
              const day = prevDaysInMonth - prevMonthDaysToShow + i + 1;
              return (
                <div key={`prev-${day}`} className="text-slate-300 py-1 font-medium">
                  {day}
                </div>
              );
            })}
            
            {/* Current month's days */}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const isToday = day === currentDay;
              const isSelected = day === selectedDay;
              
              const dayDateStr = `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const hasApt = appointments.some(app => {
                if (app.date) {
                  return app.date === dayDateStr;
                } else {
                  return day === currentDay;
                }
              });
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`py-1 rounded-lg relative font-medium cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-indigo-600 text-white font-bold shadow-sm' 
                      : isToday
                      ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {day}
                  {hasApt && !isSelected && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Visualizaciones de Datos de la Clínica */}
      <div className="grid grid-cols-1 gap-6">
        {/* Card 2: Citas por Especialista / Departamento */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Citas por Especialista</h3>
                <p className="text-[10px] text-slate-400 font-medium">Volumen acumulado de consultas</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
              Mensual
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={specialistData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontWeight={500}
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontWeight={500}
                  tickLine={false} 
                  axisLine={false} 
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar name="Total Consultas" dataKey="citas">
                  {specialistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
              {selectedDay === currentDay ? 'Agenda de Hoy' : `Agenda para el ${selectedDay} de ${capitalizedMonthName}`} ({appointmentsForSelectedDay.length})
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
            {appointmentsForSelectedDay.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-sm font-medium">No hay citas programadas para el {selectedDay} de {capitalizedMonthName} de {currentYear}.</p>
                {selectedDay !== currentDay && (
                  <button 
                    onClick={() => setSelectedDay(currentDay)}
                    className="mt-2 text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    Volver a hoy ({currentDay})
                  </button>
                )}
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
                  {appointmentsForSelectedDay.map((app) => {
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
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-slate-800">{app.patientName}</p>
                                {app.isConfirmed ? <Check className="w-3.5 h-3.5 text-emerald-500" title="Asistencia Confirmada" /> : <Clock className="w-3.5 h-3.5 text-slate-300" title="Confirmación Pendiente" />}
                              </div>
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
                        <td className="p-4 text-right flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenWaModal(app)}
                            title="Avisar por WhatsApp"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-all active:scale-90 cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenPatientChart(app.patientId)}
                            title="Ver Expediente"
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

      {/* WhatsApp Reminder Modal */}
      <AnimatePresence>
        {waSelectedApp && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200"
            >
              <div className="bg-emerald-600 text-white p-5 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-100">Notificar Cita por WhatsApp</h3>
                  <p className="text-base font-bold mt-1">Paciente: {waSelectedApp.patientName}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <MessageSquare className="w-5 h-5" />
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Número de Teléfono
                  </label>
                  <input
                    type="text"
                    value={waPhone}
                    onChange={(e) => setWaPhone(e.target.value)}
                    placeholder="ej. +56912345678"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg p-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400">Verifique que incluya el código de país sin el signo + ni espacios para asegurar compatibilidad.</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Mensaje del Recordatorio
                  </label>
                  <textarea
                    rows={5}
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none leading-relaxed"
                  />
                </div>

                <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setWaSelectedApp(null)}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg text-xs font-semibold cursor-pointer transition-colors text-center"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      const cleanNum = waPhone.replace(/[^\d+]/g, '');
                      const url = `https://wa.me/${cleanNum}?text=${encodeURIComponent(waMessage)}`;
                      window.open(url, '_blank');
                      setWaSelectedApp(null);
                      setShowToast("¡Recordatorio enviado por WhatsApp!");
                      setTimeout(() => setShowToast(null), 3000);
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Enviar Mensaje</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
    </div>
  );
}
