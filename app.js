// ════════════════════════════════════════════
// ECHO JOURNAL — Main Application Script
// Firebase Auth + Firestore + UI Logic
// ════════════════════════════════════════════

// Firebase Configuration
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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ── Application Data ──
const emotionGroups = {
  joy: ["Happiness", "Excitement", "Contentment", "Bliss", "Elation", "Euphoria", "Delight"],
  sadness: ["Melancholy", "Grief", "Sorrow", "Despair", "Gloom", "Dejection", "Heartbreak"],
  anger: ["Frustration", "Rage", "Irritation", "Fury", "Resentment", "Indignation", "Annoyance"],
  fear: ["Anxiety", "Worry", "Panic", "Dread", "Terror", "Nervousness", "Apprehension"],
  love: ["Affection", "Compassion", "Tenderness", "Adoration", "Devotion", "Warmth", "Care"],
  surprise: ["Wonder", "Amazement", "Astonishment", "Curiosity", "Awe", "Bewilderment", "Shock"],
  disgust: ["Aversion", "Revulsion", "Contempt", "Loathing", "Distaste", "Repulsion", "Scorn"],
  calm: ["Peace", "Serenity", "Tranquility", "Relaxation", "Stillness", "Composure", "Balance"]
};

const wellnessTips = [
  "Take three deep breaths before starting your day",
  "Gratitude can shift your perspective in moments",
  "Your feelings are valid and temporary",
  "Small steps lead to meaningful change",
  "Self-compassion is a form of strength",
  "Every emotion has something to teach you",
  "Progress isn't always linear, and that's okay",
  "Mindful moments can happen anywhere, anytime",
  "Your mental health matters as much as your physical health",
  "Reflection helps transform experience into wisdom"
];

const journalPrompts = [
  "What emotions am I experiencing right now, and what might have triggered them?",
  "How did my body feel throughout the day, and what does it need?",
  "What am I grateful for in this moment?",
  "What patterns am I noticing in my thoughts and feelings?",
  "How can I show myself compassion today?",
  "What would I tell a friend experiencing what I'm going through?",
  "What do I need to let go of to move forward?",
  "How did I grow or learn something new today?"
];

// ── Global State ──
let currentUser = null;
let selectedEmotions = [];
let currentStep = 1;
let journalData = { emotions: [], intensities: { stress: 5, energy: 5, social: 5, physical: 5, clarity: 5 }, text: '' };

// ── DOM Elements ──
const loadingScreen = document.getElementById('loading-screen');
const authScreen = document.getElementById('auth-screen');
const homeScreen = document.getElementById('home-screen');
const journalScreen = document.getElementById('journal-screen');
const historyScreen = document.getElementById('history-screen');
const settingsScreen = document.getElementById('settings-screen');

// ════════════════════════════════════════════
// INITIALIZATION
// ════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {
  initializeTheme();
  initializeApp();
  setupEventListeners();
  setupInputPlaceholders();
  setHomePrompt();
});

function initializeApp() {
  showLoadingScreen();
  auth.onAuthStateChanged(user => {
    if (user) {
      currentUser = user;
      setTimeout(() => { hideLoadingScreen(); showHomeScreen(); }, 3000);
    } else {
      currentUser = null;
      setTimeout(() => { hideLoadingScreen(); showAuthScreen(); }, 3000);
    }
  });
}

