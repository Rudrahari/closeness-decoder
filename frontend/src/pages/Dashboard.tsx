import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import LinkCard, { type SharedLink } from '../components/LinkCard';
import type { UploadResult } from '../api/files';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [links, setLinks] = useState<SharedLink[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleUploadSuccess = (result: UploadResult, fileName: string) => {
        const newLink: SharedLink = {
            id: Date.now().toString(),
            fileName,
            shareUrl: result.shareUrl,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            views: 0,
        };
        setLinks(prev => [newLink, ...prev]);
        setError(null);
    };

    const handleUploadError = (errorMsg: string) => {
        setError(errorMsg);
    };

    const totalViews = links.reduce((sum, link) => sum + link.views, 0);
    const activeLinks = links.filter(link => new Date(link.expiresAt) > new Date()).length;

    return (
        <div style={styles.page}>
            {/* Header */}
            <header style={styles.header}>
                <span style={styles.logo}>Closeness</span>
                <div style={styles.userArea}>
                    <span style={styles.email}>{user?.email}</span>
                    <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                </div>
            </header>

            {/* Main */}
            <main style={styles.main}>
                <h1 style={styles.title}>Share a document</h1>
                <p style={styles.subtitle}>Upload and get a shareable link (max 10MB)</p>

                <FileUpload
                    onUploadSuccess={handleUploadSuccess}
                    onUploadError={handleUploadError}
                />

                {error && <p style={styles.error}>{error}</p>}

                {links.length > 0 && (
                    <div style={styles.statsRow}>
                        <div style={styles.statBox}>
                            <span style={styles.statValue}>{links.length}</span>
                            <span style={styles.statLabel}>Total Links</span>
                        </div>
                        <div style={styles.statBox}>
                            <span style={styles.statValue}>{activeLinks}</span>
                            <span style={styles.statLabel}>Active</span>
                        </div>
                        <div style={styles.statBox}>
                            <span style={styles.statValue}>{totalViews}</span>
                            <span style={styles.statLabel}>Total Views</span>
                        </div>
                    </div>
                )}

                {links.length > 0 && (
                    <div style={styles.linksSection}>
                        <h2 style={styles.linksTitle}>Your Links</h2>
                        {links.map(link => (
                            <LinkCard key={link.id} link={link} />
                        ))}
                    </div>
                )}
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid #2a2a2b',
    },
    logo: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#f5f5f5',
    },
    userArea: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    email: {
        fontSize: '14px',
        color: '#888',
    },
    logoutBtn: {
        padding: '8px 16px',
        background: 'transparent',
        border: '1px solid #3a3a3b',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        color: '#888',
    },
    main: {
        maxWidth: '600px',
        margin: '60px auto',
        padding: '0 24px',
    },
    title: {
        fontSize: '28px',
        fontWeight: '600',
        margin: '0 0 8px 0',
        color: '#f5f5f5',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: '16px',
        color: '#888',
        margin: '0 0 32px 0',
        textAlign: 'center',
    },
    error: {
        color: '#ef4444',
        marginTop: '16px',
        fontSize: '14px',
        textAlign: 'center',
    },
    statsRow: {
        display: 'flex',
        gap: '12px',
        marginTop: '48px',
        marginBottom: '32px',
    },
    statBox: {
        flex: 1,
        padding: '20px',
        background: '#141415',
        border: '1px solid #2a2a2b',
        borderRadius: '10px',
        textAlign: 'center',
    },
    statValue: {
        display: 'block',
        fontSize: '24px',
        fontWeight: '600',
        color: '#2dd4bf',
    },
    statLabel: {
        fontSize: '13px',
        color: '#888',
    },
    linksSection: {
        marginTop: '24px',
    },
    linksTitle: {
        fontSize: '18px',
        fontWeight: '600',
        margin: '0 0 16px 0',
        color: '#f5f5f5',
    },
};

export default Dashboard;
