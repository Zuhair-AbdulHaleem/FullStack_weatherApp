import { initializeApp, getApps, cert } from 'firebase-admin/app';

export function initAdmin() {
  if (!getApps().length) {
    try {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

      if (!privateKey || !clientEmail || !projectId) {
        throw new Error(
          'Missing Firebase Admin credentials. Check your .env.local file.'
        );
      }

      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });

      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Firebase admin initialization error:', error);
      throw error;
    }
  }
} 