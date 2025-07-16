
// auth.js - Authentication service with secure password hashing
(function(global) {
    'use strict';

    // Load bcrypt from CDN if not already loaded
    if (typeof dcodeIO === 'undefined' || !dcodeIO.bcrypt) {
        // This will be loaded via CDN in index.html
        throw new Error('bcrypt library not loaded. Please include bcrypt.js in your HTML.');
    }

    const bcrypt = dcodeIO.bcrypt;

    class AuthService {
        constructor(storageService) {
            this.storageService = storageService;
            this.currentUser = null;
        }

        // Generate a secure salt and hash the password
        async hashPassword(password) {
            return new Promise((resolve, reject) => {
                bcrypt.genSalt(12, (err, salt) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    bcrypt.hash(password, salt, (err, hash) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(hash);
                    });
                });
            });
        }

        // Verify password against hash
        async verifyPassword(password, hash) {
            return new Promise((resolve, reject) => {
                bcrypt.compare(password, hash, (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result);
                });
            });
        }

        // Check if username exists
        async userExists(username) {
            try {
                const users = await this.storageService.getUsers();
                return users.some(user => user.username === username.toLowerCase());
            } catch (error) {
                console.error('Error checking user existence:', error);
                return false;
            }
        }

        // Get user by username
        async getUserByUsername(username) {
            try {
                const users = await this.storageService.getUsers();
                return users.find(user => user.username === username.toLowerCase());
            } catch (error) {
                console.error('Error getting user:', error);
                return null;
            }
        }

        // Register new user
        async registerUser(username, password, displayName) {
            try {
                // Check if user already exists
                if (await this.userExists(username)) {
                    throw new Error('Username already exists');
                }

                // Hash password
                const hashedPassword = await this.hashPassword(password);

                // Create user object
                const user = {
                    id: this.generateUserId(),
                    username: username.toLowerCase(),
                    displayName: displayName || username,
                    hashedPassword: hashedPassword,
                    createdAt: new Date().toISOString(),
                    lastLoginAt: null
                };

                // Save user
                await this.storageService.saveUser(user);

                // Set current user (without password)
                this.currentUser = {
                    id: user.id,
                    username: user.username,
                    displayName: user.displayName,
                    createdAt: user.createdAt
                };

                return { success: true, user: this.currentUser };
            } catch (error) {
                console.error('Registration error:', error);
                return { success: false, error: error.message };
            }
        }

        // Login user
        async loginUser(username, password) {
            try {
                const user = await this.getUserByUsername(username);
                if (!user) {
                    throw new Error('User not found');
                }

                const isValid = await this.verifyPassword(password, user.hashedPassword);
                if (!isValid) {
                    throw new Error('Invalid password');
                }

                // Update last login
                user.lastLoginAt = new Date().toISOString();
                await this.storageService.saveUser(user);

                // Set current user (without password)
                this.currentUser = {
                    id: user.id,
                    username: user.username,
                    displayName: user.displayName,
                    createdAt: user.createdAt,
                    lastLoginAt: user.lastLoginAt
                };

                return { success: true, user: this.currentUser };
            } catch (error) {
                console.error('Login error:', error);
                return { success: false, error: error.message };
            }
        }

        // Logout user
        logout() {
            this.currentUser = null;
        }

        // Check if user is logged in
        isLoggedIn() {
            return this.currentUser !== null;
        }

        // Get current user
        getCurrentUser() {
            return this.currentUser;
        }

        // Generate unique user ID
        generateUserId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
        }
    }

    // Export to global namespace
    global.AuthService = AuthService;

})(typeof window !== 'undefined' ? window : this);
