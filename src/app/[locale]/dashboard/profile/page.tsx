"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarUpload } from "@/components/avatar-upload";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import toast from "react-hot-toast";
import { 
  User, 
  Mail, 
  Shield, 
  Wallet, 
  CheckCircle, 
  XCircle, 
  Clock,
  Building2,
  FileText,
  AlertCircle,
  Save
} from "lucide-react";
import { Link } from '@/navigation';

export default function ProfilePage() {
  const t = useTranslations("Shared.Profile");
  const { data: session } = useSession();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    photoUrl: "",
    name: "",
    bio: "",
    languages: "",
    specialties: "",
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/user/info");
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
          if (data.profile) {
            setProfileData({
              photoUrl: data.profile.photoUrl || "",
              name: data.profile.name || "",
              bio: data.profile.bio || "",
              languages: data.profile.languages?.join(", ") || "",
              specialties: data.profile.specialties?.join(", ") || "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchUserInfo();
    }
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profileData,
          languages: profileData.languages.split(",").map((s) => s.trim()).filter(Boolean),
          specialties: profileData.specialties.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
        setEditMode(false);
        const infoResponse = await fetch("/api/user/info");
        if (infoResponse.ok) {
          const data = await infoResponse.json();
          setUserInfo(data);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }
    } catch (error: any) {
      toast.error(error.message || "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">{t("loadError")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const user = {
    id: userInfo.id,
    email: userInfo.email,
    role: userInfo.role,
    licenseNumber: userInfo.licenseNumber,
    verifiedStatus: userInfo.verifiedStatus,
    employmentType: userInfo.employmentType,
    createdAt: userInfo.createdAt,
    updatedAt: userInfo.updatedAt,
  };
  const { profile, wallet, verification, permissions } = userInfo;

  if (!user.email && !session?.user?.email) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">{t("loginError")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getVerificationStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getVerificationStatusText = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "Verified";
      case "REJECTED":
        return "Rejected";
      case "PENDING":
        return "Pending Review";
      default:
        return "Not Submitted";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{t("title")}</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("basicInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{user?.email || session?.user?.email || "N/A"}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">{t("role")}</p>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{user?.role || "N/A"}</p>
              </div>
            </div>

            {user?.licenseNumber && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t("licenseNumber")}</p>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{user.licenseNumber}</p>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground mb-1">{t("verificationStatus")}</p>
              <div className="flex items-center gap-2">
                {getVerificationStatusIcon(user?.verifiedStatus || "NOT_SUBMITTED")}
                <p className="font-medium">
                  {getVerificationStatusText(user?.verifiedStatus || "NOT_SUBMITTED")}
                </p>
              </div>
            </div>

            {profile?.name && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t("name")}</p>
                <p className="font-medium">{profile.name}</p>
              </div>
            )}

            {profile?.companyName && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t("companyName")}</p>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{profile.companyName}</p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? t("cancelEdit") : t("editProfile")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        {editMode && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t("editProfileTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <AvatarUpload
                currentAvatar={profileData.photoUrl}
                onAvatarChange={(url) =>
                  setProfileData({ ...profileData, photoUrl: url })
                }
              />

              <div className="space-y-2">
                <Label htmlFor="name">{t("name")}</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">{t("bio")}</Label>
                <textarea
                  id="bio"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                  placeholder="Tell about yourself..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="languages">{t("languages")}</Label>
                <Input
                  id="languages"
                  value={profileData.languages}
                  onChange={(e) =>
                    setProfileData({ ...profileData, languages: e.target.value })
                  }
                  placeholder="Vietnamese, English, Chinese"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialties">{t("specialties")}</Label>
                <Input
                  id="specialties"
                  value={profileData.specialties}
                  onChange={(e) =>
                    setProfileData({ ...profileData, specialties: e.target.value })
                  }
                  placeholder="Culture, History, Cuisine"
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditMode(false)}
                >
                  {t("cancel")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wallet Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              {t("walletInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {wallet ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t("balance")}</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(wallet.balance)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t("lockedDeposit")}</p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(0)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t("reserved")}</p>
                  <p className="text-lg font-medium">
                    {formatCurrency(0)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t("availableBalance")}</p>
                  <p className="text-lg font-medium text-emerald-600">
                    {formatCurrency(wallet.balance)}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">{t("noWallet")}</p>
            )}
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("permissions")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold mb-2">Create Tour</p>
              {permissions.canCreateTour.canCreate ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <p>{t("canCreateTour")}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-5 w-5" />
                    <p>{t("cannotCreateTour")}</p>
                  </div>
                  <p className="text-sm text-muted-foreground ml-7">
                    {permissions.canCreateTour.reason}
                  </p>
                </div>
              )}
            </div>

            <div>
              <p className="font-semibold mb-2">Apply for Tour</p>
              {permissions.canApplyToTour.canApply ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <p>{t("canApplyTour")}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-5 w-5" />
                    <p>{t("cannotApplyTour")}</p>
                  </div>
                  <p className="text-sm text-muted-foreground ml-7">
                    {permissions.canApplyToTour.reason}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Verification Details */}
        {verification && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t("verificationDetails")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Status:</span>{" "}
                  {getVerificationStatusText(verification.status)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Created:</span>{" "}
                  {formatDateTime(verification.createdAt)}
                </p>
                {verification.adminNotes && (
                  <div>
                    <p className="text-sm font-medium mb-1">{t("adminNotes")}</p>
                    <p className="text-sm text-muted-foreground">
                      {verification.adminNotes}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-6 flex gap-4">
        <Link href="/dashboard">
          <Button variant="outline">{t("backToDashboard")}</Button>
        </Link>
        {(user?.role === "TOUR_OPERATOR" || user?.role === "TOUR_AGENCY") && (
          <Link href="/dashboard/operator/tours/new">
            <Button>Create Tour</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
