import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import firebaseConfig from './config';
import { browser } from '$app/environment';

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;

/**
 * Initialize Firebase if it hasn't been initialized yet
 */
function initializeFirebase() {
  if (!browser) {
    return;
  }
  
  const apps = getApps();
  if (apps.length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = apps[0];
  }
  
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);
}

// Initialize Firebase on client side
if (browser) {
  initializeFirebase();
}

export { firebaseApp, auth, firestore, storage, initializeFirebase }; 