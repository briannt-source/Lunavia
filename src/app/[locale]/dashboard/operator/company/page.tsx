"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, Mail, Globe, MapPin } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatVND } from "@/lib/utils";
import { Link } from '@/navigation';

export default function CompanyPage() {
  const t = useTranslations("Operator.Company");

  const { data: userInfo, refetch: refetchUserInfo } = useQuery({
    queryKey: ["userInfo"],
    queryFn: () => api.user.getInfo(),
  });

  const company = userInfo?.company;
  const companyId = company?.id;

  const { data: companyData } = useQuery({
    queryKey: ["company", companyId],
    queryFn: () => (companyId ? api.companies.get(companyId) : null),
    enabled: !!companyId && !company,
    initialData: company,
  });

  const companyInfo = companyData || company;

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        action={
          !companyInfo && (
            <Link href="/dashboard/operator/company/create">
              <Button className="bg-gradient-to-r from-teal-500 to-emerald-500">
                {t("createBtn")}
              </Button>
            </Link>
          )
        }
      />

      {!companyInfo ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={Building2}
              title={t("emptyTitle")}
              description={t("emptyDesc")}
              action={
                <Link href="/dashboard/operator/company/create">
                  <Button>{t("createBtn")}</Button>
                </Link>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>{t("info.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">
                    {t("info.companyName")}
                  </p>
                  <p className="text-lg font-semibold">{companyInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">
                    {t("info.companyId")}
                  </p>
                  <p className="text-sm font-mono bg-slate-100 px-2 py-1 rounded inline-block">
                    {companyInfo.companyId}
                  </p>
                </div>
                {companyInfo.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <p className="text-sm text-slate-600">{companyInfo.email}</p>
                  </div>
                )}
                {companyInfo.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-slate-400" />
                    <a
                      href={companyInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-lunavia-primary hover:underline"
                    >
                      {companyInfo.website}
                    </a>
                  </div>
                )}
                {companyInfo.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <p className="text-sm text-slate-600">{companyInfo.address}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {t("members.title", { count: companyInfo._count?.members || 0 })}
                  </span>
                  <Link href="/dashboard/operator/company/guides">
                    <Button size="sm" variant="outline">
                      {t("members.manageBtn")}
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {companyInfo.members && companyInfo.members.length > 0 ? (
                  <div className="space-y-4">
                    {companyInfo.members.slice(0, 5).map((member: any) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {member.guide?.profile?.name || member.guide?.email}
                          </p>
                          <p className="text-sm text-slate-500">
                            {member.companyEmail || member.guide?.email}
                          </p>
                        </div>
                        <StatusBadge status={member.status} />
                      </div>
                    ))}
                    {companyInfo.members.length > 5 && (
                      <Link href="/dashboard/operator/company/guides">
                        <Button variant="outline" className="w-full">
                          {t("members.viewAll", { count: companyInfo.members.length })}
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <EmptyState
                    icon={Users}
                    title={t("members.emptyTitle")}
                    description={t("members.emptyDesc")}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("stats.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">{t("stats.members")}</p>
                  <p className="text-2xl font-bold">
                    {companyInfo._count?.members || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">{t("stats.invitations")}</p>
                  <p className="text-2xl font-bold">
                    {companyInfo._count?.invitations || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">{t("stats.joinRequests")}</p>
                  <p className="text-2xl font-bold">
                    {companyInfo._count?.joinRequests || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
