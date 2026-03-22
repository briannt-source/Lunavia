"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, User, Bell, Shield, MapPin, Globe, Eye, Lock, CreditCard, Banknote } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

export default function SettingsPage() {
  const t = useTranslations("Shared.Settings");
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [emailForm, setEmailForm] = useState({ newEmail: "" });

  const isOperator = session?.user?.role === "TOUR_OPERATOR" || session?.user?.role === "TOUR_AGENCY";

  const { data: settings } = useQuery({
    queryKey: ["userSettings"],
    queryFn: async () => {
      const r = await fetch("/api/user/settings");
      if (!r.ok) return null;
      return r.json();
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const r = await fetch("/api/user/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!r.ok) { const err = await r.json(); throw new Error(err.error || "Update failed"); }
      return r.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["userSettings"] }); toast.success("Settings updated"); },
    onError: (err: any) => { toast.error(err.message || "Error updating"); },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      const r = await fetch("/api/user/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!r.ok) { const err = await r.json(); throw new Error(err.error || "Update failed"); }
      return r.json();
    },
    onSuccess: () => { toast.success("Password updated"); setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); },
    onError: (err: any) => { toast.error(err.message || "Error updating password"); },
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords don't match"); return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters"); return;
    }
    updatePasswordMutation.mutate({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
  };

  return (
    <>
      <PageHeader title={t("title")} description={t("subtitle")} />

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="account"><User className="h-4 w-4 mr-2" />{t("tabs.account")}</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-2" />{t("tabs.notifications")}</TabsTrigger>
          <TabsTrigger value="privacy"><Shield className="h-4 w-4 mr-2" />{t("tabs.privacy")}</TabsTrigger>
          {isOperator && <TabsTrigger value="tour-preferences"><MapPin className="h-4 w-4 mr-2" />{t("tabs.tour")}</TabsTrigger>}
          {!isOperator && <TabsTrigger value="display"><Globe className="h-4 w-4 mr-2" />{t("tabs.display")}</TabsTrigger>}
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />{t("account.changeEmail")}</CardTitle>
              <CardDescription>{t("account.changeEmailDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newEmail">{t("account.newEmail")}</Label>
                <Input id="newEmail" type="email" value={emailForm.newEmail} onChange={(e) => setEmailForm({ newEmail: e.target.value })} />
              </div>
              <Button disabled>{t("account.updateEmail")}</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />{t("account.changePassword")}</CardTitle>
              <CardDescription>{t("account.changePasswordDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label htmlFor="currentPassword">{t("account.currentPassword")}</Label><Input id="currentPassword" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="newPassword">{t("account.newPassword")}</Label><Input id="newPassword" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="confirmPassword">{t("account.confirmPassword")}</Label><Input id="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} /></div>
              <Button onClick={handlePasswordChange} disabled={updatePasswordMutation.isPending}>{updatePasswordMutation.isPending ? t("account.updating") : t("account.updatePassword")}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />{t("notifications.emailPreferences")}</CardTitle>
              <CardDescription>{t("notifications.emailPreferencesDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isOperator && (
                <>
                  <div className="flex items-center justify-between"><div className="space-y-0.5"><Label>{t("notifications.newApplication")}</Label><p className="text-sm text-muted-foreground">{t("notifications.newApplicationDesc")}</p></div><Switch checked={settings?.notifyNewApplication ?? true} onCheckedChange={(v) => handleNotificationChange("notifyNewApplication", v)} /></div>
                  <div className="flex items-center justify-between"><div className="space-y-0.5"><Label>{t("notifications.tourReport")}</Label><p className="text-sm text-muted-foreground">{t("notifications.tourReportDesc")}</p></div><Switch checked={settings?.notifyTourReport ?? true} onCheckedChange={(v) => handleNotificationChange("notifyTourReport", v)} /></div>
                  <div className="flex items-center justify-between"><div className="space-y-0.5"><Label>{t("notifications.paymentRequest")}</Label><p className="text-sm text-muted-foreground">{t("notifications.paymentRequestDesc")}</p></div><Switch checked={settings?.notifyPaymentRequest ?? true} onCheckedChange={(v) => handleNotificationChange("notifyPaymentRequest", v)} /></div>
                  <div className="flex items-center justify-between"><div className="space-y-0.5"><Label>{t("notifications.emergency")}</Label><p className="text-sm text-muted-foreground">{t("notifications.emergencyDesc")}</p></div><Switch checked={settings?.notifyEmergency ?? true} onCheckedChange={(v) => handleNotificationChange("notifyEmergency", v)} /></div>
                </>
              )}
              {!isOperator && (
                <>
                  <div className="flex items-center justify-between"><div className="space-y-0.5"><Label>{t("notifications.applicationStatus")}</Label><p className="text-sm text-muted-foreground">{t("notifications.applicationStatusDesc")}</p></div><Switch checked={settings?.notifyApplicationStatus ?? true} onCheckedChange={(v) => handleNotificationChange("notifyApplicationStatus", v)} /></div>
                  <div className="flex items-center justify-between"><div className="space-y-0.5"><Label>{t("notifications.tourStarted")}</Label><p className="text-sm text-muted-foreground">{t("notifications.tourStartedDesc")}</p></div><Switch checked={settings?.notifyTourStarted ?? true} onCheckedChange={(v) => handleNotificationChange("notifyTourStarted", v)} /></div>
                  <div className="flex items-center justify-between"><div className="space-y-0.5"><Label>{t("notifications.tourCancelled")}</Label><p className="text-sm text-muted-foreground">{t("notifications.tourCancelledDesc")}</p></div><Switch checked={settings?.notifyTourCancelled ?? true} onCheckedChange={(v) => handleNotificationChange("notifyTourCancelled", v)} /></div>
                </>
              )}
              <div className="flex items-center justify-between"><div className="space-y-0.5"><Label>{t("notifications.payment")}</Label><p className="text-sm text-muted-foreground">{t("notifications.paymentDesc")}</p></div><Switch checked={settings?.notifyPayment ?? true} onCheckedChange={(v) => handleNotificationChange("notifyPayment", v)} /></div>
              <div className="flex items-center justify-between"><div className="space-y-0.5"><Label>{t("notifications.newMessage")}</Label><p className="text-sm text-muted-foreground">{t("notifications.newMessageDesc")}</p></div><Switch checked={settings?.notifyNewMessage ?? true} onCheckedChange={(v) => handleNotificationChange("notifyNewMessage", v)} /></div>
              <div className="border-t pt-4 flex items-center justify-between"><div className="space-y-0.5"><Label>{t("notifications.inApp")}</Label><p className="text-sm text-muted-foreground">{t("notifications.inAppDesc")}</p></div><Switch checked={settings?.inAppNotifications ?? true} onCheckedChange={(v) => handleNotificationChange("inAppNotifications", v)} /></div>
            </CardContent>
          </Card>

          {/* Payment preferences */}
          {isOperator && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />{t("payment.operatorTitle")}</CardTitle>
                <CardDescription>{t("payment.operatorDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between"><div className="space-y-0.5"><Label>{t("payment.autoApprove")}</Label><p className="text-sm text-muted-foreground">{t("payment.autoApproveDesc")}</p></div><Switch checked={settings?.autoApprovePayments ?? false} onCheckedChange={(v) => handleNotificationChange("autoApprovePayments", v)} /></div>
                {settings?.autoApprovePayments && (
                  <div><Label>{t("payment.autoApproveThreshold")}</Label><Input type="number" value={settings?.autoApproveThreshold || 0} onChange={(e) => updateSettingsMutation.mutate({ autoApproveThreshold: parseFloat(e.target.value) || 0 })} /><p className="text-xs text-muted-foreground mt-1">{t("payment.autoApproveThresholdDesc")}</p></div>
                )}
                <div><Label>{t("payment.paymentReminder")}</Label><Input type="number" value={settings?.paymentReminderDays || 3} onChange={(e) => updateSettingsMutation.mutate({ paymentReminderDays: parseInt(e.target.value) || 3 })} /><p className="text-xs text-muted-foreground mt-1">{t("payment.paymentReminderDesc")}</p></div>
                <div><Label>{t("payment.defaultPaymentMethod")}</Label>
                  <Select value={settings?.defaultPaymentMethod || "WALLET"} onValueChange={(v) => updateSettingsMutation.mutate({ defaultPaymentMethod: v })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="WALLET">{t("payment.internalWallet")}</SelectItem><SelectItem value="BANK">{t("payment.bankTransfer")}</SelectItem><SelectItem value="CARD">{t("payment.card")}</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>{t("payment.paymentSchedule")}</Label>
                  <Select value={settings?.paymentSchedule || "IMMEDIATE"} onValueChange={(v) => updateSettingsMutation.mutate({ paymentSchedule: v })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="IMMEDIATE">{t("payment.immediate")}</SelectItem><SelectItem value="WEEKLY">{t("payment.weekly")}</SelectItem><SelectItem value="MONTHLY">{t("payment.monthly")}</SelectItem></SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">{t("payment.scheduleDesc")}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {!isOperator && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Banknote className="h-5 w-5" />{t("payment.guideTitle")}</CardTitle>
                <CardDescription>{t("payment.guideDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div><Label>{t("payment.preferredMethod")}</Label>
                  <Select value={settings?.preferredPaymentMethod || "WALLET"} onValueChange={(v) => updateSettingsMutation.mutate({ preferredPaymentMethod: v })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="WALLET">{t("payment.internalWallet")}</SelectItem><SelectItem value="BANK">{t("payment.bankTransfer")}</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between"><div className="space-y-0.5"><Label>{t("payment.autoWithdraw")}</Label><p className="text-sm text-muted-foreground">{t("payment.autoWithdrawDesc")}</p></div><Switch checked={settings?.autoWithdrawEnabled ?? false} onCheckedChange={(v) => handleNotificationChange("autoWithdrawEnabled", v)} /></div>
                {settings?.autoWithdrawEnabled && (
                  <div><Label>{t("payment.autoWithdrawThreshold")}</Label><Input type="number" value={settings?.autoWithdrawThreshold || 0} onChange={(e) => updateSettingsMutation.mutate({ autoWithdrawThreshold: parseFloat(e.target.value) || 0 })} /><p className="text-xs text-muted-foreground mt-1">{t("payment.autoWithdrawThresholdDesc")}</p></div>
                )}
                <div className="flex items-center justify-between"><div className="space-y-0.5"><Label>{t("payment.paymentReminderGuide")}</Label><p className="text-sm text-muted-foreground">{t("payment.paymentReminderGuideDesc")}</p></div><Switch checked={settings?.paymentReminderEnabled ?? true} onCheckedChange={(v) => handleNotificationChange("paymentReminderEnabled", v)} /></div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />{t("privacy.title")}</CardTitle>
              <CardDescription>{t("privacy.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between"><div className="space-y-0.5"><Label>{t("privacy.profileVisibility")}</Label></div>
                <Select value={settings?.profileVisibility || "PUBLIC"} onValueChange={(v) => updateSettingsMutation.mutate({ profileVisibility: v })}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="PUBLIC">Public</SelectItem><SelectItem value="PRIVATE">Private</SelectItem></SelectContent>
                </Select>
              </div>
              {isOperator && (
                <div className="flex items-center justify-between"><div className="space-y-0.5"><Label>{t("privacy.walletVisibility")}</Label><p className="text-sm text-muted-foreground">{t("privacy.walletVisibilityDesc")}</p></div><Switch checked={settings?.showWalletToGuides ?? false} onCheckedChange={(v) => handleNotificationChange("showWalletToGuides", v)} /></div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />{t("privacy.displayLanguage")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div><Label>{t("privacy.language")}</Label>
                <Select value={settings?.language || "vi"} onValueChange={(v) => updateSettingsMutation.mutate({ language: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="vi">Vietnamese</SelectItem><SelectItem value="en">English</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>{t("privacy.dateFormat")}</Label>
                <Select value={settings?.dateFormat || "DD/MM/YYYY"} onValueChange={(v) => updateSettingsMutation.mutate({ dateFormat: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem><SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>{t("privacy.currencyDisplay")}</Label>
                <Select value={settings?.currencyDisplay || "VND"} onValueChange={(v) => updateSettingsMutation.mutate({ currencyDisplay: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="VND">VND</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="BOTH">{t("privacy.both")}</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>{t("privacy.timezone")}</Label>
                <Select value={settings?.timezone || "Asia/Ho_Chi_Minh"} onValueChange={(v) => updateSettingsMutation.mutate({ timezone: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (UTC+7)</SelectItem><SelectItem value="Asia/Bangkok">Asia/Bangkok (UTC+7)</SelectItem><SelectItem value="America/New_York">America/New_York (UTC-5)</SelectItem><SelectItem value="Europe/London">Europe/London (UTC+0)</SelectItem></SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tour Preferences (Operators only) */}
        {isOperator && (
          <TabsContent value="tour-preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />{t("tourPreferences.title")}</CardTitle>
                <CardDescription>{t("tourPreferences.subtitle")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Default Visibility</Label>
                  <Select value={settings?.defaultTourVisibility || "PUBLIC"} onValueChange={(v) => updateSettingsMutation.mutate({ defaultTourVisibility: v })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="PUBLIC">Public</SelectItem><SelectItem value="PRIVATE">Private</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Default Currency</Label>
                  <Select value={settings?.defaultCurrency || "VND"} onValueChange={(v) => updateSettingsMutation.mutate({ defaultCurrency: v })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="VND">VND</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Main Guide Slots</Label><Input type="number" min="1" value={settings?.defaultMainGuideSlots || 1} onChange={(e) => updateSettingsMutation.mutate({ defaultMainGuideSlots: parseInt(e.target.value) || 1 })} /></div>
                  <div><Label>Sub Guide Slots</Label><Input type="number" min="0" value={settings?.defaultSubGuideSlots || 0} onChange={(e) => updateSettingsMutation.mutate({ defaultSubGuideSlots: parseInt(e.target.value) || 0 })} /></div>
                </div>
                <div>
                  <Label>Auto-close Tours (days)</Label>
                  <Input type="number" min="0" placeholder="No auto-close" value={settings?.autoCloseToursDays || ""} onChange={(e) => updateSettingsMutation.mutate({ autoCloseToursDays: e.target.value ? parseInt(e.target.value) : null })} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Display (Guides only) */}
        {!isOperator && (
          <TabsContent value="display" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />{t("privacy.displayLanguage")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div><Label>{t("privacy.language")}</Label>
                  <Select value={settings?.language || "vi"} onValueChange={(v) => updateSettingsMutation.mutate({ language: v })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="vi">Vietnamese</SelectItem><SelectItem value="en">English</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>{t("privacy.dateFormat")}</Label>
                  <Select value={settings?.dateFormat || "DD/MM/YYYY"} onValueChange={(v) => updateSettingsMutation.mutate({ dateFormat: v })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem><SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>{t("privacy.currencyDisplay")}</Label>
                  <Select value={settings?.currencyDisplay || "VND"} onValueChange={(v) => updateSettingsMutation.mutate({ currencyDisplay: v })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="VND">VND</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="BOTH">{t("privacy.both")}</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold mb-4">Guide Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between"><div className="space-y-0.5"><Label>Auto-apply to matching tours</Label><p className="text-sm text-muted-foreground">Coming soon</p></div><Switch checked={settings?.autoApplyEnabled ?? false} onCheckedChange={(v) => handleNotificationChange("autoApplyEnabled", v)} disabled /></div>
                    <div><Label>Min Tour Price (VND)</Label><Input type="number" min="0" placeholder="Unlimited" value={settings?.minTourPrice || ""} onChange={(e) => updateSettingsMutation.mutate({ minTourPrice: e.target.value ? parseFloat(e.target.value) : null })} /></div>
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
