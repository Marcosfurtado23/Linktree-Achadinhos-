import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  getDocFromServer,
  onSnapshot 
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Error handling helpers matching the mandatory skill specification
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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth ? auth.currentUser?.uid : null,
      email: auth ? auth.currentUser?.email : null,
      emailVerified: auth ? auth.currentUser?.emailVerified : null,
      isAnonymous: auth ? auth.currentUser?.isAnonymous : null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Check if configuration is default/unconfigured placeholder
export const isConfigPlaceholder = 
  !firebaseConfig.apiKey || 
  firebaseConfig.apiKey.includes('mock-api-key') || 
  firebaseConfig.apiKey === '';

let app;
export let db: any;
export let auth: any;
export let isUsingMockDb = false;

try {
  if (isConfigPlaceholder) {
    throw new Error("Estou usando credenciais genéricas do Firebase.");
  }
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  auth = getAuth(app);
  isUsingMockDb = false;

  // Let's call a non-blocking test connection
  getDocFromServer(doc(db, 'test-connection-probe', 'probe')).catch(() => {
    // If it fails on permissions or network, we still compile fine
  });

} catch (e) {
  isUsingMockDb = true;
  console.warn("Firebase initialized in Local Fallback mode due to placeholder or disabled credentials. Details:", e);
}

// Export custom auth and firestore helper actions that support both Firebase and Mock local storage
export const firebaseUtils = {
  // Authentication Actions
  signUpUser: async (email: string, pass: string): Promise<any> => {
    if (isUsingMockDb) {
      // Offline Simulation
      const usersList = JSON.parse(localStorage.getItem('achadinhos_mock_users') || '[]');
      if (usersList.some((u: any) => u.email === email)) {
        throw new Error("auth/email-already-in-use");
      }
      const newUser = { uid: `mock-${Date.now()}`, email };
      usersList.push({ ...newUser, pass });
      localStorage.setItem('achadinhos_mock_users', JSON.stringify(usersList));
      localStorage.setItem('achadinhos_mock_current_user', JSON.stringify(newUser));
      return newUser;
    } else {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        return cred.user;
      } catch (err: any) {
        throw err;
      }
    }
  },

  signInUser: async (email: string, pass: string): Promise<any> => {
    if (isUsingMockDb) {
      const usersList = JSON.parse(localStorage.getItem('achadinhos_mock_users') || '[]');
      const user = usersList.find((u: any) => u.email === email && u.pass === pass);
      if (!user) {
        throw new Error("auth/wrong-password");
      }
      const loggedUser = { uid: user.uid, email: user.email };
      localStorage.setItem('achadinhos_mock_current_user', JSON.stringify(loggedUser));
      return loggedUser;
    } else {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        return cred.user;
      } catch (err: any) {
        throw err;
      }
    }
  },

  resetUserPassword: async (email: string): Promise<void> => {
    if (isUsingMockDb) {
      const usersList = JSON.parse(localStorage.getItem('achadinhos_mock_users') || '[]');
      const userExists = usersList.some((u: any) => u.email === email);
      if (!userExists) {
        throw new Error("auth/user-not-found");
      }
      return; // Simulated success
    } else {
      try {
        await sendPasswordResetEmail(auth, email);
      } catch (err: any) {
        throw err;
      }
    }
  },

  logOutUser: async (): Promise<void> => {
    if (isUsingMockDb) {
      localStorage.removeItem('achadinhos_mock_current_user');
    } else {
      await signOut(auth);
    }
  },

  onAuthStatusChange: (callback: (user: any | null) => void) => {
    if (isUsingMockDb) {
      const checkAuth = () => {
        const saved = localStorage.getItem('achadinhos_mock_current_user');
        callback(saved ? JSON.parse(saved) : null);
      };
      checkAuth();
      // Poll or use custom event for state changes
      const interval = setInterval(checkAuth, 1000);
      return () => clearInterval(interval);
    } else {
      return onAuthStateChanged(auth, (user) => {
        callback(user);
      });
    }
  }
};
