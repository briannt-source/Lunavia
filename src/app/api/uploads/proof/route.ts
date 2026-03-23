import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadFile, deleteFile, BUCKETS, generateFilePath } from '@/lib/supabase-storage';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

/**
 * POST /api/uploads/proof — Upload payment proof to Supabase Storage (proofs bucket)
 */
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({
                error: 'Invalid file type. Accepted: JPG, PNG, WebP, PDF'
            }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File too large. Maximum 10MB' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filePath = generateFilePath('proof-', file.name, session.user.id);

        const result = await uploadFile(BUCKETS.PROOFS, filePath, buffer, file.type);

        const document = {
            id: `proof-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
            filename: file.name,
            storedFilename: filePath,
            size: file.size,
            mimeType: file.type,
            url: result.url,
            uploadedAt: new Date().toISOString(),
        };

        return NextResponse.json({ document });
    } catch (error) {
        console.error('Proof upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}

/**
 * DELETE /api/uploads/proof — Remove a previously uploaded proof file
 */
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { filename } = await req.json();
        if (!filename) {
            return NextResponse.json({ error: 'filename is required' }, { status: 400 });
        }

        // Delete from Supabase Storage (best-effort)
        await deleteFile(BUCKETS.PROOFS, filename);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Proof delete error:', error);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
