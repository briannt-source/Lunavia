"use client";
import { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import Skeleton, { TableSkeleton } from '@/components/ui/Skeleton';

// ── Types ────────────────────────────────────────────────────────────

interface Permission {
    id: string;
    code: string;
    description: string;
    category: string;
}

interface Role {
    id: string;
    name: string;
    description: string | null;
    permissions: string[];
    userCount: number;
    hasHighRisk: boolean;
}

interface AuditInfo {
    updatedBy: string;
    updatedAt: string;
    action: string;
}

// ── High-Risk Permissions (visual warning) ──────────────────────────

const HIGH_RISK_CODES = new Set([
    'WALLET_WITHDRAW_APPROVE',
    'ESCROW_RELEASE',
    'SYSTEM_CONFIG_UPDATE',
    'SYSTEM_MAINTENANCE',
    'PERMISSION_ASSIGN',
]);

// ── Main Component ──────────────────────────────────────────────────

export default function PermissionsAdminPage() {
    // Data state
    const [roles, setRoles] = useState<Role[]>([]);
    const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [lastAudit, setLastAudit] = useState<AuditInfo | null>(null);
    const [loading, setLoading] = useState(true);

    // UI state
    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
    const [editedPermissions, setEditedPermissions] = useState<Record<string, Set<string>>>({});
    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState<'grouped' | 'matrix'>('grouped');
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

    // ── Data Fetching ────────────────────────────────────────────────

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const res = await fetch('/api/admin/permissions');
            const data = await res.json();
            const fetchedRoles: Role[] = data.roles || [];
            setRoles(fetchedRoles);
            setAvailablePermissions(data.availablePermissions || []);
            setCategories(data.categories || []);
            setLastAudit(data.lastAudit || null);

            // Initialize edited permissions from fetched data
            const initial: Record<string, Set<string>> = {};
            fetchedRoles.forEach((r) => {
                initial[r.id] = new Set(r.permissions);
            });
            setEditedPermissions(initial);

            // Auto-select first role
            if (fetchedRoles.length > 0 && !selectedRoleId) {
                setSelectedRoleId(fetchedRoles[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch permissions:', error);
            toast.error('Failed to load permissions data');
        } finally {
            setLoading(false);
        }
    }

    // ── Derived State ────────────────────────────────────────────────

    const selectedRole = useMemo(
        () => roles.find((r) => r.id === selectedRoleId) || null,
        [roles, selectedRoleId]
    );

    const currentPermissions = useMemo(
        () => (selectedRoleId ? editedPermissions[selectedRoleId] || new Set<string>() : new Set<string>()),
        [selectedRoleId, editedPermissions]
    );

    const isDirty = useMemo(() => {
        if (!selectedRole || !selectedRoleId) return false;
        const original = new Set(selectedRole.permissions);
        const edited = editedPermissions[selectedRoleId];
        if (!edited) return false;
        if (original.size !== edited.size) return true;
        for (const code of original) {
            if (!edited.has(code)) return true;
        }
        return false;
    }, [selectedRole, selectedRoleId, editedPermissions]);

    const filteredPermissions = useMemo(() => {
        let perms = availablePermissions;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            perms = perms.filter(
                (p) =>
                    p.code.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q)
            );
        }
        if (categoryFilter) {
            perms = perms.filter((p) => p.category === categoryFilter);
        }
        return perms;
    }, [availablePermissions, searchQuery, categoryFilter]);

    const permissionsByCategory = useMemo(() => {
        const map: Record<string, Permission[]> = {};
        filteredPermissions.forEach((p) => {
            if (!map[p.category]) map[p.category] = [];
            map[p.category].push(p);
        });
        return map;
    }, [filteredPermissions]);

    const displayCategories = useMemo(() => {
        return categories.filter((c) => permissionsByCategory[c]?.length > 0);
    }, [categories, permissionsByCategory]);

    // ── Handlers ─────────────────────────────────────────────────────

    const togglePermission = useCallback((code: string) => {
        if (!selectedRoleId) return;
        setEditedPermissions((prev) => {
            const current = new Set(prev[selectedRoleId] || []);
            if (current.has(code)) {
                current.delete(code);
            } else {
                current.add(code);
            }
            return { ...prev, [selectedRoleId]: current };
        });
    }, [selectedRoleId]);

    const toggleCategoryAll = useCallback((category: string) => {
        if (!selectedRoleId) return;
        const categoryPerms = availablePermissions.filter((p) => p.category === category);
        setEditedPermissions((prev) => {
            const current = new Set(prev[selectedRoleId] || []);
            const allEnabled = categoryPerms.every((p) => current.has(p.code));
            categoryPerms.forEach((p) => {
                if (allEnabled) {
                    current.delete(p.code);
                } else {
                    current.add(p.code);
                }
            });
            return { ...prev, [selectedRoleId]: current };
        });
    }, [selectedRoleId, availablePermissions]);

    const grantAll = useCallback(() => {
        if (!selectedRoleId) return;
        setEditedPermissions((prev) => ({
            ...prev,
            [selectedRoleId]: new Set(availablePermissions.map((p) => p.code)),
        }));
    }, [selectedRoleId, availablePermissions]);

    const revokeAll = useCallback(() => {
        if (!selectedRoleId) return;
        setEditedPermissions((prev) => ({
            ...prev,
            [selectedRoleId]: new Set(),
        }));
    }, [selectedRoleId]);

    const copyFrom = useCallback((sourceRoleId: string) => {
        if (!selectedRoleId || sourceRoleId === selectedRoleId) return;
        const source = editedPermissions[sourceRoleId];
        if (source) {
            setEditedPermissions((prev) => ({
                ...prev,
                [selectedRoleId]: new Set(source),
            }));
        }
    }, [selectedRoleId, editedPermissions]);

    const saveChanges = useCallback(async () => {
        if (!selectedRoleId || !isDirty) return;
        setSaving(true);
        try {
            const perms = Array.from(editedPermissions[selectedRoleId] || []);
            const res = await fetch('/api/admin/permissions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roleId: selectedRoleId, permissions: perms }),
            });
            if (res.ok) {
                const result = await res.json();
                toast.success(result.message || 'Permissions updated');
                // Refresh data to sync
                await fetchData();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to save');
            }
        } catch {
            toast.error('Failed to save changes');
        } finally {
            setSaving(false);
        }
    }, [selectedRoleId, isDirty, editedPermissions]);

    const discardChanges = useCallback(() => {
        if (!selectedRole || !selectedRoleId) return;
        setEditedPermissions((prev) => ({
            ...prev,
            [selectedRoleId]: new Set(selectedRole.permissions),
        }));
    }, [selectedRole, selectedRoleId]);

    const toggleSection = useCallback((category: string) => {
        setCollapsedSections((prev) => {
            const next = new Set(prev);
            if (next.has(category)) {
                next.delete(category);
            } else {
                next.add(category);
            }
            return next;
        });
    }, []);

    // ── Loading State ────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <TableSkeleton />
            </div>
        );
    }

    // ── Render ───────────────────────────────────────────────────────

    return (
        <div className="flex flex-col h-[calc(100vh-120px)]">
            {/* Header */}
            <div className="mb-6 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Permission Management</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage role-based permissions across the platform
                        </p>
                    </div>
                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grouped')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'grouped'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Grouped View
                        </button>
                        <button
                            onClick={() => setViewMode('matrix')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'matrix'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Matrix View
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex gap-6 flex-1 min-h-0">
                {/* ── Left Panel: Role List ───────────────────────────────── */}
                <div className="w-64 flex-shrink-0 flex flex-col">
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col flex-1">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Roles</h2>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {roles.map((role) => {
                                const isSelected = role.id === selectedRoleId;
                                const editedCount = editedPermissions[role.id]?.size || 0;
                                const originalCount = role.permissions.length;
                                const roleIsDirty = editedCount !== originalCount ||
                                    !role.permissions.every((p) => editedPermissions[role.id]?.has(p));

                                return (
                                    <button
                                        key={role.id}
                                        onClick={() => setSelectedRoleId(role.id)}
                                        className={`w-full px-4 py-3 text-left transition-all border-b border-gray-50 last:border-b-0 ${isSelected
                                            ? 'bg-indigo-50 border-l-2 border-l-indigo-600'
                                            : 'hover:bg-gray-50 border-l-2 border-l-transparent'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 min-w-0">
                                                {role.hasHighRisk && (
                                                    <span title="Contains high-risk permissions" className="text-amber-500 flex-shrink-0">
                                                        ⚠
                                                    </span>
                                                )}
                                                <span className={`text-sm font-medium truncate ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>
                                                    {role.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                {roleIsDirty && (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700">
                                                        Changed
                                                    </span>
                                                )}
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${isSelected
                                                    ? 'bg-indigo-100 text-indigo-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {editedCount}/{availablePermissions.length}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-[11px] text-gray-400 mt-0.5">
                                            {role.userCount} user{role.userCount !== 1 ? 's' : ''}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Right Panel ─────────────────────────────────────────── */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Search + Filter Bar */}
                    <div className="flex gap-3 mb-4 flex-shrink-0">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search permissions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition outline-none"
                            />
                            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition outline-none"
                        >
                            <option value="">All categories</option>
                            {categories.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Bulk Actions */}
                    {selectedRole && viewMode === 'grouped' && (
                        <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                            <button
                                onClick={grantAll}
                                className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition"
                            >
                                Grant All
                            </button>
                            <button
                                onClick={revokeAll}
                                className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition"
                            >
                                Revoke All
                            </button>
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">Copy from:</span>
                                <select
                                    onChange={(e) => {
                                        if (e.target.value) copyFrom(e.target.value);
                                        e.target.value = '';
                                    }}
                                    className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 focus:border-indigo-500 transition outline-none"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Select role…</option>
                                    {roles
                                        .filter((r) => r.id !== selectedRoleId)
                                        .map((r) => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                        {!selectedRole ? (
                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                                Select a role to manage its permissions
                            </div>
                        ) : viewMode === 'grouped' ? (
                            /* ── Grouped View ───── */
                            <div className="divide-y divide-gray-100">
                                {displayCategories.map((category) => {
                                    const perms = permissionsByCategory[category] || [];
                                    const enabledCount = perms.filter((p) => currentPermissions.has(p.code)).length;
                                    const isCollapsed = collapsedSections.has(category);

                                    return (
                                        <div key={category}>
                                            {/* Section Header */}
                                            <button
                                                onClick={() => toggleSection(category)}
                                                className="w-full px-5 py-3 flex items-center justify-between bg-gray-50/50 hover:bg-gray-50 transition"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <svg
                                                        className={`h-4 w-4 text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                    <span className="text-sm font-semibold text-gray-700">{category}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${enabledCount === perms.length
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : enabledCount > 0
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-gray-100 text-gray-500'
                                                        }`}>
                                                        {enabledCount}/{perms.length}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleCategoryAll(category);
                                                        }}
                                                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium transition"
                                                    >
                                                        {enabledCount === perms.length ? 'Deselect all' : 'Select all'}
                                                    </button>
                                                </div>
                                            </button>

                                            {/* Permission Cards */}
                                            {!isCollapsed && (
                                                <div className="px-5 py-3 grid gap-2">
                                                    {perms.map((perm) => {
                                                        const enabled = currentPermissions.has(perm.code);
                                                        const isHighRisk = HIGH_RISK_CODES.has(perm.code);

                                                        return (
                                                            <label
                                                                key={perm.code}
                                                                className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ${enabled
                                                                    ? isHighRisk
                                                                        ? 'bg-amber-50/50 border-amber-200'
                                                                        : 'bg-indigo-50/50 border-indigo-200'
                                                                    : 'bg-white border-gray-100 hover:border-gray-200'
                                                                    }`}
                                                            >
                                                                {/* Toggle Switch */}
                                                                <div className="relative flex-shrink-0">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={enabled}
                                                                        onChange={() => togglePermission(perm.code)}
                                                                        className="sr-only peer"
                                                                    />
                                                                    <div className={`w-9 h-5 rounded-full transition-colors ${enabled
                                                                        ? isHighRisk ? 'bg-amber-500' : 'bg-indigo-600'
                                                                        : 'bg-gray-200'
                                                                        }`} />
                                                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-4' : ''
                                                                        }`} />
                                                                </div>
                                                                {/* Label */}
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm font-mono font-medium text-gray-900">{perm.code}</span>
                                                                        {isHighRisk && (
                                                                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                                                                                HIGH RISK
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs text-gray-500 mt-0.5">{perm.description}</p>
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {displayCategories.length === 0 && (
                                    <div className="px-5 py-12 text-center text-gray-400 text-sm">
                                        No permissions match your search
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* ── Matrix View ───── */
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 min-w-[200px]">
                                                Permission
                                            </th>
                                            {roles.map((r) => (
                                                <th key={r.id} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        {r.hasHighRisk && <span className="text-amber-500">⚠</span>}
                                                        <span>{r.name}</span>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {displayCategories.map((category) => (
                                            <>
                                                <tr key={`cat-${category}`} className="bg-gray-50/50">
                                                    <td colSpan={roles.length + 1} className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                        {category}
                                                    </td>
                                                </tr>
                                                {(permissionsByCategory[category] || []).map((perm) => {
                                                    const isHighRisk = HIGH_RISK_CODES.has(perm.code);
                                                    return (
                                                        <tr key={perm.code} className="hover:bg-gray-50/50">
                                                            <td className="px-4 py-2.5 sticky left-0 bg-white">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-mono text-gray-900">{perm.code}</span>
                                                                    {isHighRisk && (
                                                                        <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-red-100 text-red-600">⚠</span>
                                                                    )}
                                                                </div>
                                                                <p className="text-[11px] text-gray-400 mt-0.5 max-w-[200px] truncate">{perm.description}</p>
                                                            </td>
                                                            {roles.map((r) => {
                                                                const rolePerms = editedPermissions[r.id] || new Set<string>();
                                                                const hasIt = rolePerms.has(perm.code);
                                                                return (
                                                                    <td key={r.id} className="px-3 py-2.5 text-center">
                                                                        <div className={`inline-flex h-5 w-5 items-center justify-center rounded transition ${hasIt
                                                                            ? isHighRisk
                                                                                ? 'bg-amber-100 text-amber-700'
                                                                                : 'bg-emerald-100 text-emerald-700'
                                                                            : 'bg-gray-100 text-gray-300'
                                                                            }`}>
                                                                            {hasIt ? '✓' : '·'}
                                                                        </div>
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    );
                                                })}
                                            </>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Audit Info */}
                    {lastAudit && (
                        <div className="mt-4 flex items-center gap-4 text-[11px] text-gray-400 flex-shrink-0">
                            <span>
                                Last updated by <span className="text-gray-600 font-medium">{lastAudit.updatedBy}</span>
                            </span>
                            <span>
                                {new Date(lastAudit.updatedAt).toLocaleDateString('en-US', {
                                    year: 'numeric', month: 'short', day: 'numeric',
                                    hour: '2-digit', minute: '2-digit',
                                })}
                            </span>
                            <span className="text-gray-300">|</span>
                            <span>{lastAudit.action.replace(/_/g, ' ')}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Sticky Save Bar ─────────────────────────────────────────── */}
            {isDirty && (
                <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-sm shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
                    <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center px-2 py-1 rounded bg-amber-100 text-amber-700 text-xs font-medium">
                                Unsaved Changes
                            </span>
                            <span className="text-sm text-gray-600">
                                {selectedRole?.name} — {currentPermissions.size} permission{currentPermissions.size !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={discardChanges}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Discard
                            </button>
                            <button
                                onClick={saveChanges}
                                disabled={saving}
                                className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
                            >
                                {saving ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
