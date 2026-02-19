// ════════════════════════════════════════════
// FIREBASE CONFIGURATION
// ════════════════════════════════════════════

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
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();
export const firebaseApp = firebase; // Export the namespace if needed for FieldValue
