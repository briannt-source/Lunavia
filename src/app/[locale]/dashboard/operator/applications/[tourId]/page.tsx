"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2, XCircle, Eye, Briefcase } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatDateTime, formatVND } from "@/lib/utils";
import { Link } from '@/navigation';
import toast from "react-hot-toast";
import { MessageButton } from "@/components/message-button";

export default function TourApplicationsPage() {
  const t = useTranslations("Operator.Applications");
  const params = useParams();
  const tourId = params.tourId as string;
  const [selectedApplication, setSelectedApplication] = useState<string | null>(
    null
  );

  const { data: tour } = useQuery({
    queryKey: ["tour", tourId],
    queryFn: () => api.tours.get(tourId),
  });

  const { data: applications = [], refetch } = useQuery({
    queryKey: ["applications", tourId],
    queryFn: () => api.tours.getApplications(tourId),
  });

  const { data: guideProfile } = useQuery({
    queryKey: ["guideProfile", selectedApplication],
    queryFn: () => {
      const app = applications.find((a: any) => a.id === selectedApplication);
      return app ? api.guides.getProfile(app.guideId) : null;
    },
    enabled: !!selectedApplication,
  });

  const handleAccept = async (applicationId: string) => {
    try {
      await api.tours.acceptApplication(tourId, applicationId);
      toast.success(t("alerts.approveSuccess"));
      refetch();
    } catch (error: any) {
      toast.error(error.message || t("alerts.approveFailed"));
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      await api.tours.rejectApplication(tourId, applicationId);
      toast.success(t("alerts.rejectSuccess"));
      refetch();
    } catch (error: any) {
      toast.error(error.message || t("alerts.rejectFailed"));
    }
  };

  return (
    <>
      <PageHeader
        title={t("detail.title", { name: tour?.title || "" })}
        description={t("detail.subtitle", { count: applications.length })}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/operator" },
          { label: t("title"), href: "/dashboard/operator/applications" },
          { label: tour?.title || "Tour" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications List */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              {applications.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title={t("detail.emptyTitle")}
                  description={t("detail.emptyDesc")}
                />
              ) : (
                <div className="space-y-4">
                  {applications.map((app: any) => (
                    <div
                      key={app.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedApplication === app.id
                          ? "border-lunavia-primary bg-lunavia-primary-light"
                          : "hover:bg-slate-50"
                      }`}
                      onClick={() => setSelectedApplication(app.id)}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage
                            src={app.guide?.profile?.photoUrl}
                            alt={app.guide?.profile?.name}
                          />
                          <AvatarFallback>
                            {app.guide?.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-slate-900">
                              {app.guide?.profile?.name || app.guide?.email}
                            </h3>
                            {app.guide?.verifiedStatus === "APPROVED" && (
                              <VerifiedBadge
                                type={
                                  app.guide?.role === "TOUR_GUIDE"
                                    ? "KYC"
                                    : "KYB"
                                }
                              />
                            )}
                            <StatusBadge status={app.status} />
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            {t("detail.role", { role: app.role === "MAIN" ? "Main Guide" : "Sub Guide" })}
                          </p>
                          {app.coverLetter && (
                            <p className="text-sm text-slate-500 mb-2 line-clamp-2">
                              {app.coverLetter}
                            </p>
                          )}
                          <p className="text-xs text-slate-400">
                            {formatDateTime(app.appliedAt)}
                          </p>
                        </div>
                        {app.status === "PENDING" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAccept(app.id);
                              }}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReject(app.id);
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Guide Profile Sidebar */}
        {selectedApplication && guideProfile && (
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage
                      src={guideProfile.profile?.photoUrl}
                      alt={guideProfile.profile?.name}
                    />
                    <AvatarFallback className="text-2xl">
                      {guideProfile.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {guideProfile.profile?.name || guideProfile.email}
                  </h3>
                  <p className="text-sm text-slate-600">{guideProfile.email}</p>
                  <div className="mt-4">
                    <MessageButton
                      tourId={tourId as string}
                      guideId={guideProfile.id}
                      className="w-full"
                    />
                  </div>
                  {guideProfile.verifiedStatus === "APPROVED" && (
                    <div className="mt-2">
                      <VerifiedBadge type="KYC" />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Badges */}
                  {guideProfile.badges && guideProfile.badges.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-2">
                        {t("detail.badges")}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {guideProfile.badges.map((badge: string) => (
                          <span
                            key={badge}
                            className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">{t("detail.rating")}</p>
                      <p className="text-lg font-semibold">
                        {guideProfile.profile?.rating?.toFixed(1) || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{t("detail.tours")}</p>
                      <p className="text-lg font-semibold">
                        {guideProfile._count?.applications || 0}
                      </p>
                    </div>
                  </div>

                  {/* Languages */}
                  {guideProfile.profile?.languages &&
                    guideProfile.profile.languages.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-2">
                          {t("detail.languages")}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {guideProfile.profile.languages.map((lang: string) => (
                            <span
                              key={lang}
                              className="px-2 py-1 bg-lunavia-primary-light text-lunavia-primary rounded text-xs"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Specialties */}
                  {guideProfile.profile?.specialties &&
                    guideProfile.profile.specialties.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-2">
                          {t("detail.specialties")}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {guideProfile.profile.specialties.map(
                            (spec: string) => (
                              <span
                                key={spec}
                                className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs"
                              >
                                {spec}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Company */}
                  {guideProfile.companyMember && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-2">
                        {t("detail.company")}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {guideProfile.companyMember.company.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {guideProfile.companyMember.company.companyId}
                      </p>
                    </div>
                  )}

                  <Link href={`/guides/${guideProfile.id}/profile`}>
                    <Button className="w-full bg-lunavia-primary hover:bg-lunavia-primary-hover text-white">
                      <Eye className="h-4 w-4 mr-2" />
                      {t("detail.viewFullProfile")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
