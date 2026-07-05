import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PatternFormat } from 'react-number-format';
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
  Plus,
  Sun,
  Moon,
  AlertTriangle
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import AgendaView from './components/AgendaView';
import PatientsView from './components/PatientsView';
import PrescriptionsView from './components/PrescriptionsView';
import BottomNavBar from './components/BottomNavBar';
import UserProfileModal from './components/UserProfileModal';
import GmailView from './components/GmailView';
import DriveView from './components/DriveView';
import ContactsView from './components/ContactsView';

import { INITIAL_PATIENTS, INITIAL_APPOINTMENTS, INITIAL_PRESCRIPTIONS, VISIT_HISTORY } from './data';
import { Patient, Appointment, Prescription, VisitHistoryItem, UserProfile } from './types';
import { useAuth } from './context/AuthContext.tsx';
import { firebaseService } from './lib/firebaseService';

export default function App() {
  const { user, token, loading, signIn, logOut } = useAuth();

  // Authentication UI State
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsAuthSubmitting(true);
    try {
      await signIn();
      triggerToast('¡Sesión iniciada con éxito!');
    } catch (err: any) {
      console.error(err);
      setAuthError('No se pudo iniciar sesión con Google. Inténtalo de nuevo.');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>('prescriptions');

  // Dark mode theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // High contrast mode theme state
  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('highContrast') === 'true';
  });

  const [clinicAddress, setClinicAddress] = useState<string>(() => {
    return localStorage.getItem('clinicAddress') || 'Av. Principal 123, Ciudad Central';
  });

  const [clinicPhone, setClinicPhone] = useState<string>(() => {
    return localStorage.getItem('clinicPhone') || '+1 (555) 123-4567';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
      localStorage.setItem('highContrast', 'true');
    } else {
      document.documentElement.classList.remove('high-contrast');
      localStorage.setItem('highContrast', 'false');
    }
  }, [isHighContrast]);

  useEffect(() => {
    localStorage.setItem('clinicAddress', clinicAddress);
  }, [clinicAddress]);

  useEffect(() => {
    localStorage.setItem('clinicPhone', clinicPhone);
  }, [clinicPhone]);

  // Unified global state stores with persistent memory falling back to API
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [visitHistory, setVisitHistory] = useState<VisitHistoryItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Dr. S. Miller',
    role: 'Tecnólogo Médico',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'
  });
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Refs to always access the latest state in asynchronous closures and prevent stale updates
  const patientsRef = useRef(patients);
  const appointmentsRef = useRef(appointments);
  const prescriptionsRef = useRef(prescriptions);
  const visitHistoryRef = useRef(visitHistory);

  useEffect(() => {
    patientsRef.current = patients;
  }, [patients]);

  useEffect(() => {
    appointmentsRef.current = appointments;
  }, [appointments]);

  useEffect(() => {
    prescriptionsRef.current = prescriptions;
  }, [prescriptions]);

  useEffect(() => {
    visitHistoryRef.current = visitHistory;
  }, [visitHistory]);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Recepcionista' | 'Tecnólogo Médico'>('Tecnólogo Médico');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserAvatar, setNewUserAvatar] = useState('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80');

  const [selectedPatientId, setSelectedPatientId] = useState<string>('123-456-78');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal display toggles
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);
  const [isToastError, setIsToastError] = useState<boolean>(false);

  useEffect(() => {
    if (showAppointmentModal) {
      setAppointmentError(null);
      setIsManualPatientName(false);
      setNewAppPatientManualName('');
    }
  }, [showAppointmentModal]);

  useEffect(() => {
    if (showPatientModal) {
      setPatientError(null);
    }
  }, [showPatientModal]);

  // New Appointment Form state
  const [newAppPatientId, setNewAppPatientId] = useState('');
  const [appointmentError, setAppointmentError] = useState<string | null>(null);
  const [newAppDate, setNewAppDate] = useState<string>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
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
  const [newPatPhone, setNewPatPhone] = useState('+1 (555) 012-3344');
  const [newPatAllergies, setNewPatAllergies] = useState('Ninguna');
  const [newPatConditions, setNewPatConditions] = useState('Sano');
  const [patientError, setPatientError] = useState<string | null>(null);

  // Manual scheduling and loading states
  const [isManualPatientName, setIsManualPatientName] = useState(false);
  const [newAppPatientManualName, setNewAppPatientManualName] = useState('');
  const [isClinicalDataLoaded, setIsClinicalDataLoaded] = useState(false);

  // Helper trigger
  const triggerToast = (msg: string, isError = false) => {
    setShowSuccessToast(msg);
    setIsToastError(isError);
    setTimeout(() => {
      setShowSuccessToast(null);
      setIsToastError(false);
    }, 4500);
  };

  // Fetch clinical database contents on sign-in
  useEffect(() => {
    if (!token) return;

    const fetchClinicalData = async () => {
      try {
        const uid = user?.uid || 'default-user';
        const [profileRes, patientsRes, apptsRes, prescriptionsRes, visitRes, usersRes] = await Promise.all([
          firebaseService.fetchUserProfile(uid),
          firebaseService.fetchPatients(),
          firebaseService.fetchAppointments(),
          firebaseService.fetchPrescriptions(),
          firebaseService.fetchVisitHistory(),
          firebaseService.fetchAllUsers(),
        ]);

        setUserProfile(profileRes);
        setPatients(patientsRes);
        setAppointments(apptsRes);
        setPrescriptions(prescriptionsRes);
        setVisitHistory(visitRes);

        const finalUsers = usersRes.length > 0 ? usersRes : [profileRes];
        if (profileRes.id && !finalUsers.some(u => u.id === profileRes.id)) {
          finalUsers.push(profileRes);
        }
        setAllUsers(finalUsers);

        if (patientsRes.length > 0) {
          setSelectedPatientId(patientsRes[0].id);
          setNewAppPatientId(patientsRes[0].id);
        }
        setIsClinicalDataLoaded(true);
      } catch (err) {
        console.error('Error fetching clinical data from Firebase:', err);
        triggerToast('Error de conexión con Firebase Firestore', true);
        setIsClinicalDataLoaded(true);
      }
    };

    fetchClinicalData();
  }, [token, user]);

  // Handle auto-selection of first patient if active becomes empty
  useEffect(() => {
    if (patients.length > 0 && !patients.some(p => p.id === selectedPatientId)) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  const handleOpenPatientChart = (patientId: string) => {
    const exists = patients.some(p => p.id === patientId);
    if (!exists) {
      triggerToast("Este paciente no está registrado. Registre su perfil primero.", true);
      return;
    }
    setSelectedPatientId(patientId);
    setActiveTab('patients');
    triggerToast("Expediente del paciente cargado con éxito.");
  };

  const handleDeletePatient = async (patientId: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar permanentemente este paciente y todo su historial?')) {
      return;
    }
    // Optimistic UI update
    setPatients(prev => prev.filter(p => p.id !== patientId));
    triggerToast('Paciente eliminado con éxito');

    try {
      await firebaseService.deletePatient(patientId);
    } catch (err) {
      console.error('Failed to delete patient from Firestore:', err);
      triggerToast('Paciente eliminado localmente. Error al sincronizar con el servidor.', true);
    }
  };

  const handleCreateAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppointmentError(null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const apptDate = new Date(newAppDate + 'T00:00:00');
    
    if (apptDate < today) {
      setAppointmentError("No se pueden programar citas en fechas pasadas.");
      return;
    }

    if (isManualPatientName && !newAppPatientManualName.trim()) {
      setAppointmentError("Por favor, ingrese el nombre del paciente no registrado.");
      return;
    }
    
    // Check if there is already an appointment in the same time slot and exam room on the same date
    const hasConflict = appointments.some(
      apt => apt.time.trim().toLowerCase() === newAppTime.trim().toLowerCase() && 
             apt.room.trim().toLowerCase() === newAppRoom.trim().toLowerCase() &&
             (apt.date || '') === newAppDate
    );

    if (hasConflict) {
      triggerToast(`Conflicto de Horario: Ya existe una cita en "${newAppRoom}" a las ${newAppTime} para la fecha seleccionada.`, true);
      return;
    }

    const finalPatientId = isManualPatientName ? `unreg_${Date.now()}` : newAppPatientId;
    const finalPatientName = isManualPatientName ? newAppPatientManualName.trim() : (patients.find(p => p.id === newAppPatientId)?.name || 'Unknown Patient');
    
    const newAptPayload: Appointment = {
      id: `apt_${Date.now()}`,
      time: newAppTime,
      patientId: finalPatientId,
      patientName: finalPatientName,
      reason: newAppReason,
      status: 'SCHEDULED',
      technologistId: newAppTech,
      room: newAppRoom,
      priority: newAppPriority,
      date: newAppDate
    };

    try {
      // Optimistic UI update
      setAppointments(prev => [newAptPayload, ...prev]);
      setShowAppointmentModal(false);
      triggerToast(`Cita programada para ${newAptPayload.patientName}`);

      await firebaseService.saveAppointment(newAptPayload);
    } catch (err) {
      console.error('Failed to create appointment in Firestore:', err);
      triggerToast('Cita programada localmente. Error de sincronización con el servidor.', true);
    }
  };

  const handleCreatePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatName.trim()) return;
    setPatientError(null);

    // Check duplicate name or phone number
    const normalizedNewName = newPatName.trim().toLowerCase();
    const cleanNewPhone = newPatPhone.replace(/\D/g, '');

    const nameExists = patients.some(p => p.name.trim().toLowerCase() === normalizedNewName);
    const phoneExists = cleanNewPhone !== '' && patients.some(p => p.phone && p.phone.replace(/\D/g, '') === cleanNewPhone);

    if (nameExists || phoneExists) {
      let msg = '';
      if (nameExists && phoneExists) {
        msg = `Ya existe un paciente con el mismo nombre y número de teléfono.`;
      } else if (nameExists) {
        msg = `Ya existe un paciente registrado con el nombre "${newPatName.trim()}".`;
      } else {
        msg = `Ya existe un paciente registrado con el número de teléfono "${newPatPhone}".`;
      }
      setPatientError(msg);
      triggerToast(msg, true);
      return;
    }

    const birthYear = new Date(newPatDob).getFullYear();
    const currentYear = new Date().getFullYear();
    const calculatedAge = currentYear - birthYear;

    const newPatPayload: Patient = {
      id: `pat_${Date.now()}`,
      name: newPatName,
      dob: newPatDob,
      age: calculatedAge,
      sex: newPatSex,
      bloodType: newPatBlood,
      phone: newPatPhone,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      allergies: newPatAllergies.split(',').map(s => s.trim()).filter(Boolean),
      chronicConditions: newPatConditions.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      // Optimistic UI update
      setPatients(prev => [newPatPayload, ...prev]);
      setSelectedPatientId(newPatPayload.id);
      setNewAppPatientId(newPatPayload.id);
      setShowPatientModal(false);
      
      setNewPatName('');
      setNewPatDob('1980-01-01');
      setNewPatPhone('+1 (555) 012-3344');
      setNewPatAllergies('Ninguna');
      setNewPatConditions('Sano');

      triggerToast(`Nuevo perfil de paciente creado para ${newPatPayload.name}`);
      setActiveTab('patients');

      await firebaseService.savePatient(newPatPayload);
    } catch (err) {
      console.error('Failed to create patient in Firestore:', err);
      triggerToast('Paciente guardado localmente. Error de sincronización con el servidor.', true);
    }
  };

  // Custom setter wrappers to intercept local mutations and sync with Firebase
  const handleSetAppointments = async (value: React.SetStateAction<Appointment[]>) => {
    let updated: Appointment[];
    const currentAppts = appointmentsRef.current;
    if (typeof value === 'function') {
      updated = value(currentAppts);
    } else {
      updated = value;
    }

    // Detect if an item was deleted
    const deletedItem = currentAppts.find(item => !updated.some(u => u.id === item.id));
    if (deletedItem) {
      try {
        await firebaseService.deleteAppointment(deletedItem.id);
        triggerToast('Cita cancelada con éxito');
      } catch (err) {
        console.error('Failed to delete appointment from DB:', err);
        triggerToast('Cita cancelada localmente. Error de sincronización.', true);
      }
    }

    // Detect if an item was updated
    const updatedItem = updated.find(item => {
      const orig = currentAppts.find(o => o.id === item.id);
      return orig && (
        orig.status !== item.status || 
        orig.time !== item.time || 
        orig.room !== item.room ||
        orig.isConfirmed !== item.isConfirmed
      );
    });
    if (updatedItem) {
      try {
        await firebaseService.saveAppointment(updatedItem);
      } catch (err) {
        console.error('Failed to sync appointment update to DB:', err);
        triggerToast('Aviso: Cambios guardados localmente. Error de sincronización.', true);
      }
    }

    setAppointments(updated);
  };

  const handleSetPrescriptions = async (value: React.SetStateAction<Prescription[]>) => {
    let updated: Prescription[];
    const currentPrescriptions = prescriptionsRef.current;
    if (typeof value === 'function') {
      updated = value(currentPrescriptions);
    } else {
      updated = value;
    }

    const newlyAdded = updated.find(item => !currentPrescriptions.some(p => p.id === item.id));
    if (newlyAdded) {
      try {
        await firebaseService.savePrescription(newlyAdded);
      } catch (err) {
        console.error('Failed to sync new prescription to DB:', err);
        triggerToast('Receta guardada localmente. Error de sincronización.', true);
      }
    }

    setPrescriptions(updated);
  };

  const handleSetVisitHistory = async (value: React.SetStateAction<VisitHistoryItem[]>) => {
    let updated: VisitHistoryItem[];
    const currentHistory = visitHistoryRef.current;
    if (typeof value === 'function') {
      updated = value(currentHistory);
    } else {
      updated = value;
    }

    const newlyAdded = updated.find(item => !currentHistory.some(v => v.id === item.id));
    if (newlyAdded) {
      try {
        await firebaseService.saveVisitHistory(newlyAdded);
      } catch (err) {
        console.error('Failed to sync new visit history to DB:', err);
        triggerToast('Historial guardado localmente. Error de sincronización.', true);
      }
    }

    setVisitHistory(updated);
  };

  const handleProfileChange = async (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    const uid = user?.uid || 'default-user';
    try {
      await firebaseService.saveUserProfile(uid, newProfile);
      triggerToast('Perfil actualizado con éxito');
    } catch (e) {
      console.error('Failed to sync profile update:', e);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    try {
      const payload: UserProfile = {
        id: `user_${Date.now()}`,
        name: newUserName,
        role: newUserRole,
        email: newUserEmail || `${newUserName.toLowerCase().replace(/\s+/g, '')}@ophthalmopro.clinic`,
        avatar: newUserAvatar
      };

      await firebaseService.saveNewUser(payload);
      setAllUsers(prev => [...prev, payload]);
      
      // Reset form
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('Tecnólogo Médico');
      setNewUserAvatar('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80');
      setShowAddUserForm(false);

      triggerToast(`Usuario ${payload.name} (${payload.role}) creado con éxito`);
    } catch (err) {
      console.error('Failed to create new user:', err);
      triggerToast('Error al crear el nuevo usuario', true);
    }
  };

  const handleSwitchUser = (switchedUser: UserProfile) => {
    setUserProfile(switchedUser);
    triggerToast(`Sesión cambiada a ${switchedUser.name} (${switchedUser.role})`);
  };

  if (loading) {
    return (
      <div className="bg-slate-900 min-h-screen text-slate-100 flex items-center justify-center font-sans antialiased">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold tracking-widest text-indigo-200 uppercase">Cargando Ópticas San Antonio...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-slate-950 min-h-screen text-slate-100 flex items-center justify-center font-sans antialiased relative overflow-hidden">
        {/* Background ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-900/20 rounded-full filter blur-3xl pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/85 border border-slate-800/80 p-8 md:p-10 rounded-2xl shadow-2xl max-w-md w-full backdrop-blur-md relative z-10 flex flex-col items-center"
        >
          {/* Logo */}
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6">
            <Eye className="w-8 h-8 text-white animate-pulse" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white text-center font-sans">
            OPHTHALMOPRO
          </h1>
          <p className="text-xs font-bold tracking-widest text-indigo-400 uppercase mt-1 mb-6">
            Clinical Suite
          </p>

          <p className="text-xs text-slate-400 text-center leading-relaxed mb-6">
            Portal Clínico para la Gestión de Oftalmología y Optometría. Sincronización en tiempo real con Firebase Auth y PostgreSQL.
          </p>

          {authError && (
            <div className="w-full p-3 bg-red-900/40 border border-red-500/50 rounded-xl text-xs text-red-200 text-center font-medium leading-relaxed mb-4">
              {authError}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={isAuthSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-3 border border-indigo-500/30 text-xs active:scale-98"
          >
            {isAuthSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ShieldCheck className="w-4 h-4 text-indigo-200" />
            )}
            <span>Iniciar Sesión con Google</span>
          </button>

          <div className="mt-8 pt-6 border-t border-slate-800/60 w-full flex justify-between items-center text-[10px] text-slate-500 font-mono">
            <span>DATABASE: CLOUD SQL</span>
            <span>AUTH: FIREBASE</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex overflow-hidden font-sans antialiased">
      
      {/* Side Navigation panel */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userProfile={userProfile} />

      {/* Main Container Wrapper */}
      <div className="flex-1 lg:ml-64 flex flex-col h-screen overflow-hidden">
        
        {/* Unified Top Application Bar */}
        <Header 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          userProfile={userProfile}
          onProfileClick={() => setShowProfileModal(true)}
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
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-full"
              >
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
                  userProfile={userProfile}
                />
              </motion.div>
            )}

            {activeTab === 'agenda' && (
              <motion.div
                key="agenda"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-full"
              >
                <AgendaView 
                  appointments={appointments}
                  patients={patients}
                  setAppointments={handleSetAppointments}
                  onOpenPatientChart={handleOpenPatientChart}
                  onAddAppointmentClick={() => {
                    if (patients.length > 0) {
                      setNewAppPatientId(selectedPatientId || patients[0].id);
                    }
                    setShowAppointmentModal(true);
                  }}
                  searchQuery={searchQuery}
                  triggerToast={triggerToast}
                />
              </motion.div>
            )}

            {activeTab === 'patients' && (
              <motion.div
                key="patients"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-full"
              >
                <PatientsView 
                  patients={patients}
                  selectedPatientId={selectedPatientId}
                  onPatientChange={setSelectedPatientId}
                  visitHistory={visitHistory}
                  setVisitHistory={handleSetVisitHistory}
                  onSwitchToPrescriptions={() => setActiveTab('prescriptions')}
                  onAddPatientClick={() => setShowPatientModal(true)}
                  onDeletePatient={handleDeletePatient}
                  isDataLoaded={isClinicalDataLoaded}
                  searchQuery={searchQuery}
                  prescriptions={prescriptions}
                  clinicAddress={clinicAddress}
                  clinicPhone={clinicPhone}
                />
              </motion.div>
            )}

            {activeTab === 'prescriptions' && (
              <motion.div
                key="prescriptions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-full"
              >
                <PrescriptionsView 
                  patients={patients}
                  selectedPatientId={selectedPatientId}
                  onPatientChange={setSelectedPatientId}
                  prescriptions={prescriptions}
                  setPrescriptions={handleSetPrescriptions}
                  searchQuery={searchQuery}
                  clinicAddress={clinicAddress}
                  clinicPhone={clinicPhone}
                />
              </motion.div>
            )}

            {activeTab === 'gmail' && (
              <motion.div
                key="gmail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-full"
              >
                <GmailView />
              </motion.div>
            )}

            {activeTab === 'drive' && (
              <motion.div
                key="drive"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-full"
              >
                <DriveView />
              </motion.div>
            )}

            {activeTab === 'contacts' && (
              <motion.div
                key="contacts"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-full"
              >
                <ContactsView />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl w-full"
              >
                {/* Left Column: General Clinic Settings */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 text-xs self-start">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-indigo-600" />
                      <span>Ajustes de la Clínica</span>
                    </h3>
                    <p className="text-slate-400 mt-1">Configure escáneres, interfaces de autorrefractómetro y bases de datos cloud.</p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-400 uppercase">Nombre de la Clínica</label>
                        <input type="text" readOnly value="Ópticas San Antonio" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-400 uppercase">ID del Proveedor</label>
                        <input type="text" readOnly value="MED-99201-OP" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-400 uppercase">Dirección (Membrete)</label>
                        <input 
                          type="text" 
                          value={clinicAddress}
                          onChange={(e) => setClinicAddress(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 font-semibold text-slate-700 focus:outline-none focus:border-indigo-600" 
                          placeholder="Ej. Av. Principal 123"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-400 uppercase">Teléfonos (Membrete)</label>
                        <PatternFormat 
                          format="+1 (###) ###-####"
                          mask="_"
                          value={clinicPhone}
                          onValueChange={(values) => setClinicPhone(values.formattedValue)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 font-semibold text-slate-700 focus:outline-none focus:border-indigo-600" 
                          placeholder="Ej. +1 (555) 123-4567"
                        />
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

                    <div className="flex gap-2 pt-2">
                      <span className="text-slate-400 font-semibold">Almacenamiento sin Conexión:</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4" /> Habilitado (IndexedDB / LocalStorage activos)
                      </span>
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
                        {isDarkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                        <span>Tema de la Interfaz</span>
                      </h4>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Cambie entre el modo claro tradicional y el modo oscuro optimizado para baja luminosidad durante exámenes visuales.
                      </p>
                      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg mt-2">
                        <span className="font-semibold text-slate-600">
                          {isDarkMode ? 'Modo Oscuro Activo' : 'Modo Claro Activo'}
                        </span>
                        <button
                          onClick={() => setIsDarkMode(!isDarkMode)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                            isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              isDarkMode ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="pt-2 border-t border-dashed border-slate-200 space-y-2 mt-2">
                        <h5 className="font-bold text-slate-700 flex items-center gap-1.5">
                          <Eye className="w-4 h-4 text-indigo-600 animate-pulse" />
                          <span>Accesibilidad (Alto Contraste)</span>
                        </h5>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          Ajusta los colores y aumenta el contraste para facilitar la lectura a personas con baja visión o fatiga ocular.
                        </p>
                        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                          <span className="font-semibold text-slate-600">
                            {isHighContrast ? 'Alto Contraste Activado' : 'Contraste Estándar'}
                          </span>
                          <button
                            onClick={() => setIsHighContrast(!isHighContrast)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                              isHighContrast ? 'bg-indigo-600' : 'bg-slate-200'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                isHighContrast ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: User and Staff Management */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 text-xs">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600" />
                        <span>Personal y Gestión de Usuarios</span>
                      </h3>
                      <p className="text-slate-400 mt-1">Administre y agregue personal clínico de la base de datos.</p>
                    </div>
                    
                    <button
                      onClick={() => setShowAddUserForm(!showAddUserForm)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{showAddUserForm ? "Cerrar Formulario" : "Agregar Usuario"}</span>
                    </button>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-6">
                    {/* Expandable Form: Add Clinic User */}
                    {showAddUserForm && (
                      <motion.form 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        onSubmit={handleCreateUser}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4"
                      >
                        <h4 className="font-bold text-indigo-900 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                          <span>Registrar Nuevo Colaborador</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block font-bold text-slate-500 uppercase text-[10px]">Nombre Completo</label>
                            <input 
                              type="text" 
                              required 
                              placeholder="ej. Dra. Jenkins" 
                              value={newUserName}
                              onChange={(e) => setNewUserName(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 font-semibold text-gray-700 focus:outline-none focus:border-indigo-600" 
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block font-bold text-slate-500 uppercase text-[10px]">Correo Electrónico (Opcional)</label>
                            <input 
                              type="email" 
                              placeholder="ej. jenkins@ophthalmopro.clinic" 
                              value={newUserEmail}
                              onChange={(e) => setNewUserEmail(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 font-semibold text-gray-700 focus:outline-none focus:border-indigo-600" 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block font-bold text-slate-500 uppercase text-[10px]">Rol Clínico</label>
                            <select 
                              value={newUserRole}
                              onChange={(e) => setNewUserRole(e.target.value as any)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 font-semibold text-gray-700 focus:outline-none focus:border-indigo-600 cursor-pointer"
                            >
                              <option value="Tecnólogo Médico">Tecnólogo Médico</option>
                              <option value="Recepcionista">Recepcionista</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block font-bold text-slate-500 uppercase text-[10px]">Avatar Preestablecido</label>
                            <div className="flex gap-2">
                              {[
                                'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
                                'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
                                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
                                'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
                                'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=150&auto=format&fit=crop&q=80'
                              ].map((avatarUrl, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setNewUserAvatar(avatarUrl)}
                                  className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all shrink-0 ${
                                    newUserAvatar === avatarUrl ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-slate-200 hover:scale-105'
                                  }`}
                                >
                                  <img src={avatarUrl} alt="Preset Avatar" className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddUserForm(false)}
                            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-500 font-bold rounded-lg cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
                          >
                            Registrar Colaborador
                          </button>
                        </div>
                      </motion.form>
                    )}

                    {/* Clinic Staff List */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Colaboradores de la Clínica ({allUsers.length})</h4>
                      <p className="text-slate-400 text-[10px]">Haga clic en un colaborador para cambiar el perfil activo y simular su perspectiva.</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {allUsers.map((u, index) => {
                          const isActive = userProfile.name === u.name && userProfile.role === u.role;
                          return (
                            <div 
                              key={index}
                              onClick={() => handleSwitchUser(u)}
                              className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all hover:bg-slate-50 active:scale-98 ${
                                isActive 
                                  ? 'border-indigo-600 bg-indigo-50/20 shadow-xs' 
                                  : 'border-slate-200'
                              }`}
                            >
                              <img 
                                src={u.avatar} 
                                alt={u.name} 
                                className="w-10 h-10 rounded-full object-cover border-2 border-slate-100" 
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-bold text-slate-800 text-xs truncate">{u.name}</p>
                                  {isActive && (
                                    <span className="bg-indigo-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0">
                                      Activo
                                    </span>
                                  )}
                                </div>
                                <p className="text-indigo-600 font-semibold text-[9px] uppercase tracking-wider mt-0.5">{u.role}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
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
                    Ópticas San Antonio Suite incluye soporte prioritario las 24 horas para clínicas autorizadas. Si tiene problemas para sincronizar lentes o refractores, escriba a:
                  </p>
                  <p className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-3 py-2 rounded-lg self-start inline-block">
                    soporte@opticas-san-antonio.clinic | Tel: +1 (800) 555-EYES
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-slate-100 rounded-lg hover:shadow-xs transition-shadow bg-slate-50/50">
                      <h4 className="font-bold text-slate-800">Actualizaciones de Software</h4>
                      <p className="text-slate-400 mt-1">Ópticas San Antonio Suite está en v4.14.0 (Estable).</p>
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
                
                {appointmentError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-red-700">
                    <div className="flex gap-2 items-center">
                      <AlertTriangle className="w-4 h-4" />
                      <p className="font-bold text-[11px]">{appointmentError}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block font-bold text-slate-400 uppercase">Paciente</label>
                    <label className="flex items-center gap-1 cursor-pointer text-indigo-600 font-bold text-[10px] uppercase">
                      <input
                        type="checkbox"
                        checked={isManualPatientName}
                        onChange={(e) => setIsManualPatientName(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Nombre Manual (No Registrado)</span>
                    </label>
                  </div>
                  
                  {isManualPatientName ? (
                    <input
                      type="text"
                      required
                      value={newAppPatientManualName}
                      onChange={(e) => setNewAppPatientManualName(e.target.value)}
                      placeholder="Escriba el nombre del nuevo paciente..."
                      className="w-full border border-slate-200 rounded-lg p-2 font-semibold text-gray-700 focus:outline-none focus:border-indigo-600"
                    />
                  ) : (
                    <select
                      value={newAppPatientId}
                      onChange={(e) => setNewAppPatientId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 px-3 font-semibold text-gray-700 focus:outline-none cursor-pointer"
                    >
                      {patients.length === 0 ? (
                        <option value="">No hay pacientes registrados</option>
                      ) : (
                        patients.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                        ))
                      )}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase">Fecha</label>
                    <input
                      type="date"
                      required
                      value={newAppDate}
                      onChange={(e) => setNewAppDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 font-semibold text-gray-700 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
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
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase">Prioridad</label>
                    <div className="flex gap-4 pt-2.5">
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
                        <span className="text-red-600 font-bold">Alta</span>
                      </label>
                    </div>
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
                
                {patientError && (
                  <div className="bg-rose-50 border-l-4 border-rose-500 p-3 rounded text-rose-700">
                    <div className="flex gap-2 items-center">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <p className="font-bold text-[11px]">{patientError}</p>
                    </div>
                  </div>
                )}
                
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
                    <PatternFormat
                      format="+1 (###) ###-####"
                      mask="_"
                      value={newPatPhone}
                      onValueChange={(values) => setNewPatPhone(values.formattedValue)}
                      placeholder="+1 (555) 012-3344"
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
            className={`fixed bottom-6 right-6 text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-xl z-50 flex items-center gap-2 border ${
              isToastError 
                ? 'bg-rose-950 border-rose-800 text-rose-100' 
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            {isToastError ? (
              <X className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="leading-tight">{showSuccessToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Profile configuration Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={userProfile}
        onChangeProfile={handleProfileChange}
      />

      {/* Bottom Navigation tab bar */}
      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />

    </div>
  );
}
