import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  MapPin,
  Tour,
  Ticket,
  Users,
  Wallet,
  Settings,
  Menu,
  Search,
  Bell,
  HelpCircle,
  Save,
  Camera,
  Mail,
  Phone,
  Globe,
  Verified,
  UserPlus,
  MoreVertical,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function CompanyProfileManagementPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111418] dark:text-white font-display overflow-hidden">
      <div className="flex h-screen w-full">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 border-r border-[#283039] bg-surface-dark hidden lg:flex flex-col">
          <div className="flex h-16 items-center px-6 border-b border-[#283039]">
            <div className="flex items-center gap-2 text-white">
              <div className="size-6 text-primary">
                <Building2 className="w-full h-full" />
              </div>
              <span className="text-lg font-bold tracking-tight">TourOp Portal</span>
            </div>
          </div>
          <div className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
            <div className="flex flex-col">
              <h3 className="text-white text-base font-bold leading-normal px-3 py-2">
                VietTravel Ops
              </h3>
              <p className="text-[#9dabb9] text-xs font-normal px-3">Admin Console</p>
            </div>
            <nav className="flex flex-col gap-1">
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#283039] text-white hover:bg-[#283039] transition-colors"
              >
                <Building2 className="h-5 w-5" />
                <span className="text-sm font-medium">Hồ sơ công ty</span>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#9dabb9] hover:bg-[#283039] hover:text-white transition-colors"
              >
                <Tour className="h-5 w-5" />
                <span className="text-sm font-medium">Quản lý Tour</span>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#9dabb9] hover:bg-[#283039] hover:text-white transition-colors"
              >
                <Ticket className="h-5 w-5" />
                <span className="text-sm font-medium">Booking</span>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#9dabb9] hover:bg-[#283039] hover:text-white transition-colors"
              >
                <Users className="h-5 w-5" />
                <span className="text-sm font-medium">Hướng dẫn viên</span>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#9dabb9] hover:bg-[#283039] hover:text-white transition-colors"
              >
                <Wallet className="h-5 w-5" />
                <span className="text-sm font-medium">Tài chính</span>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#9dabb9] hover:bg-[#283039] hover:text-white transition-colors"
              >
                <Settings className="h-5 w-5" />
                <span className="text-sm font-medium">Cài đặt</span>
              </Link>
            </nav>
          </div>
          <div className="p-4 border-t border-[#283039]">
            <div className="flex items-center gap-3">
              <div className="relative size-10 rounded-full overflow-hidden">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYbXuvfIfYj0r_ZUaWuul97Mn4Q3rd2zQhhFqMzmZAoyfqhxFKVoUGpwH7_3V3NZtfzjcB41jJfIwHrkHlnIydW9GBuP4JIhtAyxVQQmXVeWbVE9OsqGqpbzRErp2ltqudpJgRmSexlr2GU8BfyTAWExVYJUPdFNlOzMa-2exS6w7WG0N3NCfJE2zn2hm5aQBRsNSJAnbNbjdvTMTfng1MZ_6UnavgPue6VcDnJouV2QH2iioVzzU2nMgn_wYTviXDgymtKiEi1Q"
                  alt="User avatar"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">Admin User</span>
                <span className="text-xs text-[#9dabb9]">admin@viettravel.com</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-dark">
          {/* Top Navbar (Mobile/Desktop) */}
          <header className="h-16 flex items-center justify-between px-6 border-b border-[#283039] bg-surface-dark flex-shrink-0">
            <div className="lg:hidden flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5 text-white" />
              </Button>
              <span className="text-lg font-bold text-white">TourOp Portal</span>
            </div>
            <div className="hidden lg:flex flex-1 max-w-xl">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9dabb9]" />
                <Input
                  className="w-full h-10 bg-[#101922] border-none rounded-lg pl-10 pr-4 text-white placeholder-[#9dabb9] focus:ring-1 focus:ring-primary"
                  placeholder="Tìm kiếm hướng dẫn viên, tour, booking..."
                  type="text"
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" className="relative text-[#9dabb9] hover:text-white">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 size-2 bg-red-500 rounded-full border-2 border-surface-dark"></span>
              </Button>
              <Button variant="ghost" size="icon" className="text-[#9dabb9] hover:text-white">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </div>
          </header>

          {/* Scrollable Page Content */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="max-w-6xl mx-auto flex flex-col gap-8">
              {/* Page Heading */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-white mb-2">
                    Quản Lý Hồ Sơ Công Ty
                  </h1>
                  <p className="text-[#9dabb9]">
                    Cập nhật thông tin doanh nghiệp và quản lý đội ngũ hướng dẫn viên theo luật Du Lịch
                    2025.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="px-4 py-2 bg-[#283039] hover:bg-[#3e4852] text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    Xem trang công khai
                  </Button>
                  <Button className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20">
                    <Save className="h-[18px] w-[18px]" />
                    Lưu Thay Đổi
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column: Company Details (2/3 width) */}
                <div className="xl:col-span-2 flex flex-col gap-8">
                  {/* General Info Section */}
                  <section className="bg-surface-dark rounded-xl p-6 border border-[#283039]">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      Thông tin chung & Logo
                    </h2>
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Logo Upload */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="group relative size-32 rounded-full overflow-hidden bg-[#101922] border-2 border-dashed border-[#283039] hover:border-primary cursor-pointer transition-colors">
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Camera className="h-6 w-6 text-white" />
                          </div>
                          <Image
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwhfX2MuWDpj1d_YmhcTm9yW6WGrjVJHTe1VXqvIUlGaejDdTU7-E0Q4YQ6CxK0tRb_O4os2S_fw_LW7kpOMMjR-i_jDaSjkWHI-cz1lzIYLeGxEhGqZMST0CQSvduyVp7KsQSKj2wZ0okWOJBtqd62Dm3iBESeQqeyHk8jDn4ea0VUv_MXxQtlMI1zV4ydwfk7aKF4m69WqO4gpTkZ8zCYhc693fppmuNPLtKXJ-AWTvS74fwRRLCO1fYAGQjzoYsdu2DadUZEQ"
                            alt="Company Logo Placeholder"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <Button variant="link" className="text-primary text-sm font-medium hover:underline">
                          Tải ảnh lên
                        </Button>
                      </div>
                      {/* Form Fields */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 space-y-1">
                          <Label className="text-xs font-semibold text-[#9dabb9] uppercase tracking-wider">
                            Tên công ty
                          </Label>
                          <Input
                            className="w-full bg-[#101922] border border-[#283039] rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary placeholder-[#505a66]"
                            type="text"
                            defaultValue="VietTravel Ops International"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-[#9dabb9] uppercase tracking-wider">
                            Mã số thuế
                          </Label>
                          <Input
                            className="w-full bg-[#101922] border border-[#283039] rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary placeholder-[#505a66]"
                            type="text"
                            defaultValue="0101234567"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-[#9dabb9] uppercase tracking-wider flex items-center gap-1">
                            GP Lữ Hành (Tourism Law)
                            <Verified className="h-[14px] w-[14px] text-green-500" title="Verified" />
                          </Label>
                          <Input
                            className="w-full bg-[#101922] border border-[#283039] rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary placeholder-[#505a66]"
                            type="text"
                            defaultValue="79-001/2023/TCDL-GP LHQT"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <Label className="text-xs font-semibold text-[#9dabb9] uppercase tracking-wider">
                            Mô tả doanh nghiệp
                          </Label>
                          <Textarea
                            className="w-full bg-[#101922] border border-[#283039] rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary placeholder-[#505a66] resize-none"
                            rows={4}
                            defaultValue="Chúng tôi là đơn vị lữ hành hàng đầu chuyên cung cấp các tour du lịch trong và ngoài nước với đội ngũ hướng dẫn viên chuyên nghiệp."
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Contact Info Section */}
                  <section className="bg-surface-dark rounded-xl p-6 border border-[#283039]">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Phone className="h-5 w-5 text-primary" />
                      Thông tin liên hệ
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 space-y-1">
                        <Label className="text-xs font-semibold text-[#9dabb9] uppercase tracking-wider">
                          Địa chỉ trụ sở
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-[#9dabb9]" />
                          <Input
                            className="w-full bg-[#101922] border border-[#283039] rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary placeholder-[#505a66]"
                            type="text"
                            defaultValue="123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-[#9dabb9] uppercase tracking-wider">
                          Hotline
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-5 w-5 text-[#9dabb9]" />
                          <Input
                            className="w-full bg-[#101922] border border-[#283039] rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary placeholder-[#505a66]"
                            type="text"
                            defaultValue="+84 909 123 456"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-[#9dabb9] uppercase tracking-wider">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-[#9dabb9]" />
                          <Input
                            className="w-full bg-[#101922] border border-[#283039] rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary placeholder-[#505a66]"
                            type="email"
                            defaultValue="contact@viettravel.com"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-[#9dabb9] uppercase tracking-wider">
                          Website
                        </Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-2.5 h-5 w-5 text-[#9dabb9]" />
                          <Input
                            className="w-full bg-[#101922] border border-[#283039] rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary placeholder-[#505a66]"
                            type="text"
                            defaultValue="https://viettravel.com"
                          />
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right Column: HR Management (1/3 width) */}
                <div className="xl:col-span-1 flex flex-col gap-8">
                  {/* Pending Requests Card */}
                  <div className="bg-surface-dark rounded-xl border border-[#283039] overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-[#283039] flex items-center justify-between bg-[#1f2933]">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-500" />
                        Yêu cầu tham gia
                      </h3>
                      <span className="bg-amber-500/20 text-amber-500 text-xs font-bold px-2 py-1 rounded">
                        2 Mới
                      </span>
                    </div>
                    <div className="p-4 flex flex-col gap-4">
                      {/* Request Item 1 */}
                      <div className="flex flex-col gap-3 p-3 bg-[#101922] rounded-lg border border-[#283039]">
                        <div className="flex items-center gap-3">
                          <div className="relative size-10 rounded-full overflow-hidden">
                            <Image
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5E6PzPVl6wV66itgb2I_Xch8zRDv_hTONiLOTwEABbGpli5mttOg5n2aIIT5Io7xukccWsEuF-8Mo5XESnnavzFsTnBP1D2Ue9pz82yrtEDJvtvIdS3GJteqZNhHApiXuzYK9jv-Lafe63qxUMSzEybxUhoiu33HRan8YTIUF1R1N_SdHN-AGBo0IxLF3nhcv7hqOZKBSZXO40TNOfLZbmI4gNJDOvAXiwbeow6ILeWfQIbxLO5AXnA9EsG4lH-IRPUIH-IXzbg"
                              alt="Guide Avatar"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">Nguyễn Văn A</span>
                            <span className="text-xs text-[#9dabb9]">Thẻ: 179-442-99</span>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full">
                          <Button
                            variant="outline"
                            className="flex-1 py-1.5 bg-[#283039] hover:bg-red-500/20 hover:text-red-500 text-[#9dabb9] rounded text-xs font-medium transition-colors"
                          >
                            Từ chối
                          </Button>
                          <Button className="flex-1 py-1.5 bg-primary/20 hover:bg-primary text-primary hover:text-white rounded text-xs font-medium transition-colors">
                            Chấp nhận
                          </Button>
                        </div>
                      </div>
                      {/* Request Item 2 */}
                      <div className="flex flex-col gap-3 p-3 bg-[#101922] rounded-lg border border-[#283039]">
                        <div className="flex items-center gap-3">
                          <div className="relative size-10 rounded-full overflow-hidden">
                            <Image
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0DMZUWu7BE6s_1niTWJ4jSJpTqLB7oZVdwA9Bqn00QvMmaK6siaAPBJGa-Gk42Yd0Wzwn9Hb1rlYREIdMc4hg8iq_tYdaRs40LzBW-FNoPYWPBJH9BpwWwg6S4JW9NclP8TBJzr2brUAfI_IjIV1VPg3cF50UkJLWXsv_xLDFlFdo0Y52NqD5mBa2rhlU__pM4ajiNFio4sfGwctqXCQzNe_DAqth10ZNaXRNk_RfajkTUha5XWJxRC9JPVKCm7oO-7Lb4txl0A"
                              alt="Guide Avatar"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">Trần Thị B</span>
                            <span className="text-xs text-[#9dabb9]">Thẻ: 201-118-88</span>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full">
                          <Button
                            variant="outline"
                            className="flex-1 py-1.5 bg-[#283039] hover:bg-red-500/20 hover:text-red-500 text-[#9dabb9] rounded text-xs font-medium transition-colors"
                          >
                            Từ chối
                          </Button>
                          <Button className="flex-1 py-1.5 bg-primary/20 hover:bg-primary text-primary hover:text-white rounded text-xs font-medium transition-colors">
                            Chấp nhận
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* In-house Guides List */}
                  <div className="bg-surface-dark rounded-xl border border-[#283039] overflow-hidden flex flex-col flex-1">
                    <div className="p-4 border-b border-[#283039] flex items-center justify-between bg-[#1f2933]">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-500" />
                        In-house Guides
                      </h3>
                      <Button
                        variant="link"
                        className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
                      >
                        <UserPlus className="h-4 w-4" />
                        Mời Guide
                      </Button>
                    </div>
                    <div className="flex flex-col divide-y divide-[#283039]">
                      {/* Guide 1 */}
                      <div className="flex items-center justify-between p-4 hover:bg-[#1f2933] transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="relative size-10 rounded-full overflow-hidden">
                              <Image
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIlOwH89nEHEjw13b-iwnNluTK942rvdd-ckglWjo9-eNitXwb6M14QQ3Zl18MzQzLRzYWYLsanbyFPwBcFO4ePj0bTEVf7WuRd_yiUHU2GugLO9o0dXwFe7cCzzYwdjkliqDkgsbfOk5tfTsSFMpyufuF_jtO-LgKH_vnutjP0eKNkrG_u3oLAezzHrqFeut4v2WSm3px8hJmNiqcCdLfYZTZcZeHmomqPJF67_FxV0gVR3uYPK4v-LmkbfyKW_0SPhINlI6dYw"
                                alt="Guide Avatar"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full border-2 border-surface-dark"></div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">Lê Văn C</span>
                            <span className="text-xs text-[#9dabb9]">Thẻ Quốc tế</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[#505a66] group-hover:text-white hover:bg-[#283039] p-1.5 rounded transition-colors"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </div>
                      {/* Guide 2 */}
                      <div className="flex items-center justify-between p-4 hover:bg-[#1f2933] transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="relative size-10 rounded-full overflow-hidden">
                              <Image
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaiQTrEnJbTVQyAXOJlu3PNUhlKf7o7z-x1RyjgOGLHaoTLfPixNiN7Lmy2FyOFctm1lfSjXBcUyZvi_xFGTZMrX-eygjrcV-Dn5i3E90-sWy9C-PkTF8Hk1Gjsz8C8IaT9va5se38a7doDAXuMnZfrhG4LtObpjr1sOMZlHFR8AbPF8eAgzooVTnvGFchmiCi_nkLsceGYHTjjdJpe5CCNQRlr3suJwmSAIcMGCZ_Ififee0vovs4g-pvfDWCjimVFtxW2PBqfQ"
                                alt="Guide Avatar"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="absolute bottom-0 right-0 size-2.5 bg-gray-400 rounded-full border-2 border-surface-dark"></div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">Phạm Thị D</span>
                            <span className="text-xs text-[#9dabb9]">Thẻ Nội địa</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[#505a66] group-hover:text-white hover:bg-[#283039] p-1.5 rounded transition-colors"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </div>
                      {/* Guide 3 */}
                      <div className="flex items-center justify-between p-4 hover:bg-[#1f2933] transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="relative size-10 rounded-full overflow-hidden">
                              <Image
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJRyCq8d0jtemvnyCUaoV7sWA8r-qFHbQpikEkvFMFS0X7auu5gtw94W5Oc-K9NM_xWE2JH2Tl29y9FPMrFNQjgCT1EwXy9u7RQuAUx8yfjaRYsvz7DHAsxvpwmjnxEyU9WmTYji8yWUE7OjA1MpCyrm6Jlfn7YXiIfzQ_xz7j2XnYQRV7w8iWvEOo8UL5fcHDu_8wvnp7-OnIqZ0qC_FKP_UFUQXKVqqe5YjMa4UHVqRmk_BvORtcVwOcbuSiq7fiZqYKj5UJDw"
                                alt="Guide Avatar"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full border-2 border-surface-dark"></div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">Hoàng Văn E</span>
                            <span className="text-xs text-[#9dabb9]">Thẻ Quốc tế</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[#505a66] group-hover:text-white hover:bg-[#283039] p-1.5 rounded transition-colors"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-[#1f2933]/50 border-t border-[#283039] text-center">
                      <Link
                        href="#"
                        className="text-xs text-[#9dabb9] hover:text-primary transition-colors"
                      >
                        Xem tất cả 12 hướng dẫn viên
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
