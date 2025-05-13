import { storage } from '$lib/firebase';
import { ref, getDownloadURL as getFirebaseDownloadURL } from 'firebase/storage';
import { readable } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Creates a readable store that provides a download URL for a file in Firebase Storage
 * @param path Path to the file in storage
 */
export function firekitDownloadURL(path: string) {
  return readable<string | null>(null, (set) => {
    if (!browser || !path) {
      return;
    }
    
    let canceled = false;
    
    // Fetch the download URL
    const fetchURL = async () => {
      try {
        const storageRef = ref(storage, path);
        const url = await getFirebaseDownloadURL(storageRef);
        
        if (!canceled) {
          set(url);
        }
      } catch (error) {
        console.error(`Error getting download URL for ${path}:`, error);
        if (!canceled) {
          set(null);
        }
      }
    };
    
    fetchURL();
    
    return () => {
      canceled = true;
    };
  });
}

/**
 * Gets a download URL for a file in Firebase Storage (one-time fetch)
 * @param path Path to the file in storage
 */
export async function getDownloadURL(path: string): Promise<string | null> {
  try {
    if (!path) {
      return null;
    }
    
    const storageRef = ref(storage, path);
    return await getFirebaseDownloadURL(storageRef);
  } catch (error) {
    console.error(`Error getting download URL for ${path}:`, error);
    return null;
  }
} 