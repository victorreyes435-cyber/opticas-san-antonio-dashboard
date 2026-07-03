import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Printer, 
  Trash2, 
  Sparkles, 
  Check, 
  FileText, 
  ChevronRight, 
  ClipboardCheck, 
  Eye, 
  RotateCcw
} from 'lucide-react';
import { Patient, Prescription, RefractionValues } from '../types';

interface PrescriptionsViewProps {
  patients: Patient[];
  selectedPatientId: string;
  onPatientChange: (patientId: string) => void;
  prescriptions: Prescription[];
  setPrescriptions: Dispatch<SetStateAction<Prescription[]>>;
  searchQuery: string;
}

export default function PrescriptionsView({ 
  patients, 
  selectedPatientId, 
  onPatientChange, 
  prescriptions,
  setPrescriptions,
  searchQuery
}: PrescriptionsViewProps) {
  // Find current patient data with robust fallback
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

  // Filter prescriptions based on search query
  const filteredPrescriptions = prescriptions.filter(rx => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      rx.patientName.toLowerCase().includes(q) ||
      rx.patientId.toLowerCase().includes(q) ||
      rx.lensType.toLowerCase().includes(q) ||
      (rx.notes && rx.notes.toLowerCase().includes(q))
    );
  });

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

  // Refraction and form states
  const [examDate, setExamDate] = useState('2023-10-27');
  
  // OD States
  const [odSph, setOdSph] = useState('-2.00');
  const [odCyl, setOdCyl] = useState('-0.50');
  const [odAxis, setOdAxis] = useState('180');
  const [odAdd, setOdAdd] = useState('+1.50');
  const [odPd, setOdPd] = useState('32.0');
  const [odPrism, setOdPrism] = useState('Base Down');

  // OS States
  const [osSph, setOsSph] = useState('-2.25');
  const [osCyl, setOsCyl] = useState('-0.25');
  const [osAxis, setOsAxis] = useState('175');
  const [osAdd, setOsAdd] = useState('+1.50');
  const [osPd, setOsPd] = useState('32.5');
  const [osPrism, setOsPrism] = useState('-');

  // Lens type and coatings
  const [lensType, setLensType] = useState<'Single Vision' | 'Bifocal' | 'Progressive'>('Progressive');
  const [antiReflective, setAntiReflective] = useState(true);
  const [uvProtection, setUvProtection] = useState(true);
  const [blueLightFilter, setBlueLightFilter] = useState(false);
  const [photochromic, setPhotochromic] = useState(false);

  const [clinicalNotes, setClinicalNotes] = useState('Patient notes progressive adapter adaptation difficulty in past. Adjust framing carefully.');
  const [showToast, setShowToast] = useState<string | null>(null);

  // Synchronize fields when patient changes to avoid mismatch
  useEffect(() => {
    // If we have a prescription for this patient in recent, load it!
    const rx = prescriptions.find(r => r.patientId === selectedPatientId);
    if (rx) {
      loadPrescription(rx);
    } else {
      // Default to empty/dummy values for the selected patient
      setOdSph('-2.00');
      setOdCyl('-0.50');
      setOdAxis('180');
      setOdAdd('+1.50');
      setOdPd('32.0');
      setOdPrism('Base Down');

      setOsSph('-2.25');
      setOsCyl('-0.25');
      setOsAxis('175');
      setOsAdd('+1.50');
      setOsPd('32.5');
      setOsPrism('-');
      setLensType('Progressive');
      setAntiReflective(true);
      setUvProtection(true);
      setBlueLightFilter(false);
      setPhotochromic(false);
      setClinicalNotes(`Borrador de receta óptica de rutina para ${currentPatient.name}`);
    }
  }, [selectedPatientId]);

  const loadPrescription = (rx: Prescription) => {
    setExamDate(rx.date);
    setOdSph(rx.od.sph);
    setOdCyl(rx.od.cyl);
    setOdAxis(rx.od.axis);
    setOdAdd(rx.od.add);
    setOdPd(rx.od.pd);
    setOdPrism(rx.od.prism);

    setOsSph(rx.os.sph);
    setOsCyl(rx.os.cyl);
    setOsAxis(rx.os.axis);
    setOsAdd(rx.os.add);
    setOsPd(rx.os.pd);
    setOsPrism(rx.os.prism);

    setLensType(rx.lensType);
    setAntiReflective(rx.coatings.antiReflective);
    setUvProtection(rx.coatings.uvProtection);
    setBlueLightFilter(rx.coatings.blueLightFilter);
    setPhotochromic(rx.coatings.photochromic);
    setClinicalNotes(rx.notes);
  };

  const handleClearForm = () => {
    setOdSph('');
    setOdCyl('');
    setOdAxis('');
    setOdAdd('');
    setOdPd('');
    setOdPrism('');

    setOsSph('');
    setOsCyl('');
    setOsAxis('');
    setOsAdd('');
    setOsPd('');
    setOsPrism('');

    setAntiReflective(false);
    setUvProtection(false);
    setBlueLightFilter(false);
    setPhotochromic(false);
    setClinicalNotes('');
    
    setShowToast("Formulario de receta limpiado.");
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleSaveDraft = () => {
    setShowToast("Borrador de receta guardado.");
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleGenerateRx = () => {
    const newRx: Prescription = {
      id: 'rx_' + Date.now(),
      patientId: currentPatient.id,
      patientName: currentPatient.name,
      patientDob: currentPatient.dob,
      date: examDate,
      doctorName: 'Sarah Jenkins',
      od: { sph: odSph || '-', cyl: odCyl || '-', axis: odAxis || '-', add: odAdd || '-', pd: odPd || '-', prism: odPrism || '-' },
      os: { sph: osSph || '-', cyl: osCyl || '-', axis: osAxis || '-', add: osAdd || '-', pd: osPd || '-', prism: osPrism || '-' },
      lensType,
      coatings: {
        antiReflective,
        uvProtection,
        blueLightFilter,
        photochromic
      },
      notes: clinicalNotes
    };

    setPrescriptions(prev => [newRx, ...prev]);
    setShowToast(`¡Receta óptica generada para ${currentPatient.name}!`);
    setTimeout(() => setShowToast(null), 3500);
  };

  // Build the list of active coatings for preview
  const getSelectedOptionsText = () => {
    const opts = [];
    if (antiReflective) opts.push("Antirreflejante");
    if (uvProtection) opts.push("Protección UV");
    if (blueLightFilter) opts.push("Filtro de Luz Azul");
    if (photochromic) opts.push("Fotocromático");
    return opts.length > 0 ? opts.join(", ") : "Ninguno";
  };

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center w-full">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-slate-500">Cargando datos de pacientes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header welcome text */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Receta de Lentes</h2>
        <p className="text-sm text-slate-500 font-medium">Gestione los datos de refracción y emita recetas ópticas.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Side: Prescription input forms (Spans 8 cols) */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Patient Details Selection Block */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Detalles del Paciente</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Activo:</span>
                <select
                  value={selectedPatientId}
                  onChange={(e) => onPatientChange(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg py-1 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 cursor-pointer"
                >
                  {dropdownPatients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-400 uppercase tracking-wide">Nombre del Paciente</label>
                <input
                  type="text"
                  value={currentPatient.name}
                  readOnly
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-500 font-semibold focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-slate-400 uppercase tracking-wide">Fecha de Nac.</label>
                <input
                  type="text"
                  value={currentPatient.dob}
                  readOnly
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-500 font-semibold focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-slate-400 uppercase tracking-wide">Fecha de Examen</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 font-semibold focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Refraction Data Inputs (OD/OS) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Datos de Refracción</span>
              </h3>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Right Eye (OD) */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-xs shadow-sm">
                    OD
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Ojo Derecho</h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase">Esfera (ESF)</label>
                    <input
                      type="text"
                      value={odSph}
                      onChange={(e) => setOdSph(e.target.value)}
                      placeholder="-2.00"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-center text-slate-800 font-semibold focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase">Cilindro (CIL)</label>
                    <input
                      type="text"
                      value={odCyl}
                      onChange={(e) => setOdCyl(e.target.value)}
                      placeholder="-0.50"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-center text-slate-800 font-semibold focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase">Eje</label>
                    <input
                      type="text"
                      value={odAxis}
                      onChange={(e) => setOdAxis(e.target.value)}
                      placeholder="180"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-center text-slate-800 font-semibold focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase">Adición</label>
                    <input
                      type="text"
                      value={odAdd}
                      onChange={(e) => setOdAdd(e.target.value)}
                      placeholder="+1.50"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-center text-slate-800 font-semibold focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs mt-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase">PD (mm)</label>
                    <input
                      type="text"
                      value={odPd}
                      onChange={(e) => setOdPd(e.target.value)}
                      placeholder="32.0"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase">Prisma</label>
                    <input
                      type="text"
                      value={odPrism}
                      onChange={(e) => setOdPrism(e.target.value)}
                      placeholder="Base Down"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 my-4"></div>

              {/* Left Eye (OS) */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-xs shadow-sm border border-amber-100">
                    OS
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Ojo Izquierdo</h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase">Esfera (ESF)</label>
                    <input
                      type="text"
                      value={osSph}
                      onChange={(e) => setOsSph(e.target.value)}
                      placeholder="-2.25"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-center text-slate-800 font-semibold focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase">Cilindro (CIL)</label>
                    <input
                      type="text"
                      value={osCyl}
                      onChange={(e) => setOsCyl(e.target.value)}
                      placeholder="-0.25"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-center text-slate-800 font-semibold focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase">Eje</label>
                    <input
                      type="text"
                      value={osAxis}
                      onChange={(e) => setOsAxis(e.target.value)}
                      placeholder="175"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-center text-slate-800 font-semibold focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase">Adición</label>
                    <input
                      type="text"
                      value={osAdd}
                      onChange={(e) => setOsAdd(e.target.value)}
                      placeholder="+1.50"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-center text-slate-800 font-semibold focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs mt-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase">PD (mm)</label>
                    <input
                      type="text"
                      value={osPd}
                      onChange={(e) => setOsPd(e.target.value)}
                      placeholder="32.5"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase">Prisma</label>
                    <input
                      type="text"
                      value={osPrism}
                      onChange={(e) => setOsPrism(e.target.value)}
                      placeholder="-"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lens Type & Options Coatings Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Especificaciones de la Lente</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Lens Type Selection */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-400 uppercase">Tipo de Lente</label>
                <div className="space-y-2">
                  {[
                    { key: 'Single Vision', label: 'Monofocal' },
                    { key: 'Bifocal', label: 'Bifocal' },
                    { key: 'Progressive', label: 'Progresivo' }
                  ].map(opt => (
                    <label 
                      key={opt.key} 
                      className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer border transition-all ${
                        lensType === opt.key 
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-600 font-bold' 
                          : 'border-transparent hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="lensTypeOpt"
                        checked={lensType === opt.key}
                        onChange={() => setLensType(opt.key as any)}
                        className="text-indigo-600 focus:ring-indigo-600 w-4 h-4 cursor-pointer"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Coatings checkboxes */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-400 uppercase">Tratamientos y Opciones</label>
                <div className="space-y-2">
                  {[
                    { state: antiReflective, setter: setAntiReflective, label: 'Antirreflejante (AR)' },
                    { state: uvProtection, setter: setUvProtection, label: 'Protección UV' },
                    { state: blueLightFilter, setter: setBlueLightFilter, label: 'Filtro de Luz Azul' },
                    { state: photochromic, setter: setPhotochromic, label: 'Fotocromático' }
                  ].map(coat => (
                    <label 
                      key={coat.label} 
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={coat.state}
                        onChange={() => coat.setter(!coat.state)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-slate-600 font-semibold">{coat.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes textarea */}
            <div className="mt-6 space-y-1.5 text-xs">
              <label className="block font-bold text-slate-400 uppercase">Notas Clínicas (Impresas en la Receta)</label>
              <textarea
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Ingrese instrucciones para la óptica..."
                rows={3}
                className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none"
              />
            </div>
          </div>

          {/* Form action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleClearForm}
              className="px-5 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-500 transition-colors active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Limpiar Formulario</span>
            </button>
            <button
              onClick={handleSaveDraft}
              className="px-5 py-2 border border-indigo-200 text-indigo-600 hover:bg-indigo-50/50 rounded-lg text-xs font-bold transition-colors active:scale-95 cursor-pointer"
            >
              Guardar Borrador
            </button>
            <button
              onClick={handleGenerateRx}
              className="px-5 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-xs font-bold transition-colors shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>Generar Receta</span>
            </button>
          </div>
        </div>

        {/* Right Side: Live preview template (Spans 4 cols) */}
        <div className="xl:col-span-4 space-y-6 flex flex-col">
          
          {/* Real-time PDF layout view block */}
          <div className="bg-slate-100 rounded-xl p-3 shadow-inner border border-slate-200 flex flex-col min-h-[480px]">
            <div id="prescription-print-area" className="bg-white rounded-lg p-5 flex flex-col flex-grow text-xs border border-slate-200 relative overflow-hidden">
              
              {/* Ópticas San Antonio Print Head */}
              <div className="text-center border-b border-slate-100 pb-3.5 mb-3.5">
                <h4 className="text-base font-bold text-indigo-600 tracking-tight">Ópticas San Antonio</h4>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-0.5">
                  123 Plaza Clínica, Suite 400<br />Metrópolis, NY 10001 | Tel: (555) 012-3456
                </p>
              </div>

              {/* Patient details line */}
              <div className="flex justify-between text-[10px] mb-4 text-slate-600">
                <div className="space-y-0.5">
                  <p><span className="font-bold text-slate-800">Paciente:</span> {currentPatient.name}</p>
                  <p><span className="font-bold text-slate-800">Fecha de Nac.:</span> {currentPatient.dob}</p>
                </div>
                <div className="text-right space-y-0.5">
                  <p><span className="font-bold text-slate-800">Fecha:</span> {examDate}</p>
                  <p><span className="font-bold text-slate-800">Dr:</span> Sarah Jenkins</p>
                </div>
              </div>

              {/* SPH CYL AXIS ADD table header */}
              <table className="w-full text-[11px] mb-4 border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                    <th className="py-1.5 px-1 text-left font-bold"></th>
                    <th className="py-1.5 px-1 text-center font-bold">ESF</th>
                    <th className="py-1.5 px-1 text-center font-bold">CIL</th>
                    <th className="py-1.5 px-1 text-center font-bold">EJE</th>
                    <th className="py-1.5 px-1 text-center font-bold">ADIC</th>
                  </tr>
                </thead>
                <tbody className="font-semibold text-slate-700 divide-y divide-slate-50">
                  <tr>
                    <td className="py-2.5 px-1 font-bold text-indigo-600">OD</td>
                    <td className="py-2.5 px-1 text-center font-mono text-xs">{odSph || '-'}</td>
                    <td className="py-2.5 px-1 text-center font-mono text-xs">{odCyl || '-'}</td>
                    <td className="py-2.5 px-1 text-center font-mono text-xs">{odAxis || '-'}</td>
                    <td className="py-2.5 px-1 text-center font-mono text-xs">{odAdd || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-1 font-bold text-amber-600">OS</td>
                    <td className="py-2.5 px-1 text-center font-mono text-xs">{osSph || '-'}</td>
                    <td className="py-2.5 px-1 text-center font-mono text-xs">{osCyl || '-'}</td>
                    <td className="py-2.5 px-1 text-center font-mono text-xs">{osAxis || '-'}</td>
                    <td className="py-2.5 px-1 text-center font-mono text-xs">{osAdd || '-'}</td>
                  </tr>
                </tbody>
              </table>

              {/* PD & Lens Type */}
              <div className="space-y-1.5 border-t border-slate-50 pt-3 text-[10px] text-slate-600 font-medium">
                <p><span className="font-bold text-slate-800">DNP:</span> {odPd || '32.0'} / {osPd || '32.5'} mm (64.5 mm total)</p>
                <p><span className="font-bold text-slate-800">Tipo de Lente:</span> {lensType === 'Single Vision' ? 'Monofocal' : lensType === 'Bifocal' ? 'Bifocal' : 'Progresivo'}</p>
                <p className="line-clamp-2"><span className="font-bold text-slate-800">Opciones:</span> {getSelectedOptionsText()}</p>
                {clinicalNotes && (
                  <p className="italic text-slate-400 mt-2 line-clamp-2 font-serif">
                    " {clinicalNotes} "
                  </p>
                )}
              </div>

              {/* Signature block */}
              <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between items-end text-[10px] text-slate-400">
                <div className="w-32 border-b border-slate-200 pb-1 italic font-serif text-slate-800 text-xs text-center font-medium">
                  Sarah Jenkins
                </div>
                <span>Optometrista Autorizado</span>
              </div>
            </div>
          </div>

          {/* Quick print action button for high quality clinical output */}
          <button
            onClick={() => window.print()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:shadow-md active:scale-98"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Receta Física</span>
          </button>

          {/* Recent Rx list (Spans underneath preview) */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recetas Emitidas Recientes</h3>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">Todo el Historial</span>
            </div>
            
            <ul className="divide-y divide-slate-100">
              {filteredPrescriptions.map((rx) => (
                <li 
                  key={rx.id} 
                  onClick={() => {
                    onPatientChange(rx.patientId);
                    loadPrescription(rx);
                  }}
                  className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors font-medium">{rx.patientName}</p>
                    <p className="text-[10px] text-slate-400">{rx.date} • {rx.lensType}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Prescription Toasts notifications */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-xl z-50 flex items-center gap-2 border border-slate-800"
          >
            <ClipboardCheck className="w-4 h-4 text-emerald-400" />
            <span>{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
