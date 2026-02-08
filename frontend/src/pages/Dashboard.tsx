import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SharedLink {
    id: string;
    fileName: string;
    shareUrl: string;
    createdAt: Date;
    expiresAt: Date;
    views: number;
}

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isUploading, setIsUploading] = useState(false);
    const [links, setLinks] = useState<SharedLink[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleUpload = async (file: File) => {
        if (file.size > 10 * 1024 * 1024) {
            setError('File must be under 10MB');
            return;
        }

        setError(null);
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('accessToken');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

            const response = await fetch(`${baseUrl}/api/friend-url/upload`, {
                method: 'POST',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();

            const newLink: SharedLink = {
                id: Date.now().toString(),
                fileName: file.name,
                shareUrl: `${window.location.origin}/friend-url/${data.friendCode}`,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from backend
                views: 0,
            };

            setLinks(prev => [newLink, ...prev]);
        } catch {
            setError('Upload failed. Try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const copyLink = async (url: string, id: string) => {
        await navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getTimeLeft = (expiresAt: Date) => {
        const diff = new Date(expiresAt).getTime() - Date.now();
        if (diff <= 0) return 'Expired';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) return `${hours}h ${mins}m left`;
        return `${mins}m left`;
    };

    // Calculate total stats
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

                {/* Upload Button */}
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    style={styles.uploadBtn}
                >
                    {isUploading ? 'Uploading...' : 'Choose File'}
                </button>

                {error && <p style={styles.error}>{error}</p>}

                {/* Analytics Summary */}
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

                {/* Links List */}
                {links.length > 0 && (
                    <div style={styles.linksSection}>
                        <h2 style={styles.linksTitle}>Your Links</h2>
                        {links.map(link => (
                            <div key={link.id} style={styles.linkRow}>
                                <div style={styles.linkInfo}>
                                    <div style={styles.linkTop}>
                                        <span style={styles.fileName}>{link.fileName}</span>
                                        <span style={styles.viewCount}>{link.views} views</span>
                                    </div>
                                    <div style={styles.linkMeta}>
                                        <span style={styles.url}>{link.shareUrl}</span>
                                        <span style={styles.expiry}>{getTimeLeft(link.expiresAt)}</span>
                                    </div>
                                </div>
                                <div style={styles.actions}>
                                    <button
                                        onClick={() => copyLink(link.shareUrl, link.id)}
                                        style={styles.actionBtn}
                                    >
                                        {copiedId === link.id ? '✓' : 'Copy'}
                                    </button>
                                    <a
                                        href={link.shareUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={styles.viewBtn}
                                        title="View"
                                    >
                                        👁
                                    </a>
                                </div>
                            </div>
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
        background: '#fafafa',
        fontFamily: 'system-ui, sans-serif',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid #eee',
        background: '#fff',
    },
    logo: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#111',
    },
    userArea: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    email: {
        fontSize: '14px',
        color: '#666',
    },
    logoutBtn: {
        padding: '8px 16px',
        background: 'none',
        border: '1px solid #ddd',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    main: {
        maxWidth: '600px',
        margin: '60px auto',
        padding: '0 24px',
        textAlign: 'center',
    },
    title: {
        fontSize: '28px',
        fontWeight: '600',
        margin: '0 0 8px 0',
        color: '#111',
    },
    subtitle: {
        fontSize: '16px',
        color: '#666',
        margin: '0 0 32px 0',
    },
    uploadBtn: {
        padding: '14px 32px',
        fontSize: '16px',
        background: '#111',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
    },
    error: {
        color: '#e53935',
        marginTop: '16px',
        fontSize: '14px',
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
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: '10px',
        textAlign: 'center',
    },
    statValue: {
        display: 'block',
        fontSize: '24px',
        fontWeight: '600',
        color: '#111',
    },
    statLabel: {
        display: 'block',
        fontSize: '12px',
        color: '#888',
        marginTop: '4px',
    },
    linksSection: {
        textAlign: 'left',
    },
    linksTitle: {
        fontSize: '16px',
        fontWeight: '600',
        margin: '0 0 16px 0',
        color: '#111',
    },
    linkRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: '8px',
        marginBottom: '8px',
    },
    linkInfo: {
        flex: 1,
        minWidth: 0,
    },
    linkTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '6px',
    },
    fileName: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#111',
    },
    viewCount: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#2563eb',
    },
    linkMeta: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
    },
    url: {
        fontSize: '13px',
        color: '#666',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        flex: 1,
    },
    expiry: {
        fontSize: '12px',
        color: '#888',
        whiteSpace: 'nowrap',
    },
    actions: {
        display: 'flex',
        gap: '8px',
        marginLeft: '16px',
    },
    actionBtn: {
        padding: '8px 16px',
        fontSize: '13px',
        background: '#f5f5f5',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
    },
    viewBtn: {
        padding: '8px 12px',
        fontSize: '16px',
        background: '#f5f5f5',
        borderRadius: '6px',
        textDecoration: 'none',
    },
};

export default Dashboard;
