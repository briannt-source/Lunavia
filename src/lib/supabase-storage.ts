import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Storage Client
 * 
 * Used for file uploads (avatars, verification documents, payment proofs, tour images).
 * The database remains on Neon — only file storage uses Supabase.
 * 
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL — Supabase project URL (e.g. https://xxx.supabase.co)
 *   SUPABASE_SERVICE_ROLE_KEY — Service role key (server-side only, NOT public)
 * 
 * Supabase Storage buckets:
 *   - avatars     (public)  — User profile photos
 *   - documents   (private) — Verification documents, contracts
 *   - proofs      (private) — Payment proofs (top-up receipts)
 *   - uploads     (public)  — General uploads (tour images, etc.)
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Lazy singleton — only created when first accessed
let _client: ReturnType<typeof createClient> | null = null;

function getClient() {
    if (!_client) {
        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error(
                'Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
            );
        }
        _client = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { persistSession: false },
        });
    }
    return _client;
}

// ── Bucket names ─────────────────────────────────────────────────────
export const BUCKETS = {
    AVATARS: 'avatars',
    DOCUMENTS: 'documents',
    PROOFS: 'proofs',
    UPLOADS: 'uploads',
} as const;

type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

// ── Upload file ──────────────────────────────────────────────────────
export async function uploadFile(
    bucket: BucketName,
    filePath: string,
    file: Buffer | Uint8Array,
    contentType: string,
): Promise<{ url: string; path: string }> {
    const client = getClient();

    const { data, error } = await client.storage
        .from(bucket)
        .upload(filePath, file, {
            contentType,
            upsert: true,
        });

    if (error) {
        console.error(`[supabase-storage] Upload error (${bucket}/${filePath}):`, error);
        throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL for public buckets, signed URL for private ones
    const isPublic = bucket === BUCKETS.AVATARS || bucket === BUCKETS.UPLOADS;
    let url: string;

    if (isPublic) {
        const { data: publicUrl } = client.storage
            .from(bucket)
            .getPublicUrl(data.path);
        url = publicUrl.publicUrl;
    } else {
        // 1-hour signed URL for private files
        const { data: signedUrl, error: signError } = await client.storage
            .from(bucket)
            .createSignedUrl(data.path, 3600);
        if (signError) throw new Error(`Signed URL failed: ${signError.message}`);
        url = signedUrl.signedUrl;
    }

    return { url, path: data.path };
}

// ── Delete file ──────────────────────────────────────────────────────
export async function deleteFile(
    bucket: BucketName,
    filePath: string,
): Promise<void> {
    const client = getClient();
    const { error } = await client.storage.from(bucket).remove([filePath]);
    if (error) {
        console.error(`[supabase-storage] Delete error (${bucket}/${filePath}):`, error);
        // Don't throw — deletion is best-effort
    }
}

// ── Get signed URL (for private files) ────────────────────────────────
export async function getSignedUrl(
    bucket: BucketName,
    filePath: string,
    expiresIn = 3600,
): Promise<string> {
    const client = getClient();
    const { data, error } = await client.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);
    if (error) throw new Error(`Signed URL failed: ${error.message}`);
    return data.signedUrl;
}

// ── Get public URL (for public files) ─────────────────────────────────
export function getPublicUrl(bucket: BucketName, filePath: string): string {
    const client = getClient();
    const { data } = client.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
}

// ── Helper: generate unique filename ──────────────────────────────────
export function generateFilePath(
    prefix: string,
    originalName: string,
    userId?: string,
): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const ext = originalName.split('.').pop() || 'bin';
    const userPrefix = userId ? `${userId}/` : '';
    return `${userPrefix}${prefix}${timestamp}-${randomStr}.${ext}`;
}
