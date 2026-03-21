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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api-client";
import toast from "react-hot-toast";
import { DateTimePicker } from "@/components/date-time-picker";

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
      // Reset form
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
          <DialogTitle>Tạo Standby Request</DialogTitle>
          <DialogDescription>
            Tạo yêu cầu standby để tìm guide sẵn sàng trong trường hợp khẩn cấp
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Standby for Hanoi tour on Jan 20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Hanoi"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requiredDate">Ngày yêu cầu *</Label>
              <DateTimePicker
                label=""
                value={formData.requiredDate ? new Date(formData.requiredDate) : null}
                onChange={(dateString) =>
                  setFormData({
                    ...formData,
                    requiredDate: dateString || "",
                  })
                }
                min={new Date()}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (VND) *</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="1000000"
                required
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="standbyFee">Standby Fee (VND) - Tùy chọn</Label>
              <Input
                id="standbyFee"
                type="number"
                value={formData.standbyFee}
                onChange={(e) => setFormData({ ...formData, standbyFee: e.target.value })}
                placeholder="200000"
                min="0"
              />
              <p className="text-xs text-slate-500">
                Phí standby sẽ được trả ngay khi guide accept request
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mainGuideId">Main Guide ID - Tùy chọn</Label>
              <Input
                id="mainGuideId"
                value={formData.mainGuideId}
                onChange={(e) => setFormData({ ...formData, mainGuideId: e.target.value })}
                placeholder="Guide ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subGuideId">Sub Guide ID - Tùy chọn</Label>
              <Input
                id="subGuideId"
                value={formData.subGuideId}
                onChange={(e) => setFormData({ ...formData, subGuideId: e.target.value })}
                placeholder="Guide ID"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description - Tùy chọn</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe standby requirements in detail..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : "Create Standby Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

