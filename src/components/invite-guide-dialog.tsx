"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import toast from "react-hot-toast";
import { Loader2, Mail, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";

interface InviteGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

export function InviteGuideDialog({
  open,
  onOpenChange,
  companyId,
}: InviteGuideDialogProps) {
  const t = useTranslations("Components.InviteGuide");
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [guideId, setGuideId] = useState("");
  const [inviteType, setInviteType] = useState<"email" | "guideId">("email");

  const inviteMutation = useMutation({
    mutationFn: (data: { email?: string; guideId?: string }) =>
      api.companies.invite(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companyGuides"] });
      queryClient.invalidateQueries({ queryKey: ["company"] });
      toast.success("Invitation sent successfully!");
      setEmail("");
      setGuideId("");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "An error occurred sending invitation");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteType === "email" && !email.trim()) {
      toast.error("Please enter email");
      return;
    }
    if (inviteType === "guideId" && !guideId.trim()) {
      toast.error("Please enter Guide ID");
      return;
    }

    inviteMutation.mutate(
      inviteType === "email"
        ? { email: email.trim() }
        : { guideId: guideId.trim() }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>{t("desc")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Invite Method</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="inviteType" value="email" checked={inviteType === "email"} onChange={(e) => setInviteType(e.target.value as "email")} className="w-4 h-4" />
                <span>Via Email</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="inviteType" value="guideId" checked={inviteType === "guideId"} onChange={(e) => setInviteType(e.target.value as "guideId")} className="w-4 h-4" />
                <span>Via Guide ID</span>
              </label>
            </div>
          </div>

          {inviteType === "email" ? (
            <div className="space-y-2">
              <Label htmlFor="email">Guide Email <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="email" type="email" placeholder="guide@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
              <p className="text-xs text-muted-foreground">The guide will receive an email invitation to join the company</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="guideId">Guide ID <span className="text-red-500">*</span></Label>
              <Input id="guideId" type="text" placeholder="GUIDE-20250115-0001" value={guideId} onChange={(e) => setGuideId(e.target.value)} required />
              <p className="text-xs text-muted-foreground">Enter the Guide ID of the guide you want to invite</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={inviteMutation.isPending}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={inviteMutation.isPending}>
              {inviteMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("sending")}</>
              ) : (
                <><UserPlus className="h-4 w-4 mr-2" />{t("sendInvite")}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
