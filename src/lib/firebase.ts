import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Ensure persistence is set to local
setPersistence(auth, browserLocalPersistence);

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

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

export type { User };
