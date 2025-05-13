// place files you want to import through the `$lib` alias in this folder.

// Re-export Firebase initialization
export * from './firebase';

// Re-export configuration
export * from './config';

// Re-export auth modules
export { firekitAuth } from './auth/auth';
export { firekitUser } from './auth/user.svelte';
export { firekitPresence, getUserPresence } from './auth/presence.svelte';

// Re-export Firestore modules
export { firekitDoc, fetchDoc } from './firestore/doc.svelte';
export { firekitCollection, fetchCollection } from './firestore/collection.svelte';
export { createDoc, updateDocument, deleteDocument, withTimestamps } from './firestore/document-mutations.svelte';

// Re-export Storage modules
export { firekitUploadTask, uploadFile } from './storage/upload-task.svelte';
export { firekitDownloadURL, getDownloadURL } from './storage/download-url.svelte';
export { firekitStorageList, listStorageItems } from './storage/storage-list.svelte';
