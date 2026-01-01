import Link from "next/link";
import Image from "next/image";
import {
  TravelExplore,
  LayoutDashboard,
  MapPin,
  Users,
  Calendar,
  Settings,
  HelpCircle,
  Menu,
  Bell,
  Mail,
  Link as LinkIcon,
  Send,
  Copy,
  Clock,
  MoreVertical,
  X,
  CheckCircle2,
  RefreshCw,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function InviteGuideToCompanyPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white h-screen overflow-hidden flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111418] border-r border-border-dark flex-col hidden md:flex h-full shrink-0 z-20">
        <div className="flex h-full flex-col justify-between p-4">
          <div className="flex flex-col gap-4">
            {/* User Profile Summary in Sidebar */}
            <div className="flex gap-3 items-center mb-4">
              <div className="relative size-10 rounded-full overflow-hidden">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcfoHg7dQFXQfaczn3cRaGvZneITiqa7e_jgB1IHIZLJG_RiyTWd3I2Xn4DoKI2ZghCu2xmQ5HV_plQOH-onxpdImithZ54h4vSiUf-SBeknHnFoU6zrO1ZuetT2qnnb8sv3CFJqXipzkEa5gEvJy0zTqfvMQoLWhvS24ohoA7DqfS4P9puCCYeYRb37L7FvPCWqElGDJGYCAG0GRGjShPwXUKT9oSBmWGB7t6QOZTfh_cr5lF6QF3NcVBz28POrfRKF5G921Wbg"
                  alt="Company Logo Abstract"
                  fill
                  className="object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#111418]"></div>
              </div>
              <div className="flex flex-col overflow-hidden">
                <h1 className="text-white text-base font-medium leading-normal truncate">
                  VietTravel Ops
                </h1>
                <p className="text-text-secondary text-xs font-normal leading-normal truncate">
                  Admin Workspace
                </p>
              </div>
            </div>
            {/* Navigation Links */}
            <div className="flex flex-col gap-1">
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-border-dark hover:text-white transition-colors group"
              >
                <LayoutDashboard className="h-6 w-6" />
                <p className="text-sm font-medium leading-normal">Dashboard</p>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-border-dark hover:text-white transition-colors group"
              >
                <MapPin className="h-6 w-6" />
                <p className="text-sm font-medium leading-normal">Tours</p>
              </Link>
              {/* Active State */}
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20"
              >
                <Users className="h-6 w-6 fill-primary" />
                <p className="text-sm font-medium leading-normal">Guides</p>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-border-dark hover:text-white transition-colors group"
              >
                <Calendar className="h-6 w-6" />
                <p className="text-sm font-medium leading-normal">Bookings</p>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-border-dark hover:text-white transition-colors group"
              >
                <Settings className="h-6 w-6" />
                <p className="text-sm font-medium leading-normal">Settings</p>
              </Link>
            </div>
          </div>
          {/* Bottom Actions */}
          <div className="flex flex-col gap-2 border-t border-border-dark pt-4">
            <Button
              variant="ghost"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-border-dark hover:text-white transition-colors text-left"
            >
              <HelpCircle className="h-5 w-5" />
              <p className="text-sm font-medium">Hỗ trợ & Luật 2025</p>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Top Navigation Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border-dark bg-[#111418] px-6 py-3 shrink-0 z-10">
          <div className="flex items-center gap-4 text-white md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5 cursor-pointer" />
            </Button>
          </div>
          <div className="flex items-center gap-4 text-white">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded bg-primary/20 flex items-center justify-center text-primary">
                <TravelExplore className="h-5 w-5" />
              </div>
              <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] hidden sm:block">
                TourConnect B2B
              </h2>
            </div>
          </div>
          <div className="flex flex-1 justify-end gap-4 items-center">
            <Button
              variant="ghost"
              size="icon"
              className="flex items-center justify-center rounded-full size-10 hover:bg-border-dark text-white transition-colors relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-[#111418]"></span>
            </Button>
            <div className="relative w-9 h-9 rounded-full border border-border-dark cursor-pointer overflow-hidden">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYm55cF_DZYdlUpD-icdhaAG6P47jhDOmzd62Um26gPTKY1fUsoOD4dMXPdQVI4li2L4m7-PZF83fVti3-HLq5nSCwjDww1iJWsP31RL3ECI1GLM2P7wFt5z5CVDcWMYCpWIN4nWb3NVH22dMuDpbFewfmswn7J3WZEfZz3-SNLg5KGyRqWwnhnE-3S1TEKzBd-FlIxjbyTA8z1Da4Mox1lNJwL8VglxuUDeCzi-fEyK6wuQ-UormgeJIcFplMyMcUJzAuUN0R9g"
                alt="User Avatar"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-4 md:p-8 lg:px-12">
          <div className="max-w-5xl mx-auto flex flex-col gap-8">
            {/* Page Heading */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-primary text-sm font-medium mb-1">
                <Link href="#" className="hover:underline flex items-center gap-1">
                  <span>←</span>
                  Quay lại danh sách Guides
                </Link>
              </div>
              <h1 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                Mời Hướng Dẫn Viên
              </h1>
              <p className="text-text-secondary text-base font-normal leading-normal max-w-3xl">
                Mở rộng đội ngũ của bạn tuân thủ{" "}
                <span className="text-white font-medium">Luật Du lịch Việt Nam 2025</span>. Hướng dẫn viên được
                mời sẽ cần xác minh thẻ hành nghề và chứng chỉ khi tham gia hệ thống.
              </p>
            </div>

            {/* Invitation Methods Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Method 1: Email */}
              <div className="flex flex-col rounded-xl border border-border-dark bg-surface-dark overflow-hidden">
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                      <Mail className="h-8 w-8" />
                    </div>
                    <div className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs font-bold uppercase tracking-wider">
                      Khuyên dùng
                    </div>
                  </div>
                  <h2 className="text-white text-xl font-bold mb-2">Mời qua Email</h2>
                  <p className="text-text-secondary text-sm mb-6 flex-1">
                    Nhập địa chỉ email của hướng dẫn viên. Chúng tôi sẽ gửi một gói đăng ký cá nhân hóa trực
                    tiếp đến hộp thư của họ kèm theo hướng dẫn xác minh.
                  </p>
                  <form className="flex flex-col gap-4 mt-auto">
                    <div className="flex flex-col gap-2">
                      <Label className="text-white text-sm font-medium">Email hướng dẫn viên</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                        <Input
                          className="w-full bg-background-dark border border-border-dark rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                          placeholder="vidu: guide@gmail.com"
                          type="email"
                        />
                      </div>
                    </div>
                    <Button className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                      <span>Gửi lời mời</span>
                      <Send className="h-5 w-5" />
                    </Button>
                  </form>
                </div>
              </div>

              {/* Method 2: Link */}
              <div className="flex flex-col rounded-xl border border-border-dark bg-surface-dark overflow-hidden">
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500">
                      <LinkIcon className="h-8 w-8" />
                    </div>
                  </div>
                  <h2 className="text-white text-xl font-bold mb-2">Tạo Invite Link</h2>
                  <p className="text-text-secondary text-sm mb-6 flex-1">
                    Tạo một liên kết duy nhất để chia sẻ nhanh qua Zalo, Messenger hoặc SMS. Vì lý do bảo
                    mật, liên kết này sẽ hết hạn sau 7 ngày.
                  </p>
                  <div className="flex flex-col gap-4 mt-auto">
                    <div className="flex flex-col gap-2">
                      <Label className="text-white text-sm font-medium">Liên kết chia sẻ</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            className="w-full bg-[#111418] border border-border-dark rounded-lg py-3 px-4 text-text-secondary outline-none select-all cursor-text"
                            readOnly
                            type="text"
                            defaultValue="https://tourconnect.vn/inv/8392-xf92"
                          />
                          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#111418] to-transparent pointer-events-none"></div>
                        </div>
                        <Button
                          variant="outline"
                          className="bg-[#283039] hover:bg-[#3b4754] text-white p-3 rounded-lg transition-colors flex items-center justify-center aspect-square"
                          title="Sao chép"
                        >
                          <Copy className="h-5 w-5" />
                        </Button>
                      </div>
                      <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Hết hạn: 15/05/2025
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border border-border-dark hover:bg-border-dark text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="h-5 w-5" />
                      <span>Tạo liên kết mới</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Invitations Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-xl font-bold">Lời mời gần đây</h3>
                <Button variant="link" className="text-sm text-primary hover:text-blue-400 font-medium">
                  Xem tất cả
                </Button>
              </div>
              <div className="rounded-xl border border-border-dark bg-surface-dark overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#111418] text-text-secondary border-b border-border-dark hover:bg-[#111418]">
                        <TableHead className="px-6 py-4 font-medium">Hướng Dẫn Viên</TableHead>
                        <TableHead className="px-6 py-4 font-medium">Phương thức</TableHead>
                        <TableHead className="px-6 py-4 font-medium">Trạng thái</TableHead>
                        <TableHead className="px-6 py-4 font-medium">Ngày gửi</TableHead>
                        <TableHead className="px-6 py-4 font-medium text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border-dark">
                      {/* Row 1 */}
                      <TableRow className="group hover:bg-[#283039] transition-colors">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-xs text-white">
                              NH
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">nguyen.huy@example.com</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-text-secondary">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            Email
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                            <span className="size-1.5 rounded-full bg-yellow-500"></span>
                            Đang chờ
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-text-secondary">Hôm nay, 10:30 AM</TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-text-secondary hover:text-white p-1 rounded hover:bg-[#3b4754]"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {/* Row 2 */}
                      <TableRow className="group hover:bg-[#283039] transition-colors">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-[#3b4754] flex items-center justify-center font-bold text-xs text-text-secondary">
                              <LinkIcon className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-text-secondary italic">Chia sẻ qua Zalo</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-text-secondary">
                          <div className="flex items-center gap-1">
                            <LinkIcon className="h-4 w-4" />
                            Link
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                            <CheckCircle2 className="h-3 w-3" />
                            Đã đăng ký
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-text-secondary">05 Th5, 2025</TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-text-secondary hover:text-white p-1 rounded hover:bg-[#3b4754]"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {/* Row 3 */}
                      <TableRow className="group hover:bg-[#283039] transition-colors">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center font-bold text-xs text-white">
                              TV
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">tran.van.b@yahoo.com</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-text-secondary">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            Email
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                            <X className="h-3 w-3" />
                            Hết hạn
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-text-secondary">01 Th5, 2025</TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <Button className="text-primary hover:text-blue-300 text-xs font-bold border border-primary/30 rounded px-2 py-1 hover:bg-primary/10">
                            Gửi lại
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div className="p-4 border-t border-border-dark bg-[#111418] flex items-center justify-center">
                  <Button variant="link" className="text-sm text-text-secondary hover:text-white flex items-center gap-1">
                    Tải thêm lịch sử
                    <span>↓</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer / Help */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-6 rounded-xl bg-gradient-to-r from-blue-900/20 to-transparent border border-blue-900/30">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-full text-blue-400">
                  <Shield className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-white font-bold text-sm">Yêu cầu xác minh Hướng dẫn viên</h4>
                  <p className="text-text-secondary text-xs">
                    Theo Luật Du lịch 2025, tất cả HDV phải có thẻ hành nghề hợp lệ khi nhận tour.
                  </p>
                </div>
              </div>
              <Button className="whitespace-nowrap px-4 py-2 rounded-lg bg-[#283039] hover:bg-[#3b4754] text-white text-sm font-medium transition-colors">
                Xem quy định chi tiết
              </Button>
            </div>
            <div className="h-10"></div> {/* Spacer */}
          </div>
        </main>
      </div>
    </div>
  );
}

