import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, getDocFromServer } from 'firebase/firestore';

// Optional import of the config file to prevent build errors if it's missing (e.g. in CI/CD)
const configs = import.meta.glob('../../firebase-applet-config.json', { eager: true });
const firebaseConfigJson = (configs['../../firebase-applet-config.json'] as any)?.default || {};

// Support environment variables for Vercel/Production
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
};

const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId;

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Ensure persistence is set to local
setPersistence(auth, browserLocalPersistence);

export const db = getFirestore(app, firestoreDatabaseId);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  hd: 'vitbhopal.ac.in' // Suggest VIT domain in Google login
});

let isSigningIn = false;

export const signInWithGoogle = async () => {
  if (isSigningIn) return;
  isSigningIn = true;
  
  try {
    // Small delay to ensure any previous auth state is settled
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    if (!user.email?.endsWith('@vitbhopal.ac.in') && user.email !== 'dhagespandan@gmail.com') {
      await signOut(auth);
      throw new Error('Access restricted to @vitbhopal.ac.in domain.');
    }

    // Check if user exists in Firestore, if not create profile
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    const adminEmails = ['dhagespandan@gmail.com', 'dhage.25bce10259@vitbhopal.ac.in'];
    const isTargetAdmin = adminEmails.includes(user.email?.toLowerCase() || '');

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: isTargetAdmin ? 'admin' : 'student',
        createdAt: serverTimestamp()
      });
    } else if (isTargetAdmin && userDoc.data().role !== 'admin') {
      // Upgrade to admin if they are in the list but currently a student
      await setDoc(userDocRef, { role: 'admin' }, { merge: true });
    }
    
    return user;
  } catch (error: any) {
    // Suppress common popup-related errors from console if they are expected
    if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
      console.log('Sign-in cancelled by user');
    } else if (error.code === 'auth/popup-blocked') {
      console.error('Popup blocked by browser');
      throw new Error('Sign-in popup was blocked. Please allow popups for this site.');
    } else {
      console.error('Auth Error:', error);
      throw error;
    }
  } finally {
    isSigningIn = false;
  }
};

export const logout = () => signOut(auth);

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
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export type { User };
