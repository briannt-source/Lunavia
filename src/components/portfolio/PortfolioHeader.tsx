'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { CameraIcon, CheckBadgeIcon, PencilIcon } from '@heroicons/react/24/solid';

interface PortfolioHeaderProps {
    user: any;
    isEditable?: boolean;
    onUpdate?: (data: any) => Promise<void>;
}

export default function PortfolioHeader({ user, isEditable = false, onUpdate }: PortfolioHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user.name || '');
    const [avatarPreview, setAvatarPreview] = useState<string>(user.avatarUrl || '');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = async () => {
        if (!onUpdate) return;
        await onUpdate({ name });
        setIsEditing(false);
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { alert('Please upload an image file'); return; }
        if (file.size > 2 * 1024 * 1024) { alert('File size must be less than 2MB'); return; }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const uploadRes = await fetch('/api/uploads/avatar', { method: 'POST', body: formData });
            if (!uploadRes.ok) throw new Error('Upload failed');
            const { url } = await uploadRes.json();
            setAvatarPreview(url);

            // Save to profile
            if (onUpdate) await onUpdate({ avatarUrl: url });
        } catch (err) {
            console.error('Avatar upload error:', err);
            alert('Failed to update avatar');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Avatar */}
                <div className="relative">
                    <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 relative">
                        {avatarPreview ? (
                            <Image
                                src={avatarPreview}
                                alt={user.name || 'User'}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                                <span className="text-3xl font-bold">{(user.name || user.email || 'U').charAt(0).toUpperCase()}</span>
                            </div>
                        )}
                    </div>

                    {isEditable && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center group cursor-pointer rounded-full"
                        >
                            <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-semibold">
                                {isUploading ? '...' : 'Change'}
                            </span>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                    />
                    {/* Trust Score Badge */}
                    <div className="absolute -bottom-2 -right-2 bg-lunavia-primary text-white text-xs font-bold px-2 py-1 rounded-full shadow-md border-2 border-white" title="Trust Score">
                        {user.trustScore || 0}
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                        {isEditing ? (
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="text-2xl font-bold text-gray-900 border-b border-gray-300 focus:border-indigo-500 focus:outline-none bg-transparent"
                                autoFocus
                            />
                        ) : (
                            <h1 className="text-2xl font-bold text-gray-900">{user.name || 'Unnamed User'}</h1>
                        )}

                        {user.verificationStatus === 'APPROVED' && (
                            <CheckBadgeIcon className="h-6 w-6 text-lunavia-primary" title="Verified" />
                        )}

                        {isEditable && !isEditing && (
                            <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-[#5BA4CF] ml-2">
                                <PencilIcon className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <p className="text-gray-500 font-medium mb-2">
                        {user.role === 'TOUR_OPERATOR' ? 'Tour Operator' : 'Professional Tour Guide'}
                        {user.experienceYears > 0 && ` • ${user.experienceYears} Years Exp`}
                    </p>

                    <p className="text-sm text-gray-400 flex items-center justify-center md:justify-start gap-1">
                        <span>Vietnam</span>
                    </p>

                    {isEditing && (
                        <div className="mt-3 flex gap-2 justify-center md:justify-start">
                            <button onClick={handleSave} className="px-3 py-1 bg-lunavia-primary text-white text-xs rounded hover:bg-indigo-700">Save</button>
                            <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300">Cancel</button>
                        </div>
                    )}
                </div>
            </div>

            {isEditable && (
                <div className="mt-4 border-t pt-4 text-xs text-gray-400">
                    <p>Identity verified by Lunavia.</p>
                </div>
            )}
        </div>
    );
}
