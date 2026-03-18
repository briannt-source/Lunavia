import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

/**
 * POST /api/uploads/proof
 * Generic file upload for payment proofs (topup, subscription).
 * NOT tied to the VerificationSubmission flow.
 * Returns the uploaded document metadata.
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

        // Save file
        const uploadDir = path.join(process.cwd(), 'uploads', 'proofs', session.user.id);
        await mkdir(uploadDir, { recursive: true });

        const ext = path.extname(file.name) || '.jpg';
        const filename = `${randomUUID()}${ext}`;
        const filepath = path.join(uploadDir, filename);

        const bytes = await file.arrayBuffer();
        await writeFile(filepath, new Uint8Array(bytes));

        const document = {
            id: randomUUID(),
            filename: file.name,
            storedFilename: filename,
            size: file.size,
            mimeType: file.type,
            url: `/uploads/proofs/${session.user.id}/${filename}`,
            uploadedAt: new Date().toISOString(),
        };

        return NextResponse.json({ document });
    } catch (error) {
        console.error('Proof upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}

/**
 * DELETE /api/uploads/proof
 * Remove a previously uploaded proof file.
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

        // Security: only delete from this user's directory
        const filepath = path.join(process.cwd(), 'uploads', 'proofs', session.user.id, path.basename(filename));

        try {
            await unlink(filepath);
        } catch {
            // File may not exist — that's OK
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Proof delete error:', error);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