// ════════════════════════════════════════════
// THEME MANAGEMENT
// ════════════════════════════════════════════
function initializeTheme() {
  const saved = localStorage.getItem('echo-theme');
  const theme = saved || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeUI(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('echo-theme', next);
  updateThemeUI(next);
}

function updateThemeUI(theme) {
  // Update header toggle icon
  const toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.textContent = theme === 'dark' ? '🌙' : '☀️';
  // Update settings toggle
  const settingsToggle = document.getElementById('settings-theme-toggle');
  if (settingsToggle) {
    settingsToggle.classList.toggle('active', theme === 'dark');
  }
}

// ════════════════════════════════════════════
// INPUT PLACEHOLDERS (for floating labels)
// ════════════════════════════════════════════
function setupInputPlaceholders() {
  document.querySelectorAll('.glassmorphism-input input').forEach(input => {
    if (!input.hasAttribute('placeholder')) input.setAttribute('placeholder', ' ');
    input.addEventListener('input', function () {
      this.value.length > 0 ? this.setAttribute('data-filled', 'true') : this.removeAttribute('data-filled');
    });
  });
}

// ════════════════════════════════════════════
// LOADING SCREEN
// ════════════════════════════════════════════
function showLoadingScreen() { loadingScreen.classList.remove('hidden'); rotateWellnessTips(); }
function hideLoadingScreen() { loadingScreen.classList.add('hidden'); }

function rotateWellnessTips() {
  const tipEl = document.getElementById('wellness-tip-text');
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

// ════════════════════════════════════════════
// SCREEN NAVIGATION
// ════════════════════════════════════════════
function hideAllScreens() {
  [loadingScreen, authScreen, homeScreen, journalScreen, historyScreen, settingsScreen].forEach(s => {
    if (s) s.classList.add('hidden');
  });
}

function showAuthScreen() { hideAllScreens(); authScreen.classList.remove('hidden'); }

function showHomeScreen() {
  hideAllScreens();
  homeScreen.classList.remove('hidden');
  updateUserGreeting();
  loadHomeStats();
}

function showJournalScreen() { hideAllScreens(); journalScreen.classList.remove('hidden'); resetJournalFlow(); }

function showHistoryScreen() { hideAllScreens(); historyScreen.classList.remove('hidden'); loadInsights(); loadEntries(); }

function showSettingsScreen() {
  hideAllScreens();
  settingsScreen.classList.remove('hidden');
  // Populate settings info
  const emailEl = document.getElementById('settings-email');
  if (emailEl && currentUser) emailEl.textContent = currentUser.email || '—';
}

// ════════════════════════════════════════════
// HOME SCREEN HELPERS
// ════════════════════════════════════════════
function setHomePrompt() {
  const el = document.getElementById('home-prompt-text');
  if (el) el.textContent = journalPrompts[Math.floor(Math.random() * journalPrompts.length)];
}

async function loadHomeStats() {
  if (!currentUser) return;
  try {
    const snapshot = await db.collection('entries')
      .where('userId', '==', currentUser.uid)
      .where('isDraft', '==', false)
      .orderBy('createdAt', 'desc')
      .get();
    const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate() }));
    const totalEl = document.getElementById('home-total-entries');
    const streakEl = document.getElementById('home-streak');
    const moodEl = document.getElementById('home-avg-mood');
    if (totalEl) totalEl.textContent = entries.length;
    if (streakEl) streakEl.textContent = calculateStreak(entries);
    if (moodEl) moodEl.textContent = calculateAverageMood(entries);
  } catch (e) { console.error('Error loading home stats:', e); }
}

// ════════════════════════════════════════════
// AUTHENTICATION
// ════════════════════════════════════════════
function setupAuthEventListeners() {
  const loginForm = document.getElementById('login-email-form');
  const registerForm = document.getElementById('register-email-form');
  if (loginForm) loginForm.addEventListener('submit', handleEmailLogin);
  if (registerForm) registerForm.addEventListener('submit', handleEmailRegister);

  const googleSigninBtn = document.getElementById('google-signin');
  const googleSignupBtn = document.getElementById('google-signup');
  if (googleSigninBtn) googleSigninBtn.addEventListener('click', handleGoogleSignIn);
  if (googleSignupBtn) googleSignupBtn.addEventListener('click', handleGoogleSignIn);

  const showRegister = document.getElementById('show-register');
  const showLogin = document.getElementById('show-login');
  if (showRegister) showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
  });
  if (showLogin) showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
  });

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
}

async function handleEmailLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  if (!email || !password) { alert('Please fill in all fields'); return; }
  try { await auth.signInWithEmailAndPassword(email, password); }
  catch (error) {
    let msg = 'Login failed: ';
    switch (error.code) {
      case 'auth/user-not-found': msg += 'No account found with this email.'; break;
      case 'auth/wrong-password': msg += 'Incorrect password.'; break;
      case 'auth/invalid-email': msg += 'Invalid email address.'; break;
      default: msg += error.message;
    }
    alert(msg);
  }
}

