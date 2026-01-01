"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import { Edit, Globe, Eye, Sparkles } from "lucide-react";
import { AIMatchingDialog } from "@/components/ai-matching-dialog";
import { useState } from "react";

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
  hasAcceptedGuides?: boolean; // Whether tour has accepted applications or approved assignments
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
  const router = useRouter();
  const [aiMatchingOpen, setAIMatchingOpen] = useState(false);

  const handlePublish = async () => {
    try {
      const result = await api.tours.updateStatus(tourId, "OPEN");
      console.log("Tour status updated:", result);
      
      if (result?.status === "OPEN") {
        toast.success("Tour đã được publish lên marketplace!");
        // Force reload để cập nhật status từ server
        window.location.reload();
      } else {
        toast.error("Có lỗi xảy ra khi cập nhật trạng thái tour");
      }
    } catch (error: any) {
      console.error("Error publishing tour:", error);
      toast.error(error.message || "Lỗi khi publish tour");
    }
  };

  const handleCloseTour = async () => {
    if (!confirm("Bạn có chắc muốn ngưng nhận thêm hướng dẫn viên cho tour này?")) {
      return;
    }
    try {
      const result = await api.tours.updateStatus(tourId, "CLOSED");
      console.log("Tour status updated:", result);
      
      if (result?.status === "CLOSED") {
        toast.success("Tour đã ngưng nhận thêm hướng dẫn viên");
        // Force reload để cập nhật status từ server
        window.location.reload();
      } else {
        toast.error("Có lỗi xảy ra khi cập nhật trạng thái tour");
      }
    } catch (error: any) {
      console.error("Error closing tour:", error);
      toast.error(error.message || "Lỗi khi đóng tour");
    }
  };

  if (isOperator) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground text-center">
          Đây là tour của bạn
        </p>
        {tourStatus === "DRAFT" && (
          <>
            <Link href={`/tours/${tourId}/edit`}>
              <Button className="w-full" size="lg">
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa Tour
              </Button>
            </Link>
            <Button
              className="w-full"
              size="lg"
              variant="outline"
              onClick={handlePublish}
            >
              <Globe className="h-4 w-4 mr-2" />
              Publish Tour
            </Button>
          </>
        )}
        {tourStatus === "OPEN" && (
          <Button
            className="w-full"
            size="lg"
            variant="outline"
            onClick={handleCloseTour}
          >
            Ngưng nhận thêm tour guide
          </Button>
        )}
        {tourStatus === "CLOSED" && (
          <div className="space-y-2">
            <Button
              className="w-full"
              size="lg"
              variant="outline"
              onClick={async () => {
                try {
                  const result = await api.tours.updateStatus(tourId, "OPEN");
                  console.log("Tour status updated:", result);
                  
                  if (result?.status === "OPEN") {
                    toast.success("Tour đã mở lại ứng tuyển");
                    // Force reload để cập nhật status từ server
                    window.location.reload();
                  } else {
                    toast.error("Có lỗi xảy ra khi cập nhật trạng thái tour");
                  }
                } catch (error: any) {
                  console.error("Error reopening tour:", error);
                  toast.error(error.message || "Lỗi khi mở lại tour");
                }
              }}
            >
              Mở lại ứng tuyển
            </Button>
            {hasAcceptedGuides && (
              <Button
                className="w-full"
                size="lg"
                onClick={async () => {
                  if (!confirm("Bạn có chắc muốn bắt đầu tour này? Tour sẽ chuyển sang trạng thái 'Đang chạy' và guides sẽ nhận được thông báo.")) {
                    return;
                  }
                  try {
                    const result = await api.tours.updateStatus(tourId, "IN_PROGRESS");
                    console.log("Tour status updated:", result);
                    
                    if (result?.status === "IN_PROGRESS") {
                      toast.success("Tour đã bắt đầu! Guides đã nhận được thông báo.");
                      // Force reload để cập nhật status từ server
                      window.location.reload();
                    } else {
                      toast.error("Có lỗi xảy ra khi cập nhật trạng thái tour");
                    }
                  } catch (error: any) {
                    console.error("Error starting tour:", error);
                    toast.error(error.message || "Lỗi khi bắt đầu tour");
                  }
                }}
              >
                🚀 Bắt đầu tour
              </Button>
            )}
          </div>
        )}
        {tourStatus === "OPEN" && hasAcceptedGuides && (
          <Button
            className="w-full"
            size="lg"
            onClick={async () => {
              if (!confirm("Bạn có chắc muốn bắt đầu tour này? Tour sẽ chuyển sang trạng thái 'Đang chạy' và guides sẽ nhận được thông báo.")) {
                return;
              }
              try {
                const result = await api.tours.updateStatus(tourId, "IN_PROGRESS");
                console.log("Tour status updated:", result);
                
                if (result?.status === "IN_PROGRESS") {
                  toast.success("Tour đã bắt đầu! Guides đã nhận được thông báo.");
                  // Force reload để cập nhật status từ server
                  window.location.reload();
                } else {
                  toast.error("Có lỗi xảy ra khi cập nhật trạng thái tour");
                }
              } catch (error: any) {
                console.error("Error starting tour:", error);
                toast.error(error.message || "Lỗi khi bắt đầu tour");
              }
            }}
          >
            🚀 Bắt đầu tour
          </Button>
        )}
        <Link href={`/dashboard/operator/applications/${tourId}`}>
          <Button className="w-full" size="lg" variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Xem ứng tuyển ({applicationsCount})
          </Button>
        </Link>
        {/* AI Matching Button */}
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
                toast.success("Guide sẽ nhận được thông báo về tour này");
                setAIMatchingOpen(false);
                router.refresh();
              }}
              onAssign={async (guideId: string, role: "MAIN" | "SUB") => {
                try {
                  await api.tours.assign(tourId, { guideId, role });
                  toast.success("Đã phân công guide thành công!");
                  setAIMatchingOpen(false);
                  router.refresh();
                } catch (error: any) {
                  toast.error(error.message || "Có lỗi xảy ra khi phân công");
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
      PENDING: "Đang chờ duyệt",
      ACCEPTED: "Đã được chấp nhận",
      REJECTED: "Đã bị từ chối",
    };
    return (
      <div className="text-center space-y-2">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-blue-900 mb-1">
            ✓ Bạn đã ứng tuyển tour này
          </p>
          <p className="text-sm text-blue-700">
            Trạng thái: {statusLabels[applicationStatus || "PENDING"]}
          </p>
        </div>
        <Link href="/dashboard/guide/applications">
          <Button variant="outline" size="sm" className="w-full">
            Xem tất cả ứng tuyển
          </Button>
        </Link>
      </div>
    );
  }

  if (canApply) {
    return (
      <Link href={`/tours/${tourId}/apply`}>
        <Button className="w-full" size="lg">
          Ứng tuyển ngay
        </Button>
      </Link>
    );
  }

  return (
    <div className="text-center space-y-2">
      {applyReason && (
        <p className="text-sm text-amber-600 mb-2 font-medium">
          {applyReason}
        </p>
      )}
      {!applyReason && (
        <p className="text-sm text-muted-foreground mb-2">
          {tourStatus !== "OPEN" && tourStatus !== "CLOSED" && "Tour này không đang mở ứng tuyển"}
          {tourStatus === "CLOSED" && "Tour này đã ngưng nhận thêm hướng dẫn viên"}
          {visibility === "PRIVATE" && "Tour này là riêng tư"}
        </p>
      )}
      {applyReason && applyReason.includes("KYC") && (
        <Link href="/dashboard/verification/kyc">
          <Button variant="outline" size="sm" className="w-full">
            Nộp KYC ngay
          </Button>
        </Link>
      )}
    </div>
  );
}

