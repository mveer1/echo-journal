// firebase-init.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { 
  getAuth, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  deleteDoc,       
  addDoc,           
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  orderBy
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDojKZlkGI6-VqOLFJGYEcmKUx7ztYFaa0",
  authDomain: "echo-app-a2027.firebaseapp.com",
  projectId: "echo-app-a2027",
  storageBucket: "echo-app-a2027.firebasestorage.app",
  messagingSenderId: "638785612372",
  appId: "1:638785612372:web:205016cfe366430b1adbc1",
  measurementId: "G-LRTWNMD72Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export to global scope for non-module scripts
window.auth = auth;
window.db = db;

// Export Firebase functions to global scope
window.firebaseAuth = {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
};

window.firebaseFirestore = {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  orderBy
};

console.log('Firebase initialized successfully');