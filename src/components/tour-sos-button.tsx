"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { SOSReportDialog } from "@/components/sos-report-dialog";
import { useTranslations } from "next-intl";

interface TourSOSButtonProps {
  tourId: string;
  tourStatus: string;
  guideId?: string;
}

export function TourSOSButton({ tourId, tourStatus, guideId }: TourSOSButtonProps) {
  const t = useTranslations("Components.TourSOS");
  const [dialogOpen, setDialogOpen] = useState(false);

  if (tourStatus !== "IN_PROGRESS") {
    return null;
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setDialogOpen(true)} className="w-full">
        <AlertTriangle className="h-4 w-4 mr-2" />
        {t("reportSOS")}
      </Button>
      <SOSReportDialog
        tourId={tourId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {}}
      />
    </>
  );
}
