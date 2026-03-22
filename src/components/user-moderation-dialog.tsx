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
import { useTranslations } from "next-intl";

interface UserModerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    email: string;
    isBlocked: boolean;
    blockReason?: string;
    blockNotes?: string;
  };
  onSuccess?: () => void;
}

const BLOCK_REASONS = [
  { value: "FRAUD", label: "Fraud/Scam" },
  { value: "POLICY_VIOLATION", label: "Policy Violation" },
  { value: "INAPPROPRIATE_BEHAVIOR", label: "Inappropriate Behavior" },
  { value: "SPAM", label: "Spam/System Abuse" },
  { value: "FALSE_INFORMATION", label: "False Information" },
  { value: "UNAUTHORIZED_ACTIVITY", label: "Unauthorized Activity" },
  { value: "LEGAL_VIOLATION", label: "Legal Violation" },
  { value: "UNETHICAL_BEHAVIOR", label: "Unethical Behavior" },
  { value: "SAFETY_CONCERN", label: "Safety Concern" },
  { value: "OTHER", label: "Other" },
];

export function UserModerationDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: UserModerationDialogProps) {
  const t = useTranslations("Components.UserModeration");
  const [action, setAction] = useState<"block" | "unblock">(
    user.isBlocked ? "unblock" : "block"
  );
  const [reason, setReason] = useState<string>(user.blockReason || "");
  const [notes, setNotes] = useState<string>(user.blockNotes || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (action === "block" && !reason) {
      toast.error("Please select a reason for blocking user");
      return;
    }

    setLoading(true);
    try {
      await api.admin.users.block(user.id, action, {
        reason: action === "block" ? reason : undefined,
        notes: notes || undefined,
      });

      toast.success(
        action === "block"
          ? "User blocked successfully"
          : "User unblocked successfully"
      );
      onOpenChange(false);
      setReason("");
      setNotes("");
      onSuccess?.();
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
                <AlertTriangle className="h-5 w-5 text-red-600" />
                {t("blockTitle")}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                {t("unblockTitle")}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {action === "block" ? t("blockDesc") : t("unblockDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {action === "block" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="reason">{t("reasonLabel")} *</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger id="reason">
                    <SelectValue placeholder="Select reason for blocking" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOCK_REASONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add detailed notes about the blocking reason..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </>
          )}

          {action === "unblock" && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-green-900">
                The user will be unblocked and can use the platform normally again.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t("cancel")}
          </Button>
          <Button
            variant={action === "block" ? "destructive" : "default"}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? t("processing") : action === "block" ? t("confirmBlock") : t("confirmUnblock")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
