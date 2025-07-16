// firebase-login-components.js - Updated login components for Firebase Auth
(function(global) {
    'use strict';

    const { useState, useEffect } = React;

    // Login Form Component - Updated for Firebase
    function LoginForm({ onLogin, onSwitchToRegister, onForgotPassword, loading = false }) {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [error, setError] = useState('');

        const handleSubmit = async (e) => {
            e.preventDefault();
            setError('');

            if (!email.trim() || !password.trim()) {
                setError('Please enter both email and password');
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setError('Please enter a valid email address');
                return;
            }

            const result = await onLogin(email.trim(), password);
            if (!result.success) {
                setError(result.error || 'Login failed');
            }
        };

        const handleGoogleLogin = async () => {
            setError('');
            const result = await global.firebaseAuthService.loginWithGoogle();
            if (!result.success) {
                setError(result.error || 'Google login failed');
            }
        };

        return React.createElement(
            'div',
            { className: 'fullscreen-center' },
            React.createElement(
                'div',
                { className: 'card-container glass-card fade-in' },
                React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'h2',
                        { className: 'card-title' },
                        'Welcome Back'
                    ),
                    React.createElement(
                        'p',
                        { className: 'card-subtitle' },
                        'Sign in to your mood journal'
                    ),
                    React.createElement(
                        'form',
                        { onSubmit: handleSubmit },
                        React.createElement('input', {
                            type: 'email',
                            className: 'text-input',
                            placeholder: 'Email address',
                            value: email,
                            onChange: (e) => setEmail(e.target.value),
                            disabled: loading,
                            autoCapitalize: 'none',
                            autoComplete: 'email'
                        }),
                        React.createElement('input', {
                            type: 'password',
                            className: 'text-input',
                            placeholder: 'Password',
                            value: password,
                            onChange: (e) => setPassword(e.target.value),
                            disabled: loading,
                            autoComplete: 'current-password',
                            style: { marginTop: '1rem' }
                        }),
                        error && React.createElement(
                            'div',
                            {
                                className: 'error-message',
                                style: {
                                    color: 'var(--color-error)',
                                    fontSize: '0.875rem',
                                    marginTop: '0.5rem',
                                    textAlign: 'center'
                                }
                            },
                            error
                        ),
                        React.createElement(
                            'button',
                            {
                                type: 'submit',
                                className: 'glass-button',
                                disabled: loading,
                                style: {
                                    width: '100%',
                                    marginTop: '1.5rem',
                                    opacity: loading ? 0.6 : 1
                                }
                            },
                            loading ? 'Signing in...' : 'Sign In'
                        )
                    ),
                    // Google Sign In Button
                    React.createElement(
                        'div',
                        { style: { margin: '1rem 0', textAlign: 'center' } },
                        React.createElement(
                            'div',
                            { 
                                style: { 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    margin: '1rem 0' 
                                } 
                            },
                            React.createElement('div', { 
                                style: { 
                                    flex: 1, 
                                    height: '1px', 
                                    background: 'var(--color-border)' 
                                } 
                            }),
                            React.createElement('span', { 
                                style: { 
                                    padding: '0 1rem', 
                                    color: 'var(--color-text-secondary)',
                                    fontSize: '0.875rem'
                                } 
                            }, 'or'),
                            React.createElement('div', { 
                                style: { 
                                    flex: 1, 
                                    height: '1px', 
                                    background: 'var(--color-border)' 
                                } 
                            })
                        ),
                        React.createElement(
                            'button',
                            {
                                type: 'button',
                                className: 'glass-button google-button',
                                onClick: handleGoogleLogin,
                                disabled: loading,
                                style: {
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }
                            },
                            React.createElement('span', { style: { fontSize: '1.2rem' } }, '🔍'),
                            'Continue with Google'
                        )
                    ),
                    React.createElement(
                        'div',
                        {
                            style: {
                                textAlign: 'center',
                                marginTop: '1.5rem'
                            }
                        },
                        React.createElement(
                            'button',
                            {
                                type: 'button',
                                className: 'skip-button',
                                onClick: onForgotPassword,
                                disabled: loading,
                                style: {
                                    color: 'var(--color-text-secondary)',
                                    marginBottom: '0.5rem'
                                }
                            },
                            'Forgot Password?'
                        ),
                        React.createElement('br'),
                        React.createElement(
                            'span',
                            {
                                style: {
                                    color: 'var(--color-text-secondary)',
                                    fontSize: '0.875rem'
                                }
                            },
                            'Don\'t have an account? '
                        ),
                        React.createElement(
                            'button',
                            {
                                type: 'button',
                                className: 'skip-button',
                                onClick: onSwitchToRegister,
                                disabled: loading,
                                style: {
                                    color: 'var(--color-primary)',
                                    textDecoration: 'underline'
                                }
                            },
                            'Create Account'
                        )
                    )
                )
            )
        );
    }

    // Registration Form Component - Updated for Firebase
    function RegisterForm({ onRegister, onSwitchToLogin, loading = false }) {
        const [email, setEmail] = useState('');
        const [displayName, setDisplayName] = useState('');
        const [password, setPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');
        const [error, setError] = useState('');

        const handleSubmit = async (e) => {
            e.preventDefault();
            setError('');

            if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
                setError('Please fill in all required fields');
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setError('Please enter a valid email address');
                return;
            }

            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
            }

            if (password.length < 6) {
                setError('Password must be at least 6 characters long');
                return;
            }

            const result = await onRegister(email.trim(), password, displayName.trim() || email.split('@')[0]);
            if (!result.success) {
                setError(result.error || 'Registration failed');
            }
        };

        const handleGoogleRegister = async () => {
            setError('');
            const result = await global.firebaseAuthService.loginWithGoogle();
            if (!result.success) {
                setError(result.error || 'Google registration failed');
            }
        };

        return React.createElement(
            'div',
            { className: 'fullscreen-center' },
            React.createElement(
                'div',
                { className: 'card-container glass-card fade-in' },
                React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'h2',
                        { className: 'card-title' },
                        'Create Account'
                    ),
                    React.createElement(
                        'p',
                        { className: 'card-subtitle' },
                        'Join to start your mood journaling journey'
                    ),
                    React.createElement(
                        'form',
                        { onSubmit: handleSubmit },
                        React.createElement('input', {
                            type: 'email',
                            className: 'text-input',
                            placeholder: 'Email address *',
                            value: email,
                            onChange: (e) => setEmail(e.target.value),
                            disabled: loading,
                            autoCapitalize: 'none',
                            autoComplete: 'email'
                        }),
                        React.createElement('input', {
                            type: 'text',
                            className: 'text-input',
                            placeholder: 'Display Name (optional)',
                            value: displayName,
                            onChange: (e) => setDisplayName(e.target.value),
                            disabled: loading,
                            autoComplete: 'name',
                            style: { marginTop: '1rem' }
                        }),
                        React.createElement('input', {
                            type: 'password',
                            className: 'text-input',
                            placeholder: 'Password *',
                            value: password,
                            onChange: (e) => setPassword(e.target.value),
                            disabled: loading,
                            autoComplete: 'new-password',
                            style: { marginTop: '1rem' }
                        }),
                        React.createElement('input', {
                            type: 'password',
                            className: 'text-input',
                            placeholder: 'Confirm Password *',
                            value: confirmPassword,
                            onChange: (e) => setConfirmPassword(e.target.value),
                            disabled: loading,
                            autoComplete: 'new-password',
                            style: { marginTop: '1rem' }
                        }),
                        error && React.createElement(
                            'div',
                            {
                                className: 'error-message',
                                style: {
                                    color: 'var(--color-error)',
                                    fontSize: '0.875rem',
                                    marginTop: '0.5rem',
                                    textAlign: 'center'
                                }
                            },
                            error
                        ),
                        React.createElement(
                            'button',
                            {
                                type: 'submit',
                                className: 'glass-button',
                                disabled: loading,
                                style: {
                                    width: '100%',
                                    marginTop: '1.5rem',
                                    opacity: loading ? 0.6 : 1
                                }
                            },
                            loading ? 'Creating Account...' : 'Create Account'
                        )
                    ),
                    // Google Sign Up Button
                    React.createElement(
                        'div',
                        { style: { margin: '1rem 0', textAlign: 'center' } },
                        React.createElement(
                            'div',
                            { 
                                style: { 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    margin: '1rem 0' 
                                } 
                            },
                            React.createElement('div', { 
                                style: { 
                                    flex: 1, 
                                    height: '1px', 
                                    background: 'var(--color-border)' 
                                } 
                            }),
                            React.createElement('span', { 
                                style: { 
                                    padding: '0 1rem', 
                                    color: 'var(--color-text-secondary)',
                                    fontSize: '0.875rem'
                                } 
                            }, 'or'),
                            React.createElement('div', { 
                                style: { 
                                    flex: 1, 
                                    height: '1px', 
                                    background: 'var(--color-border)' 
                                } 
                            })
                        ),
                        React.createElement(
                            'button',
                            {
                                type: 'button',
                                className: 'glass-button google-button',
                                onClick: handleGoogleRegister,
                                disabled: loading,
                                style: {
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }
                            },
                            React.createElement('span', { style: { fontSize: '1.2rem' } }, '🔍'),
                            'Continue with Google'
                        )
                    ),
                    React.createElement(
                        'div',
                        {
                            style: {
                                textAlign: 'center',
                                marginTop: '1.5rem'
                            }
                        },
                        React.createElement(
                            'span',
                            {
                                style: {
                                    color: 'var(--color-text-secondary)',
                                    fontSize: '0.875rem'
                                }
                            },
                            'Already have an account? '
                        ),
                        React.createElement(
                            'button',
                            {
                                type: 'button',
                                className: 'skip-button',
                                onClick: onSwitchToLogin,
                                disabled: loading,
                                style: {
                                    color: 'var(--color-primary)',
                                    textDecoration: 'underline'
                                }
                            },
                            'Sign In'
                        )
                    )
                )
            )
        );
    }

    // Forgot Password Form Component
    function ForgotPasswordForm({ onResetPassword, onBack, loading = false }) {
        const [email, setEmail] = useState('');
        const [error, setError] = useState('');
        const [success, setSuccess] = useState(false);

        const handleSubmit = async (e) => {
            e.preventDefault();
            setError('');
            setSuccess(false);

            if (!email.trim()) {
                setError('Please enter your email address');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setError('Please enter a valid email address');
                return;
            }

            const result = await onResetPassword(email.trim());
            if (result.success) {
                setSuccess(true);
            } else {
                setError(result.error || 'Failed to send reset email');
            }
        };

        return React.createElement(
            'div',
            { className: 'fullscreen-center' },
            React.createElement(
                'div',
                { className: 'card-container glass-card fade-in' },
                React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'h2',
                        { className: 'card-title' },
                        'Reset Password'
                    ),
                    React.createElement(
                        'p',
                        { className: 'card-subtitle' },
                        success ? 'Check your email for reset instructions' : 'Enter your email to reset your password'
                    ),
                    !success && React.createElement(
                        'form',
                        { onSubmit: handleSubmit },
                        React.createElement('input', {
                            type: 'email',
                            className: 'text-input',
                            placeholder: 'Email address',
                            value: email,
                            onChange: (e) => setEmail(e.target.value),
                            disabled: loading,
                            autoCapitalize: 'none',
                            autoComplete: 'email'
                        }),
                        error && React.createElement(
                            'div',
                            {
                                className: 'error-message',
                                style: {
                                    color: 'var(--color-error)',
                                    fontSize: '0.875rem',
                                    marginTop: '0.5rem',
                                    textAlign: 'center'
                                }
                            },
                            error
                        ),
                        React.createElement(
                            'button',
                            {
                                type: 'submit',
                                className: 'glass-button',
                                disabled: loading,
                                style: {
                                    width: '100%',
                                    marginTop: '1.5rem',
                                    opacity: loading ? 0.6 : 1
                                }
                            },
                            loading ? 'Sending...' : 'Send Reset Email'
                        )
                    ),
                    React.createElement(
                        'div',
                        {
                            style: {
                                textAlign: 'center',
                                marginTop: '1.5rem'
                            }
                        },
                        React.createElement(
                            'button',
                            {
                                type: 'button',
                                className: 'skip-button',
                                onClick: onBack,
                                disabled: loading,
                                style: {
                                    color: 'var(--color-primary)',
                                    textDecoration: 'underline'
                                }
                            },
                            'Back to Sign In'
                        )
                    )
                )
            )
        );
    }

    // Authentication Container Component - Updated for Firebase
    function AuthContainer({ authService, onAuthSuccess }) {
        const [view, setView] = useState('login'); // 'login', 'register', 'forgot'
        const [loading, setLoading] = useState(false);

        const handleLogin = async (email, password) => {
            setLoading(true);
            try {
                const result = await authService.loginUser(email, password);
                if (result.success) {
                    onAuthSuccess(result.user);
                }
                return result;
            } catch (error) {
                return { success: false, error: error.message };
            } finally {
                setLoading(false);
            }
        };

        const handleRegister = async (email, password, displayName) => {
            setLoading(true);
            try {
                const result = await authService.registerUser(email, password, displayName);
                if (result.success) {
                    onAuthSuccess(result.user);
                }
                return result;
            } catch (error) {
                return { success: false, error: error.message };
            } finally {
                setLoading(false);
            }
        };

        const handleForgotPassword = async (email) => {
            setLoading(true);
            try {
                const result = await authService.resetPassword(email);
                return result;
            } catch (error) {
                return { success: false, error: error.message };
            } finally {
                setLoading(false);
            }
        };

        let content = null;
        switch (view) {
            case 'login':
                content = React.createElement(LoginForm, {
                    onLogin: handleLogin,
                    onSwitchToRegister: () => setView('register'),
                    onForgotPassword: () => setView('forgot'),
                    loading: loading
                });
                break;
            case 'register':
                content = React.createElement(RegisterForm, {
                    onRegister: handleRegister,
                    onSwitchToLogin: () => setView('login'),
                    loading: loading
                });
                break;
            case 'forgot':
                content = React.createElement(ForgotPasswordForm, {
                    onResetPassword: handleForgotPassword,
                    onBack: () => setView('login'),
                    loading: loading
                });
                break;
        }

        return content;
    }

    // Export components to global namespace
    global.LoginForm = LoginForm;
    global.RegisterForm = RegisterForm;
    global.ForgotPasswordForm = ForgotPasswordForm;
    global.AuthContainer = AuthContainer;

})(typeof window !== 'undefined' ? window : this);