import { pgTable, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  role: text('role'), // 'Recepcionista' | 'Tecnólogo Médico'
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const patients = pgTable('patients', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  dob: text('dob').notNull(),
  age: integer('age').notNull(),
  sex: text('sex').notNull(),
  bloodType: text('blood_type').notNull(),
  phone: text('phone').notNull(),
  avatar: text('avatar').notNull(),
  allergies: jsonb('allergies').$type<string[]>().notNull(),
  chronicConditions: jsonb('chronic_conditions').$type<string[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const appointments = pgTable('appointments', {
  id: text('id').primaryKey(),
  time: text('time').notNull(),
  patientId: text('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  patientName: text('patient_name').notNull(),
  reason: text('reason').notNull(),
  status: text('status').notNull(), // 'ARRIVED' | 'CHECKING IN' | 'SCHEDULED' | 'COMPLETED'
  technologistId: text('technologist_id').notNull(),
  room: text('room').notNull(),
  priority: text('priority'), // 'High' | 'Normal'
  createdAt: timestamp('created_at').defaultNow(),
});

export const prescriptions = pgTable('prescriptions', {
  id: text('id').primaryKey(),
  patientId: text('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  patientName: text('patient_name').notNull(),
  patientDob: text('patient_dob').notNull(),
  date: text('date').notNull(),
  doctorName: text('doctor_name').notNull(),
  od: jsonb('od').notNull(),
  os: jsonb('os').notNull(),
  lensType: text('lens_type').notNull(),
  coatings: jsonb('coatings').notNull(),
  notes: text('notes').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const visitHistory = pgTable('visit_history', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  type: text('type').notNull(),
  notes: text('notes').notNull(),
  provider: text('provider').notNull(),
  icon: text('icon').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
