// Firebase Configuration and Initialization
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

// Application Data
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

// Global State
let currentUser = null;
let selectedEmotions = [];
let currentStep = 1;
let journalData = {
  emotions: [],
  intensities: {
    stress: 5,
    energy: 5,
    social: 5,
    physical: 5,
    clarity: 5
  },
  text: ''
};

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const authScreen = document.getElementById('auth-screen');
const homeScreen = document.getElementById('home-screen');
const journalScreen = document.getElementById('journal-screen');
const historyScreen = document.getElementById('history-screen');

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  setupEventListeners();
  setupInputPlaceholders();
});

// Application Initialization
function initializeApp() {
  showLoadingScreen();
  
  // Check authentication state
  auth.onAuthStateChanged(user => {
    if (user) {
      currentUser = user;
      setTimeout(() => {
        hideLoadingScreen();
        showHomeScreen();
      }, 3000);
    } else {
      currentUser = null;
      setTimeout(() => {
        hideLoadingScreen();
        showAuthScreen();
      }, 3000);
    }
  });
}

// Input Placeholder Setup for Floating Labels
function setupInputPlaceholders() {
  const inputs = document.querySelectorAll('.glassmorphism-input input');
  inputs.forEach(input => {
    // Add placeholder attribute to trigger :not(:placeholder-shown) selector
    if (!input.hasAttribute('placeholder')) {
      input.setAttribute('placeholder', ' ');
    }
    
    // Handle input events for proper label animation
    input.addEventListener('input', function() {
      if (this.value.length > 0) {
        this.setAttribute('data-filled', 'true');
      } else {
        this.removeAttribute('data-filled');
      }
    });
    
    input.addEventListener('focus', function() {
      this.setAttribute('data-focused', 'true');
    });
    
    input.addEventListener('blur', function() {
      this.removeAttribute('data-focused');
    });
  });
}

// Loading Screen Functions
function showLoadingScreen() {
  loadingScreen.classList.remove('hidden');
  rotateWellnessTips();
}

function hideLoadingScreen() {
  loadingScreen.classList.add('hidden');
}

function rotateWellnessTips() {
  const tipElement = document.getElementById('wellness-tip-text');
  let currentTipIndex = 0;
  
  const rotateTip = () => {
    tipElement.style.opacity = '0';
    setTimeout(() => {
      currentTipIndex = (currentTipIndex + 1) % wellnessTips.length;
      tipElement.textContent = wellnessTips[currentTipIndex];
      tipElement.style.opacity = '1';
    }, 300);
  };
  
  const interval = setInterval(rotateTip, 2000);
  
  // Clear interval after loading
  setTimeout(() => {
    clearInterval(interval);
  }, 3000);
}

// Screen Navigation Functions
function showAuthScreen() {
  hideAllScreens();
  authScreen.classList.remove('hidden');
}

function showHomeScreen() {
  hideAllScreens();
  homeScreen.classList.remove('hidden');
  updateUserGreeting();
}

function showJournalScreen() {
  hideAllScreens();
  journalScreen.classList.remove('hidden');
  resetJournalFlow();
}

function showHistoryScreen() {
  hideAllScreens();
  historyScreen.classList.remove('hidden');
  loadInsights();
  loadEntries();
}

function hideAllScreens() {
  [loadingScreen, authScreen, homeScreen, journalScreen, historyScreen].forEach(screen => {
    screen.classList.add('hidden');
  });
}

