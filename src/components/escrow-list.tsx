"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EscrowStatusBadge } from "./escrow-status-badge";
import { EscrowActions } from "./escrow-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Shield } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface EscrowListProps {
  tourId?: string;
  guideId?: string;
  operatorId?: string;
  showActions?: boolean;
}

export function EscrowList({
  tourId,
  guideId,
  operatorId,
  showActions = true,
}: EscrowListProps) {
  const { data: escrowAccounts, isLoading, refetch } = useQuery({
    queryKey: ["escrow", { tourId, guideId, operatorId }],
    queryFn: () => api.escrow.list({ tourId, guideId, operatorId }),
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Đang tải escrow accounts...</p>
        </CardContent>
      </Card>
    );
  }

  if (!escrowAccounts || escrowAccounts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={Shield}
            title="Chưa có escrow account"
            description="Escrow accounts sẽ được tạo tự động khi operator chấp nhận application"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {escrowAccounts.map((escrow: any) => (
        <Card key={escrow.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Escrow Account #{escrow.id.slice(-8)}
              </CardTitle>
              <EscrowStatusBadge status={escrow.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Guide</p>
                <p className="font-medium">
                  {escrow.guide?.profile?.name || escrow.guide?.email}
                </p>
              </div>
              {escrow.tour && (
                <div>
                  <p className="text-sm text-muted-foreground">Tour</p>
                  <p className="font-medium">{escrow.tour.title}</p>
                  {escrow.tour.code && (
                    <p className="text-xs text-muted-foreground">
                      {escrow.tour.code}
                    </p>
                  )}
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Số tiền</p>
                <p className="font-semibold text-lg">
                  {formatCurrency(escrow.amount)} VND
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Số tiền nhận</p>
                <p className="font-semibold text-lg">
                  {formatCurrency(escrow.netAmount)} VND
                </p>
                {escrow.platformFee > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Phí nền tảng: {formatCurrency(escrow.platformFee)} VND
                  </p>
                )}
              </div>
            </div>

            {escrow.lockedAt && (
              <div>
                <p className="text-sm text-muted-foreground">Đã khóa vào</p>
                <p className="text-sm">{formatDate(escrow.lockedAt)}</p>
              </div>
            )}

            {escrow.releasedAt && (
              <div>
                <p className="text-sm text-muted-foreground">Đã giải phóng vào</p>
                <p className="text-sm">{formatDate(escrow.releasedAt)}</p>
                {escrow.releaseReason && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Lý do: {escrow.releaseReason}
                  </p>
                )}
              </div>
            )}

            {escrow.refundedAt && (
              <div>
                <p className="text-sm text-muted-foreground">Đã hoàn tiền vào</p>
                <p className="text-sm">{formatDate(escrow.refundedAt)}</p>
                {escrow.refundReason && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Lý do: {escrow.refundReason}
                  </p>
                )}
              </div>
            )}

            {showActions && escrow.status !== "RELEASED" && escrow.status !== "REFUNDED" && (
              <EscrowActions
                escrowAccount={escrow}
                tourId={escrow.tourId}
                guideId={escrow.guideId}
                onUpdate={refetch}
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

