import { useState, useRef, useCallback } from 'react';
import { uploadFileAndGetPresignedUrl } from '../api/files';

interface UploadedFile {
    id: string;
    name: string;
    presignedUrl: string;
    uploadedAt: Date;
}

const PdfUploader = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
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

    const validateFile = (file: File): boolean => {
        if (file.type !== 'application/pdf') {
            setError('Only PDF files are supported');
            return false;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return false;
        }
        return true;
    };

    const uploadFile = async (file: File) => {
        if (!validateFile(file)) return;

        setError(null);
        setIsUploading(true);
        setUploadProgress(0);

        // Simulate progress (since axios doesn't give real progress for small files)
        const progressInterval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 90) return prev;
                return prev + 10;
            });
        }, 200);

        try {
            const presignedUrl = await uploadFileAndGetPresignedUrl(file);

            clearInterval(progressInterval);
            setUploadProgress(100);

            const newFile: UploadedFile = {
                id: Date.now().toString(),
                name: file.name,
                presignedUrl,
                uploadedAt: new Date(),
            };

            setUploadedFiles((prev) => [newFile, ...prev]);

            // Reset progress after a short delay
            setTimeout(() => {
                setUploadProgress(0);
                setIsUploading(false);
            }, 500);
        } catch (err: unknown) {
            clearInterval(progressInterval);
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: string } };
                setError(axiosError.response?.data || 'Upload failed. Please try again.');
            } else {
                setError('Upload failed. Please try again.');
            }
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            uploadFile(files[0]);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            uploadFile(files[0]);
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const copyToClipboard = async (url: string, id: string) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            setError('Failed to copy to clipboard');
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleString('en-US', {
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
                    ...styles.uploadZone,
                    ...(isDragging ? styles.uploadZoneDragging : {}),
                    ...(isUploading ? styles.uploadZoneUploading : {}),
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileSelect}
                    style={styles.hiddenInput}
                />

                {isUploading ? (
                    <div style={styles.uploadingContent}>
                        <div style={styles.spinner}></div>
                        <p style={styles.uploadingText}>Uploading...</p>
                        <div style={styles.progressBar}>
                            <div
                                style={{
                                    ...styles.progressFill,
                                    width: `${uploadProgress}%`,
                                }}
                            ></div>
                        </div>
                        <span style={styles.progressText}>{uploadProgress}%</span>
                    </div>
                ) : (
                    <div style={styles.uploadContent}>
                        <div style={styles.uploadIcon}>📄</div>
                        <h3 style={styles.uploadTitle}>
                            {isDragging ? 'Drop your PDF here' : 'Upload PDF'}
                        </h3>
                        <p style={styles.uploadSubtitle}>
                            Drag and drop or click to browse
                        </p>
                        <span style={styles.uploadHint}>Max file size: 10MB</span>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div style={styles.errorContainer}>
                    <span style={styles.errorIcon}>⚠️</span>
                    <span style={styles.errorText}>{error}</span>
                    <button
                        style={styles.errorClose}
                        onClick={() => setError(null)}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
                <div style={styles.filesList}>
                    <h3 style={styles.filesTitle}>
                        🔗 Shareable Links ({uploadedFiles.length})
                    </h3>
                    {uploadedFiles.map((file) => (
                        <div key={file.id} style={styles.fileCard}>
                            <div style={styles.fileInfo}>
                                <div style={styles.fileIcon}>📑</div>
                                <div style={styles.fileDetails}>
                                    <span style={styles.fileName}>{file.name}</span>
                                    <span style={styles.fileDate}>
                                        Uploaded {formatDate(file.uploadedAt)}
                                    </span>
                                </div>
                            </div>
                            <div style={styles.urlSection}>
                                <input
                                    type="text"
                                    value={file.presignedUrl}
                                    readOnly
                                    style={styles.urlInput}
                                />
                                <button
                                    style={{
                                        ...styles.copyButton,
                                        ...(copiedId === file.id ? styles.copyButtonSuccess : {}),
                                    }}
                                    onClick={() => copyToClipboard(file.presignedUrl, file.id)}
                                >
                                    {copiedId === file.id ? '✓ Copied!' : '📋 Copy'}
                                </button>
                                <a
                                    href={file.presignedUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={styles.openButton}
                                >
                                    🔗 Open
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        width: '100%',
    },
    uploadZone: {
        border: '2px dashed #d1d5db',
        borderRadius: '16px',
        padding: '48px 32px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    },
    uploadZoneDragging: {
        borderColor: '#667eea',
        background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
        transform: 'scale(1.02)',
    },
    uploadZoneUploading: {
        cursor: 'default',
        borderColor: '#667eea',
    },
    hiddenInput: {
        display: 'none',
    },
    uploadContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
    },
    uploadIcon: {
        fontSize: '48px',
        marginBottom: '8px',
    },
    uploadTitle: {
        margin: 0,
        fontSize: '20px',
        fontWeight: '600',
        color: '#1f2937',
    },
    uploadSubtitle: {
        margin: 0,
        fontSize: '14px',
        color: '#6b7280',
    },
    uploadHint: {
        marginTop: '8px',
        fontSize: '12px',
        color: '#9ca3af',
    },
    uploadingContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
    },
    spinner: {
        width: '48px',
        height: '48px',
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    uploadingText: {
        margin: 0,
        fontSize: '16px',
        fontWeight: '500',
        color: '#4b5563',
    },
    progressBar: {
        width: '200px',
        height: '8px',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '4px',
        transition: 'width 0.3s ease',
    },
    progressText: {
        fontSize: '14px',
        color: '#6b7280',
    },
    errorContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        backgroundColor: '#fef2f2',
        borderRadius: '10px',
        marginTop: '16px',
        border: '1px solid #fecaca',
    },
    errorIcon: {
        fontSize: '16px',
    },
    errorText: {
        flex: 1,
        color: '#dc2626',
        fontSize: '14px',
    },
    errorClose: {
        background: 'none',
        border: 'none',
        color: '#dc2626',
        cursor: 'pointer',
        fontSize: '16px',
        padding: '4px',
    },
    filesList: {
        marginTop: '24px',
    },
    filesTitle: {
        margin: '0 0 16px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#1f2937',
    },
    fileCard: {
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    },
    fileInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px',
    },
    fileIcon: {
        fontSize: '32px',
    },
    fileDetails: {
        display: 'flex',
        flexDirection: 'column',
    },
    fileName: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#1f2937',
    },
    fileDate: {
        fontSize: '12px',
        color: '#9ca3af',
    },
    urlSection: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
    },
    urlInput: {
        flex: 1,
        padding: '10px 12px',
        fontSize: '13px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: '#f9fafb',
        color: '#4b5563',
        fontFamily: 'monospace',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    copyButton: {
        padding: '10px 16px',
        fontSize: '13px',
        fontWeight: '500',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
    },
    copyButtonSuccess: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
    openButton: {
        padding: '10px 16px',
        fontSize: '13px',
        fontWeight: '500',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        cursor: 'pointer',
        backgroundColor: 'white',
        color: '#4b5563',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
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
if (!document.querySelector('style[data-pdf-uploader]')) {
    styleSheet.setAttribute('data-pdf-uploader', 'true');
    document.head.appendChild(styleSheet);
}

export default PdfUploader;
