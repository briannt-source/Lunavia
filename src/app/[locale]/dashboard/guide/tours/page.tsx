"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MapPin, Calendar, FileText, AlertTriangle, DollarSign } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatDate, formatVND } from "@/lib/utils";
import { Link } from '@/navigation';
import { SOSReportDialog } from "@/components/sos-report-dialog";
import { useState } from "react";

export default function GuideToursPage() {
  const [sosDialogOpen, setSosDialogOpen] = useState(false);
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null);

  const { data: applications = [] } = useQuery({
    queryKey: ["guideApplications"],
    queryFn: () => api.applications.list({ status: "ACCEPTED" }),
  });

  const acceptedTours = applications
    .filter((app: any) => app.status === "ACCEPTED")
    .map((app: any) => ({
      ...app.tour,
      application: app,
    }));

  const inProgressTours = acceptedTours.filter(
    (tour: any) => tour.status === "IN_PROGRESS"
  );
  const upcomingTours = acceptedTours.filter(
    (tour: any) => tour.status === "OPEN" || tour.status === "CLOSED"
  );
  const completedTours = acceptedTours.filter(
    (tour: any) => tour.status === "COMPLETED"
  );

  return (
    <>
      <PageHeader
        title="Tours của tôi"
        description="Quản lý các tour bạn đã được chấp nhận"
      />

      <div className="space-y-6">
        {/* In Progress Tours */}
        {inProgressTours.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Tours đang diễn ra</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressTours.map((tour: any) => (
                <Card key={tour.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{tour.title}</CardTitle>
                      <StatusBadge status={tour.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="h-4 w-4" />
                        <span>{tour.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(tour.startDate)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t">
                      <Link href={`/tours/${tour.id}`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">
                          Xem chi tiết
                        </Button>
                      </Link>
                      <Button
                        className="flex-1 bg-red-600 hover:bg-red-700"
                        size="sm"
                        onClick={() => {
                          setSelectedTourId(tour.id);
                          setSosDialogOpen(true);
                        }}
                      >
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        SOS
                      </Button>
                    </div>
                    <Link href={`/dashboard/guide/tours/${tour.id}/report`}>
                      <Button className="w-full" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Báo cáo tour
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Tours */}
        {upcomingTours.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Tours sắp tới</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTours.map((tour: any) => (
                <Card key={tour.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{tour.title}</CardTitle>
                      <StatusBadge status={tour.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="h-4 w-4" />
                        <span>{tour.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(tour.startDate)}</span>
                      </div>
                      {tour.application?.role && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <DollarSign className="h-4 w-4" />
                          <span>
                            {tour.application.role === "MAIN"
                              ? formatVND(tour.priceMain || 0)
                              : formatVND(tour.priceSub || 0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <Link href={`/tours/${tour.id}`}>
                      <Button variant="outline" className="w-full" size="sm">
                        Xem chi tiết
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed Tours */}
        {completedTours.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Tours đã hoàn thành</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedTours.map((tour: any) => (
                <Card key={tour.id} className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{tour.title}</CardTitle>
                      <StatusBadge status={tour.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="h-4 w-4" />
                        <span>{tour.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(tour.startDate)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t">
                      <Link href={`/tours/${tour.id}`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">
                          Xem chi tiết
                        </Button>
                      </Link>
                      <Link href={`/dashboard/guide/tours/${tour.id}/report`}>
                        <Button variant="outline" className="flex-1" size="sm">
                          <FileText className="h-4 w-4 mr-1" />
                          Báo cáo
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {acceptedTours.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <EmptyState
                icon={MapPin}
                title="Chưa có tour nào"
                description="Bạn chưa được chấp nhận vào tour nào. Hãy tìm và ứng tuyển các tour phù hợp."
                action={
                  <Link href="/dashboard/guide/tours">
                    <Button>Tìm tour</Button>
                  </Link>
                }
              />
            </CardContent>
          </Card>
        )}
      </div>

      {selectedTourId && (
        <SOSReportDialog
          tourId={selectedTourId}
          open={sosDialogOpen}
          onOpenChange={setSosDialogOpen}
          onSuccess={() => {
            setSosDialogOpen(false);
            setSelectedTourId(null);
          }}
        />
      )}
    </>
  );
}
