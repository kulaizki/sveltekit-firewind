import { auth, firestore } from '$lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot, type DocumentSnapshot } from 'firebase/firestore';
import { readable } from 'svelte/store';
import { browser } from '$app/environment';

export interface FirekitUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  isLoading: boolean;
  customClaims?: Record<string, any>;
  firestoreData?: Record<string, any>;
}

const initialUserState: FirekitUser = {
  uid: '',
  email: null,
  emailVerified: false,
  displayName: null,
  photoURL: null,
  isAnonymous: false,
  isLoading: true,
  customClaims: {},
  firestoreData: {}
};

/**
 * Reactive store for the current Firebase user
 */
export const firekitUser = readable<FirekitUser>(initialUserState, (set) => {
  if (!browser) {
    return;
  }
  
  let userDocSnapshot: DocumentSnapshot | null = null;
  let userDocUnsubscribe: (() => void) | null = null;

  // Subscribe to authentication state changes
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      // Update with authenticated user data
      const basicUserData: FirekitUser = {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isAnonymous: user.isAnonymous,
        isLoading: false
      };
      
      set(basicUserData);
      
      // Clean up previous Firestore listener if it exists
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
      }
      
      // Listen for user document changes in Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      userDocUnsubscribe = onSnapshot(userDocRef, (snapshot) => {
        userDocSnapshot = snapshot;
        
        if (snapshot.exists()) {
          const firestoreData = snapshot.data();
          set({
            ...basicUserData,
            firestoreData
          });
        }
      });
      
    } else {
      // User is signed out
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
        userDocUnsubscribe = null;
      }
      
      set({
        ...initialUserState,
        isLoading: false
      });
    }
  });

  // Return cleanup function
  return () => {
    unsubscribe();
    if (userDocUnsubscribe) {
      userDocUnsubscribe();
    }
  };
}); 