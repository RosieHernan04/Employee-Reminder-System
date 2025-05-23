import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3GixrKToHs6_rOn2nnYhz5Ucuq7SG1e4",
  authDomain: "task-reminder-system-236c0.firebaseapp.com",
  projectId: "task-reminder-system-236c0",
  storageBucket: "task-reminder-system-236c0.appspot.com",
  messagingSenderId: "326199277443",
  appId: "1:326199277443:web:af60e13429dcbfa876e8b6",
  measurementId: "G-N10VVMM67P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

export { db, auth }; 