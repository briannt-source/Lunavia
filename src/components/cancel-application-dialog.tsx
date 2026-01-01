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
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");

  // Calculate time until tour start
  const now = new Date();
  const tourStart = new Date(tourStartDate);
  const hoursUntilStart = (tourStart.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Calculate penalty
  let penaltyAmount: number | null = null;
  let penaltyMessage = "";
  if (hoursUntilStart <= 24) {
    penaltyAmount = 500000;
    penaltyMessage = "500,000 VND (hủy trong vòng 24h trước khi tour bắt đầu)";
  } else if (hoursUntilStart <= 48) {
    penaltyAmount = 200000;
    penaltyMessage = "200,000 VND (hủy trong vòng 48h trước khi tour bắt đầu)";
  }

  const handleCancel = async () => {
    if (!confirm(`Bạn có chắc muốn hủy ứng tuyển?${penaltyAmount ? `\n\nPhí hủy: ${penaltyMessage}` : ""}`)) {
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
        throw new Error(error.error || "Lỗi khi hủy ứng tuyển");
      }

      const result = await response.json();
      toast.success(result.message || "Đã hủy ứng tuyển thành công");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi hủy ứng tuyển");
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
            Hủy ứng tuyển
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc muốn hủy ứng tuyển cho tour {'"'}{tourTitle}{'"'}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {penaltyAmount && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-semibold text-amber-900 mb-1">
                ⚠️ Phí hủy tour
              </p>
              <p className="text-sm text-amber-700">
                Bạn sẽ bị trừ {penaltyMessage} từ ví của bạn.
              </p>
              <p className="text-xs text-amber-600 mt-2">
                Còn {Math.ceil(hoursUntilStart)} giờ nữa tour sẽ bắt đầu.
              </p>
            </div>
          )}

          {!penaltyAmount && hoursUntilStart > 48 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                ✓ Hủy tour trước 48 giờ sẽ không bị phạt tiền.
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="reason">Lý do hủy (tùy chọn)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do hủy ứng tuyển..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Xác nhận hủy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}






