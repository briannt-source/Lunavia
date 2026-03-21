"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { formatDateTime } from "@/lib/utils";
import { Shield, CheckCircle2, XCircle, ArrowLeft, FileText, Image as ImageIcon } from "lucide-react";
import { Link } from '@/navigation';
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function VerificationDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const verificationId = params.id as string;
  const queryClient = useQueryClient();

  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [action, setAction] = useState<"approve" | "reject">("approve");
  const [processing, setProcessing] = useState(false);

  // Fetch verification details
  const { data: verification, isLoading } = useQuery({
    queryKey: ["admin", "verification", verificationId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/verifications/${verificationId}`);
      if (!response.ok) throw new Error("Failed to fetch verification");
      return response.json();
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (notes: string) => {
      const response = await fetch(`/api/verifications/${verificationId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: notes }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to approve verification");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Verification approved successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "verification", verificationId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "verifications"] });
      router.push("/dashboard/admin/verifications");
    },
    onError: (error: any) => {
      toast.error(error.message || "An error occurred");
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async (reason: string) => {
      const response = await fetch(`/api/verifications/${verificationId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: reason }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reject verification");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Verification rejected successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "verification", verificationId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "verifications"] });
      router.push("/dashboard/admin/verifications");
    },
    onError: (error: any) => {
      toast.error(error.message || "An error occurred");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      if (action === "approve") {
        await approveMutation.mutateAsync(adminNotes);
      } else {
        if (!rejectionReason.trim()) {
          toast.error("Please enter a rejection reason");
          setProcessing(false);
          return;
        }
        await rejectMutation.mutateAsync(rejectionReason);
      }
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="text-center py-12">
          <p className="text-slate-600">Loading...</p>
        </div>
      </>
    );
  }

  if (!verification) {
    return (
      <>
        <div className="text-center py-12">
          <p className="text-slate-600">Not found yêu cầu xác minh</p>
          <Link href="/dashboard/admin/verifications">
            <Button variant="outline" className="mt-4">
              Quay lại
            </Button>
          </Link>
        </div>
      </>
    );
  }

  const verificationType = verification.user.role === "TOUR_GUIDE" ? "KYC" : "KYB";
  
  // Get documents organized by type from API response
  const documentsByType = (verification as any).documentsByType;
  
  // Fallback: if documentsByType is not available, use legacy fields
  // This ensures we always show something if files exist
  const fallbackDocuments = {
    photoUrl: verification.photoUrl ? [verification.photoUrl] : [],
    idDocumentUrl: verification.idDocumentUrl ? [verification.idDocumentUrl] : [],
    licenseUrl: verification.licenseUrl ? [verification.licenseUrl] : [],
    travelLicenseUrl: verification.travelLicenseUrl ? [verification.travelLicenseUrl] : [],
    proofOfAddressUrl: verification.proofOfAddressUrl ? [verification.proofOfAddressUrl] : [],
    allDocuments: Array.isArray(verification.documents) ? verification.documents.filter(Boolean) : [],
  };
  
  // Use documentsByType if available, otherwise use fallback
  // Merge both to ensure we show all available files
  const finalDocuments = documentsByType ? {
    photoUrl: documentsByType.photoUrl?.length > 0 ? documentsByType.photoUrl : fallbackDocuments.photoUrl,
    idDocumentUrl: documentsByType.idDocumentUrl?.length > 0 ? documentsByType.idDocumentUrl : fallbackDocuments.idDocumentUrl,
    licenseUrl: documentsByType.licenseUrl?.length > 0 ? documentsByType.licenseUrl : fallbackDocuments.licenseUrl,
    travelLicenseUrl: documentsByType.travelLicenseUrl?.length > 0 ? documentsByType.travelLicenseUrl : fallbackDocuments.travelLicenseUrl,
    proofOfAddressUrl: documentsByType.proofOfAddressUrl?.length > 0 ? documentsByType.proofOfAddressUrl : fallbackDocuments.proofOfAddressUrl,
    allDocuments: documentsByType.allDocuments?.length > 0 ? documentsByType.allDocuments : fallbackDocuments.allDocuments,
  } : fallbackDocuments;
  
  // Organize documents by type with labels
  const documentGroups = [
    {
      label: "Real Photo",
      key: "photoUrl",
      urls: finalDocuments.photoUrl || [],
      required: true,
    },
    {
      label: "National ID / Passport",
      key: "idDocumentUrl",
      urls: finalDocuments.idDocumentUrl || [],
      required: true,
    },
    {
      label: verificationType === "KYC" ? "Tour Guide License" : "Business License",
      key: "licenseUrl",
      urls: finalDocuments.licenseUrl || [],
      required: true,
    },
    ...(verificationType === "KYB" && verification.user.role === "TOUR_OPERATOR"
      ? [{
          label: "Int'l/Domestic Travel License",
          key: "travelLicenseUrl",
          urls: finalDocuments.travelLicenseUrl || [],
          required: true,
        }]
      : []),
    {
      label: "Proof of Address",
      key: "proofOfAddressUrl",
      urls: finalDocuments.proofOfAddressUrl || [],
      required: true,
    },
  ].filter((group) => group.urls.length > 0);

  return (
    <>
      <PageHeader
        title={`Xác minh ${verificationType}`}
        description={`ID: ${verification.id}`}
        action={
          <Link href="/dashboard/admin/verifications">
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
              <div className="flex items-center justify-between">
                <CardTitle>Information người dùng</CardTitle>
                <StatusBadge status={verification.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-500">Tên</Label>
                <p className="mt-1 font-semibold">
                  {verification.user.profile?.name || verification.user.email}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-500">Email</Label>
                <p className="mt-1">{verification.user.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-500">Vai trò</Label>
                <p className="mt-1">{verification.user.role.replace(/_/g, " ")}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-500">Loại xác minh</Label>
                <p className="mt-1">
                  <span className="px-2 py-0.5 bg-lunavia-primary-light text-lunavia-primary rounded text-sm font-medium">
                    {verificationType}
                  </span>
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-500">Duration nộp</Label>
                <p className="mt-1">{formatDateTime(verification.createdAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Tài liệu đã nộp</CardTitle>
            </CardHeader>
            <CardContent>
              {documentGroups.length === 0 && (!finalDocuments.allDocuments || finalDocuments.allDocuments.length === 0) ? (
                <p className="text-slate-500">Chưa có tài liệu nào</p>
              ) : (
                <div className="space-y-6">
                  {documentGroups.map((group) => (
                    <div key={group.key} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <Label className="font-medium text-base">{group.label}</Label>
                          <p className="text-xs text-slate-500 mt-1">
                            {group.urls.length} file{group.urls.length > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {group.urls.map((url: string, index: number) => (
                          <div key={index} className="border rounded overflow-hidden bg-white">
                            <div className="aspect-video bg-slate-50 flex items-center justify-center relative group">
                              {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                <img
                                  src={url}
                                  alt={`${group.label} - File ${index + 1}`}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="text-center p-4">
                                  <FileText className="h-12 w-12 mx-auto text-slate-400 mb-2" />
                                  <p className="text-sm text-slate-500">File {index + 1}</p>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-white px-3 py-1.5 rounded text-sm font-medium text-teal-600 hover:bg-teal-50"
                                >
                                  Mở trong tab mới
                                </a>
                              </div>
                            </div>
                            <div className="p-2 bg-slate-50 border-t">
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-teal-600 hover:underline flex items-center gap-1 justify-center"
                              >
                                <FileText className="h-4 w-4" />
                                Xem file {index + 1}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {/* Show all documents if there are any ungrouped */}
                  {finalDocuments.allDocuments && finalDocuments.allDocuments.length > 0 && (
                    <div className="border-t pt-6 mt-6">
                      <Label className="font-medium text-base mb-3 block">
                        Tất cả files đã nộp ({documentsByType.allDocuments.length} files)
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {finalDocuments.allDocuments.map((url: string, index: number) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border rounded p-2 hover:bg-slate-50 transition-colors"
                          >
                            <div className="aspect-square bg-slate-100 rounded mb-2 flex items-center justify-center">
                              {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                <img
                                  src={url}
                                  alt={`File ${index + 1}`}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <FileText className="h-8 w-8 text-slate-400" />
                              )}
                            </div>
                            <p className="text-xs text-center text-slate-600 truncate">
                              File {index + 1}
                            </p>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Form */}
          {verification.status === "PENDING" && (
            <Card>
              <CardHeader>
                <CardTitle>Duyệt xác minh</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Hành động</Label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="action"
                          value="approve"
                          checked={action === "approve"}
                          onChange={(e) => setAction(e.target.value as any)}
                        />
                        <span>Duyệt</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="action"
                          value="reject"
                          checked={action === "reject"}
                          onChange={(e) => setAction(e.target.value as any)}
                        />
                        <span>Từ chối</span>
                      </label>
                    </div>
                  </div>

                  {action === "approve" ? (
                    <div>
                      <Label htmlFor="adminNotes">Notes (tùy chọn)</Label>
                      <Textarea
                        id="adminNotes"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Notes for the user..."
                        rows={3}
                      />
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="rejectionReason">Reason từ chối *</Label>
                      <Textarea
                        id="rejectionReason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Please specify the rejection reason..."
                        rows={4}
                        required
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={processing}
                    className="w-full"
                    variant={action === "approve" ? "default" : "destructive"}
                  >
                    {processing
                      ? "Processing..."
                      : action === "approve"
                      ? "Approve Verification"
                      : "Reject Verification"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Admin Notes / Rejection Reason */}
          {(() => {
            // Filter out FILE_COUNTS from adminNotes when displaying
            const displayNotes = verification.adminNotes 
              ? verification.adminNotes.replace(/FILE_COUNTS:[^\n]+/g, "").trim()
              : "";
            const hasDisplayNotes = displayNotes.length > 0 || verification.rejectionReason;
            
            return hasDisplayNotes ? (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {verification.rejectionReason ? "Rejection Reason" : "Notes"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {verification.rejectionReason || displayNotes}
                  </p>
                </CardContent>
              </Card>
            ) : null;
          })()}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusBadge status={verification.status} />
              {verification.status === "APPROVED" && (
                <div className="mt-4">
                  <VerifiedBadge
                    type={verificationType}
                    className="text-sm"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

