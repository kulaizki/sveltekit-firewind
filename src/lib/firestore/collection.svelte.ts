import { firestore } from '$lib/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  type Query, 
  type CollectionReference, 
  type DocumentData,
  type QueryConstraint,
  type DocumentSnapshot,
  getDocs
} from 'firebase/firestore';
import { readable, type Readable } from 'svelte/store';
import { browser } from '$app/environment';

export interface CollectionStore<T = DocumentData> extends Readable<T[]> {
  ref: CollectionReference<T>;
  query: Query<T>;
}

/**
 * Creates a readable store that represents a Firestore collection
 * @param path Path to the collection
 * @param queryConstraints Optional query constraints (where, orderBy, limit, etc.)
 */
export function firekitCollection<T = DocumentData>(
  path: string,
  ...queryConstraints: QueryConstraint[]
): CollectionStore<T> {
  if (!path) {
    throw new Error('Path is required for firekitCollection');
  }

  const pathParts = path.split('/').filter(Boolean);
  if (pathParts.length % 2 !== 0) {
    throw new Error(`Invalid collection path: ${path}. Collection path must have an even number of segments.`);
  }

  const collectionRef = collection(firestore, path) as CollectionReference<T>;
  const queryRef = queryConstraints.length > 0 
    ? query(collectionRef, ...queryConstraints) as Query<T>
    : query(collectionRef) as Query<T>;
  
  const store = readable<T[]>([], (set) => {
    if (!browser) {
      return;
    }
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      queryRef,
      (snapshot) => {
        const data: T[] = [];
        snapshot.forEach((doc: DocumentSnapshot<T>) => {
          if (doc.exists()) {
            data.push({
              ...doc.data(),
              id: doc.id
            } as T);
          }
        });
        set(data);
      },
      (error) => {
        console.error(`Error in firekitCollection(${path}):`, error);
        set([]);
      }
    );
    
    return unsubscribe;
  });
  
  // Add extra properties
  return {
    ...store,
    ref: collectionRef,
    query: queryRef
  };
}

/**
 * Fetches a collection once without subscribing to real-time updates
 * @param path Path to the collection
 * @param queryConstraints Optional query constraints
 */
export async function fetchCollection<T = DocumentData>(
  path: string,
  ...queryConstraints: QueryConstraint[]
): Promise<T[]> {
  try {
    const collectionRef = collection(firestore, path) as CollectionReference<T>;
    const queryRef = queryConstraints.length > 0 
      ? query(collectionRef, ...queryConstraints) as Query<T>
      : query(collectionRef) as Query<T>;
    
    const snapshot = await getDocs(queryRef);
    const data: T[] = [];
    
    snapshot.forEach((doc: DocumentSnapshot<T>) => {
      if (doc.exists()) {
        data.push({
          ...doc.data(),
          id: doc.id
        } as T);
      }
    });
    
    return data;
  } catch (error) {
    console.error(`Error in fetchCollection(${path}):`, error);
    return [];
  }
} 