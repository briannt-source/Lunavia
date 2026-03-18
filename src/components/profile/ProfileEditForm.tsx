'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { VerificationBadge } from '@/components/common/VerificationBadge';
import { CopyIdButton } from '@/components/common/CopyIdButton';
import { formatDate } from '@/lib/utils';

interface ProfileEditFormProps {
    user: {
        id: string;
        name: string | null;
        email: string;
        role: string;
        avatarUrl: string | null;
        dateOfBirth: string | Date | null;
        experienceYears: number | null;
        trustScore: number;
        kybStatus?: string;
        kycStatus?: string;
        createdAt: string | Date;
        bio?: string | null;
        languages?: string | null;
        skills?: string | null;
        roleMetadata?: string | null;
    };
    role: 'TOUR_OPERATOR' | 'TOUR_GUIDE';
}

function formatRoleLabel(role: string): string {
    return role
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

export function ProfileEditForm({ user, role }: ProfileEditFormProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Editable fields
    const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth ? new Date(user.dateOfBirth as string).toISOString().split('T')[0] : '');
    const [experienceYears, setExperienceYears] = useState(user.experienceYears || 0);

    // Guide-specific editable fields
    const [bio, setBio] = useState(user.bio || '');
    const parsedSkills: string[] = user.skills ? (() => { try { return JSON.parse(user.skills); } catch { return []; } })() : [];
    const parsedLanguages: { language: string; level: string }[] = user.languages ? (() => { try { return JSON.parse(user.languages); } catch { return []; } })() : [];

    const [editSkills, setEditSkills] = useState(parsedSkills.join(', '));
    const [editLanguages, setEditLanguages] = useState(parsedLanguages.map(l => `${l.language} (${l.level})`).join(', '));

    // Operator-specific metadata
    const parsedMeta = user.roleMetadata ? (() => { try { return JSON.parse(user.roleMetadata as string); } catch { return {}; } })() : {};

    const trustScore = user.trustScore || 0;
    const verificationStatus = user.kybStatus || user.kycStatus || 'NOT_STARTED';

    async function handleSave() {
        setLoading(true);
        setError(null);

        try {
            // Parse comma-separated skills
            const formattedSkills = editSkills.split(',').map(s => s.trim()).filter(Boolean);
            
            // Parse languages: "English (Fluent), French (Basic)" -> [{language: "English", level: "Fluent"}, ...]
            const formattedLanguages = editLanguages.split(',').map(l => {
                const match = l.trim().match(/^(.*?)\s*\((.*?)\)$/);
                if (match) return { language: match[1].trim(), level: match[2].trim() };
                return { language: l.trim(), level: 'Basic' }; // Default if no level specified
            }).filter(l => l.language);

            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dateOfBirth,
                    experienceYears: Number(experienceYears),
                    bio: bio || undefined,
                    skills: formattedSkills,
                    languages: formattedLanguages,
                })
            });

            if (!res.ok) throw new Error('Failed to update profile');

            setIsEditing(false);
            router.refresh();
        } catch {
            setError('Failed to save changes. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
                    {verificationStatus === 'APPROVED' && <VerificationBadge size="md" />}
                </div>
                <div className="flex items-center gap-2">
                    <CopyIdButton id={user.id} />
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                            Edit
                        </button>
                    )}
                </div>
            </div>

            <div className="mb-6 flex flex-col items-center sm:flex-row sm:items-start gap-4 pb-6 border-b border-gray-100">
                <AvatarUpload
                    currentAvatarUrl={user.avatarUrl}
                    userName={user.name || user.email}
                />
                <div className="flex-1 min-w-0 ml-4">
                    <h3 className="text-lg font-bold text-gray-900 truncate">
                        {user.name || 'No Name Set'}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-1" title="Name cannot be changed after registration">
                        🔒 Name is locked after registration
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Full Name (Read-only, locked) */}
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                    <div className="text-gray-900 font-medium flex items-center gap-2">
                        {user.name || '—'}
                        <span className="text-xs text-gray-400" title="Name cannot be changed after registration">🔒</span>
                    </div>
                </div>

                {/* Email (Read-only) */}
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                    <div className="text-gray-900">{user.email}</div>
                </div>

                {/* Role (Read-only) */}
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                    <div className="text-gray-900">{formatRoleLabel(user.role)}</div>
                </div>

                {/* Member Since (Read-only) */}
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Member Since</label>
                    <div className="text-gray-900">{formatDate(user.createdAt)}</div>
                </div>

                {/* Trust Score (Read-only) */}
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Trust Score</label>
                    <div className="mt-1 font-semibold text-indigo-600 space-x-2 flex items-center">
                        <span className="text-2xl">{trustScore.toFixed(0)}</span>
                        <span className="text-xs font-normal text-gray-400">(Base 0)</span>
                    </div>
                </div>

                {/* ── GUIDE-SPECIFIC FIELDS ── */}
                {role === 'TOUR_GUIDE' && (
                    <>
                        {/* Date of Birth */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Date of Birth</label>
                            {isEditing ? (
                                <input
                                    type="date"
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                />
                            ) : (
                                <div className="text-gray-900">{dateOfBirth ? formatDate(dateOfBirth) : '—'}</div>
                            )}
                        </div>

                        {/* Years of Experience */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Years of Experience</label>
                            {isEditing ? (
                                <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    value={experienceYears}
                                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                />
                            ) : (
                                <div className="text-gray-900">{experienceYears} years</div>
                            )}
                        </div>

                        {/* Bio */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Bio</label>
                            <div className="text-gray-900 text-sm whitespace-pre-wrap">{bio || '—'}</div>
                        </div>

                        {/* Skills */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Skills</label>
                            {isEditing ? (
                                <div>
                                    <input
                                        type="text"
                                        value={editSkills}
                                        onChange={(e) => setEditSkills(e.target.value)}
                                        placeholder="Photography, First Aid, History (comma separated)"
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Separate skills with commas.</p>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-1.5">
                                    {parsedSkills.length > 0 ? parsedSkills.map((s: string, i: number) => (
                                        <span key={i} className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 border border-green-200">
                                            {s}
                                        </span>
                                    )) : <span className="text-gray-400 text-sm">—</span>}
                                </div>
                            )}
                        </div>

                        {/* Languages */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Languages</label>
                            {isEditing ? (
                                <div>
                                    <input
                                        type="text"
                                        value={editLanguages}
                                        onChange={(e) => setEditLanguages(e.target.value)}
                                        placeholder="English (Fluent), Vietnamese (Native) (comma separated)"
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Format: Language (Level), e.g., English (Fluent)</p>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-1.5">
                                    {parsedLanguages.length > 0 ? parsedLanguages.map((l: { language: string; level: string }, i: number) => (
                                        <span key={i} className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">
                                            {l.language} ({l.level})
                                        </span>
                                    )) : <span className="text-gray-400 text-sm">—</span>}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* ── OPERATOR-SPECIFIC FIELDS ── */}
                {role === 'TOUR_OPERATOR' && (
                    <>
                        {/* Operator Type (Locked) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Operator Type</label>
                            <div className="text-gray-900 capitalize flex items-center gap-2">
                                {parsedMeta.operatorType || '—'}
                                <span className="text-xs text-gray-400" title="Set during registration">🔒</span>
                            </div>
                        </div>

                        {/* Business Registration (Locked) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Business Registration</label>
                            <div className="text-gray-900 flex items-center gap-2">
                                {parsedMeta.businessRegistrationNumber || '—'}
                                <span className="text-xs text-gray-400" title="Contact support to change">🔒</span>
                            </div>
                        </div>

                        {/* Tour License (Locked) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Tour License</label>
                            <div className="text-gray-900 flex items-center gap-2">
                                {parsedMeta.tourLicenseNumber || '—'}
                                <span className="text-xs text-gray-400" title="Contact support to change">🔒</span>
                            </div>
                        </div>

                        {/* Bio (Editable) */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Company Bio</label>
                            {isEditing ? (
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={3}
                                    placeholder="Tell partners about your company..."
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                />
                            ) : (
                                <div className="text-gray-900 text-sm whitespace-pre-wrap">{bio || '—'}</div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {isEditing && (
                <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            setDateOfBirth(user.dateOfBirth ? new Date(user.dateOfBirth as string).toISOString().split('T')[0] : '');
                            setExperienceYears(user.experienceYears || 0);
                        }}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            )}
        </div>
    );
}
