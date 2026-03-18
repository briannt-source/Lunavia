"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime, formatVND } from "@/lib/utils";
import { ArrowLeft, Save, Key, User, Shield, AlertTriangle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function AdminUserManagePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const queryClient = useQueryClient();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetReason, setResetReason] = useState("");
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch user data
  const { data: user, isLoading } = useQuery({
    queryKey: ["admin", "user", userId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    },
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.profile?.name || "",
        phone: user.profile?.phone || "",
        address: user.profile?.address || "",
        bio: user.profile?.bio || "",
        companyName: user.profile?.companyName || "",
        companyEmail: user.profile?.companyEmail || "",
      });
    }
  }, [user]);

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { newPassword: string; reason: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reset password");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Đặt lại mật khẩu thành công");
      setNewPassword("");
      setConfirmPassword("");
      setResetReason("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Đã có lỗi xảy ra");
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/admin/users/${userId}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Cập nhật profile thành công");
      queryClient.invalidateQueries({ queryKey: ["admin", "user", userId] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Đã có lỗi xảy ra");
    },
  });

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (!resetReason.trim()) {
      toast.error("Vui lòng nhập lý do đặt lại mật khẩu");
      return;
    }
    resetPasswordMutation.mutate({ newPassword, reason: resetReason });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  if (isLoading) {
    return (
      <>
        <div className="text-center py-12">
          <p className="text-slate-600">Đang tải...</p>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <div className="text-center py-12">
          <p className="text-slate-600">Không tìm thấy user</p>
          <Link href="/dashboard/admin/users">
            <Button variant="outline" className="mt-4">
              Quay lại
            </Button>
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Quản lý User"
        description={user.email}
        action={
          <Link href={`/dashboard/admin/users/${userId}`}>
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
        }
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <Key className="h-4 w-4 mr-2" />
            Bảo mật
          </TabsTrigger>
          <TabsTrigger value="info">
            <Shield className="h-4 w-4 mr-2" />
            Thông tin
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Chỉnh sửa Profile</CardTitle>
            </CardHeader>
            <CardContent>
              {profileData && (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Tên</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({ ...profileData, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({ ...profileData, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) =>
                        setProfileData({ ...profileData, address: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Giới thiệu</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bio: e.target.value })
                      }
                      rows={4}
                    />
                  </div>
                  {(user.role === "TOUR_OPERATOR" || user.role === "TOUR_AGENCY") && (
                    <>
                      <div>
                        <Label htmlFor="companyName">Tên công ty</Label>
                        <Input
                          id="companyName"
                          value={profileData.companyName}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              companyName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="companyEmail">Email công ty</Label>
                        <Input
                          id="companyEmail"
                          type="email"
                          value={profileData.companyEmail}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              companyEmail: e.target.value,
                            })
                          }
                        />
                      </div>
                    </>
                  )}
                  <Button type="submit" disabled={updateProfileMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {updateProfileMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Đặt lại mật khẩu</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900 mb-1">
                        Lưu ý quan trọng
                      </p>
                      <p className="text-sm text-amber-700">
                        Mật khẩu mới sẽ được gửi cho user qua email. User sẽ cần đăng nhập lại với mật khẩu mới.
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="newPassword">Mật khẩu mới *</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="resetReason">Lý do đặt lại mật khẩu *</Label>
                  <Textarea
                    id="resetReason"
                    value={resetReason}
                    onChange={(e) => setResetReason(e.target.value)}
                    placeholder="Ví dụ: User quên mật khẩu, yêu cầu hỗ trợ..."
                    rows={3}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={resetPasswordMutation.isPending}
                >
                  <Key className="h-4 w-4 mr-2" />
                  {resetPasswordMutation.isPending
                    ? "Đang xử lý..."
                    : "Đặt lại mật khẩu"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin tài khoản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Vai trò</p>
                  <p className="font-medium">{user.role.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Trạng thái xác minh</p>
                  <StatusBadge status={user.verifiedStatus} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Ngày đăng ký</p>
                  <p className="font-medium">{formatDateTime(user.createdAt)}</p>
                </div>
              </CardContent>
            </Card>

            {user.wallet && (
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin ví</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-500">Số dư</p>
                    <p className="font-medium text-lg text-teal-600">
                      {formatVND(user.wallet.balance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Đã khóa</p>
                    <p className="font-medium">{formatVND(0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Đã đặt cọc</p>
                    <p className="font-medium">{formatVND(0)}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}












