import { useState } from 'react';

export interface SharedLink {
    id: string;
    fileName: string;
    shareUrl: string;
    createdAt: Date;
    expiresAt: Date;
    views: number;
}

interface LinkCardProps {
    link: SharedLink;
}

const LinkCard = ({ link }: LinkCardProps) => {
    const [copied, setCopied] = useState(false);

    const copyLink = async () => {
        await navigator.clipboard.writeText(link.shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getTimeLeft = (expiresAt: Date) => {
        const diff = new Date(expiresAt).getTime() - Date.now();
        if (diff <= 0) return 'Expired';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) return `${hours}h ${mins}m left`;
        return `${mins}m left`;
    };

    const isExpired = new Date(link.expiresAt) <= new Date();

    return (
        <div style={{ ...styles.card, ...(isExpired ? styles.cardExpired : {}) }}>
            <div style={styles.top}>
                <span style={styles.fileName}>{link.fileName}</span>
                <span style={styles.views}>{link.views} views</span>
            </div>
            <div style={styles.middle}>
                <span style={styles.url}>{link.shareUrl}</span>
                <span style={{ ...styles.expiry, ...(isExpired ? styles.expiryExpired : {}) }}>
                    {getTimeLeft(link.expiresAt)}
                </span>
            </div>
            <div style={styles.actions}>
                <button onClick={copyLink} style={styles.copyBtn}>
                    {copied ? '✓ Copied' : 'Copy'}
                </button>
                <a
                    href={link.shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.viewBtn}
                >
                    Open
                </a>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    card: {
        background: '#141415',
        border: '1px solid #2a2a2b',
        borderRadius: '10px',
        padding: '16px',
        marginBottom: '12px',
    },
    cardExpired: {
        opacity: 0.5,
    },
    top: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
    },
    fileName: {
        fontSize: '15px',
        fontWeight: '500',
        color: '#f5f5f5',
    },
    views: {
        fontSize: '13px',
        color: '#666',
    },
    middle: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
    },
    url: {
        fontSize: '13px',
        color: '#888',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        flex: 1,
        marginRight: '12px',
    },
    expiry: {
        fontSize: '12px',
        color: '#2dd4bf',
        fontWeight: '500',
    },
    expiryExpired: {
        color: '#ef4444',
    },
    actions: {
        display: 'flex',
        gap: '8px',
    },
    copyBtn: {
        padding: '8px 16px',
        fontSize: '13px',
        background: '#2dd4bf',
        color: '#0a0a0b',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
    },
    viewBtn: {
        padding: '8px 16px',
        fontSize: '13px',
        background: 'transparent',
        color: '#888',
        border: '1px solid #3a3a3b',
        borderRadius: '6px',
        textDecoration: 'none',
        cursor: 'pointer',
    },
};

export default LinkCard;
