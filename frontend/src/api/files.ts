import api from './auth';

interface FriendUrlResponse {
    friendCode: string;
}

export interface UploadResult {
    friendCode: string;
    shareUrl: string;
}

export const uploadFileAndGetShareUrl = async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<FriendUrlResponse>('/api/friend-url/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    const friendCode = response.data.friendCode;
    const shareUrl = `${window.location.origin}/friend-url/${friendCode}`;

    return { friendCode, shareUrl };
};

export const getPresignedUrl = async (friendCode: string): Promise<string> => {
    const response = await api.get<{ friendUrl: string }>(`/api/friend-url/${encodeURIComponent(friendCode)}`);
    return response.data.friendUrl;
};
