"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";

interface AdminDeleteTourDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tour: {
    id: string;
    title: string;
    code?: string | null;
    _count?: {
      applications?: number;
      assignments?: number;
      payments?: number;
      reports?: number;
    };
  };
  onSuccess?: () => void;
}

/**
 * Admin Delete Tour Dialog
 * 
 * Dialog để admin xác nhận xóa tour
 * Hiển thị thông tin tour và số lượng related records sẽ bị ảnh hưởng
 */
export function AdminDeleteTourDialog({
  open,
  onOpenChange,
  tour,
  onSuccess,
}: AdminDeleteTourDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tour "${tour.title}"?\n\nHành động này không thể hoàn tác!`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.admin.tours.delete(tour.id);
      toast.success("Tour đã được xóa thành công");
      
      // Invalidate React Query cache
      await queryClient.invalidateQueries({ queryKey: ["admin-tours"] });
      await queryClient.invalidateQueries({ queryKey: ["tours"] });
      await queryClient.invalidateQueries({ queryKey: ["tours", "browse"] });
      
      onOpenChange(false);
      
      // Force page reload to clear Next.js cache
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
      onSuccess?.();
    } catch (error: any) {
      console.error("Error deleting tour:", error);
      toast.error(error.message || "Có lỗi xảy ra khi xóa tour");
    } finally {
      setIsDeleting(false);
    }
  };

  const applicationsCount = tour._count?.applications || 0;
  const assignmentsCount = tour._count?.assignments || 0;
  const paymentsCount = tour._count?.payments || 0;
  const reportsCount = tour._count?.reports || 0;
  const hasRelatedData = applicationsCount > 0 || assignmentsCount > 0 || paymentsCount > 0 || reportsCount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Xóa Tour
          </DialogTitle>
          <DialogDescription>
            Bạn đang chuẩn bị xóa tour này. Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tour Info */}
          <div className="rounded-lg border p-4 bg-slate-50">
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-slate-600">Tour:</span>
                <p className="font-semibold text-slate-900">{tour.title}</p>
              </div>
              {tour.code && (
                <div>
                  <span className="text-sm font-medium text-slate-600">Mã tour:</span>
                  <p className="font-mono text-sm">{tour.code}</p>
                </div>
              )}
            </div>
          </div>

          {/* Warning if has related data */}
          {hasRelatedData && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-2">Tour này có dữ liệu liên quan sẽ bị xóa:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {applicationsCount > 0 && (
                    <li>{applicationsCount} ứng tuyển</li>
                  )}
                  {assignmentsCount > 0 && (
                    <li>{assignmentsCount} assignments</li>
                  )}
                  {paymentsCount > 0 && (
                    <li>{paymentsCount} payments (sẽ set tourId = null)</li>
                  )}
                  {reportsCount > 0 && (
                    <li>{reportsCount} báo cáo tour</li>
                  )}
                </ul>
                <p className="mt-2 font-semibold">Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn!</p>
              </AlertDescription>
            </Alert>
          )}

          {/* Confirmation */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">
              <strong>Lưu ý:</strong> Hành động này sẽ xóa vĩnh viễn tour và tất cả dữ liệu liên quan.
              Bạn có chắc chắn muốn tiếp tục?
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Đang xóa..." : "Xóa Tour"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

