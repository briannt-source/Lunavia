import { prisma } from '@/lib/prisma';
import { CompanyMemberRole } from '@prisma/client';

// ── Permission Matrix ─────────────────────────────────────────────────
// OWNER: Full control — company creator
// MANAGER: Create/edit tours, manage staff/guides, view finance
// OPERATOR_STAFF: Create tours, follow assigned tours
// VIEWER: Read-only dashboard access
// GUIDE: Existing guide behavior (apply for tours)

const TOUR_CREATORS: CompanyMemberRole[] = ['OWNER', 'MANAGER', 'OPERATOR_STAFF'];
const TOUR_EDITORS_ALL: CompanyMemberRole[] = ['OWNER', 'MANAGER'];
const TOUR_DELETERS: CompanyMemberRole[] = ['OWNER', 'MANAGER'];
const TEAM_MANAGERS: CompanyMemberRole[] = ['OWNER', 'MANAGER'];
const FINANCE_VIEWERS: CompanyMemberRole[] = ['OWNER', 'MANAGER'];
const DASHBOARD_VIEWERS: CompanyMemberRole[] = ['OWNER', 'MANAGER', 'OPERATOR_STAFF', 'VIEWER'];

// ── Core Membership Lookup ────────────────────────────────────────────

export interface CompanyMembership {
  memberId: string;
  companyId: string;
  role: CompanyMemberRole;
  company: {
    id: string;
    name: string;
    companyId: string;
  };
}

/**
 * Get a user's company membership. Also checks if user is the company OWNER
 * (via Company.operatorId) even if no CompanyMember record exists.
 */
export async function getCompanyMembership(userId: string): Promise<CompanyMembership | null> {
  // 1. Check CompanyMember record first
  const member = await prisma.companyMember.findUnique({
    where: { userId },
    include: {
      company: { select: { id: true, name: true, companyId: true, operatorId: true } },
    },
  });

  if (member && member.status === 'APPROVED') {
    return {
      memberId: member.id,
      companyId: member.companyId,
      role: member.role,
      company: {
        id: member.company.id,
        name: member.company.name,
        companyId: member.company.companyId,
      },
    };
  }

  // 2. Fallback: check if user is the Company.operatorId (legacy owner)
  const ownedCompany = await prisma.company.findUnique({
    where: { operatorId: userId },
    select: { id: true, name: true, companyId: true },
  });

  if (ownedCompany) {
    return {
      memberId: '', // No member record yet (will be auto-created)
      companyId: ownedCompany.id,
      role: 'OWNER',
      company: ownedCompany,
    };
  }

  return null;
}

// ── Permission Checks ─────────────────────────────────────────────────

export function canCreateTour(role: CompanyMemberRole): boolean {
  return TOUR_CREATORS.includes(role);
}

export function canEditTour(role: CompanyMemberRole, isOwnTour: boolean): boolean {
  if (TOUR_EDITORS_ALL.includes(role)) return true;
  if (role === 'OPERATOR_STAFF' && isOwnTour) return true;
  return false;
}

export function canDeleteTour(role: CompanyMemberRole): boolean {
  return TOUR_DELETERS.includes(role);
}

export function canManageTeam(role: CompanyMemberRole): boolean {
  return TEAM_MANAGERS.includes(role);
}

export function canViewFinance(role: CompanyMemberRole): boolean {
  return FINANCE_VIEWERS.includes(role);
}

export function canViewDashboard(role: CompanyMemberRole): boolean {
  return DASHBOARD_VIEWERS.includes(role);
}

// ── Prisma Filter Builder ─────────────────────────────────────────────

/**
 * Returns a Prisma `where` clause to filter tours based on user's company role.
 * - OWNER/MANAGER: See all company tours
 * - OPERATOR_STAFF: See all company tours (they create tours, need full view)
 * - VIEWER: See all company tours (read-only)
 * - No company membership: See only own tours
 */
export async function getCompanyTourFilter(userId: string) {
  const membership = await getCompanyMembership(userId);

  if (membership && canViewDashboard(membership.role)) {
    return { companyId: membership.companyId };
  }

  // Solo operator — no company
  return { operatorId: userId };
}
