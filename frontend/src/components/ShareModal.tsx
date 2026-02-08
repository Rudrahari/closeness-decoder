import { useState, useEffect } from 'react';
import axios from 'axios';

interface ShareModalProps {
    file: File;
    onClose: () => void;
    onShareCreated: (shareUrl: string, fileName: string) => void;
}

interface UploadResponse {
    friendUrl: string;
}

const ShareModal = ({ file, onClose, onShareCreated }: ShareModalProps) => {
    const [status, setStatus] = useState<'uploading' | 'success' | 'error'>('uploading');
    const [progress, setProgress] = useState(0);
    const [friendUrl, setFriendUrl] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [copied, setCopied] = useState(false);

    // Upload file immediately when modal opens
    useEffect(() => {
        const uploadFile = async () => {
            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('accessToken');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

            try {
                const response = await axios.post<UploadResponse>(
                    `${baseUrl}/api/friend-url/upload`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        onUploadProgress: (progressEvent) => {
                            if (progressEvent.total) {
                                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                                setProgress(percent);
                            }
                        },
                    }
                );

                setFriendUrl(response.data.friendUrl);
                setStatus('success');
            } catch (err) {
                console.error('Upload error:', err);
                setErrorMsg('Upload failed. Please try again.');
                setStatus('error');
            }
        };

        uploadFile();
    }, [file]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(friendUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setErrorMsg('Failed to copy');
        }
    };

    const handleDone = () => {
        if (friendUrl) {
            onShareCreated(friendUrl, file.name);
        }
        onClose();
    };

    const handleRetry = () => {
        setStatus('uploading');
        setProgress(0);
        setErrorMsg('');

        // Re-trigger upload
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('accessToken');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

        axios.post<UploadResponse>(
            `${baseUrl}/api/friend-url/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percent);
                    }
                },
            }
        )
            .then((response) => {
                setFriendUrl(response.data.friendUrl);
                setStatus('success');
            })
            .catch((err) => {
                console.error('Upload error:', err);
                setErrorMsg('Upload failed. Please try again.');
                setStatus('error');
            });
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getExtension = (name: string) => {
        const ext = name.split('.').pop()?.toUpperCase() || 'FILE';
        return ext.length > 4 ? 'FILE' : ext;
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={styles.header}>
                    <h2 style={styles.title}>
                        {status === 'success' ? 'Link Ready!' : status === 'error' ? 'Upload Failed' : 'Uploading...'}
                    </h2>
                    <button style={styles.closeBtn} onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* File Info */}
                <div style={styles.filePreview}>
                    <div style={styles.fileTag}>{getExtension(file.name)}</div>
                    <div style={styles.fileInfo}>
                        <span style={styles.fileName}>{file.name}</span>
                        <span style={styles.fileMeta}>{formatSize(file.size)}</span>
                    </div>
                </div>

                {/* Content */}
                <div style={styles.content}>
                    {status === 'uploading' && (
                        <>
                            <p style={styles.statusText}>Uploading your file...</p>
                            <div style={styles.progressBar}>
                                <div style={{ ...styles.progressFill, width: `${progress}%` }} />
                            </div>
                            <span style={styles.progressText}>{progress}%</span>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div style={styles.errorIcon}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" />
                                    <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                            </div>
                            <p style={styles.errorText}>{errorMsg}</p>
                            <button style={styles.primaryBtn} onClick={handleRetry}>
                                Try Again
                            </button>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div style={styles.successIcon}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="9 12 11.5 14.5 16 10" />
                                </svg>
                            </div>
                            <p style={styles.statusText}>Share this link with your friends</p>
                            <div style={styles.urlRow}>
                                <input
                                    type="text"
                                    value={friendUrl}
                                    readOnly
                                    style={styles.urlInput}
                                    onClick={(e) => (e.target as HTMLInputElement).select()}
                                />
                                <button
                                    style={{ ...styles.copyBtn, ...(copied ? styles.copyBtnSuccess : {}) }}
                                    onClick={handleCopy}
                                >
                                    {copied ? '✓' : 'Copy'}
                                </button>
                            </div>
                            {copied && <span style={styles.copiedText}>Copied to clipboard!</span>}
                            <button style={styles.primaryBtn} onClick={handleDone}>
                                Done
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20,
    },
    modal: {
        background: '#141415',
        borderRadius: 14,
        width: '100%',
        maxWidth: 420,
        border: '1px solid #222',
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid #222',
    },
    title: {
        margin: 0,
        fontSize: 16,
        fontWeight: 600,
        color: '#f5f5f5',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: '#666',
        cursor: 'pointer',
        padding: 0,
        display: 'flex',
    },
    filePreview: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 20px',
        background: '#0d0d0e',
        borderBottom: '1px solid #222',
    },
    fileTag: {
        padding: '5px 10px',
        background: '#2dd4bf',
        color: '#0a0a0b',
        fontSize: 11,
        fontWeight: 700,
        borderRadius: 4,
    },
    fileInfo: {
        flex: 1,
        minWidth: 0,
    },
    fileName: {
        display: 'block',
        color: '#f5f5f5',
        fontSize: 14,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    fileMeta: {
        color: '#555',
        fontSize: 12,
    },
    content: {
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
    },
    statusText: {
        margin: 0,
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
    },
    progressBar: {
        width: '100%',
        height: 6,
        background: '#222',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        background: '#2dd4bf',
        transition: 'width 0.3s ease',
    },
    progressText: {
        fontSize: 13,
        color: '#666',
    },
    successIcon: {
        width: 64,
        height: 64,
        background: 'rgba(45,212,191,0.1)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorIcon: {
        width: 64,
        height: 64,
        background: 'rgba(239,68,68,0.1)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        margin: 0,
        fontSize: 14,
        color: '#ef4444',
        textAlign: 'center',
    },
    urlRow: {
        display: 'flex',
        gap: 8,
        width: '100%',
    },
    urlInput: {
        flex: 1,
        padding: '12px 14px',
        background: '#0d0d0e',
        border: '1px solid #2a2a2b',
        borderRadius: 8,
        color: '#f5f5f5',
        fontSize: 13,
        fontFamily: 'monospace',
        outline: 'none',
    },
    copyBtn: {
        padding: '12px 20px',
        background: '#2dd4bf',
        border: 'none',
        borderRadius: 8,
        color: '#0a0a0b',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
    },
    copyBtnSuccess: {
        background: '#22c55e',
    },
    copiedText: {
        fontSize: 12,
        color: '#22c55e',
    },
    primaryBtn: {
        width: '100%',
        padding: 14,
        background: '#f5f5f5',
        border: 'none',
        borderRadius: 10,
        color: '#0a0a0b',
        fontSize: 15,
        fontWeight: 600,
        cursor: 'pointer',
        marginTop: 8,
    },
};

export default ShareModal;
