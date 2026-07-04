import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  MoreHorizontal, 
  Clock, 
  CheckCircle,
  Check,
  HelpCircle,
  Plus,
  Eye,
  Trash2,
  Download,
  MessageSquare,
  Phone,
  Calendar,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Appointment, Technologist, Patient } from '../types';
import { TECHNOLOGISTS } from '../data';
import { useAuth } from '../context/AuthContext.tsx';

interface AgendaViewProps {
  appointments: Appointment[];
  patients: Patient[];
  setAppointments: Dispatch<SetStateAction<Appointment[]>>;
  onOpenPatientChart: (patientId: string) => void;
  onAddAppointmentClick: () => void;
  searchQuery: string;
}

export default function AgendaView({ 
  appointments, 
  patients,
  setAppointments,
  onOpenPatientChart,
  onAddAppointmentClick,
  searchQuery
}: AgendaViewProps) {
  const { googleToken, signIn } = useAuth();
  const [gcalEvents, setGcalEvents] = useState<any[]>([]);
  const [gcalLoading, setGcalLoading] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const fetchGcalEvents = async () => {
    if (!googleToken) return;
    setGcalLoading(true);
    try {
      const now = new Date().toISOString();
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=5&timeMin=${now}&singleEvents=true&orderBy=startTime`, {
        headers: { Authorization: `Bearer ${googleToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGcalEvents(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch Google Calendar events:', err);
    } finally {
      setGcalLoading(false);
    }
  };

  useEffect(() => {
    if (googleToken) {
      fetchGcalEvents();
    }
  }, [googleToken]);

  const todayDateObj = new Date();
  const currentYear = todayDateObj.getFullYear();
  const currentMonthNum = todayDateObj.getMonth();
  const todayDayNum = todayDateObj.getDate();
  const currentMonthName = todayDateObj.toLocaleDateString('es-ES', { month: 'long' });
  const capitalizedMonthName = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

  // Calendar States
  const [currentDay, setCurrentDay] = useState<number>(todayDayNum);
  const [viewMode, setViewMode] = useState<'Day' | 'Week'>('Week');

  // Calendar calculations
  const firstDayInstance = new Date(currentYear, currentMonthNum, 1);
  const startingDayOfWeek = firstDayInstance.getDay(); // 0 = Sunday, 1 = Monday, ...
  const daysInMonth = new Date(currentYear, currentMonthNum + 1, 0).getDate();
  const prevDaysInMonth = new Date(currentYear, currentMonthNum, 0).getDate();
  const prevMonthDaysToShow = startingDayOfWeek;

  // Appointment detail popup
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  useEffect(() => {
    setShowDeleteConfirm(false);
  }, [selectedAppointment]);

  // WhatsApp states
  const [waPhone, setWaPhone] = useState<string>('');
  const [waMessage, setWaMessage] = useState<string>('');
  const [showWaPanel, setShowWaPanel] = useState<boolean>(false);

  useEffect(() => {
    if (selectedAppointment) {
      const patient = patients?.find(p => p.id === selectedAppointment.patientId);
      const phone = patient ? patient.phone : '';
      setWaPhone(phone);
      
      const tech = TECHNOLOGISTS.find(t => t.id === selectedAppointment.technologistId) || { name: 'Especialista' };
      const apptDate = `${currentDay} de ${capitalizedMonthName} de ${currentYear}`;
      const msg = `Hola *${selectedAppointment.patientName}*, le recordamos su cita programada para el día *${apptDate}* a las *${selectedAppointment.time}* con el especialista *${tech.name}* en *Ópticas San Antonio*. Por favor, confirme su asistencia respondiendo a este mensaje. ¡Le esperamos!`;
      setWaMessage(msg);
      setShowWaPanel(false);
    }
  }, [selectedAppointment, currentDay, patients]);

  const handleExportCSV = () => {
    const headers = ["ID Cita", "Paciente", "ID Paciente", "Horario", "Sala", "Tecnologo ID", "Motivo", "Estado", "Prioridad"];
    const rows = appointments.map(apt => [
      apt.id,
      apt.patientName,
      apt.patientId,
      apt.time,
      apt.room,
      apt.technologistId,
      apt.reason,
      apt.status,
      apt.priority || "Normal"
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `agenda_clinica_ophthalmopro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter States
  const [selectedTechs, setSelectedTechs] = useState<string[]>(['dr_reynolds', 'sarah_chen']);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([
    'Room 1 (OCT)', 
    'Room 2 (Visual Field)', 
    'Room 3 (Standard)'
  ]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['Confirmed', 'Pending', 'Completed']);

  // Toggle checks helper
  const handleTechToggle = (id: string) => {
    setSelectedTechs(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleRoomToggle = (room: string) => {
    setSelectedRooms(prev => 
      prev.includes(room) ? prev.filter(r => r !== room) : [...prev, room]
    );
  };

  // Predefined mapping of appts status to Legend category
  const getStatusCategory = (status: string): string => {
    if (status === 'ARRIVED') return 'Confirmed';
    if (status === 'CHECKING IN') return 'Pending';
    if (status === 'SCHEDULED') return 'Pending';
    return 'Completed';
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    setSelectedAppointment(null);
  };

  // Filter our appointments based on selected sidebar criteria
  const filteredAppointments = appointments.filter(app => {
    // Technologist filter
    if (!selectedTechs.includes(app.technologistId)) return false;
    // Room filter
    if (!selectedRooms.includes(app.room)) return false;
    // Status filter
    const cat = getStatusCategory(app.status);
    if (!selectedStatuses.includes(cat)) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        app.patientName.toLowerCase().includes(q) ||
        app.patientId.toLowerCase().includes(q) ||
        app.reason.toLowerCase().includes(q) ||
        app.room.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const selectedDateStr = `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
  const todayDateStr = `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}-${String(todayDayNum).padStart(2, '0')}`;

  const appointmentsForSelectedDay = filteredAppointments.filter(app => {
    if (app.date) {
      return app.date === selectedDateStr;
    } else {
      return selectedDateStr === todayDateStr;
    }
  });

  const getPositionForTime = (timeStr: string) => {
    const startPart = timeStr.split('-')[0].trim().toUpperCase();
    const match = startPart.match(/(\d+):(\d+)\s*(AM|PM)?/);
    if (!match) return { top: 96, height: 72 };

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3] || (hours >= 8 && hours < 12 ? 'AM' : 'PM');

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const startHour = 8;
    const elapsedMinutes = (hours - startHour) * 60 + minutes;
    const top = Math.max(0, elapsedMinutes * 1.6);

    let durationMinutes = 45;
    if (timeStr.includes('-')) {
      const endPart = timeStr.split('-')[1].trim().toUpperCase();
      const endMatch = endPart.match(/(\d+):(\d+)\s*(AM|PM)?/);
      if (endMatch) {
        let endHours = parseInt(endMatch[1], 10);
        const endMinutes = parseInt(endMatch[2], 10);
        const endPeriod = endMatch[3] || (endHours >= 8 && endHours < 12 ? 'AM' : 'PM');
        if (endPeriod === 'PM' && endHours < 12) endHours += 12;
        if (endPeriod === 'AM' && endHours === 12) endHours = 0;
        durationMinutes = (endHours - hours) * 60 + (endMinutes - minutes);
      }
    }

    const height = Math.max(48, durationMinutes * 1.6);
    return { top, height };
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-8.5rem)] overflow-hidden">
      {/* LEFT SIDEBAR: Mini Calendar & Filters */}
      <aside className="w-full xl:w-72 shrink-0 flex flex-col gap-6 overflow-y-auto pr-1">
        {/* Dynamic Mini-Calendar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">{capitalizedMonthName} {currentYear}</h3>
            <div className="flex gap-1 text-slate-400">
              <button className="p-1 rounded hover:bg-slate-50 transition-colors cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
              <button className="p-1 rounded hover:bg-slate-50 transition-colors cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2">
            <div>Do</div><div>Lu</div><div>Ma</div><div>Mi</div><div>Ju</div><div>Vi</div><div>Sa</div>
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
              const isToday = day === todayDayNum;
              const isSelected = day === currentDay;
              return (
                <button
                  key={day}
                  onClick={() => setCurrentDay(day)}
                  className={`py-1 rounded-lg font-medium cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-indigo-600 text-white font-bold shadow-sm' 
                      : isToday
                      ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* GOOGLE CALENDAR SIDEBAR CARD */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Google Calendar</span>
            </h3>
            {googleToken && (
              <button
                onClick={fetchGcalEvents}
                disabled={gcalLoading}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-750 transition-colors"
                title="Sincronizar"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${gcalLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>

          {!googleToken ? (
            <div className="p-3 bg-slate-50 border border-slate-150 rounded-lg text-center space-y-2.5">
              <p className="text-[10px] text-slate-400 leading-normal">
                Conecta tu Google Calendar para sincronizar y ver eventos clínicos.
              </p>
              <button
                onClick={signIn}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-3 rounded-lg text-[10px] transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Conectar GCal</span>
              </button>
            </div>
          ) : gcalLoading ? (
            <div className="flex justify-center py-6">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : gcalEvents.length === 0 ? (
            <p className="text-[10px] text-slate-400 text-center py-4">No hay eventos próximos.</p>
          ) : (
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {gcalEvents.map((evt) => {
                const date = evt.start?.dateTime ? new Date(evt.start.dateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'Todo el día';
                return (
                  <div key={evt.id} className="p-2 bg-indigo-50/30 border border-indigo-100/50 rounded-lg flex flex-col gap-0.5">
                    <p className="font-bold text-slate-800 text-[11px] truncate">{evt.summary || '(Sin título)'}</p>
                    <p className="text-[9px] text-indigo-700 font-medium font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{date}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Filters Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Filtros</h3>
            <button 
              onClick={() => {
                setSelectedTechs(['dr_reynolds', 'sarah_chen']);
                setSelectedRooms(['Room 1 (OCT)', 'Room 2 (Visual Field)', 'Room 3 (Standard)']);
                setSelectedStatuses(['Confirmed', 'Pending', 'Completed']);
              }}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              Restablecer
            </button>
          </div>

          {/* Technologists list */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Tecnólogos</h4>
            <div className="space-y-2.5">
              {TECHNOLOGISTS.map((tech) => (
                <label key={tech.id} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedTechs.includes(tech.id)}
                    onChange={() => handleTechToggle(tech.id)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4 cursor-pointer"
                  />
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] border ${
                    tech.id === 'dr_reynolds' 
                      ? 'bg-indigo-50 text-indigo-600 border-indigo-100' 
                      : tech.id === 'sarah_chen'
                      ? 'bg-amber-50 text-amber-800 border-amber-100'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-100'
                  }`}>
                    {tech.initials}
                  </div>
                  <span className="text-xs text-slate-600 group-hover:text-indigo-600 font-medium transition-colors">
                    {tech.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Exam Rooms list */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Salas de Examen</h4>
            <div className="space-y-2.5">
              {[
                { label: 'Sala 1 (OCT)', value: 'Room 1 (OCT)' },
                { label: 'Sala 2 (Campo Visual)', value: 'Room 2 (Visual Field)' },
                { label: 'Sala 3 (Estándar)', value: 'Room 3 (Standard)' }
              ].map((roomObj) => (
                <label key={roomObj.value} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedRooms.includes(roomObj.value)}
                    onChange={() => handleRoomToggle(roomObj.value)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 group-hover:text-indigo-600 font-medium transition-colors">
                    {roomObj.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Status legend list */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Estado</h4>
            <div className="space-y-2.5">
              {[
                { name: 'Confirmed', label: 'Confirmada', color: 'bg-indigo-600' },
                { name: 'Pending', label: 'Pendiente', color: 'bg-amber-500' },
                { name: 'Completed', label: 'Completada', color: 'bg-slate-400' }
              ].map((status) => (
                <label key={status.name} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status.name)}
                    onChange={() => handleStatusToggle(status.name)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4 cursor-pointer"
                  />
                  <div className={`w-3 h-3 rounded-sm ${status.color}`}></div>
                  <span className="text-xs text-slate-600 group-hover:text-indigo-600 font-medium transition-colors">
                    {status.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT MEDICAL SCHEDULER */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden shadow-sm h-full">
        {/* Scheduler Header */}
        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-sm md:text-base font-bold text-slate-800">
              {(() => {
                const selectedDayDate = new Date(currentYear, currentMonthNum, currentDay);
                const weekdayName = selectedDayDate.toLocaleDateString('es-ES', { weekday: 'long' });
                const capitalizedWeekday = weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1);
                return `${capitalizedWeekday}, ${currentDay} de ${capitalizedMonthName} de ${currentYear}`;
              })()}
            </h2>
            <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              <button 
                onClick={() => setViewMode('Day')}
                className={`px-3 py-1 text-xs font-bold rounded cursor-pointer transition-all ${
                  viewMode === 'Day' 
                    ? 'bg-white shadow-sm text-indigo-600' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Día
              </button>
              <button 
                onClick={() => setViewMode('Week')}
                className={`px-3 py-1 text-xs font-bold rounded cursor-pointer transition-all ${
                  viewMode === 'Week' 
                    ? 'bg-white shadow-sm text-indigo-600' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Vista Semanal
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer mr-2"
              title="Exportar citas a formato CSV"
            >
              <Download className="w-4 h-4 text-indigo-500" />
              <span>Exportar CSV</span>
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Agenda</span>
            </button>
            <div className="h-5 w-px bg-slate-200 mx-1"></div>
            <button className="text-slate-400 hover:text-slate-700">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scheduler Body Grid Container */}
        <div className="flex-1 overflow-auto relative">
          {/* Sticky Doctors/Rooms Column Headers */}
          <div className="sticky top-0 z-10 flex border-b border-slate-200 bg-slate-50">
            {/* Hour index column header */}
            <div className="w-16 shrink-0 border-r border-slate-200 bg-slate-50"></div>
            
            {/* Dynamic Provider Columns */}
            <div className="flex-1 grid grid-cols-2 divide-x divide-slate-200">
              <div className="p-3 text-center">
                <div className="text-xs font-bold text-slate-800">Dr. Reynolds</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Sala 1 (OCT)</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-xs font-bold text-slate-800">Sarah Chen (OD)</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Sala 2 (Campo Visual)</div>
              </div>
            </div>
          </div>

          {/* Grid rows scheduler cells */}
          <div className="flex relative min-h-[500px]">
            {/* Live Clinical Red line indicator */}
            <div className="absolute w-full h-[2px] bg-rose-600 z-10 top-[220px] pointer-events-none flex items-center">
              <div className="w-2 h-2 rounded-full bg-rose-600 -ml-1 shadow-md animate-pulse"></div>
            </div>

            {/* Hours Indicators on Left Column */}
            <div className="w-16 shrink-0 border-r border-slate-200 bg-slate-50/50 flex flex-col font-mono text-[10px] text-slate-400 font-bold divide-y divide-slate-200/60 select-none">
              <div className="h-24 p-2 text-right">8 AM</div>
              <div className="h-24 p-2 text-right">9 AM</div>
              <div className="h-24 p-2 text-right">10 AM</div>
              <div className="h-24 p-2 text-right">11 AM</div>
              <div className="h-24 p-2 text-right">12 PM</div>
              <div className="h-24 p-2 text-right bg-slate-100/30">1 PM</div>
            </div>

            {/* Interactive Grid Columns */}
            <div className="flex-grow flex relative">
              {/* Columns divide line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 pointer-events-none"></div>

              {/* Dr Reynolds Column Slots */}
              <div className="flex-grow flex-1 relative divide-y divide-slate-200/50">
                <div className="h-24 hover:bg-indigo-50/20 transition-colors cursor-crosshair relative" onClick={onAddAppointmentClick}></div>
                <div className="h-24 hover:bg-indigo-50/20 transition-colors cursor-crosshair relative" onClick={onAddAppointmentClick}></div>
                <div className="h-24 hover:bg-indigo-50/20 transition-colors cursor-crosshair relative" onClick={onAddAppointmentClick}></div>
                <div className="h-24 hover:bg-indigo-50/20 transition-colors cursor-crosshair relative" onClick={onAddAppointmentClick}></div>
                <div className="h-24 hover:bg-indigo-50/20 transition-colors cursor-crosshair relative bg-slate-50/10" onClick={onAddAppointmentClick}></div>

                {/* Absolutes for Dr Reynolds */}
                {selectedTechs.includes('dr_reynolds') && (
                  <>
                    {appointmentsForSelectedDay
                      .filter(app => app.technologistId === 'dr_reynolds')
                      .map(app => {
                        const { top, height } = getPositionForTime(app.time);
                        const isCompleted = app.status === 'COMPLETED';
                        const isArrived = app.status === 'ARRIVED';
                        const isHighPriority = app.priority === 'High';
                        
                        return (
                          <motion.div 
                            key={app.id}
                            whileHover={{ scale: 1.01 }}
                            onClick={() => setSelectedAppointment(app)}
                            style={{ top: `${top}px`, height: `${height}px` }}
                            className={`absolute left-1 right-2 rounded-r-lg shadow-sm p-2.5 flex flex-col justify-between cursor-pointer group border-l-4 transition-all ${
                              isCompleted
                                ? 'bg-slate-50 border-slate-400 border opacity-80'
                                : isArrived
                                ? 'bg-indigo-50/80 border-indigo-200 border-l-indigo-600 text-indigo-950'
                                : 'bg-amber-50/80 border-amber-200 border-l-amber-600 text-amber-950'
                            }`}
                          >
                            <div>
                              <div className={`text-xs font-bold truncate group-hover:underline flex items-center gap-1 ${isCompleted ? 'text-slate-700 line-through decoration-slate-400' : 'text-slate-900'}`}>
                                {app.isConfirmed ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" title="Asistencia Confirmada" /> : <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0" title="Confirmación Pendiente" />}
                                <span className="truncate">{app.patientName} - {app.reason}</span>
                              </div>
                              <div className={`text-[10px] font-semibold flex items-center gap-1 mt-1 ${isCompleted ? 'text-slate-500' : isArrived ? 'text-indigo-700' : 'text-amber-700'}`}>
                                {isCompleted ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <Clock className="w-3.5 h-3.5" />}
                                <span>{app.time}</span>
                              </div>
                            </div>
                            <div className="mt-auto flex flex-wrap gap-1">
                              {isHighPriority && (
                                <span className="text-[9px] font-bold text-white bg-rose-500 px-1.5 py-0.5 rounded">
                                  Prioridad Alta
                                </span>
                              )}
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${isCompleted ? 'bg-slate-100 text-slate-500' : isArrived ? 'bg-white/85 text-indigo-700 border-indigo-200/50' : 'bg-white/85 text-amber-700 border-amber-200/50'}`}>
                                {app.room === 'Room 1 (OCT)' ? 'Sala 1' : app.room === 'Room 2 (Visual Field)' ? 'Sala 2' : 'Sala 3'}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })
                    }
                  </>
                )}
              </div>

              {/* Sarah Chen (OD) Column Slots */}
              <div className="flex-grow flex-1 relative divide-y divide-slate-200/50">
                <div className="h-24 hover:bg-indigo-50/20 transition-colors cursor-crosshair relative" onClick={onAddAppointmentClick}></div>
                <div className="h-24 hover:bg-indigo-50/20 transition-colors cursor-crosshair relative" onClick={onAddAppointmentClick}></div>
                <div className="h-24 hover:bg-indigo-50/20 transition-colors cursor-crosshair relative" onClick={onAddAppointmentClick}></div>
                <div className="h-24 hover:bg-indigo-50/20 transition-colors cursor-crosshair relative" onClick={onAddAppointmentClick}></div>
                <div className="h-24 hover:bg-indigo-50/20 transition-colors cursor-crosshair relative bg-slate-50/10" onClick={onAddAppointmentClick}></div>

                {/* Absolutes for Sarah Chen */}
                {selectedTechs.includes('sarah_chen') && (
                  <>
                    {appointmentsForSelectedDay
                      .filter(app => app.technologistId === 'sarah_chen')
                      .map(app => {
                        const { top, height } = getPositionForTime(app.time);
                        const isCompleted = app.status === 'COMPLETED';
                        const isArrived = app.status === 'ARRIVED';
                        const isHighPriority = app.priority === 'High';
                        
                        return (
                          <motion.div 
                            key={app.id}
                            whileHover={{ scale: 1.01 }}
                            onClick={() => setSelectedAppointment(app)}
                            style={{ top: `${top}px`, height: `${height}px` }}
                            className={`absolute left-1 right-2 rounded-r-lg shadow-sm p-2.5 flex flex-col justify-between cursor-pointer group border-l-4 transition-all ${
                              isCompleted
                                ? 'bg-slate-50 border-slate-400 border opacity-80'
                                : isArrived
                                ? 'bg-indigo-50/80 border-indigo-200 border-l-indigo-600 text-indigo-950'
                                : 'bg-amber-50/80 border-amber-200 border-l-amber-600 text-amber-950'
                            }`}
                          >
                            <div>
                              <div className={`text-xs font-bold truncate group-hover:underline flex items-center gap-1 ${isCompleted ? 'text-slate-700 line-through decoration-slate-400' : 'text-slate-900'}`}>
                                {app.isConfirmed ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" title="Asistencia Confirmada" /> : <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0" title="Confirmación Pendiente" />}
                                <span className="truncate">{app.patientName} - {app.reason}</span>
                              </div>
                              <div className={`text-[10px] font-semibold flex items-center gap-1 mt-1 ${isCompleted ? 'text-slate-500' : isArrived ? 'text-indigo-700' : 'text-amber-700'}`}>
                                {isCompleted ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <Clock className="w-3.5 h-3.5" />}
                                <span>{app.time}</span>
                              </div>
                            </div>
                            <div className="mt-auto flex flex-wrap gap-1">
                              {isHighPriority && (
                                <span className="text-[9px] font-bold text-white bg-rose-500 px-1.5 py-0.5 rounded">
                                  Prioridad Alta
                                </span>
                              )}
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${isCompleted ? 'bg-slate-100 text-slate-500' : isArrived ? 'bg-white/85 text-indigo-700 border-indigo-200/50' : 'bg-white/85 text-amber-700 border-amber-200/50'}`}>
                                {app.room === 'Room 1 (OCT)' ? 'Sala 1' : app.room === 'Room 2 (Visual Field)' ? 'Sala 2' : 'Sala 3'}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })
                    }
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Detail Modal Pop-up */}
      <AnimatePresence>
        {selectedAppointment && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden border border-slate-200"
            >
              <div className="bg-slate-900 text-white p-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Detalles de la Cita</h3>
                <p className="text-lg font-bold mt-1">{selectedAppointment.patientName}</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {selectedAppointment.patientId}</p>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Motivo</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedAppointment.reason}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Horario</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedAppointment.time}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Sala</p>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {selectedAppointment.room === 'Room 1 (OCT)' ? 'Sala 1 (OCT)' : selectedAppointment.room === 'Room 2 (Visual Field)' ? 'Sala 2 (Campo Visual)' : 'Sala 3 (Estándar)'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Estado</p>
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded mt-0.5 ${
                      selectedAppointment.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}>
                      {selectedAppointment.status === 'COMPLETED' ? 'COMPLETADA' : selectedAppointment.status === 'ARRIVED' ? 'LLEGÓ' : 'PROGRAMADA'}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Asistencia</p>
                    <button
                      onClick={() => {
                        const updated = { ...selectedAppointment, isConfirmed: !selectedAppointment.isConfirmed };
                        setAppointments(prev => prev.map(a => a.id === selectedAppointment.id ? updated : a));
                        setSelectedAppointment(updated);
                      }}
                      className={`mt-0.5 flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        selectedAppointment.isConfirmed
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200'
                      }`}
                    >
                      {selectedAppointment.isConfirmed ? <Check className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                      {selectedAppointment.isConfirmed ? 'CONFIRMADA' : 'PENDIENTE'}
                    </button>
                  </div>
                </div>

                {/* Seccion Recordatorio de WhatsApp */}
                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowWaPanel(!showWaPanel)}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold transition-all text-xs cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>Recordatorio por WhatsApp</span>
                    </span>
                    <span className="text-[10px]">{showWaPanel ? '▲' : '▼'}</span>
                  </button>

                  {showWaPanel && (
                    <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">
                          Número de Teléfono
                        </label>
                        <input
                          type="text"
                          value={waPhone}
                          onChange={(e) => setWaPhone(e.target.value)}
                          placeholder="ej. +56912345678"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono text-[11px] text-slate-800 focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">
                          Mensaje de Recordatorio
                        </label>
                        <textarea
                          rows={4}
                          value={waMessage}
                          onChange={(e) => setWaMessage(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[11px] text-slate-700 focus:outline-none focus:border-emerald-600 resize-none leading-normal"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const cleanNum = waPhone.replace(/[^\d+]/g, '');
                          const url = `https://wa.me/${cleanNum}?text=${encodeURIComponent(waMessage)}`;
                          window.open(url, '_blank');
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all active:scale-98"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Abrir WhatsApp</span>
                      </button>
                    </div>
                  )}
                </div>

                {showDeleteConfirm ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="bg-rose-50 border border-rose-100 rounded-lg p-3 space-y-3 mt-2 w-full text-left"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-rose-900">¿Cancelar esta cita?</p>
                        <p className="text-[10px] text-rose-750 leading-normal mt-0.5">
                          Esta acción eliminará permanentemente la cita de la agenda de la clínica.
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-md cursor-pointer transition-colors"
                      >
                        No, mantener
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md cursor-pointer transition-colors shadow-xs"
                      >
                        Sí, cancelar cita
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => {
                        onOpenPatientChart(selectedAppointment.patientId);
                        setSelectedAppointment(null);
                      }}
                      className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Expediente</span>
                    </button>

                    {googleToken && (
                      <button
                        onClick={async () => {
                          setSyncingId(selectedAppointment.id);
                          try {
                            const timeClean = selectedAppointment.time.split(' - ')[0] || selectedAppointment.time;
                            let hours = parseInt(timeClean.split(':')[0], 10);
                            const minutes = parseInt(timeClean.split(':')[1], 10) || 0;
                            if (timeClean.toLowerCase().includes('pm') && hours < 12) hours += 12;
                            if (timeClean.toLowerCase().includes('am') && hours === 12) hours = 0;
                            
                            const startDateTime = new Date();
                            startDateTime.setHours(hours, minutes, 0, 0);
                            const endDateTime = new Date(startDateTime.getTime() + 45 * 60 * 1000); // 45 mins duration

                            const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                              method: 'POST',
                              headers: {
                                Authorization: `Bearer ${googleToken}`,
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                summary: `Cita Médica: ${selectedAppointment.patientName}`,
                                description: `Examen: ${selectedAppointment.reason}\nSala: ${selectedAppointment.room}`,
                                start: { dateTime: startDateTime.toISOString() },
                                end: { dateTime: endDateTime.toISOString() }
                              })
                            });

                            if (res.ok) {
                              alert('¡Sincronizado con éxito en tu Google Calendar!');
                              fetchGcalEvents();
                            } else {
                              alert('Error al sincronizar con Google Calendar.');
                            }
                          } catch (err) {
                            console.error(err);
                            alert('Fallo de conexión al sincronizar con Google Calendar.');
                          } finally {
                            setSyncingId(null);
                          }
                        }}
                        disabled={syncingId === selectedAppointment.id}
                        className="p-2.5 bg-emerald-50 hover:bg-emerald-100 disabled:bg-slate-50 text-emerald-700 hover:text-emerald-800 border border-emerald-200 rounded-lg transition-colors cursor-pointer active:scale-95 flex items-center justify-center font-bold text-xs shrink-0"
                        title="Sincronizar con Google Calendar"
                      >
                        {syncingId === selectedAppointment.id ? (
                          <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Calendar className="w-4 h-4 text-emerald-600" />
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="p-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Cancelar Cita"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setSelectedAppointment(null)}
                      className="px-3 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
