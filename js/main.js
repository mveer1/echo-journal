// ════════════════════════════════════════════
// MAIN ENTRY POINT
// ════════════════════════════════════════════

import { initializeAuth, setupAuthEventListeners, setOnLoginSuccess } from './auth.js';
import {
    initializeTheme, toggleTheme, setupInputPlaceholders, setHomePrompt,
    showJournalScreen, showHistoryScreen, showHomeScreen, showSettingsScreen, switchTab
} from './ui.js';
import { setupJournalEventListeners, resetJournalFlow } from './journal.js';
import { loadHomeStats, loadInsights, loadEntries } from './firestore.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeAuth();
    setupGlobalEventListeners();
    setupInputPlaceholders();
    setHomePrompt();

    // Set the callback for when login finishes to load data
    setOnLoginSuccess(() => {
        loadHomeStats();
    });
});

function setupGlobalEventListeners() {
    setupAuthEventListeners();
    setupJournalEventListeners();

    // Navigation
    document.getElementById('journal-option')?.addEventListener('click', () => {
        showJournalScreen();
        resetJournalFlow();
    });

    document.getElementById('history-option')?.addEventListener('click', () => {
        showHistoryScreen();
        loadInsights();
        loadEntries();
    });

    document.getElementById('back-to-home')?.addEventListener('click', showHomeScreen);
    document.getElementById('back-to-home-history')?.addEventListener('click', showHomeScreen);
    document.getElementById('back-to-home-settings')?.addEventListener('click', showHomeScreen);

    // Settings
    document.getElementById('settings-btn')?.addEventListener('click', showSettingsScreen);
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
    document.getElementById('settings-theme-toggle')?.addEventListener('click', toggleTheme);

    // Settings - Prompt Toggle
    document.getElementById('settings-prompt-toggle')?.addEventListener('click', function () {
        this.classList.toggle('active');
        const card = document.getElementById('daily-prompt-card');
        if (card) card.style.display = this.classList.contains('active') ? '' : 'none';
    });

    // History Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchTab(e.target.dataset.tab, (tab) => {
            if (tab === 'insights') loadInsights();
            else if (tab === 'entries') loadEntries();
        }));
    });

    // Search and filter (simple debounce could be added here if needed)
    document.getElementById('search-entries')?.addEventListener('input', () => loadEntries()); // Original app reloaded everything on filter
    document.getElementById('filter-entries')?.addEventListener('change', () => loadEntries());
}
