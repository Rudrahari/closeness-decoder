import api from './auth';

interface FriendUrlResponse {
    friendUrl: string;
}

export const uploadFileAndGetFriendUrl = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<FriendUrlResponse>('/api/friend-url/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data.friendUrl;
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
