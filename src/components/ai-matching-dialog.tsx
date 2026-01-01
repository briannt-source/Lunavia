"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sparkles,
  Star,
  MapPin,
  Languages,
  Briefcase,
  CheckCircle2,
  XCircle,
  Loader2,
  Settings,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { formatVND } from "@/lib/utils";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import Link from "next/link";

interface AIMatchingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tourId: string;
  tourVisibility: "PUBLIC" | "PRIVATE";
  onInvite?: (guideId: string) => void;
  onAssign?: (guideId: string, role: "MAIN" | "SUB") => void;
}

export function AIMatchingDialog({
  open,
  onOpenChange,
  tourId,
  tourVisibility,
  onInvite,
  onAssign,
}: AIMatchingDialogProps) {
  const [criteria, setCriteria] = useState({
    prioritizeExperience: false,
    prioritizeRating: false,
    prioritizeLanguages: [] as string[],
    minRating: "",
    minExperience: "",
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["ai-matching", tourId, criteria],
    queryFn: () => api.tours.getAIMatching(tourId, {
      prioritizeExperience: criteria.prioritizeExperience || undefined,
      prioritizeRating: criteria.prioritizeRating || undefined,
      prioritizeLanguages: criteria.prioritizeLanguages.length > 0 ? criteria.prioritizeLanguages : undefined,
      minRating: criteria.minRating ? parseFloat(criteria.minRating) : undefined,
      minExperience: criteria.minExperience ? parseInt(criteria.minExperience) : undefined,
    }),
    enabled: open,
  });

  const handleInvite = async (guideId: string) => {
    try {
      if (onInvite) {
        await onInvite(guideId);
        toast.success("Đã gửi lời mời ứng tuyển!");
      }
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  };

  const handleAssign = async (guideId: string, role: "MAIN" | "SUB") => {
    try {
      if (onAssign) {
        await onAssign(guideId, role);
        toast.success("Đã phân công guide!");
      }
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  };

  const renderMatchCard = (match: any, category: "top" | "good" | "other") => {
    const guide = match.guide;
    const scoreColor =
      category === "top"
        ? "bg-emerald-50 border-emerald-200"
        : category === "good"
        ? "bg-blue-50 border-blue-200"
        : "bg-slate-50 border-slate-200";

    return (
      <Card key={guide.id} className={`${scoreColor} border-2`}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={guide.profile.photoUrl} />
              <AvatarFallback>
                {guide.profile.name?.charAt(0) || "G"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-slate-900">
                  {guide.profile.name || guide.email}
                </h3>
                {guide.code && (
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-300 font-mono">
                    {guide.code}
                  </span>
                )}
                <VerifiedBadge type="KYC" />
                {guide.employmentType === "IN_HOUSE" && guide.company && (
                  <Badge variant="outline" className="text-xs">
                    {guide.company.name}
                  </Badge>
                )}
              </div>

              {/* Match Score */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1 px-2 py-1 bg-white rounded border">
                  <Sparkles className="h-3 w-3 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-700">
                    {Math.round(match.score)}% phù hợp
                  </span>
                </div>
                {guide.profile.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs text-slate-600">
                      {guide.profile.rating.toFixed(1)} ({guide.profile.reviewCount})
                    </span>
                  </div>
                )}
              </div>

              {/* Match Reasons */}
              <div className="mb-3">
                <p className="text-xs text-slate-600 mb-1">Lý do đề xuất:</p>
                <div className="flex flex-wrap gap-1">
                  {match.reasons.slice(0, 3).map((reason: string, idx: number) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="text-xs bg-white"
                    >
                      {reason}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Guide Info */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-3">
                {guide.profile.experienceYears > 0 && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    <span>{guide.profile.experienceYears} năm</span>
                  </div>
                )}
                {guide.profile.languages.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Languages className="h-3 w-3" />
                    <span>{guide.profile.languages.slice(0, 2).join(", ")}</span>
                  </div>
                )}
                {guide.profile.specialties.length > 0 && (
                  <div className="flex items-center gap-1 col-span-2">
                    <MapPin className="h-3 w-3" />
                    <span>{guide.profile.specialties.slice(0, 3).join(", ")}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link href={`/guides/${guide.id}/profile`} target="_blank">
                  <Button variant="outline" size="sm" className="text-xs">
                    Xem Profile
                  </Button>
                </Link>
                {tourVisibility === "PUBLIC" ? (
                  <Button
                    size="sm"
                    className="text-xs bg-teal-600 hover:bg-teal-700"
                    onClick={() => handleInvite(guide.id)}
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    Mời Ứng tuyển
                  </Button>
                ) : guide.employmentType === "IN_HOUSE" && guide.company ? (
                  <Button
                    size="sm"
                    className="text-xs bg-teal-600 hover:bg-teal-700"
                    onClick={() => handleAssign(guide.id, "MAIN")}
                  >
                    <UserCheck className="h-3 w-3 mr-1" />
                    Assign
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            AI Guide Matching
          </DialogTitle>
          <DialogDescription>
            Hệ thống AI sẽ đề xuất các Tour Guide phù hợp nhất cho tour của bạn
            dựa trên các tiêu chí như thành phố, ngôn ngữ, chuyên môn, kinh nghiệm và đánh giá.
          </DialogDescription>
        </DialogHeader>

        {/* Criteria Settings */}
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <Label className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Tùy chỉnh tiêu chí AI
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                Áp dụng
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="prioritizeExperience"
                  checked={criteria.prioritizeExperience}
                  onCheckedChange={(checked) =>
                    setCriteria({ ...criteria, prioritizeExperience: !!checked })
                  }
                />
                <Label htmlFor="prioritizeExperience" className="text-xs">
                  Ưu tiên kinh nghiệm
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="prioritizeRating"
                  checked={criteria.prioritizeRating}
                  onCheckedChange={(checked) =>
                    setCriteria({ ...criteria, prioritizeRating: !!checked })
                  }
                />
                <Label htmlFor="prioritizeRating" className="text-xs">
                  Ưu tiên đánh giá
                </Label>
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Min rating"
                  value={criteria.minRating}
                  onChange={(e) =>
                    setCriteria({ ...criteria, minRating: e.target.value })
                  }
                  className="h-8 text-xs"
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Min kinh nghiệm (năm)"
                  value={criteria.minExperience}
                  onChange={(e) =>
                    setCriteria({ ...criteria, minExperience: e.target.value })
                  }
                  className="h-8 text-xs"
                  min="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <span className="ml-3 text-slate-600">Đang phân tích và tìm kiếm guides phù hợp...</span>
          </div>
        ) : data?.matches ? (
          <div className="space-y-6">
            {/* Top Matches */}
            {data.matches.top.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Top Matches ({data.matches.top.length})
                </h3>
                <div className="space-y-3">
                  {data.matches.top.map((match: any) =>
                    renderMatchCard(match, "top")
                  )}
                </div>
              </div>
            )}

            {/* Good Matches */}
            {data.matches.good.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Star className="h-5 w-5 text-blue-600" />
                  Good Matches ({data.matches.good.length})
                </h3>
                <div className="space-y-3">
                  {data.matches.good.map((match: any) =>
                    renderMatchCard(match, "good")
                  )}
                </div>
              </div>
            )}

            {/* Other Matches */}
            {data.matches.other.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-slate-600" />
                  Other Matches ({data.matches.other.length})
                </h3>
                <div className="space-y-3">
                  {data.matches.other.map((match: any) =>
                    renderMatchCard(match, "other")
                  )}
                </div>
              </div>
            )}

            {data.total === 0 && (
              <div className="text-center py-12">
                <XCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">
                  Không tìm thấy guide phù hợp với tiêu chí hiện tại.
                  Thử điều chỉnh các tiêu chí hoặc tạo tour với yêu cầu linh hoạt hơn.
                </p>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

