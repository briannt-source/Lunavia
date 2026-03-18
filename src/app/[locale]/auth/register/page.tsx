"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Compass } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "TOUR_GUIDE",
    name: "",
    licenseNumber: "",
    companyName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu không khớp");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          name: formData.name,
          licenseNumber: formData.licenseNumber || undefined,
          companyName: formData.companyName || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      router.push("/auth/signin");
    } catch (error: any) {
      toast.error(error.message || "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const isOperator = formData.role === "TOUR_OPERATOR" || formData.role === "TOUR_AGENCY";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="relative">
            <Moon className="h-10 w-10 text-indigo-600" />
            <Compass className="h-6 w-6 text-emerald-500 absolute -bottom-1 -right-1" />
          </div>
          <span className="text-3xl font-bold text-indigo-900">LUNAVIA</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Đăng ký</CardTitle>
            <CardDescription>
              Tạo tài khoản mới trên LUNAVIA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Loại tài khoản *</Label>
                <select
                  id="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  required
                >
                  <option value="TOUR_GUIDE">Tour Guide (HDV)</option>
                  <option value="TOUR_OPERATOR">Tour Operator</option>
                  <option value="TOUR_AGENCY">Tour Agency</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Tên *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              {isOperator && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">Số license đăng ký kinh doanh *</Label>
                    <Input
                      id="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, licenseNumber: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Tên công ty</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({ ...formData, companyName: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Đã có tài khoản? </span>
              <Link href="/auth/signin" className="text-primary hover:underline">
                Đăng nhập
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