async function handleEmailRegister(e) {
  e.preventDefault();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  if (!email || !password) { alert('Please fill in all fields'); return; }
  if (password.length < 6) { alert('Password must be at least 6 characters long'); return; }
  try { await auth.createUserWithEmailAndPassword(email, password); }
  catch (error) {
    let msg = 'Registration failed: ';
    switch (error.code) {
      case 'auth/email-already-in-use': msg += 'An account with this email already exists.'; break;
      case 'auth/invalid-email': msg += 'Invalid email address.'; break;
      case 'auth/weak-password': msg += 'Password is too weak.'; break;
      default: msg += error.message;
    }
    alert(msg);
  }
}

async function handleGoogleSignIn() {
  const provider = new firebase.auth.GoogleAuthProvider();
  try { await auth.signInWithPopup(provider); }
  catch (error) { alert('Google sign-in failed: ' + error.message); }
}

async function handleLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  const logoutText = logoutBtn?.querySelector('.logout-text');
  const logoutLoading = logoutBtn?.querySelector('.logout-loading');
  try {
    if (logoutText) logoutText.classList.add('hidden');
    if (logoutLoading) logoutLoading.classList.remove('hidden');
    if (logoutBtn) logoutBtn.disabled = true;
    await auth.signOut();
    currentUser = null;
    selectedEmotions = [];
    journalData = { emotions: [], intensities: { stress: 5, energy: 5, social: 5, physical: 5, clarity: 5 }, text: '' };
  } catch (error) {
    alert('Logout failed: ' + error.message);
  } finally {
    if (logoutText) logoutText.classList.remove('hidden');
    if (logoutLoading) logoutLoading.classList.add('hidden');
    if (logoutBtn) logoutBtn.disabled = false;
  }
}

function updateUserGreeting() {
  const el = document.getElementById('user-greeting');
  if (!el || !currentUser) return;
  const name = currentUser.displayName || currentUser.email.split('@')[0];
  const hour = new Date().getHours();
  let greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  el.textContent = `${greeting}, ${name}`;
}

// ════════════════════════════════════════════
// JOURNAL FLOW
// ════════════════════════════════════════════
function resetJournalFlow() {
  currentStep = 1;
  selectedEmotions = [];
  journalData = { emotions: [], intensities: { stress: 5, energy: 5, social: 5, physical: 5, clarity: 5 }, text: '' };
  updateProgressDots();
  showStep(1);
  updateEmotionCount();
  resetSliders();
  clearJournalText();
  setRandomPrompt();
  // Hide specific emotions panel
  const wrapper = document.getElementById('specific-emotions-wrapper');
  if (wrapper) wrapper.style.display = 'none';
  // Remove active from all sectors
  document.querySelectorAll('.emotion-sector').forEach(s => s.classList.remove('active'));
}

function showStep(step) {
  document.querySelectorAll('.journal-step').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(`${['', 'emotion', 'intensity', 'writing'][step]}-step`);
  if (target) target.classList.add('active');
  currentStep = step;
  updateProgressDots();
}

function updateProgressDots() {
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i < currentStep);
  });
}

// ── Emotion Selection (Grid-based) ──
function setupEmotionCircles() {
  document.querySelectorAll('.emotion-sector').forEach(sector => {
    sector.addEventListener('click', () => {
      const group = sector.dataset.emotion;
      // Toggle active state on the sector card
      document.querySelectorAll('.emotion-sector').forEach(s => s.classList.remove('active'));
      sector.classList.add('active');
      // Show specific emotions panel
      showSpecificEmotions(group);
    });
  });
}

