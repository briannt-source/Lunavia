import Link from "next/link";
import Image from "next/image";
import {
  Globe,
  Bell,
  MessageSquare,
  PlusCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  X,
  Eye,
  Info,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export default function MyApplicationsPageGuideView() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display min-h-screen flex flex-col">
      {/* Top Navigation */}
      <div className="relative flex w-full flex-col bg-surface-light dark:bg-[#111418] border-b border-gray-200 dark:border-[#283039]">
        <div className="layout-container flex h-full grow flex-col">
          <div className="flex flex-1 justify-center">
            <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 w-full">
              <header className="flex items-center justify-between whitespace-nowrap px-4 md:px-10 py-3">
                <div className="flex items-center gap-4 text-slate-900 dark:text-white">
                  <div className="size-8 text-primary">
                    <Globe className="h-8 w-8" />
                  </div>
                  <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                    GuidePortal
                  </h2>
                </div>
                <div className="flex flex-1 justify-end gap-8">
                  <div className="hidden md:flex items-center gap-9">
                    <Link
                      href="#"
                      className="text-slate-600 dark:text-gray-300 hover:text-primary dark:hover:text-white text-sm font-medium leading-normal transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="#"
                      className="text-slate-600 dark:text-gray-300 hover:text-primary dark:hover:text-white text-sm font-medium leading-normal transition-colors"
                    >
                      Find Tours
                    </Link>
                    <Link
                      href="#"
                      className="text-primary dark:text-white text-sm font-bold leading-normal border-b-2 border-primary pb-0.5"
                    >
                      My Applications
                    </Link>
                    <Link
                      href="#"
                      className="text-slate-600 dark:text-gray-300 hover:text-primary dark:hover:text-white text-sm font-medium leading-normal transition-colors"
                    >
                      Profile
                    </Link>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex items-center justify-center rounded-lg h-10 w-10 bg-gray-100 dark:bg-[#283039] text-slate-600 dark:text-white hover:bg-gray-200 dark:hover:bg-[#3b4754] transition-colors"
                    >
                      <Bell className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex items-center justify-center rounded-lg h-10 w-10 bg-gray-100 dark:bg-[#283039] text-slate-600 dark:text-white hover:bg-gray-200 dark:hover:bg-[#3b4754] transition-colors"
                    >
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                    <div className="relative w-10 h-10 rounded-full ml-2 border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <Image
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYfV89ohJafHvuJRpFiOQYMEUhfXSQXDvo_qREcsGTSUiKkNvLO-sM26wbTorTMOYLZ-9x0zsspifwBzfouvU7JmqztsQolGOar-kiXWXh07VIB2WSj-6CQfiqBn88XJsYYvyk-jsRUGNsPVv76zn0IgBI-NsDKoYM4Vur1sRUdV-oM6DixdcXZj7-BznsLDI8jN5IZxsVECJ6ye95XjFbCY9mnFnatBn1R78qXaf5MXQhxjp5R5M50V5KvyyIOcSTE9PW1SWMoA"
                        alt="User profile picture"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </header>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex justify-center py-8 px-4 md:px-10">
        <div className="w-full max-w-[1200px] flex flex-col gap-8">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">
                Danh sách ứng tuyển
              </h1>
              <p className="text-slate-500 dark:text-[#9dabb9] text-base font-normal">
                Manage your submitted tour applications and track their status.
              </p>
            </div>
            <Button className="bg-primary hover:bg-blue-600 text-white font-bold py-2.5 px-5 rounded-lg text-sm flex items-center gap-2 transition-colors shadow-lg shadow-primary/20">
              <PlusCircle className="h-5 w-5" />
              Find New Tours
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-surface-light dark:bg-[#1f2937] border border-gray-200 dark:border-[#3b4754] shadow-sm">
              <div className="flex justify-between items-center">
                <p className="text-slate-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                  Total Applied
                </p>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <p className="text-slate-900 dark:text-white text-3xl font-bold mt-2">24</p>
              <div className="text-green-600 dark:text-green-400 text-xs font-medium flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                +2 this week
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-xl p-6 bg-surface-light dark:bg-[#1f2937] border border-gray-200 dark:border-[#3b4754] shadow-sm">
              <div className="flex justify-between items-center">
                <p className="text-slate-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                  Pending Approval
                </p>
                <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-600 dark:text-yellow-400">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <p className="text-slate-900 dark:text-white text-3xl font-bold mt-2">5</p>
              <div className="text-slate-500 dark:text-gray-500 text-xs font-medium">
                Waiting for operator response
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-xl p-6 bg-surface-light dark:bg-[#1f2937] border border-gray-200 dark:border-[#3b4754] shadow-sm">
              <div className="flex justify-between items-center">
                <p className="text-slate-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                  Accepted
                </p>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <p className="text-slate-900 dark:text-white text-3xl font-bold mt-2">12</p>
              <div className="text-slate-500 dark:text-gray-500 text-xs font-medium">~50% acceptance rate</div>
            </div>
          </div>

          {/* Filters & Actions Bar */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-end lg:items-center bg-surface-light dark:bg-[#1f2937] p-4 rounded-xl border border-gray-200 dark:border-[#3b4754] shadow-sm">
            {/* Search */}
            <div className="w-full lg:w-auto flex-1 max-w-lg">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg leading-5 bg-white dark:bg-[#283039] text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                  placeholder="Search by tour name or operator..."
                  type="text"
                />
              </div>
            </div>
            {/* Filters */}
            <div className="flex flex-wrap gap-2 w-full lg:w-auto items-center">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                <Button className="whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white shadow-sm">
                  All Statuses
                </Button>
                <Button
                  variant="outline"
                  className="whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-[#283039] text-slate-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3b4754] transition-colors border border-transparent dark:border-gray-700"
                >
                  Pending
                </Button>
                <Button
                  variant="outline"
                  className="whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-[#283039] text-slate-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3b4754] transition-colors border border-transparent dark:border-gray-700"
                >
                  Accepted
                </Button>
                <Button
                  variant="outline"
                  className="whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-[#283039] text-slate-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3b4754] transition-colors border border-transparent dark:border-gray-700"
                >
                  Rejected
                </Button>
              </div>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2 hidden lg:block"></div>
              <Button
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-[#283039] border border-gray-200 dark:border-gray-700 text-slate-700 dark:text-white hover:bg-gray-50 dark:hover:bg-[#3b4754] transition-colors ml-auto lg:ml-0"
              >
                <Filter className="h-[18px] w-[18px]" />
                More Filters
              </Button>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-surface-light dark:bg-[#1f2937] rounded-xl border border-gray-200 dark:border-[#3b4754] overflow-hidden shadow-sm flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <ther>
                  <tr className="border-b border-gray-200 dark:border-[#3b4754] bg-gray-50 dark:bg-[#283039] hover:bg-gray-50 dark:hover:bg-[#283039]">
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400 w-1/3">
                      Tour Name
                    </th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                      Operator
                    </th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                      Role
                    </th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                      Applied Date
                    </th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                      Status
                    </th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400 text-right">
                      Actions
                    </th>
                  </tr>
                </ther>
                <tbody className="divide-y divide-gray-200 dark:divide-[#3b4754]">
                  {/* Row 1: PENDING */}
                  <tr className="group hover:bg-gray-50 dark:hover:bg-[#283039] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-lg shrink-0 border border-gray-200 dark:border-gray-700 overflow-hidden">
                          <Image
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9ucJm5mec4Cv-5DCMl4KXWRCTEdnhwKdT5fDImxzec_65NcGzy1d2GT495MyC15JFOMocyLcDlqGZ3Gs-dl1SOsOAfGjN3kv13PK0uF_mC6i_YDJws8I_kwiZu3X7KvHhJI7zq5_jvZmDI7j_9qSrbjp1i2ZDW_mG4bbp_chsaQOImaPWf4OjhjtFj746B4fdFYqK09hY9q1HeiLAfwmYgLQnPvWQxp9G63uUf_nUa7cZzdWfBh39ZqCQD9D6B9ROpINpaR3yNA"
                            alt="Ha Long Bay landscape with limestone karsts"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-slate-900 dark:text-white font-semibold text-sm">
                            Amazing Ha Long Bay 3D2N
                          </p>
                          <p className="text-slate-500 dark:text-gray-400 text-xs mt-0.5">
                            Start: Oct 15, 2023
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 text-xs font-bold">
                          V
                        </div>
                        <span className="text-slate-700 dark:text-gray-300 text-sm">VietTravel Corp</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-slate-700 dark:text-gray-300 text-sm font-medium">Main Guide</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-slate-500 dark:text-gray-400 text-sm">Oct 01, 2023</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                        Pending
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Hủy ứng tuyển (Cancel)"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-primary dark:hover:text-primary transition-colors p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </Button>
                      </div>
                    </td>
                  </tr>

                  {/* Row 2: ACCEPTED */}
                  <tr className="group hover:bg-gray-50 dark:hover:bg-[#283039] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-lg shrink-0 border border-gray-200 dark:border-gray-700 overflow-hidden">
                          <Image
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7plA1Cn1IXLKLw69xMjrb5rMm1Cnz1L9sn0qT6t_Y-MstbfCfQaKqLnedP6nhIeR1Ea9sQh8z9cZcxNQ1Ks8KB-1eNgd_5s0VCkUeLodiT4OZUryp7_oM5Kd5h5aRckpc51nWu8d0Z9npwjF9w7yf3nvJq585fS9l1hnBe8dW6vGXJ0JyYsJRKWAawx951Bmy192dmQwpjKmJY30OgqBT4kleC7XjVsAzknRRzbf9B_TtdptmKRClu7MEvOmZGFVhHu1AJpTCvw"
                            alt="Hoi An ancient town lanterns"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-slate-900 dark:text-white font-semibold text-sm">
                            Hoi An Ancient Town Walking Tour
                          </p>
                          <p className="text-slate-500 dark:text-gray-400 text-xs mt-0.5">
                            Start: Oct 20, 2023
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-700 dark:text-orange-300 text-xs font-bold">
                          S
                        </div>
                        <span className="text-slate-700 dark:text-gray-300 text-sm">Saigontourist</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-slate-700 dark:text-gray-300 text-sm font-medium">Sub Guide</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-slate-500 dark:text-gray-400 text-sm">Sep 28, 2023</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                        Accepted
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-200 dark:text-gray-700 cursor-not-allowed p-1.5"
                          disabled
                          title="Cannot cancel"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-primary dark:hover:text-primary transition-colors p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </Button>
                      </div>
                    </td>
                  </tr>

                  {/* Row 3: REJECTED */}
                  <tr className="group hover:bg-gray-50 dark:hover:bg-[#283039] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-lg shrink-0 border border-gray-200 dark:border-gray-700 overflow-hidden">
                          <Image
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyVA3sC0phLu_envoimMQK7U7NsFXY3_n0M39DELhdeGwB0v-BgHpNETS5AptaCGY_VLRF4FwjPLPO7m1jDRZaln76vLrGUmZ2gXhatUtbkXWbxu-GOjMJiVFGfl6sYvOvbhBIF89dSDgizGCKUlMrtyIcAwn_UvzmGDozwSq9DMznL1X3Nef-TXIf6cnqxkp2HlCO3r70O_K8ITvSjWS0DXnaETganYt5voTnTxlXw6tUnliaHsEOnMhT_fpb9-svjSyCyTqcIA"
                            alt="Ninh Binh Trang An river landscape"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-slate-900 dark:text-white font-semibold text-sm">
                            Ninh Binh: Trang An & Bai Dinh
                          </p>
                          <p className="text-slate-500 dark:text-gray-400 text-xs mt-0.5">
                            Start: Nov 05, 2023
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-700 dark:text-purple-300 text-xs font-bold">
                          H
                        </div>
                        <span className="text-slate-700 dark:text-gray-300 text-sm">Hanoi Tours</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-slate-700 dark:text-gray-300 text-sm font-medium">Main Guide</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-slate-500 dark:text-gray-400 text-sm">Sep 25, 2023</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                        Rejected
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-200 dark:text-gray-700 cursor-not-allowed p-1.5"
                          disabled
                          title="Cannot cancel"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-primary dark:hover:text-primary transition-colors p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </Button>
                      </div>
                    </td>
                  </tr>

                  {/* Row 4: PENDING */}
                  <tr className="group hover:bg-gray-50 dark:hover:bg-[#283039] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-lg shrink-0 border border-gray-200 dark:border-gray-700 overflow-hidden">
                          <Image
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6lNkIIcuHPQY9UMpBvt0FzICr6crmtXHeegULlXdDZcijZchmGO14etszkvYLgcWs9bqzYxN1-O0jYDf9egiUE3EMiWEbAwOA6bgiQ-syEAEjE57-tVZ0V46AvM8sP9lDhSRfU_BiEUpQvSyl3T1RokCf1CvcSJiOIcHQ_BQ31UADUZNgXFOB8tAbm9nDC-TepoabsSaAKodMk5GhYWfvpF5_N-QbTY9NlVHTVKICBJcAu8Qb5thJjXLwpbbWLV155aLUdCMDCA"
                            alt="Mekong Delta river boat"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-slate-900 dark:text-white font-semibold text-sm">
                            Mekong Delta 1 Day Tour
                          </p>
                          <p className="text-slate-500 dark:text-gray-400 text-xs mt-0.5">
                            Start: Oct 18, 2023
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-700 dark:text-teal-300 text-xs font-bold">
                          K
                        </div>
                        <span className="text-slate-700 dark:text-gray-300 text-sm">Kim Travel</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-slate-700 dark:text-gray-300 text-sm font-medium">Sub Guide</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-slate-500 dark:text-gray-400 text-sm">Oct 05, 2023</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                        Pending
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Hủy ứng tuyển (Cancel)"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-primary dark:hover:text-primary transition-colors p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-[#3b4754] bg-white dark:bg-[#1f2937]">
              <p className="text-sm text-slate-500 dark:text-gray-400">
                Showing <span className="font-medium text-slate-900 dark:text-white">1</span> to{" "}
                <span className="font-medium text-slate-900 dark:text-white">4</span> of{" "}
                <span className="font-medium text-slate-900 dark:text-white">24</span> results
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="px-3 py-1 rounded-md border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-[#283039] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button className="px-3 py-1 rounded-md bg-primary text-white text-sm font-medium hover:bg-blue-600">
                  1
                </Button>
                <Button
                  variant="outline"
                  className="px-3 py-1 rounded-md border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-[#283039]"
                >
                  2
                </Button>
                <Button
                  variant="outline"
                  className="px-3 py-1 rounded-md border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-[#283039]"
                >
                  3
                </Button>
                <span className="px-2 text-slate-400 dark:text-gray-500">...</span>
                <Button
                  variant="outline"
                  className="px-3 py-1 rounded-md border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-[#283039]"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
            <Info className="text-blue-600 dark:text-blue-400 shrink-0 h-5 w-5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-semibold mb-1">Compliance Notice (Tourism Law 2025)</p>
              <p className="opacity-90">
                Please ensure your &quot;Thẻ hướng dẫn viên&quot; (Guide License) is up to date in your
                profile. Operators are required to verify your license before accepting applications.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}




