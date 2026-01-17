export interface Env {
    // Environment variables (from wrangler.toml)
    API_URL: string;
    SUPABASE_URL: string;

    // Secrets (set via wrangler secret put)
    CLEANUP_API_KEY: string;
    SUPABASE_KEY: string;
}

interface PendingFile {
    id: string;
    storageKey: string;
    markedAt: string;
}

interface CleanupResponse {
    files: PendingFile[];
}

export default {
    async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
        console.log('Cleanup worker triggered at:', new Date().toISOString());

        try {
            // 1. Get pending files from Spring Boot API
            const pendingResponse = await fetch(`${env.API_URL}/api/internal/cleanup/pending`, {
                headers: {
                    'X-Cleanup-API-Key': env.CLEANUP_API_KEY,
                },
            });

            if (!pendingResponse.ok) {
                throw new Error(`API returned ${pendingResponse.status}`);
            }

            const { files }: CleanupResponse = await pendingResponse.json();
            console.log(`Found ${files.length} files to delete`);

            if (files.length === 0) {
                return;
            }

            // 2. Delete files from Supabase storage
            const deletedIds: string[] = [];
            const failedIds: string[] = [];

            for (const file of files) {
                try {
                    await deleteFromStorage(file.storageKey, env);
                    deletedIds.push(file.id);
                    console.log(`Deleted: ${file.storageKey}`);
                } catch (error) {
                    console.error(`Failed to delete ${file.id}:`, error);
                    failedIds.push(file.id);
                }
            }

            // 3. Confirm deletions to Spring Boot API
            await fetch(`${env.API_URL}/api/internal/cleanup/confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Cleanup-API-Key': env.CLEANUP_API_KEY,
                },
                body: JSON.stringify({ deletedIds, failedIds }),
            });

            console.log(`Cleanup complete. Deleted: ${deletedIds.length}, Failed: ${failedIds.length}`);

        } catch (error) {
            console.error('Cleanup worker error:', error);
            throw error;
        }
    },
};

async function deleteFromStorage(storageKey: string, env: Env): Promise<void> {
    const response = await fetch(
        `${env.SUPABASE_URL}/storage/v1/object/uploads/${storageKey}`,
        {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${env.SUPABASE_KEY}`,
                'apikey': env.SUPABASE_KEY,
            },
        }
    );

    if (!response.ok && response.status !== 404) {
        throw new Error(`Storage delete failed: ${response.status}`);
    }
}
