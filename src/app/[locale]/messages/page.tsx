"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MessageSquare, Clock, User } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function MessagesPage() {
  const { data: session } = useSession();
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => api.messages.getConversations(),
  });

  const userId = session?.user?.id;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center py-12">
          <p className="text-slate-600">Đang tải cuộc trò chuyện...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader
        title="Tin nhắn"
        description="Trao đổi với tour operator và guides"
      />

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={MessageSquare}
              title="Chưa có cuộc trò chuyện nào"
              description="Bắt đầu trao đổi với tour operator hoặc guide về tour"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation: any) => {
            const otherUser =
              conversation.operatorId === userId
                ? conversation.guide
                : conversation.operator;
            const lastMessage = conversation.messages?.[0];
            const unreadCount = conversation._count?.messages || 0;

            return (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.id}`}
                className="block"
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-slate-900 truncate">
                            {otherUser?.profile?.name || otherUser?.email}
                          </h3>
                          {unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-1 truncate">
                          Tour: {conversation.tour?.title || "N/A"}
                        </p>
                        {lastMessage && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <p className="truncate flex-1">
                              {lastMessage.content}
                            </p>
                            <span className="flex-shrink-0">
                              {formatDateTime(lastMessage.createdAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

