import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  MapPin,
  Users,
  FileText,
  Building2,
  Settings,
  LogOut,
  Menu,
  Search,
  Bell,
  Plus,
  Calendar,
  TrendingUp,
  Unlock,
  UserSearch,
  Wallet,
  Verified,
  Badge,
  UserPlus,
  Settings as SettingsIcon,
  MapPin as AddLocation,
  PlusCircle as AddCircle,
  Eye,
  CheckCircle,
  Flag,
} from "lucide-react";

export default function TourOperatorDashboardPage() {
  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white antialiased h-screen flex overflow-hidden">
      <aside className="w-64 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-border-dark flex-col hidden lg:flex z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-border-dark">
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <MapPin className="w-5 h-5 fill-current" />
            <span>TourPortal</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium"
            href="#"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors group"
            href="#"
          >
            <MapPin className="w-5 h-5 group-hover:text-primary" />
            My Tours
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors group"
            href="#"
          >
            <FileText className="w-5 h-5 group-hover:text-primary" />
            Applications
            <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full dark:bg-red-900/30 dark:text-red-400">
              12
            </span>
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors group"
            href="#"
          >
            <Users className="w-5 h-5 group-hover:text-primary" />
            Guides
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors group"
            href="#"
          >
            <Wallet className="w-5 h-5 group-hover:text-primary" />
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
              <Building2 className="w-5 h-5 group-hover:text-primary" />
              Company Details
            </Link>
            <Link
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors group"
              href="#"
            >
              <Settings className="w-5 h-5 group-hover:text-primary" />
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
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-border-dark flex items-center justify-between px-4 lg:px-8 z-10">
          <div className="flex items-center gap-4 lg:hidden">
            <button className="text-slate-500 hover:text-slate-700 dark:text-slate-400">
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-lg text-slate-900 dark:text-white">
              TourPortal
            </span>
          </div>
          <div className="hidden md:flex relative max-w-md w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="w-5 h-5" />
            </span>
            <input
              className="block w-full rounded-lg border-0 py-2 pl-10 bg-slate-100 dark:bg-background-dark text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary sm:text-sm"
              placeholder="Search tours, guides, or applications..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-surface-dark"></span>
            </button>
            <Button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/30">
              <Plus className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Create New Tour</span>
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Overview
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <Verified className="w-4 h-4 text-green-500" />
                  Compliant with Vietnam Tourism Law 2025
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-surface-dark px-3 py-1.5 rounded-lg border border-slate-200 dark:border-border-dark shadow-sm">
                <Calendar className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Oct 2023 - Dec 2023
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Tổng số Tours
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      124
                    </h3>
                  </div>
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-lg">
                    <Flag className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs">
                  <span className="text-green-500 font-medium flex items-center">
                    <TrendingUp className="w-4 h-4" />
                    +12%
                  </span>
                  <span className="text-slate-400 ml-2">from last month</span>
                </div>
              </div>
              <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm relative overflow-hidden group hover:border-green-500/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Tours đang mở
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      8
                    </h3>
                  </div>
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg">
                    <Unlock className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    Accepting applications
                  </span>
                </div>
              </div>
              <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm relative overflow-hidden group hover:border-orange-500/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Ứng tuyển chờ duyệt
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      12
                    </h3>
                  </div>
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-lg relative">
                    <UserSearch className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark"></span>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs">
                  <span className="text-orange-600 font-medium bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded">
                    Action required
                  </span>
                </div>
              </div>
              <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Tổng chi
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      450tr
                      <span className="text-sm font-normal text-slate-500">
                        {" "}
                        VND
                      </span>
                    </h3>
                  </div>
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs">
                  <span className="text-slate-400">Paid to guides this year</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Activity Overview
                  </h3>
                  <select className="bg-slate-50 dark:bg-background-dark border-0 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:ring-1 focus:ring-primary py-1 px-3">
                    <option>Last 6 Months</option>
                    <option>This Year</option>
                  </select>
                </div>
                <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-4">
                  <div className="w-full flex flex-col items-center gap-2 group">
                    <div className="w-full bg-primary/10 dark:bg-primary/20 rounded-t-sm relative group-hover:bg-primary/20 transition-all h-[40%]">
                      <div className="absolute bottom-0 left-0 w-full bg-primary rounded-t-sm transition-all h-[60%] group-hover:bg-primary/90"></div>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Jun</span>
                  </div>
                  <div className="w-full flex flex-col items-center gap-2 group">
                    <div className="w-full bg-primary/10 dark:bg-primary/20 rounded-t-sm relative group-hover:bg-primary/20 transition-all h-[55%]">
                      <div className="absolute bottom-0 left-0 w-full bg-primary rounded-t-sm transition-all h-[70%] group-hover:bg-primary/90"></div>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Jul</span>
                  </div>
                  <div className="w-full flex flex-col items-center gap-2 group">
                    <div className="w-full bg-primary/10 dark:bg-primary/20 rounded-t-sm relative group-hover:bg-primary/20 transition-all h-[70%]">
                      <div className="absolute bottom-0 left-0 w-full bg-primary rounded-t-sm transition-all h-[80%] group-hover:bg-primary/90"></div>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Aug</span>
                  </div>
                  <div className="w-full flex flex-col items-center gap-2 group">
                    <div className="w-full bg-primary/10 dark:bg-primary/20 rounded-t-sm relative group-hover:bg-primary/20 transition-all h-[45%]">
                      <div className="absolute bottom-0 left-0 w-full bg-primary rounded-t-sm transition-all h-[50%] group-hover:bg-primary/90"></div>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Sep</span>
                  </div>
                  <div className="w-full flex flex-col items-center gap-2 group">
                    <div className="w-full bg-primary/10 dark:bg-primary/20 rounded-t-sm relative group-hover:bg-primary/20 transition-all h-[80%]">
                      <div className="absolute bottom-0 left-0 w-full bg-primary rounded-t-sm transition-all h-[90%] group-hover:bg-primary/90"></div>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Oct</span>
                  </div>
                  <div className="w-full flex flex-col items-center gap-2 group">
                    <div className="w-full bg-primary/10 dark:bg-primary/20 rounded-t-sm relative group-hover:bg-primary/20 transition-all h-[60%]">
                      <div className="absolute bottom-0 left-0 w-full bg-primary rounded-t-sm transition-all h-[40%] group-hover:bg-primary/90"></div>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Nov</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                    Tours Created
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="w-3 h-3 rounded-full bg-primary/20"></span>
                    Applications Received
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Company Overview
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-100 dark:border-green-900/50">
                    <Verified className="w-3.5 h-3.5" />
                    Verified
                  </span>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                        <Badge className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          In-house Guides
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Active contracts
                        </p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                      24
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                        <UserPlus className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Join Requests
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Guides waiting
                        </p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                      3
                    </span>
                  </div>
                </div>
                <div className="space-y-3 mt-auto">
                  <Button className="w-full flex items-center justify-center gap-2 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                    <UserPlus className="w-4.5 h-4.5" />
                    Invite Guides
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <SettingsIcon className="w-4.5 h-4.5" />
                    Manage Company Details
                  </Button>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm overflow-hidden p-8 lg:p-12 text-center">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <AddLocation className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Bạn chưa tạo tour nào
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
                Bắt đầu tạo tour đầu tiên của bạn để kết nối với các hướng dẫn
                viên chuyên nghiệp và mở rộng kinh doanh.
              </p>
              <Button className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm shadow-primary/30">
                <AddCircle className="w-5 h-5" />
                Tạo Tour Mới
              </Button>
            </div>
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-border-dark flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Pending Applications
                </h3>
                <Link
                  className="text-sm text-primary font-medium hover:underline"
                  href="#"
                >
                  View All
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-background-dark text-slate-500 dark:text-slate-400 font-medium">
                    <tr>
                      <th className="px-6 py-4">Tour Name</th>
                      <th className="px-6 py-4">Guide Name</th>
                      <th className="px-6 py-4">Applied Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-border-dark">
                    <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          Ha Long Bay Discovery - 3D2N
                        </div>
                        <div className="text-xs text-slate-500">ID: #T-8832</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300">
                            NH
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              Nguyen Hung
                            </div>
                            <div className="text-xs text-slate-500">
                              English, French
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        Oct 24, 2023
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-100 dark:border-orange-900/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                          Pending Review
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-primary transition-colors mx-1">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button className="text-slate-400 hover:text-green-600 transition-colors mx-1">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          Hoi An Ancient Town Walk
                        </div>
                        <div className="text-xs text-slate-500">ID: #T-8835</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300">
                            TM
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              Tran Minh
                            </div>
                            <div className="text-xs text-slate-500">
                              English, Japanese
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        Oct 23, 2023
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-100 dark:border-orange-900/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                          Pending Review
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-primary transition-colors mx-1">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button className="text-slate-400 hover:text-green-600 transition-colors mx-1">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          Mekong Delta Boat Trip
                        </div>
                        <div className="text-xs text-slate-500">ID: #T-8901</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300">
                            LA
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              Le Anh
                            </div>
                            <div className="text-xs text-slate-500">English</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        Oct 22, 2023
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          Interviewing
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-primary transition-colors mx-1">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button className="text-slate-400 hover:text-green-600 transition-colors mx-1">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

