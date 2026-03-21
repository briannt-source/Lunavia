import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MapPin, Calendar, Users, Languages, Building2, FileText } from "lucide-react";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { TourActions } from "@/components/tour-actions";
import { TourSOSButton } from "@/components/tour-sos-button";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { MessageButton } from "@/components/message-button";
import { TourDetailClient } from "./client-page";
import { EscrowList } from "@/components/escrow-list";
import { EscrowStatusBadge } from "@/components/escrow-status-badge";

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session) {
    notFound();
  }

  const tour = await prisma.tour.findUnique({
    where: { id },
    include: {
      operator: {
        include: {
          profile: true,
        },
      },
      applications: {
        include: {
          guide: {
            include: {
              profile: true,
            },
          },
        },
      },
      escrowAccounts: {
        include: {
          guide: {
            include: {
              profile: true,
            },
          },
        },
      },
      assignments: {
        where: {
          status: "APPROVED",
        },
        include: {
          guide: {
            include: {
              profile: true,
            },
          },
        },
      },
    },
  });

  // Check if current user has already applied
  let hasApplied = false;
  let userApplication = null;
  if (session?.user?.id) {
    userApplication = tour?.applications.find(
      (app) => app.guideId === session.user.id
    );
    hasApplied = !!userApplication;
  }

  if (!tour) {
    notFound();
  }

  // Check KYC/KYB status for apply/create
  let canApply = false;
  let applyReason = "";
  
  if (session.user.role === "TOUR_GUIDE") {
    // Check if already applied
    if (hasApplied) {
      applyReason = `You have already applied to this tour. Status: ${userApplication?.status === "PENDING" ? "Pending review" : userApplication?.status === "ACCEPTED" ? "Accepted" : "Has been rejected"}`;
    } else if (tour.status === "CLOSED") {
      applyReason = "This tour is no longer accepting guides";
    } else if (tour.status === "OPEN" && tour.visibility === "PUBLIC") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
      
      if (user?.verifiedStatus === "APPROVED") {
        // Check wallet balance
        const wallet = await prisma.wallet.findUnique({
          where: { userId: session.user.id },
        });
        if (wallet && wallet.balance >= 500000) {
          canApply = true;
        } else {
          applyReason = "Minimum balance of 500,000 VND required to apply";
        }
      } else {
        applyReason = user?.verifiedStatus === "NOT_SUBMITTED"
          ? "KYC must be completed before applying for tours"
          : user?.verifiedStatus === "PENDING"
          ? "KYC is pending review"
          : "KYC has been rejected. Please resubmit";
      }
    } else {
      applyReason = tour.status !== "OPEN" 
        ? "This tour is not open for applications"
        : "This tour is private";
    }
  }

  const isOperator = session?.user?.id === tour.operatorId;
  const userRole = (session.user as any)?.role;
  
  // Check if user can view files:
  // - Tour operator (owner) can always view
  // - Guide can view if they have an accepted application
  // - Other operators cannot view files
  let canViewFiles = isOperator;
  
  if (!canViewFiles && userRole === "TOUR_GUIDE") {
    const userApplication = tour.applications.find(
      (app) => app.guideId === session.user.id && app.status === "ACCEPTED"
    );
    canViewFiles = !!userApplication;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{tour.title}</h1>
            {(tour as any).code && (
              <span className="text-sm px-3 py-1 bg-slate-100 text-slate-700 rounded border border-slate-300 font-mono">
                {(tour as any).code}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={tour.status} />
            {tour.visibility === "PUBLIC" && (
              <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                Public
              </span>
            )}
            {tour.visibility === "PRIVATE" && (
              <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-300">
                Private
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{tour.city}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(tour.startDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{tour.pax} guests</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{tour.description}</p>
            </CardContent>
          </Card>

          {/* Guide Notes - Only visible to guides */}
          {session.user.role === "TOUR_GUIDE" && tour.guideNotes && (
            <Card className="border-teal-200 bg-teal-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-teal-600" />
                  Notes từ Tour Operator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-md p-4 border border-teal-200">
                  <p className="whitespace-pre-wrap text-slate-700">{tour.guideNotes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Information chi tiết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Languages yêu cầu</p>
                <div className="flex flex-wrap gap-2">
                  {tour.languages.map((lang) => (
                    <span
                      key={lang}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {tour.specialties.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {tour.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ứng tuyển ({tour.applications.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {tour.applications.length === 0 ? (
                <p className="text-muted-foreground">Chưa có ứng tuyển nào</p>
              ) : (
                <div className="space-y-4">
                  {tour.applications.map((app) => {
                    const escrowAccount = (tour as any).escrowAccounts?.find(
                      (e: any) => e.guideId === app.guideId
                    );
                    return (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {app.guide.profile?.name || app.guide.email}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Vai trò: {app.role} • Status: {app.status}
                          </p>
                          {escrowAccount && app.status === "ACCEPTED" && (
                            <div className="mt-2">
                              <EscrowStatusBadge status={escrowAccount.status} />
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <MessageButton
                            tourId={tour.id}
                            guideId={app.guideId}
                            operatorId={tour.operatorId}
                            size="sm"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Information Operator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="h-8 w-8 text-indigo-600" />
                <div className="flex-1">
                  <p className="font-semibold">
                    {tour.operator.profile?.companyName ||
                      tour.operator.profile?.name ||
                      tour.operator.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {tour.operator.role}
                  </p>
                </div>
              </div>
              {!isOperator && hasApplied && (
                <div className="mt-4">
                  <MessageButton
                    tourId={tour.id}
                    operatorId={tour.operatorId}
                    className="w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Price tour</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tour.priceMain ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Main Guide
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(tour.priceMain)} {tour.currency}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có giá Main Guide</p>
              )}
              {tour.priceSub ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Sub Guide
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(tour.priceSub)} {tour.currency}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có giá Sub Guide</p>
              )}
              {tour.durationHours && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">
                    Thời lượng
                  </p>
                  <p className="text-lg font-semibold">
                    {tour.durationHours} giờ
                  </p>
                </div>
              )}
              {tour.endDate && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">
                    End date
                  </p>
                  <p className="text-sm font-medium">
                    {formatDate(tour.endDate)}
                  </p>
                </div>
              )}
              {tour.files && tour.files.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">
                    Files đính kèm ({tour.files.length})
                  </p>
                  {canViewFiles ? (
                    <div className="space-y-2">
                      {tour.files.map((file, index) => (
                        <a
                          key={index}
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-blue-600 hover:underline"
                        >
                          File {index + 1}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">
                      {userRole === "TOUR_GUIDE"
                        ? "You need to be accepted to this tour to view files"
                        : "Only accepted tour guides can view files"}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {isOperator && (tour as any).escrowAccounts && (tour as any).escrowAccounts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Escrow Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <EscrowList tourId={tour.id} showActions={true} />
              </CardContent>
            </Card>
          )}

          <TourActions
            tourId={tour.id}
            isOperator={isOperator}
            canApply={canApply}
            tourStatus={tour.status}
            applicationsCount={tour.applications.length}
            visibility={tour.visibility}
            applyReason={applyReason}
            hasApplied={hasApplied}
            applicationStatus={userApplication?.status}
            hasAcceptedGuides={
              tour.applications.some((app) => app.status === "ACCEPTED") ||
              (tour.assignments && tour.assignments.length > 0)
            }
          />
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
