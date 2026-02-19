// ════════════════════════════════════════════
// FIRESTORE OPERATIONS
// ════════════════════════════════════════════

import { db, firebaseApp } from './config.js';
import { getState } from './state.js';
import { analyzeSentiment, calculateStreak, calculateAverageMood } from './utils.js';
import { updateHomeStats, showSuccessModal, updateHistoryStats, displayEntries } from './ui.js';
import { createEmotionChart, createWeeklyChart, createMoodCalendar } from './charts.js';

export async function loadHomeStats() {
    const { currentUser } = getState();
    if (!currentUser) return;
    try {
        const snapshot = await db.collection('entries')
            .where('userId', '==', currentUser.uid)
            .where('isDraft', '==', false)
            .orderBy('createdAt', 'desc')
            .get();

        // Convert docs to objects
        const entries = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()
        }));

        updateHomeStats(
            entries.length,
            calculateStreak(entries),
            calculateAverageMood(entries)
        );
    } catch (e) { console.error('Error loading home stats:', e); }
}

export async function saveDraft() {
    const { currentUser, journalData, selectedEmotions } = getState();
    if (!currentUser) return;
    try {
        await db.collection('entries').add({
            ...journalData,
            emotions: selectedEmotions,
            userId: currentUser.uid,
            createdAt: firebaseApp.firestore.FieldValue.serverTimestamp(),
            isDraft: true
        });
        alert('Draft saved successfully!');
    } catch (error) { console.error('Error saving draft:', error); alert('Failed to save draft'); }
}

export async function saveEntry() {
    const { currentUser, journalData, selectedEmotions } = getState();
    if (!currentUser) return;
    if (selectedEmotions.length === 0) { alert('Please select at least one emotion'); return; }
    if (!journalData.text.trim()) { alert('Please write something in your journal'); return; }

    try {
        await db.collection('entries').add({
            ...journalData,
            emotions: selectedEmotions,
            userId: currentUser.uid,
            createdAt: firebaseApp.firestore.FieldValue.serverTimestamp(),
            isDraft: false,
            sentiment: analyzeSentiment(journalData.text)
        });
        showSuccessModal();
    } catch (error) { console.error('Error saving entry:', error); alert('Failed to save entry'); }
}

export async function loadInsights() {
    const { currentUser } = getState();
    if (!currentUser) return;
    try {
        const snapshot = await db.collection('entries')
            .where('userId', '==', currentUser.uid)
            .where('isDraft', '==', false)
            .orderBy('createdAt', 'desc')
            .get();

        const entries = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()
        }));

        updateHistoryStats(entries);
        createEmotionChart(entries);
        createWeeklyChart(entries);
        createMoodCalendar(entries);
    } catch (error) { console.error('Error loading insights:', error); }
}

export async function loadEntries() {
    const { currentUser } = getState();
    if (!currentUser) return;
    try {
        const snapshot = await db.collection('entries')
            .where('userId', '==', currentUser.uid)
            .where('isDraft', '==', false)
            .orderBy('createdAt', 'desc')
            .get();

        const entries = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()
        }));

        displayEntries(entries);
    } catch (error) { console.error('Error loading entries:', error); }
}
