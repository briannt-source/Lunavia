"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api-client";
import toast from "react-hot-toast";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface TourModerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tour: {
    id: string;
    title: string;
    isBlocked: boolean;
    blockReason?: string;
    blockNotes?: string;
  };
  onSuccess?: () => void;
}

const BLOCK_REASONS = [
  { value: "MISINFORMATION", label: "Misinformation" },
  { value: "INAPPROPRIATE_CONTENT", label: "Inappropriate Content" },
  { value: "POLICY_VIOLATION", label: "Policy Violation" },
  { value: "MISSING_INFO", label: "Missing Information" },
  { value: "SPAM", label: "Spam/System Abuse" },
  { value: "FALSE_CLAIMS", label: "False Claims" },
  { value: "COPYRIGHT_VIOLATION", label: "Copyright Violation" },
  { value: "UNAUTHORIZED_CONTACT", label: "Unauthorized Contact Info" },
  { value: "LEGAL_VIOLATION", label: "Legal Violation" },
  { value: "UNETHICAL_BEHAVIOR", label: "Unethical Behavior" },
  { value: "OTHER", label: "Other" },
];

export function TourModerationDialog({
  open,
  onOpenChange,
  tour,
  onSuccess,
}: TourModerationDialogProps) {
  const [action, setAction] = useState<"block" | "unblock">(
    tour.isBlocked ? "unblock" : "block"
  );
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (action === "block" && !reason) {
      toast.error("Please select a reason for closing the tour");
      return;
    }

    setLoading(true);
    try {
      await api.tours.moderate(tour.id, action, {
        reason: action === "block" ? reason : undefined,
        notes: notes || undefined,
      });

      toast.success(
        action === "block"
          ? "Tour has been closed successfully"
          : "Tour has been reopened successfully"
      );
      onOpenChange(false);
      setReason("");
      setNotes("");
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {action === "block" ? (
              <>
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Đóng Tour
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Mở lại Tour
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {action === "block"
              ? `Bạn có chắc chắn muốn đóng tour "${tour.title}"? Tour sẽ biến mất khỏi marketplace và tour operator sẽ nhận được thông báo.`
              : `Bạn có chắc chắn muốn mở lại tour "${tour.title}"? Tour sẽ xuất hiện lại trên marketplace.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {action === "block" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason đóng tour *</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger id="reason">
                    <SelectValue placeholder="Select reason for closing tour" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOCK_REASONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {tour.isBlocked && tour.blockReason && (
                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <p className="text-sm font-medium text-slate-700 mb-1">
                    Reason đóng trước đó:
                  </p>
                  <p className="text-sm text-slate-600">
                    {
                      BLOCK_REASONS.find((r) => r.value === tour.blockReason)
                        ?.label || tour.blockReason
                    }
                  </p>
                  {tour.blockNotes && (
                    <p className="text-xs text-slate-500 mt-2">
                      {tour.blockNotes}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">
              Notes {action === "block" ? "(optional)" : "(optional)"}
            </Label>
            <Textarea
              id="notes"
              placeholder={
                action === "block"
                  ? "Enter detailed notes about why this tour is being closed..."
                  : "Enter notes about reopening this tour..."
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
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
            onClick={handleSubmit}
            disabled={loading || (action === "block" && !reason)}
            variant={action === "block" ? "destructive" : "default"}
          >
            {loading
              ? "Processing..."
              : action === "block"
              ? "Close Tour"
              : "Reopen Tour"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

