import { firestore } from '$lib/firebase';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  type DocumentReference,
  type DocumentData
} from 'firebase/firestore';

export interface MutationResponse {
  success: boolean;
  error?: string;
  id?: string;
}

/**
 * Creates or overrides a document at the specified path
 * @param path Path to the document
 * @param data Data to set
 * @param options Additional options
 */
export async function createDoc(
  path: string, 
  data: DocumentData, 
  options: { merge?: boolean; timestamps?: boolean } = {}
): Promise<MutationResponse> {
  try {
    // Validate path
    if (!path) {
      throw new Error('Document path is required');
    }
    
    const { merge = true, timestamps = true } = options;
    const docRef = doc(firestore, path);
    
    // Add timestamps if requested
    const dataWithTimestamps = timestamps 
      ? { 
          ...data, 
          createdAt: data.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp() 
        }
      : data;
    
    await setDoc(docRef, dataWithTimestamps, { merge });
    
    return { 
      success: true,
      id: docRef.id
    };
  } catch (error: any) {
    console.error('Error creating document:', error);
    return { 
      success: false,
      error: error.message
    };
  }
}

/**
 * Updates fields in an existing document
 * @param path Path to the document
 * @param data Fields to update
 * @param addTimestamp Whether to add an updatedAt timestamp
 */
export async function updateDocument(
  path: string, 
  data: DocumentData, 
  addTimestamp: boolean = true
): Promise<MutationResponse> {
  try {
    // Validate path
    if (!path) {
      throw new Error('Document path is required');
    }
    
    const docRef = doc(firestore, path);
    
    // Add timestamp if requested
    const dataWithTimestamp = addTimestamp 
      ? { ...data, updatedAt: serverTimestamp() } 
      : data;
    
    await updateDoc(docRef, dataWithTimestamp);
    
    return { 
      success: true,
      id: docRef.id
    };
  } catch (error: any) {
    console.error('Error updating document:', error);
    return { 
      success: false,
      error: error.message
    };
  }
}

/**
 * Deletes a document at the specified path
 * @param path Path to the document
 */
export async function deleteDocument(path: string): Promise<MutationResponse> {
  try {
    // Validate path
    if (!path) {
      throw new Error('Document path is required');
    }
    
    const docRef = doc(firestore, path);
    await deleteDoc(docRef);
    
    return { 
      success: true,
      id: docRef.id
    };
  } catch (error: any) {
    console.error('Error deleting document:', error);
    return { 
      success: false,
      error: error.message
    };
  }
}

/**
 * Helper function to add server timestamp to an object
 * @param data The data object
 */
export function withTimestamps(data: DocumentData): DocumentData {
  return {
    ...data,
    createdAt: data.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp()
  };
} 