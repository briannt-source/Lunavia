"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import { Edit, Globe, Eye, Sparkles } from "lucide-react";
import { AIMatchingDialog } from "@/components/ai-matching-dialog";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface TourActionsProps {
  tourId: string;
  isOperator: boolean;
  canApply: boolean;
  tourStatus: string;
  applicationsCount: number;
  visibility: string;
  applyReason?: string;
  hasApplied?: boolean;
  applicationStatus?: string;
  hasAcceptedGuides?: boolean;
}

export function TourActions({
  tourId,
  isOperator,
  canApply,
  tourStatus,
  applicationsCount,
  visibility,
  applyReason,
  hasApplied,
  applicationStatus,
  hasAcceptedGuides = false,
}: TourActionsProps) {
  const t = useTranslations("Components.TourActions");
  const router = useRouter();
  const [aiMatchingOpen, setAIMatchingOpen] = useState(false);

  const handlePublish = async () => {
    try {
      const result = await api.tours.updateStatus(tourId, "OPEN");
      if (result?.status === "OPEN") {
        toast.success("Tour published to marketplace!");
        window.location.reload();
      } else {
        toast.error("An error occurred updating tour status");
      }
    } catch (error: any) {
      toast.error(error.message || "Error publishing tour");
    }
  };

  const handleCloseTour = async () => {
    if (!confirm("Are you sure you want to stop accepting guides for this tour?")) return;
    try {
      const result = await api.tours.updateStatus(tourId, "CLOSED");
      if (result?.status === "CLOSED") {
        toast.success("Tour is no longer accepting guides");
        window.location.reload();
      } else {
        toast.error("An error occurred updating tour status");
      }
    } catch (error: any) {
      toast.error(error.message || "Error closing tour");
    }
  };

  const handleStartTour = async () => {
    if (!confirm("Are you sure you want to start this tour? Status will change to 'Running' and guides will be notified.")) return;
    try {
      const result = await api.tours.updateStatus(tourId, "IN_PROGRESS");
      if (result?.status === "IN_PROGRESS") {
        toast.success("Tour started! Guides have been notified.");
        window.location.reload();
      } else {
        toast.error("An error occurred updating tour status");
      }
    } catch (error: any) {
      toast.error(error.message || "Error starting tour");
    }
  };

  const handleReopenTour = async () => {
    try {
      const result = await api.tours.updateStatus(tourId, "OPEN");
      if (result?.status === "OPEN") {
        toast.success("Tour reopened for applications");
        window.location.reload();
      } else {
        toast.error("An error occurred updating tour status");
      }
    } catch (error: any) {
      toast.error(error.message || "Error reopening tour");
    }
  };

  if (isOperator) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground text-center">{t("yourTour")}</p>
        {tourStatus === "DRAFT" && (
          <>
            <Link href={`/tours/${tourId}/edit`}>
              <Button className="w-full" size="lg">
                <Edit className="h-4 w-4 mr-2" />
                Edit Tour
              </Button>
            </Link>
            <Button className="w-full" size="lg" variant="outline" onClick={handlePublish}>
              <Globe className="h-4 w-4 mr-2" />
              Publish Tour
            </Button>
          </>
        )}
        {tourStatus === "OPEN" && (
          <Button className="w-full" size="lg" variant="outline" onClick={handleCloseTour}>
            {t("stopAccepting")}
          </Button>
        )}
        {tourStatus === "CLOSED" && (
          <div className="space-y-2">
            <Button className="w-full" size="lg" variant="outline" onClick={handleReopenTour}>
              {t("reopenApplications")}
            </Button>
            {hasAcceptedGuides && (
              <Button className="w-full" size="lg" onClick={handleStartTour}>
                {t("startTour")}
              </Button>
            )}
          </div>
        )}
        {tourStatus === "OPEN" && hasAcceptedGuides && (
          <Button className="w-full" size="lg" onClick={handleStartTour}>
            {t("startTour")}
          </Button>
        )}
        <Link href={`/dashboard/operator/applications/${tourId}`}>
          <Button className="w-full" size="lg" variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            {t("viewApplications", { count: applicationsCount })}
          </Button>
        </Link>
        {(tourStatus === "OPEN" || tourStatus === "CLOSED") && (
          <>
            <Button
              onClick={() => setAIMatchingOpen(true)}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              size="lg"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Guide Matching
            </Button>
            <AIMatchingDialog
              open={aiMatchingOpen}
              onOpenChange={setAIMatchingOpen}
              tourId={tourId}
              tourVisibility={visibility as "PUBLIC" | "PRIVATE"}
              onInvite={async (guideId: string) => {
                toast.success("Guide will receive a notification about this tour");
                setAIMatchingOpen(false);
                router.refresh();
              }}
              onAssign={async (guideId: string, role: "MAIN" | "SUB") => {
                try {
                  await api.tours.assign(tourId, { guideId, role });
                  toast.success("Guide assigned successfully!");
                  setAIMatchingOpen(false);
                  router.refresh();
                } catch (error: any) {
                  toast.error(error.message || "An error occurred during assignment");
                }
              }}
            />
          </>
        )}
      </div>
    );
  }

  if (hasApplied) {
    const statusLabels: Record<string, string> = {
      PENDING: "Pending Review",
      ACCEPTED: "Accepted",
      REJECTED: "Rejected",
    };
    return (
      <div className="text-center space-y-2">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-blue-900 mb-1">
            ✓ You have already applied to this tour
          </p>
          <p className="text-sm text-blue-700">
            Status: {statusLabels[applicationStatus || "PENDING"]}
          </p>
        </div>
        <Link href="/dashboard/guide/applications">
          <Button variant="outline" size="sm" className="w-full">
            {t("viewAllApplications")}
          </Button>
        </Link>
      </div>
    );
  }

  if (canApply) {
    return (
      <Link href={`/tours/${tourId}/apply`}>
        <Button className="w-full" size="lg">Apply Now</Button>
      </Link>
    );
  }

  return (
    <div className="text-center space-y-2">
      {applyReason && (
        <p className="text-sm text-amber-600 mb-2 font-medium">{applyReason}</p>
      )}
      {!applyReason && (
        <p className="text-sm text-muted-foreground mb-2">
          {tourStatus !== "OPEN" && tourStatus !== "CLOSED" && "This tour is not accepting applications"}
          {tourStatus === "CLOSED" && "This tour is no longer accepting guides"}
          {visibility === "PRIVATE" && "This tour is private"}
        </p>
      )}
      {applyReason && applyReason.includes("KYC") && (
        <Link href="/dashboard/verification/kyc">
          <Button variant="outline" size="sm" className="w-full">Submit KYC Now</Button>
        </Link>
      )}
    </div>
  );
}
