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

    // Redirect to dashboard if already authenticated
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
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Logo/Brand */}
                <div style={styles.logoContainer}>
                    <div style={styles.logo}>🔐</div>
                    <h1 style={styles.title}>Closeness Decoder</h1>
                </div>
                <p style={styles.subtitle}>Share files securely with presigned URLs</p>

                {/* Auth Mode Toggle */}
                <div style={styles.toggleContainer}>
                    <button
                        style={{
                            ...styles.toggleButton,
                            ...(authMode === 'signin' ? styles.toggleButtonActive : {}),
                        }}
                        onClick={() => setAuthMode('signin')}
                    >
                        Sign In
                    </button>
                    <button
                        style={{
                            ...styles.toggleButton,
                            ...(authMode === 'signup' ? styles.toggleButtonActive : {}),
                        }}
                        onClick={() => setAuthMode('signup')}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Description */}
                <p style={styles.modeDescription}>
                    {authMode === 'signin'
                        ? 'Welcome back! Sign in to access your files.'
                        : 'Create a new account to get started.'}
                </p>

                {/* Error Message */}
                {error && (
                    <div style={styles.errorContainer}>
                        <span style={styles.errorIcon}>⚠️</span>
                        <span style={styles.errorText}>{error}</span>
                    </div>
                )}

                {/* Google Auth Button */}
                {isLoading ? (
                    <div style={styles.loadingContainer}>
                        <div style={styles.spinner}></div>
                        <p style={styles.loadingText}>Authenticating...</p>
                    </div>
                ) : (
                    <div style={styles.buttonContainer}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="filled_blue"
                            size="large"
                            text={authMode === 'signin' ? 'signin_with' : 'signup_with'}
                            shape="rectangular"
                            width="300"
                        />
                    </div>
                )}

                {/* Footer */}
                <p style={styles.footer}>
                    {authMode === 'signin' ? (
                        <>
                            Don't have an account?{' '}
                            <button style={styles.linkButton} onClick={() => setAuthMode('signup')}>
                                Sign up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <button style={styles.linkButton} onClick={() => setAuthMode('signin')}>
                                Sign in
                            </button>
                        </>
                    )}
                </p>
            </div>

            {/* Background decoration */}
            <div style={styles.bgDecoration1}></div>
            <div style={styles.bgDecoration2}></div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        position: 'relative',
        overflow: 'hidden',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '48px',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        textAlign: 'center',
        maxWidth: '420px',
        width: '90%',
        backdropFilter: 'blur(10px)',
        zIndex: 10,
    },
    logoContainer: {
        marginBottom: '8px',
    },
    logo: {
        fontSize: '48px',
        marginBottom: '8px',
    },
    title: {
        margin: '0',
        fontSize: '28px',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    subtitle: {
        margin: '0 0 24px 0',
        color: '#6b7280',
        fontSize: '14px',
    },
    toggleContainer: {
        display: 'flex',
        backgroundColor: '#f3f4f6',
        borderRadius: '12px',
        padding: '4px',
        marginBottom: '20px',
    },
    toggleButton: {
        flex: 1,
        padding: '12px 24px',
        border: 'none',
        borderRadius: '10px',
        backgroundColor: 'transparent',
        color: '#6b7280',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    toggleButtonActive: {
        backgroundColor: '#ffffff',
        color: '#1f2937',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    modeDescription: {
        margin: '0 0 24px 0',
        color: '#6b7280',
        fontSize: '14px',
    },
    errorContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '12px 16px',
        backgroundColor: '#fef2f2',
        borderRadius: '10px',
        marginBottom: '20px',
        border: '1px solid #fecaca',
    },
    errorIcon: {
        fontSize: '16px',
    },
    errorText: {
        color: '#dc2626',
        fontSize: '14px',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '24px',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #f3f4f6',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        color: '#6b7280',
        fontSize: '14px',
    },
    footer: {
        margin: '0',
        color: '#6b7280',
        fontSize: '14px',
    },
    linkButton: {
        background: 'none',
        border: 'none',
        color: '#667eea',
        fontWeight: '600',
        cursor: 'pointer',
        fontSize: '14px',
        textDecoration: 'underline',
    },
    bgDecoration1: {
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%)',
    },
    bgDecoration2: {
        position: 'absolute',
        bottom: '-20%',
        left: '-10%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(118, 75, 162, 0.3) 0%, transparent 70%)',
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
document.head.appendChild(styleSheet);

export default LoginPage;
