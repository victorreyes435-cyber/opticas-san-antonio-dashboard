import { createClient } from '@supabase/supabase-js';
import { Patient, Appointment, Prescription } from '../types';

const supabaseUrl = ((import.meta as any).env?.VITE_SUPABASE_URL) || '';
const supabaseAnonKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || '';

export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
  !supabaseUrl.includes('placeholder');

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Helper to get raw supabase client if needed
export function getSupabase() {
  if (!isSupabaseConfigured) {
    return null;
  }
  return supabase;
}

// SQL Schema code to display in UI for user reference
export const SUPABASE_SQL_SCHEMA = `-- Copia y pega este script SQL en el Editor SQL de Supabase para inicializar tus tablas:

-- 1. Tabla de Pacientes
create table if not exists patients (
  id text primary key,
  name text not null,
  dob text,
  age integer,
  sex text,
  "bloodType" text,
  phone text,
  avatar text,
  allergies jsonb,
  "chronicConditions" jsonb,
  "created_at" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar acceso de lectura/escritura público (o según tus políticas RLS)
alter table patients enable row level security;
create policy "Acceso público total para Pacientes" on patients for all using (true) with check (true);

-- 2. Tabla de Citas (Appointments)
create table if not exists appointments (
  id text primary key,
  time text,
  "patientId" text,
  "patientName" text not null,
  reason text,
  status text,
  "technologistId" text,
  room text,
  priority text,
  "created_at" timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table appointments enable row level security;
create policy "Acceso público total para Citas" on appointments for all using (true) with check (true);

-- 3. Tabla de Recetas de Lentes (Prescriptions)
create table if not exists prescriptions (
  id text primary key,
  "patientId" text,
  "patientName" text not null,
  "patientDob" text,
  date text,
  "doctorName" text,
  od jsonb,
  os jsonb,
  "lensType" text,
  coatings jsonb,
  notes text,
  "created_at" timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table prescriptions enable row level security;
create policy "Acceso público total para Recetas" on prescriptions for all using (true) with check (true);
`;

// Database sync services
export const supabaseService = {
  // --- PATIENTS ---
  async fetchPatients(): Promise<Patient[]> {
    if (!supabase) throw new Error('Supabase no está configurado');
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;

    return (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      dob: p.dob || '1980-01-01',
      age: Number(p.age) || 30,
      sex: (p.sex as any) || 'Female',
      bloodType: p.bloodType || 'O+',
      phone: p.phone || '',
      avatar: p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      allergies: Array.isArray(p.allergies) ? p.allergies : [],
      chronicConditions: Array.isArray(p.chronicConditions) ? p.chronicConditions : []
    }));
  },

  async upsertPatient(patient: Patient) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('patients')
      .upsert({
        id: patient.id,
        name: patient.name,
        dob: patient.dob,
        age: patient.age,
        sex: patient.sex,
        bloodType: patient.bloodType,
        phone: patient.phone,
        avatar: patient.avatar,
        allergies: patient.allergies,
        chronicConditions: patient.chronicConditions
      })
      .select();

    if (error) throw error;
    return data;
  },

  async deletePatient(id: string) {
    if (!supabase) return null;
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // --- APPOINTMENTS ---
  async fetchAppointments(): Promise<Appointment[]> {
    if (!supabase) throw new Error('Supabase no está configurado');
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('time', { ascending: true });
    
    if (error) throw error;

    return (data || []).map((a: any) => ({
      id: a.id,
      time: a.time || '',
      patientId: a.patientId || '',
      patientName: a.patientName || '',
      reason: a.reason || '',
      status: (a.status as any) || 'SCHEDULED',
      technologistId: a.technologistId || '',
      room: a.room || '',
      priority: (a.priority as any) || 'Normal'
    }));
  },

  async upsertAppointment(appt: Appointment) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('appointments')
      .upsert({
        id: appt.id,
        time: appt.time,
        patientId: appt.patientId,
        patientName: appt.patientName,
        reason: appt.reason,
        status: appt.status,
        technologistId: appt.technologistId,
        room: appt.room,
        priority: appt.priority || 'Normal'
      })
      .select();

    if (error) throw error;
    return data;
  },

  async deleteAppointment(id: string) {
    if (!supabase) return null;
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // --- PRESCRIPTIONS ---
  async fetchPrescriptions(): Promise<Prescription[]> {
    if (!supabase) throw new Error('Supabase no está configurado');
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;

    return (data || []).map((r: any) => ({
      id: r.id,
      patientId: r.patientId || '',
      patientName: r.patientName || '',
      patientDob: r.patientDob || '',
      date: r.date || '',
      doctorName: r.doctorName || '',
      od: r.od || { sph: '0.00', cyl: '0.00', axis: '0', add: '0', pd: '0', prism: '0' },
      os: r.os || { sph: '0.00', cyl: '0.00', axis: '0', add: '0', pd: '0', prism: '0' },
      lensType: (r.lensType as any) || 'Single Vision',
      coatings: r.coatings || { antiReflective: false, uvProtection: false, blueLightFilter: false, photochromic: false },
      notes: r.notes || ''
    }));
  },

  async upsertPrescription(rx: Prescription) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('prescriptions')
      .upsert({
        id: rx.id,
        patientId: rx.patientId,
        patientName: rx.patientName,
        patientDob: rx.patientDob,
        date: rx.date,
        doctorName: rx.doctorName,
        od: rx.od,
        os: rx.os,
        lensType: rx.lensType,
        coatings: rx.coatings,
        notes: rx.notes
      })
      .select();

    if (error) throw error;
    return data;
  },

  async deletePrescription(id: string) {
    if (!supabase) return null;
    const { error } = await supabase
      .from('prescriptions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};
