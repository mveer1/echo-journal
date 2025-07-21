// firebase-storage.js - Firestore storage service for journal entries
(function(global) {
    'use strict';

    function waitForFirebase() {
        return new Promise((resolve) => {
            if (global.auth && global.db && global.firebaseFirestore) {
                resolve();
            } else {
                setTimeout(() => waitForFirebase().then(resolve), 100);
            }
        });
    }
    class FirebaseStorageService {
        constructor() {
            this.db = null;
            this.initialized = false;
            
            // Initialize Firebase connection
            this.initializeFirebase();
        }

        async initializeFirebase() {
            await waitForFirebase();
            
            this.db = global.db;
            this.initialized = true;
        }
        
        async getUserEntries(userId) {
            try {
                if (!this.initialized) {
                    await this.initializeFirebase();
                }

                if (!userId) {
                    console.error('No user ID provided');
                    return [];
                }

                // Create query for user's entries
                const entriesRef = global.firebaseFirestore.collection(this.db, 'journal_entries');
                const q = global.firebaseFirestore.query(
                    entriesRef,
                    global.firebaseFirestore.where('userId', '==', userId)
                );

                const querySnapshot = await global.firebaseFirestore.getDocs(q);
                const entries = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    entries.push({
                        id: doc.id,
                        ...data,
                        // Convert Firestore timestamps to JavaScript dates
                        createdAt: data.createdAt?.toDate?.() || new Date(data.date),
                        updatedAt: data.updatedAt?.toDate?.() || new Date(data.date)
                    });
                });

                // Sort entries by date (newest first)
                entries.sort((a, b) => new Date(b.date) - new Date(a.date));

                return entries;
            } catch (error) {
                console.error('Error getting user entries:', error);
                return [];
            }
        }

        // Save a new journal entry
async saveEntry(userId, entry) {
    try {
        if (!this.initialized) {
            await this.initializeFirebase();
        }

        if (!userId) {
            console.error('No user ID provided');
            return { success: false, error: 'No user ID provided' };
        }

        // Validate and clean the entry data
        const cleanEntry = {
            userId: userId,
            date: entry.date || new Date().toISOString().split('T')[0],
            mood: entry.mood || 'neutral',
            moodName: entry.moodName || 'neutral',
            moodValue: entry.moodValue !== undefined ? entry.moodValue : null,
            responses: entry.responses || {},
            aiInsights: entry.aiInsights || null,
            createdAt: global.firebaseFirestore.serverTimestamp(),
            updatedAt: global.firebaseFirestore.serverTimestamp()
        };

        // Remove any remaining undefined values
        Object.keys(cleanEntry).forEach(key => {
            if (cleanEntry[key] === undefined) {
                cleanEntry[key] = null;
            }
        });

        console.log('Saving entry:', cleanEntry); // Debug log

        // Add entry to Firestore
        const entriesRef = global.firebaseFirestore.collection(this.db, 'journal_entries');
        const docRef = await global.firebaseFirestore.addDoc(entriesRef, cleanEntry);

        return { 
            success: true, 
            id: docRef.id,
            entry: { ...cleanEntry, id: docRef.id }
        };
    } catch (error) {
        console.error('Error saving entry:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

        async updateEntry(userId, entryId, updates) {
            try {
                if (!this.initialized) {
                    await this.initializeFirebase();
                }

                if (!userId || !entryId) {
                    console.error('Missing user ID or entry ID');
                    return { success: false, error: 'Missing required parameters' };
                }

                // Prepare update data
                const updateData = {
                    ...updates,
                    updatedAt: global.firebaseFirestore.serverTimestamp()
                };

                // Update entry in Firestore
                const entryRef = global.firebaseFirestore.doc(this.db, 'journal_entries', entryId);
                await global.firebaseFirestore.updateDoc(entryRef, updateData);

                return { success: true };
            } catch (error) {
                console.error('Error updating entry:', error);
                return { 
                    success: false, 
                    error: error.message 
                };
            }
        }

        // Delete a journal entry
        async deleteEntry(userId, entryId) {
            try {
                if (!this.initialized) {
                    await this.initializeFirebase();
                }

                if (!userId || !entryId) {
                    console.error('Missing user ID or entry ID');
                    return { success: false, error: 'Missing required parameters' };
                }

                // Delete entry from Firestore
                const entryRef = global.firebaseFirestore.doc(this.db, 'journal_entries', entryId);
                await global.firebaseFirestore.deleteDoc(entryRef);

                return { success: true };
            } catch (error) {
                console.error('Error deleting entry:', error);
                return { 
                    success: false, 
                    error: error.message 
                };
            }
        }

        // // Get all entries for a user
        // async getUserEntries(userId, limit = 50) {
        //     try {
        //         const snapshot = await this.db.collection(this.entriesCollection)
        //             .where('userId', '==', userId)
        //             .orderBy('createdAt', 'desc')
        //             .limit(limit)
        //             .get();

        //         const entries = [];
        //         snapshot.forEach(doc => {
        //             const data = doc.data();
        //             entries.push({
        //                 id: doc.id,
        //                 date: data.date,
        //                 mood: data.mood,
        //                 moodName: data.moodName,
        //                 moodValue: data.moodValue,
        //                 responses: data.responses || {},
        //                 aiInsights: data.aiInsights || null,
        //                 createdAt: data.createdAt?.toDate?.() || new Date(),
        //                 updatedAt: data.updatedAt?.toDate?.() || new Date()
        //             });
        //         });

        //         return entries;
        //     } catch (error) {
        //         console.error('Error getting user entries:', error);
        //         return [];
        //     }
        // }

        // Get entries for a specific date range
        async getEntriesInDateRange(userId, startDate, endDate) {
            try {
                const snapshot = await this.db.collection(this.entriesCollection)
                    .where('userId', '==', userId)
                    .where('date', '>=', startDate)
                    .where('date', '<=', endDate)
                    .orderBy('date', 'desc')
                    .get();

                const entries = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    entries.push({
                        id: doc.id,
                        date: data.date,
                        mood: data.mood,
                        moodName: data.moodName,
                        moodValue: data.moodValue,
                        responses: data.responses || {},
                        aiInsights: data.aiInsights || null,
                        createdAt: data.createdAt?.toDate?.() || new Date(),
                        updatedAt: data.updatedAt?.toDate?.() || new Date()
                    });
                });

                return entries;
            } catch (error) {
                console.error('Error getting entries in date range:', error);
                return [];
            }
        }

        // Get weekly mood summary for analytics
        async getWeeklyMoodSummary(userId) {
            try {
                if (!this.initialized) {
                    await this.initializeFirebase();
                }

                if (!userId) {
                    console.error('No user ID provided');
                    return null;
                }

                // Calculate date range for the past week
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(endDate.getDate() - 7);

                // Create query for user's recent entries
                const entriesRef = global.firebaseFirestore.collection(this.db, 'journal_entries');
                const q = global.firebaseFirestore.query(
                    entriesRef,
                    global.firebaseFirestore.where('userId', '==', userId),
                    global.firebaseFirestore.where('date', '>=', startDate.toISOString().split('T')[0]),
                    global.firebaseFirestore.where('date', '<=', endDate.toISOString().split('T')[0])
                );

                const querySnapshot = await global.firebaseFirestore.getDocs(q);
                const entries = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    entries.push({
                        id: doc.id,
                        ...data
                    });
                });

                // Calculate mood summary
                const moodCounts = {};
                entries.forEach(entry => {
                    const mood = entry.moodName || entry.mood;
                    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
                });

                // Find dominant mood
                const dominantMood = Object.keys(moodCounts).reduce((a, b) => 
                    moodCounts[a] > moodCounts[b] ? a : b
                ) || 'none';

                return {
                    totalEntries: entries.length,
                    moodCounts: moodCounts,
                    dominantMood: dominantMood,
                    moodTrends: entries.map(entry => ({
                        date: entry.date,
                        mood: entry.moodName || entry.mood,
                        moodValue: entry.moodValue
                    }))
                };
            } catch (error) {
                console.error('Error getting weekly mood summary:', error);
                return null;
            }
        }
        // Get mood patterns and insights
        async getMoodPatterns(userId, days = 30) {
            try {
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - days);

                const endDateStr = endDate.toISOString().split('T')[0];
                const startDateStr = startDate.toISOString().split('T')[0];

                const entries = await this.getEntriesInDateRange(userId, startDateStr, endDateStr);
                
                if (entries.length === 0) {
                    return {
                        patterns: [],
                        insights: ['Start journaling to see your mood patterns!'],
                        averageMood: 'neutral',
                        consistencyScore: 0
                    };
                }

                // Analyze patterns
                const patterns = this.analyzeMoodPatterns(entries);
                const insights = this.generateInsights(entries, patterns);
                const averageMood = this.calculateAverageMood(entries);
                const consistencyScore = this.calculateConsistencyScore(entries, days);

                return {
                    patterns: patterns,
                    insights: insights,
                    averageMood: averageMood,
                    consistencyScore: consistencyScore
                };
            } catch (error) {
                console.error('Error getting mood patterns:', error);
                return {
                    patterns: [],
                    insights: ['Unable to analyze patterns at this time'],
                    averageMood: 'neutral',
                    consistencyScore: 0
                };
            }
        }

        // Helper: Convert mood name to value for consistent querying
        getMoodValue(moodName) {
            const moodMap = {
                'Happy': 'happy',
                'Neutral': 'neutral',
                'Sad': 'sad',
                'Angry': 'angry',
                'Tired': 'tired',
                'Anxious': 'anxious',
                'Stressed': 'stressed',
                'Excited': 'excited'
            };
            return moodMap[moodName] || moodName?.toLowerCase() || 'neutral';
        }

        // Helper: Analyze mood patterns
        analyzeMoodPatterns(entries) {
            const patterns = [];
            
            // Group entries by day of week
            const dayGroups = {};
            entries.forEach(entry => {
                const date = new Date(entry.date);
                const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
                if (!dayGroups[dayOfWeek]) dayGroups[dayOfWeek] = [];
                dayGroups[dayOfWeek].push(entry);
            });

            // Analyze day-of-week patterns
            Object.keys(dayGroups).forEach(day => {
                const dayEntries = dayGroups[day];
                const moodCounts = {};
                
                dayEntries.forEach(entry => {
                    const mood = entry.moodValue || 'neutral';
                    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
                });
                
                const dominantMood = Object.keys(moodCounts).reduce((a, b) => 
                    moodCounts[a] > moodCounts[b] ? a : b, 'neutral');
                
                patterns.push({
                    type: 'day-of-week',
                    day: day,
                    dominantMood: dominantMood,
                    count: dayEntries.length
                });
            });

            return patterns;
        }

        // Helper: Generate insights based on patterns
        generateInsights(entries, patterns) {
            const insights = [];
            
            if (entries.length >= 7) {
                insights.push(`You've been consistently journaling! ${entries.length} entries in the past period.`);
            }
            
            // Day-of-week insights
            const dayPatterns = patterns.filter(p => p.type === 'day-of-week');
            if (dayPatterns.length > 0) {
                const bestDay = dayPatterns.reduce((best, current) => 
                    current.dominantMood === 'happy' && current.count > (best.count || 0) ? current : best, {});
                
                if (bestDay.day) {
                    insights.push(`You tend to feel happiest on ${bestDay.day}s.`);
                }
            }
            
            // Mood variety insight
            const uniqueMoods = [...new Set(entries.map(e => e.moodValue || 'neutral'))];
            if (uniqueMoods.length >= 4) {
                insights.push('You experience a good variety of emotions - this is completely normal!');
            }
            
            if (insights.length === 0) {
                insights.push('Keep journaling to discover your mood patterns!');
            }
            
            return insights;
        }

        // Helper: Calculate average mood
        calculateAverageMood(entries) {
            const moodValues = {
                'happy': 5,
                'excited': 4,
                'neutral': 3,
                'tired': 2,
                'sad': 1,
                'angry': 1,
                'anxious': 1,
                'stressed': 1
            };
            
            if (entries.length === 0) return 'neutral';
            
            const totalScore = entries.reduce((sum, entry) => {
                const mood = entry.moodValue || 'neutral';
                return sum + (moodValues[mood] || 3);
            }, 0);
            
            const avgScore = totalScore / entries.length;
            
            if (avgScore >= 4) return 'happy';
            if (avgScore >= 2.5) return 'neutral';
            return 'sad';
        }

        // Helper: Calculate consistency score (0-100)
        calculateConsistencyScore(entries, totalDays) {
            const uniqueDates = [...new Set(entries.map(e => e.date))];
            return Math.round((uniqueDates.length / totalDays) * 100);
        }

        // Get entry by ID
        async getEntry(entryId) {
            try {
                const doc = await this.db.collection(this.entriesCollection).doc(entryId).get();
                if (!doc.exists) {
                    return null;
                }
                
                const data = doc.data();
                return {
                    id: doc.id,
                    date: data.date,
                    mood: data.mood,
                    moodName: data.moodName,
                    moodValue: data.moodValue,
                    responses: data.responses || {},
                    aiInsights: data.aiInsights || null,
                    createdAt: data.createdAt?.toDate?.() || new Date(),
                    updatedAt: data.updatedAt?.toDate?.() || new Date()
                };
            } catch (error) {
                console.error('Error getting entry:', error);
                return null;
            }
        }

        // Update entry with AI insights
        async updateEntryInsights(userId, entryId, insights) {
            try {
                if (!this.initialized) {
                    await this.initializeFirebase();
                }

                if (!userId || !entryId) {
                    console.error('Missing user ID or entry ID for insights update');
                    console.log('UserId:', userId, 'EntryId:', entryId); // Debug log
                    return { success: false, error: 'Missing required parameters' };
                }

                // FIXED: Correct Firebase v9 syntax for doc reference
                const entryRef = global.firebaseFirestore.doc(this.db, 'journal_entries', entryId);
                
                // Alternative syntax (if above doesn't work):
                // const entryRef = global.firebaseFirestore.doc(this.db, `journal_entries/${entryId}`);

                const entryDoc = await global.firebaseFirestore.getDoc(entryRef);
                
                if (!entryDoc.exists()) {
                    console.error('Entry not found');
                    return { success: false, error: 'Entry not found' };
                }

                if (entryDoc.data().userId !== userId) {
                    console.error('User not authorized to update this entry');
                    return { success: false, error: 'Unauthorized' };
                }

                // Prepare update data
                const updateData = {
                    aiInsights: insights || null,
                    updatedAt: global.firebaseFirestore.serverTimestamp()
                };

                // Update entry in Firestore
                await global.firebaseFirestore.updateDoc(entryRef, updateData);

                console.log('Entry insights updated successfully');
                return { success: true };
            } catch (error) {
                console.error('Error updating entry insights:', error);
                return { 
                    success: false, 
                    error: error.message 
                };
            }
        }


    }

    // Export to global scope
    global.FirebaseStorageService = FirebaseStorageService;

})(typeof window !== 'undefined' ? window : this);