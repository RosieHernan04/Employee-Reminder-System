// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3GixrKToHs6_rOn2nnYhz5Ucuq7SG1e4",
  authDomain: "task-reminder-system-236c0.firebaseapp.com",
  projectId: "task-reminder-system-236c0",
  storageBucket: "task-reminder-system-236c0.appspot.com",
  messagingSenderId: "326199277443",
  appId: "1:326199277443:web:af60e13429dcbfa876e8b6",
  measurementId: "G-N10VVMM67P",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
