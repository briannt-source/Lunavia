"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/file-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import toast from "react-hot-toast";
import { AlertCircle, Save, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

const USD_TO_VND_RATE = 26000;

export default function EditTourPage() {
  const router = useRouter();
  const params = useParams();
  const tourId = params.id as string;
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<string[]>([]);
  const [tourStatus, setTourStatus] = useState<string>("");
  const [hasApplications, setHasApplications] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    city: "",
    currency: "VND",
    priceMain: "",
    priceSub: "",
    pax: "",
    startDate: "",
    endDate: "",
    durationHours: "",
    languages: "",
    specialties: "",
    visibility: "PUBLIC",
    guideNotes: "", // Notes/notices dành cho tour guide
    publishAction: "draft",
  });

  // Fetch cities
  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: () => api.cities.list(),
  });

  // Fetch tour data
  useEffect(() => {
    const fetchTour = async () => {
      try {
        const tour = await api.tours.get(tourId);
        
        if (!tour) {
          toast.error("Tour does not exist");
          router.push("/dashboard/operator");
          return;
        }

        // Check if user owns this tour
        if (tour.operatorId !== session?.user?.id) {
          toast.error("You do not have permission to edit this tour");
          router.push(`/tours/${tourId}`);
          return;
        }

        // Check if tour can be edited (DRAFT, OPEN, CLOSED are allowed)
        const editableStatuses = ["DRAFT", "OPEN", "CLOSED"];
        if (!editableStatuses.includes(tour.status)) {
          toast.error(`Không thể chỉnh sửa tour ở trạng thái ${tour.status}. Chỉ có thể chỉnh sửa tour ở trạng thái DRAFT, OPEN, hoặc CLOSED.`);
          router.push(`/tours/${tourId}`);
          return;
        }

        // Convert prices from VND to original currency
        let priceMainDisplay = "";
        let priceSubDisplay = "";
        if (tour.priceMain) {
          priceMainDisplay = tour.currency === "USD" 
            ? (tour.priceMain / USD_TO_VND_RATE).toString()
            : tour.priceMain.toString();
        }
        if (tour.priceSub) {
          priceSubDisplay = tour.currency === "USD"
            ? (tour.priceSub / USD_TO_VND_RATE).toString()
            : tour.priceSub.toString();
        }

        setFormData({
          title: tour.title,
          description: tour.description,
          city: tour.city,
          currency: tour.currency,
          priceMain: priceMainDisplay,
          priceSub: priceSubDisplay,
          pax: tour.pax.toString(),
          startDate: new Date(tour.startDate).toISOString().slice(0, 16),
          endDate: tour.endDate ? new Date(tour.endDate).toISOString().slice(0, 16) : "",
          durationHours: tour.durationHours?.toString() || "",
          languages: tour.languages.join(", "),
          specialties: tour.specialties.join(", "),
          visibility: tour.visibility,
          guideNotes: tour.guideNotes || "",
          publishAction: tour.status === "OPEN" ? "publish" : "draft",
        });

        setTourStatus(tour.status);
        setHasApplications((tour as any)._count?.applications > 0 || (tour as any).applications?.length > 0);
        setExistingFiles(tour.files || []);
      } catch (error: any) {
        console.error("Error fetching tour:", error);
        toast.error("Unable to load tour information");
        router.push("/dashboard/operator");
      } finally {
        setFetching(false);
      }
    };

    if (session && tourId) {
      fetchTour();
    }
  }, [session, tourId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload new files first if any
      let newFileUrls: string[] = [];
      if (uploadedFiles.length > 0) {
        const formDataFiles = new FormData();
        uploadedFiles.forEach((file) => {
          formDataFiles.append("files", file);
        });

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formDataFiles,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          newFileUrls = uploadData.urls || [];
        }
      }

      // Combine existing and new files
      const allFiles = [...existingFiles, ...newFileUrls];

      // Convert prices to VND if needed
      let priceMainVND: number | null = null;
      let priceSubVND: number | null = null;

      if (formData.priceMain) {
        const price = parseFloat(formData.priceMain);
        priceMainVND = formData.currency === "USD" ? price * USD_TO_VND_RATE : price;
      }

      if (formData.priceSub) {
        const price = parseFloat(formData.priceSub);
        priceSubVND = formData.currency === "USD" ? price * USD_TO_VND_RATE : price;
      }

      // Update tour - preserve status if tour is already published (OPEN/CLOSED)
      // Only change status if explicitly changing from DRAFT
      let newStatus = tourStatus;
      if (tourStatus === "DRAFT") {
        newStatus = formData.publishAction === "publish" ? "OPEN" : "DRAFT";
      }

      await api.tours.update(tourId, {
        title: formData.title,
        description: formData.description,
        city: formData.city,
        currency: formData.currency,
        priceMain: priceMainVND,
        priceSub: priceSubVND,
        pax: parseInt(formData.pax),
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        durationHours: formData.durationHours ? parseInt(formData.durationHours) : null,
        languages: formData.languages.split(",").map((s) => s.trim()).filter(Boolean),
        specialties: formData.specialties.split(",").map((s) => s.trim()).filter(Boolean),
        files: allFiles,
        visibility: formData.visibility,
        guideNotes: formData.guideNotes || undefined,
        status: newStatus,
      });

      if (formData.publishAction === "publish") {
        toast.success("Tour updated and published to marketplace!");
      } else {
        toast.success("Tour updated successfully!");
      }
      router.push(`/tours/${tourId}`);
    } catch (error: any) {
      console.error("Error updating tour:", error);
      const errorMessage = error.message || "An error occurred while updating tour";
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">Đang tải information tour...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Edit Tour"
        description="Update your tour information"
        action={
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Hủy
          </Button>
        }
      />

      {hasApplications && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-amber-900 mb-1">
                  Lưu ý: Tour này đã có ứng tuyển
                </p>
                <p className="text-sm text-amber-700">
                  Khi chỉnh sửa tour đã có ứng tuyển, bạn không thể giảm số lượng slot xuống dưới số lượng guides đã được chấp nhận. 
                  Nếu thay đổi ngày hoặc giờ, vui lòng thông báo cho các guides đã được chấp nhận.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Information cơ bản</TabsTrigger>
                <TabsTrigger value="pricing">Price & Ngày</TabsTrigger>
                <TabsTrigger value="details">Chi tiết</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề tour *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g. Hanoi Discovery Tour"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe your tour in detail..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) =>
                        setFormData({ ...formData, city: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city: any) => (
                          <SelectItem key={city.id} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pax">Số guests *</Label>
                    <Input
                      id="pax"
                      type="number"
                      min="1"
                      value={formData.pax}
                      onChange={(e) =>
                        setFormData({ ...formData, pax: e.target.value })
                      }
                      placeholder="e.g. 15"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select
                    value={formData.visibility}
                    onValueChange={(value) =>
                      setFormData({ ...formData, visibility: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC">Public (Public)</SelectItem>
                      <SelectItem value="PRIVATE">Private (Private - chỉ in-house)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* Pricing & Dates Tab */}
              <TabsContent value="pricing" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label>Đơn vị tiền tệ *</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, currency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VND">VND (Việt Nam Đồng)</SelectItem>
                      <SelectItem value="USD">USD (1 USD = 26,000 VND)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priceMain">
                      Price Main Guide ({formData.currency})
                    </Label>
                    <Input
                      id="priceMain"
                      type="number"
                      step="0.01"
                      value={formData.priceMain}
                      onChange={(e) =>
                        setFormData({ ...formData, priceMain: e.target.value })
                      }
                      placeholder="Optional"
                    />
                    {formData.priceMain && formData.currency === "USD" && (
                      <p className="text-xs text-slate-500">
                        ≈ {(parseFloat(formData.priceMain) * USD_TO_VND_RATE).toLocaleString("vi-VN")} VND
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priceSub">
                      Price Sub Guide ({formData.currency})
                    </Label>
                    <Input
                      id="priceSub"
                      type="number"
                      step="0.01"
                      value={formData.priceSub}
                      onChange={(e) =>
                        setFormData({ ...formData, priceSub: e.target.value })
                      }
                      placeholder="Optional"
                    />
                    {formData.priceSub && formData.currency === "USD" && (
                      <p className="text-xs text-slate-500">
                        ≈ {(parseFloat(formData.priceSub) * USD_TO_VND_RATE).toLocaleString("vi-VN")} VND
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start date *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End date</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="durationHours">Duration (hours)</Label>
                  <Input
                    id="durationHours"
                    type="number"
                    min="1"
                    value={formData.durationHours}
                    onChange={(e) =>
                      setFormData({ ...formData, durationHours: e.target.value })
                    }
                    placeholder="e.g. 8 (optional)"
                  />
                </div>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="languages">Languages *</Label>
                  <Input
                    id="languages"
                    placeholder="Vietnamese, English, Chinese (comma-separated)"
                    value={formData.languages}
                    onChange={(e) =>
                      setFormData({ ...formData, languages: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialties">Specialties</Label>
                  <Input
                    id="specialties"
                    placeholder="Culture, History, Cuisine (comma-separated)"
                    value={formData.specialties}
                    onChange={(e) =>
                      setFormData({ ...formData, specialties: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guideNotes">
                    Notes cho Tour Guide
                    <span className="text-slate-400 text-sm font-normal ml-2">
                      (Chỉ Tour Guide mới thấy phần này)
                    </span>
                  </Label>
                  <textarea
                    id="guideNotes"
                    rows={6}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-y"
                    placeholder="Enter notes, reminders, or important information for Tour Guides..."
                    value={formData.guideNotes}
                    onChange={(e) =>
                      setFormData({ ...formData, guideNotes: e.target.value })
                    }
                  />
                  <p className="text-xs text-slate-500">
                    Phần này chỉ hiển thị cho Tour Guide khi họ xem chi tiết tour. Bạn có thể thêm các lưu ý đặc biệt, yêu cầu cụ thể, hoặc information quan trọng.
                  </p>
                </div>
              </TabsContent>

              {/* Files Tab */}
              <TabsContent value="files" className="space-y-4 mt-6">
                {existingFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Files hiện tại</Label>
                    <div className="space-y-2">
                      {existingFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <a
                            href={file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            File {index + 1}
                          </a>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setExistingFiles(existingFiles.filter((_, i) => i !== index));
                            }}
                          >
                            Xóa
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <FileUpload
                  onFilesChange={setUploadedFiles}
                  maxFiles={5}
                  maxSizeMB={10}
                  label="Upload new files for tour (PDF, images, documents)"
                />
              </TabsContent>
            </Tabs>

            {/* Publish Action Selection */}
            <div className="pt-4 border-t space-y-4">
              <div className="space-y-3">
                <Label>Hành động</Label>
                <RadioGroup
                  value={formData.publishAction}
                  onValueChange={(value) =>
                    setFormData({ ...formData, publishAction: value })
                  }
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-slate-50 cursor-pointer">
                    <RadioGroupItem value="draft" id="draft" />
                    <label
                      htmlFor="draft"
                      className="flex-1 cursor-pointer flex items-center gap-2"
                    >
                      <Save className="h-4 w-4 text-slate-600" />
                      <div>
                        <p className="font-medium text-slate-900">Lưu làm bản nháp</p>
                        <p className="text-sm text-slate-500">
                          Tour sẽ được lưu ở trạng thái nháp, bạn có thể chỉnh sửa và publish sau
                        </p>
                      </div>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-slate-50 cursor-pointer">
                    <RadioGroupItem value="publish" id="publish" />
                    <label
                      htmlFor="publish"
                      className="flex-1 cursor-pointer flex items-center gap-2"
                    >
                      <Globe className="h-4 w-4 text-teal-600" />
                      <div>
                        <p className="font-medium text-slate-900">Publish lên marketplace</p>
                        <p className="text-sm text-slate-500">
                          Tour sẽ được publish ngay và hiển thị trên marketplace cho guides apply
                        </p>
                      </div>
                    </label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-teal-500 to-emerald-500"
                >
                  {loading
                    ? "Processing..."
                    : formData.publishAction === "publish"
                    ? "Update & Publish Tour"
                    : "Update Tour"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Hủy
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}