// Authentication Functions
function setupAuthEventListeners() {
  // Login form - Fixed event listener
  const loginForm = document.getElementById('login-email-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleEmailLogin);
  }
  
  // Register form - Fixed event listener  
  const registerForm = document.getElementById('register-email-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleEmailRegister);
  }
  
  // Google Sign-In buttons
  const googleSigninBtn = document.getElementById('google-signin');
  const googleSignupBtn = document.getElementById('google-signup');
  
  if (googleSigninBtn) {
    googleSigninBtn.addEventListener('click', handleGoogleSignIn);
  }
  if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', handleGoogleSignIn);
  }
  
  // Form switching
  const showRegisterLink = document.getElementById('show-register');
  const showLoginLink = document.getElementById('show-login');
  
  if (showRegisterLink) {
    showRegisterLink.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('login-form').classList.add('hidden');
      document.getElementById('register-form').classList.remove('hidden');
    });
  }
  
  if (showLoginLink) {
    showLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('register-form').classList.add('hidden');
      document.getElementById('login-form').classList.remove('hidden');
    });
  }
  
  // Logout with proper functionality
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

async function handleEmailLogin(e) {
  e.preventDefault();
  console.log('Login form submitted');
  
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  
  console.log('Attempting login with:', email);
  
  if (!email || !password) {
    alert('Please fill in all fields');
    return;
  }
  
  try {
    const result = await auth.signInWithEmailAndPassword(email, password);
    console.log('Login successful:', result.user);
  } catch (error) {
    console.error('Login error:', error);
    
    // Provide more user-friendly error messages
    let errorMessage = 'Login failed: ';
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage += 'No account found with this email address.';
        break;
      case 'auth/wrong-password':
        errorMessage += 'Incorrect password.';
        break;
      case 'auth/invalid-email':
        errorMessage += 'Invalid email address.';
        break;
      case 'auth/user-disabled':
        errorMessage += 'This account has been disabled.';
        break;
      default:
        errorMessage += error.message;
    }
    alert(errorMessage);
  }
}

async function handleEmailRegister(e) {
  e.preventDefault();
  console.log('Register form submitted');
  
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  
  console.log('Attempting registration with:', email);
  
  if (!email || !password) {
    alert('Please fill in all fields');
    return;
  }
  
  if (password.length < 6) {
    alert('Password must be at least 6 characters long');
    return;
  }
  
  try {
    const result = await auth.createUserWithEmailAndPassword(email, password);
    console.log('Registration successful:', result.user);
  } catch (error) {
    console.error('Registration error:', error);
    
    // Provide more user-friendly error messages
    let errorMessage = 'Registration failed: ';
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage += 'An account with this email already exists.';
        break;
      case 'auth/invalid-email':
        errorMessage += 'Invalid email address.';
        break;
      case 'auth/weak-password':
        errorMessage += 'Password is too weak.';
        break;
      default:
        errorMessage += error.message;
    }
    alert(errorMessage);
  }
}

async function handleGoogleSignIn() {
  console.log('Google sign-in clicked');
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const result = await auth.signInWithPopup(provider);
    console.log('Google sign-in successful:', result.user);
  } catch (error) {
    console.error('Google sign-in error:', error);
    alert('Google sign-in failed: ' + error.message);
  }
}

async function handleLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  const logoutText = logoutBtn.querySelector('.logout-text');
  const logoutLoading = logoutBtn.querySelector('.logout-loading');
  
  try {
    // Show loading state
    logoutText.classList.add('hidden');
    logoutLoading.classList.remove('hidden');
    logoutBtn.disabled = true;
    
    // Sign out user
    await auth.signOut();
    
    // Reset UI state
    logoutText.classList.remove('hidden');
    logoutLoading.classList.add('hidden');
    logoutBtn.disabled = false;
    
    // Clear user data
    currentUser = null;
    selectedEmotions = [];
    journalData = {
      emotions: [],
      intensities: {
        stress: 5,
        energy: 5,
        social: 5,
        physical: 5,
        clarity: 5
      },
      text: ''
    };
    
  } catch (error) {
    // Reset button state on error
    logoutText.classList.remove('hidden');
    logoutLoading.classList.add('hidden');
    logoutBtn.disabled = false;
    
    console.error('Logout error:', error);
    alert('Logout failed: ' + error.message);
  }
}

