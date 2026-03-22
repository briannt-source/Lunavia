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
import { useTranslations } from "next-intl";

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

export function AdminDeleteTourDialog({
  open,
  onOpenChange,
  tour,
  onSuccess,
}: AdminDeleteTourDialogProps) {
  const t = useTranslations("Components.AdminDeleteTour");
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete tour "${tour.title}"?\n\nThis action cannot be undone!`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.admin.tours.delete(tour.id);
      toast.success("Tour deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ["admin-tours"] });
      await queryClient.invalidateQueries({ queryKey: ["tours"] });
      await queryClient.invalidateQueries({ queryKey: ["tours", "browse"] });
      onOpenChange(false);
      setTimeout(() => { window.location.reload(); }, 500);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error deleting tour:", error);
      toast.error(error.message || "An error occurred deleting tour");
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
            {t("title")}
          </DialogTitle>
          <DialogDescription>{t("desc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-4 bg-slate-50">
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-slate-600">Tour:</span>
                <p className="font-semibold text-slate-900">{tour.title}</p>
              </div>
              {tour.code && (
                <div>
                  <span className="text-sm font-medium text-slate-600">Code:</span>
                  <p className="font-mono text-sm">{tour.code}</p>
                </div>
              )}
            </div>
          </div>

          {hasRelatedData && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-2">This tour has related data that will be deleted:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {applicationsCount > 0 && <li>{applicationsCount} applications</li>}
                  {assignmentsCount > 0 && <li>{assignmentsCount} assignments</li>}
                  {paymentsCount > 0 && <li>{paymentsCount} payments (tourId will be set to null)</li>}
                  {reportsCount > 0 && <li>{reportsCount} tour reports</li>}
                </ul>
                <p className="mt-2 font-semibold">All related data will be permanently deleted!</p>
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">
              <strong>Warning:</strong> This action will permanently delete the tour and all related data.
              Are you sure you want to proceed?
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            {t("cancel")}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? t("deleting") : t("confirmDelete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
