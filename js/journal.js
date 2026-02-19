// ════════════════════════════════════════════
// JOURNAL FLOW LOGIC
// ════════════════════════════════════════════

import { getState, setCurrentStep, setSelectedEmotions, updateJournalData, resetState as resetGlobalState } from './state.js';
import { emotionGroups, journalPrompts } from './utils.js';
import { saveDraft, saveEntry } from './firestore.js';
import { hideSuccessModal } from './ui.js';

export function setupJournalEventListeners() {
    // Navigation
    document.getElementById('emotions-next')?.addEventListener('click', () => showStep(2));
    document.getElementById('intensity-back')?.addEventListener('click', () => showStep(1));
    document.getElementById('intensity-next')?.addEventListener('click', () => showStep(3));
    document.getElementById('writing-back')?.addEventListener('click', () => showStep(2));

    // Actions
    document.getElementById('save-draft')?.addEventListener('click', saveDraft);
    document.getElementById('save-entry')?.addEventListener('click', saveEntry);
    document.getElementById('close-success-modal')?.addEventListener('click', hideSuccessModal);

    // Components
    setupEmotionCircles();
    setupSliders();
    setupJournalEditor();
}

export function resetJournalFlow() {
    resetGlobalState();
    updateProgressDots();
    showStep(1);
    updateEmotionCount();
    resetSliders();
    clearJournalText();
    setRandomPrompt();

    // UI resets
    const wrapper = document.getElementById('specific-emotions-wrapper');
    if (wrapper) wrapper.style.display = 'none';
    document.querySelectorAll('.emotion-sector').forEach(s => s.classList.remove('active'));
}

function showStep(step) {
    document.querySelectorAll('.journal-step').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`${['', 'emotion', 'intensity', 'writing'][step]}-step`);
    if (target) target.classList.add('active');
    setCurrentStep(step);
    updateProgressDots();
}

function updateProgressDots() {
    const { currentStep } = getState();
    document.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i < currentStep);
    });
}

// ── Emotions ──

function setupEmotionCircles() {
    document.querySelectorAll('.emotion-sector').forEach(sector => {
        sector.addEventListener('click', () => {
            const group = sector.dataset.emotion;
            document.querySelectorAll('.emotion-sector').forEach(s => s.classList.remove('active'));
            sector.classList.add('active');
            showSpecificEmotions(group);
        });
    });
}

function showSpecificEmotions(group) {
    const wrapper = document.getElementById('specific-emotions-wrapper');
    const container = document.getElementById('specific-emotions-circle');
    if (!wrapper || !container) return;

    wrapper.style.display = 'block';

    const centerSpan = container.querySelector('.circle-center span');
    if (centerSpan) centerSpan.textContent = group.charAt(0).toUpperCase() + group.slice(1);

    container.querySelectorAll('.specific-emotion').forEach(el => el.remove());

    const emotions = emotionGroups[group] || [];
    const { selectedEmotions } = getState();

    emotions.forEach((emotion) => {
        const el = document.createElement('div');
        el.className = 'specific-emotion';
        el.textContent = emotion;
        el.dataset.emotion = emotion;
        if (selectedEmotions.includes(emotion)) el.classList.add('selected');

        el.addEventListener('click', () => toggleEmotionSelection(emotion, el));
        container.appendChild(el);
    });
}

function toggleEmotionSelection(emotion, element) {
    const { selectedEmotions } = getState();
    const idx = selectedEmotions.indexOf(emotion);
    let newEmotions = [...selectedEmotions];

    if (idx > -1) {
        newEmotions.splice(idx, 1);
        element.classList.remove('selected');
    } else {
        newEmotions.push(emotion);
        element.classList.add('selected');
    }

    setSelectedEmotions(newEmotions);
    updateEmotionTags();
    updateEmotionCount();
    updateContinueButton();
}

function updateEmotionTags() {
    const container = document.getElementById('emotion-tags');
    if (!container) return;
    container.innerHTML = '';
    const { selectedEmotions } = getState();

    selectedEmotions.forEach(emotion => {
        const tag = document.createElement('div');
        tag.className = 'emotion-tag';
        tag.innerHTML = `${emotion} <span class="remove" data-emotion="${emotion}">×</span>`;
        tag.querySelector('.remove').addEventListener('click', (e) => { e.stopPropagation(); removeEmotion(emotion); });
        container.appendChild(tag);
    });
}

function removeEmotion(emotion) {
    const { selectedEmotions } = getState();
    const idx = selectedEmotions.indexOf(emotion);
    if (idx > -1) {
        const newEmotions = [...selectedEmotions];
        newEmotions.splice(idx, 1);
        setSelectedEmotions(newEmotions);

        updateEmotionTags();
        updateEmotionCount();
        updateContinueButton();
        const el = document.querySelector(`.specific-emotion[data-emotion="${emotion}"]`);
        if (el) el.classList.remove('selected');
    }
}

function updateEmotionCount() {
    const el = document.getElementById('emotion-count');
    const { selectedEmotions } = getState();
    if (el) el.textContent = `(${selectedEmotions.length})`;
}

function updateContinueButton() {
    const btn = document.getElementById('emotions-next');
    const { selectedEmotions } = getState();
    if (btn) btn.disabled = selectedEmotions.length === 0;
}

// ── Sliders ──

function setupSliders() {
    ['stress', 'energy', 'social', 'physical', 'clarity'].forEach(name => {
        const slider = document.getElementById(`${name}-slider`);
        const display = document.getElementById(`${name}-value`);
        if (!slider || !display) return;
        slider.addEventListener('input', (e) => {
            const val = e.target.value;
            display.textContent = val;
            updateJournalData({ intensities: { ...getState().journalData.intensities, [name]: parseInt(val) } });
            const pct = (val / 10) * 100;
            slider.style.background = `linear-gradient(to right, var(--accent) 0%, var(--accent) ${pct}%, var(--border-strong) ${pct}%, var(--border-strong) 100%)`;
        });
        slider.dispatchEvent(new Event('input'));
    });
}

function resetSliders() {
    ['stress', 'energy', 'social', 'physical', 'clarity'].forEach(name => {
        const slider = document.getElementById(`${name}-slider`);
        const display = document.getElementById(`${name}-value`);
        if (slider && display) {
            slider.value = 5; display.textContent = '5';
            updateJournalData({ intensities: { ...getState().journalData.intensities, [name]: 5 } });
            slider.dispatchEvent(new Event('input'));
        }
    });
}

// ── Text Editor ──

function setupJournalEditor() {
    const textarea = document.getElementById('journal-text');
    const wordCount = document.getElementById('word-count');
    if (textarea && wordCount) {
        textarea.addEventListener('input', (e) => {
            const text = e.target.value;
            const words = text.trim() ? text.trim().split(/\s+/).length : 0;
            wordCount.textContent = `${words} words`;
            updateJournalData({ text });
        });
    }
}

function clearJournalText() {
    const textarea = document.getElementById('journal-text');
    const wordCount = document.getElementById('word-count');
    if (textarea && wordCount) { textarea.value = ''; wordCount.textContent = '0 words'; updateJournalData({ text: '' }); }
}

function setRandomPrompt() {
    const el = document.getElementById('journal-prompt');
    if (el) {
        const prompt = journalPrompts[Math.floor(Math.random() * journalPrompts.length)];
        el.querySelector('p').innerHTML = `<strong>💡 Prompt:</strong> ${prompt}`;
    }
}
