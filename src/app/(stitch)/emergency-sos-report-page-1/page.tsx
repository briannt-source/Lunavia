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
  Emergency,
  Warning,
  MyLocation,
  Upload,
  Shield,
  Phone,
  PhoneCall,
  Map,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmergencySosReportPage1() {
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
              <Emergency className="h-7 w-7 text-primary fill-primary" />
              <h2 className="text-[#181111] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                Emergency Reporting System
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
              {/* Warning Banner */}
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-primary p-4 rounded-r-lg shadow-sm flex items-start gap-4 animate-pulse">
                <Warning className="h-6 w-6 text-primary fill-primary mt-0.5" />
                <div>
                  <p className="text-[#181111] dark:text-white font-bold text-base">
                    Yêu cầu hỗ trợ khẩn cấp
                  </p>
                  <p className="text-[#8a6060] dark:text-red-200 text-sm mt-1">
                    Trong trường hợp nguy hiểm đến tính mạng, vui lòng gọi{" "}
                    <span className="font-bold text-primary dark:text-red-400">115</span> hoặc{" "}
                    <span className="font-bold text-primary dark:text-red-400">113</span> trước khi gửi báo
                    cáo.
                  </p>
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Report Form (Span 2) */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  {/* Page Heading */}
                  <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black text-[#181111] dark:text-white tracking-tight">
                      Báo Cáo Sự Cố (SOS)
                    </h1>
                    <p className="text-[#8a6060] dark:text-[#cc8888]">
                      Điền thông tin bên dưới để gửi yêu cầu hỗ trợ ngay lập tức.
                    </p>
                  </div>

                  <Card className="bg-white dark:bg-[#1a0b0b] border border-[#f5f0f0] dark:border-[#3a2020]">
                    <CardContent className="p-6 flex flex-col gap-6">
                      {/* Emergency Type */}
                      <div>
                        <Label className="block text-sm font-bold text-[#181111] dark:text-gray-200 mb-3">
                          1. Chọn loại khẩn cấp <span className="text-primary">*</span>
                        </Label>
                        <RadioGroup defaultValue="accident" className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <label className="cursor-pointer group">
                            <RadioGroupItem value="accident" className="peer sr-only" />
                            <div className="h-full flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-transparent bg-background-light dark:bg-[#2a1b1b] hover:bg-red-50 dark:hover:bg-red-900/10 peer-checked:border-primary peer-checked:bg-red-50 dark:peer-checked:bg-primary/20 transition-all">
                              <User className="h-8 w-8 text-[#8a6060] dark:text-[#cc8888] peer-checked:text-primary group-hover:text-primary" />
                              <span className="text-sm font-medium text-center dark:text-gray-200 peer-checked:text-primary">
                                Tai nạn
                              </span>
                            </div>
                          </label>
                          <label className="cursor-pointer group">
                            <RadioGroupItem value="medical" className="peer sr-only" />
                            <div className="h-full flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-transparent bg-background-light dark:bg-[#2a1b1b] hover:bg-red-50 dark:hover:bg-red-900/10 peer-checked:border-primary peer-checked:bg-red-50 dark:peer-checked:bg-primary/20 transition-all">
                              <Phone className="h-8 w-8 text-[#8a6060] dark:text-[#cc8888] peer-checked:text-primary group-hover:text-primary" />
                              <span className="text-sm font-medium text-center dark:text-gray-200 peer-checked:text-primary">
                                Y tế/Ốm đau
                              </span>
                            </div>
                          </label>
                          <label className="cursor-pointer group">
                            <RadioGroupItem value="lost" className="peer sr-only" />
                            <div className="h-full flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-transparent bg-background-light dark:bg-[#2a1b1b] hover:bg-red-50 dark:hover:bg-red-900/10 peer-checked:border-primary peer-checked:bg-red-50 dark:peer-checked:bg-primary/20 transition-all">
                              <User className="h-8 w-8 text-[#8a6060] dark:text-[#cc8888] peer-checked:text-primary group-hover:text-primary" />
                              <span className="text-sm font-medium text-center dark:text-gray-200 peer-checked:text-primary">
                                Thất lạc
                              </span>
                            </div>
                          </label>
                          <label className="cursor-pointer group">
                            <RadioGroupItem value="other" className="peer sr-only" />
                            <div className="h-full flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-transparent bg-background-light dark:bg-[#2a1b1b] hover:bg-red-50 dark:hover:bg-red-900/10 peer-checked:border-primary peer-checked:bg-red-50 dark:peer-checked:bg-primary/20 transition-all">
                              <Warning className="h-8 w-8 text-[#8a6060] dark:text-[#cc8888] peer-checked:text-primary group-hover:text-primary" />
                              <span className="text-sm font-medium text-center dark:text-gray-200 peer-checked:text-primary">
                                Khác
                              </span>
                            </div>
                          </label>
                        </RadioGroup>
                      </div>

                      {/* Location */}
                      <div>
                        <Label className="block text-sm font-bold text-[#181111] dark:text-gray-200 mb-2">
                          2. Vị trí hiện tại <span className="text-primary">*</span>
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MyLocation className="h-5 w-5 text-primary" />
                          </div>
                          <Input
                            className="block w-full pl-10 pr-12 py-3 rounded-lg border-gray-200 dark:border-[#3a2020] bg-white dark:bg-[#2a1b1b] text-gray-900 dark:text-white focus:border-primary focus:ring-primary sm:text-sm"
                            placeholder="Đang lấy vị trí GPS..."
                            readOnly
                            defaultValue="15.8801° N, 108.3380° E (Hoi An Ancient Town)"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:text-primary">
                            <span className="text-xs font-semibold text-primary">Refresh</span>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-[#8a6060] dark:text-[#cc8888]">
                          Hệ thống tự động ghi nhận tọa độ GPS cho mục đích cứu hộ.
                        </p>
                      </div>

                      {/* Description */}
                      <div>
                        <Label className="block text-sm font-bold text-[#181111] dark:text-gray-200 mb-2">
                          3. Mô tả tình huống <span className="text-primary">*</span>
                        </Label>
                        <Textarea
                          className="block w-full rounded-lg border-gray-200 dark:border-[#3a2020] bg-white dark:bg-[#2a1b1b] text-gray-900 dark:text-white focus:border-primary focus:ring-primary sm:text-sm p-3"
                          placeholder="Mô tả ngắn gọn sự việc: Số lượng người bị ảnh hưởng, tình trạng hiện tại, v.v."
                          rows={4}
                        />
                      </div>

                      {/* Upload */}
                      <div>
                        <Label className="block text-sm font-bold text-[#181111] dark:text-gray-200 mb-2">
                          4. Hình ảnh/Tài liệu (Tùy chọn)
                        </Label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-[#3a2020] border-dashed rounded-lg bg-background-light dark:bg-[#2a1b1b] hover:bg-gray-50 dark:hover:bg-[#3a2020]/50 transition-colors cursor-pointer group">
                          <div className="space-y-1 text-center">
                            <Upload className="h-12 w-12 text-gray-400 group-hover:text-primary transition-colors mx-auto" />
                            <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                              <label className="relative cursor-pointer rounded-md font-medium text-primary hover:text-red-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                                <span>Tải ảnh lên</span>
                                <input className="sr-only" id="file-upload" name="file-upload" type="file" />
                              </label>
                              <p className="pl-1">hoặc kéo thả vào đây</p>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG tối đa 10MB</p>
                          </div>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-4 border-t border-[#f5f0f0] dark:border-[#3a2020] flex flex-col gap-3">
                        <Button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg text-lg shadow-lg shadow-red-500/30 transition-all transform active:scale-[0.99]">
                          <Emergency className="h-5 w-5 animate-pulse fill-white" />
                          GỬI BÁO CÁO KHẨN CẤP
                        </Button>
                        <div className="flex items-center justify-center gap-2">
                          <Shield className="h-4 w-4 text-gray-400" />
                          <p className="text-xs text-gray-500 text-center">
                            Báo cáo của bạn sẽ được lưu với chữ ký số theo Luật Du lịch 2025.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column: Context & Contacts (Span 1) */}
                <div className="flex flex-col gap-6">
                  {/* Active Tour Card */}
                  <Card className="bg-white dark:bg-[#1a0b0b] border border-[#f5f0f0] dark:border-[#3a2020]">
                    <CardHeader className="bg-background-light dark:bg-[#2a1b1b] px-4 py-3 border-b border-[#f5f0f0] dark:border-[#3a2020] flex justify-between items-center">
                      <CardTitle className="font-bold text-[#181111] dark:text-white text-sm uppercase tracking-wide">
                        Tour Đang Dẫn
                      </CardTitle>
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                        Active
                      </span>
                    </CardHeader>
                    <CardContent className="p-4 flex flex-col gap-4">
                      <div className="relative w-full rounded-lg aspect-video shadow-inner overflow-hidden">
                        <Image
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuABAyMKHdniy_CDKz-PSSFltLJjMp6rkWkRDn8ZrYuqa-e_lh2_H8SGuY0tSOTE7tEpoiZtfUgQ_YRLK2en2tJ-MQac8CaVEfonVfz38sMkfrm2niyn-LK_YrADu_H2eJgixw_B-apHIvoUH9AEW_1nMmB2j1VTk3C2RNG8diNi-KeoUOJnQq6e3Ljb8RYms5aOhzWOInY23wR8M1RGDrbApF1MELmbXYKq73_Q8yqRsFfyOobi7A1C26QSCWOqPTsVbNaaG7Jygg"
                          alt="Hoi An Ancient Town"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> Hoi An, VN
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div>
                          <p className="text-xs text-[#8a6060] dark:text-[#cc8888]">Mã Tour</p>
                          <p className="text-[#181111] dark:text-white font-bold text-base">VN-2025-HN-01</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#8a6060] dark:text-[#cc8888]">Đoàn khách</p>
                          <p className="text-[#181111] dark:text-white font-medium text-sm">
                            ABC Corp Team Building
                          </p>
                        </div>
                        <div className="flex justify-between items-center border-t border-[#f5f0f0] dark:border-[#3a2020] pt-3 mt-1">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-[#8a6060]" />
                            <span className="text-sm font-medium">25 Khách</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-[#8a6060]" />
                            <span className="text-sm font-medium">Ngày 3/5</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Emergency Hotlines */}
                  <Card className="bg-white dark:bg-[#1a0b0b] border border-[#f5f0f0] dark:border-[#3a2020]">
                    <CardHeader className="bg-primary px-4 py-3 flex items-center gap-2">
                      <PhoneCall className="h-5 w-5 text-white" />
                      <CardTitle className="font-bold text-white text-sm uppercase tracking-wide">
                        Hotline Khẩn Cấp
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 flex flex-col gap-3">
                      <a
                        className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 group hover:bg-red-100 transition-colors"
                        href="tel:115"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-white dark:bg-red-900 p-2 rounded-full text-primary shadow-sm">
                            <Phone className="h-5 w-5 fill-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-lg text-[#181111] dark:text-white group-hover:text-primary">
                              115
                            </span>
                            <span className="text-xs text-[#8a6060] dark:text-[#cc8888]">Cấp cứu y tế</span>
                          </div>
                        </div>
                        <Phone className="h-5 w-5 text-primary -rotate-45" />
                      </a>
                      <a
                        className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 group hover:bg-red-100 transition-colors"
                        href="tel:113"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-white dark:bg-red-900 p-2 rounded-full text-primary shadow-sm">
                            <Shield className="h-5 w-5 fill-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-lg text-[#181111] dark:text-white group-hover:text-primary">
                              113
                            </span>
                            <span className="text-xs text-[#8a6060] dark:text-[#cc8888]">Cảnh sát</span>
                          </div>
                        </div>
                        <Phone className="h-5 w-5 text-primary -rotate-45" />
                      </a>
                      <div className="border-t border-[#f5f0f0] dark:border-[#3a2020] my-1"></div>
                      <a
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-[#2a1b1b] hover:bg-gray-100 dark:hover:bg-[#3a2020] transition-colors group"
                        href="tel:+84901234567"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-white dark:bg-gray-800 p-2 rounded-full text-gray-700 dark:text-gray-300 shadow-sm">
                            <Phone className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-md text-[#181111] dark:text-white">
                              Điều Hành Tour
                            </span>
                            <span className="text-xs text-[#8a6060] dark:text-[#cc8888]">
                              090 123 4567 (Mr. Hung)
                            </span>
                          </div>
                        </div>
                        <Phone className="h-5 w-5 text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white" />
                      </a>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

