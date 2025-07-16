// firebase-config.js - Firebase configuration and initialization
(function(global) {
    'use strict';

    // Firebase configuration - Replace with your actual Firebase config
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT_ID.appspot.com",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };

    // Initialize Firebase
    let app;
    let auth;
    let db;

    function initializeFirebase() {
        try {
            // Initialize Firebase App
            app = firebase.initializeApp(firebaseConfig);
            
            // Initialize Firebase Auth
            auth = firebase.auth();
            
            // Initialize Firestore
            db = firebase.firestore();
            
            // Configure Firestore settings
            db.settings({
                timestampsInSnapshots: true
            });
            
            console.log('Firebase initialized successfully');
            return { app, auth, db };
        } catch (error) {
            console.error('Firebase initialization error:', error);
            throw error;
        }
    }

    // Initialize Firebase when the script loads
    const firebaseServices = initializeFirebase();

    // Export Firebase services to global scope
    global.firebaseApp = firebaseServices.app;
    global.firebaseAuth = firebaseServices.auth;
    global.firebaseDB = firebaseServices.db;
    
    // Export Firebase utilities
    global.firebase = firebase;
    global.firebaseConfig = firebaseConfig;

})(typeof window !== 'undefined' ? window : this);