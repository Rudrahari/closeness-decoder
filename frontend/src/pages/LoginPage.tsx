import { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'signin' | 'signup';

const LoginPage = () => {
    const { signIn, signUp, isLoading, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [authMode, setAuthMode] = useState<AuthMode>('signin');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, isLoading, navigate]);

    const handleGoogleSuccess = async (response: CredentialResponse) => {
        setError(null);

        if (response.credential) {
            try {
                if (authMode === 'signup') {
                    await signUp(response.credential);
                } else {
                    await signIn(response.credential);
                }
                navigate('/dashboard');
            } catch (err: unknown) {
                if (err && typeof err === 'object' && 'response' in err) {
                    const axiosError = err as { response?: { data?: { error?: string } } };
                    setError(axiosError.response?.data?.error || 'Authentication failed. Please try again.');
                } else {
                    setError('Authentication failed. Please try again.');
                }
            }
        }
    };

    const handleGoogleError = () => {
        setError('Google authentication failed. Please try again.');
    };

    return (
        <div style={styles.page}>
            {/* Header */}
            <header style={styles.header}>
                <span style={styles.logo}>Closeness</span>
            </header>

            {/* Main Content */}
            <main style={styles.main}>
                <div style={styles.card}>
                    <h1 style={styles.title}>
                        {authMode === 'signin' ? 'Welcome back' : 'Get started'}
                    </h1>
                    <p style={styles.subtitle}>
                        {authMode === 'signin'
                            ? 'Sign in to share files securely'
                            : 'Create an account to start sharing'}
                    </p>

                    {/* Auth Mode Toggle */}
                    <div style={styles.toggleRow}>
                        <button
                            style={{
                                ...styles.toggleBtn,
                                ...(authMode === 'signin' ? styles.toggleBtnActive : {}),
                            }}
                            onClick={() => setAuthMode('signin')}
                        >
                            Sign In
                        </button>
                        <button
                            style={{
                                ...styles.toggleBtn,
                                ...(authMode === 'signup' ? styles.toggleBtnActive : {}),
                            }}
                            onClick={() => setAuthMode('signup')}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div style={styles.errorBox}>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Google Auth Button */}
                    {isLoading ? (
                        <div style={styles.loadingBox}>
                            <div style={styles.spinner}></div>
                            <span style={styles.loadingText}>Authenticating...</span>
                        </div>
                    ) : (
                        <div style={styles.googleBtnWrapper}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                theme="filled_black"
                                size="large"
                                text={authMode === 'signin' ? 'signin_with' : 'signup_with'}
                                shape="rectangular"
                                width="300"
                            />
                        </div>
                    )}

                    {/* Footer Link */}
                    <p style={styles.footerText}>
                        {authMode === 'signin' ? (
                            <>
                                Don't have an account?{' '}
                                <button style={styles.linkBtn} onClick={() => setAuthMode('signup')}>
                                    Sign up
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <button style={styles.linkBtn} onClick={() => setAuthMode('signin')}>
                                    Sign in
                                </button>
                            </>
                        )}
                    </p>
                </div>

                {/* Feature highlights */}
                <div style={styles.features}>
                    <div style={styles.feature}>
                        <span style={styles.featureIcon}>🔒</span>
                        <span style={styles.featureText}>Secure presigned URLs</span>
                    </div>
                    <div style={styles.feature}>
                        <span style={styles.featureIcon}>⏱</span>
                        <span style={styles.featureText}>Auto-expiring links</span>
                    </div>
                    <div style={styles.feature}>
                        <span style={styles.featureIcon}>📊</span>
                        <span style={styles.featureText}>View tracking</span>
                    </div>
                </div>
            </main>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0b 0%, #1a1a1b 100%)',
        fontFamily: 'system-ui, sans-serif',
    },
    header: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid #2a2a2b',
    },
    logo: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#f5f5f5',
    },
    main: {
        maxWidth: '400px',
        margin: '60px auto',
        padding: '0 24px',
    },
    card: {
        background: '#141415',
        border: '1px solid #2a2a2b',
        borderRadius: '12px',
        padding: '40px 32px',
        textAlign: 'center',
    },
    title: {
        fontSize: '24px',
        fontWeight: '600',
        margin: '0 0 8px 0',
        color: '#f5f5f5',
    },
    subtitle: {
        fontSize: '15px',
        color: '#888',
        margin: '0 0 28px 0',
    },
    toggleRow: {
        display: 'flex',
        background: '#1a1a1b',
        borderRadius: '8px',
        padding: '4px',
        marginBottom: '24px',
    },
    toggleBtn: {
        flex: 1,
        padding: '10px 16px',
        border: 'none',
        borderRadius: '6px',
        background: 'transparent',
        color: '#888',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    toggleBtnActive: {
        background: '#2a2a2b',
        color: '#f5f5f5',
    },
    errorBox: {
        padding: '12px 16px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '8px',
        color: '#ef4444',
        fontSize: '14px',
        marginBottom: '20px',
    },
    loadingBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '20px 0',
    },
    spinner: {
        width: '32px',
        height: '32px',
        border: '3px solid #2a2a2b',
        borderTop: '3px solid #2dd4bf',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        color: '#888',
        fontSize: '14px',
    },
    googleBtnWrapper: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '24px',
    },
    footerText: {
        margin: 0,
        color: '#666',
        fontSize: '14px',
    },
    linkBtn: {
        background: 'none',
        border: 'none',
        color: '#2dd4bf',
        fontWeight: '600',
        cursor: 'pointer',
        fontSize: '14px',
        textDecoration: 'underline',
    },
    features: {
        display: 'flex',
        justifyContent: 'center',
        gap: '24px',
        marginTop: '32px',
        flexWrap: 'wrap',
    },
    feature: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    featureIcon: {
        fontSize: '16px',
    },
    featureText: {
        fontSize: '13px',
        color: '#666',
    },
};

// Add keyframes for spinner animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
if (!document.querySelector('style[data-login-spinner]')) {
    styleSheet.setAttribute('data-login-spinner', 'true');
    document.head.appendChild(styleSheet);
}

export default LoginPage;