function updateUserGreeting() {
  const greetingElement = document.getElementById('user-greeting');
  if (currentUser) {
    const name = currentUser.displayName || currentUser.email.split('@')[0];
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    
    greetingElement.textContent = `${greeting}, ${name}!`;
  }
}

// Journal Functions
function resetJournalFlow() {
  currentStep = 1;
  selectedEmotions = [];
  journalData = {
    emotions: [],
    intensities: {
      stress: 5,
      energy: 5,
      social: 5,
      physical: 5,
      clarity: 5
    },
    text: ''
  };
  
  updateProgressDots();
  showStep(1);
  updateEmotionCount();
  resetSliders();
  clearJournalText();
  setRandomPrompt();
  
  // Reset specific emotions circle
  const specificWrapper = document.getElementById('specific-emotions-wrapper');
  specificWrapper.style.transform = 'translateX(100px)';
  specificWrapper.style.opacity = '0';
}

function showStep(step) {
  document.querySelectorAll('.journal-step').forEach(stepEl => {
    stepEl.classList.remove('active');
  });
  
  const targetStep = document.getElementById(`${getStepId(step)}-step`);
  if (targetStep) {
    targetStep.classList.add('active');
  }
  
  currentStep = step;
  updateProgressDots();
}

function getStepId(step) {
  const stepIds = ['', 'emotion', 'intensity', 'writing'];
  return stepIds[step];
}

