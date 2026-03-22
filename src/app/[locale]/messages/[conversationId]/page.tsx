"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, User } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = session?.user?.id;

  // Get conversation details from conversations list
  const { data: conversations = [], isLoading: loadingConversation } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => api.messages.getConversations(),
  });

  const conversation = conversations.find((c: any) => c.id === conversationId);

  // Get messages
  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => api.messages.getMessages(conversationId),
    enabled: !!conversationId,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      api.messages.sendMessage(conversationId, content),
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Unable to send message");
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loadingConversation || loadingMessages) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">Loading messages...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!conversation) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-slate-600">
              Conversation not found
            </p>
            <div className="text-center mt-4">
              <Button onClick={() => router.push("/messages")} variant="outline">
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const otherUser =
    conversation.operatorId === userId ? conversation.guide : conversation.operator;

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-200px)]">
        {/* Header */}
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/messages")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {otherUser?.profile?.name || otherUser?.email}
                  </CardTitle>
                  <p className="text-sm text-slate-600">
                    Tour: {conversation.tour?.title || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Messages */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              messages.map((msg: any) => {
                const isOwn = msg.senderId === userId;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isOwn
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-900"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwn ? "text-blue-100" : "text-slate-500"
                        }`}
                      >
                        {formatDateTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSend} className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={sendMessageMutation.isPending}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              />
              <Button
                type="submit"
                disabled={!message.trim() || sendMessageMutation.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

