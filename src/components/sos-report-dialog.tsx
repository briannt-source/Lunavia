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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

interface SOSReportDialogProps {
  tourId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function SOSReportDialog({
  tourId,
  open,
  onOpenChange,
  onSuccess,
}: SOSReportDialogProps) {
  const t = useTranslations("Components.SOSReport");
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"SOS" | "EMERGENCY" | "INCIDENT">("SOS");
  const [severity, setSeverity] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error("Please describe the incident");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/tours/${tourId}/emergency`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          severity,
          description,
          location: location.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error submitting report");
      }

      toast.success("SOS report sent. The operator will be notified immediately.");
      setDescription("");
      setLocation("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Error submitting report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>{t("desc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="type">{t("severityLabel")}</Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SOS">SOS - Emergency assistance needed</SelectItem>
                <SelectItem value="EMERGENCY">EMERGENCY - Critical situation</SelectItem>
                <SelectItem value="INCIDENT">INCIDENT - Incident occurred</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="severity">{t("severityLabel")}</Label>
            <Select value={severity} onValueChange={(v: any) => setSeverity(v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">LOW</SelectItem>
                <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                <SelectItem value="HIGH">HIGH</SelectItem>
                <SelectItem value="CRITICAL">CRITICAL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">{t("descriptionLabel")} *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the incident or situation requiring assistance..."
              className="mt-1"
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="location">{t("locationLabel")}</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Address or coordinates..."
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t("cancel")}
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={loading || !description.trim()}>
            {loading ? t("sending") : t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
