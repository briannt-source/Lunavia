import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Link } from '@/navigation';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const role = (session.user as any)?.role;
  const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR", "OPS_CS", "FINANCE", "FINANCE_LEAD", "SUPPORT_STAFF", "KYC_ANALYST"];
  const isAdmin = role && (role.startsWith("ADMIN_") || ADMIN_ROLES.includes(role));

  if (!isAdmin) {
    redirect("/dashboard");
  }

  // Determine effective admin role
  let adminRole = "SUPPORT_STAFF";
  if (role?.startsWith("ADMIN_")) adminRole = role.replace("ADMIN_", "");
  else if (ADMIN_ROLES.includes(role)) adminRole = role;

  const isSuperAdmin = adminRole === "SUPER_ADMIN";
  const isModerator = adminRole === "MODERATOR" || isSuperAdmin;
  const isOps = adminRole === "OPS_CS" || isModerator;
  const isFinance = adminRole === "FINANCE" || adminRole === "FINANCE_LEAD" || isSuperAdmin;

  // Stats — all queries wrapped individually to prevent cascade failure
  const safe = async <T,>(fn: () => Promise<T>, fallback: T): Promise<T> => {
    try { return await fn(); } catch (e) { console.error("[admin-dashboard]", e); return fallback; }
  };

  const totalUsers = await safe(() => prisma.user.count(), 0);
  const totalOperators = await safe(() => prisma.user.count({ where: { role: { in: ["TOUR_OPERATOR", "TOUR_AGENCY"] } } }), 0);
  const totalGuides = await safe(() => prisma.user.count({ where: { role: "TOUR_GUIDE" } }), 0);
  const totalTours = await safe(() => prisma.tour.count(), 0);
  const activeTours = await safe(() => prisma.tour.count({ where: { status: "OPEN" } }), 0);
  const pendingDisputes = await safe(() => prisma.dispute.count({ where: { status: "PENDING" } }), 0);
  const pendingVerifications = await safe(() => prisma.verification.count({ where: { status: "PENDING" } }), 0);
  const pendingTopUps = await safe(() => prisma.topUpRequest.count({ where: { status: "PENDING" } }), 0);
  const pendingWithdrawals = await safe(() => prisma.withdrawalRequest.count({ where: { status: "PENDING" } }), 0);

  // Quick action links based on role
  const quickActions = [
    ...(isOps ? [
      { href: "/dashboard/admin/users", label: "Users", icon: "👥", desc: "Manage marketplace users", color: "bg-blue-50 border-blue-200 text-blue-700" },
      { href: "/dashboard/admin/tours", label: "Tours", icon: "🗺️", desc: "Tour control center", color: "bg-teal-50 border-teal-200 text-teal-700" },
      { href: "/dashboard/admin/companies", label: "Companies", icon: "🏢", desc: "Manage companies", color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
    ] : []),
    ...(isOps || adminRole === "KYC_ANALYST" ? [
      { href: "/dashboard/admin/verification", label: "Verifications", icon: "🛡️", desc: `${pendingVerifications} pending`, color: pendingVerifications > 0 ? "bg-amber-50 border-amber-300 text-amber-800" : "bg-green-50 border-green-200 text-green-700" },
    ] : []),
    ...(isOps ? [
      { href: "/dashboard/admin/disputes", label: "Disputes", icon: "⚖️", desc: `${pendingDisputes} pending`, color: pendingDisputes > 0 ? "bg-red-50 border-red-300 text-red-700" : "bg-green-50 border-green-200 text-green-700" },
      { href: "/dashboard/admin/incidents", label: "Incidents", icon: "🚨", desc: "View incidents", color: "bg-red-50 border-red-200 text-red-600" },
      { href: "/dashboard/admin/feedback", label: "Feedback", icon: "💬", desc: "User feedback", color: "bg-purple-50 border-purple-200 text-purple-700" },
      { href: "/dashboard/admin/requests", label: "Requests", icon: "📋", desc: "Service requests", color: "bg-gray-50 border-gray-200 text-gray-700" },
    ] : []),
    ...(isFinance ? [
      { href: "/dashboard/admin/finance/escrow/topups", label: "Top-ups", icon: "⬆️", desc: `${pendingTopUps} pending`, color: pendingTopUps > 0 ? "bg-amber-50 border-amber-300 text-amber-800" : "bg-green-50 border-green-200 text-green-700" },
      { href: "/dashboard/admin/finance/escrow/withdrawals", label: "Withdrawals", icon: "⬇️", desc: `${pendingWithdrawals} pending`, color: pendingWithdrawals > 0 ? "bg-amber-50 border-amber-300 text-amber-800" : "bg-green-50 border-green-200 text-green-700" },
      { href: "/dashboard/admin/finance/escrow/ledger", label: "Ledger", icon: "📒", desc: "Escrow ledger", color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
      { href: "/dashboard/admin/transfers", label: "Transfers", icon: "↔️", desc: "Fund transfers", color: "bg-orange-50 border-orange-200 text-orange-700" },
    ] : []),
    ...(isSuperAdmin ? [
      { href: "/dashboard/admin/staff", label: "Staff", icon: "👤", desc: "Manage staff", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
      { href: "/dashboard/admin/admins", label: "Admins", icon: "🔐", desc: "Admin accounts", color: "bg-sky-50 border-sky-200 text-sky-700" },
      { href: "/dashboard/admin/god-mode", label: "God Mode", icon: "👁️", desc: "Full system view", color: "bg-violet-50 border-violet-200 text-violet-700" },
      { href: "/dashboard/admin/analytics", label: "Analytics", icon: "📊", desc: "Platform analytics", color: "bg-cyan-50 border-cyan-200 text-cyan-700" },
    ] : []),
  ];

  // Role display name
  const roleDisplayName: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    MODERATOR: "Moderator",
    OPS_CS: "Operations / CS",
    FINANCE: "Finance",
    FINANCE_LEAD: "Finance Lead",
    SUPPORT_STAFF: "Support Staff",
    KYC_ANALYST: "KYC Analyst",
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-300 text-sm mt-1">
              {session.user?.email} — <span className="font-semibold text-white">{roleDisplayName[adminRole] || adminRole}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{totalUsers}</p>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Total Users</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatBox label="Operators" value={totalOperators} icon="🏢" />
        <StatBox label="Guides" value={totalGuides} icon="🧑‍🏫" />
        <StatBox label="Tours" value={totalTours} icon="🗺️" sub={`${activeTours} open`} />
        {(isOps || adminRole === "KYC_ANALYST") && (
          <StatBox label="Verifications" value={pendingVerifications} icon="🛡️" alert={pendingVerifications > 0} />
        )}
        {isOps && (
          <StatBox label="Disputes" value={pendingDisputes} icon="⚖️" alert={pendingDisputes > 0} />
        )}
        {isFinance && (
          <StatBox label="Top-ups" value={pendingTopUps} icon="⬆️" alert={pendingTopUps > 0} />
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          ⚡ Quick Actions
          <span className="text-xs font-normal text-gray-400">({roleDisplayName[adminRole]})</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href as any}
              className={`group rounded-xl border p-4 transition-all hover:shadow-md hover:-translate-y-0.5 ${action.color}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{action.icon}</span>
                <div className="min-w-0">
                  <p className="font-bold text-sm">{action.label}</p>
                  <p className="text-xs opacity-70 truncate">{action.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Role Access Guide */}
      {isSuperAdmin && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">👑 Internal Roles Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <RoleCard role="SUPER_ADMIN" label="Super Admin" desc="Full system access — all sections" color="text-violet-700 bg-violet-50" />
            <RoleCard role="MODERATOR" label="Moderator" desc="Command Center + Full Operations" color="text-blue-700 bg-blue-50" />
            <RoleCard role="OPS_CS" label="Operations / CS" desc="Operations section (no God Mode/Fleet)" color="text-teal-700 bg-teal-50" />
            <RoleCard role="FINANCE" label="Finance" desc="Finance section + Escrow + Payments" color="text-amber-700 bg-amber-50" />
            <RoleCard role="FINANCE_LEAD" label="Finance Lead" desc="Finance section + Pitch Mode" color="text-orange-700 bg-orange-50" />
            <RoleCard role="SUPPORT_STAFF" label="Support Staff" desc="Dashboard + Analytics only" color="text-gray-700 bg-gray-50" />
            <RoleCard role="KYC_ANALYST" label="KYC Analyst" desc="Verification only" color="text-green-700 bg-green-50" />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Subcomponents ──────────────────────────────

function StatBox({ label, value, icon, sub, alert }: {
  label: string; value: number; icon: string; sub?: string; alert?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 text-center transition ${
      alert ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
    }`}>
      <span className="text-2xl">{icon}</span>
      <p className={`text-2xl font-bold mt-1 ${alert ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function RoleCard({ role, label, desc, color }: {
  role: string; label: string; desc: string; color: string;
}) {
  return (
    <div className={`rounded-lg border p-3 ${color}`}>
      <p className="font-bold text-sm">{label}</p>
      <p className="text-xs opacity-80 mt-0.5">{desc}</p>
      <p className="text-[10px] font-mono opacity-50 mt-1">{role}</p>
    </div>
  );
}
