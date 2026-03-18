"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface ChatMessage {
    id: string;
    tourId: string;
    senderId: string;
    role: string;
    content: string;
    createdAt: string;
    sender: {
        id: string;
        name?: string;
        email: string;
        avatarUrl?: string;
    };
}

interface TourChatPanelProps {
    tourId: string;
    isAdminView?: boolean;
}

export default function TourChatPanel({ tourId, isAdminView = false }: TourChatPanelProps) {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/requests/${tourId}/chat`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.data || []);
                setError(null);
            } else {
                if (res.status === 403) {
                    setError('Unauthorized to view this chat.');
                } else {
                    setError('Failed to load chat.');
                }
            }
        } catch (err) {
            setError('Network error getting chat.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tourId) {
            fetchMessages();
            // Polling every 10 seconds for new messages
            const interval = setInterval(fetchMessages, 10000);
            return () => clearInterval(interval);
        }
    }, [tourId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const res = await fetch(`/api/requests/${tourId}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage }),
            });

            if (res.ok) {
                const data = await res.json();
                setMessages((prev) => [...prev, data.data]);
                setNewMessage('');
            } else {
                alert('Failed to send message');
            }
        } catch (err) {
            alert('Network error sending message');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <div className="p-4 text-center text-sm text-gray-500 animate-pulse bg-gray-50 rounded-lg border border-gray-100">Loading chat...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">{error}</div>;
    }

    return (
        <div className="flex flex-col h-[500px] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-shrink-0">
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-lg">💬</span>
                    <h3 className="font-semibold text-gray-900">Tour Communication Log</h3>
                </div>
                {isAdminView && <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded">ADMIN AUDIT MODE</span>}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.length === 0 ? (
                    <div className="text-center text-sm text-gray-500 h-full flex flex-col justify-center italic">
                        No messages yet. Start the conversation.
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = session?.user?.id === msg.senderId;
                        const isSystem = msg.role === 'INTERNAL_ADMIN';

                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${isSystem ? 'items-center my-6' : ''}`}>
                                {!isSystem && !isMe && (
                                    <span className="text-[10px] text-gray-500 font-medium ml-1 mb-1">
                                        {msg.sender.name || msg.sender.email} ({msg.role})
                                    </span>
                                )}
                                
                                {isSystem ? (
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3 max-w-[85%] text-center shadow-sm">
                                        <div className="text-[10px] uppercase font-bold text-purple-700 tracking-wider mb-1 flex justify-center items-center gap-1">
                                            <span>🛡️</span> LUNAVIA OFFICIAL SUPPORT
                                        </div>
                                        <p className="text-sm text-purple-900 font-medium">{msg.content}</p>
                                        <span className="text-[10px] text-purple-400 mt-2 block">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ) : (
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                                            isMe
                                                ? 'bg-indigo-600 text-white rounded-tr-sm'
                                                : msg.role === 'OPERATOR' 
                                                    ? 'bg-blue-50 border border-blue-100 text-blue-900 rounded-tl-sm'
                                                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                        <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200">
                <div className="flex items-end gap-2">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                        placeholder={isAdminView ? "Inject Admin Message..." : "Type your message..."}
                        className="flex-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none outline-none"
                        rows={1}
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className={`h-11 px-6 rounded-xl text-sm font-medium text-white transition-colors flex-shrink-0 flex items-center justify-center min-w-[80px] ${
                            isAdminView
                                ? 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300'
                                : 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300'
                        }`}
                    >
                        {sending ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Send'
                        )}
                    </button>
                </div>
                <div className="mt-2 text-[10px] text-gray-400 text-center">
                    {isAdminView 
                        ? "Messages sent here will appear as official Lunavia Support to both parties." 
                        : "Messages are monitored for marketplace safety."}
                </div>
            </form>
        </div>
    );
}
