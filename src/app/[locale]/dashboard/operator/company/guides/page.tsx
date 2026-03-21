"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api-client";
import toast from "react-hot-toast";
import {
  Users,
  Mail,
  Trash2,
  Edit,
  Save,
  X,
  Loader2,
  ArrowLeft,
  UserPlus,
} from "lucide-react";
import { Link } from '@/navigation';
import { formatCurrency } from "@/lib/utils";
import { InviteGuideDialog } from "@/components/invite-guide-dialog";

export default function CompanyGuidesPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    companyEmail: "",
    status: "PENDING" as "PENDING" | "APPROVED" | "REJECTED",
    employmentContractUrl: "",
  });

  // Get user info to get company ID
  const { data: userInfo } = useQuery({
    queryKey: ["userInfo"],
    queryFn: () => api.user.getInfo(),
  });

  const companyId = userInfo?.company?.id;

  // Fetch company guides
  const { data: guides = [], isLoading } = useQuery({
    queryKey: ["companyGuides", companyId],
    queryFn: () => api.companies.getGuides(companyId!),
    enabled: !!companyId,
  });

  // Remove guide mutation
  const removeGuideMutation = useMutation({
    mutationFn: (guideId: string) =>
      api.companies.removeGuide(companyId!, guideId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companyGuides"] });
      queryClient.invalidateQueries({ queryKey: ["company"] });
      toast.success("Guide removed from company");
    },
    onError: (error: any) => {
      toast.error(error.message || "An error occurred");
    },
  });

  // Update guide mutation
  const updateGuideMutation = useMutation({
    mutationFn: (data: { guideId: string; companyEmail?: string; status?: string; employmentContractUrl?: string }) =>
      api.companies.updateGuide(companyId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companyGuides"] });
      queryClient.invalidateQueries({ queryKey: ["company"] });
      setEditingId(null);
      toast.success("Guide info updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "An error occurred");
    },
  });

  const handleEdit = (member: any) => {
    setEditingId(member.guideId);
    setEditForm({
      companyEmail: member.companyEmail || "",
      status: member.status,
      employmentContractUrl: member.employmentContractUrl || "",
    });
  };

  const handleSave = (guideId: string) => {
    updateGuideMutation.mutate({
      guideId,
      companyEmail: editForm.companyEmail || undefined,
      status: editForm.status,
      employmentContractUrl: editForm.employmentContractUrl || undefined,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ companyEmail: "", status: "PENDING", employmentContractUrl: "" });
  };

  const handleRemove = (guideId: string, guideName: string) => {
    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa ${guideName} khỏi công ty? Guide sẽ không còn là in-house guide nữa.`
      )
    ) {
      return;
    }
    removeGuideMutation.mutate(guideId);
  };

  if (!companyId) {
    return (
      <>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Bạn chưa có công ty.{" "}
              <Link
                href="/dashboard/operator/company/create"
                className="text-lunavia-primary hover:underline"
              >
                Tạo công ty
              </Link>
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Manage Guides"
        description="Manage in-house guides in your company"
        action={
          <Link href="/dashboard/operator/company">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
        }
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Danh sách Guides ({guides.length})
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowInviteDialog(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Mời Guide
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-lunavia-primary" />
              </div>
            ) : guides.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <p className="text-muted-foreground mb-4">
                  Chưa có guide nào trong công ty
                </p>
                <Button onClick={() => setShowInviteDialog(true)}>
                  Mời Guide
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {guides.map((member: any) => {
                  const isEditing = editingId === member.guideId;
                  const guide = member.guide;
                  const profile = guide?.profile;

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar>
                          <AvatarImage
                            src={profile?.photoUrl || undefined}
                            alt={profile?.name || guide?.email}
                          />
                          <AvatarFallback>
                            {profile?.name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase() || guide?.email?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">
                              {profile?.name || guide?.email || "Unknown"}
                            </p>
                            {guide?.code && (
                              <span className="text-xs text-muted-foreground font-mono">
                                {guide.code}
                              </span>
                            )}
                          </div>
                          {isEditing ? (
                            <div className="mt-2 space-y-2">
                              <div>
                                <Label htmlFor={`email-${member.guideId}`}>
                                  Company Email
                                </Label>
                                <Input
                                  id={`email-${member.guideId}`}
                                  type="email"
                                  value={editForm.companyEmail}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      companyEmail: e.target.value,
                                    })
                                  }
                                  placeholder="company@example.com"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`status-${member.guideId}`}>
                                  Status
                                </Label>
                                <Select
                                  value={editForm.status}
                                  onValueChange={(value: any) =>
                                    setEditForm({ ...editForm, status: value })
                                  }
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span>
                                  {member.companyEmail || guide?.email || "N/A"}
                                </span>
                              </div>
                              {guide?.wallet && (
                                <p className="text-xs text-muted-foreground">
                                  Balance: {formatCurrency(guide.wallet.balance)}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSave(member.guideId)}
                              disabled={updateGuideMutation.isPending}
                            >
                              {updateGuideMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancel}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <StatusBadge status={member.status} />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(member)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleRemove(
                                  member.guideId,
                                  profile?.name || guide?.email || "Guide"
                                )
                              }
                              disabled={removeGuideMutation.isPending}
                            >
                              {removeGuideMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <InviteGuideDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        companyId={companyId!}
      />
    </>
  );
}

