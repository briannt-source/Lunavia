import Image from "next/image";
import Link from "next/link";
import {
  Globe,
  LayoutDashboard,
  Search,
  Calendar,
  History,
  Wallet,
  Bell,
  Menu,
  Verified,
  Settings,
  TrendingUp,
  CheckCircle2,
  Hourglass,
  List,
  Eye,
  MapPin,
  Clock,
  Users,
  PlaneTakeoff,
  Plus,
  Minus,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function UserLoginPage2() {
  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased h-screen overflow-hidden flex">
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 h-full transition-all">
        <div className="p-6 flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
            <Globe className="h-6 w-6" />
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
            <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              2
            </span>
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
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-surface-dark"></span>
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
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Chào mừng trở lại, Nguyễn Đức!
                  </h2>
                  <p className="text-slate-300 max-w-xl">
                    Bạn có 3 lời mời tham gia tour mới đang chờ xác nhận. Hãy cập nhật hồ sơ để tăng
                    cơ hội nhận việc.
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button className="px-5 py-2.5 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition shadow-lg text-sm">
                    Cập nhật hồ sơ
                  </Button>
                  <Button className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition shadow-lg text-sm">
                    Xem việc mới
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
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">24</h3>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <TrendingUp className="h-3.5 w-3.5 mr-1" />
                    +2 tuần này
                  </p>
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
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">8</h3>
                  <p className="text-xs text-slate-500 mt-1">Tour sắp tới: 2</p>
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
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">3</h3>
                  <p className="text-xs text-slate-500 mt-1">Cần phản hồi sớm</p>
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
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">4.500.000 ₫</h3>
                  <p className="text-xs text-slate-500 mt-1 cursor-pointer hover:text-primary underline">
                    Rút tiền ngay
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Wallet className="h-6 w-6" />
                </div>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <List className="h-5 w-5 text-primary" />
                      Ứng tuyển gần đây
                    </h3>
                    <Link className="text-sm text-primary font-medium hover:text-primary-dark" href="#">
                      Xem tất cả
                    </Link>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <ther>
                        <tr className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                          <th className="px-6 py-3 font-medium">Tên Tour / Địa điểm</th>
                          <th className="px-6 py-3 font-medium">Đối tác</th>
                          <th className="px-6 py-3 font-medium">Thời gian</th>
                          <th className="px-6 py-3 font-medium">Trạng thái</th>
                          <th className="px-6 py-3 font-medium text-right">Thao tác</th>
                        </tr>
                      </ther>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                            Hanoi City Tour Full Day
                            <div className="text-xs text-slate-500 font-normal mt-0.5">
                              Tiếng Anh • Nhóm 10 pax
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                V
                              </div>
                              VietTravel
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                            12/06/2025
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span> Chấp
                              nhận
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-slate-400 hover:text-primary transition-colors"
                            >
                              <Eye className="h-5 w-5" />
                            </Button>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                            Ha Long Bay 2D1N Cruise
                            <div className="text-xs text-slate-500 font-normal mt-0.5">
                              Tiếng Pháp • Nhóm 25 pax
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-orange-100 dark:bg-orange-900/50 text-orange-600 flex items-center justify-center text-xs font-bold">
                                L
                              </div>
                              Luxury Tours
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                            15/06/2025
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-yellow-600"></span> Đang
                              chờ
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-slate-400 hover:text-primary transition-colors"
                            >
                              <Eye className="h-5 w-5" />
                            </Button>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                            Ninh Binh Exploration
                            <div className="text-xs text-slate-500 font-normal mt-0.5">
                              Tiếng Anh • Nhóm 4 pax
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center text-xs font-bold">
                                S
                              </div>
                              Saigontourist
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                            20/06/2025
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span> Đã
                              đóng
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-slate-400 hover:text-primary transition-colors"
                            >
                              <Eye className="h-5 w-5" />
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-primary to-blue-600 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <PlaneTakeoff className="h-[100px] w-[100px]" />
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-blue-100 text-sm font-medium mb-1">Chuyến đi sắp tới</h4>
                    <h3 className="text-xl font-bold mb-4">Hanoi City Tour</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4.5 w-4.5 opacity-80" />
                        <span>08:00 AM - 12/06/2025</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4.5 w-4.5 opacity-80" />
                        <span>Tập trung: Nhà hát lớn</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4.5 w-4.5 opacity-80" />
                        <span>10 Khách (Tiếng Anh)</span>
                      </div>
                    </div>
                    <Button className="mt-5 w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white py-2 rounded-lg text-sm font-semibold transition">
                      Xem chi tiết
                    </Button>
                  </div>
                </Card>
                <Card className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4">Hoạt động ví</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center flex-shrink-0">
                        <Plus className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            Nhận thanh toán
                          </p>
                          <span className="text-sm font-bold text-green-600">+1.200.000</span>
                        </div>
                        <p className="text-xs text-slate-500">Tour Ba Vi National Park</p>
                        <p className="text-[10px] text-slate-400 mt-1">Hôm qua, 15:30</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center flex-shrink-0">
                        <Minus className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            Rút tiền về NH
                          </p>
                          <span className="text-sm font-bold text-slate-600">-2.000.000</span>
                        </div>
                        <p className="text-xs text-slate-500">VCB **** 1234</p>
                        <p className="text-[10px] text-slate-400 mt-1">05/06/2025</p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="link"
                    className="w-full mt-4 text-center text-xs text-primary font-medium hover:underline"
                  >
                    Xem lịch sử giao dịch
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}





