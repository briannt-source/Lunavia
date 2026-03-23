import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadFile, BUCKETS, generateFilePath } from '@/lib/supabase-storage';

export const dynamic = 'force-dynamic';

/**
 * POST /api/uploads/avatar — Upload avatar to Supabase Storage (avatars bucket)
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
            return NextResponse.json({ error: 'No file received.' }, { status: 400 });
        }

        // Validate image types only
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only images allowed (JPG, PNG, WebP, GIF).' },
                { status: 400 }
            );
        }

        // 5MB limit for avatars
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large. Maximum 5MB for avatars.' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filePath = generateFilePath('avatar-', file.name, session.user.id);

        const result = await uploadFile(BUCKETS.AVATARS, filePath, buffer, file.type);

        return NextResponse.json({ url: result.url });
    } catch (error) {
        console.error('Avatar upload error:', error);
        return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
    }
}
