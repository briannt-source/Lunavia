import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { getCompanyMembership, canManageTeam } from '@/lib/company-permissions';

/**
 * GET /api/operator/guides
 * Returns company members (guides + staff) with role metadata.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const membership = await getCompanyMembership(session.user.id);
    if (!membership) {
      return NextResponse.json({ guides: [], staff: [], pendingInvites: [] });
    }

    // Get all company members
    const members = await prisma.companyMember.findMany({
      where: { companyId: membership.companyId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            verifiedStatus: true,
            trustScore: true,
            profile: {
              select: { name: true, photoUrl: true, languages: true, specialties: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Split members into guides and staff
    const guides = members
      .filter(m => m.role === 'GUIDE')
      .map(m => ({
        id: m.user.id,
        memberId: m.id,
        email: m.user.email,
        name: m.user.profile?.name || m.user.email.split('@')[0],
        photoUrl: m.user.profile?.photoUrl,
        trust: m.user.trustScore?.toString() || '100',
        kycStatus: m.user.verifiedStatus,
        languages: m.user.profile?.languages || [],
        specialties: m.user.profile?.specialties || [],
        role: m.role,
        status: m.status,
        companyEmail: m.companyEmail,
        contractVerified: m.contractVerified,
        approvedAt: m.approvedAt,
        metadata: {},
      }));

    const staff = members
      .filter(m => m.role !== 'GUIDE')
      .map(m => ({
        id: m.user.id,
        memberId: m.id,
        email: m.user.email,
        name: m.user.profile?.name || m.user.email.split('@')[0],
        photoUrl: m.user.profile?.photoUrl,
        role: m.role,
        status: m.status,
        companyEmail: m.companyEmail,
        approvedAt: m.approvedAt,
      }));

    // Get pending invitations
    const invites = await prisma.companyInvitation.findMany({
      where: {
        companyId: membership.companyId,
        status: 'PENDING',
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        invitedBy: true,
        createdAt: true,
        guide: {
          select: {
            id: true,
            email: true,
            profile: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const pendingInvites = invites.map(inv => ({
      id: inv.id,
      email: inv.email || inv.guide?.email || '',
      name: inv.guide?.profile?.name || inv.email || '',
      role: inv.role,
      status: inv.status,
      createdAt: inv.createdAt,
    }));

    return NextResponse.json({
      guides,
      staff,
      pendingInvites,
      companyName: membership.company.name,
      myRole: membership.role,
      canManageTeam: canManageTeam(membership.role),
    });
  } catch (error: any) {
    console.error('Error fetching team:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
