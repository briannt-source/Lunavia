import Image from "next/image";
import Link from "next/link";
import {
  TravelExplore,
  LayoutDashboard,
  Search,
  Calendar,
  History,
  Wallet,
  Bell,
  Menu,
  Verified,
  Settings,
  CheckCircle2,
  Hourglass,
  List,
  Eye,
  FlightTakeoff,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserLoginPage10() {
  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased h-screen overflow-hidden flex">
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 h-full transition-all">
        <div className="p-6 flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
            <TravelExplore className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight">Guide Portal</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              VN Tourism 2025
            </p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4">
          <Link
            className="flex items-center space-x-3 px-4 py-3 bg-primary/10 text-primary rounded-xl transition-colors font-medium"
            href="#"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Tổng quan</span>
          </Link>
          <Link
            className="flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors font-medium"
            href="#"
          >
            <Search className="h-5 w-5" />
            <span>Tìm việc tour</span>
          </Link>
          <Link
            className="flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors font-medium"
            href="#"
          >
            <Calendar className="h-5 w-5" />
            <span>Lịch trình</span>
          </Link>
          <Link
            className="flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors font-medium"
            href="#"
          >
            <History className="h-5 w-5" />
            <span>Lịch sử ứng tuyển</span>
          </Link>
          <Link
            className="flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors font-medium"
            href="#"
          >
            <Wallet className="h-5 w-5" />
            <span>Ví của tôi</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                ND
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">Nguyen Duc</p>
                <p className="text-xs text-slate-500 truncate">Hạng thẻ: Quốc tế</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                <Verified className="h-3.5 w-3.5" />
                <span>Đã xác thực</span>
              </div>
              <Button variant="ghost" size="icon" className="hover:text-primary transition-colors">
                <Settings className="h-4.5 w-4.5" />
              </Button>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-6 lg:px-8 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
          <div className="flex items-center lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <div className="hidden lg:block">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Dashboard</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 h-5 w-5" />
              <Input
                className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary w-64 text-slate-900 dark:text-white placeholder:text-slate-500"
                placeholder="Tìm kiếm tour, công ty..."
                type="text"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Button className="lg:hidden h-8 w-8 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              ND
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-background-dark p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div
              className="relative rounded-2xl overflow-hidden shadow-md"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDyRM1Yd14tHq64zriXcwD6hSKH6-rKoCFUODJsvah7KdN-NCG1lj2t6ernNRmEHwQo3rcyFjtMOUjoOB-0qCpLPsal9MTJHM5MCLamuA6e8px1ToPWb-VF6lSKXTMrdIO8CzWkD9B_ZUHeYusrmTu2PwmgyiwHnqoVYJ2_b18lQhmGG4H3dSh1s7rXER24zM4cCoJQJReU3ID8Wu51UVRCCvrjMFZdmAbnqFsehgNfl2acUX7Oqh7rwtkTgjKeMRFV7K2isM_YcA')",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-background-dark/90 via-background-dark/70 to-transparent"></div>
              <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-primary/20 text-primary-300 border border-primary/30 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Tour Guide
                    </span>
                    <span className="text-slate-300 text-sm flex items-center gap-1">
                      <Verified className="h-4 w-4" /> Verified ID: VN-2025-8832
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Xin chào, Nguyễn Đức!</h2>
                  <p className="text-slate-300 max-w-xl">
                    Hồ sơ của bạn đã sẵn sàng. Hãy bắt đầu tìm kiếm những chuyến đi thú vị đầu tiên
                    trên nền tảng của chúng tôi.
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button className="px-5 py-2.5 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition shadow-lg text-sm">
                    Cập nhật hồ sơ
                  </Button>
                  <Button className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition shadow-lg text-sm">
                    Tìm tour ngay
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card className="bg-white dark:bg-surface-dark p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-primary/50 transition-all">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Tổng ứng tuyển
                  </p>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">0</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center">Chưa có hoạt động</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <History className="h-6 w-6" />
                </div>
              </Card>
              <Card className="bg-white dark:bg-surface-dark p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-success/50 transition-all">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Đã chấp nhận
                  </p>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">0</h3>
                  <p className="text-xs text-slate-500 mt-1">Tour sắp tới: 0</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </Card>
              <Card className="bg-white dark:bg-surface-dark p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-orange-400/50 transition-all">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Đang chờ
                  </p>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">0</h3>
                  <p className="text-xs text-slate-500 mt-1">Đã xử lý: 0</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <Hourglass className="h-6 w-6" />
                </div>
              </Card>
              <Card className="bg-white dark:bg-surface-dark p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-purple-500/50 transition-all">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Số dư ví
                  </p>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">0 ₫</h3>
                  <p className="text-xs text-slate-500 mt-1">Số dư khả dụng</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Wallet className="h-6 w-6" />
                </div>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[400px] flex flex-col">
                  <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <List className="h-5 w-5 text-primary" />
                      Ứng tuyển gần đây
                    </h3>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-5">
                      <TravelExplore className="h-10 w-10 text-slate-300 dark:text-slate-500" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                      Bạn chưa có ứng tuyển/tour nào
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                      Hãy tìm tour tiếp theo của bạn! Khám phá danh sách các tour đang mở tuyển và
                      bắt đầu hành trình ngay hôm nay.
                    </p>
                    <Button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-primary/30 transition-all flex items-center gap-2 group">
                      <Search className="h-5 w-5 group-hover:animate-pulse" />
                      Tìm Tour Mới
                    </Button>
                  </div>
                </Card>
              </div>
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-primary to-blue-600 rounded-xl p-5 text-white shadow-lg relative overflow-hidden h-48 flex flex-col justify-between">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <FlightTakeoff className="h-[100px] w-[100px]" />
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-blue-100 text-sm font-medium mb-1">Chuyến đi sắp tới</h4>
                    <h3 className="text-xl font-bold">Chưa có lịch trình</h3>
                    <p className="text-sm text-blue-100 mt-2 opacity-90">
                      Bạn chưa nhận tour nào trong thời gian tới.
                    </p>
                  </div>
                  <div className="relative z-10">
                    <Button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white py-2 rounded-lg text-sm font-semibold transition">
                      Khám phá tour
                    </Button>
                  </div>
                </Card>
                <Card className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4">Hoạt động ví</h3>
                  <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                    <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-800/50 text-slate-400 flex items-center justify-center">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Chưa có giao dịch nào phát sinh
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