function showSpecificEmotions(group) {
  const wrapper = document.getElementById('specific-emotions-wrapper');
  const container = document.getElementById('specific-emotions-circle');
  if (!wrapper || !container) return;

  wrapper.style.display = 'block';

  // Update center label (hidden via CSS but update anyway for accessibility)
  const centerSpan = container.querySelector('.circle-center span');
  if (centerSpan) centerSpan.textContent = group.charAt(0).toUpperCase() + group.slice(1);

  // Clear old specific emotions
  container.querySelectorAll('.specific-emotion').forEach(el => el.remove());

  const emotions = emotionGroups[group] || [];
  emotions.forEach((emotion, i) => {
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
  const idx = selectedEmotions.indexOf(emotion);
  if (idx > -1) {
    selectedEmotions.splice(idx, 1);
    element.classList.remove('selected');
  } else {
    selectedEmotions.push(emotion);
    element.classList.add('selected');
  }
  updateEmotionTags();
  updateEmotionCount();
  updateContinueButton();
}

function updateEmotionTags() {
  const container = document.getElementById('emotion-tags');
  if (!container) return;
  container.innerHTML = '';
  selectedEmotions.forEach(emotion => {
    const tag = document.createElement('div');
    tag.className = 'emotion-tag';
    tag.innerHTML = `${emotion} <span class="remove" data-emotion="${emotion}">×</span>`;
    tag.querySelector('.remove').addEventListener('click', (e) => { e.stopPropagation(); removeEmotion(emotion); });
    container.appendChild(tag);
  });
}

function removeEmotion(emotion) {
  const idx = selectedEmotions.indexOf(emotion);
  if (idx > -1) {
    selectedEmotions.splice(idx, 1);
    updateEmotionTags();
    updateEmotionCount();
    updateContinueButton();
    const el = document.querySelector(`.specific-emotion[data-emotion="${emotion}"]`);
    if (el) el.classList.remove('selected');
  }
}

function updateEmotionCount() {
  const el = document.getElementById('emotion-count');
  if (el) el.textContent = `(${selectedEmotions.length})`;
}

function updateContinueButton() {
  const btn = document.getElementById('emotions-next');
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
      journalData.intensities[name] = parseInt(val);
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
      slider.value = 5; display.textContent = '5'; journalData.intensities[name] = 5;
      slider.dispatchEvent(new Event('input'));
    }
  });
}

// ── Journal Editor ──
function setupJournalEditor() {
  const textarea = document.getElementById('journal-text');
  const wordCount = document.getElementById('word-count');
  if (textarea && wordCount) {
    textarea.addEventListener('input', (e) => {
      const text = e.target.value;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      wordCount.textContent = `${words} words`;
      journalData.text = text;
    });
  }
}

function clearJournalText() {
  const textarea = document.getElementById('journal-text');
  const wordCount = document.getElementById('word-count');
  if (textarea && wordCount) { textarea.value = ''; wordCount.textContent = '0 words'; journalData.text = ''; }
}

function setRandomPrompt() {
  const el = document.getElementById('journal-prompt');
  if (el) {
    const prompt = journalPrompts[Math.floor(Math.random() * journalPrompts.length)];
    el.querySelector('p').innerHTML = `<strong>💡 Prompt:</strong> ${prompt}`;
  }
}

// ════════════════════════════════════════════
// SAVE FUNCTIONS
// ════════════════════════════════════════════
async function saveDraft() {
  if (!currentUser) return;
  try {
    await db.collection('entries').add({
      ...journalData, emotions: selectedEmotions,
      userId: currentUser.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp(), isDraft: true
    });
    alert('Draft saved successfully!');
  } catch (error) { console.error('Error saving draft:', error); alert('Failed to save draft'); }
}

async function saveEntry() {
  if (!currentUser) return;
  if (selectedEmotions.length === 0) { alert('Please select at least one emotion'); return; }
  if (!journalData.text.trim()) { alert('Please write something in your journal'); return; }
  try {
    await db.collection('entries').add({
      ...journalData, emotions: selectedEmotions,
      userId: currentUser.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      isDraft: false, sentiment: analyzeSentiment(journalData.text)
    });
    showSuccessModal();
  } catch (error) { console.error('Error saving entry:', error); alert('Failed to save entry'); }
}

