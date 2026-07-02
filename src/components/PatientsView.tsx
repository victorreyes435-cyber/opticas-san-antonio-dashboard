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
  BookOpen
} from 'lucide-react';
import { Patient, VisitHistoryItem } from '../types';

interface PatientsViewProps {
  patients: Patient[];
  selectedPatientId: string;
  onPatientChange: (patientId: string) => void;
  visitHistory: VisitHistoryItem[];
  setVisitHistory: Dispatch<SetStateAction<VisitHistoryItem[]>>;
  onSwitchToPrescriptions: () => void;
  onAddPatientClick: () => void;
  searchQuery: string;
}

export default function PatientsView({ 
  patients, 
  selectedPatientId, 
  onPatientChange, 
  visitHistory,
  setVisitHistory,
  onSwitchToPrescriptions,
  onAddPatientClick,
  searchQuery
}: PatientsViewProps) {
  // Find current patient data
  const currentPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

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
  const [chiefComplaint, setChiefComplaint] = useState('Patient reports blurry vision, especially at night. Experiences occasional dryness and fatigue during long computer reading shifts.');
  const [hpi, setHpi] = useState('Began approximately 3 months ago. Gradually progressive. No sudden loss of vision. Describes difficulty focusing on text in low light.');
  const [ros, setRos] = useState('No headaches, no flashes of light, no floaters. Experiences mild burning and irritation by evening hours.');
  
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="flex flex-col xl:flex-row gap-6 items-start"
    >
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
              title="Add New Patient"
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
            <div className="flex justify-between pb-1">
              <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wide">Teléfono</span>
              <span className="font-semibold text-slate-700">{currentPatient.phone}</span>
            </div>
          </div>
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
    </motion.div>
  );
}
