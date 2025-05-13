import { storage } from '$lib/firebase';
import { ref, listAll, getDownloadURL, type StorageReference } from 'firebase/storage';
import { readable } from 'svelte/store';
import { browser } from '$app/environment';

export interface StorageItem {
  name: string;
  fullPath: string;
  ref: StorageReference;
  downloadURL?: string;
}

/**
 * Creates a readable store that lists files in a Firebase Storage directory
 * @param path Path to the directory in storage
 * @param options Additional options
 */
export function firekitStorageList(
  path: string,
  options: { includeDownloadURLs?: boolean } = {}
) {
  return readable<StorageItem[]>([], (set) => {
    if (!browser || !path) {
      return;
    }
    
    let canceled = false;
    
    // Function to list items
    const listItems = async () => {
      try {
        const { includeDownloadURLs = false } = options;
        const directoryRef = ref(storage, path);
        const listResult = await listAll(directoryRef);
        
        // Convert items to StorageItem format
        const items: StorageItem[] = listResult.items.map(itemRef => ({
          name: itemRef.name,
          fullPath: itemRef.fullPath,
          ref: itemRef
        }));
        
        // Fetch download URLs if requested
        if (includeDownloadURLs) {
          await Promise.all(
            items.map(async (item) => {
              try {
                item.downloadURL = await getDownloadURL(item.ref);
              } catch (error) {
                console.error(`Error getting download URL for ${item.fullPath}:`, error);
              }
            })
          );
        }
        
        if (!canceled) {
          set(items);
        }
      } catch (error) {
        console.error(`Error listing storage items in ${path}:`, error);
        if (!canceled) {
          set([]);
        }
      }
    };
    
    listItems();
    
    return () => {
      canceled = true;
    };
  });
}

/**
 * Lists files in a Firebase Storage directory (one-time fetch)
 * @param path Path to the directory in storage
 * @param includeDownloadURLs Whether to include download URLs
 */
export async function listStorageItems(
  path: string,
  includeDownloadURLs: boolean = false
): Promise<StorageItem[]> {
  try {
    if (!path) {
      return [];
    }
    
    const directoryRef = ref(storage, path);
    const listResult = await listAll(directoryRef);
    
    // Convert items to StorageItem format
    const items: StorageItem[] = listResult.items.map(itemRef => ({
      name: itemRef.name,
      fullPath: itemRef.fullPath,
      ref: itemRef
    }));
    
    // Fetch download URLs if requested
    if (includeDownloadURLs) {
      await Promise.all(
        items.map(async (item) => {
          try {
            item.downloadURL = await getDownloadURL(item.ref);
          } catch (error) {
            console.error(`Error getting download URL for ${item.fullPath}:`, error);
          }
        })
      );
    }
    
    return items;
  } catch (error) {
    console.error(`Error listing storage items in ${path}:`, error);
    return [];
  }
} 