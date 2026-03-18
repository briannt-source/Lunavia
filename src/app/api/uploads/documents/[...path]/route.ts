import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const MIME_TYPES: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
};

// ── GET /api/uploads/documents/[...path] — Serve files with access control ──
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        // Path format: [tourId, filename]
        const { path: pathArray } = await params;
        const [tourId, filename] = pathArray;
        if (!tourId || !filename) {
            return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
        }

        const userId = session.user.id;
        const isAdmin = ['SUPER_ADMIN', 'OPS'].includes(session.user.role);

        // Verify access
        const tour = await prisma.tour.findUnique({
            where: { id: tourId },
            select: { 
                operatorId: true,
                applications: { where: { guideId: userId, status: 'ACCEPTED' }, select: { id: true } },
                assignments: { where: { guideId: userId, status: 'APPROVED' }, select: { id: true } }
            },
        });
        if (!tour) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const isAssignedGuide = tour.applications.length > 0 || tour.assignments.length > 0;
        if (tour.operatorId !== userId && !isAssignedGuide && !isAdmin) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Sanitize filename to prevent directory traversal
        const sanitized = path.basename(filename);
        const filePath = path.join(process.cwd(), 'uploads', 'documents', tourId, sanitized);

        const fileBuffer = await readFile(filePath);
        const ext = sanitized.split('.').pop()?.toLowerCase() || '';
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${sanitized}"`,
                'Cache-Control': 'private, max-age=3600',
            },
        });
    } catch (error: any) {
        if (error?.code === 'ENOENT') {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        console.error('Serve file error:', error);
        return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
    }
}
