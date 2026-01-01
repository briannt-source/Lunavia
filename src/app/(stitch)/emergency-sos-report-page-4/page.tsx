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
  Phone,
  MessageSquare,
  CheckCircle2,
  X,
  AlertCircle,
  FileText,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EmergencySosReportPage4() {
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
                Chi tiết báo cáo SOS
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
            <div className="max-w-5xl mx-auto flex flex-col gap-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-[#181111] dark:text-white mb-2">#SOS-2025-001</h1>
                  <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                    <Clock className="h-3 w-3 mr-1" />
                    Đang xử lý
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Tải báo cáo
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Liên hệ hỗ trợ
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="details" className="w-full">
                <TabsList>
                  <TabsTrigger value="details">Chi tiết</TabsTrigger>
                  <TabsTrigger value="timeline">Lịch sử xử lý</TabsTrigger>
                  <TabsTrigger value="attachments">Tài liệu đính kèm</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <Card className="bg-white dark:bg-[#1a0b0b] border border-[#f5f0f0] dark:border-[#3a2020]">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-[#181111] dark:text-white">
                        Thông tin báo cáo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-[#8a6060] dark:text-[#cc8888] mb-1">Loại khẩn cấp</p>
                          <p className="text-sm font-medium text-[#181111] dark:text-white">Tai nạn</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#8a6060] dark:text-[#cc8888] mb-1">Thời gian gửi</p>
                          <p className="text-sm font-medium text-[#181111] dark:text-white">
                            {new Date().toLocaleString("vi-VN")}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#8a6060] dark:text-[#cc8888] mb-1">Vị trí</p>
                          <p className="text-sm font-medium text-[#181111] dark:text-white flex items-center gap-2">
                            <Map className="h-4 w-4" />
                            15.8801° N, 108.3380° E
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#8a6060] dark:text-[#cc8888] mb-1">Tour liên quan</p>
                          <p className="text-sm font-medium text-[#181111] dark:text-white">
                            #VN-2025-HN-01
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-[#8a6060] dark:text-[#cc8888] mb-1">Mô tả</p>
                        <p className="text-sm text-[#181111] dark:text-white">
                          Khách hàng bị ngã và cần hỗ trợ y tế ngay lập tức. Đã liên hệ với bệnh viện gần nhất.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-[#1a0b0b] border border-[#f5f0f0] dark:border-[#3a2020]">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-[#181111] dark:text-white">
                        Thông tin liên hệ
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-[#2a1b1b]">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#181111] dark:text-white">
                              Nguyễn Văn A (Guide)
                            </p>
                            <p className="text-xs text-[#8a6060] dark:text-[#cc8888]">ID: GD-8821</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          Gọi
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                  <Card className="bg-white dark:bg-[#1a0b0b] border border-[#f5f0f0] dark:border-[#3a2020]">
                    <CardContent className="p-6">
                      <div className="relative border-l-2 border-gray-200 dark:border-[#3a2020] ml-3 space-y-6">
                        <div className="relative pl-6">
                          <span className="absolute -left-[9px] top-0 size-4 bg-white dark:bg-[#1a0b0b] border-2 border-primary rounded-full"></span>
                          <p className="text-xs text-gray-500 mb-1">Hôm nay, 10:30 AM</p>
                          <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                              Báo cáo đã được tiếp nhận
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              Đội ngũ hỗ trợ đang xử lý báo cáo của bạn.
                            </p>
                          </div>
                        </div>
                        <div className="relative pl-6">
                          <span className="absolute -left-[9px] top-0 size-4 bg-white dark:bg-[#1a0b0b] border-2 border-gray-300 dark:border-gray-600 rounded-full"></span>
                          <p className="text-xs text-gray-500 mb-1">Hôm nay, 10:25 AM</p>
                          <div className="bg-gray-50 dark:bg-[#221010] p-3 rounded-lg border border-gray-200 dark:border-[#3a2020]">
                            <p className="text-sm font-semibold text-[#181111] dark:text-white">
                              Báo cáo đã được gửi
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Báo cáo khẩn cấp đã được gửi thành công.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="attachments" className="space-y-4">
                  <Card className="bg-white dark:bg-[#1a0b0b] border border-[#f5f0f0] dark:border-[#3a2020]">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-[#181111] dark:text-white">
                        Tài liệu đính kèm
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="w-full h-32 rounded-lg border border-gray-200 dark:border-[#3a2020] bg-gray-50 dark:bg-[#221010] flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors group">
                          <FileText className="h-8 w-8 text-gray-400 group-hover:text-primary mb-2" />
                          <span className="text-xs text-gray-500">screenshot.jpg</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


