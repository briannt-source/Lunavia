import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  MapPin,
  AlertTriangle,
  Users,
  Settings,
  Menu,
  Bell,
  Clock,
  Map,
  Calendar,
  User,
  Filter,
  Search,
  CheckCircle2,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EmergencySosReportPage3() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display">
      <div className="flex h-screen w-full overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 flex flex-col justify-between border-r border-[#f5f0f0] dark:border-[#3a2020] bg-white dark:bg-[#1a0b0b] h-full overflow-y-auto hidden lg:flex">
          <div className="flex flex-col gap-4 p-4">
            <div className="flex gap-3 items-center mb-6">
              <div className="relative size-10 rounded-full overflow-hidden">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyYVCpoK33HNw7DbeGwfH5pKHcIK8w01RPaYZfStAxpKz2Kj909dwACLNxfP1ujgcDMqF1iT6wjBms7uWcSiRpz_9D-PJtbuV6xuH03_TJnAOQgRzKGwrgOaYZcDavOJJ3DUvJhPMpg_zoI3D3dYvbpRAcsUF-hSo_G-9gYYd5cPWoW_rk-JzsBOEB0cbcBSje0pdwDc-B42bPgGjPuBEYy4jvVgdEoh9q3K8zaX3ZavTG7tJqQnbKaSESi2tcPkP6en27UbQWvw"
                  alt="VietTour Platform Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-[#181111] dark:text-white text-base font-bold leading-normal">
                  VietTour Platform
                </h1>
                <p className="text-[#8a6060] dark:text-[#cc8888] text-sm font-normal leading-normal">
                  Tour Guide Portal
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background-light dark:hover:bg-[#3a2020] transition-colors group"
              >
                <LayoutDashboard className="h-6 w-6 text-[#8a6060] dark:text-[#cc8888] group-hover:text-primary" />
                <p className="text-[#181111] dark:text-gray-200 text-sm font-medium leading-normal">
                  Dashboard
                </p>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background-light dark:hover:bg-[#3a2020] transition-colors group"
              >
                <MapPin className="h-6 w-6 text-[#8a6060] dark:text-[#cc8888] group-hover:text-primary" />
                <p className="text-[#181111] dark:text-gray-200 text-sm font-medium leading-normal">Tours</p>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 dark:bg-primary/20"
              >
                <AlertTriangle className="h-6 w-6 text-primary fill-primary" />
                <p className="text-primary text-sm font-bold leading-normal">SOS Reports</p>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background-light dark:hover:bg-[#3a2020] transition-colors group"
              >
                <Users className="h-6 w-6 text-[#8a6060] dark:text-[#cc8888] group-hover:text-primary" />
                <p className="text-[#181111] dark:text-gray-200 text-sm font-medium leading-normal">Guides</p>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background-light dark:hover:bg-[#3a2020] transition-colors group"
              >
                <Settings className="h-6 w-6 text-[#8a6060] dark:text-[#cc8888] group-hover:text-primary" />
                <p className="text-[#181111] dark:text-gray-200 text-sm font-medium leading-normal">
                  Settings
                </p>
              </Link>
            </div>
          </div>
          <div className="p-4 border-t border-[#f5f0f0] dark:border-[#3a2020]">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="relative size-8 rounded-full overflow-hidden">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0UKyQ2gOcjMgKD786okHfoztDDxVQRmyTLP7clYhXJ6MbPjK_ffadnZLrqHHSdXjPvSxjU3Mb1MsdtWHzlNQMonPhudF3bkVRH8pZeZA92UDQmC3kpSRL5i5H9mYVVp2fpmjIae0XQDftD0_fIb7kNXZikO955X2eV0Ys6afp2wcZEYNErYhM5OdE0X4r79AtBDjRqrAzetgtzsFuflsqy2bsMIVzg1Wa3NE70suNelOPaUoq_VJiMOesltn-PK4fnMhkC_F95A"
                  alt="User avatar"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <p className="text-[#181111] dark:text-white text-sm font-medium">Nguyễn Văn A</p>
                <p className="text-[#8a6060] dark:text-[#cc8888] text-xs">ID: GD-8821</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Top Navigation */}
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#f5f0f0] dark:border-[#3a2020] bg-white dark:bg-[#1a0b0b] px-6 py-3 z-10">
            <div className="flex items-center gap-4 text-[#181111] dark:text-white lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-7 w-7 text-primary" />
              <h2 className="text-[#181111] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                Lịch sử báo cáo SOS
              </h2>
            </div>
            <div className="flex items-center justify-end gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="bg-background-light dark:bg-[#2a1b1b] rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-[#8a6060] dark:text-[#cc8888] hover:text-primary transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 size-2 bg-primary rounded-full"></span>
              </Button>
            </div>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-4 md:p-8">
            <div className="max-w-6xl mx-auto flex flex-col gap-6">
              {/* Filters */}
              <Card className="bg-white dark:bg-[#1a0b0b] border border-[#f5f0f0] dark:border-[#3a2020]">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        className="pl-10 pr-4 py-2 rounded-lg border-gray-200 dark:border-[#3a2020] bg-white dark:bg-[#2a1b1b] text-sm"
                        placeholder="Tìm kiếm báo cáo..."
                      />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Loại khẩn cấp" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả loại</SelectItem>
                        <SelectItem value="accident">Tai nạn</SelectItem>
                        <SelectItem value="medical">Y tế/Ốm đau</SelectItem>
                        <SelectItem value="lost">Thất lạc</SelectItem>
                        <SelectItem value="other">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="pending">Đang xử lý</SelectItem>
                        <SelectItem value="resolved">Đã giải quyết</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Reports List */}
              <div className="space-y-4">
                {/* Report 1 */}
                <Card className="bg-white dark:bg-[#1a0b0b] border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-[#181111] dark:text-white">
                            #SOS-2025-001
                          </h3>
                          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                            <Clock className="h-3 w-3 mr-1" />
                            Đang xử lý
                          </Badge>
                        </div>
                        <p className="text-sm text-[#8a6060] dark:text-[#cc8888] mb-3">
                          Loại: <span className="font-medium text-[#181111] dark:text-white">Tai nạn</span> •{" "}
                          {new Date().toLocaleString("vi-VN")}
                        </p>
                        <p className="text-sm text-[#181111] dark:text-white">
                          Khách hàng bị ngã và cần hỗ trợ y tế ngay lập tức. Đã liên hệ với bệnh viện gần nhất.
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-[#8a6060] dark:text-[#cc8888]">
                          <div className="flex items-center gap-1">
                            <Map className="h-3 w-3" />
                            Hoi An Ancient Town
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Tour #VN-2025-HN-01
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-[#f5f0f0] dark:border-[#3a2020]">
                      <Button variant="outline" size="sm">
                        Xem chi tiết
                      </Button>
                      <Button variant="outline" size="sm">
                        Liên hệ hỗ trợ
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Report 2 */}
                <Card className="bg-white dark:bg-[#1a0b0b] border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-[#181111] dark:text-white">
                            #SOS-2025-002
                          </h3>
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Đã giải quyết
                          </Badge>
                        </div>
                        <p className="text-sm text-[#8a6060] dark:text-[#cc8888] mb-3">
                          Loại: <span className="font-medium text-[#181111] dark:text-white">Y tế/Ốm đau</span> •{" "}
                          {new Date(Date.now() - 86400000).toLocaleString("vi-VN")}
                        </p>
                        <p className="text-sm text-[#181111] dark:text-white">
                          Khách hàng bị say nắng, đã được đưa đến trạm y tế và điều trị thành công.
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-[#8a6060] dark:text-[#cc8888]">
                          <div className="flex items-center gap-1">
                            <Map className="h-3 w-3" />
                            Da Nang Beach
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Tour #DN-2025-045
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-[#f5f0f0] dark:border-[#3a2020]">
                      <Button variant="outline" size="sm">
                        Xem chi tiết
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Report 3 */}
                <Card className="bg-white dark:bg-[#1a0b0b] border-l-4 border-l-red-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-[#181111] dark:text-white">
                            #SOS-2025-003
                          </h3>
                          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                            <X className="h-3 w-3 mr-1" />
                            Đã hủy
                          </Badge>
                        </div>
                        <p className="text-sm text-[#8a6060] dark:text-[#cc8888] mb-3">
                          Loại: <span className="font-medium text-[#181111] dark:text-white">Thất lạc</span> •{" "}
                          {new Date(Date.now() - 172800000).toLocaleString("vi-VN")}
                        </p>
                        <p className="text-sm text-[#181111] dark:text-white">
                          Khách hàng đã tự tìm thấy và liên hệ lại. Báo cáo đã được hủy.
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-[#8a6060] dark:text-[#cc8888]">
                          <div className="flex items-center gap-1">
                            <Map className="h-3 w-3" />
                            Ho Chi Minh City
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Tour #HCM-2025-012
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-[#f5f0f0] dark:border-[#3a2020]">
                      <Button variant="outline" size="sm">
                        Xem chi tiết
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}



