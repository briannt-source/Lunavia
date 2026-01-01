import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";
import { Building2, Users, Mail, Phone, MapPin, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { ContractVerificationButton } from "@/components/contract-verification-button";

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const role = (session.user as any)?.role;
  const adminRole = role?.startsWith("ADMIN_")
    ? role.replace("ADMIN_", "")
    : role;

  // Only SUPER_ADMIN can access
  if (adminRole !== "SUPER_ADMIN") {
    redirect("/dashboard/admin");
  }

  const params = await searchParams;
  const search = params.search || "";

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const companies = await prisma.company.findMany({
    where,
    include: {
      owner: {
        include: {
          profile: true,
        },
      },
      members: {
        include: {
          guide: {
            include: {
              profile: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <DashboardLayout>
      <PageHeader
        title="Quản lý Công ty"
        description="Xem và quản lý tất cả các công ty trong hệ thống"
      />

      {/* Companies List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Công ty ({companies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {companies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p>Không có công ty nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {companies.map((company) => (
                <Card key={company.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {company.name}
                          </h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 mb-4">
                          {company.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span>{company.email}</span>
                            </div>
                          )}
                          {company.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{company.phone}</span>
                            </div>
                          )}
                          {company.address && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{company.address}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{company.members.length + 1} thành viên</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-slate-700">Chủ sở hữu:</p>
                            <p className="text-sm text-slate-600">
                              {company.owner.profile?.name || company.owner.email}
                            </p>
                          </div>
                          {company.members.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-slate-700">Thành viên:</p>
                              <div className="space-y-2 mt-1">
                                {company.members.map((member) => (
                                  <div
                                    key={member.id}
                                    className="flex items-center justify-between p-2 bg-slate-50 rounded"
                                  >
                                    <span className="text-sm text-slate-700">
                                      {member.guide?.profile?.name || member.guide?.email}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {member.employmentContractUrl ? (
                                        <>
                                          <a
                                            href={member.employmentContractUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-600 hover:underline"
                                          >
                                            Xem hợp đồng
                                          </a>
                                          {member.contractVerified ? (
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                              ✓ Đã xác minh
                                            </span>
                                          ) : (
                                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                              ⏳ Chờ xác minh
                                            </span>
                                          )}
                                          <ContractVerificationButton
                                            companyId={company.id}
                                            guideId={member.guideId}
                                            currentVerified={member.contractVerified || false}
                                            hasContract={!!member.employmentContractUrl}
                                          />
                                        </>
                                      ) : (
                                        <span className="text-xs text-red-600">
                                          ⚠ Chưa upload
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 mt-4">
                          Tạo: {formatDate(company.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

