"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";

interface CancelApplicationDialogProps {
  applicationId: string;
  tourTitle: string;
  tourStartDate: Date;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CancelApplicationDialog({
  applicationId,
  tourTitle,
  tourStartDate,
  open,
  onOpenChange,
  onSuccess,
}: CancelApplicationDialogProps) {
  const t = useTranslations("Components.CancelApplication");
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");

  const now = new Date();
  const tourStart = new Date(tourStartDate);
  const hoursUntilStart = (tourStart.getTime() - now.getTime()) / (1000 * 60 * 60);

  let penaltyAmount: number | null = null;
  let penaltyMessage = "";
  if (hoursUntilStart <= 24) {
    penaltyAmount = 500000;
    penaltyMessage = "500,000 VND (cancelled within 24h of tour start)";
  } else if (hoursUntilStart <= 48) {
    penaltyAmount = 200000;
    penaltyMessage = "200,000 VND (cancelled within 48h of tour start)";
  }

  const handleCancel = async () => {
    if (!confirm(t("confirmPrompt") + (penaltyAmount ? `\n\n${penaltyMessage}` : ""))) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/applications/${applicationId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error cancelling application");
      }

      const result = await response.json();
      toast.success(result.message || "Application cancelled successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Error cancelling application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>
            {t("confirm", { tourTitle })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {penaltyAmount && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-semibold text-amber-900 mb-1">{t("penaltyTitle")}</p>
              <p className="text-sm text-amber-700">{t("penaltyDesc", { penaltyMessage })}</p>
              <p className="text-xs text-amber-600 mt-2">{t("hoursRemaining", { hours: Math.ceil(hoursUntilStart) })}</p>
            </div>
          )}

          {!penaltyAmount && hoursUntilStart > 48 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">{t("noPenalty")}</p>
            </div>
          )}

          <div>
            <Label htmlFor="reason">{t("reasonLabel")}</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t("cancel")}
          </Button>
          <Button variant="destructive" onClick={handleCancel} disabled={loading}>
            {loading ? "Processing..." : t("confirmCancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
