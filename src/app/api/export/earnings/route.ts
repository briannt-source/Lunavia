import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/export/earnings
 * 
 * Exports guide earnings or operator tour data as CSV.
 * Query params: format (csv|json), from, to
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const format = searchParams.get('format') || 'csv';
        const from = searchParams.get('from');
        const to = searchParams.get('to');

        const dateFilter: any = {};
        if (from) dateFilter.gte = new Date(from);
        if (to) dateFilter.lte = new Date(to);

        const role = session.user.role;

        if (role === 'TOUR_GUIDE') {
            // Guide earnings export
            const transactions = await prisma.walletTransaction.findMany({
                where: {
                    userId: session.user.id,
                    ...(from || to ? { createdAt: dateFilter } : {}),
                },
                orderBy: { createdAt: 'desc' },
                include: {
                    tour: { select: { title: true, city: true } },
                },
            });

            const rows = transactions.map(t => ({
                date: t.createdAt.toISOString().split('T')[0],
                type: t.type,
                reason: t.reason,
                amount: t.amount,
                tour: t.tour?.title || '—',
                city: t.tour?.city || '—',
                description: t.description || '',
            }));

            if (format === 'json') {
                return NextResponse.json({ success: true, data: rows, count: rows.length });
            }

            // CSV export
            const headers = ['Ngày', 'Loại', 'Lý do', 'Số tiền (VND)', 'Tour', 'Thành phố', 'Mô tả'];
            const csvRows = [
                headers.join(','),
                ...rows.map(r =>
                    [r.date, r.type, r.reason, r.amount, `"${r.tour}"`, `"${r.city}"`, `"${r.description}"`].join(',')
                ),
            ];

            return new NextResponse(csvRows.join('\n'), {
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename="lunavia-earnings-${new Date().toISOString().split('T')[0]}.csv"`,
                },
            });

        } else if (role === 'TOUR_OPERATOR') {
            // Operator tours export
            const tours = await prisma.tour.findMany({
                where: {
                    operatorId: session.user.id,
                    ...(from || to ? { createdAt: dateFilter } : {}),
                },
                orderBy: { startDate: 'desc' },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    city: true,
                    location: true,
                    startDate: true,
                    endDate: true,
                    pax: true,
                    price: true,
                    language: true,
                    assignedGuide: { select: { profile: { select: { name: true } } } },
                },
            });

            const rows = tours.map(t => ({
                title: t.title,
                status: t.status,
                city: t.city,
                location: t.location || '',
                startDate: t.startDate?.toISOString().split('T')[0] || '',
                endDate: t.endDate?.toISOString().split('T')[0] || '',
                pax: t.pax || 0,
                price: t.price || 0,
                language: t.language || '',
                guide: t.assignedGuide?.profile?.name || '—',
            }));

            if (format === 'json') {
                return NextResponse.json({ success: true, data: rows, count: rows.length });
            }

            const headers = ['Tên Tour', 'Trạng thái', 'Thành phố', 'Địa điểm', 'Ngày bắt đầu', 'Ngày kết thúc', 'Số khách', 'Giá', 'Ngôn ngữ', 'HDV'];
            const csvRows = [
                headers.join(','),
                ...rows.map(r =>
                    [`"${r.title}"`, r.status, `"${r.city}"`, `"${r.location}"`, r.startDate, r.endDate, r.pax, r.price, r.language, `"${r.guide}"`].join(',')
                ),
            ];

            return new NextResponse(csvRows.join('\n'), {
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename="lunavia-tours-${new Date().toISOString().split('T')[0]}.csv"`,
                },
            });

        } else if (['SUPER_ADMIN', 'ADMIN'].includes(role)) {
            // Admin platform export
            const [tours, users, revenue] = await Promise.all([
                prisma.tour.count(),
                prisma.user.count(),
                prisma.platformRevenue.aggregate({ _sum: { amount: true } }),
            ]);

            const statusBreakdown = await prisma.tour.groupBy({
                by: ['status'],
                _count: { id: true },
            });

            const data = {
                exportDate: new Date().toISOString(),
                totalTours: tours,
                totalUsers: users,
                totalRevenue: revenue._sum.amount || 0,
                statusBreakdown: statusBreakdown.map(s => ({
                    status: s.status,
                    count: s._count.id,
                })),
            };

            return NextResponse.json({ success: true, data });
        }

        return NextResponse.json({ success: false, error: 'Export not available for your role' }, { status: 403 });

    } catch (error: any) {
        console.error('[export] Error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
