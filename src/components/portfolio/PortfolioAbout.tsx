'use client';

import { useState } from 'react';
import { PencilIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface PortfolioAboutProps {
    user: any;
    isEditable?: boolean;
    onUpdate?: (data: any) => Promise<void>;
}

export default function PortfolioAbout({ user, isEditable = false, onUpdate }: PortfolioAboutProps) {
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bio, setBio] = useState(user.bio || '');

    // Parse JSON fields safely
    const [skills, setSkills] = useState<string[]>(
        typeof user.skills === 'string' ? JSON.parse(user.skills) : (user.skills || [])
    );
    const [languages, setLanguages] = useState<any[]>(
        typeof user.languages === 'string' ? JSON.parse(user.languages) : (user.languages || [])
    );

    const [newSkill, setNewSkill] = useState('');

    // Since skills/languages are arrays, we update immediately for UI responsiveness but might want to debounce save or save on explicit action for complex objects.
    // For simplicity, we'll save individually or have a save button for sections.

    const handleSaveBio = async () => {
        if (!onUpdate) return;
        await onUpdate({ bio });
        setIsEditingBio(false);
    };

    const handleAddSkill = async () => {
        if (!newSkill.trim() || !onUpdate) return;
        const updatedSkills = [...skills, newSkill.trim()];
        setSkills(updatedSkills);
        setNewSkill('');
        await onUpdate({ skills: updatedSkills });
    };

    const handleRemoveSkill = async (skillToRemove: string) => {
        if (!onUpdate) return;
        const updatedSkills = skills.filter(s => s !== skillToRemove);
        setSkills(updatedSkills);
        await onUpdate({ skills: updatedSkills });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            {/* About Section */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-900">About</h2>
                    {isEditable && !isEditingBio && (
                        <button onClick={() => setIsEditingBio(true)} className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1">
                            <PencilIcon className="h-4 w-4" /> Edit
                        </button>
                    )}
                </div>

                {isEditingBio ? (
                    <div>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={6}
                            className="w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                            placeholder="Tell us about your professional experience..."
                        />
                        <div className="flex gap-2">
                            <button onClick={handleSaveBio} className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">Save Bio</button>
                            <button onClick={() => setIsEditingBio(false)} className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <div className="prose prose-sm max-w-none text-gray-600">
                        {bio ? (
                            <p className="whitespace-pre-line">{bio}</p>
                        ) : (
                            <p className="italic text-gray-400">No bio added yet.</p>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Skills */}
                <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-3">Skills & Expertise</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {skills.map((skill, idx) => (
                            <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700">
                                {skill}
                                {isEditable && (
                                    <button onClick={() => handleRemoveSkill(skill)} className="ml-1 text-indigo-400 hover:text-indigo-900">
                                        <XMarkIcon className="h-3 w-3" />
                                    </button>
                                )}
                            </span>
                        ))}
                        {skills.length === 0 && <span className="text-gray-400 text-sm italic">No skills listed</span>}
                    </div>

                    {isEditable && (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                placeholder="Add skill..."
                                className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:border-indigo-500"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                            />
                            <button onClick={handleAddSkill} className="p-1 bg-gray-100 rounded hover:bg-gray-200">
                                <PlusIcon className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Languages - Simplified for MVP (Just string array or simple object) */}
                {/* For MVP let's assume languages is stored as simple array like skills for now, or handle object structure later */}
                {/* Reusing skill logic broadly for simplicity, or just text block */}
                <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-3">Languages</h3>
                    {/* Placeholder for Languages UI - can be similar to skills or distinct with proficiency levels */}
                    <p className="text-sm text-gray-500 italic">Language editing coming soon.</p>
                    {/* To keep it simple, we skip complex language editor for this turn unless specified */}
                </div>
            </div>
        </div>
    );
}
