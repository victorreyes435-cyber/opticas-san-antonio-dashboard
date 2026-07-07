import { Patient, Appointment, Technologist, Prescription, VisitHistoryItem } from './types';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: '884-920-11',
    name: 'Eleanor Vance',
    dob: '1954-10-12',
    age: 69,
    sex: 'Female',
    bloodType: 'O+',
    phone: '(555) 019-2834',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    allergies: ['Penicilina', 'Látex'],
    chronicConditions: [
      'Diabetes Mellitus Tipo 2 (Diag. 2015)',
      'Hipertensión Arterial',
      'Sospecha de Glaucoma (AO)'
    ]
  },
  {
    id: '123-456-78',
    name: 'Jane Doe',
    dob: '1985-04-12',
    age: 39,
    sex: 'Female',
    bloodType: 'A-',
    phone: '(555) 012-3456',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    allergies: ['Sulfamidas'],
    chronicConditions: ['Miopía Leve', 'Síndrome de Ojo Seco']
  },
  {
    id: 'OP-10492',
    name: 'Robert Jenkins',
    dob: '1972-08-23',
    age: 51,
    sex: 'Male',
    bloodType: 'AB+',
    phone: '(555) 018-9922',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    allergies: ['Ninguna'],
    chronicConditions: ['Cataratas (Etapa Temprana)']
  },
  {
    id: 'OP-09881',
    name: 'Sarah Lewis',
    dob: '1991-11-05',
    age: 32,
    sex: 'Female',
    bloodType: 'B+',
    phone: '(555) 015-7733',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    allergies: ['Aspirina'],
    chronicConditions: ['Glaucoma (Controlado)']
  },
  {
    id: 'OP-11002',
    name: 'Marcus Chen',
    dob: '1998-03-14',
    age: 26,
    sex: 'Male',
    bloodType: 'O-',
    phone: '(555) 013-1144',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    allergies: ['Ácaros del polvo'],
    chronicConditions: ['Astigmatismo (OD)']
  },
  {
    id: 'OP-07743',
    name: 'Emily White',
    dob: '1965-06-30',
    age: 59,
    sex: 'Female',
    bloodType: 'A+',
    phone: '(555) 011-8855',
    avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&auto=format&fit=crop&q=80',
    allergies: ['Látex'],
    chronicConditions: ['Presbicia']
  }
];

export const TECHNOLOGISTS: Technologist[] = [];

export const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx_001',
    patientId: '123-456-78',
    patientName: 'Jane Doe',
    patientDob: '1985-04-12',
    date: '2023-10-27',
    doctorName: 'Sarah Jenkins',
    od: { sph: '-2.00', cyl: '-0.50', axis: '180', add: '+1.50', pd: '32.0', prism: 'Base Abajo' },
    os: { sph: '-2.25', cyl: '-0.25', axis: '175', add: '+1.50', pd: '32.5', prism: '-' },
    lensType: 'Progressive',
    coatings: {
      antiReflective: true,
      uvProtection: true,
      blueLightFilter: false,
      photochromic: false
    },
    notes: 'Paciente solicita lentes fotosensibles si hay opción premium disponible. Verificar tamaño en montura deportiva.'
  },
  {
    id: 'rx_002',
    patientId: 'ms_01',
    patientName: 'Michael Smith',
    patientDob: '1979-11-20',
    date: '2023-10-26',
    doctorName: 'Sarah Jenkins',
    od: { sph: '-1.50', cyl: '-0.75', axis: '090', add: '-', pd: '31.5', prism: '-' },
    os: { sph: '-1.50', cyl: '-0.50', axis: '095', add: '-', pd: '31.5', prism: '-' },
    lensType: 'Single Vision',
    coatings: {
      antiReflective: true,
      uvProtection: true,
      blueLightFilter: true,
      photochromic: false
    },
    notes: 'Principalmente para uso de computadora y lectura.'
  },
  {
    id: 'rx_003',
    patientId: 'aj_02',
    patientName: 'Alice Johnson',
    patientDob: '1962-02-15',
    date: '2023-10-26',
    doctorName: 'Dr. Aris Thorne',
    od: { sph: '+1.75', cyl: '-0.25', axis: '045', add: '+2.00', pd: '33.0', prism: '-' },
    os: { sph: '+2.00', cyl: '-0.50', axis: '135', add: '+2.00', pd: '33.5', prism: '-' },
    lensType: 'Progressive',
    coatings: {
      antiReflective: true,
      uvProtection: true,
      blueLightFilter: false,
      photochromic: true
    },
    notes: 'Lentes fotosensibles prescritos para uso activo al aire libre.'
  },
  {
    id: 'rx_004',
    patientId: 'rw_03',
    patientName: 'Robert Williams',
    patientDob: '1948-07-09',
    date: '2023-10-25',
    doctorName: 'Dr. S. Miller',
    od: { sph: '+2.50', cyl: '-1.00', axis: '015', add: '+2.50', pd: '34.0', prism: '1.5 BI' },
    os: { sph: '+2.25', cyl: '-1.25', axis: '165', add: '+2.50', pd: '33.5', prism: '1.5 BI' },
    lensType: 'Bifocal',
    coatings: {
      antiReflective: true,
      uvProtection: true,
      blueLightFilter: false,
      photochromic: false
    },
    notes: 'Se prescribieron bifocales con línea ya que el paciente no logra adaptarse a los progresivos.'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt_1',
    time: '09:00 AM',
    patientId: 'OP-10492',
    patientName: 'Robert Jenkins',
    reason: 'Examen Completo',
    status: 'ARRIVED',
    technologistId: 'default-user',
    room: 'Sala 1 (OCT)',
    priority: 'Normal'
  },
  {
    id: 'apt_2',
    time: '09:45 AM',
    patientId: 'OP-09881',
    patientName: 'Sarah Lewis',
    reason: 'Seguimiento de Glaucoma',
    status: 'CHECKING IN',
    technologistId: 'default-user',
    room: 'Sala 2 (Campo Visual)',
    priority: 'Normal'
  },
  {
    id: 'apt_3',
    time: '10:30 AM',
    patientId: 'OP-11002',
    patientName: 'Marcus Chen',
    reason: 'Adaptación de Lentes de Contacto',
    status: 'SCHEDULED',
    technologistId: 'default-user',
    room: 'Sala 3 (Estándar)',
    priority: 'Normal'
  },
  {
    id: 'apt_4',
    time: '11:15 AM',
    patientId: 'OP-07743',
    patientName: 'Emily White',
    reason: 'Evaluación de Ojo Seco',
    status: 'SCHEDULED',
    technologistId: 'default-user',
    room: 'Sala 1 (OCT)',
    priority: 'Normal'
  }
];

export const VISIT_HISTORY: VisitHistoryItem[] = [
  {
    id: 'visit_1',
    date: '14 Ago, 2023',
    type: 'Examen Ocular Completo',
    notes: 'Chequeo de rutina. PIO estable. Se observa progresión leve de esclerosis nuclear en ambos ojos.',
    provider: 'Dr. Aris Thorne',
    icon: 'visibility'
  },
  {
    id: 'visit_2',
    date: '02 Feb, 2023',
    type: 'Prueba de Campo Visual',
    notes: 'Seguimiento por sospecha de glaucoma. Campos visuales confiables y completos en ambos ojos. No se observan defectos.',
    provider: 'Tec: Sarah Jenkins',
    icon: 'science'
  }
];
