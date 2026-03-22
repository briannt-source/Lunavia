'use client';

import { useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface WorkItem {
    role: string;
    company: string;
    start: string;
    end: string;
}

interface PortfolioTimelineProps {
    workHistory: any[]; // JSON parsed array
    isEditable?: boolean;
    onUpdate?: (data: any) => Promise<void>;
}

export default function PortfolioTimeline({ workHistory = [], isEditable = false, onUpdate }: PortfolioTimelineProps) {
    // Ensure workHistory is an array if passed as string JSON
    const initialHistory = Array.isArray(workHistory) ? workHistory : (typeof workHistory === 'string' ? JSON.parse(workHistory) : []);

    const [history, setHistory] = useState<WorkItem[]>(initialHistory);
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState<WorkItem>({ role: '', company: '', start: '', end: '' });

    const handleAdd = async () => {
        if (!newItem.role || !newItem.company || !onUpdate) return;
        const updated = [newItem, ...history];
        setHistory(updated);
        setNewItem({ role: '', company: '', start: '', end: '' });
        setIsAdding(false);
        await onUpdate({ workHistory: updated });
    };

    const handleRemove = async (index: number) => {
        if (!onUpdate) return;
        const updated = history.filter((_, i) => i !== index);
        setHistory(updated);
        await onUpdate({ workHistory: updated });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Experience Timeline</h2>
                {isEditable && !isAdding && (
                    <button onClick={() => setIsAdding(true)} className="text-[#5BA4CF] hover:text-indigo-800 text-sm flex items-center gap-1">
                        <PlusIcon className="h-4 w-4" /> Add Experience
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-gray-50 p-4 rounded-md mb-4 border border-[#5BA4CF]/20">
                    <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                            <label className="block text-xs font-medium text-gray-700">Role</label>
                            <input
                                value={newItem.role}
                                onChange={e => setNewItem({ ...newItem, role: e.target.value })}
                                className="border p-2 rounded text-sm w-full"
                                placeholder="e.g. Senior Guide"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700">Organization</label>
                            <input
                                value={newItem.company}
                                onChange={e => setNewItem({ ...newItem, company: e.target.value })}
                                className="border p-2 rounded text-sm w-full"
                                placeholder="e.g. Freelance"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700">Start Year</label>
                            <input
                                value={newItem.start}
                                onChange={e => setNewItem({ ...newItem, start: e.target.value })}
                                className="border p-2 rounded text-sm w-full"
                                placeholder="2020"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700">End Year</label>
                            <input
                                value={newItem.end}
                                onChange={e => setNewItem({ ...newItem, end: e.target.value })}
                                className="border p-2 rounded text-sm w-full"
                                placeholder="Present"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button onClick={() => setIsAdding(false)} className="text-gray-500 text-sm px-3 py-1">Cancel</button>
                        <button onClick={handleAdd} className="bg-lunavia-primary text-white px-3 py-1 rounded text-sm hover:bg-indigo-700">Add Entry</button>
                    </div>
                </div>
            )}

            <div className="space-y-6 border-l-2 border-gray-200 ml-3 pl-6 relative">
                {history.length === 0 && !isAdding && <p className="text-gray-400 italic text-sm">No work history added.</p>}

                {history.map((item, idx) => (
                    <div key={idx} className="relative group">
                        <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-white border-2 border-indigo-500"></span>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-md font-bold text-gray-900">{item.role}</h3>
                                <p className="text-sm text-[#5BA4CF] font-medium">{item.company}</p>
                                <p className="text-xs text-gray-500 mt-1">{item.start} – {item.end}</p>
                            </div>
                            {isEditable && (
                                <button onClick={() => handleRemove(idx)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
