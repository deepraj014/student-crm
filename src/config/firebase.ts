import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDvJViu5XTHb9eYWp4djMItZJ_J0QeAAU8",
  authDomain: "student-crm-system.firebaseapp.com",
  projectId: "student-crm-system",
  storageBucket: "student-crm-system.firebasestorage.app",
  messagingSenderId: "968515659274",
  appId: "1:968515659274:web:8e40c63ee3d63e06e7e1f3",
  measurementId: "G-72WND6SRSQ",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
