import Image from "next/image";
import Link from "next/link";
import {
  TravelExplore,
  LayoutDashboard,
  Users,
  MapPin,
  Building2,
  Wallet,
  Gavel,
  Settings,
  Shield,
  Menu,
  LogOut,
  Search,
  Bell,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  X,
  CreditCard,
  BarChart3,
  Mountain,
  User,
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

export default function UserLoginPage9() {
  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white antialiased min-h-screen flex flex-col md:flex-row overflow-hidden">
      <aside className="w-full md:w-64 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 flex-col hidden md:flex h-screen">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <TravelExplore className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">VietTour Admin</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <Link
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg bg-primary/10 text-primary"
            href="#"
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Management
            </p>
          </div>
          <Link
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            href="#"
          >
            <Users className="h-5 w-5" />
            Users
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            href="#"
          >
            <MapPin className="h-5 w-5" />
            Tours
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            href="#"
          >
            <Building2 className="h-5 w-5" />
            Companies
          </Link>
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Financials
            </p>
          </div>
          <Link
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            href="#"
          >
            <Wallet className="h-5 w-5" />
            Transactions
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            href="#"
          >
            <Gavel className="h-5 w-5" />
            Disputes
            <span className="ml-auto bg-accent-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              3
            </span>
          </Link>
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Settings
            </p>
          </div>
          <Link
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            href="#"
          >
            <Settings className="h-5 w-5" />
            System Settings
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            href="#"
          >
            <Shield className="h-5 w-5" />
            Compliance {'&'} Logs
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Image
              alt="Admin"
              className="h-9 w-9 rounded-full bg-slate-100"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZOUVU88r9s6SLlP1XqE5KCe4GLePKKya2_EKhGT4_EbIMvGBzGFdmYzfCOcVShDlFR1kzhh59Fg6nuIQjwRNwysfIxXC9-a5BUf2l9tXbM-pYDoTHfDfyzrpZGXzMKzgs2M-F-_cp-auqGTWE_fP_p2vKNESTAnUzZsAW886jqiHHGHbyrRfWso8oZPyLjTS8fCIxl3X7-DULoeEqjciOGzxtWFWZwlRpXGZHnNr5AwpZKEZwosgZEDEVmOkDHiXeJLP4lX_hRg"
              width={36}
              height={36}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                System Admin
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                admin@viettour.vn
              </p>
            </div>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-500">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-4 md:hidden">
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-lg font-bold">VietTour Admin</span>
          </div>
          <div className="hidden md:flex flex-col">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-xs text-slate-500">Overview of system health and pending actions</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 h-5 w-5" />
              <Input
                className="pl-10 pr-4 py-2 text-sm border-none bg-slate-100 dark:bg-slate-800 rounded-lg w-64 focus:ring-2 focus:ring-primary dark:text-white"
                placeholder="Search users, IDs..."
                type="text"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="relative p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-surface-dark"></span>
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tổng Users</p>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">24,582</h3>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 flex items-center font-medium">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12%
                </span>
                <span className="text-slate-400 ml-2">from last month</span>
              </div>
            </Card>
            <Card className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tổng Tours</p>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">1,893</h3>
                </div>
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
                  <MapPin className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 flex items-center font-medium">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +5.4%
                </span>
                <span className="text-slate-400 ml-2">active tours</span>
              </div>
            </Card>
            <Card className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tour Guides</p>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">842</h3>
                </div>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                  <Mountain className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-slate-500">62 guides currently online</span>
              </div>
            </Card>
            <Card className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Volume</p>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">12.5B ₫</h3>
                </div>
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
                  <BarChart3 className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 flex items-center font-medium">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +8%
                </span>
                <span className="text-slate-400 ml-2">transaction volume</span>
              </div>
            </Card>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Action Required
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-red-50 dark:bg-red-900/10">
                <div className="flex items-center gap-2">
                  <Gavel className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">Disputes đang chờ</h3>
                </div>
                <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold px-2.5 py-1 rounded-full">
                  3 Pending
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Order #TR-8821 - Cancellation Fee
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Reported by: Nguyen Van A (Guide) • 2 hours ago
                    </p>
                  </div>
                  <Button variant="link" className="text-sm text-primary hover:text-primary-dark font-medium">
                    Review
                  </Button>
                </div>
                <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Order #TR-8845 - Service Quality
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Reported by: EasyTravel Co. • 5 hours ago
                    </p>
                  </div>
                  <Button variant="link" className="text-sm text-primary hover:text-primary-dark font-medium">
                    Review
                  </Button>
                </div>
                <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Order #TR-8790 - No Show
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Reported by: LuxTours Vietnam • 1 day ago
                    </p>
                  </div>
                  <Button variant="link" className="text-sm text-primary hover:text-primary-dark font-medium">
                    Review
                  </Button>
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/30 text-center border-t border-slate-200 dark:border-slate-800">
                <Link className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-primary" href="#">
                  View all disputes
                </Link>
              </div>
            </Card>
            <Card className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-orange-50 dark:bg-orange-900/10">
                <div className="flex items-center gap-2">
                  <Verified className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Xác minh đang chờ (KYC/KYB)
                  </h3>
                </div>
                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold px-2.5 py-1 rounded-full">
                  5 Pending
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-4">
                  <div className="bg-slate-100 h-10 w-10 rounded-full flex items-center justify-center text-slate-500">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Mekong Delta Travels Ltd.
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Business License Verification • Submitted today
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                    >
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                      <X className="h-4.5 w-4.5" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-4">
                  <div className="bg-slate-100 h-10 w-10 rounded-full flex items-center justify-center text-slate-500">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Tran Minh Tuan</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Tour Guide ID Verification • Submitted yesterday
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                    >
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                      <X className="h-4.5 w-4.5" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-4">
                  <div className="bg-slate-100 h-10 w-10 rounded-full flex items-center justify-center text-slate-500">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Ha Long Bay Cruises JSC
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Tax Document Verification • Submitted yesterday
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                    >
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                      <X className="h-4.5 w-4.5" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/30 text-center border-t border-slate-200 dark:border-slate-800">
                <Link className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-primary" href="#">
                  View verification queue
                </Link>
              </div>
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">Top-up chờ duyệt</h3>
                </div>
                <Link className="text-xs text-primary hover:underline" href="#">
                  View all
                </Link>
              </div>
              <div className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <TableHead className="px-3 py-2 rounded-l-lg">User</TableHead>
                      <TableHead className="px-3 py-2">Amount</TableHead>
                      <TableHead className="px-3 py-2">Method</TableHead>
                      <TableHead className="px-3 py-2 rounded-r-lg text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <TableCell className="px-3 py-3 font-medium text-slate-900 dark:text-white">
                        Saigon Tourist
                      </TableCell>
                      <TableCell className="px-3 py-3 text-slate-600 dark:text-slate-300">
                        50,000,000 ₫
                      </TableCell>
                      <TableCell className="px-3 py-3 text-slate-500 text-xs">Bank Transfer</TableCell>
                      <TableCell className="px-3 py-3 text-right">
                        <Button
                          variant="outline"
                          className="text-primary hover:text-primary-dark text-xs font-medium border border-primary/20 bg-primary/5 px-2 py-1 rounded"
                        >
                          Approve
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <TableCell className="px-3 py-3 font-medium text-slate-900 dark:text-white">
                        Hanoi Guides
                      </TableCell>
                      <TableCell className="px-3 py-3 text-slate-600 dark:text-slate-300">
                        12,500,000 ₫
                      </TableCell>
                      <TableCell className="px-3 py-3 text-slate-500 text-xs">Bank Transfer</TableCell>
                      <TableCell className="px-3 py-3 text-right">
                        <Button
                          variant="outline"
                          className="text-primary hover:text-primary-dark text-xs font-medium border border-primary/20 bg-primary/5 px-2 py-1 rounded"
                        >
                          Approve
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </Card>
            <Card className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">Rút tiền chờ duyệt</h3>
                </div>
                <Link className="text-xs text-primary hover:underline" href="#">
                  View all
                </Link>
              </div>
              <div className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <TableHead className="px-3 py-2 rounded-l-lg">User</TableHead>
                      <TableHead className="px-3 py-2">Amount</TableHead>
                      <TableHead className="px-3 py-2">Bank</TableHead>
                      <TableHead className="px-3 py-2 rounded-r-lg text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <TableCell className="px-3 py-3 font-medium text-slate-900 dark:text-white">
                        Le Van Cuong
                      </TableCell>
                      <TableCell className="px-3 py-3 text-slate-600 dark:text-slate-300">
                        5,000,000 ₫
                      </TableCell>
                      <TableCell className="px-3 py-3 text-slate-500 text-xs">VCB ***9921</TableCell>
                      <TableCell className="px-3 py-3 text-right">
                        <Button
                          variant="outline"
                          className="text-green-600 hover:text-green-700 text-xs font-medium border border-green-200 bg-green-50 px-2 py-1 rounded"
                        >
                          Process
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <TableCell className="px-3 py-3 font-medium text-slate-900 dark:text-white">
                        Da Nang Travel
                      </TableCell>
                      <TableCell className="px-3 py-3 text-slate-600 dark:text-slate-300">
                        22,000,000 ₫
                      </TableCell>
                      <TableCell className="px-3 py-3 text-slate-500 text-xs">Techcom ***8812</TableCell>
                      <TableCell className="px-3 py-3 text-right">
                        <Button
                          variant="outline"
                          className="text-green-600 hover:text-green-700 text-xs font-medium border border-green-200 bg-green-50 px-2 py-1 rounded"
                        >
                          Process
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
          <div className="mt-auto py-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2 md:mb-0">
              <Verified className="h-4 w-4 text-primary" />
              <span>Fully compliant with Vietnam Tourism Law 2025</span>
            </div>
            <div>© 2024 VietTour Platform. All rights reserved.</div>
          </div>
        </div>
      </main>
    </div>
  );
}

