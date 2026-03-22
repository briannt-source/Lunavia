"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

const MEMBER_ROLES = [
  { value: "GUIDE", label: "Tour Guide", icon: "🧑‍🏫", desc: "Apply for tours, run tours" },
  { value: "MANAGER", label: "Manager", icon: "👔", desc: "Create/edit tours, manage team" },
  { value: "OPERATOR_STAFF", label: "Operations Staff", icon: "🎯", desc: "Create tours, follow assigned" },
  { value: "VIEWER", label: "Viewer", icon: "👁️", desc: "Read-only dashboard access" },
];

const INVITABLE_ROLES = [...MEMBER_ROLES];

interface Member {
  id: string;
  memberId: string;
  email: string;
  name: string;
  photoUrl?: string;
  role: string;
  status: string;
  companyEmail?: string;
  trust?: string;
  kycStatus?: string;
  contractVerified?: boolean;
  approvedAt?: string;
  languages?: string[];
  specialties?: string[];
}

interface PendingInvite {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function OperatorTeamPage() {
  const { data: session } = useSession();

  const [guides, setGuides] = useState<Member[]>([]);
  const [staff, setStaff] = useState<Member[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [myRole, setMyRole] = useState("");
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [tab, setTab] = useState<"guides" | "staff" | "invites">("guides");

  // Invite modal
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteGuideId, setInviteGuideId] = useState("");
  const [inviteMode, setInviteMode] = useState<"email" | "guideId">("email");
  const [inviteRole, setInviteRole] = useState("GUIDE");
  const [inviting, setInviting] = useState(false);

  // Role change
  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState("");

  // Delete confirm  
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { fetchTeam(); }, []);

