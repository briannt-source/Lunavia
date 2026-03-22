"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/lib/api-client";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { Calendar, MapPin, DollarSign, CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from '@/navigation';

export default function GuideStandbyRequestsPage() {
  const queryClient = useQueryClient();

  const { data: standbyRequests, isLoading } = useQuery({
    queryKey: ["standbyRequests", "guide"],
    queryFn: () => api.standby.list(),
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => api.standby.accept(id),
    onSuccess: () => {
      toast.success("Standby request accepted!");
      queryClient.invalidateQueries({ queryKey: ["standbyRequests"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Unable to accept standby request");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.standby.reject(id, reason),
    onSuccess: () => {
      toast.success("Standby request declined!");
      queryClient.invalidateQueries({ queryKey: ["standbyRequests"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Unable to decline standby request");
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "yellow";
      case "ACCEPTED":
        return "green";
      case "REJECTED":
        return "red";
      case "COMPLETED":
        return "blue";
      default:
        return "gray";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Awaiting Response";
      case "ACCEPTED":
        return "Approved";
      case "REJECTED":
        return "Rejected";
      case "COMPLETED":
        return "Completed";
      default:
        return status;
    }
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Standby Requests"
          description="Standby requests sent to you"
        />

        {isLoading ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-slate-500">Loading...</div>
            </CardContent>
          </Card>
        ) : !standbyRequests || standbyRequests.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No standby requests yet"
            description="You will be notified when an operator sends you a standby request"
          />
        ) : (
          <div className="grid gap-4">
            {standbyRequests.map((request: any) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {request.city}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDateTime(request.requiredDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          Budget: {formatCurrency(request.budget)}
                        </div>
                        {request.standbyFee && (
                          <div className="flex items-center gap-1 text-green-600 font-medium">
                            <DollarSign className="h-4 w-4" />
                            Standby Fee: {formatCurrency(request.standbyFee)}
                          </div>
                        )}
                      </div>
                    </div>
                    <StatusBadge
                      status={request.status}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {request.description && (
                    <p className="text-sm text-slate-600 mb-4">{request.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-500">
                      From: {request.operator?.profile?.name || request.operator?.email}
                    </div>
                    <div className="flex items-center gap-2">
                      {request.status === "PENDING" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => rejectMutation.mutate({ id: request.id })}
                            disabled={rejectMutation.isPending || acceptMutation.isPending}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => acceptMutation.mutate(request.id)}
                            disabled={acceptMutation.isPending || rejectMutation.isPending}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Accept
                          </Button>
                        </>
                      )}
                      <Link href={`/standby-requests/${request.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

