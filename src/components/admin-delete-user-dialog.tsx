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

interface AdminDeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    email: string;
    role: string;
    _count?: {
      tours?: number;
      applications?: number;
      assignments?: number;
    };
  };
  onSuccess?: () => void;
}

export function AdminDeleteUserDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: AdminDeleteUserDialogProps) {
  const t = useTranslations("Components.AdminDeleteUser");
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete user "${user.email}"?\n\nThis action cannot be undone!`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.admin.users.delete(user.id);
      toast.success("User deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      onOpenChange(false);
      setTimeout(() => { window.location.reload(); }, 500);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "An error occurred deleting user");
    } finally {
      setIsDeleting(false);
    }
  };

  const toursCount = user._count?.tours || 0;
  const applicationsCount = user._count?.applications || 0;
  const assignmentsCount = user._count?.assignments || 0;
  const hasRelatedData = toursCount > 0 || applicationsCount > 0 || assignmentsCount > 0;

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
                <span className="text-sm font-medium text-slate-600">Email:</span>
                <p className="font-semibold text-slate-900">{user.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Role:</span>
                <p className="text-sm">{user.role.replace(/_/g, " ")}</p>
              </div>
            </div>
          </div>

          {hasRelatedData && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-2">This user has related data that will be deleted:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {toursCount > 0 && <li>{toursCount} tours</li>}
                  {applicationsCount > 0 && <li>{applicationsCount} applications</li>}
                  {assignmentsCount > 0 && <li>{assignmentsCount} assignments</li>}
                </ul>
                <p className="mt-2 font-semibold">All related data will be permanently deleted!</p>
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">
              <strong>Warning:</strong> This action will permanently delete the user and all related data.
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
