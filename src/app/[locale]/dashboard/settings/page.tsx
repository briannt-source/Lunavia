"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api-client";
import toast from "react-hot-toast";
import {
  Settings,
  User,
  Bell,
  Mail,
  Lock,
  Globe,
  Save,
  Loader2,
  Shield,
  MapPin,
  Eye,
  EyeOff,
  CreditCard,
  DollarSign,
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("account");
  const userRole = (session?.user as any)?.role;
  const isOperator = userRole === "TOUR_OPERATOR" || userRole === "TOUR_AGENCY";

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.settings.get(),
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => api.settings.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Đã cập nhật cài đặt thành công!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật");
    },
  });

  // Account form state
  const [accountForm, setAccountForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    newEmail: "",
  });

  // Update account mutation
  const updateAccountMutation = useMutation({
    mutationFn: (data: any) => api.settings.updateAccount(data),
    onSuccess: (data: any) => {
      toast.success(data.message || "Đã cập nhật tài khoản thành công!");
      setAccountForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        newEmail: "",
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật");
    },
  });

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (accountForm.newPassword && accountForm.newPassword !== accountForm.confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }

    if (accountForm.newPassword && accountForm.newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    updateAccountMutation.mutate({
      currentPassword: accountForm.currentPassword || undefined,
      newPassword: accountForm.newPassword || undefined,
      newEmail: accountForm.newEmail || undefined,
    });
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    updateSettingsMutation.mutate({
      [key]: value,
    });
  };

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Quản lý cài đặt tài khoản và thông báo của bạn"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Tài khoản
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Thông báo
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Bảo mật
          </TabsTrigger>
          {isOperator ? (
            <TabsTrigger value="tour-preferences" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Tour
            </TabsTrigger>
          ) : (
            <TabsTrigger value="display" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Hiển thị
            </TabsTrigger>
          )}
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-6">
          {/* Change Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Đổi Email
              </CardTitle>
              <CardDescription>
                Cập nhật địa chỉ email của bạn. Bạn sẽ cần xác minh email mới.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAccountSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="newEmail">Email mới</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    value={accountForm.newEmail}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, newEmail: e.target.value })
                    }
                    placeholder="newemail@example.com"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!accountForm.newEmail || updateAccountMutation.isPending}
                >
                  {updateAccountMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Cập nhật Email
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Đổi Mật khẩu
              </CardTitle>
              <CardDescription>
                Để bảo mật tài khoản, hãy sử dụng mật khẩu mạnh và không chia sẻ với ai.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAccountSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={accountForm.currentPassword}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, currentPassword: e.target.value })
                    }
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={accountForm.newPassword}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, newPassword: e.target.value })
                    }
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={accountForm.confirmPassword}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, confirmPassword: e.target.value })
                    }
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={
                    !accountForm.currentPassword ||
                    !accountForm.newPassword ||
                    !accountForm.confirmPassword ||
                    updateAccountMutation.isPending
                  }
                >
                  {updateAccountMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Cập nhật Mật khẩu
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Preferences */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Tùy chọn Thông báo Email
              </CardTitle>
              <CardDescription>
                Chọn loại thông báo email bạn muốn nhận từ hệ thống.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Ứng tuyển mới</Label>
                  <p className="text-sm text-muted-foreground">
                    Nhận email khi có guide ứng tuyển vào tour của bạn
                  </p>
                </div>
                <Switch
                  checked={settings?.emailNewApplication ?? true}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("emailNewApplication", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Thay đổi trạng thái ứng tuyển</Label>
                  <p className="text-sm text-muted-foreground">
                    Nhận email khi application được accept/reject
                  </p>
                </div>
                <Switch
                  checked={settings?.emailApplicationStatus ?? true}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("emailApplicationStatus", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Thanh toán</Label>
                  <p className="text-sm text-muted-foreground">
                    Nhận email khi có payment hoặc payment request
                  </p>
                </div>
                <Switch
                  checked={settings?.emailPayment ?? true}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("emailPayment", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tour bắt đầu</Label>
                  <p className="text-sm text-muted-foreground">
                    Nhận email khi tour đến ngày khởi hành
                  </p>
                </div>
                <Switch
                  checked={settings?.emailTourStarted ?? true}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("emailTourStarted", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tour bị hủy</Label>
                  <p className="text-sm text-muted-foreground">
                    Nhận email khi tour bị hủy hoặc cancelled
                  </p>
                </div>
                <Switch
                  checked={settings?.emailTourCancelled ?? true}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("emailTourCancelled", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tin nhắn mới</Label>
                  <p className="text-sm text-muted-foreground">
                    Nhận email khi có tin nhắn mới từ operator/guide
                  </p>
                </div>
                <Switch
                  checked={settings?.emailMessage ?? true}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("emailMessage", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Báo cáo tour</Label>
                  <p className="text-sm text-muted-foreground">
                    Nhận email khi guide submit tour report
                  </p>
                </div>
                <Switch
                  checked={settings?.emailReportSubmitted ?? true}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("emailReportSubmitted", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Yêu cầu thanh toán</Label>
                  <p className="text-sm text-muted-foreground">
                    Nhận email khi guide yêu cầu thanh toán
                  </p>
                </div>
                <Switch
                  checked={settings?.emailPaymentRequest ?? true}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("emailPaymentRequest", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Báo cáo khẩn cấp</Label>
                  <p className="text-sm text-muted-foreground">
                    Nhận email khi có emergency report hoặc SOS
                  </p>
                </div>
                <Switch
                  checked={settings?.emailEmergency ?? true}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("emailEmergency", checked)
                  }
                />
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Thông báo trong ứng dụng</Label>
                    <p className="text-sm text-muted-foreground">
                      Bật/tắt tất cả thông báo trong ứng dụng
                    </p>
                  </div>
                  <Switch
                    checked={settings?.inAppNotifications ?? true}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("inAppNotifications", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy & Security */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>
                Quản lý quyền riêng tư và bảo mật tài khoản của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Hiển thị Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    {settings?.profileVisibility === "PUBLIC"
                      ? "Profile của bạn hiển thị công khai"
                      : "Profile của bạn chỉ hiển thị cho người có quyền truy cập"}
                  </p>
                </div>
                <Select
                  value={settings?.profileVisibility || "PUBLIC"}
                  onValueChange={(value) =>
                    updateSettingsMutation.mutate({ profileVisibility: value })
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Public</SelectItem>
                    <SelectItem value="PRIVATE">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isOperator && (
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Hiển thị số dư ví cho Guides</Label>
                    <p className="text-sm text-muted-foreground">
                      Cho phép guides xem số dư ví của bạn khi ứng tuyển
                    </p>
                  </div>
                  <Switch
                    checked={settings?.showWalletBalance ?? false}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("showWalletBalance", checked)
                    }
                  />
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold mb-4">Display & Language</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="language">Ngôn ngữ</Label>
                    <Select
                      value={settings?.language || "vi"}
                      onValueChange={(value) =>
                        updateSettingsMutation.mutate({ language: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vi">Tiếng Việt</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dateFormat">Định dạng ngày</Label>
                    <Select
                      value={settings?.dateFormat || "DD/MM/YYYY"}
                      onValueChange={(value) =>
                        updateSettingsMutation.mutate({ dateFormat: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="currencyDisplay">Hiển thị tiền tệ</Label>
                    <Select
                      value={settings?.currencyDisplay || "VND"}
                      onValueChange={(value) =>
                        updateSettingsMutation.mutate({ currencyDisplay: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VND">VND</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="BOTH">Cả hai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timezone">Múi giờ</Label>
                    <Select
                      value={settings?.timezone || "Asia/Ho_Chi_Minh"}
                      onValueChange={(value) =>
                        updateSettingsMutation.mutate({ timezone: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</SelectItem>
                        <SelectItem value="Asia/Bangkok">Asia/Bangkok (GMT+7)</SelectItem>
                        <SelectItem value="Asia/Singapore">Asia/Singapore (GMT+8)</SelectItem>
                        <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Preferences */}
        <TabsContent value="payment" className="space-y-6">
          {isOperator ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Preferences (Operator)
                </CardTitle>
                <CardDescription>
                  Cài đặt thanh toán cho tour operators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Tự động duyệt thanh toán</Label>
                    <p className="text-sm text-muted-foreground">
                      Tự động duyệt payment requests từ guides nếu amount &lt;= threshold
                    </p>
                  </div>
                  <Switch
                    checked={settings?.autoApprovePayments ?? false}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("autoApprovePayments", checked)
                    }
                  />
                </div>

                {settings?.autoApprovePayments && (
                  <div>
                    <Label htmlFor="autoApproveThreshold">
                      Threshold tự động duyệt (VND)
                    </Label>
                    <Input
                      id="autoApproveThreshold"
                      type="number"
                      min="0"
                      placeholder="1000000"
                      value={settings?.autoApproveThreshold || ""}
                      onChange={(e) =>
                        updateSettingsMutation.mutate({
                          autoApproveThreshold: e.target.value
                            ? parseFloat(e.target.value)
                            : null,
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Payment requests với amount &lt;= threshold sẽ được tự động duyệt
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="paymentReminderDays">
                    Nhắc nhở thanh toán (ngày)
                  </Label>
                  <Input
                    id="paymentReminderDays"
                    type="number"
                    min="0"
                    placeholder="7"
                    value={settings?.paymentReminderDays || 7}
                    onChange={(e) =>
                      updateSettingsMutation.mutate({
                        paymentReminderDays: parseInt(e.target.value) || 7,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Nhắc nhở thanh toán sau X ngày kể từ khi guide submit payment request
                  </p>
                </div>

                <div>
                  <Label htmlFor="defaultPaymentMethod">Phương thức thanh toán mặc định</Label>
                  <Select
                    value={settings?.defaultPaymentMethod || "WALLET"}
                    onValueChange={(value) =>
                      updateSettingsMutation.mutate({ defaultPaymentMethod: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WALLET">Ví nội bộ</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Chuyển khoản ngân hàng</SelectItem>
                      <SelectItem value="CARD">Thẻ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="paymentCurrency">Tiền tệ thanh toán</Label>
                  <Select
                    value={settings?.paymentCurrency || "VND"}
                    onValueChange={(value) =>
                      updateSettingsMutation.mutate({ paymentCurrency: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VND">VND</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="paymentSchedule">Lịch thanh toán</Label>
                  <Select
                    value={settings?.paymentSchedule || "IMMEDIATE"}
                    onValueChange={(value) =>
                      updateSettingsMutation.mutate({ paymentSchedule: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IMMEDIATE">Thanh toán ngay</SelectItem>
                      <SelectItem value="WEEKLY">Hàng tuần</SelectItem>
                      <SelectItem value="MONTHLY">Hàng tháng</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tần suất thanh toán cho guides (áp dụng cho batch payments)
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Preferences (Guide)
                </CardTitle>
                <CardDescription>
                  Cài đặt thanh toán cho tour guides
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="preferredPaymentMethod">Phương thức thanh toán ưa thích</Label>
                  <Select
                    value={settings?.preferredPaymentMethod || "WALLET"}
                    onValueChange={(value) =>
                      updateSettingsMutation.mutate({ preferredPaymentMethod: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WALLET">Ví nội bộ</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Chuyển khoản ngân hàng</SelectItem>
                      <SelectItem value="CARD">Thẻ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Tự động rút tiền</Label>
                    <p className="text-sm text-muted-foreground">
                      Tự động tạo withdrawal request khi balance đạt threshold
                    </p>
                  </div>
                  <Switch
                    checked={settings?.autoWithdrawEnabled ?? false}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("autoWithdrawEnabled", checked)
                    }
                  />
                </div>

                {settings?.autoWithdrawEnabled && (
                  <div>
                    <Label htmlFor="autoWithdrawThreshold">
                      Threshold tự động rút (VND)
                    </Label>
                    <Input
                      id="autoWithdrawThreshold"
                      type="number"
                      min="0"
                      placeholder="5000000"
                      value={settings?.autoWithdrawThreshold || ""}
                      onChange={(e) =>
                        updateSettingsMutation.mutate({
                          autoWithdrawThreshold: e.target.value
                            ? parseFloat(e.target.value)
                            : null,
                        })
                      }
                    />
                     <p className="text-xs text-muted-foreground mt-1">
                       Tự động tạo withdrawal request khi balance &gt;= threshold
                     </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Nhắc nhở thanh toán</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo khi operator chưa thanh toán sau khi submit payment request
                    </p>
                  </div>
                  <Switch
                    checked={settings?.paymentReminderEnabled ?? true}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("paymentReminderEnabled", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tour Preferences (Operators only) */}
        {isOperator && (
          <TabsContent value="tour-preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Tour Preferences
                </CardTitle>
                <CardDescription>
                  Cài đặt mặc định khi tạo tour mới
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="defaultTourVisibility">Visibility mặc định</Label>
                  <Select
                    value={settings?.defaultTourVisibility || "PUBLIC"}
                    onValueChange={(value) =>
                      updateSettingsMutation.mutate({ defaultTourVisibility: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC">Public</SelectItem>
                      <SelectItem value="PRIVATE">Private</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tours mới sẽ có visibility này mặc định
                  </p>
                </div>

                <div>
                  <Label htmlFor="defaultCurrency">Tiền tệ mặc định</Label>
                  <Select
                    value={settings?.defaultCurrency || "VND"}
                    onValueChange={(value) =>
                      updateSettingsMutation.mutate({ defaultCurrency: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VND">VND</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="defaultMainGuideSlots">Main Guide Slots mặc định</Label>
                    <Input
                      id="defaultMainGuideSlots"
                      type="number"
                      min="1"
                      value={settings?.defaultMainGuideSlots || 1}
                      onChange={(e) =>
                        updateSettingsMutation.mutate({
                          defaultMainGuideSlots: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="defaultSubGuideSlots">Sub Guide Slots mặc định</Label>
                    <Input
                      id="defaultSubGuideSlots"
                      type="number"
                      min="0"
                      value={settings?.defaultSubGuideSlots || 0}
                      onChange={(e) =>
                        updateSettingsMutation.mutate({
                          defaultSubGuideSlots: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="autoCloseToursDays">
                    Tự động đóng tour (ngày)
                  </Label>
                  <Input
                    id="autoCloseToursDays"
                    type="number"
                    min="0"
                    placeholder="Không tự động đóng"
                    value={settings?.autoCloseToursDays || ""}
                    onChange={(e) =>
                      updateSettingsMutation.mutate({
                        autoCloseToursDays: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Tự động đóng tour sau X ngày không có ứng tuyển (để trống = không tự động)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Display & Language (Guides only) */}
        {!isOperator && (
          <TabsContent value="display" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Display & Language
                </CardTitle>
                <CardDescription>
                  Tùy chỉnh ngôn ngữ và định dạng hiển thị
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="language">Ngôn ngữ</Label>
                  <Select
                    value={settings?.language || "vi"}
                    onValueChange={(value) =>
                      updateSettingsMutation.mutate({ language: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dateFormat">Định dạng ngày</Label>
                  <Select
                    value={settings?.dateFormat || "DD/MM/YYYY"}
                    onValueChange={(value) =>
                      updateSettingsMutation.mutate({ dateFormat: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currencyDisplay">Hiển thị tiền tệ</Label>
                  <Select
                    value={settings?.currencyDisplay || "VND"}
                    onValueChange={(value) =>
                      updateSettingsMutation.mutate({ currencyDisplay: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VND">VND</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="BOTH">Cả hai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold mb-4">Guide Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-apply to matching tours</Label>
                        <p className="text-sm text-muted-foreground">
                          Tự động ứng tuyển vào tours phù hợp (tính năng sắp ra mắt)
                        </p>
                      </div>
                      <Switch
                        checked={settings?.autoApplyEnabled ?? false}
                        onCheckedChange={(checked) =>
                          handleNotificationChange("autoApplyEnabled", checked)
                        }
                        disabled
                      />
                    </div>

                    <div>
                      <Label htmlFor="minTourPrice">Giá tour tối thiểu (VND)</Label>
                      <Input
                        id="minTourPrice"
                        type="number"
                        min="0"
                        placeholder="Không giới hạn"
                        value={settings?.minTourPrice || ""}
                        onChange={(e) =>
                          updateSettingsMutation.mutate({
                            minTourPrice: e.target.value ? parseFloat(e.target.value) : null,
                          })
                        }
                      />
                       <p className="text-xs text-muted-foreground mt-1">
                         Chỉ hiển thị tours có giá &gt;= giá này
                       </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </>
  );
}

