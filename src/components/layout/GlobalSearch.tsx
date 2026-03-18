'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SearchResult {
    id: string;
    type: 'tour' | 'request' | 'guide';
    title: string;
    subtitle?: string;
}

export default function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Debounced search
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data.results || []);
                }
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard shortcut (Cmd+K / Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
                setIsOpen(true);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
                inputRef.current?.blur();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSelect = (result: SearchResult) => {
        setIsOpen(false);
        setQuery('');
        if (result.type === 'tour' || result.type === 'request') {
            router.push(`/dashboard/service-requests/${result.id}`);
        } else if (result.type === 'guide') {
            router.push(`/dashboard/operator/team/${result.id}`);
        }
    };

    const typeIcons: Record<string, string> = {
        tour: '📋',
        request: '📝',
        guide: '👤',
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Search Input */}
            <div className="relative">
                <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search tours, requests..."
                    value={query}
                    onChange={e => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="w-64 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 sm:inline">
                    ⌘K
                </kbd>
            </div>

            {/* Dropdown Results */}
            {isOpen && query.trim() && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                    {loading ? (
                        <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                    ) : results.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                            No results for "{query}"
                        </div>
                    ) : (
                        results.map(result => (
                            <button
                                key={`${result.type}-${result.id}`}
                                onClick={() => handleSelect(result)}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
                            >
                                <span className="text-lg">{typeIcons[result.type]}</span>
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-medium text-gray-900">
                                        {result.title}
                                    </div>
                                    {result.subtitle && (
                                        <div className="truncate text-xs text-gray-500">
                                            {result.subtitle}
                                        </div>
                                    )}
                                </div>
                                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 capitalize">
                                    {result.type}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