function analyzeSentiment(text) {
  const positive = ['happy', 'joy', 'love', 'excited', 'grateful', 'peaceful', 'content', 'amazing', 'wonderful', 'great'];
  const negative = ['sad', 'angry', 'frustrated', 'worried', 'anxious', 'terrible', 'awful', 'hate', 'depressed'];
  const words = text.toLowerCase().split(/\s+/);
  let pos = 0, neg = 0;
  words.forEach(w => { if (positive.includes(w)) pos++; if (negative.includes(w)) neg++; });
  if (pos > neg) return 'positive';
  if (neg > pos) return 'negative';
  return 'neutral';
}

function showSuccessModal() { document.getElementById('success-modal')?.classList.remove('hidden'); }
function hideSuccessModal() { document.getElementById('success-modal')?.classList.add('hidden'); showHomeScreen(); }

// ════════════════════════════════════════════
// HISTORY & INSIGHTS
// ════════════════════════════════════════════
async function loadInsights() {
  if (!currentUser) return;
  try {
    const snapshot = await db.collection('entries').where('userId', '==', currentUser.uid).where('isDraft', '==', false).orderBy('createdAt', 'desc').get();
    const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate() }));
    updateStats(entries);
    createEmotionChart(entries);
    createWeeklyChart(entries);
    createMoodCalendar(entries);
  } catch (error) { console.error('Error loading insights:', error); }
}

function updateStats(entries) {
  const total = document.getElementById('total-entries');
  const streak = document.getElementById('current-streak');
  const mood = document.getElementById('avg-mood');
  if (total) total.textContent = entries.length;
  if (streak) streak.textContent = calculateStreak(entries);
  if (mood) mood.textContent = calculateAverageMood(entries);
}

function calculateStreak(entries) {
  if (entries.length === 0) return 0;
  let streak = 0, checkDate = new Date();
  for (let i = 0; i < entries.length; i++) {
    const d = entries[i].createdAt;
    if (!d) continue;
    const entryDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const checkDay = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
    if (entryDay.getTime() === checkDay.getTime()) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
    else if (entryDay.getTime() < checkDay.getTime()) break;
  }
  return streak;
}

function calculateAverageMood(entries) {
  if (entries.length === 0) return '—';
  const scores = { positive: 1, neutral: 0, negative: -1 };
  const avg = entries.reduce((s, e) => s + (scores[e.sentiment] || 0), 0) / entries.length;
  if (avg > 0.3) return '😊';
  if (avg < -0.3) return '😔';
  return '😐';
}

// Chart colors matched to warm palette
const chartColors = ['#7C6F9B', '#F4C95D', '#E8889B', '#87CEAB', '#6B9BD2', '#D4726A', '#F4A460', '#9B8EC4', '#8FBC8F', '#B8A9D6'];

function createEmotionChart(entries) {
  const ctx = document.getElementById('emotion-chart');
  if (!ctx) return;
  const counts = {};
  entries.forEach(e => e.emotions?.forEach(em => { counts[em] = (counts[em] || 0) + 1; }));
  const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 10);

  // Determine text color based on theme
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#EDEAE5' : '#2D2A26';

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: sorted.map(([e]) => e),
      datasets: [{ data: sorted.map(([, c]) => c), backgroundColor: chartColors, borderWidth: 0 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { color: textColor, padding: 16 } } }
    }
  });
}

function createWeeklyChart(entries) {
  const ctx = document.getElementById('weekly-chart');
  if (!ctx) return;
  const last7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
  const data = last7.map(date => {
    const dayEntries = entries.filter(e => e.createdAt && e.createdAt.toDateString() === date.toDateString());
    return {
      date,
      stress: dayEntries.length > 0 ? dayEntries.reduce((s, e) => s + (e.intensities?.stress || 5), 0) / dayEntries.length : 0,
      energy: dayEntries.length > 0 ? dayEntries.reduce((s, e) => s + (e.intensities?.energy || 5), 0) / dayEntries.length : 0
    };
  });

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#9E99B5' : '#7A746B';
  const gridColor = isDark ? 'rgba(237,234,229,0.08)' : 'rgba(45,42,38,0.08)';

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.date.toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [
        { label: 'Stress', data: data.map(d => d.stress), borderColor: '#D4726A', backgroundColor: 'rgba(212,114,106,0.1)', tension: 0.4, fill: true },
        { label: 'Energy', data: data.map(d => d.energy), borderColor: '#F4C95D', backgroundColor: 'rgba(244,201,93,0.1)', tension: 0.4, fill: true }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: textColor } } },
      scales: {
        y: { beginAtZero: true, max: 10, ticks: { color: textColor }, grid: { color: gridColor } },
        x: { ticks: { color: textColor }, grid: { color: gridColor } }
      }
    }
  });
}

