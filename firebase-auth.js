// firebase-auth.js - Firebase authentication service
(function(global) {
    'use strict';

    // Wait for Firebase to be initialized
    function waitForFirebase() {
        return new Promise((resolve) => {
            if (global.auth && global.db && global.firebaseAuth) {
                resolve();
            } else {
                setTimeout(() => waitForFirebase().then(resolve), 100);
            }
        });
    }

    class FirebaseAuthService {
        constructor() {
            this.auth = null;
            this.db = null;
            this.currentUser = null;
            this.authStateCallbacks = [];
            this.initialized = false;
            
            // Initialize Firebase connection
            this.initializeFirebase();
        }

        async initializeFirebase() {
            await waitForFirebase();
            
            this.auth = global.auth;
            this.db = global.db;
            this.initialized = true;
            
            // Set up auth state observer
            this.setupAuthObserver();
        }

        // Set up Firebase Auth state observer
        setupAuthObserver() {
            if (!this.auth || !global.firebaseAuth) {
                console.error('Firebase auth not initialized');
                return;
            }

            return global.firebaseAuth.onAuthStateChanged(this.auth, (user) => {
                this.currentUser = user;
                // Notify all callbacks about auth state changes
                this.authStateCallbacks.forEach(callback => callback(user));
            });
        }

        // Subscribe to auth state changes
        onAuthStateChanged(callback) {
            this.authStateCallbacks.push(callback);
            // Immediately call with current user if available
            if (this.currentUser !== null) {
                callback(this.currentUser);
            }
            // Return unsubscribe function
            return () => {
                const index = this.authStateCallbacks.indexOf(callback);
                if (index > -1) {
                    this.authStateCallbacks.splice(index, 1);
                }
            };
        }

        // Register user with email and password
        async registerUser(email, password, displayName) {
            if (!this.initialized) {
                await this.initializeFirebase();
            }

            try {
                const userCredential = await global.firebaseAuth.createUserWithEmailAndPassword(this.auth, email, password);
                const user = userCredential.user;
                
                // Update the user's display name
                await global.firebaseAuth.updateProfile(user, {
                    displayName: displayName || email.split('@')[0]
                });

                // Create user document in Firestore
                await this.createUserDocument(user);

                if (global.showToast) {
                    global.showToast('Account created successfully!', 'success');
                }
                
                return { 
                    success: true, 
                    user: {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName || email.split('@')[0],
                        createdAt: new Date().toISOString()
                    }
                };
            } catch (error) {
                console.error('Registration error:', error);
                let errorMessage = 'Registration failed';
                
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = 'Email address is already in use';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email address';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'Password is too weak';
                        break;
                    default:
                        errorMessage = error.message;
                }
                
                if (global.showToast) {
                    global.showToast(errorMessage, 'error');
                }
                return { success: false, error: errorMessage };
            }
        }

        // Login user with email and password
        async loginUser(email, password) {
            if (!this.initialized) {
                await this.initializeFirebase();
            }

            try {
                const userCredential = await global.firebaseAuth.signInWithEmailAndPassword(this.auth, email, password);
                const user = userCredential.user;
                
                // Update last login time
                await this.updateLastLogin(user.uid);
                
                if (global.showToast) {
                    global.showToast('Welcome back!', 'success');
                }
                
                return { 
                    success: true, 
                    user: {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName || email.split('@')[0],
                        lastLoginAt: new Date().toISOString()
                    }
                };
            } catch (error) {
                console.error('Login error:', error);
                let errorMessage = 'Login failed';
                
                switch (error.code) {
                    case 'auth/user-not-found':
                        errorMessage = 'No account found with this email';
                        break;
                    case 'auth/wrong-password':
                        errorMessage = 'Incorrect password';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email address';
                        break;
                    case 'auth/user-disabled':
                        errorMessage = 'Account has been disabled';
                        break;
                    default:
                        errorMessage = error.message;
                }
                
                if (global.showToast) {
                    global.showToast(errorMessage, 'error');
                }
                return { success: false, error: errorMessage };
            }
        }

        // Create user document in Firestore
        async createUserDocument(user) {
            try {
                const userDoc = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || user.email.split('@')[0],
                    photoURL: user.photoURL || null,
                    createdAt: global.firebaseFirestore.serverTimestamp(),
                    lastLoginAt: global.firebaseFirestore.serverTimestamp(),
                    preferences: {
                        ai: true,
                        notifications: true,
                        theme: 'auto'
                    }
                };
                
                const userRef = global.firebaseFirestore.doc(this.db, 'users', user.uid);
                await global.firebaseFirestore.setDoc(userRef, userDoc, { merge: true });
            } catch (error) {
                console.error('Error creating user document:', error);
            }
        }

        // Update last login time
        async updateLastLogin(userId) {
            try {
                const userRef = global.firebaseFirestore.doc(this.db, 'users', userId);
                await global.firebaseFirestore.updateDoc(userRef, {
                    lastLoginAt: global.firebaseFirestore.serverTimestamp()
                });
            } catch (error) {
                console.error('Error updating last login:', error);
            }
        }

        // Get current user
        getCurrentUser() {
            return this.currentUser;
        }

        // Check if user is logged in
        isLoggedIn() {
            return this.currentUser !== null;
        }

        // Add these methods to your FirebaseAuthService class in firebase-auth.js

// Get user preferences
async getUserPreferences() {
    try {
        if (!this.currentUser) {
            console.log('No current user for preferences');
            return { ai: true, notifications: true, theme: 'auto' };
        }
        
        const userRef = global.firebaseFirestore.doc(this.db, 'users', this.currentUser.uid);
        const userDoc = await global.firebaseFirestore.getDoc(userRef);
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            return userData.preferences || { ai: true, notifications: true, theme: 'auto' };
        }
        
        // Return default preferences if user document doesn't exist
        return { ai: true, notifications: true, theme: 'auto' };
    } catch (error) {
        console.error('Error getting user preferences:', error);
        return { ai: true, notifications: true, theme: 'auto' };
    }
}

// Update user preferences
async updateUserPreferences(preferences) {
    try {
        if (!this.currentUser) {
            console.error('No current user to update preferences');
            return false;
        }
        
        const userRef = global.firebaseFirestore.doc(this.db, 'users', this.currentUser.uid);
        await global.firebaseFirestore.updateDoc(userRef, {
            preferences: preferences,
            updatedAt: global.firebaseFirestore.serverTimestamp()
        });
        
        return true;
    } catch (error) {
        console.error('Error updating user preferences:', error);
        return false;
    }
}

        // Sign out
        async logout() {
            try {
                await global.firebaseAuth.signOut(this.auth);
                if (global.showToast) {
                    global.showToast('Logged out successfully', 'success');
                }
                return { success: true };
            } catch (error) {
                console.error('Logout error:', error);
                if (global.showToast) {
                    global.showToast('Logout failed', 'error');
                }
                return { success: false, error: error.message };
            }
        }
    }

    // Export to global scope
    global.FirebaseAuthService = FirebaseAuthService;

})(typeof window !== 'undefined' ? window : this);