'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface AvatarUploadProps {
    currentAvatarUrl?: string | null;
    userName?: string;
}

export function AvatarUpload({ currentAvatarUrl, userName }: AvatarUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { update } = useSession();

    const initials = userName?.slice(0, 2).toUpperCase() || 'NA';

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validations
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }
        if (file.size > 2 * 1024 * 1024) { // 2MB
            alert('File size must be less than 2MB');
            return;
        }

        setIsUploading(true);

        // 1. Upload File
        const formData = new FormData();
        formData.append('file', file);

        try {
            const uploadRes = await fetch('/api/uploads/avatar', {
                method: 'POST',
                body: formData,
            });

            if (!uploadRes.ok) throw new Error('Upload failed');

            const { url } = await uploadRes.json();
            setPreview(url);

            // 2. Update User Profile
            const updateRes = await fetch('/api/user/avatar', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatarUrl: url }),
            });

            if (!updateRes.ok) throw new Error('Profile update failed');

            // 3. Update Session
            await update({ user: { image: url } });

            router.refresh();
        } catch (error) {
            console.error('Avatar upload error:', error);
            alert('Failed to update avatar');
            setPreview(currentAvatarUrl || null); // Revert
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex items-center gap-6">
            <div className="relative group">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-md">
                    {preview ? (
                        <Image src={preview} alt="Profile" fill className="object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-2xl font-bold">
                            {initials}
                        </div>
                    )}
                </div>

                {/* Overlay for upload */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
                >
                    <span className="text-white text-xs font-medium">Change</span>
                </div>
            </div>

            <div>
                <button
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                >
                    {isUploading ? 'Uploading...' : 'Upload New Photo'}
                </button>
                <p className="text-xs text-gray-500 mt-1">JPG, GIF or PNG. Max size of 2MB.</p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
}
