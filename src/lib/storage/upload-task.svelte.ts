import { storage } from '$lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, type UploadTask, type UploadTaskSnapshot } from 'firebase/storage';
import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface UploadState {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
  state: 'running' | 'paused' | 'success' | 'error' | 'canceled';
  error: Error | null;
  snapshot: UploadTaskSnapshot | null;
  downloadURL: string | null;
}

export interface UploadTaskStore extends Writable<UploadState> {
  task: UploadTask | null;
  path: string;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
  getDownloadURL: () => Promise<string>;
}

/**
 * Creates a writable store that represents a Firebase Storage upload task
 * @param path Storage path where the file will be uploaded
 * @param file File to upload
 * @param metadata Optional file metadata
 */
export function firekitUploadTask(
  path: string,
  file?: File | Blob | Uint8Array | ArrayBuffer,
  metadata?: { contentType?: string; [key: string]: any }
): UploadTaskStore {
  if (!browser) {
    throw new Error('firekitUploadTask can only be used in browser environment');
  }
  
  // Create initial state
  const initialState: UploadState = {
    progress: 0,
    bytesTransferred: 0,
    totalBytes: 0,
    state: 'paused',
    error: null,
    snapshot: null,
    downloadURL: null
  };
  
  const { subscribe, set, update } = writable<UploadState>(initialState);
  
  let task: UploadTask | null = null;
  
  // Start upload if file is provided
  if (file) {
    const storageRef = ref(storage, path);
    task = uploadBytesResumable(storageRef, file, metadata);
    
    // Listen for state changes
    task.on(
      'state_changed',
      (snapshot) => {
        // Update progress
        const progress = snapshot.bytesTransferred / snapshot.totalBytes * 100;
        update(state => ({
          ...state,
          progress,
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          state: snapshot.state,
          snapshot
        }));
      },
      (error) => {
        // Handle error
        update(state => ({
          ...state,
          state: 'error',
          error
        }));
      }
    );
  }
  
  // Helper functions
  const pause = () => {
    if (task) {
      task.pause();
    }
  };
  
  const resume = () => {
    if (task) {
      task.resume();
    }
  };
  
  const cancel = () => {
    if (task) {
      task.cancel();
      update(state => ({ ...state, state: 'canceled' }));
    }
  };
  
  const getDownloadURLFn = async () => {
    if (!task) {
      throw new Error('No upload task available');
    }
    
    const snapshot = await task;
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    update(state => ({ ...state, downloadURL }));
    
    return downloadURL;
  };
  
  // Return the enhanced store
  return {
    subscribe,
    set,
    update,
    task,
    path,
    pause,
    resume,
    cancel,
    getDownloadURL: getDownloadURLFn
  };
}

/**
 * Simple helper function to upload a file and get its download URL
 * @param path Storage path
 * @param file File to upload
 * @param metadata Optional file metadata
 */
export async function uploadFile(
  path: string,
  file: File | Blob | Uint8Array | ArrayBuffer,
  metadata?: { contentType?: string; [key: string]: any }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file, metadata);
    
    task.on(
      'state_changed',
      () => {}, // Progress handler (empty)
      (error) => {
        // Error handler
        reject(error);
      },
      async () => {
        // Completion handler
        try {
          const downloadURL = await getDownloadURL(task.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
} 