  async function fetchTeam() {
    try {
      const res = await fetch("/api/operator/guides");
      if (res.ok) {
        const data = await res.json();
        setGuides(data.guides || []);
        setStaff(data.staff || []);
        setPendingInvites(data.pendingInvites || []);
        setCompanyName(data.companyName || "");
        setMyRole(data.myRole || "");
        setCanManage(data.canManageTeam ?? false);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleInvite() {
    const identifier = inviteMode === "email" ? inviteEmail : inviteGuideId;
    if (!identifier) { toast.error("Please enter an email or Guide ID"); return; }

    setInviting(true);
    try {
      const payload: any = { role: inviteRole };
      if (inviteMode === "email") payload.email = inviteEmail;
      else payload.guideId = inviteGuideId.trim();

      const res = await fetch("/api/operator/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Invitation sent!");
      setShowInvite(false);
      setInviteEmail(""); setInviteGuideId(""); setInviteRole("GUIDE");
      fetchTeam();
    } catch (err: any) {
      toast.error(err.message || "Failed to send invite");
    } finally { setInviting(false); }
  }

  async function handleChangeRole(memberId: string) {
    try {
      const res = await fetch(`/api/operator/team/members/${memberId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Role updated");
      setEditRoleId(null);
      fetchTeam();
    } catch (err: any) {
      toast.error(err.message || "Failed to change role");
    }
  }

  async function handleRemove(memberId: string) {
    try {
      const res = await fetch(`/api/operator/team/members/${memberId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Member removed");
      setDeleteId(null);
      fetchTeam();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove member");
    }
  }

  const roleColors: Record<string, string> = {
    GUIDE: "bg-blue-100 text-blue-700",
    MANAGER: "bg-violet-100 text-violet-700",
    OPERATOR_STAFF: "bg-teal-100 text-teal-700",
    VIEWER: "bg-gray-100 text-gray-600",
    OWNER: "bg-amber-100 text-amber-700",
  };

  const getRoleLabel = (r: string) => MEMBER_ROLES.find(m => m.value === r)?.label || r.replace(/_/g, " ");

  if (loading) return <div className="p-8 text-center text-gray-400">Loading team...</div>;

  const allMembers = [...staff, ...guides];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">👥 My Team</h1>
          <p className="text-sm text-gray-500 mt-1">
            {companyName ? `${companyName} — ` : ""}
            {guides.length} guides, {staff.length} staff
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowInvite(true)}
            className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition flex items-center gap-2"
          >
            <span className="text-lg">+</span> Invite Member
          </button>
        )}
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {[
          { key: "guides" as const, label: `🧑‍🏫 Guides (${guides.length})` },
          { key: "staff" as const, label: `👔 Operations Staff (${staff.length})` },
          { key: "invites" as const, label: `📩 Pending Invites (${pendingInvites.length})` },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${
              tab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Guides Tab */}
      {tab === "guides" && (
        <div className="space-y-3">
          {guides.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200 text-gray-400">
              <p className="text-3xl mb-2">🧑‍🏫</p>
              <p>No guides in your team yet</p>
              {canManage && <p className="text-xs mt-1">Click "Invite Member" to add guides</p>}
            </div>
          ) : (
            guides.map(g => renderMemberCard(g))
          )}
        </div>
      )}

      {/* Staff Tab */}
      {tab === "staff" && (
        <div className="space-y-3">
          {staff.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200 text-gray-400">
              <p className="text-3xl mb-2">👔</p>
              <p>No operations staff yet</p>
              {canManage && <p className="text-xs mt-1">Click "Invite Member" → select role (Manager / Operations Staff / Viewer)</p>}
            </div>
          ) : (
            staff.map(s => renderMemberCard(s))
          )}
        </div>
      )}

      {/* Pending Invites Tab */}
      {tab === "invites" && (
        <div className="space-y-3">
          {pendingInvites.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200 text-gray-400">
              <p className="text-3xl mb-2">📩</p>
              <p>No pending invitations</p>
            </div>
          ) : (
            pendingInvites.map(inv => (
              <div key={inv.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 font-bold">
                    ✉️
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{inv.name || inv.email}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColors[inv.role] || roleColors.GUIDE}`}>
                        {getRoleLabel(inv.role)}
                      </span>
                      <span className="text-xs text-gray-400">
                        Sent {new Date(inv.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold">Pending</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Invite Team Member</h2>

            {/* Role Selector */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Role</label>
              <div className="grid grid-cols-2 gap-2">
                {INVITABLE_ROLES.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setInviteRole(r.value)}
                    className={`p-3 rounded-lg border text-left transition ${
                      inviteRole === r.value
                        ? "border-violet-400 bg-violet-50 ring-2 ring-violet-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-lg">{r.icon}</span>
                    <p className="font-semibold text-sm mt-1">{r.label}</p>
                    <p className="text-[10px] text-gray-400">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setInviteMode("email")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition border ${
                  inviteMode === "email" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-500 border-gray-200"
                }`}
              >
                📧 By Email
              </button>
              <button
                onClick={() => setInviteMode("guideId")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition border ${
                  inviteMode === "guideId" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-500 border-gray-200"
                }`}
              >
                🆔 By User ID
              </button>
            </div>

            {inviteMode === "email" ? (
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@email.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
              />
            ) : (
              <input
                type="text"
                value={inviteGuideId}
                onChange={(e) => setInviteGuideId(e.target.value)}
                placeholder="User ID (cuid)"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-mono focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
              />
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setShowInvite(false); setInviteEmail(""); setInviteGuideId(""); setInviteRole("GUIDE"); }}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={inviting}
                className="px-5 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 transition"
              >
                {inviting ? "Sending..." : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-400 text-center">
        {allMembers.length} team member(s) • {pendingInvites.length} pending invite(s)
      </div>
    </div>
  );

  // ── Member Card ──
  function renderMemberCard(member: Member) {
    const isEditing = editRoleId === member.memberId;
    const isDeleting = deleteId === member.memberId;
    const isSelf = session?.user?.id === member.id;

    return (
      <div key={member.memberId} className={`bg-white rounded-xl border p-4 transition ${
        isDeleting ? "border-red-300 bg-red-50/30" : "border-gray-200"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {member.photoUrl ? (
              <img src={member.photoUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
            ) : (
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${roleColors[member.role] || "bg-gray-100 text-gray-600"}`}>
                {member.name[0]?.toUpperCase() || "?"}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                {member.name}
                {isSelf && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">You</span>}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColors[member.role] || "bg-gray-100"}`}>
                  {getRoleLabel(member.role)}
                </span>
                <span className="text-xs text-gray-400">{member.email}</span>
                {member.kycStatus === "APPROVED" && (
                  <span className="text-xs text-green-600 font-medium">✓ KYC</span>
                )}
                {member.contractVerified && (
                  <span className="text-xs text-blue-600 font-medium">✓ Contract</span>
                )}
              </div>
            </div>
          </div>

          {canManage && !isSelf && member.role !== "OWNER" && !isEditing && !isDeleting && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setEditRoleId(member.memberId); setNewRole(member.role); }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                Change Role
              </button>
              <button
                onClick={() => setDeleteId(member.memberId)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Role Change Inline */}
        {isEditing && (
          <div className="mt-3 flex items-center gap-3 bg-gray-50 rounded-lg p-3">
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm flex-1"
            >
              {MEMBER_ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>
              ))}
            </select>
            <button
              onClick={() => handleChangeRole(member.memberId)}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 transition"
            >
              Save
            </button>
            <button
              onClick={() => setEditRoleId(null)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Delete Confirmation */}
        {isDeleting && (
          <div className="mt-3 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-3">
            <span className="text-red-600 text-sm font-medium flex-1">
              ⚠️ Remove <strong>{member.name}</strong> from the company? They will lose access.
            </span>
            <button
              onClick={() => handleRemove(member.memberId)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition"
            >
              Confirm
            </button>
            <button
              onClick={() => setDeleteId(null)}
              className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }
}
