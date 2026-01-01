"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, RotateCcw, AlertCircle, CheckCircle2 } from "lucide-react";
import { EscrowStatusBadge } from "./escrow-status-badge";
import { api } from "@/lib/api-client";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface EscrowActionsProps {
  escrowAccount: {
    id: string;
    status: "PENDING" | "LOCKED" | "RELEASED" | "REFUNDED" | "CANCELLED";
    amount: number;
    platformFee: number;
    netAmount: number;
    lockedAt?: Date | null;
    releasedAt?: Date | null;
    refundedAt?: Date | null;
  };
  tourId?: string;
  guideId?: string;
  onUpdate?: () => void;
}

export function EscrowActions({
  escrowAccount,
  tourId,
  guideId,
  onUpdate,
}: EscrowActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"lock" | "release" | "refund" | null>(null);
  const [reason, setReason] = useState("");

  const handleLock = async () => {
    setIsLoading(true);
    try {
      await api.escrow.lock(escrowAccount.id);
      toast.success("Đã khóa escrow thành công!");
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi khóa escrow");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRelease = async () => {
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do giải phóng escrow");
      return;
    }

    setIsLoading(true);
    try {
      await api.escrow.release(escrowAccount.id, reason);
      toast.success("Đã giải phóng escrow thành công!");
      setIsDialogOpen(false);
      setReason("");
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi giải phóng escrow");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do hoàn tiền escrow");
      return;
    }

    setIsLoading(true);
    try {
      await api.escrow.refund(escrowAccount.id, reason);
      toast.success("Đã hoàn tiền escrow thành công!");
      setIsDialogOpen(false);
      setReason("");
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi hoàn tiền escrow");
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = (type: "release" | "refund") => {
    setActionType(type);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Trạng thái Escrow</p>
          <EscrowStatusBadge status={escrowAccount.status} className="mt-1" />
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Số tiền</p>
          <p className="text-lg font-semibold">
            {escrowAccount.amount.toLocaleString("vi-VN")} VND
          </p>
          {escrowAccount.platformFee > 0 && (
            <p className="text-xs text-muted-foreground">
              Phí nền tảng: {escrowAccount.platformFee.toLocaleString("vi-VN")} VND
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Số tiền nhận: {escrowAccount.netAmount.toLocaleString("vi-VN")} VND
          </p>
        </div>
      </div>

      {escrowAccount.status === "PENDING" && (
        <Button
          onClick={handleLock}
          disabled={isLoading}
          className="w-full"
          variant="default"
        >
          <Lock className="h-4 w-4 mr-2" />
          Khóa Escrow
        </Button>
      )}

      {escrowAccount.status === "LOCKED" && (
        <div className="space-y-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => openDialog("release")}
                disabled={isLoading}
                className="w-full"
                variant="default"
              >
                <Unlock className="h-4 w-4 mr-2" />
                Giải phóng Escrow
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Giải phóng Escrow</DialogTitle>
                <DialogDescription>
                  Giải phóng escrow sẽ chuyển tiền vào ví của guide. Hành động này không thể hoàn tác.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Lý do giải phóng</Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ví dụ: Tour đã hoàn thành và guide đã nộp báo cáo"
                    rows={3}
                  />
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium">Thông tin thanh toán:</p>
                  <p className="text-sm">
                    Số tiền: {escrowAccount.amount.toLocaleString("vi-VN")} VND
                  </p>
                  {escrowAccount.platformFee > 0 && (
                    <p className="text-sm">
                      Phí nền tảng: {escrowAccount.platformFee.toLocaleString("vi-VN")} VND
                    </p>
                  )}
                  <p className="text-sm font-medium">
                    Guide sẽ nhận: {escrowAccount.netAmount.toLocaleString("vi-VN")} VND
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setReason("");
                  }}
                >
                  Hủy
                </Button>
                <Button onClick={handleRelease} disabled={isLoading || !reason.trim()}>
                  Xác nhận giải phóng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen && actionType === "refund"} onOpenChange={(open) => {
            if (!open) {
              setIsDialogOpen(false);
              setActionType(null);
              setReason("");
            }
          }}>
            <DialogTrigger asChild>
              <Button
                onClick={() => openDialog("refund")}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Hoàn tiền Escrow
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hoàn tiền Escrow</DialogTitle>
                <DialogDescription>
                  Hoàn tiền escrow sẽ trả lại số tiền đã khóa vào ví của operator. Hành động này không thể hoàn tác.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Lý do hoàn tiền</Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ví dụ: Tour đã bị hủy hoặc tranh chấp đã được giải quyết"
                    rows={3}
                  />
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium">Thông tin hoàn tiền:</p>
                  <p className="text-sm">
                    Số tiền sẽ được hoàn: {escrowAccount.amount.toLocaleString("vi-VN")} VND
                  </p>
                  {escrowAccount.platformFee > 0 && (
                    <p className="text-sm">
                      Phí nền tảng: {escrowAccount.platformFee.toLocaleString("vi-VN")} VND
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setActionType(null);
                    setReason("");
                  }}
                >
                  Hủy
                </Button>
                <Button onClick={handleRefund} disabled={isLoading || !reason.trim()}>
                  Xác nhận hoàn tiền
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {escrowAccount.status === "RELEASED" && escrowAccount.releasedAt && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-sm text-green-800">
            <CheckCircle2 className="h-4 w-4 inline mr-1" />
            Escrow đã được giải phóng vào{" "}
            {new Date(escrowAccount.releasedAt).toLocaleString("vi-VN")}
          </p>
        </div>
      )}

      {escrowAccount.status === "REFUNDED" && escrowAccount.refundedAt && (
        <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
          <p className="text-sm text-orange-800">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            Escrow đã được hoàn tiền vào{" "}
            {new Date(escrowAccount.refundedAt).toLocaleString("vi-VN")}
          </p>
        </div>
      )}
    </div>
  );
}

