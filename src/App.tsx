import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  X, 
  Save, 
  Settings, 
  HelpCircle, 
  ShieldCheck, 
  Terminal, 
  Wrench, 
  Database,
  CloudLightning,
  Eye,
  Plus
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import AgendaView from './components/AgendaView';
import PatientsView from './components/PatientsView';
import PrescriptionsView from './components/PrescriptionsView';
import BottomNavBar from './components/BottomNavBar';

import { INITIAL_PATIENTS, INITIAL_APPOINTMENTS, INITIAL_PRESCRIPTIONS, VISIT_HISTORY } from './data';
import { Patient, Appointment, Prescription, VisitHistoryItem } from './types';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>('prescriptions');

  // Unified global state stores with persistent memory
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('op_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('op_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    const saved = localStorage.getItem('op_prescriptions');
    return saved ? JSON.parse(saved) : INITIAL_PRESCRIPTIONS;
  });

  const [visitHistory, setVisitHistory] = useState<VisitHistoryItem[]>(() => {
    const saved = localStorage.getItem('op_visithistory');
    return saved ? JSON.parse(saved) : VISIT_HISTORY;
  });

  const [selectedPatientId, setSelectedPatientId] = useState<string>('123-456-78');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persist states to localStorage
  useEffect(() => {
    localStorage.setItem('op_patients', JSON.stringify(patients));
  }, [patients]);

  // Handle auto-selection of first patient if active becomes empty
  useEffect(() => {
    if (patients.length > 0 && !patients.some(p => p.id === selectedPatientId)) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  useEffect(() => {
    localStorage.setItem('op_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('op_prescriptions', JSON.stringify(prescriptions));
  }, [prescriptions]);

  useEffect(() => {
    localStorage.setItem('op_visithistory', JSON.stringify(visitHistory));
  }, [visitHistory]);

  // Modal display toggles
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

  // New Appointment Form state
  const [newAppPatientId, setNewAppPatientId] = useState(patients[0]?.id || '');
  const [newAppTime, setNewAppTime] = useState('11:30 AM');
  const [newAppReason, setNewAppReason] = useState('Comprehensive Exam');
  const [newAppTech, setNewAppTech] = useState('dr_reynolds');
  const [newAppRoom, setNewAppRoom] = useState('Room 1 (OCT)');
  const [newAppPriority, setNewAppPriority] = useState<'High' | 'Normal'>('Normal');

  // New Patient Form state
  const [newPatName, setNewPatName] = useState('');
  const [newPatDob, setNewPatDob] = useState('1980-01-01');
  const [newPatSex, setNewPatSex] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [newPatBlood, setNewPatBlood] = useState('O+');
  const [newPatPhone, setNewPatPhone] = useState('(555) 012-3344');
  const [newPatAllergies, setNewPatAllergies] = useState('None');
  const [newPatConditions, setNewPatConditions] = useState('Healthy');

  // Helper trigger
  const triggerToast = (msg: string) => {
    setShowSuccessToast(msg);
    setTimeout(() => {
      setShowSuccessToast(null);
    }, 3500);
  };

  const handleOpenPatientChart = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveTab('patients');
    triggerToast("Expediente del paciente cargado con éxito.");
  };

  const handleCreateAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patientObj = patients.find(p => p.id === newAppPatientId) || patients[0];
    
    const newApt: Appointment = {
      id: 'apt_' + Date.now(),
      time: newAppTime,
      patientId: newAppPatientId,
      patientName: patientObj ? patientObj.name : 'Unknown Patient',
      reason: newAppReason,
      status: 'SCHEDULED',
      technologistId: newAppTech,
      room: newAppRoom,
      priority: newAppPriority
    };

    setAppointments(prev => [newApt, ...prev]);
    setShowAppointmentModal(false);
    triggerToast(`Cita programada para ${newApt.patientName}`);
  };

  const handleCreatePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatName.trim()) return;

    const newID = 'OP-' + Math.floor(10000 + Math.random() * 90000);
    const birthYear = new Date(newPatDob).getFullYear();
    const currentYear = new Date().getFullYear();
    const calculatedAge = currentYear - birthYear;

    const newPat: Patient = {
      id: newID,
      name: newPatName,
      dob: newPatDob,
      age: calculatedAge,
      sex: newPatSex,
      bloodType: newPatBlood,
      phone: newPatPhone,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', // generic clinical avatar
      allergies: newPatAllergies.split(',').map(s => s.trim()).filter(Boolean),
      chronicConditions: newPatConditions.split(',').map(s => s.trim()).filter(Boolean)
    };

    setPatients(prev => [newPat, ...prev]);
    setSelectedPatientId(newID); // auto-select new patient
    setNewAppPatientId(newID);   // update dropdown select state
    setShowPatientModal(false);
    
    // Clear form
    setNewPatName('');
    setNewPatDob('1980-01-01');
    setNewPatPhone('(555) 012-3344');
    setNewPatAllergies('Ninguna');
    setNewPatConditions('Sano');

    triggerToast(`Nuevo perfil de paciente creado para ${newPat.name}`);
    setActiveTab('patients'); // Go to patient view automatically
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex overflow-hidden font-sans antialiased">
      
      {/* Side Navigation panel */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container Wrapper */}
      <div className="flex-1 lg:ml-64 flex flex-col h-screen overflow-hidden">
        
        {/* Unified Top Application Bar */}
        <Header 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onNewAppointmentClick={() => {
            // Pre-select patient if possible
            if (patients.length > 0) {
              setNewAppPatientId(selectedPatientId || patients[0].id);
            }
            setShowAppointmentModal(true);
          }}
        />

        {/* Dynamic Scrollable Content Workspace */}
        <main className="flex-1 mt-16 p-4 md:p-8 overflow-y-auto bg-slate-50 pb-24 lg:pb-8">
          
          <AnimatePresence mode="wait">
            
            {activeTab === 'dashboard' && (
              <DashboardView 
                appointments={appointments}
                patients={patients}
                onOpenPatientChart={handleOpenPatientChart}
                onAddPatientClick={() => setShowPatientModal(true)}
                onAddAppointmentClick={() => {
                  if (patients.length > 0) {
                    setNewAppPatientId(selectedPatientId || patients[0].id);
                  }
                  setShowAppointmentModal(true);
                }}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'agenda' && (
              <AgendaView 
                appointments={appointments}
                setAppointments={setAppointments}
                onOpenPatientChart={handleOpenPatientChart}
                onAddAppointmentClick={() => {
                  if (patients.length > 0) {
                    setNewAppPatientId(selectedPatientId || patients[0].id);
                  }
                  setShowAppointmentModal(true);
                }}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'patients' && (
              <PatientsView 
                patients={patients}
                selectedPatientId={selectedPatientId}
                onPatientChange={setSelectedPatientId}
                visitHistory={visitHistory}
                setVisitHistory={setVisitHistory}
                onSwitchToPrescriptions={() => setActiveTab('prescriptions')}
                onAddPatientClick={() => setShowPatientModal(true)}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'prescriptions' && (
              <PrescriptionsView 
                patients={patients}
                selectedPatientId={selectedPatientId}
                onPatientChange={setSelectedPatientId}
                prescriptions={prescriptions}
                setPrescriptions={setPrescriptions}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 text-xs max-w-2xl"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-600" />
                    <span>Ajustes de la Clínica</span>
                  </h3>
                  <p className="text-slate-400 mt-1">Configure escáneres, interfaces de autorrefractómetro y bases de datos cloud.</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-400 uppercase">Nombre de la Clínica</label>
                      <input type="text" readOnly value="Clínica OphthalmoPro" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-400 uppercase">ID del Proveedor</label>
                      <input type="text" readOnly value="MED-99201-OP" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-500" />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg space-y-2 border border-slate-100">
                    <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-indigo-600" />
                      <span>Conexiones de Diagnóstico</span>
                    </h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      El Analizador de Campo Visual Humphrey y Zeiss Cirrus OCT están conectados en el puerto COM 3 y sincronizándose con la base de datos local.
                    </p>
                    <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px] uppercase border border-emerald-200">
                      Conexión Activa
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <span className="text-slate-400 font-semibold">Almacenamiento sin Conexión:</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> Habilitado (IndexedDB / LocalStorage activos)
                    </span>
                  </div>

                </div>
              </motion.div>
            )}

            {activeTab === 'support' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 text-xs max-w-2xl"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-indigo-600" />
                    <span>Mesa de Soporte Técnico</span>
                  </h3>
                  <p className="text-slate-400 mt-1">Envíe tickets, descargue herramientas de calibración óptica o chatee con soporte.</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <p className="text-slate-600 font-medium leading-relaxed">
                    OphthalmoPro Clinical Suite incluye soporte prioritario las 24 horas para clínicas autorizadas. Si tiene problemas para sincronizar lentes o refractores, escriba a:
                  </p>
                  <p className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-3 py-2 rounded-lg self-start inline-block">
                    support@ophthalmopro.clinic | Tel: +1 (800) 555-EYES
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-slate-100 rounded-lg hover:shadow-xs transition-shadow bg-slate-50/50">
                      <h4 className="font-bold text-slate-800">Actualizaciones de Software</h4>
                      <p className="text-slate-400 mt-1">OphthalmoPro Clinical Suite está en v4.14.0 (Estable).</p>
                    </div>
                    <div className="p-4 border border-slate-100 rounded-lg hover:shadow-xs transition-shadow bg-slate-50/50">
                      <h4 className="font-bold text-slate-800">Perfil de Calibración</h4>
                      <p className="text-slate-400 mt-1">Última calibración: 1 de julio de 2026.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </main>
      </div>

      {/* MODAL: NEW APPOINTMENT */}
      <AnimatePresence>
        {showAppointmentModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200"
            >
              {/* Modal Head */}
              <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-200">Programar Cita</h3>
                <button 
                  onClick={() => setShowAppointmentModal(false)}
                  className="text-white/80 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCreateAppointmentSubmit} className="p-6 space-y-4 text-xs">
                
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400 uppercase">Seleccionar Paciente</label>
                  <select
                    value={newAppPatientId}
                    onChange={(e) => setNewAppPatientId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 px-3 font-semibold text-gray-700 focus:outline-none"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase">Horario</label>
                    <input
                      type="text"
                      required
                      value={newAppTime}
                      onChange={(e) => setNewAppTime(e.target.value)}
                      placeholder="ej. 11:30 AM"
                      className="w-full border border-slate-200 rounded-lg p-2 font-semibold text-gray-700 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase">Motivo</label>
                    <select
                      value={newAppReason}
                      onChange={(e) => setNewAppReason(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 px-3 font-semibold text-gray-700 focus:outline-none"
                    >
                      <option value="Comprehensive Exam">Examen Integral</option>
                      <option value="Glaucoma Follow-up">Seguimiento de Glaucoma</option>
                      <option value="Contact Lens Fitting">Adaptación de Lentes de Contacto</option>
                      <option value="Dry Eye Assessment">Evaluación de Ojo Seco</option>
                      <option value="Visual Field Testing">Prueba de Campo Visual</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase">Dr. / Tecnólogo Asignado</label>
                    <select
                      value={newAppTech}
                      onChange={(e) => setNewAppTech(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 px-3 font-semibold text-gray-700 focus:outline-none"
                    >
                      <option value="dr_reynolds">Dr. Reynolds</option>
                      <option value="sarah_chen">Sarah Chen (OD)</option>
                      <option value="marcus_pierce">Marcus Pierce</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase">Sala de Examen</label>
                    <select
                      value={newAppRoom}
                      onChange={(e) => setNewAppRoom(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 px-3 font-semibold text-gray-700 focus:outline-none"
                    >
                      <option value="Room 1 (OCT)">Sala 1 (OCT)</option>
                      <option value="Room 2 (Visual Field)">Sala 2 (Campo Visual)</option>
                      <option value="Room 3 (Standard)">Sala 3 (Estándar)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-400 uppercase">Prioridad</label>
                  <div className="flex gap-4 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-gray-700">
                      <input
                        type="radio"
                        checked={newAppPriority === 'Normal'}
                        onChange={() => setNewAppPriority('Normal')}
                        className="text-indigo-600 focus:ring-indigo-600"
                      />
                      <span>Normal</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-gray-700">
                      <input
                        type="radio"
                        checked={newAppPriority === 'High'}
                        onChange={() => setNewAppPriority('High')}
                        className="text-indigo-600 focus:ring-indigo-600"
                      />
                      <span className="text-red-600 font-bold">Prioridad Alta</span>
                    </label>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAppointmentModal(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-500 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Programar Horario
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD PATIENT */}
      <AnimatePresence>
        {showPatientModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200"
            >
              {/* Modal Head */}
              <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-200">Crear Perfil del Paciente</h3>
                <button 
                  onClick={() => setShowPatientModal(false)}
                  className="text-white/80 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCreatePatientSubmit} className="p-6 space-y-4 text-xs">
                
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400 uppercase">Nombre Completo del Paciente</label>
                  <input
                    type="text"
                    required
                    value={newPatName}
                    onChange={(e) => setNewPatName(e.target.value)}
                    placeholder="ej. Susan Reynolds"
                    className="w-full border border-slate-200 rounded-lg p-2 font-semibold text-gray-700 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      value={newPatDob}
                      onChange={(e) => setNewPatDob(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 font-semibold text-gray-700 focus:outline-none focus:border-indigo-600 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase">Sexo</label>
                    <select
                      value={newPatSex}
                      onChange={(e) => setNewPatSex(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 px-3 font-semibold text-gray-700 focus:outline-none cursor-pointer"
                    >
                      <option value="Female">Femenino</option>
                      <option value="Male">Masculino</option>
                      <option value="Other">Otro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase">Grupo Sanguíneo</label>
                    <input
                      type="text"
                      value={newPatBlood}
                      onChange={(e) => setNewPatBlood(e.target.value)}
                      placeholder="O+"
                      className="w-full border border-slate-200 rounded-lg p-2 font-semibold text-gray-700 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase">Número de Teléfono</label>
                    <input
                      type="text"
                      value={newPatPhone}
                      onChange={(e) => setNewPatPhone(e.target.value)}
                      placeholder="(555) 012-3344"
                      className="w-full border border-slate-200 rounded-lg p-2 font-semibold text-gray-700 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-400 uppercase">Alergias (separadas por comas)</label>
                  <input
                    type="text"
                    value={newPatAllergies}
                    onChange={(e) => setNewPatAllergies(e.target.value)}
                    placeholder="ej. Penicilina, Polen, Sulfa"
                    className="w-full border border-slate-200 rounded-lg p-2 font-semibold text-gray-700 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-400 uppercase">Enfermedades Crónicas (separadas por comas)</label>
                  <input
                    type="text"
                    value={newPatConditions}
                    onChange={(e) => setNewPatConditions(e.target.value)}
                    placeholder="ej. Hipertensión, Diabetes, Miopía"
                    className="w-full border border-slate-200 rounded-lg p-2 font-semibold text-gray-700 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                {/* Footer buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowPatientModal(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-500 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Crear Perfil
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Toast Success Notification overlay */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-xl z-50 flex items-center gap-2 border border-slate-800"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{showSuccessToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation tab bar */}
      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />

    </div>
  );
}
