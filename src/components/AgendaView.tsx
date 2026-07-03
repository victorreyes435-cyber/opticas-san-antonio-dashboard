import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  MoreHorizontal, 
  Clock, 
  CheckCircle,
  HelpCircle,
  Plus,
  Eye,
  Trash2,
  Download,
  MessageSquare,
  Phone
} from 'lucide-react';
import { Appointment, Technologist, Patient } from '../types';
import { TECHNOLOGISTS } from '../data';

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
  // Calendar States
  const [currentDay, setCurrentDay] = useState<number>(12);
  const [viewMode, setViewMode] = useState<'Day' | 'Week'>('Week');

  // Appointment detail popup
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

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
      const apptDate = `${currentDay} de Octubre de 2023`;
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

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-8.5rem)] overflow-hidden">
      {/* LEFT SIDEBAR: Mini Calendar & Filters */}
      <aside className="w-full xl:w-72 shrink-0 flex flex-col gap-6 overflow-y-auto pr-1">
        {/* October 2023 Mini-Calendar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Octubre 2023</h3>
            <div className="flex gap-1 text-slate-400">
              <button className="p-1 rounded hover:bg-slate-50 transition-colors cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
              <button className="p-1 rounded hover:bg-slate-50 transition-colors cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2">
            <div>Do</div><div>Lu</div><div>Ma</div><div>Mi</div><div>Ju</div><div>Vi</div><div>Sa</div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Days placeholders for October 2023 */}
            <div className="text-slate-300 py-1">1</div>
            <div className="text-slate-300 py-1">2</div>
            <div className="text-slate-300 py-1">3</div>
            {[...Array(14)].map((_, i) => {
              const day = i + 4;
              const isSelected = day === currentDay;
              return (
                <button
                  key={day}
                  onClick={() => setCurrentDay(day)}
                  className={`py-1 rounded-lg font-medium cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-indigo-600 text-white font-bold shadow-sm' 
                      : 'hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
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
              Jueves, {currentDay} de Octubre de 2023
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
                {selectedTechs.includes('dr_reynolds') && currentDay === 12 && (
                  <>
                    {/* Confirmed Appt J. Doe Glaucoma Follow-up (8:30 - 9:30) */}
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      onClick={() => {
                        const apt = appointments.find(a => a.id === 'apt_4') || appointments[0];
                        setSelectedAppointment({
                          ...apt,
                          patientName: 'Jane Doe',
                          patientId: '123-456-78',
                          time: '08:30 AM - 09:30 AM',
                          reason: 'Glaucoma Follow-up',
                          status: 'ARRIVED',
                          technologistId: 'dr_reynolds',
                          room: 'Room 1 (OCT)'
                        });
                      }}
                      className="absolute left-1 right-2 top-[48px] h-[96px] bg-indigo-50/80 border border-indigo-200 border-l-4 border-indigo-600 rounded-r-lg shadow-sm p-2.5 flex flex-col justify-between cursor-pointer group"
                    >
                      <div>
                        <div className="text-xs font-bold text-indigo-950 truncate group-hover:underline">
                          Jane Doe - Glaucoma Follow-up
                        </div>
                        <div className="text-[10px] text-indigo-700 font-semibold flex items-center gap-1 mt-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>8:30 AM - 9:30 AM</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-indigo-700 bg-white/85 px-1.5 py-0.5 rounded border border-indigo-200/50 self-start">
                        Sala 1
                      </span>
                    </motion.div>

                    {/* Pending Appt M. Smith (10:00 - 10:45) */}
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      onClick={() => {
                        const apt = appointments.find(a => a.id === 'apt_1') || appointments[0];
                        setSelectedAppointment({
                          ...apt,
                          patientName: 'Michael Smith',
                          patientId: 'ms_01',
                          time: '10:00 AM - 10:45 AM',
                          reason: 'Comprehensive Exam',
                          status: 'SCHEDULED',
                          technologistId: 'dr_reynolds',
                          room: 'Room 1 (OCT)'
                        });
                      }}
                      className="absolute left-1 right-2 top-[192px] h-[72px] bg-amber-50/80 border border-amber-200 border-l-4 border-amber-600 rounded-r-lg shadow-sm p-2.5 flex flex-col justify-between cursor-pointer group"
                    >
                      <div>
                        <div className="text-xs font-bold text-amber-950 truncate group-hover:underline">
                          M. Smith - Comprehensive Exam
                        </div>
                        <div className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 mt-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>10:00 AM - 10:45 AM</span>
                        </div>
                      </div>
                    </motion.div>
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
                {selectedTechs.includes('sarah_chen') && currentDay === 12 && (
                  <>
                    {/* Completed L. Johnson (8:00 - 9:00) */}
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      onClick={() => {
                        const apt = appointments.find(a => a.id === 'apt_2') || appointments[0];
                        setSelectedAppointment({
                          ...apt,
                          patientName: 'L. Johnson',
                          patientId: 'lj_02',
                          time: '8:00 AM - 9:00 AM',
                          reason: 'Visual Field Test',
                          status: 'COMPLETED',
                          technologistId: 'sarah_chen',
                          room: 'Room 2 (Visual Field)'
                        });
                      }}
                      className="absolute left-1 right-2 top-0 h-[96px] bg-slate-50 border border-slate-200 border-l-4 border-slate-400 rounded-r-lg p-2.5 flex flex-col justify-between opacity-80 cursor-pointer group"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-700 truncate line-through decoration-slate-400 group-hover:underline">
                          L. Johnson - Visual Field Test
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>Completada</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Confirmed Appt R. Williams Post-Op Check (9:30 - 11:00) */}
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      onClick={() => {
                        const apt = appointments.find(a => a.id === 'apt_3') || appointments[0];
                        setSelectedAppointment({
                          ...apt,
                          patientName: 'Robert Williams',
                          patientId: 'rw_03',
                          time: '9:30 AM - 11:00 AM',
                          reason: 'Post-Op Check',
                          status: 'ARRIVED',
                          technologistId: 'sarah_chen',
                          room: 'Room 2 (Visual Field)',
                          priority: 'High'
                        });
                      }}
                      className="absolute left-1 right-2 top-[144px] h-[144px] bg-indigo-50/80 border border-indigo-200 border-l-4 border-indigo-600 rounded-r-lg shadow-sm p-2.5 flex flex-col justify-between cursor-pointer group"
                    >
                      <div>
                        <div className="text-xs font-bold text-indigo-950 truncate group-hover:underline">
                          R. Williams - Post-Op Check
                        </div>
                        <div className="text-[10px] text-indigo-700 font-semibold flex items-center gap-1 mt-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>9:30 AM - 11:00 AM</span>
                        </div>
                      </div>
                      <div className="mt-auto flex flex-wrap gap-1">
                        <span className="text-[9px] font-bold text-white bg-rose-500 px-1.5 py-0.5 rounded">
                          Prioridad Alta
                        </span>
                        <span className="text-[9px] font-bold text-indigo-700 bg-white/85 px-1.5 py-0.5 rounded border border-indigo-200/50">
                          Sala 2
                        </span>
                      </div>
                    </motion.div>
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
                      {selectedAppointment.status === 'COMPLETED' ? 'COMPLETADA' : selectedAppointment.status === 'ARRIVED' ? 'LLEGÓ' : 'PENDIENTE'}
                    </span>
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

                  <button
                    onClick={() => handleDeleteAppointment(selectedAppointment.id)}
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
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
