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
    allergies: ['Penicillin', 'Latex'],
    chronicConditions: [
      'Type 2 Diabetes Mellitus (Diagnosed 2015)',
      'Hypertension',
      'Glaucoma Suspect (OU)'
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
    allergies: ['Sulfa Drugs'],
    chronicConditions: ['Mild Myopia', 'Dry Eye Syndrome']
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
    allergies: ['None'],
    chronicConditions: ['Cataracts (Early Stage)']
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
    allergies: ['Aspirin'],
    chronicConditions: ['Glaucoma (Controlled)']
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
    allergies: ['Dust Mites'],
    chronicConditions: ['Astigmatism (OD)']
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
    allergies: ['Latex'],
    chronicConditions: ['Presbyopia']
  }
];

export const TECHNOLOGISTS: Technologist[] = [
  {
    id: 'dr_reynolds',
    name: 'Dr. Reynolds',
    initials: 'DR',
    role: 'Ophthalmologist',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'sarah_chen',
    name: 'Sarah Chen (OD)',
    initials: 'SC',
    role: 'Optometrist',
    avatar: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'marcus_pierce',
    name: 'Marcus Pierce',
    initials: 'MP',
    role: 'Clinical Assistant',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx_001',
    patientId: '123-456-78',
    patientName: 'Jane Doe',
    patientDob: '1985-04-12',
    date: '2023-10-27',
    doctorName: 'Sarah Jenkins',
    od: { sph: '-2.00', cyl: '-0.50', axis: '180', add: '+1.50', pd: '32.0', prism: 'Base Down' },
    os: { sph: '-2.25', cyl: '-0.25', axis: '175', add: '+1.50', pd: '32.5', prism: '-' },
    lensType: 'Progressive',
    coatings: {
      antiReflective: true,
      uvProtection: true,
      blueLightFilter: false,
      photochromic: false
    },
    notes: 'Patient requests transition lenses if premium option is available. Check sizing on sport frame.'
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
    notes: 'Mainly for computer use and reading.'
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
    notes: 'Transition lenses prescribed for outdoor active use.'
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
    notes: 'Prescribed lined bifocals as patient is unable to adapt to progressives.'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt_1',
    time: '09:00 AM',
    patientId: 'OP-10492',
    patientName: 'Robert Jenkins',
    reason: 'Comprehensive Exam',
    status: 'ARRIVED',
    technologistId: 'dr_reynolds',
    room: 'Room 1 (OCT)',
    priority: 'Normal'
  },
  {
    id: 'apt_2',
    time: '09:45 AM',
    patientId: 'OP-09881',
    patientName: 'Sarah Lewis',
    reason: 'Glaucoma Follow-up',
    status: 'CHECKING IN',
    technologistId: 'sarah_chen',
    room: 'Room 2 (Visual Field)',
    priority: 'Normal'
  },
  {
    id: 'apt_3',
    time: '10:30 AM',
    patientId: 'OP-11002',
    patientName: 'Marcus Chen',
    reason: 'Contact Lens Fitting',
    status: 'SCHEDULED',
    technologistId: 'marcus_pierce',
    room: 'Room 3 (Standard)',
    priority: 'Normal'
  },
  {
    id: 'apt_4',
    time: '11:15 AM',
    patientId: 'OP-07743',
    patientName: 'Emily White',
    reason: 'Dry Eye Assessment',
    status: 'SCHEDULED',
    technologistId: 'dr_reynolds',
    room: 'Room 1 (OCT)',
    priority: 'Normal'
  }
];

export const VISIT_HISTORY: VisitHistoryItem[] = [
  {
    id: 'visit_1',
    date: 'Aug 14, 2023',
    type: 'Comprehensive Eye Exam',
    notes: 'Routine checkup. IOP stable. Mild progression of nuclear sclerosis noted in both eyes.',
    provider: 'Dr. Aris Thorne',
    icon: 'visibility'
  },
  {
    id: 'visit_2',
    date: 'Feb 02, 2023',
    type: 'Visual Field Testing',
    notes: 'Follow-up for glaucoma suspect status. Visual fields reliable and full OU. No defects noted.',
    provider: 'Tech: Sarah Jenkins',
    icon: 'science'
  }
];
