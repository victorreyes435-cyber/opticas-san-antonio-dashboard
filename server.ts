import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import { users, patients, appointments, prescriptions, visitHistory } from './src/db/schema.ts';
import { eq } from 'drizzle-orm';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { INITIAL_PATIENTS, INITIAL_APPOINTMENTS, INITIAL_PRESCRIPTIONS, VISIT_HISTORY } from './src/data.ts';

async function seedDatabase() {
  try {
    const existingPatients = await db.select().from(patients).limit(1);
    if (existingPatients.length === 0) {
      console.log('No clinical data found. Seeding initial database tables...');

      // Seed Patients
      for (const p of INITIAL_PATIENTS) {
        await db.insert(patients).values({
          id: p.id,
          name: p.name,
          dob: p.dob,
          age: p.age,
          sex: p.sex,
          bloodType: p.bloodType,
          phone: p.phone,
          avatar: p.avatar,
          allergies: p.allergies,
          chronicConditions: p.chronicConditions,
        });
      }

      // Seed Appointments
      for (const a of INITIAL_APPOINTMENTS) {
        await db.insert(appointments).values({
          id: a.id,
          time: a.time,
          patientId: a.patientId,
          patientName: a.patientName,
          reason: a.reason,
          status: a.status,
          technologistId: a.technologistId,
          room: a.room,
          priority: a.priority || 'Normal',
        });
      }

      // Seed Prescriptions
      for (const r of INITIAL_PRESCRIPTIONS) {
        await db.insert(prescriptions).values({
          id: r.id,
          patientId: r.patientId,
          patientName: r.patientName,
          patientDob: r.patientDob,
          date: r.date,
          doctorName: r.doctorName,
          od: r.od,
          os: r.os,
          lensType: r.lensType,
          coatings: r.coatings,
          notes: r.notes,
        });
      }

      // Seed Visit History
      for (const v of VISIT_HISTORY) {
        await db.insert(visitHistory).values({
          id: v.id,
          date: v.date,
          type: v.type,
          notes: v.notes,
          provider: v.provider,
          icon: v.icon,
        });
      }

      console.log('Clinical database tables successfully seeded.');
    }
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Seed data on startup
  await seedDatabase();

  // 1. GET User Profile
  app.get('/api/profile', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const email = req.user!.email || '';
      
      const userList = await db.select().from(users).where(eq(users.id, uid)).limit(1);
      
      if (userList.length === 0) {
        // Register new user on first sign-in
        const defaultName = req.user!.name || 'Dr. S. Miller';
        const defaultAvatar = req.user!.picture || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80';
        
        const newUser = await db.insert(users).values({
          id: uid,
          email,
          name: defaultName,
          role: 'Tecnólogo Médico',
          avatar: defaultAvatar,
        }).returning();
        
        return res.json(newUser[0]);
      }
      
      return res.json(userList[0]);
    } catch (error) {
      console.error('Error fetching/creating profile:', error);
      res.status(500).json({ error: 'Database query failed' });
    }
  });

  // 2b. GET All Users
  app.get('/api/users', requireAuth, async (req: AuthRequest, res) => {
    try {
      const allUsers = await db.select().from(users);
      res.json(allUsers);
    } catch (error) {
      console.error('Error fetching all users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // 2c. POST New User
  app.post('/api/users', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id, email, name, role, avatar } = req.body;
      const newUser = await db.insert(users).values({
        id: id || `user_${Date.now()}`,
        email: email || '',
        name: name || 'Nuevo Usuario',
        role: role || 'Tecnólogo Médico',
        avatar: avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      }).returning();
      res.status(201).json(newUser[0]);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  // 2. PUT User Profile
  app.put('/api/profile', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const { name, role, avatar } = req.body;
      
      const updatedUser = await db.update(users)
        .set({ name, role, avatar })
        .where(eq(users.id, uid))
        .returning();
        
      res.json(updatedUser[0]);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: 'Failed to update user profile' });
    }
  });

  // 3. GET Patients
  app.get('/api/patients', requireAuth, async (req: AuthRequest, res) => {
    try {
      const allPatients = await db.select().from(patients);
      res.json(allPatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      res.status(500).json({ error: 'Failed to fetch patients' });
    }
  });

  // 4. POST Patients
  app.post('/api/patients', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id, name, dob, age, sex, bloodType, phone, avatar, allergies, chronicConditions } = req.body;
      const newPatient = await db.insert(patients).values({
        id: id || `OP-${Math.floor(10000 + Math.random() * 90000)}`,
        name,
        dob,
        age: parseInt(age, 10) || 0,
        sex,
        bloodType,
        phone,
        avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        allergies: allergies || [],
        chronicConditions: chronicConditions || [],
      }).returning();
      res.status(201).json(newPatient[0]);
    } catch (error) {
      console.error('Error creating patient:', error);
      res.status(500).json({ error: 'Failed to create patient' });
    }
  });

  // 5. GET Appointments
  app.get('/api/appointments', requireAuth, async (req: AuthRequest, res) => {
    try {
      const allAppointments = await db.select().from(appointments);
      res.json(allAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ error: 'Failed to fetch appointments' });
    }
  });

  // 6. POST Appointments
  app.post('/api/appointments', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id, time, patientId, patientName, reason, status, technologistId, room, priority } = req.body;
      const newAppointment = await db.insert(appointments).values({
        id: id || `apt_${Date.now()}`,
        time,
        patientId,
        patientName,
        reason,
        status: status || 'SCHEDULED',
        technologistId,
        room,
        priority: priority || 'Normal',
      }).returning();
      res.json(newAppointment[0]);
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({ error: 'Failed to create appointment' });
    }
  });

  // 7. PUT Appointments (Update status/fields)
  app.put('/api/appointments/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const updated = await db.update(appointments)
        .set(updates)
        .where(eq(appointments.id, id))
        .returning();
        
      if (updated.length === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      res.json(updated[0]);
    } catch (error) {
      console.error('Error updating appointment:', error);
      res.status(500).json({ error: 'Failed to update appointment' });
    }
  });

  // 7b. DELETE Appointments
  app.delete('/api/appointments/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const deleted = await db.delete(appointments).where(eq(appointments.id, id)).returning();
      if (deleted.length === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      res.json({ success: true, deleted: deleted[0] });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      res.status(500).json({ error: 'Failed to delete appointment' });
    }
  });

  // 8. GET Prescriptions
  app.get('/api/prescriptions', requireAuth, async (req: AuthRequest, res) => {
    try {
      const allPrescriptions = await db.select().from(prescriptions);
      res.json(allPrescriptions);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      res.status(500).json({ error: 'Failed to fetch prescriptions' });
    }
  });

  // 9. POST Prescriptions
  app.post('/api/prescriptions', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id, patientId, patientName, patientDob, date, doctorName, od, os, lensType, coatings, notes } = req.body;
      const newPrescription = await db.insert(prescriptions).values({
        id: id || `rx_${Date.now()}`,
        patientId,
        patientName,
        patientDob,
        date,
        doctorName,
        od,
        os,
        lensType,
        coatings,
        notes,
      }).returning();
      res.json(newPrescription[0]);
    } catch (error) {
      console.error('Error creating prescription:', error);
      res.status(500).json({ error: 'Failed to create prescription' });
    }
  });

  // 10. GET Visit History
  app.get('/api/visit-history', requireAuth, async (req: AuthRequest, res) => {
    try {
      const allVisitHistory = await db.select().from(visitHistory);
      res.json(allVisitHistory);
    } catch (error) {
      console.error('Error fetching visit history:', error);
      res.status(500).json({ error: 'Failed to fetch visit history' });
    }
  });

  // 11. POST Visit History
  app.post('/api/visit-history', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id, date, type, notes, provider, icon } = req.body;
      const newVisit = await db.insert(visitHistory).values({
        id: id || `visit_${Date.now()}`,
        date,
        type,
        notes,
        provider,
        icon,
      }).returning();
      res.json(newVisit[0]);
    } catch (error) {
      console.error('Error creating visit history item:', error);
      res.status(500).json({ error: 'Failed to create visit history item' });
    }
  });

  // Vite development middleware or static production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
