"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/file-upload";
import { api } from "@/lib/api-client";
import toast from "react-hot-toast";
import { Building2, Save, Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import { Link } from '@/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function CreateCompanyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const isAgency = userRole === "TOUR_AGENCY";
  const [loading, setLoading] = useState(false);
  const [uploadedLogo, setUploadedLogo] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    website: "",
    address: "",
    businessLicenseNumber: "",
    travelLicenseNumber: "",
  });

  // Check if user already has a company
  const { data: userInfo } = useQuery({
    queryKey: ["userInfo"],
    queryFn: () => api.user.getInfo(),
  });

  const createCompanyMutation = useMutation({
    mutationFn: (data: any) => api.companies.create(data),
    onSuccess: async () => {
      // Invalidate and refetch userInfo to get updated company data
      await queryClient.invalidateQueries({ queryKey: ["userInfo"] });
      await queryClient.refetchQueries({ queryKey: ["userInfo"] });
      queryClient.invalidateQueries({ queryKey: ["company"] });
      toast.success("Tạo công ty thành công!");
      // Small delay to ensure data is refreshed
      setTimeout(() => {
        router.push("/dashboard/operator/company");
      }, 100);
    },
    onError: (error: any) => {
      toast.error(error.message || "Có lỗi xảy ra khi tạo công ty");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload logo if provided
      let logoUrl = "";
      if (uploadedLogo) {
        const formDataFiles = new FormData();
        formDataFiles.append("files", uploadedLogo);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formDataFiles,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          logoUrl = uploadData.urls?.[0] || "";
        }
      }

      await createCompanyMutation.mutateAsync({
        ...formData,
        logo: logoUrl || undefined,
      });
    } catch (error: any) {
      console.error("Error creating company:", error);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if already has company
  if (userInfo?.company?.id) {
    router.push("/dashboard/operator/company");
    return null;
  }

  return (
    <>
      <PageHeader
        title="Tạo Công ty"
        description="Tạo công ty để quản lý in-house guides"
      />

      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard/operator/company">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </Link>

        {/* Warning for TOUR_AGENCY */}
        {isAgency && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-900">Lưu ý quan trọng</AlertTitle>
            <AlertDescription className="text-amber-800 mt-2">
              <p className="font-semibold mb-2">
                Theo quy định Luật Du lịch Việt Nam:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  Chỉ các doanh nghiệp có <strong>Giấy phép kinh doanh lữ hành quốc tế</strong> mới được phép tổ chức tour.
                </li>
                <li>
                  Tour Agency hiện tại chỉ có thể quản lý tour guide freelance, không được phép tổ chức tour trực tiếp.
                </li>
                <li>
                  Để tổ chức tour, bạn cần đăng ký và chuyển đổi thành <strong>Tour Operator</strong> với đầy đủ giấy phép theo quy định.
                </li>
              </ul>
              <p className="mt-3 text-sm italic">
                <strong>Lưu ý:</strong> Chúng tôi vẫn cho phép Tour Agency tạo công ty để quản lý guide, nhưng bạn cần tuân thủ quy định pháp luật khi tổ chức tour.
              </p>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Thông tin Công ty
            </CardTitle>
            <CardDescription>
              Điền thông tin công ty của bạn. Bạn chỉ có thể tạo một công ty.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">
                  Tên công ty <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ví dụ: Sea You Travel JSC"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tên công ty sẽ được dùng để tạo Company ID tự động
                </p>
              </div>

              <div>
                <Label htmlFor="logo">Logo công ty</Label>
                <FileUpload
                  accept="image/*"
                  maxFiles={1}
                  onFilesChange={(files) => setUploadedLogo(files[0] || null)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload logo công ty (tùy chọn)
                </p>
              </div>

              <div>
                <Label htmlFor="email">Email công ty</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="company@example.com"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email công ty phải là duy nhất. Hệ thống sẽ kiểm tra để tránh trùng lặp.
                </p>
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="address">Địa chỉ</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="123 Đường ABC, Quận XYZ, TP.HCM"
                />
              </div>

              <div>
                <Label htmlFor="businessLicenseNumber">
                  Số đăng ký kinh doanh <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="businessLicenseNumber"
                  required
                  value={formData.businessLicenseNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      businessLicenseNumber: e.target.value,
                    })
                  }
                  placeholder="0123456789"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Số đăng ký kinh doanh phải là duy nhất. Hệ thống sẽ kiểm tra để tránh trùng lặp và giả mạo.
                </p>
              </div>

              <div>
                <Label htmlFor="travelLicenseNumber">
                  Số giấy phép lữ hành
                </Label>
                <Input
                  id="travelLicenseNumber"
                  value={formData.travelLicenseNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      travelLicenseNumber: e.target.value,
                    })
                  }
                  placeholder="GP-123456"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Số giấy phép lữ hành (nếu có). Hệ thống sẽ kiểm tra để tránh trùng lặp.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading || createCompanyMutation.isPending}
                  className="flex-1"
                >
                  {loading || createCompanyMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Tạo Công ty
                    </>
                  )}
                </Button>
                <Link href="/dashboard/operator/company">
                  <Button type="button" variant="outline">
                    Hủy
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

