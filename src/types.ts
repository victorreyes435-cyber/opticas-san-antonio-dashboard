export interface Patient {
  id: string;
  name: string;
  dob: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  bloodType: string;
  phone: string;
  avatar: string;
  allergies: string[];
  chronicConditions: string[];
}

export interface Encounter {
  id: string;
  patientId: string;
  date: string;
  doctorName: string;
  status: 'In Progress' | 'Completed' | 'Draft';
  chiefComplaint: string;
  hpi: string;
  ros: string;
  vitals: {
    bp: string;
    hr: string;
    iopOD: string;
    iopOS: string;
  };
}

export interface RefractionValues {
  sph: string;
  cyl: string;
  axis: string;
  add: string;
  pd: string;
  prism: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  patientDob: string;
  date: string;
  doctorName: string;
  od: RefractionValues;
  os: RefractionValues;
  lensType: 'Single Vision' | 'Bifocal' | 'Progressive';
  coatings: {
    antiReflective: boolean;
    uvProtection: boolean;
    blueLightFilter: boolean;
    photochromic: boolean;
  };
  notes: string;
}

export interface Appointment {
  id: string;
  time: string;
  patientId: string;
  patientName: string;
  reason: string;
  status: 'ARRIVED' | 'CHECKING IN' | 'SCHEDULED' | 'COMPLETED';
  technologistId: string;
  room: string;
  priority?: 'High' | 'Normal';
  date?: string;
  isConfirmed?: boolean;
}

export interface Technologist {
  id: string;
  name: string;
  initials: string;
  role: string;
  avatar: string;
}

export interface VisitHistoryItem {
  id: string;
  date: string;
  type: string;
  notes: string;
  provider: string;
  icon: 'visibility' | 'science' | 'healing';
}

export interface UserProfile {
  id?: string;
  name: string;
  role: 'Recepcionista' | 'Tecnólogo Médico';
  avatar: string;
  email?: string;
}

