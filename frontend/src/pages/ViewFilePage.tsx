import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface FriendUrlResponse {
    friendUrl: string;
}

const MESSAGES = [
    "Your friend thought of you when sharing this. That's pretty cool.",
    "Someone took a moment to share this with you. You must be special.",
    "Hey, you clicked! Your friend knew you would.",
    "This link was saved just for you. Thanks for showing up.",
    "Your friend trusted you with this. Don't let them down.",
];

const EXPIRED_MESSAGES = [
    "Oops! This link has vanished into the digital void.",
    "Like a shooting star, this link has faded away.",
    "This link took a permanent vacation. It's not coming back.",
    "Gone with the wind... literally. This link expired.",
    "This link decided to retire early. Can't blame it.",
];

const ViewFilePage = () => {
    const { uniqueId } = useParams<{ uniqueId: string }>();
    const [status, setStatus] = useState<'loading' | 'success' | 'expired'>('loading');
    const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
    const [message] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    const [expiredMessage] = useState(() => EXPIRED_MESSAGES[Math.floor(Math.random() * EXPIRED_MESSAGES.length)]);

    useEffect(() => {
        const fetchFriendUrl = async () => {
            if (!uniqueId) {
                setStatus('expired');
                return;
            }

            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
                const response = await fetch(`${baseUrl}/api/friend-url/${uniqueId}`);

                if (!response.ok) {
                    setStatus('expired');
                    return;
                }

                const data: FriendUrlResponse = await response.json();
                setPresignedUrl(data.friendUrl);
                setStatus('success');
            } catch {
                setStatus('expired');
            }
        };

        fetchFriendUrl();
    }, [uniqueId]);

    if (status === 'loading') {
        return (
            <div style={styles.page}>
                <div style={styles.card}>
                    <div style={styles.loadingSpinner} />
                    <p style={styles.loadingText}>Finding your file...</p>
                </div>
            </div>
        );
    }

    if (status === 'expired') {
        return (
            <div style={styles.page}>
                <div style={styles.card}>
                    <div style={styles.expiredIcon}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                    </div>
                    <h2 style={styles.expiredTitle}>Link Expired</h2>
                    <p style={styles.expiredMessage}>{expiredMessage}</p>
                    <div style={styles.expiredHint}>
                        <span style={styles.hintIcon}>💡</span>
                        <span>Ask your friend to share a fresh link</span>
                    </div>
                    <a href="/" style={styles.homeLink}>
                        Go to Closeness
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.successIcon}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                    </svg>
                </div>
                <p style={styles.greeting}>{message}</p>

                <a
                    href={presignedUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.downloadBtn}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    View / Download File
                </a>

                <p style={styles.footer}>
                    Shared via <strong>Closeness</strong>
                </p>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0b 0%, #1a1a1b 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '24px',
    },
    card: {
        background: '#141415',
        border: '1px solid #2a2a2b',
        borderRadius: '16px',
        padding: '48px 40px',
        textAlign: 'center',
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    },
    loadingSpinner: {
        width: 40,
        height: 40,
        border: '3px solid #2a2a2b',
        borderTopColor: '#2dd4bf',
        borderRadius: '50%',
        margin: '0 auto 16px',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        color: '#888',
        margin: 0,
        fontSize: 15,
    },
    successIcon: {
        width: 80,
        height: 80,
        background: 'rgba(45, 212, 191, 0.1)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px',
    },
    expiredIcon: {
        width: 100,
        height: 100,
        background: 'rgba(136, 136, 136, 0.1)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px',
    },
    expiredTitle: {
        color: '#f5f5f5',
        fontSize: 24,
        fontWeight: 600,
        margin: '0 0 12px 0',
    },
    expiredMessage: {
        color: '#888',
        fontSize: 16,
        lineHeight: 1.6,
        margin: '0 0 32px 0',
    },
    expiredHint: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '14px 20px',
        background: 'rgba(45, 212, 191, 0.08)',
        borderRadius: 8,
        color: '#2dd4bf',
        fontSize: 14,
        marginBottom: 24,
    },
    hintIcon: {
        fontSize: 18,
    },
    homeLink: {
        display: 'inline-block',
        padding: '12px 28px',
        fontSize: 14,
        fontWeight: 500,
        background: 'transparent',
        color: '#888',
        border: '1px solid #333',
        borderRadius: 8,
        textDecoration: 'none',
        transition: 'all 0.2s',
    },
    greeting: {
        fontSize: 17,
        color: '#aaa',
        lineHeight: 1.7,
        margin: '0 0 32px 0',
    },
    downloadBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 36px',
        fontSize: 16,
        fontWeight: 600,
        background: '#2dd4bf',
        color: '#0a0a0b',
        borderRadius: 10,
        textDecoration: 'none',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 4px 16px rgba(45, 212, 191, 0.3)',
    },
    footer: {
        fontSize: 13,
        color: '#555',
        marginTop: 32,
        marginBottom: 0,
    },
};

// Add keyframes for spinner animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);

export default ViewFilePage;
