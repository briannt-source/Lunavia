import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import Link from "next/link";
import { Zap, Shield, Users, Award, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default async function Home() {
  // Try to get session, but don't fail if database is not available
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    // If database connection fails, just show public page
    // This allows the site to work even if database is not ready
    console.error("Failed to get session (database may not be ready):", error);
  }

  // If logged in, redirect to /home (authenticated home)
  if (session) {
    redirect("/home");
  }

  // Public landing page
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Logo size="md" variant="dark" showText={true} />
          <div className="flex gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost" className="text-slate-700 hover:text-blue-600">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Đăng ký
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-6">
            <Waves className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Kết nối thông minh
            <br />
            <span className="text-blue-600">Tour Operator & HDV</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Nền tảng AI-powered của <span className="font-semibold text-blue-600">Sea You Travel</span> giúp các công ty lữ hành tìm kiếm và quản lý hướng
            dẫn viên du lịch chuyên nghiệp
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signin">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                Bắt đầu ngay
              </Button>
            </Link>
            <Link href="/tours">
              <Button size="lg" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                Xem Tours
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900">AI Matching</h3>
            <p className="text-slate-600">
              Tự động kết nối tour operator với HDV phù hợp nhất với độ chính xác 92%
            </p>
          </div>
          <div className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900">KYC/KYB Verified</h3>
            <p className="text-slate-600">
              Xác minh danh tính và giấy phép đảm bảo an toàn, tuân thủ 100% pháp luật
            </p>
          </div>
          <div className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900">Quản lý tập trung</h3>
            <p className="text-slate-600">
              Dashboard và công cụ quản lý tour, ứng tuyển, thanh toán toàn diện
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-12 text-white shadow-xl">
          <Award className="h-12 w-12 mx-auto mb-4 text-white" />
          <h2 className="text-3xl font-bold mb-4">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            Tham gia cộng đồng tour operator và hướng dẫn viên chuyên nghiệp của Sea You Travel
          </p>
          <Link href="/auth/signin">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg">
              Đăng ký miễn phí
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-slate-200 mt-16">
        <div className="flex items-center justify-between">
          <Logo size="sm" variant="dark" showText={true} />
          <p className="text-sm text-slate-600">
            © 2025 Sea You Travel - Lunavia Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
