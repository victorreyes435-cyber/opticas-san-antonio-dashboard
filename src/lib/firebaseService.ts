import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Patient, Appointment, Prescription, VisitHistoryItem, UserProfile } from '../types';
import { INITIAL_PATIENTS, INITIAL_APPOINTMENTS, INITIAL_PRESCRIPTIONS, VISIT_HISTORY } from '../data';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper to seed Firestore collection if empty
async function seedCollectionIfEmpty<T extends { id: string }>(
  collectionName: string,
  initialData: T[]
): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    
    if (snapshot.empty) {
      console.log(`Firestore collection "${collectionName}" is empty. Seeding ${initialData.length} documents...`);
      for (const item of initialData) {
        try {
          await setDoc(doc(db, collectionName, item.id), item);
        } catch (writeError) {
          handleFirestoreError(writeError, OperationType.WRITE, `${collectionName}/${item.id}`);
        }
      }
      return initialData;
    }
    
    return snapshot.docs.map(doc => doc.data() as T);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionName);
  }
}

export const firebaseService = {
  // --- PATIENTS ---
  async fetchPatients(): Promise<Patient[]> {
    return seedCollectionIfEmpty<Patient>('patients', INITIAL_PATIENTS);
  },

  async savePatient(patient: Patient): Promise<void> {
    try {
      await setDoc(doc(db, 'patients', patient.id), patient);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `patients/${patient.id}`);
    }
  },

  async deletePatient(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'patients', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `patients/${id}`);
    }
  },

  // --- APPOINTMENTS ---
  async fetchAppointments(): Promise<Appointment[]> {
    return seedCollectionIfEmpty<Appointment>('appointments', INITIAL_APPOINTMENTS);
  },

  async saveAppointment(appt: Appointment): Promise<void> {
    try {
      await setDoc(doc(db, 'appointments', appt.id), appt);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `appointments/${appt.id}`);
    }
  },

  async deleteAppointment(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'appointments', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `appointments/${id}`);
    }
  },

  // --- PRESCRIPTIONS ---
  async fetchPrescriptions(): Promise<Prescription[]> {
    return seedCollectionIfEmpty<Prescription>('prescriptions', INITIAL_PRESCRIPTIONS);
  },

  async savePrescription(rx: Prescription): Promise<void> {
    try {
      await setDoc(doc(db, 'prescriptions', rx.id), rx);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `prescriptions/${rx.id}`);
    }
  },

  async deletePrescription(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'prescriptions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `prescriptions/${id}`);
    }
  },

  // --- VISIT HISTORY ---
  async fetchVisitHistory(): Promise<VisitHistoryItem[]> {
    return seedCollectionIfEmpty<VisitHistoryItem>('visitHistory', VISIT_HISTORY);
  },

  async saveVisitHistory(visit: VisitHistoryItem): Promise<void> {
    try {
      await setDoc(doc(db, 'visitHistory', visit.id), visit);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `visitHistory/${visit.id}`);
    }
  },

  // --- USER PROFILES ---
  async fetchUserProfile(uid: string): Promise<UserProfile> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      } else {
        const defaultProfile: UserProfile = {
          id: uid,
          email: auth.currentUser?.email || 'dr.miller@optica.com',
          name: auth.currentUser?.displayName || 'Dr. S. Miller',
          role: 'Tecnólogo Médico',
          avatar: auth.currentUser?.photoURL || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
        };
        try {
          await setDoc(docRef, defaultProfile);
        } catch (writeErr) {
          handleFirestoreError(writeErr, OperationType.WRITE, `users/${uid}`);
        }
        return defaultProfile;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    }
  },

  async saveUserProfile(uid: string, profile: UserProfile): Promise<void> {
    try {
      await setDoc(doc(db, 'users', uid), profile);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
    }
  },

  async fetchAllUsers(): Promise<UserProfile[]> {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      if (snapshot.empty) {
        return [];
      }
      return snapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
    }
  },

  async saveNewUser(user: UserProfile): Promise<void> {
    try {
      await setDoc(doc(db, 'users', user.id!), user);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
    }
  }
};
