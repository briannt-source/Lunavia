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
import { useTranslations } from "next-intl";

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
  const t = useTranslations("Components.Escrow");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"lock" | "release" | "refund" | null>(null);
  const [reason, setReason] = useState("");

  const handleLock = async () => {
    setIsLoading(true);
    try {
      await api.escrow.lock(escrowAccount.id);
      toast.success("Escrow locked successfully!");
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || "Error locking escrow");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRelease = async () => {
    if (!reason.trim()) {
      toast.error("Please enter a reason for releasing escrow");
      return;
    }
    setIsLoading(true);
    try {
      await api.escrow.release(escrowAccount.id, reason);
      toast.success("Escrow released successfully!");
      setIsDialogOpen(false);
      setReason("");
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || "Error releasing escrow");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!reason.trim()) {
      toast.error("Please enter a reason for refunding escrow");
      return;
    }
    setIsLoading(true);
    try {
      await api.escrow.refund(escrowAccount.id, reason);
      toast.success("Escrow refunded successfully!");
      setIsDialogOpen(false);
      setReason("");
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || "Error refunding escrow");
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
          <p className="text-sm text-muted-foreground">{t("status")}</p>
          <EscrowStatusBadge status={escrowAccount.status} className="mt-1" />
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">{t("amount")}</p>
          <p className="text-lg font-semibold">
            {escrowAccount.amount.toLocaleString("vi-VN")} VND
          </p>
          {escrowAccount.platformFee > 0 && (
            <p className="text-xs text-muted-foreground">
              {t("platformFee")}: {escrowAccount.platformFee.toLocaleString("vi-VN")} VND
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {t("netAmount")}: {escrowAccount.netAmount.toLocaleString("vi-VN")} VND
          </p>
        </div>
      </div>

      {escrowAccount.status === "PENDING" && (
        <Button onClick={handleLock} disabled={isLoading} className="w-full" variant="default">
          <Lock className="h-4 w-4 mr-2" />
          {t("lockEscrow")}
        </Button>
      )}

      {escrowAccount.status === "LOCKED" && (
        <div className="space-y-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog("release")} disabled={isLoading} className="w-full" variant="default">
                <Unlock className="h-4 w-4 mr-2" />
                {t("releaseEscrow")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("releaseTitle")}</DialogTitle>
                <DialogDescription>{t("releaseDesc")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>{t("releaseReason")}</Label>
                  <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Tour completed and guide submitted report" rows={3} />
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium">{t("paymentInfo")}</p>
                  <p className="text-sm">{t("amount")}: {escrowAccount.amount.toLocaleString("vi-VN")} VND</p>
                  {escrowAccount.platformFee > 0 && (
                    <p className="text-sm">{t("platformFee")}: {escrowAccount.platformFee.toLocaleString("vi-VN")} VND</p>
                  )}
                  <p className="text-sm font-medium">{t("guideWillReceive", { amount: escrowAccount.netAmount.toLocaleString("vi-VN") })}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsDialogOpen(false); setReason(""); }}>{t("cancel")}</Button>
                <Button onClick={handleRelease} disabled={isLoading || !reason.trim()}>{t("confirmRelease")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen && actionType === "refund"} onOpenChange={(open) => {
            if (!open) { setIsDialogOpen(false); setActionType(null); setReason(""); }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog("refund")} disabled={isLoading} className="w-full" variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                {t("refundEscrow")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("refundTitle")}</DialogTitle>
                <DialogDescription>{t("refundDesc")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>{t("refundReason")}</Label>
                  <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Tour cancelled or dispute resolved" rows={3} />
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium">{t("refundInfo")}</p>
                  <p className="text-sm">{t("amountToRefund", { amount: escrowAccount.amount.toLocaleString("vi-VN") })}</p>
                  {escrowAccount.platformFee > 0 && (
                    <p className="text-sm">{t("platformFee")}: {escrowAccount.platformFee.toLocaleString("vi-VN")} VND</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsDialogOpen(false); setActionType(null); setReason(""); }}>{t("cancel")}</Button>
                <Button onClick={handleRefund} disabled={isLoading || !reason.trim()}>{t("confirmRefund")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {escrowAccount.status === "RELEASED" && escrowAccount.releasedAt && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-sm text-green-800">
            <CheckCircle2 className="h-4 w-4 inline mr-1" />
            {t("releasedAt")}{" "}
            {new Date(escrowAccount.releasedAt).toLocaleString("vi-VN")}
          </p>
        </div>
      )}

      {escrowAccount.status === "REFUNDED" && escrowAccount.refundedAt && (
        <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
          <p className="text-sm text-orange-800">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            {t("refundedAt")}{" "}
            {new Date(escrowAccount.refundedAt).toLocaleString("vi-VN")}
          </p>
        </div>
      )}
    </div>
  );
}