function updateProgressDots() {
  document.querySelectorAll('.dot').forEach((dot, index) => {
    if (index < currentStep) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

function setupEmotionCircles() {
  const emotionSectors = document.querySelectorAll('.emotion-sector');
  const specificEmotionsCircle = document.getElementById('specific-emotions-circle');
  
  emotionSectors.forEach(sector => {
    sector.addEventListener('click', () => {
      const emotionGroup = sector.dataset.emotion;
      showSpecificEmotions(emotionGroup);
      
      // Animate circles with enhanced transitions
      const groupsWrapper = sector.closest('.emotion-circle-wrapper');
      const specificWrapper = document.getElementById('specific-emotions-wrapper');
      
      groupsWrapper.style.transform = 'translateX(-50px) scale(0.9)';
      groupsWrapper.style.opacity = '0.7';
      specificWrapper.style.transform = 'translateX(0) scale(1)';
      specificWrapper.style.opacity = '1';
      
      // Add glow effect to selected sector
      sector.style.boxShadow = 'inset 0 0 30px rgba(0, 212, 255, 0.5)';
      setTimeout(() => {
        sector.style.boxShadow = '';
      }, 1000);
    });
  });
}

function showSpecificEmotions(emotionGroup) {
  const specificEmotionsCircle = document.getElementById('specific-emotions-circle');
  const emotions = emotionGroups[emotionGroup];
  
  // Update center text
  const centerSpan = specificEmotionsCircle.querySelector('.circle-center span');
  centerSpan.textContent = emotionGroup.charAt(0).toUpperCase() + emotionGroup.slice(1);
  
  // Clear existing emotions
  const existingEmotions = specificEmotionsCircle.querySelectorAll('.specific-emotion');
  existingEmotions.forEach(emotion => emotion.remove());
  
  emotions.forEach((emotion, index) => {
    const emotionElement = document.createElement('div');
    emotionElement.className = 'specific-emotion';
    emotionElement.textContent = emotion;
    emotionElement.dataset.emotion = emotion;
    
    // Position emotions around the circle with better spacing
    const angle = (index / emotions.length) * 360;
    const radius = 130;
    const x = Math.cos(angle * Math.PI / 180) * radius;
    const y = Math.sin(angle * Math.PI / 180) * radius;
    
    emotionElement.style.left = `calc(50% + ${x}px - 50px)`;
    emotionElement.style.top = `calc(50% + ${y}px - 20px)`;
    
    // Check if already selected
    if (selectedEmotions.includes(emotion)) {
      emotionElement.classList.add('selected');
    }
    
    emotionElement.addEventListener('click', () => {
      toggleEmotionSelection(emotion, emotionElement);
    });
    
    specificEmotionsCircle.appendChild(emotionElement);
    
    // Animate in
    setTimeout(() => {
      emotionElement.style.opacity = '1';
      emotionElement.style.transform = 'scale(1)';
    }, index * 50);
  });
}

function toggleEmotionSelection(emotion, element) {
  const index = selectedEmotions.indexOf(emotion);
  
  if (index > -1) {
    selectedEmotions.splice(index, 1);
    element.classList.remove('selected');
  } else {
    selectedEmotions.push(emotion);
    element.classList.add('selected');
    
    // Add selection animation
    element.style.transform = 'scale(1.2)';
    setTimeout(() => {
      element.style.transform = 'scale(1)';
    }, 200);
  }
  
  updateEmotionTags();
  updateEmotionCount();
  updateContinueButton();
}

function updateEmotionTags() {
  const tagsContainer = document.getElementById('emotion-tags');
  tagsContainer.innerHTML = '';
  
  selectedEmotions.forEach(emotion => {
    const tag = document.createElement('div');
    tag.className = 'emotion-tag';
    tag.innerHTML = `
      ${emotion}
      <span class="remove" data-emotion="${emotion}">×</span>
    `;
    
    tag.querySelector('.remove').addEventListener('click', (e) => {
      e.stopPropagation();
      removeEmotion(emotion);
    });
    
    tagsContainer.appendChild(tag);
  });
}

function removeEmotion(emotion) {
  const index = selectedEmotions.indexOf(emotion);
  if (index > -1) {
    selectedEmotions.splice(index, 1);
    updateEmotionTags();
    updateEmotionCount();
    updateContinueButton();
    
    // Update specific emotion circle
    const specificEmotion = document.querySelector(`[data-emotion="${emotion}"]`);
    if (specificEmotion && specificEmotion.classList.contains('specific-emotion')) {
      specificEmotion.classList.remove('selected');
    }
  }
}

function updateEmotionCount() {
  const countElement = document.getElementById('emotion-count');
  countElement.textContent = `(${selectedEmotions.length})`;
}

function updateContinueButton() {
  const continueBtn = document.getElementById('emotions-next');
  continueBtn.disabled = selectedEmotions.length === 0;
}

function setupSliders() {
  const sliders = ['stress', 'energy', 'social', 'physical', 'clarity'];
  
  sliders.forEach(sliderName => {
    const slider = document.getElementById(`${sliderName}-slider`);
    const valueDisplay = document.getElementById(`${sliderName}-value`);
    
    if (slider && valueDisplay) {
      slider.addEventListener('input', (e) => {
        const value = e.target.value;
        valueDisplay.textContent = value;
        journalData.intensities[sliderName] = parseInt(value);
        
        // Update slider color based on value
        const percentage = (value / 10) * 100;
        slider.style.background = `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${percentage}%, var(--color-border) ${percentage}%, var(--color-border) 100%)`;
      });
      
      // Initialize slider appearance
      slider.dispatchEvent(new Event('input'));
    }
  });
}

function resetSliders() {
  const sliders = ['stress', 'energy', 'social', 'physical', 'clarity'];
  
  sliders.forEach(sliderName => {
    const slider = document.getElementById(`${sliderName}-slider`);
    const valueDisplay = document.getElementById(`${sliderName}-value`);
    
    if (slider && valueDisplay) {
      slider.value = 5;
      valueDisplay.textContent = '5';
      journalData.intensities[sliderName] = 5;
      
      // Reset slider appearance
      slider.dispatchEvent(new Event('input'));
    }
  });
}

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
  
  if (textarea && wordCount) {
    textarea.value = '';
    wordCount.textContent = '0 words';
    journalData.text = '';
  }
}

function setRandomPrompt() {
  const promptElement = document.getElementById('journal-prompt');
  if (promptElement) {
    const randomPrompt = journalPrompts[Math.floor(Math.random() * journalPrompts.length)];
    promptElement.querySelector('p').innerHTML = `<strong>Prompt:</strong> ${randomPrompt}`;
  }
}

// Save Functions
async function saveDraft() {
  if (!currentUser) return;
  
  try {
    const draftData = {
      ...journalData,
      emotions: selectedEmotions,
      userId: currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      isDraft: true
    };
    
    await db.collection('entries').add(draftData);
    alert('Draft saved successfully!');
  } catch (error) {
    console.error('Error saving draft:', error);
    alert('Failed to save draft');
  }
}

async function saveEntry() {
  if (!currentUser) return;
  
  if (selectedEmotions.length === 0) {
    alert('Please select at least one emotion');
    return;
  }
  
  if (!journalData.text.trim()) {
    alert('Please write something in your journal');
    return;
  }
  
  try {
    const entryData = {
      ...journalData,
      emotions: selectedEmotions,
      userId: currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      isDraft: false,
      sentiment: analyzeSentiment(journalData.text)
    };
    
    await db.collection('entries').add(entryData);
    showSuccessModal();
  } catch (error) {
    console.error('Error saving entry:', error);
    alert('Failed to save entry');
  }
}

function analyzeSentiment(text) {
  // Simple sentiment analysis
  const positiveWords = ['happy', 'joy', 'love', 'excited', 'grateful', 'peaceful', 'content', 'amazing', 'wonderful', 'great'];
  const negativeWords = ['sad', 'angry', 'frustrated', 'worried', 'anxious', 'terrible', 'awful', 'hate', 'angry', 'depressed'];
  
  const words = text.toLowerCase().split(/\s+/);
  let positiveScore = 0;
  let negativeScore = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) positiveScore++;
    if (negativeWords.includes(word)) negativeScore++;
  });
  
  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
}

