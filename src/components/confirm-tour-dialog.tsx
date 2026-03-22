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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, DollarSign } from "lucide-react";
import { formatVND } from "@/lib/utils";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

interface ConfirmTourDialogProps {
  tourId: string;
  guideId: string;
  guideName: string;
  tourTitle: string;
  requestedAmount?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (guideId: string, paymentAmount: number, notes?: string) => Promise<void>;
}

export function ConfirmTourDialog({
  tourId,
  guideId,
  guideName,
  tourTitle,
  requestedAmount,
  open,
  onOpenChange,
  onConfirm,
}: ConfirmTourDialogProps) {
  const t = useTranslations("Components.ConfirmTour");
  const [loading, setLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(
    requestedAmount ? requestedAmount.toString() : ""
  );
  const [notes, setNotes] = useState("");

  const handleConfirm = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setLoading(true);
    try {
      await onConfirm(guideId, parseFloat(paymentAmount), notes.trim() || undefined);
      setPaymentAmount("");
      setNotes("");
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>{t("desc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-1">Tour</p>
            <p className="font-semibold text-slate-900">{tourTitle}</p>
            <p className="text-sm text-slate-600 mt-2 mb-1">Tour guide</p>
            <p className="font-semibold text-slate-900">{guideName}</p>
          </div>

          <div>
            <Label htmlFor="paymentAmount">{t("paymentAmount")}</Label>
            <div className="relative mt-1">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="paymentAmount"
                type="text"
                value={paymentAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setPaymentAmount(value);
                }}
                placeholder="Enter payment amount..."
                className="pl-10"
                required
              />
            </div>
            {paymentAmount && (
              <p className="text-sm text-slate-600 mt-1">{formatVND(parseFloat(paymentAmount) || 0)}</p>
            )}
            {requestedAmount && (
              <p className="text-xs text-blue-600 mt-1">{t("guideRequested", { amount: formatVND(requestedAmount) })}</p>
            )}
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-medium text-amber-900 mb-1">{t("importantNote")}</p>
            <p className="text-xs text-amber-700">{t("importantNoteDesc")}</p>
          </div>

          <div>
            <Label htmlFor="notes">{t("notesLabel")}</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Enter notes for the guide..." className="mt-1" rows={3} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t("cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || !paymentAmount || parseFloat(paymentAmount) <= 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? "Processing..." : "Confirm & Lock Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
