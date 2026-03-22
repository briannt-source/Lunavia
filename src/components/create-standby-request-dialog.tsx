"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api-client";
import toast from "react-hot-toast";
import { DateTimePicker } from "@/components/date-time-picker";
import { useTranslations } from "next-intl";

interface CreateStandbyRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateStandbyRequestDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateStandbyRequestDialogProps) {
  const t = useTranslations("Components.StandbyRequest");
  const [formData, setFormData] = useState({
    title: "",
    city: "",
    requiredDate: "",
    budget: "",
    standbyFee: "",
    mainGuideId: "",
    subGuideId: "",
    description: "",
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.standby.create(data),
    onSuccess: () => {
      toast.success("Standby request created successfully!");
      onSuccess?.();
      setFormData({
        title: "",
        city: "",
        requiredDate: "",
        budget: "",
        standbyFee: "",
        mainGuideId: "",
        subGuideId: "",
        description: "",
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Unable to create standby request");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.city || !formData.requiredDate || !formData.budget) {
      toast.error("Please fill in all required fields");
      return;
    }

    mutation.mutate({
      title: formData.title,
      city: formData.city,
      requiredDate: formData.requiredDate,
      budget: parseFloat(formData.budget),
      standbyFee: formData.standbyFee ? parseFloat(formData.standbyFee) : undefined,
      mainGuideId: formData.mainGuideId || undefined,
      subGuideId: formData.subGuideId || undefined,
      description: formData.description || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("desc")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("titleLabel")}</Label>
            <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Standby for Hanoi tour on Jan 20" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">{t("cityLabel")}</Label>
              <Input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Hanoi" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requiredDate">{t("dateLabel")}</Label>
              <DateTimePicker
                label=""
                value={formData.requiredDate ? new Date(formData.requiredDate) : null}
                onChange={(dateString) => setFormData({ ...formData, requiredDate: dateString || "" })}
                min={new Date()}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">{t("budgetLabel")}</Label>
              <Input id="budget" type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} placeholder="1000000" required min="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="standbyFee">{t("standbyFeeLabel")}</Label>
              <Input id="standbyFee" type="number" value={formData.standbyFee} onChange={(e) => setFormData({ ...formData, standbyFee: e.target.value })} placeholder="200000" min="0" />
              <p className="text-xs text-slate-500">{t("standbyFeeHint")}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mainGuideId">{t("mainGuideLabel")}</Label>
              <Input id="mainGuideId" value={formData.mainGuideId} onChange={(e) => setFormData({ ...formData, mainGuideId: e.target.value })} placeholder="Guide ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subGuideId">{t("subGuideLabel")}</Label>
              <Input id="subGuideId" value={formData.subGuideId} onChange={(e) => setFormData({ ...formData, subGuideId: e.target.value })} placeholder="Guide ID" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("descriptionLabel")}</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe standby requirements in detail..." rows={4} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t("creating") : t("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
