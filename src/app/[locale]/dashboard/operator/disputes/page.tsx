"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, AlertCircle } from "lucide-react";
import { api } from "@/lib/api-client";
import { format } from "date-fns";
import { Link } from '@/navigation';

const DISPUTE_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-lunavia-muted/50 text-lunavia-primary-hover border-lunavia-primary/40",
  IN_REVIEW: "bg-amber-100 text-amber-700 border-amber-300",
  RESOLVED: "bg-green-100 text-green-700 border-green-300",
  REJECTED: "bg-red-100 text-red-700 border-red-300",
};

export default function DisputesListPage() {
  const t = useTranslations("Operator.Disputes");

  const { data: disputes = [], isLoading } = useQuery({
    queryKey: ["disputes", "operator"],
    queryFn: () => api.disputes.list(),
  });

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">{t("title")}</h1>
          <p className="text-gray-500">{t("subtitle")}</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">{t("loading")}</p>
          </div>
        ) : disputes.length === 0 ? (
          <Card className="rounded-xl shadow-sm">
            <CardContent className="pt-6 text-center py-12">
              <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500">{t("emptyTitle")}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute: any) => {
              const statusColor =
                DISPUTE_STATUS_COLORS[dispute.status] ||
                "bg-gray-100 text-gray-700 border-gray-300";
              return (
                <Link key={dispute.id} href={`/dashboard/operator/disputes/${dispute.id}`}>
                  <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge
                              variant="outline"
                              className={`${statusColor} border`}
                            >
                              {dispute.status}
                            </Badge>
                            <Badge variant="outline" className="border-indigo-600 text-[#2E8BC0]">
                              {t(`typeLabels.${dispute.type}`) || dispute.type}
                            </Badge>
                            {dispute.tourId && (
                              <span className="text-xs text-gray-500">
                                {t("tour", { name: dispute.tour?.title || dispute.tourId })}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-900 mb-2 line-clamp-2">
                            {dispute.description || dispute.reason}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(
                                new Date(dispute.createdAt || new Date()),
                                "dd/MM/yyyy HH:mm"
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {dispute.status === "PENDING" && (
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                          )}
                          <span className="text-[#5BA4CF]">{t("viewDetails")}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