function showSuccessModal() {
  const modal = document.getElementById('success-modal');
  modal.classList.remove('hidden');
}

function hideSuccessModal() {
  const modal = document.getElementById('success-modal');
  modal.classList.add('hidden');
  showHomeScreen();
}

// History Functions
async function loadInsights() {
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
    
    updateStats(entries);
    createEmotionChart(entries);
    createWeeklyChart(entries);
    createMoodCalendar(entries);
  } catch (error) {
    console.error('Error loading insights:', error);
  }
}

function updateStats(entries) {
  const totalEntries = entries.length;
  const currentStreak = calculateStreak(entries);
  const avgMood = calculateAverageMood(entries);
  
  document.getElementById('total-entries').textContent = totalEntries;
  document.getElementById('current-streak').textContent = currentStreak;
  document.getElementById('avg-mood').textContent = avgMood;
}

function calculateStreak(entries) {
  if (entries.length === 0) return 0;
  
  const today = new Date();
  let streak = 0;
  let checkDate = new Date(today);
  
  for (let i = 0; i < entries.length; i++) {
    const entryDate = entries[i].createdAt;
    if (!entryDate) continue;
    
    const entryDay = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());
    const checkDay = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
    
    if (entryDay.getTime() === checkDay.getTime()) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (entryDay.getTime() < checkDay.getTime()) {
      break;
    }
  }
  
  return streak;
}

function calculateAverageMood(entries) {
  if (entries.length === 0) return '-';
  
  const sentimentScores = { positive: 1, neutral: 0, negative: -1 };
  const totalScore = entries.reduce((sum, entry) => {
    return sum + (sentimentScores[entry.sentiment] || 0);
  }, 0);
  
  const avgScore = totalScore / entries.length;
  
  if (avgScore > 0.3) return 'Positive';
  if (avgScore < -0.3) return 'Negative';
  return 'Neutral';
}

