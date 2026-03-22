"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { AlertCircle, Upload, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export default function KYBSubmissionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<{
    photoUrl: string[];
    idDocumentUrl: string[];
    licenseUrl: string[];
    travelLicenseUrl: string[];
    proofOfAddressUrl: string[];
  }>({
    photoUrl: [],
    idDocumentUrl: [],
    licenseUrl: [],
    travelLicenseUrl: [],
    proofOfAddressUrl: [],
  });
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  // State to control whether to show form after rejection - must be declared before any early returns
  const [showResubmitForm, setShowResubmitForm] = useState(false);

  // Fetch current verification status
  const { data: userInfo } = useQuery({
    queryKey: ["user", "info"],
    queryFn: () => api.user.info(),
    enabled: !!session,
  });

  const verificationStatus = userInfo?.verifiedStatus || "NOT_SUBMITTED";

  const handleFileUpload = async (files: File[], type: keyof typeof documents) => {
    if (files.length === 0) return;
    
    // Check total files for this type
    const currentFiles = documents[type];
    if (currentFiles.length + files.length > 5) {
      toast.error(`Each field supports up to 5 file uploads. Currently has ${currentFiles.length} file(s).`);
      return;
    }
    
    setUploading({ ...uploading, [type]: true });
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "verification");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed for ${file.name}`);
        }

        const data = await response.json();
        // Handle both single file (data.url) and multiple files (data.urls) responses
        const url = data.url || (data.urls && data.urls.length > 0 ? data.urls[0] : null);
        if (!url || typeof url !== 'string') {
          throw new Error(`Invalid response from upload API for ${file.name}`);
        }
        return url;
      });

      const urls = await Promise.all(uploadPromises);
      // Filter out any null/undefined URLs
      const validUrls = urls.filter((url): url is string => url != null && typeof url === 'string');
      
      if (validUrls.length === 0) {
        throw new Error("No files were uploaded successfully");
      }
      
      setDocuments((prev) => ({
        ...prev,
        [type]: [...prev[type], ...validUrls],
      }));
      toast.success(`Uploaded ${validUrls.length} file(s) successfully!`);
    } catch (error: any) {
      toast.error(error.message || "Error uploading file");
    } finally {
      setUploading({ ...uploading, [type]: false });
    }
  };

  const removeFile = (type: keyof typeof documents, index: number) => {
    setDocuments((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const missingFields: string[] = [];
    if (documents.photoUrl.length === 0) missingFields.push("Real Photo");
    if (documents.idDocumentUrl.length === 0) missingFields.push("National ID / Passport");
    if (documents.licenseUrl.length === 0) missingFields.push("Business License");
    if (!isTourAgency && documents.travelLicenseUrl.length === 0) {
      missingFields.push("Int'l/Domestic Travel License");
    }
    if (documents.proofOfAddressUrl.length === 0) missingFields.push("Proof of Address");

    if (missingFields.length > 0) {
      toast.error(`Please upload at least 1 file for: ${missingFields.join(", ")}`);
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch("/api/verifications/kyb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoUrl: documents.photoUrl,
          idDocumentUrl: documents.idDocumentUrl,
          licenseUrl: documents.licenseUrl,
          travelLicenseUrl: documents.travelLicenseUrl,
          proofOfAddressUrl: documents.proofOfAddressUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error submitting KYB");
      }

      toast.success("KYB submitted successfully! Please wait for admin review.");
      // Reset form state
      setDocuments({
        photoUrl: [],
        idDocumentUrl: [],
        licenseUrl: [],
        travelLicenseUrl: [],
        proofOfAddressUrl: [],
      });
      setShowResubmitForm(false);
      // Invalidate queries to refetch user info and show updated status
      queryClient.invalidateQueries({ queryKey: ["user", "info"] });
      // Refresh to show updated status
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Error submitting KYB");
    } finally {
      setLoading(false);
    }
  };

  const userRole = (userInfo?.user as any)?.role;
  const isTourAgency = userRole === "TOUR_AGENCY";

  const requirements = [
    {
      label: "Real Photo",
      key: "photoUrl" as const,
      description: "A clear portrait photo of the representative",
      required: true,
    },
    {
      label: "National ID / Passport",
      key: "idDocumentUrl" as const,
      description: "Personal legal documents of the representative",
      required: true,
    },
    {
      label: "Business License",
      key: "licenseUrl" as const,
      description: "Business registration license",
      required: true,
    },
    // Tour agency doesn't need travel license
    ...(isTourAgency
      ? []
      : [
          {
            label: "Int'l/Domestic Travel License",
            key: "travelLicenseUrl" as const,
            description: "International or domestic travel license",
            required: true,
          },
        ]),
    {
      label: "Proof of Address",
      key: "proofOfAddressUrl" as const,
      description: "Documents proving company address (utility bills, lease agreements, etc.)",
      required: true,
    },
  ];

  if (verificationStatus === "APPROVED") {
    return (
      <>
        <PageHeader
          title="KYB Approved"
          description="Your account has been verified successfully"
        />
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
              <p className="text-lg font-semibold">
                Your KYB has been approved. You can now create tours.
              </p>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  if (verificationStatus === "PENDING") {
    return (
      <>
        <PageHeader
          title="KYB Pending Review"
          description="Please wait for admin to review and approve your KYB"
        />
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertCircle className="h-6 w-6" />
              <p className="text-lg font-semibold">
                Your KYB is pending approval. Please wait patiently.
              </p>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  if (verificationStatus === "REJECTED" && !showResubmitForm) {
    return (
      <>
        <PageHeader
          title="KYB Rejected"
          description="Please review and resubmit your KYB"
        />
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 text-red-600 mb-4">
              <AlertCircle className="h-6 w-6 mt-0.5" />
              <div>
                <p className="text-lg font-semibold mb-2">
                  Your KYB has been rejected
                </p>
                <p className="text-sm text-slate-600">
                  Please review your documents and resubmit.
                </p>
              </div>
            </div>
            <Button onClick={() => setShowResubmitForm(true)}>
              Resubmit KYB
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Submit KYB"
        description="Complete business verification to create tours"
      />

      {verificationStatus === "REJECTED" && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 mb-1">
                  Your KYB has been rejected
                </p>
                <p className="text-sm text-red-700">
                  Please review your documents and resubmit. Ensure all documents are clear and complete.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {verificationStatus === "NOT_SUBMITTED" && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 mb-1">
                  Complete KYB to create tours
                </p>
                <p className="text-sm text-amber-700">
                  You need to submit all required documents to create tours.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Information KYB</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {requirements.map((req) => (
              <div key={req.key} className="space-y-2">
                <label className="text-sm font-medium text-slate-900">
                  {req.label} {req.required && <span className="text-red-500">*</span>}
                </label>
                {req.description && (
                  <p className="text-xs text-slate-500">{req.description}</p>
                )}
                <p className="text-xs text-slate-400">
                  You can upload up to 5 files per field. No specific file format required.
                </p>
                
                {documents[req.key].length > 0 && (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm font-medium text-slate-700">
                      Uploaded {documents[req.key].length}/5 files:
                    </p>
                    {documents[req.key].map((url, index) => (
                      <div
                        key={index}
                        className="p-2 border rounded bg-slate-50 flex items-center justify-between"
                      >
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex-1"
                        >
                          File {index + 1}
                        </a>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(req.key, index)}
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {documents[req.key].length < 5 && (
                  <FileUpload
                    onFilesChange={(files) => handleFileUpload(files, req.key)}
                    maxFiles={5 - documents[req.key].length}
                    maxSizeMB={10}
                    accept="*/*"
                    label={documents[req.key].length === 0 
                      ? `Upload ${req.label.toLowerCase()} (up to 5 files)` 
                      : `Upload more files (${documents[req.key].length}/5)`}
                  />
                )}
                {documents[req.key].length >= 5 && (
                  <p className="text-xs text-amber-600">
                    File limit of 5 reached for this field
                  </p>
                )}
              </div>
            ))}

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading || Object.values(uploading).some(v => v)}
                className="bg-gradient-to-r from-teal-500 to-emerald-500"
              >
                {loading ? "Processing..." : "Submit KYB"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading || Object.values(uploading).some(v => v)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

