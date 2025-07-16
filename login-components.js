(function(global) {
    'use strict';

    const { useState, useEffect } = React;

    // Login Form Component
    function LoginForm({ onLogin, onSwitchToRegister, loading = false }) {
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        const [error, setError] = useState('');

        const handleSubmit = async (e) => {
            e.preventDefault();
            setError('');
            
            if (!username.trim() || !password.trim()) {
                setError('Please enter both username and password');
                return;
            }

            const result = await onLogin(username.trim(), password);
            if (!result.success) {
                setError(result.error || 'Login failed');
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
                            type: 'text',
                            className: 'text-input',
                            placeholder: 'Username',
                            value: username,
                            onChange: (e) => setUsername(e.target.value),
                            disabled: loading,
                            autoCapitalize: 'none',
                            autoComplete: 'username'
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
                    React.createElement(
                        'div',
                        { 
                            style: { 
                                textAlign: 'center',
                                marginTop: '1.5rem'
                            }
                        },
                        React.createElement(
                            'p',
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
                                    textDecoration: 'underline',
                                    marginTop: '0.5rem'
                                }
                            },
                            'Create Account'
                        )
                    )
                )
            )
        );
    }

    // Registration Form Component
    function RegisterForm({ onRegister, onSwitchToLogin, loading = false }) {
        const [username, setUsername] = useState('');
        const [displayName, setDisplayName] = useState('');
        const [password, setPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');
        const [error, setError] = useState('');

        const handleSubmit = async (e) => {
            e.preventDefault();
            setError('');
            
            if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
                setError('Please fill in all required fields');
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

            const result = await onRegister(username.trim(), password, displayName.trim() || username.trim());
            if (!result.success) {
                setError(result.error || 'Registration failed');
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
                            type: 'text',
                            className: 'text-input',
                            placeholder: 'Username *',
                            value: username,
                            onChange: (e) => setUsername(e.target.value),
                            disabled: loading,
                            autoCapitalize: 'none',
                            autoComplete: 'username'
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
                    React.createElement(
                        'div',
                        { 
                            style: { 
                                textAlign: 'center',
                                marginTop: '1.5rem'
                            }
                        },
                        React.createElement(
                            'p',
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
                                    textDecoration: 'underline',
                                    marginTop: '0.5rem'
                                }
                            },
                            'Sign In'
                        )
                    )
                )
            )
        );
    }

    // User Verification Component (for existing username)
    function UserVerification({ username, displayName, onConfirm, onCancel, loading = false }) {
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
                        'Is this you?'
                    ),
                    React.createElement(
                        'div',
                        { 
                            style: { 
                                textAlign: 'center',
                                margin: '2rem 0'
                            }
                        },
                        React.createElement(
                            'div',
                            { 
                                style: { 
                                    fontSize: '3rem',
                                    marginBottom: '1rem'
                                }
                            },
                            '👤'
                        ),
                        React.createElement(
                            'h3',
                            { 
                                style: { 
                                    color: 'var(--color-text)',
                                    marginBottom: '0.5rem'
                                }
                            },
                            displayName
                        ),
                        React.createElement(
                            'p',
                            { 
                                style: { 
                                    color: 'var(--color-text-secondary)',
                                    fontSize: '0.875rem'
                                }
                            },
                            '@' + username
                        )
                    ),
                    React.createElement(
                        'div',
                        { 
                            style: { 
                                display: 'flex',
                                gap: '1rem',
                                marginTop: '2rem'
                            }
                        },
                        React.createElement(
                            'button',
                            {
                                type: 'button',
                                className: 'glass-button',
                                onClick: onCancel,
                                disabled: loading,
                                style: { 
                                    flex: 1,
                                    backgroundColor: 'var(--color-secondary)',
                                    opacity: loading ? 0.6 : 1
                                }
                            },
                            'No, different username'
                        ),
                        React.createElement(
                            'button',
                            {
                                type: 'button',
                                className: 'glass-button',
                                onClick: onConfirm,
                                disabled: loading,
                                style: { 
                                    flex: 1,
                                    backgroundColor: 'var(--color-primary)',
                                    opacity: loading ? 0.6 : 1
                                }
                            },
                            'Yes, that\'s me'
                        )
                    )
                )
            )
        );
    }

    // Authentication Container Component
    function AuthContainer({ authService, onAuthSuccess }) {
        const [view, setView] = useState('login'); // 'login', 'register', 'verify'
        const [loading, setLoading] = useState(false);
        const [pendingUsername, setPendingUsername] = useState(null);
        const [pendingUser, setPendingUser] = useState(null);

        const handleLogin = async (username, password) => {
            setLoading(true);
            try {
                const result = await authService.loginUser(username, password);
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

        const handleRegister = async (username, password, displayName) => {
            setLoading(true);
            try {
                const result = await authService.registerUser(username, password, displayName);
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

        const handleUsernameCheck = async (username) => {
            const user = await authService.getUserByUsername(username);
            if (user) {
                setPendingUser(user);
                setPendingUsername(username);
                setView('verify');
            } else {
                setView('register');
            }
        };

        const handleVerificationConfirm = () => {
            setView('login');
        };

        const handleVerificationCancel = () => {
            setPendingUser(null);
            setPendingUsername(null);
            setView('login');
        };

        let content = null;
        switch (view) {
            case 'login':
                content = React.createElement(LoginForm, {
                    onLogin: handleLogin,
                    onSwitchToRegister: () => setView('register'),
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
            case 'verify':
                content = React.createElement(UserVerification, {
                    username: pendingUser?.username || '',
                    displayName: pendingUser?.displayName || '',
                    onConfirm: handleVerificationConfirm,
                    onCancel: handleVerificationCancel,
                    loading: loading
                });
                break;
        }

        return content;
    }

    // Export components to global namespace
    global.LoginForm = LoginForm;
    global.RegisterForm = RegisterForm;
    global.UserVerification = UserVerification;
    global.AuthContainer = AuthContainer;

})(typeof window !== 'undefined' ? window : this);