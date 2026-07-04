import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  googleToken: string | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
  setGoogleToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mockUser = {
    uid: 'default-user',
    email: 'dr.miller@optica.com',
    displayName: 'Usuario',
    photoURL: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'mock-token',
    getIdTokenResult: async () => ({}) as any,
    reload: async () => {},
    toJSON: () => ({}),
  } as any as User;

  const [user] = useState<User | null>(mockUser);
  const [token] = useState<string | null>('mock-token');
  const [googleToken, setGoogleToken] = useState<string | null>('mock-google-token');
  const [loading] = useState(false);

  const signIn = async () => {
    // No-op for bypassed login
  };

  const logOut = async () => {
    // No-op for bypassed login
  };

  return (
    <AuthContext.Provider value={{ user, token, googleToken, loading, signIn, logOut, setGoogleToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
