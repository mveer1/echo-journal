// ════════════════════════════════════════════
// AUTHENTICATION
// ════════════════════════════════════════════

import { auth, firebaseApp } from './config.js';
import { setCurrentUser, resetState } from './state.js';
import { showHomeScreen, showAuthScreen, hideLoadingScreen, showLoadingScreen } from './ui.js';

// We need a way to trigger data loading when auth changes.
// We'll export a setup function that accepts a callback.
let onLoginSuccess = null;

export function setOnLoginSuccess(callback) {
    onLoginSuccess = callback;
}

export function initializeAuth() {
    showLoadingScreen();
    auth.onAuthStateChanged(user => {
        if (user) {
            setCurrentUser(user);
            // Wait a bit for the animation
            setTimeout(() => {
                hideLoadingScreen();
                showHomeScreen();
                if (onLoginSuccess) onLoginSuccess();
            }, 3000);
        } else {
            setCurrentUser(null);
            setTimeout(() => {
                hideLoadingScreen();
                showAuthScreen();
            }, 3000);
        }
    });
}

export function setupAuthEventListeners() {
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
    const provider = new firebaseApp.auth.GoogleAuthProvider();
    try { await auth.signInWithPopup(provider); }
    catch (error) { alert('Google sign-in failed: ' + error.message); }
}

export async function handleLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    const logoutText = logoutBtn?.querySelector('.logout-text');
    const logoutLoading = logoutBtn?.querySelector('.logout-loading');
    try {
        if (logoutText) logoutText.classList.add('hidden');
        if (logoutLoading) logoutLoading.classList.remove('hidden');
        if (logoutBtn) logoutBtn.disabled = true;
        await auth.signOut();
        setCurrentUser(null);
        resetState();
    } catch (error) {
        alert('Logout failed: ' + error.message);
    } finally {
        if (logoutText) logoutText.classList.remove('hidden');
        if (logoutLoading) logoutLoading.classList.add('hidden');
        if (logoutBtn) logoutBtn.disabled = false;
    }
}
