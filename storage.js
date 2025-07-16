(function(global) {
    'use strict';

    // Load CryptoJS from CDN if not already loaded
    if (typeof CryptoJS === 'undefined') {
        throw new Error('CryptoJS library not loaded. Please include crypto-js in your HTML.');
    }

    class SecureStorageService {
        constructor(encryptionKey = null) {
            this.encryptionKey = encryptionKey || this.generateEncryptionKey();
            this.storagePrefix = 'mood_journal_';
            this.userStorageKey = this.storagePrefix + 'users';
            this.dataStorageKey = this.storagePrefix + 'data_';
        }

        // Generate a secure encryption key
        generateEncryptionKey() {
            // Use a combination of timestamp and random values
            const timestamp = Date.now().toString();
            const random = Math.random().toString(36).substr(2, 15);
            return CryptoJS.SHA256(timestamp + random).toString();
        }

        // Encrypt data using AES
        encryptData(data, key = null) {
            try {
                const keyToUse = key || this.encryptionKey;
                const dataString = JSON.stringify(data);
                const encrypted = CryptoJS.AES.encrypt(dataString, keyToUse).toString();
                return encrypted;
            } catch (error) {
                console.error('Encryption error:', error);
                throw new Error('Failed to encrypt data');
            }
        }

        // Decrypt data using AES
        decryptData(encryptedData, key = null) {
            try {
                const keyToUse = key || this.encryptionKey;
                const decrypted = CryptoJS.AES.decrypt(encryptedData, keyToUse);
                const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
                
                if (!decryptedString) {
                    throw new Error('Failed to decrypt data - invalid key or corrupted data');
                }
                
                return JSON.parse(decryptedString);
            } catch (error) {
                console.error('Decryption error:', error);
                throw new Error('Failed to decrypt data');
            }
        }

        // Save data to localStorage with encryption
        saveToLocalStorage(key, data) {
            try {
                const encryptedData = this.encryptData(data);
                localStorage.setItem(key, encryptedData);
                return true;
            } catch (error) {
                console.error('Save to localStorage error:', error);
                return false;
            }
        }

        // Load data from localStorage with decryption
        loadFromLocalStorage(key) {
            try {
                const encryptedData = localStorage.getItem(key);
                if (!encryptedData) {
                    return null;
                }
                return this.decryptData(encryptedData);
            } catch (error) {
                console.error('Load from localStorage error:', error);
                return null;
            }
        }

        // Save user data
        async saveUser(user) {
            try {
                const users = await this.getUsers();
                const existingIndex = users.findIndex(u => u.id === user.id);
                
                if (existingIndex >= 0) {
                    users[existingIndex] = user;
                } else {
                    users.push(user);
                }
                
                return this.saveToLocalStorage(this.userStorageKey, users);
            } catch (error) {
                console.error('Save user error:', error);
                return false;
            }
        }

        // Get all users
        async getUsers() {
            try {
                const users = this.loadFromLocalStorage(this.userStorageKey);
                return users || [];
            } catch (error) {
                console.error('Get users error:', error);
                return [];
            }
        }

        // Save journal entries for a user
        async saveUserEntries(userId, entries) {
            try {
                const storageKey = this.dataStorageKey + userId;
                return this.saveToLocalStorage(storageKey, entries);
            } catch (error) {
                console.error('Save entries error:', error);
                return false;
            }
        }

        // Get journal entries for a user
        async getUserEntries(userId) {
            try {
                const storageKey = this.dataStorageKey + userId;
                const entries = this.loadFromLocalStorage(storageKey);
                return entries || [];
            } catch (error) {
                console.error('Get entries error:', error);
                return [];
            }
        }

        // Delete user data
        async deleteUser(userId) {
            try {
                // Remove user from users list
                const users = await this.getUsers();
                const filteredUsers = users.filter(u => u.id !== userId);
                this.saveToLocalStorage(this.userStorageKey, filteredUsers);
                
                // Remove user's journal entries
                const entriesKey = this.dataStorageKey + userId;
                localStorage.removeItem(entriesKey);
                
                return true;
            } catch (error) {
                console.error('Delete user error:', error);
                return false;
            }
        }

        // Clear all data (for testing/reset purposes)
        clearAllData() {
            try {
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith(this.storagePrefix)) {
                        localStorage.removeItem(key);
                    }
                });
                return true;
            } catch (error) {
                console.error('Clear all data error:', error);
                return false;
            }
        }

        // Export encrypted data (for backup)
        async exportUserData(userId) {
            try {
                const userData = {
                    user: await this.getUsers().then(users => users.find(u => u.id === userId)),
                    entries: await this.getUserEntries(userId)
                };
                
                return this.encryptData(userData);
            } catch (error) {
                console.error('Export data error:', error);
                return null;
            }
        }

        // Import encrypted data (for restore)
        async importUserData(encryptedData) {
            try {
                const userData = this.decryptData(encryptedData);
                
                if (userData.user) {
                    await this.saveUser(userData.user);
                }
                
                if (userData.entries) {
                    await this.saveUserEntries(userData.user.id, userData.entries);
                }
                
                return true;
            } catch (error) {
                console.error('Import data error:', error);
                return false;
            }
        }

        // Get storage stats
        getStorageStats() {
            try {
                const stats = {
                    totalKeys: 0,
                    totalSize: 0,
                    userCount: 0
                };

                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith(this.storagePrefix)) {
                        stats.totalKeys++;
                        stats.totalSize += localStorage.getItem(key).length;
                        
                        if (key === this.userStorageKey) {
                            const users = this.loadFromLocalStorage(key);
                            stats.userCount = users ? users.length : 0;
                        }
                    }
                });

                return stats;
            } catch (error) {
                console.error('Get storage stats error:', error);
                return null;
            }
        }
    }

    // Export to global namespace
    global.SecureStorageService = SecureStorageService;

})(typeof window !== 'undefined' ? window : this);