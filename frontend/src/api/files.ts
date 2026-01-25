import api from './auth';

export interface UploadResponse {
    presignedUrl: string;
}

export const uploadFileAndGetPresignedUrl = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<string>('/api/upload/friend-url', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

export const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<string>('/api/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

export const getPresignedUrl = async (key: string): Promise<string> => {
    const response = await api.get<string>(`/api/friend-url/${encodeURIComponent(key)}`);
    return response.data;
};