function createEmotionChart(entries) {
  const ctx = document.getElementById('emotion-chart');
  if (!ctx) return;
  
  const emotionCounts = {};
  entries.forEach(entry => {
    entry.emotions?.forEach(emotion => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
  });
  
  const sortedEmotions = Object.entries(emotionCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: sortedEmotions.map(([emotion]) => emotion),
      datasets: [{
        data: sortedEmotions.map(([,count]) => count),
        backgroundColor: [
          '#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F',
          '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#e0e0e0',
            padding: 20
          }
        }
      }
    }
  });
}

function createWeeklyChart(entries) {
  const ctx = document.getElementById('weekly-chart');
  if (!ctx) return;
  
  const last7Days = Array.from({length: 7}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });
  
  const dailyData = last7Days.map(date => {
    const dayEntries = entries.filter(entry => {
      if (!entry.createdAt) return false;
      const entryDate = entry.createdAt;
      return entryDate.toDateString() === date.toDateString();
    });
    
    const avgStress = dayEntries.length > 0 
      ? dayEntries.reduce((sum, entry) => sum + (entry.intensities?.stress || 5), 0) / dayEntries.length
      : 0;
    
    const avgEnergy = dayEntries.length > 0
      ? dayEntries.reduce((sum, entry) => sum + (entry.intensities?.energy || 5), 0) / dayEntries.length
      : 0;
    
    return { date, stress: avgStress, energy: avgEnergy };
  });
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: dailyData.map(d => d.date.toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [
        {
          label: 'Stress Level',
          data: dailyData.map(d => d.stress),
          borderColor: '#1FB8CD',
          backgroundColor: 'rgba(31, 184, 205, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Energy Level',
          data: dailyData.map(d => d.energy),
          borderColor: '#FFC185',
          backgroundColor: 'rgba(255, 193, 133, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#e0e0e0'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
          ticks: {
            color: '#a0a0a0'
          },
          grid: {
            color: '#333333'
          }
        },
        x: {
          ticks: {
            color: '#a0a0a0'
          },
          grid: {
            color: '#333333'
          }
        }
      }
    }
  });
}

function createMoodCalendar(entries) {
  const calendar = document.getElementById('mood-calendar');
  if (!calendar) return;
  
  calendar.innerHTML = '';
  
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  // Add day headers
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayHeaders.forEach(day => {
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.textContent = day;
    header.style.fontWeight = 'bold';
    header.style.textAlign = 'center';
    header.style.padding = '8px';
    header.style.color = '#a0a0a0';
    calendar.appendChild(header);
  });
  
  // Add calendar days
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = date.getDate();
    
    if (date.getMonth() !== currentMonth) {
      dayElement.style.opacity = '0.3';
    }
    
    // Check if there are entries for this date
    const dayEntries = entries.filter(entry => {
      if (!entry.createdAt) return false;
      const entryDate = entry.createdAt;
      return entryDate.toDateString() === date.toDateString();
    });
    
    if (dayEntries.length > 0) {
      dayElement.classList.add('has-entry');
      const avgMood = calculateDayMood(dayEntries);
      dayElement.style.setProperty('--mood-color', getMoodColor(avgMood));
    }
    
    calendar.appendChild(dayElement);
  }
}

function calculateDayMood(entries) {
  const sentimentScores = { positive: 1, neutral: 0, negative: -1 };
  const totalScore = entries.reduce((sum, entry) => {
    return sum + (sentimentScores[entry.sentiment] || 0);
  }, 0);
  
  return totalScore / entries.length;
}

function getMoodColor(moodScore) {
  if (moodScore > 0.3) return '#00ff88';  // Green for positive
  if (moodScore < -0.3) return '#ff6b6b'; // Red for negative
  return '#00d4ff'; // Blue for neutral
}

async function loadEntries() {
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
  } catch (error) {
    console.error('Error loading entries:', error);
  }
}

