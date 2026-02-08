import { useState, useRef, useCallback } from 'react';
import { uploadFileAndGetShareUrl, type UploadResult } from '../api/files';

interface FileUploadProps {
    onUploadSuccess: (result: UploadResult, fileName: string) => void;
    onUploadError?: (error: string) => void;
    accept?: string;
    maxSizeMB?: number;
}

const FileUpload = ({
    onUploadSuccess,
    onUploadError,
    accept = '.pdf,.doc,.docx,.txt,.png,.jpg,.jpeg',
    maxSizeMB = 10,
}: FileUploadProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = useCallback((file: File): boolean => {
        if (file.size > maxSizeMB * 1024 * 1024) {
            onUploadError?.(`File size must be less than ${maxSizeMB}MB`);
            return false;
        }
        return true;
    }, [maxSizeMB, onUploadError]);

    const uploadFile = async (file: File) => {
        if (!validateFile(file)) return;

        setIsUploading(true);
        setProgress(0);

        const progressInterval = setInterval(() => {
            setProgress(prev => (prev >= 90 ? prev : prev + 15));
        }, 150);

        try {
            const result = await uploadFileAndGetShareUrl(file);
            clearInterval(progressInterval);
            setProgress(100);

            setTimeout(() => {
                setIsUploading(false);
                setProgress(0);
                onUploadSuccess(result, file.name);
            }, 300);
        } catch (err) {
            clearInterval(progressInterval);
            setIsUploading(false);
            setProgress(0);

            const message = err instanceof Error ? err.message : 'Upload failed. Please try again.';
            onUploadError?.(message);
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) uploadFile(files[0]);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadFile(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div
            style={{
                ...styles.dropZone,
                ...(isDragging ? styles.dropZoneDragging : {}),
                ...(isUploading ? styles.dropZoneUploading : {}),
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            {isUploading ? (
                <div style={styles.uploadingState}>
                    <div style={styles.progressContainer}>
                        <div style={{ ...styles.progressBar, width: `${progress}%` }} />
                    </div>
                    <span style={styles.uploadingText}>Uploading... {progress}%</span>
                </div>
            ) : (
                <div style={styles.idleState}>
                    <div style={styles.icon}>📄</div>
                    <span style={styles.title}>
                        {isDragging ? 'Drop file here' : 'Drop file or click to upload'}
                    </span>
                    <span style={styles.hint}>Max {maxSizeMB}MB</span>
                </div>
            )}
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    dropZone: {
        border: '2px dashed #3a3a3b',
        borderRadius: '12px',
        padding: '40px 24px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        background: '#141415',
    },
    dropZoneDragging: {
        borderColor: '#2dd4bf',
        background: '#1a1a1b',
    },
    dropZoneUploading: {
        cursor: 'default',
        borderColor: '#2dd4bf',
    },
    idleState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
    },
    icon: {
        fontSize: '36px',
        marginBottom: '4px',
    },
    title: {
        fontSize: '15px',
        fontWeight: '500',
        color: '#f5f5f5',
    },
    hint: {
        fontSize: '13px',
        color: '#666',
    },
    uploadingState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
    },
    progressContainer: {
        width: '200px',
        height: '6px',
        background: '#2a2a2b',
        borderRadius: '3px',
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        background: '#2dd4bf',
        borderRadius: '3px',
        transition: 'width 0.15s',
    },
    uploadingText: {
        fontSize: '14px',
        color: '#888',
    },
};

export default FileUpload;