function createMoodCalendar(entries) {
  const calendar = document.getElementById('mood-calendar');
  if (!calendar) return;
  calendar.innerHTML = '';
  const today = new Date(), month = today.getMonth(), year = today.getFullYear();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
    const h = document.createElement('div');
    h.className = 'calendar-header';
    h.textContent = day;
    calendar.appendChild(h);
  });

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const el = document.createElement('div');
    el.className = 'calendar-day';
    el.textContent = date.getDate();
    if (date.getMonth() !== month) el.style.opacity = '0.3';
    const dayEntries = entries.filter(e => e.createdAt && e.createdAt.toDateString() === date.toDateString());
    if (dayEntries.length > 0) el.classList.add('has-entry');
    calendar.appendChild(el);
  }
}

async function loadEntries() {
  if (!currentUser) return;
  try {
    const snapshot = await db.collection('entries').where('userId', '==', currentUser.uid).where('isDraft', '==', false).orderBy('createdAt', 'desc').get();
    const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate() }));
    displayEntries(entries);
  } catch (error) { console.error('Error loading entries:', error); }
}

function displayEntries(entries) {
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

// ════════════════════════════════════════════
// EVENT LISTENERS
// ════════════════════════════════════════════
function setupEventListeners() {
  setupAuthEventListeners();

  // Navigation
  document.getElementById('journal-option')?.addEventListener('click', showJournalScreen);
  document.getElementById('history-option')?.addEventListener('click', showHistoryScreen);
  document.getElementById('back-to-home')?.addEventListener('click', showHomeScreen);
  document.getElementById('back-to-home-history')?.addEventListener('click', showHomeScreen);
  document.getElementById('back-to-home-settings')?.addEventListener('click', showHomeScreen);

  // Settings
  document.getElementById('settings-btn')?.addEventListener('click', showSettingsScreen);
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
  document.getElementById('settings-theme-toggle')?.addEventListener('click', () => {
    toggleTheme();
  });

  // Daily prompt toggle
  document.getElementById('settings-prompt-toggle')?.addEventListener('click', function () {
    this.classList.toggle('active');
    const card = document.getElementById('daily-prompt-card');
    if (card) card.style.display = this.classList.contains('active') ? '' : 'none';
  });

  // Journal flow
  document.getElementById('emotions-next')?.addEventListener('click', () => showStep(2));
  document.getElementById('intensity-back')?.addEventListener('click', () => showStep(1));
  document.getElementById('intensity-next')?.addEventListener('click', () => showStep(3));
  document.getElementById('writing-back')?.addEventListener('click', () => showStep(2));

  // Journal actions
  document.getElementById('save-draft')?.addEventListener('click', saveDraft);
  document.getElementById('save-entry')?.addEventListener('click', saveEntry);

  // Modal
  document.getElementById('close-success-modal')?.addEventListener('click', hideSuccessModal);

  // History tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
  });

  // Search and filter
  document.getElementById('search-entries')?.addEventListener('input', filterEntries);
  document.getElementById('filter-entries')?.addEventListener('change', filterEntries);

  // Initialize components
  setupEmotionCircles();
  setupSliders();
  setupJournalEditor();
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
  document.getElementById(`${tabName}-tab`)?.classList.add('active');
  if (tabName === 'insights') loadInsights();
  else if (tabName === 'entries') loadEntries();
}

function filterEntries() { loadEntries(); }