import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: Replace with your Firebase configuration
const firebaseConfig = {
 apiKey: "AIzaSyDZD8x9hTFx0x1VJEBfkLXEdVkbYHarzXs",
  authDomain: "griva-insurance.firebaseapp.com",
  projectId: "griva-insurance",
  storageBucket: "griva-insurance.firebasestorage.app",
  messagingSenderId: "1004273667785",
  appId: "1:1004273667785:web:b6ff619d8975dc1ca60718",
  measurementId: "G-QP47VJL3Y7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
