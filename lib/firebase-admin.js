import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // Use application default credentials
  });
}

const db = admin.firestore();

export { admin, db };
