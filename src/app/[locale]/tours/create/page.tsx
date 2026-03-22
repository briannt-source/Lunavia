"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import toast from "react-hot-toast";
import { AlertCircle, MapPin, DollarSign, Calendar, Users, FileText, Save, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { DateTimePicker } from "@/components/date-time-picker";

const USD_TO_VND_RATE = 26000;

export default function CreateTourPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [canCreate, setCanCreate] = useState<{ canCreate: boolean; reason?: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
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
    guideNotes: "", // Notes/notices for tour guides
    publishAction: "draft", // "draft" or "publish"
  });

  // Fetch cities
  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: () => api.cities.list(),
  });

  // Fetch user settings for default tour preferences
  const { data: userSettings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.settings.get(),
  });

  // Initialize form with default settings
  useEffect(() => {
    if (userSettings && !formData.title) {
      setFormData((prev) => ({
        ...prev,
        visibility: (userSettings.defaultTourVisibility as "PUBLIC" | "PRIVATE") || "PUBLIC",
        currency: userSettings.defaultCurrency || "VND",
      }));
    }
  }, [userSettings]);

  // Check if user can create tour
  useEffect(() => {
    const checkCanCreate = async () => {
      if (!session?.user?.id) {
        setChecking(false);
        return;
      }

      try {
        const response = await fetch("/api/tours/check");
        if (response.ok) {
          const data = await response.json();
          setCanCreate(data);
        }
      } catch (error) {
        console.error("Error checking create permission:", error);
      } finally {
        setChecking(false);
      }
    };

    checkCanCreate();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent, action?: "draft" | "publish") => {
    e.preventDefault();
    
    // Frontend validation
    const validationErrors: string[] = [];
    
    if (!formData.title || formData.title.trim().length === 0) {
      validationErrors.push("Please enter tour title");
    }

    if (!formData.description || formData.description.trim().length === 0) {
      validationErrors.push("Please enter tour description");
    }

    if (!formData.city || formData.city.trim().length === 0) {
      validationErrors.push("Please select a city");
    }

    if (!formData.startDate) {
      validationErrors.push("Please enter tour start date");
    } else {
      const startDate = new Date(formData.startDate);
      if (isNaN(startDate.getTime())) {
        validationErrors.push("Start date is invalid. Please enter correct format");
      }
    }

    if (formData.endDate) {
      const endDate = new Date(formData.endDate);
      if (isNaN(endDate.getTime())) {
        validationErrors.push("End date is invalid. Please enter correct format");
      } else if (formData.startDate) {
        const startDate = new Date(formData.startDate);
        if (!isNaN(startDate.getTime()) && endDate < startDate) {
          validationErrors.push("End date must be after start date");
        }
      }
    }

    if (!formData.pax || parseInt(formData.pax) <= 0) {
      validationErrors.push("Please enter valid guest count (greater than 0)");
    }

    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => toast.error(error));
      return;
    }

    setLoading(true);
    
    // Use provided action or fallback to formData
    const submitAction = action || formData.publishAction;

    try {
      // Upload files first if any
      let fileUrls: string[] = [];
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
          fileUrls = uploadData.urls || [];
        } else {
          console.warn("File upload failed, continuing without files");
        }
      }

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

      const response = await fetch("/api/tours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
          files: fileUrls,
          itinerary: [],
          visibility: formData.visibility,
          status: submitAction === "publish" ? "OPEN" : "DRAFT",
          guideNotes: formData.guideNotes || undefined,
          // Use default settings if not specified
          mainGuideSlots: userSettings?.defaultMainGuideSlots || 1,
          subGuideSlots: userSettings?.defaultSubGuideSlots || 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Show detailed error messages
        const errorMessage = errorData.error || "Unable to create tour. Please check your input.";
        
        // If error contains multiple messages (separated by .), show each one
        if (errorMessage.includes(". ")) {
          const errors = errorMessage.split(". ");
          errors.forEach((err: string) => {
            if (err.trim()) {
              toast.error(err.trim());
            }
          });
        } else {
          toast.error(errorMessage);
        }
        return;
      }

      const tour = await response.json();
      if (submitAction === "publish") {
        toast.success("Tour published to marketplace!");
      } else {
        toast.success("Tour saved as draft!");
      }
      router.push(`/tours/${tour.id}`);
    } catch (error: any) {
      console.error("Error creating tour:", error);
      // Use error message utility for user-friendly messages
      const { getUserFriendlyError } = await import("@/lib/error-messages");
      const userFriendlyError = getUserFriendlyError(error);
      toast.error(userFriendlyError, {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">Checking tour creation permissions...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Create New Tour"
        description="Fill in details to create a new tour"
        action={
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        }
      />

      {canCreate && !canCreate.canCreate && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 mb-1">
                  Cannot Create Tour
                </p>
                <p className="text-sm text-red-700 mb-2">
                  {canCreate.reason}
                </p>
                <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                  <li>Account must be verified (APPROVED)</li>
                  <li>Must have a business registration license</li>
                  <li>Minimum deposit of 1,000,000 VND</li>
                </ul>
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
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="pricing">Price & Date</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title tour *</Label>
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
                    <Label htmlFor="pax">Number of guests *</Label>
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
                      <SelectItem value="PRIVATE">Private (In-house only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* Pricing & Dates Tab */}
              <TabsContent value="pricing" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label>Currency *</Label>
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
                      <SelectItem value="VND">VND (Vietnamese Dong)</SelectItem>
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
                  <DateTimePicker
                    label="Start date"
                    value={formData.startDate}
                    onChange={(value) =>
                      setFormData({ ...formData, startDate: value })
                    }
                    required
                    placeholder="Select tour start date and time"
                  />

                  <DateTimePicker
                    label="End date"
                    value={formData.endDate}
                    onChange={(value) =>
                      setFormData({ ...formData, endDate: value })
                    }
                    min={formData.startDate || undefined}
                    placeholder="Select tour end date and time (optional)"
                  />
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
                      (Only visible to Tour Guides)
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
                    This section is only visible to Tour Guides when they view tour details. You can add special notices, specific requirements, or important information.
                  </p>
                </div>
              </TabsContent>

              {/* Files Tab */}
              <TabsContent value="files" className="space-y-4 mt-6">
                <FileUpload
                  onFilesChange={setUploadedFiles}
                  maxFiles={5}
                  maxSizeMB={10}
                  label="Upload files cho tour (PDF, images, documents)"
                />
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="pt-4 border-t">
              <div className="flex gap-4">
                <Button
                  type="button"
                  data-action="publish"
                  onClick={async (e) => {
                    e.preventDefault();
                    await handleSubmit(e, "publish");
                  }}
                  disabled={loading || (canCreate ? !canCreate.canCreate : false)}
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 flex-1"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {loading ? "Processing..." : "Publish"}
                </Button>
                <Button
                  type="button"
                  data-action="draft"
                  onClick={async (e) => {
                    e.preventDefault();
                    await handleSubmit(e, "draft");
                  }}
                  disabled={loading || (canCreate ? !canCreate.canCreate : false)}
                  variant="outline"
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Processing..." : "Save Draft"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
