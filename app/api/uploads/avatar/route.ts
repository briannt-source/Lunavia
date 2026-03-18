import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
        return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer() as any;
    const buffer = Buffer.from(bytes);
    const fileExt = path.extname(file.name);
    const filename = `${uuidv4()}${fileExt}`;

    // Ensure uploads directory exists (in production use S3/Blob, here local for MVP)
    const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
    const filePath = path.join(uploadDir, filename);

    try {
        await writeFile(filePath, buffer as any);
        const url = `/api/uploads/avatars/${filename}`;
        return NextResponse.json({ url });
    } catch (error) {
        console.error('Error saving file:', error);
        return NextResponse.json({ error: "Upload failed." }, { status: 500 });
    }
}
