import { useState, Dispatch, SetStateAction } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  History, 
  Eye, 
  HelpCircle, 
  Heart, 
  Activity, 
  ShieldAlert, 
  Clock, 
  CheckCircle,
  FileText,
  UserPlus,
  BookOpen,
  Printer,
  Trash2
} from 'lucide-react';
import { Patient, VisitHistoryItem, Prescription } from '../types';

interface PatientsViewProps {
  patients: Patient[];
  selectedPatientId: string;
  onPatientChange: (patientId: string) => void;
  visitHistory: VisitHistoryItem[];
  setVisitHistory: Dispatch<SetStateAction<VisitHistoryItem[]>>;
  onSwitchToPrescriptions: () => void;
  onAddPatientClick: () => void;
  onDeletePatient?: (patientId: string) => void;
  isDataLoaded?: boolean;
  searchQuery: string;
  prescriptions: Prescription[];
  clinicAddress?: string;
  clinicPhone?: string;
}

export default function PatientsView({ 
  patients, 
  selectedPatientId, 
  onPatientChange, 
  visitHistory,
  setVisitHistory,
  onSwitchToPrescriptions,
  onAddPatientClick,
  onDeletePatient,
  isDataLoaded = true,
  searchQuery,
  prescriptions,
  clinicAddress = 'Av. Principal 123, Ciudad Central',
  clinicPhone = '+1 (555) 123-4567'
}: PatientsViewProps) {
  // Find current patient data with robust fallback to prevent Uncaught TypeError on empty arrays
  const currentPatient = patients.find(p => p.id === selectedPatientId) || patients[0] || {
    id: '',
    name: 'Cargando...',
    dob: '',
    age: 0,
    sex: '',
    bloodType: '',
    phone: '',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    allergies: [],
    chronicConditions: []
  };

  // Find current prescriptions for printing safely
  const currentPrescriptions = currentPatient.id ? prescriptions.filter(rx => rx.patientId === currentPatient.id) : [];

  // Filter patients based on search query for select dropdown
  const filteredDropdownPatients = patients.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
  });

  // Ensure selected patient is always in the dropdown options
  const dropdownPatients = [...filteredDropdownPatients];
  if (selectedPatientId && !filteredDropdownPatients.some(p => p.id === selectedPatientId)) {
    const selectedPatient = patients.find(p => p.id === selectedPatientId);
    if (selectedPatient) {
      dropdownPatients.unshift(selectedPatient);
    }
  }

  // Filter visit history based on search query
  const filteredVisitHistory = visitHistory.filter(visit => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      visit.type.toLowerCase().includes(q) ||
      visit.notes.toLowerCase().includes(q) ||
      visit.provider.toLowerCase().includes(q) ||
      visit.date.toLowerCase().includes(q)
    );
  });

  // Tab State
  const [activeSubTab, setActiveSubTab] = useState<'consultation' | 'register' | 'history' | 'rx'>('consultation');

  // Interactive Form States
  const [chiefComplaint, setChiefComplaint] = useState('El paciente reporta visión borrosa, especialmente de noche. Experimenta sequedad ocular ocasional y fatiga durante turnos prolongados de lectura en computadora.');
  const [hpi, setHpi] = useState('Comenzó hace aproximadamente 3 meses. Progresivo de manera gradual. Sin pérdida repentina de visión. Describe dificultad para enfocar texto con poca luz.');
  const [ros, setRos] = useState('Sin dolores de cabeza, sin destellos de luz ni moscas volantes. Experimenta ardor leve e irritación por las tardes.');
  
  // Vitals State
  const [bp, setBp] = useState('120/80');
  const [hr, setHr] = useState('72');
  const [iopOD, setIopOD] = useState('15');
  const [iopOS, setIopOS] = useState('16');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSaveDraft = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccessMsg("¡Borrador de consulta guardado exitosamente!");
      setTimeout(() => setSuccessMsg(null), 3000);
    }, 1000);
  };

  const handleProceedToExam = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      // Add a new entry to visit history!
      const newItem: VisitHistoryItem = {
        id: 'visit_' + Date.now(),
        date: 'Hoy, 24 Oct, 2023',
        type: 'Consulta - Visión Borrosa',
        notes: `Motivo principal: ${chiefComplaint}. Signos vitales: PA ${bp}, FC ${hr}, PIO OD ${iopOD}, OS ${iopOS}.`,
        provider: 'Dr. Aris Thorne',
        icon: 'visibility'
      };
      setVisitHistory(prev => [newItem, ...prev]);
      setSuccessMsg("¡Consulta finalizada y añadida al historial del paciente!");
      setTimeout(() => setSuccessMsg(null), 4000);

      // Reset values
      setChiefComplaint('');
      setHpi('');
      setRos('');
    }, 1200);
  };

  if (!isDataLoaded && patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center w-full">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-slate-500">Cargando datos de pacientes...</p>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center w-full max-w-md mx-auto bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">No Hay Pacientes Registrados</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          Actualmente no hay perfiles de pacientes en la base de datos. Cree un nuevo perfil de paciente para comenzar a registrar recetas y consultas.
        </p>
        <button
          onClick={onAddPatientClick}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrar Primer Paciente</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row gap-6 items-start">
      {/* LEFT SIDEBAR: Patient profile & Selection */}
      <aside className="w-full xl:w-80 shrink-0 flex flex-col gap-6">
        
        {/* Patient Selection Dropdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Seleccionar Paciente Activo</label>
          <div className="flex gap-2">
            <select
              value={selectedPatientId}
              onChange={(e) => onPatientChange(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 cursor-pointer"
            >
              {dropdownPatients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
              ))}
            </select>
            <button 
              onClick={onAddPatientClick}
              title="Añadir Nuevo Paciente"
              className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 hover:bg-indigo-100/50 active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-sm">
          <img
            alt={currentPatient.name}
            className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-slate-100 shadow-sm"
            src={currentPatient.avatar}
            referrerPolicy="no-referrer"
          />
          <h3 className="text-lg font-bold text-slate-800">{currentPatient.name}</h3>
          <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {currentPatient.id}</p>
          
          <div className="w-full space-y-3 text-left mt-6 pt-4 border-t border-slate-100 text-xs">
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wide">Fecha de Nac.</span>
              <span className="font-semibold text-slate-700">{currentPatient.dob} ({currentPatient.age} años)</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wide">Sexo</span>
              <span className="font-semibold text-slate-700">{currentPatient.sex === 'Male' ? 'Masculino' : currentPatient.sex === 'Female' ? 'Femenino' : currentPatient.sex}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wide">Grupo Sanguíneo</span>
              <span className="font-semibold text-slate-700">{currentPatient.bloodType}</span>
            </div>
            <div className="flex justify-between pb-1 border-b border-slate-50">
              <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wide">Teléfono</span>
              <span className="font-semibold text-slate-700">{currentPatient.phone}</span>
            </div>
          </div>

          {onDeletePatient && currentPatient.id && (
            <button
              onClick={() => onDeletePatient(currentPatient.id)}
              className="mt-4 w-full px-3 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100/50 hover:text-rose-700 text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Paciente</span>
            </button>
          )}
        </div>

        {/* Morbid Antecedents */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
            <span>Antecedentes Médicos</span>
          </h4>
          <div className="space-y-4 text-xs">
            {/* Allergies list */}
            <div>
              <span className="font-bold text-[10px] text-slate-400 block mb-1.5 uppercase tracking-wide">ALERGIAS</span>
              <div className="flex flex-wrap gap-1.5">
                {currentPatient.allergies.map(allergy => (
                  <span key={allergy} className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-md font-bold text-[10px]">
                    {allergy === 'Seasonal pollen' ? 'Polen estacional' : allergy === 'Penicillin' ? 'Penicilina' : allergy}
                  </span>
                ))}
              </div>
            </div>

            {/* Chronic Conditions */}
            <div>
              <span className="font-bold text-[10px] text-slate-400 block mb-1.5 uppercase tracking-wide">CONDICIONES CRÓNICAS</span>
              <ul className="space-y-2">
                {currentPatient.chronicConditions.map((condition) => (
                  <li key={condition} className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0"></span>
                    <span className="text-slate-700 font-medium leading-relaxed">
                      {condition === 'Type 2 Diabetes' ? 'Diabetes Tipo 2' : condition === 'Hypertension' ? 'Hipertensión' : condition === 'Mild Myopia' ? 'Miopía Leve' : condition}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN ENCOUNTER WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Action Bar / Patient Detail Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm print:hidden">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Ficha Clínica de {currentPatient.name}</h2>
              <p className="text-[10px] text-slate-500 font-mono">ID de Paciente: {currentPatient.id}</p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer w-full sm:w-auto"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Resumen Clínico (PDF)</span>
          </button>
        </div>

        {/* Tabs Headers */}
        <div className="bg-white rounded-t-xl border-x border-t border-slate-200 overflow-hidden">
          <nav className="flex border-b border-slate-200 divide-x divide-slate-100 text-xs">
            <button
              onClick={() => setActiveSubTab('consultation')}
              className={`flex-1 md:flex-none px-6 py-4 font-bold uppercase tracking-wider text-center transition-colors cursor-pointer ${
                activeSubTab === 'consultation'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-slate-50'
                  : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              Motivo de Consulta
            </button>
            <button
              onClick={() => setActiveSubTab('register')}
              className={`flex-1 md:flex-none px-6 py-4 font-bold uppercase tracking-wider text-center transition-colors cursor-pointer ${
                activeSubTab === 'register'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-slate-50'
                  : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              Registro Médico
            </button>
            <button
              onClick={() => setActiveSubTab('history')}
              className={`flex-1 md:flex-none px-6 py-4 font-bold uppercase tracking-wider text-center transition-colors cursor-pointer ${
                activeSubTab === 'history'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-slate-50'
                  : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              Historial Personal
            </button>
            <button
              onClick={onSwitchToPrescriptions}
              className="flex-1 md:flex-none px-6 py-4 font-bold uppercase tracking-wider text-center text-slate-500 hover:text-indigo-600 hover:bg-slate-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Recetas</span>
            </button>
          </nav>
        </div>

        {/* Tab Content Area */}
        <div className="bg-white border-x border-b border-slate-200 rounded-b-xl p-6 md:p-8 flex-grow">
          {activeSubTab === 'consultation' && (
            <div className="space-y-6">
              {/* Encounter Metadata */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Consulta Actual</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Hoy, 24 de Oct, 2023 • Dr. Aris Thorne</p>
                </div>
                <span className="bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider">
                  En Curso
                </span>
              </div>

              {/* Patient Profile Notice */}
              {successMsg && (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg p-3.5 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Consultation Forms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide">Motivo Principal de Consulta</label>
                  <textarea
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    rows={3}
                    placeholder="Ingrese el motivo principal de la visita del paciente..."
                    className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide">Historia de la Enfermedad Actual (HPI)</label>
                  <textarea
                    value={hpi}
                    onChange={(e) => setHpi(e.target.value)}
                    rows={4}
                    placeholder="Detalles del síntoma o queja actual..."
                    className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide">Revisión por Sistemas (ROS)</label>
                  <textarea
                    value={ros}
                    onChange={(e) => setRos(e.target.value)}
                    rows={4}
                    placeholder="Hallazgos positivos y negativos pertinentes..."
                    className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none"
                  />
                </div>

                {/* Vitals Bento Box */}
                <div className="md:col-span-2 bg-slate-50 rounded-lg p-5 border border-slate-100">
                  <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span>Signos Vitales y Métricas Iniciales</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-500 text-[10px] uppercase">BP (mmHg)</label>
                      <input
                        type="text"
                        value={bp}
                        onChange={(e) => setBp(e.target.value)}
                        placeholder="120/80"
                        className="w-full bg-white rounded border border-slate-200 py-1.5 px-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-500 text-[10px] uppercase">HR (bpm)</label>
                      <input
                        type="text"
                        value={hr}
                        onChange={(e) => setHr(e.target.value)}
                        placeholder="72"
                        className="w-full bg-white rounded border border-slate-200 py-1.5 px-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-500 text-[10px] uppercase">IOP OD (mmHg)</label>
                      <input
                        type="text"
                        value={iopOD}
                        onChange={(e) => setIopOD(e.target.value)}
                        placeholder="15"
                        className="w-full bg-white rounded border border-slate-200 py-1.5 px-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-500 text-[10px] uppercase">IOP OS (mmHg)</label>
                      <input
                        type="text"
                        value={iopOS}
                        onChange={(e) => setIopOS(e.target.value)}
                        placeholder="16"
                        className="w-full bg-white rounded border border-slate-200 py-1.5 px-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="px-5 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-600 transition-colors active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  Guardar Borrador
                </button>
                <button
                  onClick={handleProceedToExam}
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-bold text-white transition-colors shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Procesando...' : 'Proceder al Examen'}
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'register' && (
            <div className="p-8 text-center text-slate-400 space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-medium">No hay registros médicos externos conectados en este espacio de trabajo.</p>
              <p className="text-xs text-slate-400">Agregue registros de salud o integraciones de expedientes clínicos electrónicos (EHR) en Configuración.</p>
            </div>
          )}

          {activeSubTab === 'history' && (
            <div className="p-8 text-center text-slate-400 space-y-3">
              <Clock className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-medium">Aún no se han registrado antecedentes de estilo de vida.</p>
              <p className="text-xs text-slate-400">Registre antecedentes oculares familiares, seguimiento de enfermedades sistémicas o riesgos ocupacionales.</p>
            </div>
          )}
        </div>

        {/* TIMELINE SECTION: PAST VISITS */}
        <div className="mt-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
            Historial de Visitas
          </h3>
          <div className="bg-white border border-slate-200 rounded-xl p-6 relative shadow-sm">
            {/* Timeline center rail connector */}
            <div className="absolute left-[31px] top-8 bottom-8 w-0.5 bg-slate-100"></div>
            
            <div className="space-y-6">
              {filteredVisitHistory.map((visit) => (
                <div key={visit.id} className="flex gap-4 relative z-10 text-xs">
                  {/* Timeline icon nodes */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm ${
                    visit.icon === 'science' 
                      ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                      : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                  }`}>
                    {visit.icon === 'science' ? (
                      <Activity className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </div>
                  
                  {/* Timeline content blocks */}
                  <div className="flex-grow bg-slate-50 rounded-xl p-4 border border-slate-100 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-800 uppercase tracking-wide">{visit.type}</h4>
                      <span className="text-[10px] text-slate-400 font-bold">{visit.date}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-medium mb-3">{visit.notes}</p>
                    <span className="inline-block px-2.5 py-0.5 bg-white border border-slate-100 text-slate-500 rounded-md font-semibold text-[10px] shadow-xs">
                      {visit.provider}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PRINT-ONLY CLINICAL SUMMARY (PDF) */}
      <div className="hidden print:block print-clinical-summary p-8 font-sans text-black bg-white max-w-4xl mx-auto">
        {/* Letterhead */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">OPHTHALMOPRO CLINICAL SUITE</h1>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Resumen Clínico y Ficha del Paciente</p>
          </div>
          <div className="text-right text-[10px] text-slate-500 font-mono whitespace-pre-wrap">
            <p className="font-bold text-slate-700">Ópticas San Antonio</p>
            <p>{clinicAddress} | Tel: {clinicPhone}</p>
            <p>Fecha de Emisión: {new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </div>

        {/* Patient Profile Section */}
        <div className="mb-6">
          <h2 className="text-sm font-bold bg-slate-100 text-slate-800 px-3 py-1.5 rounded mb-3 uppercase tracking-wide">1. Información General del Paciente</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-500 block uppercase text-[9px]">Nombre Completo</span>
              <span className="font-semibold text-slate-800">{currentPatient.name}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block uppercase text-[9px]">ID del Paciente</span>
              <span className="font-semibold text-slate-800">{currentPatient.id}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block uppercase text-[9px]">Fecha de Nacimiento / Edad</span>
              <span className="font-semibold text-slate-800">{currentPatient.dob} ({currentPatient.age} años)</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block uppercase text-[9px]">Sexo</span>
              <span className="font-semibold text-slate-800">
                {currentPatient.sex === 'Male' ? 'Masculino' : currentPatient.sex === 'Female' ? 'Femenino' : currentPatient.sex}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block uppercase text-[9px]">Grupo Sanguíneo</span>
              <span className="font-semibold text-slate-800">{currentPatient.bloodType}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block uppercase text-[9px]">Teléfono de Contacto</span>
              <span className="font-semibold text-slate-800">{currentPatient.phone}</span>
            </div>
          </div>
        </div>

        {/* Clinical History & Background */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border border-slate-200 rounded p-4">
            <h3 className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2 flex items-center gap-1">
              <span>⚠️</span> Alergias registradas
            </h3>
            {currentPatient.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {currentPatient.allergies.map(allergy => (
                  <span key={allergy} className="bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold">
                    {allergy}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No se reportan alergias conocidas.</p>
            )}
          </div>

          <div className="border border-slate-200 rounded p-4">
            <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2 flex items-center gap-1">
              <span>📋</span> Condiciones Crónicas
            </h3>
            {currentPatient.chronicConditions.length > 0 ? (
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                {currentPatient.chronicConditions.map(cond => (
                  <li key={cond}>{cond}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic">No se registran condiciones crónicas permanentes.</p>
            )}
          </div>
        </div>

        {/* Current Optical Prescriptions (Recetas Activas) */}
        <div className="mb-6">
          <h2 className="text-sm font-bold bg-slate-100 text-slate-800 px-3 py-1.5 rounded mb-3 uppercase tracking-wide">2. Recetas Ópticas Activas</h2>
          {currentPrescriptions.length > 0 ? (
            <div className="space-y-6">
              {currentPrescriptions.map((rx) => (
                <div key={rx.id} className="border border-slate-200 rounded p-4">
                  <div className="flex justify-between items-center mb-3 text-xs border-b pb-2">
                    <span className="font-bold text-indigo-600">ID de Receta: {rx.id}</span>
                    <span className="text-slate-500">Fecha de Examen: {rx.date}</span>
                    <span className="font-bold">Especialista: {rx.doctorName}</span>
                  </div>

                  {/* Refraction Table */}
                  <table className="w-full text-left border-collapse text-xs mb-4">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="p-1 font-bold text-slate-600">Ojo</th>
                        <th className="p-1 font-bold text-slate-600">Esfera (SPH)</th>
                        <th className="p-1 font-bold text-slate-600">Cilindro (CYL)</th>
                        <th className="p-1 font-bold text-slate-600">Eje (AXIS)</th>
                        <th className="p-1 font-bold text-slate-600">Adición (ADD)</th>
                        <th className="p-1 font-bold text-slate-600">D. Pupilar (PD)</th>
                        <th className="p-1 font-bold text-slate-600">Prisma</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="p-1.5 font-bold">OD (Derecho)</td>
                        <td className="p-1.5 font-semibold">{rx.od.sph}</td>
                        <td className="p-1.5">{rx.od.cyl}</td>
                        <td className="p-1.5">{rx.od.axis}°</td>
                        <td className="p-1.5">{rx.od.add}</td>
                        <td className="p-1.5">{rx.od.pd} mm</td>
                        <td className="p-1.5">{rx.od.prism}</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 font-bold">OS (Izquierdo)</td>
                        <td className="p-1.5 font-semibold">{rx.os.sph}</td>
                        <td className="p-1.5">{rx.os.cyl}</td>
                        <td className="p-1.5">{rx.os.axis}°</td>
                        <td className="p-1.5">{rx.os.add}</td>
                        <td className="p-1.5">{rx.os.pd} mm</td>
                        <td className="p-1.5">{rx.os.prism}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-500 block">Tipo de Lente:</span>
                      <span className="font-semibold text-slate-800">
                        {rx.lensType === 'Progressive' ? 'Progresivo' : rx.lensType === 'Bifocal' ? 'Bifocal' : 'Visión Sencilla'}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500 block">Tratamientos / Filtros:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {rx.coatings.antiReflective && <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">Anti-reflejo</span>}
                        {rx.coatings.uvProtection && <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">Protección UV</span>}
                        {rx.coatings.blueLightFilter && <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">Filtro Luz Azul</span>}
                        {rx.coatings.photochromic && <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">Fotosensible (Transition)</span>}
                      </div>
                    </div>
                  </div>

                  {rx.notes && (
                    <div className="mt-3 bg-slate-50 p-2.5 rounded border border-slate-100 text-[11px] text-slate-600">
                      <span className="font-bold text-slate-700 block mb-0.5">Notas Clínicas de la Receta:</span>
                      <p>{rx.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No se han registrado recetas ópticas para este paciente.</p>
          )}
        </div>

        {/* Visit History Timeline (Historial Clínico) */}
        <div className="mb-8">
          <h2 className="text-sm font-bold bg-slate-100 text-slate-800 px-3 py-1.5 rounded mb-3 uppercase tracking-wide">3. Historial de Consultas y Procedimientos</h2>
          {filteredVisitHistory.length > 0 ? (
            <div className="space-y-4">
              {filteredVisitHistory.map((visit) => (
                <div key={visit.id} className="border-l-2 border-indigo-600 pl-4 py-1 text-xs">
                  <div className="flex justify-between items-start font-bold text-slate-800 mb-1">
                    <span>{visit.type}</span>
                    <span className="text-slate-400 font-normal">{visit.date}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-medium mb-1">{visit.notes}</p>
                  <span className="text-[10px] text-slate-400 font-mono">Realizado por: {visit.provider}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No se registra historial de visitas médicas previas en el sistema.</p>
          )}
        </div>

        {/* Signature Box */}
        <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="h-16"></div>
            <div className="border-t border-slate-300 pt-2 w-48 mx-auto">
              <p className="font-bold text-slate-800">Firma del Especialista</p>
              <p className="text-[10px] text-slate-500">Sello Clínico Ópticas San Antonio</p>
            </div>
          </div>
          <div>
            <div className="h-16"></div>
            <div className="border-t border-slate-300 pt-2 w-48 mx-auto">
              <p className="font-bold text-slate-800">Firma del Paciente</p>
              <p className="text-[10px] text-slate-500">Consentimiento de Resumen Clínico</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
