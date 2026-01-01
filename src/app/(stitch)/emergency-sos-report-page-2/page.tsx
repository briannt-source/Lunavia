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
  CheckCircle2,
  Clock,
  Map,
  Calendar,
  User,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function EmergencySosReportPage2() {
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
                Emergency Report Confirmation
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
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
              {/* Success Message */}
              <Card className="bg-white dark:bg-[#1a0b0b] border border-green-200 dark:border-green-800">
                <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
                  <div className="size-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-[#181111] dark:text-white mb-2">
                      Báo cáo đã được gửi thành công
                    </h1>
                    <p className="text-[#8a6060] dark:text-[#cc8888]">
                      Báo cáo khẩn cấp của bạn đã được gửi đến đội ngũ hỗ trợ và sẽ được xử lý ngay lập tức.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Report Details */}
              <Card className="bg-white dark:bg-[#1a0b0b] border border-[#f5f0f0] dark:border-[#3a2020]">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-[#181111] dark:text-white">
                    Chi tiết báo cáo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[#8a6060] dark:text-[#cc8888] mb-1">Mã báo cáo</p>
                      <p className="text-sm font-bold text-[#181111] dark:text-white">#SOS-2025-001</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8a6060] dark:text-[#cc8888] mb-1">Thời gian gửi</p>
                      <p className="text-sm font-medium text-[#181111] dark:text-white">
                        {new Date().toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8a6060] dark:text-[#cc8888] mb-1">Loại khẩn cấp</p>
                      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                        Tai nạn
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-[#8a6060] dark:text-[#cc8888] mb-1">Trạng thái</p>
                      <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                        <Clock className="h-3 w-3 mr-1" />
                        Đang xử lý
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-[#8a6060] dark:text-[#cc8888] mb-1">Vị trí</p>
                    <p className="text-sm font-medium text-[#181111] dark:text-white flex items-center gap-2">
                      <Map className="h-4 w-4" />
                      15.8801° N, 108.3380° E (Hoi An Ancient Town)
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8a6060] dark:text-[#cc8888] mb-1">Mô tả</p>
                    <p className="text-sm text-[#181111] dark:text-white">
                      Khách hàng bị ngã và cần hỗ trợ y tế ngay lập tức. Đã liên hệ với bệnh viện gần nhất.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-[#181111] dark:text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Bước tiếp theo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="size-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#181111] dark:text-white">
                        Đội ngũ hỗ trợ sẽ liên hệ với bạn trong vòng 5 phút
                      </p>
                      <p className="text-xs text-[#8a6060] dark:text-[#cc8888] mt-1">
                        Vui lòng giữ điện thoại luôn mở và sẵn sàng nhận cuộc gọi
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="size-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#181111] dark:text-white">
                        Theo dõi trạng thái báo cáo trong phần &quot;SOS Reports&quot;
                      </p>
                      <p className="text-xs text-[#8a6060] dark:text-[#cc8888] mt-1">
                        Bạn sẽ nhận được thông báo khi có cập nhật mới
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="size-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#181111] dark:text-white">
                        Trong trường hợp khẩn cấp, vui lòng gọi 115 hoặc 113
                      </p>
                      <p className="text-xs text-[#8a6060] dark:text-[#cc8888] mt-1">
                        Đừng chờ đợi nếu tình huống trở nên nghiêm trọng hơn
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="#">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Quay lại Dashboard
                  </Link>
                </Button>
                <Button className="flex-1 bg-primary hover:bg-red-700" asChild>
                  <Link href="#">
                    <FileText className="h-4 w-4 mr-2" />
                    Xem lịch sử báo cáo
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

