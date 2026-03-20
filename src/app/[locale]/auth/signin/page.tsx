"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import toast from "react-hot-toast";
import { Logo } from "@/components/logo";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Email hoặc mật khẩu không đúng");
        setLoading(false);
      } else {
        toast.success("Đăng nhập thành công");
        // Wait for session to be created, then redirect
        // Poll for session to be available
        const checkSession = async () => {
          let attempts = 0;
          const maxAttempts = 10;
          const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR", "OPS_CS", "FINANCE", "FINANCE_LEAD", "SUPPORT_STAFF"];
          
          while (attempts < maxAttempts) {
            const session = await getSession();
            if (session?.user) {
              // Session is ready, redirect based on role
              const role = (session.user as any)?.role;
              if (role === "TOUR_OPERATOR" || role === "TOUR_AGENCY") {
                window.location.href = "/dashboard/operator";
              } else if (role === "TOUR_GUIDE") {
                window.location.href = "/dashboard/guide";
              } else if (role?.startsWith("ADMIN_") || ADMIN_ROLES.includes(role)) {
                window.location.href = "/dashboard/admin";
              } else {
                // Fallback: middleware will handle role-based redirect
                window.location.href = "/dashboard";
              }
              return;
            }
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          // Fallback: let middleware handle the redirect based on JWT
          window.location.href = "/dashboard";
        };
        
        checkSession();
      }
    } catch (error) {
      toast.error("Đã có lỗi xảy ra");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Logo size="lg" variant="dark" showText={true} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Đăng nhập</CardTitle>
            <CardDescription>
              Đăng nhập vào nền tảng Lunavia của Sea You Travel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Chưa có tài khoản? </span>
              <Link href="/auth/register" className="text-primary hover:underline">
                Đăng ký
              </Link>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Hoặc
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full mt-4"
                onClick={() => signIn("google")}
              >
                Đăng nhập với Google
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

