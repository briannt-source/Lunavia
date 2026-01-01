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
  { value: "FRAUD", label: "Gian lận/Lừa đảo" },
  { value: "POLICY_VIOLATION", label: "Vi phạm quy định" },
  { value: "INAPPROPRIATE_BEHAVIOR", label: "Hành vi không phù hợp" },
  { value: "SPAM", label: "Spam/Lạm dụng hệ thống" },
  { value: "FALSE_INFORMATION", label: "Thông tin sai sự thật" },
  { value: "UNAUTHORIZED_ACTIVITY", label: "Hoạt động trái phép" },
  { value: "LEGAL_VIOLATION", label: "Vi phạm pháp luật" },
  { value: "UNETHICAL_BEHAVIOR", label: "Hành vi không đạo đức" },
  { value: "SAFETY_CONCERN", label: "Lo ngại về an toàn" },
  { value: "OTHER", label: "Lý do khác" },
];

export function UserModerationDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: UserModerationDialogProps) {
  const [action, setAction] = useState<"block" | "unblock">(
    user.isBlocked ? "unblock" : "block"
  );
  const [reason, setReason] = useState<string>(user.blockReason || "");
  const [notes, setNotes] = useState<string>(user.blockNotes || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (action === "block" && !reason) {
      toast.error("Vui lòng chọn lý do block user");
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
          ? "User đã được block thành công"
          : "User đã được unblock thành công"
      );
      onOpenChange(false);
      setReason("");
      setNotes("");
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
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
                Block User
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Unblock User
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {action === "block"
              ? `Bạn đang chuẩn bị block user: ${user.email}. User này sẽ không thể đăng nhập và sử dụng hệ thống.`
              : `Bạn đang chuẩn bị unblock user: ${user.email}. User này sẽ có thể đăng nhập và sử dụng hệ thống lại.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {action === "block" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="reason">Lý do block *</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger id="reason">
                    <SelectValue placeholder="Chọn lý do block" />
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

              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
                <Textarea
                  id="notes"
                  placeholder="Thêm ghi chú chi tiết về lý do block..."
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
                User sẽ được unblock và có thể sử dụng hệ thống lại bình thường.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Hủy
          </Button>
          <Button
            variant={action === "block" ? "destructive" : "default"}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Đang xử lý..."
              : action === "block"
              ? "Block User"
              : "Unblock User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

