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
  Filter,
  Calendar,
  UtensilsCrossed,
  Ship,
  Mountain,
  Building2,
  Bike,
  Eye,
  Edit,
  Trash2,
  Copy,
  CheckCircle2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UserLoginPage6() {
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
            <MapPin className="h-5 w-5 fill-current" />
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Tours</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Manage your tour listings, schedule, and applications.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white dark:bg-surface-dark px-3 py-2 rounded-lg border border-slate-200 dark:border-border-dark shadow-sm flex items-center gap-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Total Tours:</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">124</span>
                </div>
              </div>
            </div>
            <Card className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:w-64">
                  <Filter className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 h-5 w-5" />
                  <Select>
                    <SelectTrigger className="block w-full rounded-lg border-slate-200 dark:border-slate-700 py-2 pl-10 bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="OPEN">Open (Accepting)</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative w-full sm:w-48">
                  <MapPin className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 h-5 w-5" />
                  <Select>
                    <SelectTrigger className="block w-full rounded-lg border-slate-200 dark:border-slate-700 py-2 pl-10 bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm">
                      <SelectValue placeholder="All Cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Cities</SelectItem>
                      <SelectItem value="Hanoi">Hanoi</SelectItem>
                      <SelectItem value="Ho Chi Minh">Ho Chi Minh</SelectItem>
                      <SelectItem value="Da Nang">Da Nang</SelectItem>
                      <SelectItem value="Ha Long">Ha Long</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative w-full sm:w-48">
                  <Input
                    className="block w-full rounded-lg border-slate-200 dark:border-slate-700 py-2 px-3 bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm"
                    type="date"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:inline">
                  Sort by:
                </span>
                <Select>
                  <SelectTrigger className="block w-full sm:w-auto rounded-lg border-slate-200 dark:border-slate-700 py-2 pl-3 pr-8 bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm">
                    <SelectValue placeholder="Newest Created" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest Created</SelectItem>
                    <SelectItem value="start-asc">Start Date (Asc)</SelectItem>
                    <SelectItem value="start-desc">Start Date (Desc)</SelectItem>
                    <SelectItem value="title-az">Title (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
            <Card className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-background-dark text-slate-500 dark:text-slate-400 font-medium">
                      <TableHead className="px-6 py-4">Tour Title {'&'} Location</TableHead>
                      <TableHead className="px-6 py-4">Status</TableHead>
                      <TableHead className="px-6 py-4">Start Date</TableHead>
                      <TableHead className="px-6 py-4">Applications / Guides</TableHead>
                      <TableHead className="px-6 py-4 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-200 dark:divide-border-dark">
                    <TableRow className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <TableCell className="px-6 py-4 max-w-xs">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400">
                            <UtensilsCrossed className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-base truncate">
                              Hanoi Street Food Tour
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3.5 w-3.5" /> Hanoi • ID: #T-8920
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-100 dark:border-green-900/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          OPEN
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="text-slate-900 dark:text-white font-medium">Dec 15, 2023</div>
                        <div className="text-xs text-slate-500">Duration: 4h</div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4.5 w-4.5 text-slate-400" />
                          <span className="text-slate-900 dark:text-white font-medium">
                            12 Applications
                          </span>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-1.5 overflow-hidden">
                          <div className="bg-primary h-full rounded-full" style={{ width: "60%" }}></div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                          title="Edit Tour"
                        >
                          <Edit className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <TableCell className="px-6 py-4 max-w-xs">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 text-orange-600 dark:text-orange-400">
                            <Ship className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-base truncate">
                              Ha Long Bay Cruise 2D1N
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3.5 w-3.5" /> Quang Ninh • ID: #T-8832
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          IN PROGRESS
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="text-slate-900 dark:text-white font-medium">Oct 24, 2023</div>
                        <div className="text-xs text-slate-500">Duration: 2 Days</div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-surface-dark flex items-center justify-center text-[10px] text-slate-600">
                              AB
                            </div>
                            <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-surface-dark flex items-center justify-center text-[10px] text-slate-600">
                              CD
                            </div>
                          </div>
                          <span className="text-slate-900 dark:text-white font-medium text-xs">
                            2 Guides Active
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                          title="Edit Tour"
                        >
                          <Edit className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <TableCell className="px-6 py-4 max-w-xs">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-600 dark:text-slate-400">
                            <Mountain className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-base truncate">
                              Sapa Trekking Adventure
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3.5 w-3.5" /> Lao Cai • ID: #T-9001
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                          DRAFT
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="text-slate-900 dark:text-white font-medium">Jan 10, 2024</div>
                        <div className="text-xs text-slate-500">Duration: 3 Days</div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className="text-slate-400 italic text-sm">Not published</span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                          title="Edit Tour"
                        >
                          <Edit className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <TableCell className="px-6 py-4 max-w-xs">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0 text-yellow-600 dark:text-yellow-400">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-base truncate">
                              Da Nang {'&'} Hoi An Discovery
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3.5 w-3.5" /> Da Nang • ID: #T-8800
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-100 dark:border-red-900/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          CLOSED
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="text-slate-900 dark:text-white font-medium">Nov 05, 2023</div>
                        <div className="text-xs text-slate-500">Duration: 1 Day</div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4.5 w-4.5 text-green-500" />
                          <span className="text-slate-900 dark:text-white font-medium">Guide Assigned</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                          title="Edit Tour"
                        >
                          <Edit className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <TableCell className="px-6 py-4 max-w-xs">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 text-purple-600 dark:text-purple-400">
                            <Bike className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-base truncate">
                              HCM City Motorbike Tour
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3.5 w-3.5" /> HCM City • ID: #T-8540
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                          COMPLETED
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="text-slate-900 dark:text-white font-medium">Oct 10, 2023</div>
                        <div className="text-xs text-slate-500">Duration: 4h</div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] text-slate-600">
                            TM
                          </div>
                          <span className="text-slate-500 dark:text-slate-400 text-xs">
                            Tran Minh finished
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                          title="Clone Tour"
                        >
                          <Copy className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div className="px-6 py-4 border-t border-slate-200 dark:border-border-dark flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Showing <span className="font-medium text-slate-900 dark:text-white">1</span> to{" "}
                  <span className="font-medium text-slate-900 dark:text-white">5</span> of{" "}
                  <span className="font-medium text-slate-900 dark:text-white">124</span> results
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled
                    className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50 text-slate-600 dark:text-slate-300"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

