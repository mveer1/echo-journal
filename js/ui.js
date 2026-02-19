// ════════════════════════════════════════════
// UI MANAGEMENT
// ════════════════════════════════════════════

import { getState } from './state.js';
import { wellnessTips, journalPrompts, calculateStreak, calculateAverageMood, calculateAverageMood as getAvgMoodSymbol } from './utils.js';
// We will likely need to import history loading functions here or in main, 
// but UI shouldn't necessarily depend on Firestore directly if we can avoid it.
// For now, let's keep UI focused on DOM manipulation.

const loadingScreen = document.getElementById('loading-screen');
const authScreen = document.getElementById('auth-screen');
const homeScreen = document.getElementById('home-screen');
const journalScreen = document.getElementById('journal-screen');
const historyScreen = document.getElementById('history-screen');
const settingsScreen = document.getElementById('settings-screen');

export function hideAllScreens() {
    [loadingScreen, authScreen, homeScreen, journalScreen, historyScreen, settingsScreen].forEach(s => {
        if (s) s.classList.add('hidden');
    });
}

export function showLoadingScreen() {
    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');
        rotateWellnessTips();
    }
}

export function hideLoadingScreen() {
    if (loadingScreen) loadingScreen.classList.add('hidden');
}

export function showAuthScreen() {
    hideAllScreens();
    if (authScreen) authScreen.classList.remove('hidden');
}

export function showHomeScreen() {
    hideAllScreens();
    if (homeScreen) {
        homeScreen.classList.remove('hidden');
        updateUserGreeting();
        // Note: loadHomeStats should be called from main or auth observer
    }
}

export function showJournalScreen() {
    hideAllScreens();
    if (journalScreen) {
        journalScreen.classList.remove('hidden');
        // resetJournalFlow should be called by the caller of this function
    }
}

export function showHistoryScreen() {
    hideAllScreens();
    if (historyScreen) {
        historyScreen.classList.remove('hidden');
        // loadInsights/Entries should be called by the caller
    }
}

export function showSettingsScreen() {
    hideAllScreens();
    if (settingsScreen) {
        settingsScreen.classList.remove('hidden');
        const user = getState().currentUser;
        const emailEl = document.getElementById('settings-email');
        if (emailEl && user) emailEl.textContent = user.email || '—';
    }
}

// ── Components ──

function rotateWellnessTips() {
    const tipEl = document.getElementById('wellness-tip-text');
    if (!tipEl) return;
    let idx = 0;
    const rotate = () => {
        tipEl.style.opacity = '0';
        setTimeout(() => {
            idx = (idx + 1) % wellnessTips.length;
            tipEl.textContent = wellnessTips[idx];
            tipEl.style.opacity = '1';
        }, 300);
    };
    const interval = setInterval(rotate, 2000);
    setTimeout(() => clearInterval(interval), 3000);
}

export function updateUserGreeting() {
    const el = document.getElementById('user-greeting');
    const user = getState().currentUser;
    if (!el || !user) return;
    const name = user.displayName || user.email.split('@')[0];
    const hour = new Date().getHours();
    let greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    el.textContent = `${greeting}, ${name}`;
}

export function setHomePrompt() {
    const el = document.getElementById('home-prompt-text');
    if (el) el.textContent = journalPrompts[Math.floor(Math.random() * journalPrompts.length)];
}

export function setupInputPlaceholders() {
    document.querySelectorAll('.glassmorphism-input input').forEach(input => {
        if (!input.hasAttribute('placeholder')) input.setAttribute('placeholder', ' ');
        input.addEventListener('input', function () {
            this.value.length > 0 ? this.setAttribute('data-filled', 'true') : this.removeAttribute('data-filled');
        });
    });
}

// ── Theme ──

export function initializeTheme() {
    const saved = localStorage.getItem('echo-theme');
    const theme = saved || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeUI(theme);
}

export function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('echo-theme', next);
    updateThemeUI(next);
}

export function updateThemeUI(theme) {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) toggle.textContent = theme === 'dark' ? '🌙' : '☀️';
    const settingsToggle = document.getElementById('settings-theme-toggle');
    if (settingsToggle) {
        settingsToggle.classList.toggle('active', theme === 'dark');
    }
}

// ── Stats & Helpers ──

export function updateHomeStats(count, streak, mood) {
    const totalEl = document.getElementById('home-total-entries');
    const streakEl = document.getElementById('home-streak');
    const moodEl = document.getElementById('home-avg-mood');
    if (totalEl) totalEl.textContent = count;
    if (streakEl) streakEl.textContent = streak;
    if (moodEl) moodEl.textContent = mood;
}

export function updateHistoryStats(entries) {
    const total = document.getElementById('total-entries');
    const streak = document.getElementById('current-streak');
    const mood = document.getElementById('avg-mood');
    if (total) total.textContent = entries.length;
    if (streak) streak.textContent = calculateStreak(entries);
    if (mood) mood.textContent = calculateAverageMood(entries);
}

export function displayEntries(entries) {
    const list = document.getElementById('entries-list');
    if (!list) return;
    list.innerHTML = '';
    if (entries.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px;">No entries yet. Start journaling to see your entries here!</p>';
        return;
    }
    entries.forEach(entry => {
        const el = document.createElement('div');
        el.className = 'entry-item';
        const date = entry.createdAt ? entry.createdAt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown date';
        const emotionsHtml = entry.emotions?.slice(0, 3).map(e => `<span class="entry-emotion">${e}</span>`).join('') || '';
        const preview = entry.text ? entry.text.substring(0, 150) + (entry.text.length > 150 ? '...' : '') : '';
        el.innerHTML = `
      <div class="entry-header"><div class="entry-date">${date}</div></div>
      <div class="entry-emotions">${emotionsHtml}${entry.emotions?.length > 3 ? `<span class="entry-emotion">+${entry.emotions.length - 3}</span>` : ''}</div>
      <div class="entry-preview">${preview}</div>`;
        list.appendChild(el);
    });
}

export function showSuccessModal() { document.getElementById('success-modal')?.classList.remove('hidden'); }
export function hideSuccessModal() {
    document.getElementById('success-modal')?.classList.add('hidden');
    showHomeScreen();
}

export function switchTab(tabName, callback) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    document.getElementById(`${tabName}-tab`)?.classList.add('active');
    if (callback) callback(tabName);
}
