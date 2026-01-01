import Link from "next/link";
import Image from "next/image";
import {
  TravelExplore,
  Search,
  Bell,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  Wallet,
  Eye,
  Check,
  X,
  Verified,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MyAssignmentsPageGuideView() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        {/* Top Navigation */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a2632] px-6 lg:px-10 py-3 sticky top-0 z-50">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 text-[#111418] dark:text-white">
              <div className="size-6 text-primary">
                <TravelExplore className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold leading-tight">Tour Guide Portal</h2>
            </div>
            <div className="hidden lg:flex items-center gap-9">
              <Link
                href="#"
                className="text-gray-500 hover:text-primary text-sm font-medium leading-normal"
              >
                Dashboard
              </Link>
              <Link
                href="#"
                className="text-primary text-sm font-bold leading-normal"
              >
                Assignments
              </Link>
              <Link
                href="#"
                className="text-gray-500 hover:text-primary text-sm font-medium leading-normal"
              >
                Profile
              </Link>
              <Link
                href="#"
                className="text-gray-500 hover:text-primary text-sm font-medium leading-normal"
              >
                Finance
              </Link>
            </div>
          </div>
          <div className="flex flex-1 justify-end gap-6 items-center">
            <label className="hidden sm:flex flex-col min-w-40 !h-10 max-w-64">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="text-gray-500 flex items-center justify-center pl-3">
                  <Search className="h-5 w-5" />
                </div>
                <Input
                  className="w-full min-w-0 flex-1 resize-none bg-transparent border-none focus:ring-0 text-sm px-3 text-[#111418] dark:text-white placeholder:text-gray-400"
                  placeholder="Search tours..."
                />
              </div>
            </label>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative p-2 text-gray-500 hover:text-primary transition-colors">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1a2632]"></span>
              </Button>
              <div className="relative w-9 h-9 rounded-full ring-2 ring-gray-100 dark:ring-gray-800 cursor-pointer overflow-hidden">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCShVcAoKHzWObbzVMIuTYtvWak115VrwKtru11TVhfAGppg0swWaLt0LmozpZlF9kktcGYWZeW8O90aaoLSIKysTrzgFLY8iTf-bhFy4DUua2SjuvNqymUmWPvVe9Wl0b6CSAcin-KuRUkdGUADIX1cNO_TZcv7tiXH89QKBr_QfaLIWLgBkQyGt_2MJ_80sMIOPmsw5F3IViZJan-rLOYbCFU4485n9JYx0waVMkx4UrHxenTREPDu8LS2CHyNBiWaGZfh3SJXQ"
                  alt="Tour guide profile picture"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex justify-center py-6 px-4 md:px-8 lg:px-12">
          <div className="flex flex-col max-w-[1200px] w-full gap-8">
            {/* Page Heading */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#111418] dark:text-white">
                  Quản lý Lịch Tour
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-base font-normal">
                  Manage your private tour assignments from operators compliant with Tourism Law
                  2025.
                </p>
              </div>
              <Button className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-200 dark:shadow-none">
                <Calendar className="h-5 w-5" />
                <span>My Calendar View</span>
              </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2 rounded-xl p-6 border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/30">
                <div className="flex items-center justify-between">
                  <p className="text-amber-800 dark:text-amber-400 text-sm font-semibold uppercase tracking-wider">
                    Pending Requests
                  </p>
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-[#111418] dark:text-white text-3xl font-bold">2</p>
                <p className="text-xs text-amber-700 dark:text-amber-500">Action required within 24h</p>
              </div>

              <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 bg-white dark:bg-[#1a2632] dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">
                    Upcoming Tours
                  </p>
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <p className="text-[#111418] dark:text-white text-3xl font-bold">5</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Next: Tomorrow at 08:00 AM</p>
              </div>

              <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 bg-white dark:bg-[#1a2632] dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">
                    Completed Tours
                  </p>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-[#111418] dark:text-white text-3xl font-bold">12</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">This month</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-[#1a2632] p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto px-2">
                <Button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-primary text-white px-4 text-sm font-medium transition-colors">
                  All Status
                </Button>
                <Button
                  variant="outline"
                  className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-[#111418] dark:text-gray-200 px-4 text-sm font-medium transition-colors"
                >
                  Pending
                </Button>
                <Button
                  variant="outline"
                  className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-[#111418] dark:text-gray-200 px-4 text-sm font-medium transition-colors"
                >
                  Accepted
                </Button>
                <Button
                  variant="outline"
                  className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-[#111418] dark:text-gray-200 px-4 text-sm font-medium transition-colors"
                >
                  Rejected
                </Button>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto px-2">
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap hidden sm:block">
                  Filter by date:
                </span>
                <Button
                  variant="outline"
                  className="flex flex-1 sm:flex-none items-center justify-between gap-2 h-9 border border-gray-300 dark:border-gray-600 rounded-lg px-3 text-sm text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-[#1a2632]"
                >
                  <span>This Month</span>
                  <Calendar className="h-[18px] w-[18px]" />
                </Button>
              </div>
            </div>

            {/* Assignments List */}
            <div className="flex flex-col gap-4">
              {/* PENDING CARD 1 */}
              <div className="group relative flex flex-col md:flex-row gap-6 p-6 rounded-xl border-l-4 border-l-amber-500 border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2632] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                          PENDING
                        </span>
                        <span className="text-xs text-gray-500">Contract #HD-2025-8821</span>
                      </div>
                      <h3 className="text-xl font-bold text-[#111418] dark:text-white group-hover:text-primary transition-colors cursor-pointer">
                        Hanoi Street Food Private Tour
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-[18px] w-[18px]" />
                      <span>24h remaining to respond</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                        <Image
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDO5B7hl1-aPhVEbRPGIUJtP50VuQjHKvM--_U5pQuLaQcudWyQwyjMDbMQAmHODPisBBwPYkT_V0jbWeT0HV-xvmPpbubwJcEaRE82JPCdsXp78hl1ylcyCZJx6fD4eM2pmLHp3LZ_21fhnD1SoR7jJYxPzEiwu6HXHV-9qDG9oIk77DIYbiqXtIVNteW3Gmm-NR3Hrf4r07jYI-zsOu2lfQ-8G-qGg58NL9JitXu7uGJyqgkyN45zeKbtrzPsSpWApvuxQC8ciA"
                          alt="Vietnam Discovery Travel Logo"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase font-semibold">Operator</span>
                        <span className="text-sm font-medium text-[#111418] dark:text-white">
                          Vietnam Discovery
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase font-semibold">Date & Time</span>
                        <span className="text-sm font-medium text-[#111418] dark:text-white">
                          Oct 12, 2025 • 08:00 AM
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase font-semibold">Guests</span>
                        <span className="text-sm font-medium text-[#111418] dark:text-white">
                          4 Pax (English)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase font-semibold">Fee</span>
                        <span className="text-sm font-medium text-[#111418] dark:text-white">
                          1,500,000 VND
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col md:border-l border-gray-100 dark:border-gray-700 md:pl-6 gap-3 justify-center min-w-[200px]">
                  <Button className="w-full bg-primary hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm shadow-blue-200 dark:shadow-none">
                    <Check className="h-5 w-5" />
                    Accept Assignment
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <X className="h-5 w-5" />
                    Reject
                  </Button>
                  <Link
                    href="#"
                    className="text-center text-xs text-gray-500 hover:text-primary mt-1 underline"
                  >
                    View detailed itinerary
                  </Link>
                </div>
              </div>

              {/* PENDING CARD 2 */}
              <div className="group relative flex flex-col md:flex-row gap-6 p-6 rounded-xl border-l-4 border-l-amber-500 border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2632] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                          PENDING
                        </span>
                        <span className="text-xs text-gray-500">Contract #HD-2025-9942</span>
                      </div>
                      <h3 className="text-xl font-bold text-[#111418] dark:text-white group-hover:text-primary transition-colors cursor-pointer">
                        Saigon City Half-Day Tour
                      </h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                        <Image
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDc650drF8Py5F-F_1HOGWHjcQE1SJ6o8dg9w095SoWuvDEs9hFpnkkJertrvwRPScN1jAzGaOUJRFEgzvS49jZEFsdATcIIGXL11l6YZzFJ9JBzlhMq2HMXhY0NZBys-7KmteDo7iaRgBXJY8YmHrimgvQY1kektxnOqK97LbmueXbo-sgsCii6NekAHHoDMmH5xQNGOf9OOb2xGYKhnNrX_Aw5lloXyQagFSvEa6ixoCwYn2mNLtGS9SP-D8NH1sLYTSWUErI2A"
                          alt="Saigon Tourist Logo"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase font-semibold">Operator</span>
                        <span className="text-sm font-medium text-[#111418] dark:text-white">
                          Saigon Tourist
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase font-semibold">Date & Time</span>
                        <span className="text-sm font-medium text-[#111418] dark:text-white">
                          Oct 25, 2025 • 01:00 PM
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase font-semibold">Guests</span>
                        <span className="text-sm font-medium text-[#111418] dark:text-white">
                          3 Pax (French)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase font-semibold">Fee</span>
                        <span className="text-sm font-medium text-[#111418] dark:text-white">
                          1,200,000 VND
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col md:border-l border-gray-100 dark:border-gray-700 md:pl-6 gap-3 justify-center min-w-[200px]">
                  <Button className="w-full bg-primary hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm shadow-blue-200 dark:shadow-none">
                    <Check className="h-5 w-5" />
                    Accept Assignment
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <X className="h-5 w-5" />
                    Reject
                  </Button>
                  <Link
                    href="#"
                    className="text-center text-xs text-gray-500 hover:text-primary mt-1 underline"
                  >
                    View detailed itinerary
                  </Link>
                </div>
              </div>

              {/* ACCEPTED CARD */}
              <div className="group relative flex flex-col md:flex-row gap-6 p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2632] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          ACCEPTED
                        </span>
                        <span className="text-xs text-gray-500">Contract #HD-2025-1024</span>
                      </div>
                      <h3 className="text-xl font-bold text-[#111418] dark:text-white group-hover:text-primary transition-colors cursor-pointer">
                        Ha Long Bay Day Cruise
                      </h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                        <Image
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB04qubTgtvmZhbZ5MxpHn3452YzZzijlK744WWR6seIb9zkkVRbTi5AAO4jGgxpjC2XdIjmd40XxjBio1IVje4b38jZ8nTBPzimGpBS518LEGgk6zSa9FlX2cmWDbgzRiUPVDhdP1k7vfRR64o2m99MpzxE__vgsY9ee7nCCo9gA9Xg02sT8vNV9ycvl9qDtMbkjud6wgB-X5wdNlcWs5zthQbXjBm5pUo0LcaoO-MnXsMT9eEuhxUe3jIqpOPF02xuMxpcAhXxw"
                          alt="Indochina Sails Logo"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase font-semibold">Operator</span>
                        <span className="text-sm font-medium text-[#111418] dark:text-white">
                          Indochina Sails
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase font-semibold">Date & Time</span>
                        <span className="text-sm font-medium text-[#111418] dark:text-white">
                          Oct 15, 2025 • 07:00 AM
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase font-semibold">Guests</span>
                        <span className="text-sm font-medium text-[#111418] dark:text-white">
                          2 Pax (English)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase font-semibold">Fee</span>
                        <span className="text-sm font-medium text-[#111418] dark:text-white">
                          2,000,000 VND
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col md:border-l border-gray-100 dark:border-gray-700 md:pl-6 gap-3 justify-center min-w-[200px]">
                  <Button
                    variant="outline"
                    className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-[#111418] dark:text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Eye className="h-5 w-5" />
                    View Details
                  </Button>
                  <span className="text-center text-xs text-green-600 dark:text-green-400 font-medium flex items-center justify-center gap-1">
                    <Verified className="h-4 w-4" />
                    Accepted on Oct 01
                  </span>
                </div>
              </div>

              {/* REJECTED CARD */}
              <div className="group relative flex flex-col md:flex-row gap-6 p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#15202b] opacity-75 hover:opacity-100 transition-opacity">
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          REJECTED
                        </span>
                        <span className="text-xs text-gray-500">Contract #HD-2025-1055</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400">
                        Ninh Binh Excursion
                      </h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700 grayscale">
                        <Image
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSV9R0PUCcBUjZ59gjs1VI5KU9_davJ7ppKUr-Wd4efYYK4wHb4jIbSN4yYpiw-NjMcr7knZczR0kv4TULb3HVPnagO8u3b8bjqJzz8c05TJV1-nrbCz1WRnsmYKv9NcSL9XZPYkJ8pLXGf-feIv98rY3LkoL8dULVrZD8ChflPMpP5ZwfhAHSwJQAnDOzyi9IOQSoXLENXBOV46YRGXW2_h-d5R7pXmyvwiz-hn2_czlZ5d6gIGwZfa1GBWDE-0R-sHVdOSz5fw"
                          alt="Viet Travel Logo"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase font-semibold">Operator</span>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Viet Travel
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase font-semibold">Date & Time</span>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Oct 20, 2025
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase font-semibold">Guests</span>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">6 Pax</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase font-semibold">Fee</span>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          1,800,000 VND
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col md:border-l border-gray-200 dark:border-gray-700 md:pl-6 gap-3 justify-center min-w-[200px]">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
                    disabled
                  >
                    View Reason
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer / Legal Note */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                © 2025 Tour Guide Portal. Compliant with Vietnam Tourism Law 2025. All assignments
                are legally binding contracts once accepted.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

