import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { formatDateTime, formatVND } from "@/lib/utils";
import { ArrowLeft, Mail, Shield, Wallet, MapPin, Calendar } from "lucide-react";
import { Link } from '@/navigation';

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const role = (session.user as any)?.role;
  const adminRole = role?.startsWith("ADMIN_")
    ? role.replace("ADMIN_", "")
    : role;

  const canAccess = adminRole === "SUPER_ADMIN" || adminRole === "MODERATOR";
  if (!canAccess) {
    redirect("/dashboard/admin");
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      wallet: true,
      verifications: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      tours: {
        take: 10,
        orderBy: { createdAt: "desc" },
      },
      applications: {
        take: 10,
        orderBy: { appliedAt: "desc" },
        include: {
          tour: {
            select: {
              id: true,
              title: true,
              city: true,
            },
          },
        },
      },
      _count: {
        select: {
          tours: true,
          applications: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/dashboard/admin/users");
  }

  return (
    <>
      <PageHeader
        title="Chi tiết User"
        description={user.email}
        action={
          <Link href="/dashboard/admin/users">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">
                    {user.profile?.name || user.email}
                  </h3>
                  {user.verifiedStatus === "APPROVED" && (
                    <VerifiedBadge
                      type={user.role === "TOUR_GUIDE" ? "KYC" : "KYB"}
                    />
                  )}
                  <StatusBadge status={user.verifiedStatus} />
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">
                    {user.role.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Ngày đăng ký</p>
                  <p className="font-medium">{formatDateTime(user.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Cập nhật lần cuối</p>
                  <p className="font-medium">{formatDateTime(user.updatedAt)}</p>
                </div>
                {user.licenseNumber && (
                  <div>
                    <p className="text-sm text-slate-500">Số giấy phép</p>
                    <p className="font-medium">{user.licenseNumber}</p>
                  </div>
                )}
                {user.employmentType && (
                  <div>
                    <p className="text-sm text-slate-500">Loại việc làm</p>
                    <p className="font-medium">
                      {user.employmentType === "FREELANCE" ? "Tự do" : "Nội bộ"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Info */}
          {user.profile && (
            <Card>
              <CardHeader>
                <CardTitle>Thông tin Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {user.profile.phone && (
                    <div>
                      <p className="text-sm text-slate-500">Số điện thoại</p>
                      <p className="font-medium">{user.profile.phone}</p>
                    </div>
                  )}
                  {user.profile.address && (
                    <div>
                      <p className="text-sm text-slate-500">Địa chỉ</p>
                      <p className="font-medium">{user.profile.address}</p>
                    </div>
                  )}
                  {user.profile.experienceYears && (
                    <div>
                      <p className="text-sm text-slate-500">Kinh nghiệm</p>
                      <p className="font-medium">{user.profile.experienceYears} năm</p>
                    </div>
                  )}
                  {user.profile.rating && (
                    <div>
                      <p className="text-sm text-slate-500">Đánh giá</p>
                      <p className="font-medium">
                        {user.profile.rating.toFixed(1)} ⭐ ({user.profile.reviewCount} đánh giá)
                      </p>
                    </div>
                  )}
                </div>
                {user.profile.bio && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Giới thiệu</p>
                    <p className="text-slate-700">{user.profile.bio}</p>
                  </div>
                )}
                {user.profile.languages && user.profile.languages.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Ngôn ngữ</p>
                    <div className="flex flex-wrap gap-2">
                      {user.profile.languages.map((lang, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-teal-50 text-teal-700 rounded text-xs"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {user.profile.specialties && user.profile.specialties.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Chuyên môn</p>
                    <div className="flex flex-wrap gap-2">
                      {user.profile.specialties.map((spec, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Wallet Info */}
          {user.wallet && (
            <Card>
              <CardHeader>
                <CardTitle>Thông tin Ví</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Số dư</p>
                    <p className="text-lg font-bold text-teal-600">
                      {formatVND(user.wallet.balance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Đã khóa</p>
                    <p className="text-lg font-bold text-amber-600">
                      {formatVND(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Đã đặt cọc</p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatVND(0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verification */}
          {user.verifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Xác minh</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {user.verifications.map((verification) => (
                    <div key={verification.id} className="border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <StatusBadge status={verification.status} />
                        <Link href={`/dashboard/admin/verifications/${verification.id}`}>
                          <Button variant="outline" size="sm">
                            Xem chi tiết
                          </Button>
                        </Link>
                      </div>
                      <p className="text-sm text-slate-500">
                        Nộp: {formatDateTime(verification.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tours */}
          {user.tours.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Tours ({user._count.tours})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {user.tours.map((tour) => (
                    <Link
                      key={tour.id}
                      href={`/tours/${tour.id}`}
                      className="block p-3 border rounded hover:bg-slate-50"
                    >
                      <p className="font-medium">{tour.title}</p>
                      <p className="text-sm text-slate-500">
                        {tour.city} • {formatDateTime(tour.createdAt)}
                      </p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Tổng tours</p>
                <p className="text-2xl font-bold">{user._count.tours}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Tổng ứng tuyển</p>
                <p className="text-2xl font-bold">{user._count.applications}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hành động</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/dashboard/admin/users/${user.id}/manage`}>
                <Button className="w-full" variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Quản lý User
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

