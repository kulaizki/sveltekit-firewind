import { firestore } from '$lib/firebase';
import { doc, onSnapshot, getDoc, type DocumentReference, type DocumentData } from 'firebase/firestore';
import { readable, type Readable } from 'svelte/store';
import { browser } from '$app/environment';

export interface DocStore<T = DocumentData> extends Readable<T | null> {
  ref: DocumentReference<T>;
  id: string;
}

/**
 * Creates a readable store that represents a Firestore document
 * @param path Path to the document (collection/document)
 * @param startWith Initial data before loading
 */
export function firekitDoc<T = DocumentData>(
  path: string,
  startWith: T | null = null
): DocStore<T> {
  if (!path) {
    throw new Error('Path is required for firekitDoc');
  }

  const pathParts = path.split('/').filter(Boolean);
  if (pathParts.length % 2 === 0) {
    throw new Error(`Invalid document path: ${path}. Document path must have an odd number of segments.`);
  }

  const docRef = doc(firestore, path) as DocumentReference<T>;
  
  const store = readable<T | null>(startWith, (set) => {
    if (!browser) {
      return;
    }
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          set(snapshot.data() as T);
        } else {
          set(null);
        }
      },
      (error) => {
        console.error(`Error in firekitDoc(${path}):`, error);
        set(null);
      }
    );
    
    return unsubscribe;
  });
  
  // Add extra properties
  return {
    ...store,
    ref: docRef,
    id: docRef.id
  };
}

/**
 * Fetches a document once without subscribing to real-time updates
 * @param path Path to the document
 */
export async function fetchDoc<T = DocumentData>(path: string): Promise<T | null> {
  try {
    const docRef = doc(firestore, path) as DocumentReference<T>;
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      return snapshot.data() as T;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error in fetchDoc(${path}):`, error);
    return null;
  }
} 