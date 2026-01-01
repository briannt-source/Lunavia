import Image from "next/image";
import Link from "next/link";
import {
  TravelExplore,
  LayoutDashboard,
  MapPin,
  Users,
  Wallet,
  Bell,
  Plus,
  Menu,
  LogOut,
  Search,
  ArrowLeft,
  Info,
  Users as UsersIcon,
  FileText,
  ChevronDown,
  Badge,
  UserCog,
  CheckCircle2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function UserLoginPage5() {
  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white antialiased h-screen flex overflow-hidden">
      <aside className="w-64 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-border-dark flex-col hidden lg:flex z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-border-dark">
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <TravelExplore className="h-6 w-6 fill-current" />
            <span>TourPortal</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors group"
            href="#"
          >
            <LayoutDashboard className="h-5 w-5 group-hover:text-primary" />
            Dashboard
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium"
            href="#"
          >
            <MapPin className="h-5 w-5" />
            My Tours
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors group"
            href="#"
          >
            <Users className="h-5 w-5 group-hover:text-primary" />
            Applications
            <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full dark:bg-red-900/30 dark:text-red-400">
              12
            </span>
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors group"
            href="#"
          >
            <Users className="h-5 w-5 group-hover:text-primary" />
            Guides
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors group"
            href="#"
          >
            <Wallet className="h-5 w-5 group-hover:text-primary" />
            Finance
          </Link>
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-border-dark">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Company
            </p>
            <Link
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors group"
              href="#"
            >
              <MapPin className="h-5 w-5 group-hover:text-primary" />
              Company Details
            </Link>
            <Link
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors group"
              href="#"
            >
              <Users className="h-5 w-5 group-hover:text-primary" />
              Settings
            </Link>
          </div>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-border-dark">
          <div className="flex items-center gap-3">
            <Image
              alt="User"
              className="w-10 h-10 rounded-full border-2 border-slate-100 dark:border-slate-700"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBipcXeU2ojCTGhQ9Q6iUnRIDZ6VHEoc0J9jF7ZFnKCh79L0hDnTIN7yhG_sUfLQpMusgIEt8ZI0WDn3FZTeUhmnXN834kIFe9EzoiLhBuEgy_jAFbyrnClqm6GpB6vZA745FyQnQwB_63VtCWSH-p1bWYUSujURwJHHItJYjXrc_GZ2NZko609OW7X6peDUYCHQniX31yHyHXIwhvlmR5-_WusGrBOd-XeW-4ATp4pyesV-kbnbCZwMFagYLyFW_GRU9DLH5DcXQ"
              width={40}
              height={40}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                Viet Travel Co.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                admin@viettravel.com
              </p>
            </div>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-border-dark flex items-center justify-between px-4 lg:px-8 z-10">
          <div className="flex items-center gap-4 lg:hidden">
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700 dark:text-slate-400">
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-bold text-lg text-slate-900 dark:text-white">TourPortal</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Back to List</span>
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex relative max-w-xs w-full mr-4">
              <Search className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 h-5 w-5" />
              <Input
                className="block w-full rounded-full border-0 py-1.5 pl-10 bg-slate-100 dark:bg-background-dark text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary sm:text-sm"
                placeholder="Search..."
                type="text"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-surface-dark"></span>
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-background-light dark:bg-background-dark">
          <div className="max-w-5xl mx-auto pb-12">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
                  <span>My Tours</span>
                  <ChevronDown className="h-3.5 w-3.5 rotate-[-90deg]" />
                  <span className="text-primary font-medium">New Tour</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tạo Tour Mới</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Create a new tour listing compliant with Vietnam Tourism Law 2025.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="px-4 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  Draft Save
                </Button>
              </div>
            </div>
            <form className="space-y-6">
              <Card className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm p-6 lg:p-8">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-white/5">
                  <Info className="h-5 w-5 text-primary" />
                  Thông tin cơ bản
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-12">
                    <Label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Tiêu đề tour <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow placeholder:text-slate-400"
                      placeholder="Nhập tên tour du lịch..."
                      type="text"
                    />
                  </div>
                  <div className="md:col-span-12">
                    <Label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Mô tả
                    </Label>
                    <Textarea
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow placeholder:text-slate-400"
                      placeholder="Mô tả chi tiết về tour..."
                      rows={4}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <Label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Thành phố <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Select>
                        <SelectTrigger className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent">
                          <SelectValue placeholder="Chọn thành phố" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hanoi">Hà Nội</SelectItem>
                          <SelectItem value="hcm">TP. Hồ Chí Minh</SelectItem>
                          <SelectItem value="danang">Đà Nẵng</SelectItem>
                          <SelectItem value="halong">Hạ Long</SelectItem>
                          <SelectItem value="hoian">Hội An</SelectItem>
                        </SelectContent>
                      </Select>
                      <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <Label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Ngày và giờ bắt đầu <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      type="datetime-local"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <Label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Ngày và giờ kết thúc <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      type="datetime-local"
                    />
                  </div>
                </div>
              </Card>
              <Card className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm p-6 lg:p-8">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-white/5">
                  <UsersIcon className="h-5 w-5 text-primary" />
                  Hướng dẫn viên {'&'} Chi phí
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="bg-slate-50 dark:bg-background-dark/50 p-4 rounded-xl border border-slate-100 dark:border-white/5 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <Badge className="h-4.5 w-4.5" />
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Main Guide</h3>
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Số lượng Main Guide
                      </Label>
                      <Input
                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        min={1}
                        type="number"
                        defaultValue={1}
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Giá Main Guide (VND)
                      </Label>
                      <div className="relative">
                        <Input
                          className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                          placeholder="0"
                          type="text"
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                          VND
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-background-dark/50 p-4 rounded-xl border border-slate-100 dark:border-white/5 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                        <UserCog className="h-4.5 w-4.5" />
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Sub Guide</h3>
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Số lượng Sub Guide
                      </Label>
                      <Input
                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        min={0}
                        type="number"
                        defaultValue={0}
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Giá Sub Guide (VND)
                      </Label>
                      <div className="relative">
                        <Input
                          className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                          placeholder="0"
                          type="text"
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                          VND
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              <Card className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm p-6 lg:p-8">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-white/5">
                  <FileText className="h-5 w-5 text-primary" />
                  Chi tiết bổ sung
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Bao gồm
                    </Label>
                    <Textarea
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow placeholder:text-slate-400"
                      placeholder="- Vé tham quan&#10;- Bữa trưa&#10;- Xe đưa đón"
                      rows={5}
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Không bao gồm
                    </Label>
                    <Textarea
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow placeholder:text-slate-400"
                      placeholder="- Tiền tip&#10;- Đồ uống có cồn&#10;- Chi phí cá nhân"
                      rows={5}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Yêu cầu bổ sung
                    </Label>
                    <Textarea
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow placeholder:text-slate-400"
                      placeholder="Yêu cầu đặc biệt về ngôn ngữ, kỹ năng sơ cứu, thẻ hướng dẫn viên quốc tế..."
                      rows={3}
                    />
                  </div>
                </div>
              </Card>
              <Card className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <Label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">
                    Tầm nhìn (Visibility)
                  </Label>
                  <RadioGroup defaultValue="public" className="flex items-center gap-6">
                    <div className="flex items-center gap-2.5 cursor-pointer group">
                      <RadioGroupItem value="public" id="public" />
                      <Label
                        htmlFor="public"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white cursor-pointer"
                      >
                        PUBLIC
                      </Label>
                    </div>
                    <div className="flex items-center gap-2.5 cursor-pointer group">
                      <RadioGroupItem value="private" id="private" />
                      <Label
                        htmlFor="private"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white cursor-pointer"
                      >
                        PRIVATE
                      </Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-slate-500 mt-2">
                    Public tours are visible to all registered guides.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    type="button"
                    className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Tạo Tour
                  </Button>
                </div>
              </Card>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