function displayEntries(entries) {
  const entriesList = document.getElementById('entries-list');
  if (!entriesList) return;
  
  entriesList.innerHTML = '';
  
  if (entries.length === 0) {
    entriesList.innerHTML = '<p style="text-align: center; color: #a0a0a0; padding: 40px;">No entries found. Start journaling to see your entries here!</p>';
    return;
  }
  
  entries.forEach(entry => {
    const entryElement = document.createElement('div');
    entryElement.className = 'entry-item';
    
    const formattedDate = entry.createdAt 
      ? entry.createdAt.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Unknown date';
    
    const emotionsHtml = entry.emotions?.slice(0, 3).map(emotion => 
      `<span class="entry-emotion">${emotion}</span>`
    ).join('') || '';
    
    const preview = entry.text ? entry.text.substring(0, 150) + (entry.text.length > 150 ? '...' : '') : '';
    
    entryElement.innerHTML = `
      <div class="entry-header">
        <div class="entry-date">${formattedDate}</div>
      </div>
      <div class="entry-emotions">
        ${emotionsHtml}
        ${entry.emotions?.length > 3 ? `<span class="entry-emotion">+${entry.emotions.length - 3} more</span>` : ''}
      </div>
      <div class="entry-preview">${preview}</div>
    `;
    
    entriesList.appendChild(entryElement);
  });
}

// Event Listeners Setup
function setupEventListeners() {
  setupAuthEventListeners();
  
  // Navigation
  const journalOption = document.getElementById('journal-option');
  const historyOption = document.getElementById('history-option');
  const backToHomeBtn = document.getElementById('back-to-home');
  const backToHomeHistoryBtn = document.getElementById('back-to-home-history');
  
  if (journalOption) journalOption.addEventListener('click', showJournalScreen);
  if (historyOption) historyOption.addEventListener('click', showHistoryScreen);
  if (backToHomeBtn) backToHomeBtn.addEventListener('click', showHomeScreen);
  if (backToHomeHistoryBtn) backToHomeHistoryBtn.addEventListener('click', showHomeScreen);
  
  // Journal flow
  const emotionsNextBtn = document.getElementById('emotions-next');
  const intensityBackBtn = document.getElementById('intensity-back');
  const intensityNextBtn = document.getElementById('intensity-next');
  const writingBackBtn = document.getElementById('writing-back');
  
  if (emotionsNextBtn) emotionsNextBtn.addEventListener('click', () => showStep(2));
  if (intensityBackBtn) intensityBackBtn.addEventListener('click', () => showStep(1));
  if (intensityNextBtn) intensityNextBtn.addEventListener('click', () => showStep(3));
  if (writingBackBtn) writingBackBtn.addEventListener('click', () => showStep(2));
  
  // Journal actions
  const saveDraftBtn = document.getElementById('save-draft');
  const saveEntryBtn = document.getElementById('save-entry');
  
  if (saveDraftBtn) saveDraftBtn.addEventListener('click', saveDraft);
  if (saveEntryBtn) saveEntryBtn.addEventListener('click', saveEntry);
  
  // Modal
  const closeSuccessModalBtn = document.getElementById('close-success-modal');
  if (closeSuccessModalBtn) closeSuccessModalBtn.addEventListener('click', hideSuccessModal);
  
  // History tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.target.dataset.tab;
      switchTab(tab);
    });
  });
  
  // Search and filter
  const searchEntriesInput = document.getElementById('search-entries');
  const filterEntriesSelect = document.getElementById('filter-entries');
  
  if (searchEntriesInput) searchEntriesInput.addEventListener('input', filterEntries);
  if (filterEntriesSelect) filterEntriesSelect.addEventListener('change', filterEntries);
  
  // Initialize components
  setupEmotionCircles();
  setupSliders();
  setupJournalEditor();
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
  const tabContent = document.getElementById(`${tabName}-tab`);
  
  if (tabBtn) tabBtn.classList.add('active');
  if (tabContent) tabContent.classList.add('active');
  
  if (tabName === 'insights') {
    loadInsights();
  } else if (tabName === 'entries') {
    loadEntries();
  }
}

function filterEntries() {
  // This would implement search and filter functionality
  // For now, just reload entries
  loadEntries();
}