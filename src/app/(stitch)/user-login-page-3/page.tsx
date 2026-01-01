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
  ChevronRight,
  Edit,
  RefreshCw,
  FileText,
  Info,
  Globe,
  GraduationCap,
  History,
  CheckCircle2,
  X,
  Eye,
  Calendar,
  Clock,
  Verified,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UserLoginPage3() {
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
          <div className="hidden md:flex relative max-w-md w-full">
            <Search className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 h-5 w-5" />
            <Input
              className="block w-full rounded-lg border-0 py-2 pl-10 bg-slate-100 dark:bg-background-dark text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary sm:text-sm"
              placeholder="Search tours, guides, or applications..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-surface-dark"></span>
            </Button>
            <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/30">
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Create New Tour</span>
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
                  <Link className="hover:text-primary" href="#">
                    My Tours
                  </Link>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="text-slate-900 dark:text-white font-medium">Tour Details</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  Ha Long Bay Discovery - 3D2N
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-900/50 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Open
                  </span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  ID: #T-8832 • Created on Oct 10, 2023
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-dark border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm"
                >
                  <Edit className="h-4.5 w-4.5" />
                  Chỉnh sửa Tour
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-dark border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm"
                >
                  <RefreshCw className="h-4.5 w-4.5" />
                  Thay đổi Trạng thái
                </Button>
                <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/30">
                  <FileText className="h-4.5 w-4.5" />
                  Tạo Hợp đồng
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Tour Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                        Description
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        Experience the magic of Ha Long Bay with this 3-day, 2-night cruise. We are
                        looking for an energetic guide who can handle a group of 15 international
                        tourists. Activities include kayaking, cave visiting, and a cooking class on
                        board. The guide must be knowledgeable about the local history and geology.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-border-dark">
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Guide Requirements
                        </h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <Globe className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
                            <span>English (Fluent), French (Basic)</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <GraduationCap className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
                            <span>University Degree in Tourism</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <History className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
                            <span>3+ Years Experience</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Additional Requirements
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-100 dark:border-white/5">
                          &quot;Guide must wear formal attire during the gala dinner and be available
                          for pre-tour briefing 1 day prior.&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-200 dark:border-border-dark flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Quản lý Ứng tuyển
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Manage incoming applications</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm">
                        All (5)
                      </span>
                      <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-orange-50 dark:bg-orange-900/20 text-orange-600 border border-orange-100 dark:border-orange-900/30">
                        Pending (3)
                      </span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-background-dark text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-border-dark">
                          <TableHead className="px-6 py-3">Guide Name</TableHead>
                          <TableHead className="px-6 py-3">Applied Date</TableHead>
                          <TableHead className="px-6 py-3">Status</TableHead>
                          <TableHead className="px-6 py-3 text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-slate-200 dark:divide-border-dark">
                        <TableRow className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">
                                NH
                              </div>
                              <div>
                                <div className="font-medium text-slate-900 dark:text-white group-hover:text-primary transition-colors cursor-pointer">
                                  Nguyen Hung
                                </div>
                                <div className="text-xs text-slate-500">5 Years • English</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-slate-500 dark:text-slate-400">
                            Oct 24, 2023
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-100 dark:border-orange-900/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                              Pending
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-slate-400 hover:text-primary p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10"
                                title="View Profile"
                              >
                                <Eye className="h-5 w-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-slate-400 hover:text-green-600 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
                                title="Accept"
                              >
                                <CheckCircle2 className="h-5 w-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Reject"
                              >
                                <X className="h-5 w-5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-sm font-bold text-purple-600 dark:text-purple-400">
                                TM
                              </div>
                              <div>
                                <div className="font-medium text-slate-900 dark:text-white group-hover:text-primary transition-colors cursor-pointer">
                                  Tran Minh
                                </div>
                                <div className="text-xs text-slate-500">3 Years • Eng, Jap</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-slate-500 dark:text-slate-400">
                            Oct 23, 2023
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-100 dark:border-orange-900/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                              Pending
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-slate-400 hover:text-primary p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10"
                                title="View Profile"
                              >
                                <Eye className="h-5 w-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-slate-400 hover:text-green-600 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
                                title="Accept"
                              >
                                <CheckCircle2 className="h-5 w-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Reject"
                              >
                                <X className="h-5 w-5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300">
                                HV
                              </div>
                              <div>
                                <div className="font-medium text-slate-900 dark:text-white group-hover:text-primary transition-colors cursor-pointer">
                                  Hoang Viet
                                </div>
                                <div className="text-xs text-slate-500">2 Years • English</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-slate-500 dark:text-slate-400">
                            Oct 20, 2023
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-100 dark:border-red-900/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                              Rejected
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-slate-400 hover:text-primary p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10"
                                title="View Profile"
                              >
                                <Eye className="h-5 w-5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 p-3 border-t border-slate-200 dark:border-border-dark text-center">
                    <Button variant="link" className="text-sm text-primary font-medium hover:underline">
                      View All Applications
                    </Button>
                  </div>
                </Card>
              </div>
              <div className="space-y-6">
                <Card className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">
                    Logistics {'&'} Pricing
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary shrink-0">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Destination</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          Ha Long City, Quang Ninh
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 shrink-0">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Dates</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          Oct 24 - Oct 26, 2023
                        </p>
                        <p className="text-xs text-slate-500">3 Days, 2 Nights</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 shrink-0">
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Total Pricing</p>
                        <p className="text-base font-bold text-slate-900 dark:text-white">
                          5,000,000 VND
                        </p>
                        <p className="text-xs text-slate-500">Per guide / trip</p>
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark p-6 shadow-sm">
                  <div className="space-y-5">
                    <div>
                      <h4 className="text-xs font-bold text-green-600 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                        <CheckCircle2 className="h-4 w-4" />
                        Inclusions
                      </h4>
                      <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1.5 list-none">
                        <li className="flex gap-2">
                          <span className="text-slate-400">•</span>
                          Limousine transfer Hanoi-Halong
                        </li>
                        <li className="flex gap-2">
                          <span className="text-slate-400">•</span>
                          All meals on board
                        </li>
                        <li className="flex gap-2">
                          <span className="text-slate-400">•</span>
                          Entrance fees {'&'} tickets
                        </li>
                        <li className="flex gap-2">
                          <span className="text-slate-400">•</span>
                          Travel Insurance
                        </li>
                      </ul>
                    </div>
                    <div className="pt-4 border-t border-slate-100 dark:border-border-dark">
                      <h4 className="text-xs font-bold text-red-500 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                        <X className="h-4 w-4" />
                        Exclusions
                      </h4>
                      <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1.5 list-none">
                        <li className="flex gap-2">
                          <span className="text-slate-400">•</span>
                          Personal expenses
                        </li>
                        <li className="flex gap-2">
                          <span className="text-slate-400">•</span>
                          Tips for crew
                        </li>
                        <li className="flex gap-2">
                          <span className="text-slate-400">•</span>
                          Visa arrangements
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
                <Card className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Guides đã được chấp nhận
                    </h3>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">
                      Active
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5 relative group">
                      <div className="h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-sm font-bold text-teal-600 dark:text-teal-400 shrink-0">
                        LA
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Le Anh</p>
                            <p className="text-xs text-slate-500">Guide ID: #G-992</p>
                          </div>
                          <Verified className="h-4.5 w-4.5 text-green-500" />
                        </div>
                        <div className="flex gap-2 mt-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="outline"
                            className="flex-1 py-1.5 text-xs font-medium bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-600 rounded text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary transition-colors"
                          >
                            Contract
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 py-1.5 text-xs font-medium bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-600 rounded text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary transition-colors"
                          >
                            Message
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-center bg-slate-50/50 dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="h-10 w-10 mx-auto rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors mb-2">
                      <UserPlus className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Looking for 1 more guide
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Invite from pool or wait for applications
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

