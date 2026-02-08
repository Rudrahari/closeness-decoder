import { useState, useRef, useCallback } from 'react';
import ShareModal from './ShareModal';

interface SharedLink {
    id: string;
    fileName: string;
    shareUrl: string;
    createdAt: Date;
}

const FileUploader = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const validateFile = useCallback((file: File): boolean => {
        if (file.size > 50 * 1024 * 1024) {
            setError('File too large. Max 50MB.');
            return false;
        }
        return true;
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0 && validateFile(files[0])) {
            setSelectedFile(files[0]);
            setIsModalOpen(true);
            setError(null);
        }
    }, [validateFile]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0 && validateFile(files[0])) {
            setSelectedFile(files[0]);
            setIsModalOpen(true);
            setError(null);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleShareCreated = (shareUrl: string, fileName: string) => {
        const newLink: SharedLink = {
            id: Date.now().toString(),
            fileName,
            shareUrl,
            createdAt: new Date(),
        };
        setSharedLinks(prev => [newLink, ...prev]);
        setIsModalOpen(false);
        setSelectedFile(null);
    };

    const copyToClipboard = async (url: string, id: string) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            setError('Copy failed');
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div style={styles.container}>
            {/* Upload Zone */}
            <div
                style={{
                    ...styles.dropzone,
                    ...(isDragging ? styles.dropzoneActive : {}),
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
                <div style={styles.dropzoneContent}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: isDragging ? '#2dd4bf' : '#444' }}>
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p style={styles.dropzoneTitle}>
                        {isDragging ? 'Drop file here' : 'Drop a file or click to browse'}
                    </p>
                    <span style={styles.dropzoneHint}>Up to 50MB</span>
                </div>
            </div>

            {error && (
                <div style={styles.errorBar}>
                    <span>{error}</span>
                    <button style={styles.errorDismiss} onClick={() => setError(null)}>×</button>
                </div>
            )}

            {/* Links */}
            {sharedLinks.length > 0 && (
                <div style={styles.linksSection}>
                    <h3 style={styles.linksHeading}>Recent links</h3>
                    {sharedLinks.map((link) => (
                        <div key={link.id} style={styles.linkCard}>
                            <div style={styles.linkTop}>
                                <span style={styles.linkFileName}>{link.fileName}</span>
                                <span style={styles.linkMeta}>{formatDate(link.createdAt)}</span>
                            </div>
                            <div style={styles.linkBottom}>
                                <input
                                    type="text"
                                    value={link.shareUrl}
                                    readOnly
                                    style={styles.urlField}
                                />
                                <button
                                    style={{
                                        ...styles.copyBtn,
                                        ...(copiedId === link.id ? styles.copyBtnDone : {}),
                                    }}
                                    onClick={() => copyToClipboard(link.shareUrl, link.id)}
                                >
                                    {copiedId === link.id ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && selectedFile && (
                <ShareModal
                    file={selectedFile}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedFile(null);
                    }}
                    onShareCreated={handleShareCreated}
                />
            )}
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        width: '100%',
    },
    dropzone: {
        border: '2px dashed #2a2a2b',
        borderRadius: 12,
        padding: '48px 24px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        background: '#0d0d0e',
    },
    dropzoneActive: {
        borderColor: '#2dd4bf',
        background: 'rgba(45, 212, 191, 0.05)',
    },
    dropzoneContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
    },
    dropzoneTitle: {
        margin: 0,
        fontSize: 15,
        color: '#888',
        fontWeight: 500,
    },
    dropzoneHint: {
        fontSize: 13,
        color: '#444',
    },
    errorBar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: 8,
        marginTop: 12,
        color: '#ef4444',
        fontSize: 14,
    },
    errorDismiss: {
        background: 'none',
        border: 'none',
        color: '#ef4444',
        fontSize: 18,
        cursor: 'pointer',
        padding: 0,
        lineHeight: 1,
    },
    linksSection: {
        marginTop: 32,
    },
    linksHeading: {
        margin: '0 0 16px 0',
        fontSize: 14,
        fontWeight: 600,
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    linkCard: {
        background: '#141415',
        border: '1px solid #222',
        borderRadius: 10,
        padding: 16,
        marginBottom: 10,
    },
    linkTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    linkFileName: {
        color: '#f5f5f5',
        fontSize: 14,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        flex: 1,
    },
    linkMeta: {
        fontSize: 12,
        color: '#555',
        marginLeft: 12,
    },
    linkBottom: {
        display: 'flex',
        gap: 8,
    },
    urlField: {
        flex: 1,
        padding: '10px 12px',
        background: '#0d0d0e',
        border: '1px solid #222',
        borderRadius: 6,
        color: '#888',
        fontSize: 13,
        fontFamily: 'monospace',
    },
    copyBtn: {
        padding: '10px 20px',
        background: '#2dd4bf',
        border: 'none',
        borderRadius: 6,
        color: '#0a0a0b',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
    },
    copyBtnDone: {
        background: '#22c55e',
    },
};

export default FileUploader;
