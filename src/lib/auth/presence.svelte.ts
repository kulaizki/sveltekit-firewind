import { auth, firestore } from '$lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { browser } from '$app/environment';
import { derived } from 'svelte/store';
import { firekitUser } from './user.svelte';
import { ref, onDisconnect } from 'firebase/database';

/**
 * Tracks user online presence in Firestore
 * Derived store that updates presence status whenever the user auth state changes
 */
export const firekitPresence = derived(firekitUser, ($user, set) => {
  if (!browser || !$user.uid) {
    return;
  }
  
  // References to presence documents
  const userStatusRef = doc(firestore, 'status', $user.uid);
  const userRef = doc(firestore, 'users', $user.uid);
  
  // Update presence status to online
  const updateOnlineStatus = async () => {
    const statusData = {
      state: 'online',
      lastChanged: serverTimestamp()
    };
    
    try {
      // Update status document
      await setDoc(userStatusRef, statusData, { merge: true });
      
      // Update user document with online status
      await setDoc(userRef, { online: true, lastActive: serverTimestamp() }, { merge: true });
      
      // Note: Proper disconnect handling would require Firebase Realtime Database
      // Firestore doesn't have a direct onDisconnect method
      
      set(true);
    } catch (error) {
      console.error('Error updating presence status:', error);
      set(false);
    }
  };
  
  // Update presence when connection state or user changes
  if ($user.uid) {
    updateOnlineStatus();
  }
  
  return () => {
    // Cleanup function - nothing needed here
  };
}, false);

// Initialize presence tracking
if (browser) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is signed in, establish presence
      const userStatusRef = doc(firestore, 'status', user.uid);
      const userRef = doc(firestore, 'users', user.uid);
      
      try {
        // Set online status
        await setDoc(userStatusRef, {
          state: 'online',
          lastChanged: serverTimestamp()
        }, { merge: true });
        
        // Update user document
        await setDoc(userRef, { 
          online: true,
          lastActive: serverTimestamp() 
        }, { merge: true });
        
        // Note: For proper offline detection, you would need to use 
        // Firebase Realtime Database which has onDisconnect functionality
      } catch (error) {
        console.error('Error initializing presence:', error);
      }
    }
  });
}

// Helper to get presence status for a specific user
export async function getUserPresence(uid: string): Promise<'online' | 'offline' | 'unknown'> {
  try {
    const statusRef = doc(firestore, 'status', uid);
    const statusDoc = await getDoc(statusRef);
    
    if (statusDoc.exists()) {
      return statusDoc.data().state || 'unknown';
    } else {
      return 'unknown';
    }
  } catch (error) {
    console.error('Error getting user presence:', error);
    return 'unknown';
  }
} 