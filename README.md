# SvelteKit Firebase Starter

A SvelteKit project template integrated with Firebase and styled with TailwindCSS.

## Features

- 🔥 Firebase Authentication (Email/Password, Google)
- 📊 Firestore Database with reactive stores
- 🗃️ Firebase Storage integration
- 🎨 TailwindCSS styling
- 📱 Responsive design
- 🔒 TypeScript support

## Getting Started

### Setting Up Firebase

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable the services you need (Authentication, Firestore, Storage)
3. Copy the `.env.example` file to `.env`
4. Replace the placeholder values in `.env` with your Firebase project credentials

```bash
# Firebase configuration
# Get these values from your Firebase project settings
PUBLIC_FIREBASE_API_KEY=your_api_key_here
PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your_project_id
PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
PUBLIC_FIREBASE_APP_ID=your_app_id
PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Installation

Once you've cloned this project and set up your Firebase configuration, install dependencies with your package manager:

```bash
npm install
# or
pnpm install
# or
yarn install
```

## Development

Start a development server:

```bash
npm run dev
# or
npm run dev -- --open
```

## Building

Create a production version of your app:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Firebase Utilities

This template provides a set of utilities to interact with Firebase services:

### Authentication
```typescript
// Import auth utilities
import { firekitAuth, firekitUser } from '$lib';

// Sign in with email/password
await firekitAuth.signInWithEmail(email, password);

// Sign in with Google
await firekitAuth.signInWithGoogle();

// Register a new user
await firekitAuth.registerWithEmail(email, password, displayName);

// Sign out
await firekitAuth.logOut();

// Access the current user
$: user = $firekitUser;
```

### Firestore
```typescript
// Import Firestore utilities
import { firekitDoc, firekitCollection, createDoc } from '$lib';

// Get a reactive document
const document = firekitDoc('collection/documentId');

// Get a reactive collection
const collection = firekitCollection('collection');

// Create a document
await createDoc('collection/documentId', { field: 'value' });
```

### Storage
```typescript
// Import Storage utilities
import { uploadFile, firekitDownloadURL } from '$lib';

// Upload a file
const downloadURL = await uploadFile('path/to/file.jpg', file);

// Get a reactive download URL
const fileURL = firekitDownloadURL('path/to/file.jpg');
```
