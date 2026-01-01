import Link from "next/link";
import Image from "next/image";
import {
  Globe,
  Bell,
  Download,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Calendar,
  ArrowRight,
  Badge,
  Headphones,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
export default function ApplicationManagementOverviewPage() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-surface-dark px-10 py-3 bg-background-dark">
        <div className="flex items-center gap-4 text-white">
          <div className="size-8 flex items-center justify-center text-primary">
            <Globe className="h-8 w-8" />
          </div>
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            TourOp Platform
          </h2>
        </div>
        <div className="flex flex-1 justify-end gap-8">
          <div className="hidden md:flex items-center gap-9">
            <Link
              href="#"
              className="text-white text-sm font-medium leading-normal hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="#"
              className="text-white text-sm font-medium leading-normal hover:text-primary transition-colors"
            >
              Tours
            </Link>
            <Link
              href="#"
              className="text-white text-sm font-medium leading-normal text-primary"
            >
              Applications
            </Link>
            <Link
              href="#"
              className="text-white text-sm font-medium leading-normal hover:text-primary transition-colors"
            >
              Guides
            </Link>
            <Link
              href="#"
              className="text-white text-sm font-medium leading-normal hover:text-primary transition-colors"
            >
              Reports
            </Link>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-surface-dark text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 hover:bg-[#343e49] transition-colors"
          >
            <Bell className="h-5 w-5 text-white" />
          </Button>
          <div className="relative w-10 h-10 rounded-full ring-2 ring-surface-dark overflow-hidden">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMuzfEAtZyebL8o1mPSBgek-VPpmXMneNk2qqiBuR_3ALQZWTIVfwsUmTzTf13VDKonfZSjcb1XQuCup6gcRWJNQe7OeopHW4EzZMoXm8NG9JWjY6TYbsHV-Qdjtrz4b5qf3i1T7c4ax1IIoSaydUtqGtEV3K6lquef-z3ouFAZ1DM-lVvf14zGV3oEpcRbLzNlyHOM5jj6u_cpVfWHFiquY1zfGk9rA-sGiPbyBpZMEOdmWRkcQMnZ87wf5yc4H5R4IsNPx03_A"
              alt="User profile avatar showing a smiling person"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex flex-1 justify-center py-8 px-4 md:px-10 lg:px-20">
        <div className="flex flex-col max-w-[1200px] flex-1 gap-6">
          {/* Page Heading */}
          <div className="flex flex-wrap justify-between items-end gap-4">
            <div className="flex min-w-72 flex-col gap-3">
              <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                Quản lý Đăng ký
              </h1>
              <p className="text-text-secondary text-base font-normal leading-normal max-w-2xl">
                Manage incoming tour guide applications compliant with Vietnam Tourism Law 2025.
                Review licenses, contracts, and guide profiles.
              </p>
            </div>
            <Button className="flex items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-surface-dark hover:bg-[#343e49] text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors gap-2">
              <Download className="h-5 w-5" />
              <span className="truncate">Export Report</span>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pending Card (Highlighted) */}
            <div className="flex flex-col gap-2 rounded-xl p-6 border border-primary/40 bg-primary/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Clock className="h-16 w-16 text-primary" />
              </div>
              <p className="text-primary text-base font-medium leading-normal flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                Đang chờ duyệt (Pending)
              </p>
              <p className="text-white tracking-tight text-3xl font-bold leading-tight">12</p>
              <p className="text-primary/80 text-sm font-medium leading-normal">+3 new today</p>
            </div>

            {/* Accepted Card */}
            <div className="flex flex-col gap-2 rounded-xl p-6 border border-border-dark bg-surface-dark/50">
              <p className="text-text-secondary text-base font-medium leading-normal">
                Đã chấp nhận (Accepted)
              </p>
              <p className="text-white tracking-tight text-3xl font-bold leading-tight">45</p>
              <p className="text-[#0bda5b] text-sm font-medium leading-normal flex items-center gap-1">
                <TrendingUp className="h-4 w-4" /> 12% vs last month
              </p>
            </div>

            {/* Rejected Card */}
            <div className="flex flex-col gap-2 rounded-xl p-6 border border-border-dark bg-surface-dark/50">
              <p className="text-text-secondary text-base font-medium leading-normal">
                Đã từ chối (Rejected)
              </p>
              <p className="text-white tracking-tight text-3xl font-bold leading-tight">8</p>
              <p className="text-text-secondary text-sm font-medium leading-normal">
                Most common reason: Invalid License
              </p>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="flex flex-col lg:flex-row gap-4 bg-surface-dark p-4 rounded-xl border border-border-dark">
            {/* Search */}
            <div className="flex-1 min-w-[240px]">
              <label className="relative block">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
                  <Search className="h-5 w-5" />
                </span>
                <Input
                  className="block w-full rounded-lg border-none bg-background-dark py-2.5 pl-10 pr-3 text-white placeholder:text-text-secondary focus:ring-2 focus:ring-primary text-sm"
                  placeholder="Search by Guide Name or ID..."
                  type="text"
                />
              </label>
            </div>
            {/* Dropdowns */}
            <div className="flex flex-wrap gap-3">
              <div className="relative min-w-[180px]">
                <Select>
                  <SelectTrigger className="block w-full appearance-none rounded-lg border-none bg-background-dark py-2.5 pl-3 pr-10 text-white text-sm focus:ring-2 focus:ring-primary cursor-pointer">
                    <SelectValue placeholder="All Tours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tours</SelectItem>
                    <SelectItem value="hanoi">Hanoi Street Food Tour</SelectItem>
                    <SelectItem value="halong">Ha Long Bay 2D1N</SelectItem>
                    <SelectItem value="danang">Da Nang City Tour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative min-w-[160px]">
                <Select>
                  <SelectTrigger className="block w-full appearance-none rounded-lg border-none bg-background-dark py-2.5 pl-3 pr-10 text-white text-sm focus:ring-2 focus:ring-primary cursor-pointer">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative min-w-[160px]">
                <Button
                  variant="outline"
                  className="flex w-full items-center justify-between rounded-lg bg-background-dark py-2.5 px-3 text-white text-sm hover:bg-[#1a222b] transition-colors border-none focus:ring-2 focus:ring-primary"
                >
                  <span className="text-text-secondary truncate">Date Range</span>
                  <Calendar className="h-5 w-5 text-text-secondary" />
                </Button>
              </div>
            </div>
          </div>

          {/* Applications Table */}
          <div className="flex flex-col gap-4">
            <div className="overflow-x-auto rounded-xl border border-border-dark">
              <table className="w-full text-sm text-left">
                <ther>
                  <tr className="bg-surface-dark uppercase text-xs font-semibold text-text-secondary hover:bg-surface-dark">
                    <th className="px-6 py-4">Application ID</th>
                    <th className="px-6 py-4">Tour Information</th>
                    <th className="px-6 py-4">Guide Profile</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Applied Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </ther>
                <tbody className="divide-y divide-border-dark bg-background-dark">
                  {/* Row 1 */}
                  <tr className="hover:bg-surface-dark/40 transition-colors group">
                    <td className="px-6 py-4 font-mono text-text-secondary">
                      #APP-2025-001
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFqYtz_zp_ybf6wxhej-Bi9CaYZTxoiZ0tDVOrporrREmCC6nDdlqCX4NmzbqmAimSoY-iNdwwYIK0dJAN4Wu_UUOvA3AJ3gfdLT_F397LQDMRIBAwTsIQ34_x9jvsgwntb5XuZtIDriK-EO27e0ZKhi1U2j1_YSRQsA_NT6MQ2lSV6xdtyUp8vK-C_bTVRgbJ4JYA8UmBEXeQzbYJssrOIf3RBGLh75BJyGZ5C7XC-WTWbCWZJdhljYi3rfPEUbna0685YeXLgQ"
                            alt="Hanoi street scene with food vendors"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-white">Hanoi Street Food Tour</div>
                          <div className="text-xs text-text-secondary">4 Hours • Morning</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                          N
                        </div>
                        <span className="font-medium">Nguyen Van A</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400 border border-blue-500/20">
                        <Badge className="h-[14px] w-[14px]" />
                        Main Guide
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">Oct 24, 2025</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-500 ring-1 ring-inset ring-yellow-500/20">
                        <span className="size-1.5 rounded-full bg-yellow-500"></span>
                        PENDING
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="link"
                        className="text-primary hover:text-white transition-colors font-semibold text-sm inline-flex items-center gap-1 p-0 h-auto"
                      >
                        Xem chi tiết <ArrowRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-surface-dark/40 transition-colors group">
                    <td className="px-6 py-4 font-mono text-text-secondary">
                      #APP-2025-002
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCw24nQiOkyWxDcWnbli52tdtkNLtvDpo4fzjis6kel91wcDixsuHwWyhdDjRxrEa2_mZxTvXJFBXSBozJucSPGj4epZHJQWmf8g42QnfNvfNDE6Z2YfKGonPJesMgAdEhHQFVWcpIK0h21rT8bcPHQA5GAfN2sli8nf9CFoF61M-YAysXmjeEo7hSzT9FWbXbccL4U9B9H0Nq_yR2FreUklL-6ZDdr-9NfaqCWD1KwxaYOKSOcMGfRxxIdZ49caXJEL_Qvf--dHQ"
                            alt="Ha Long Bay limestone karsts on water"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-white">Ha Long Bay 2D1N</div>
                          <div className="text-xs text-text-secondary">Overnight Cruise</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold">
                          T
                        </div>
                        <span className="font-medium">Tran Thi B</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded bg-purple-500/10 px-2 py-1 text-xs font-medium text-purple-400 border border-purple-500/20">
                        <Headphones className="h-[14px] w-[14px]" />
                        Sub Guide
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">Oct 23, 2025</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-500 ring-1 ring-inset ring-green-500/20">
                        <span className="size-1.5 rounded-full bg-green-500"></span>
                        ACCEPTED
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="link"
                        className="text-text-secondary hover:text-white transition-colors font-semibold text-sm inline-flex items-center gap-1 p-0 h-auto"
                      >
                        Xem chi tiết <ArrowRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-surface-dark/40 transition-colors group">
                    <td className="px-6 py-4 font-mono text-text-secondary">
                      #APP-2025-003
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAk_n6jcN87dcZQT1wA3B1VaCA04owKa3pjnmIVA0WihjauN-hgHgZRgXL6l3ahrpysuGC8sZwmNBVaLdG2_ufuQZ7CFV3QKa1_aURfulFfJ7Oo3ejT_2cw6ehItYAdKYXnXNw8wr-HZkFQKUWWxYJ2GgZSlVOuPQOkAN4hVrzZRk86-wYaN45xqlVTJNkP77XcmgCtip9TAxe1lb0VBTwFofdaWHMsYImaTa5KJC3Qfkfp5Mch4px2RgnE7s6bYKu8-mv56lHQyg"
                            alt="Golden Bridge in Da Nang held by giant stone hands"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-white">Da Nang City Tour</div>
                          <div className="text-xs text-text-secondary">Full Day</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-xs font-bold">
                          L
                        </div>
                        <span className="font-medium">Le Van C</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400 border border-blue-500/20">
                        <Badge className="h-[14px] w-[14px]" />
                        Main Guide
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">Oct 22, 2025</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-500 ring-1 ring-inset ring-red-500/20">
                        <span className="size-1.5 rounded-full bg-red-500"></span>
                        REJECTED
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="link"
                        className="text-text-secondary hover:text-white transition-colors font-semibold text-sm inline-flex items-center gap-1 p-0 h-auto"
                      >
                        Xem chi tiết <ArrowRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>

                  {/* Row 4 */}
                  <tr className="hover:bg-surface-dark/40 transition-colors group">
                    <td className="px-6 py-4 font-mono text-text-secondary">
                      #APP-2025-004
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-HJWKD41kW2ZKONLpNWXBvzPct75Y5VzH9zNtu-UZmkUWxbYkK6qO5NMcTXAWbCaLslv4LaPsu3tu9sGUTNUfrd5ucfwUSJ9ITyd5oU0GMkkExposw-6IQVlGAboWXOkJPocMHTiCkr2lusBz-2I_5qktJy_E3NadOTQIzRgKa-o9D3wF5ZyqBk7ykYY2ge2ahBQCRaPAjD5QkqK2SqDOuHdSLuin9MkIckRk4DENrEI_FKqMfdVQUPn7phGEof10Fph81u3N1Q"
                            alt="Hanoi street scene with food vendors"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-white">Hanoi Street Food Tour</div>
                          <div className="text-xs text-text-secondary">4 Hours • Morning</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 text-xs font-bold">
                          P
                        </div>
                        <span className="font-medium">Pham Minh D</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400 border border-blue-500/20">
                        <Badge className="h-[14px] w-[14px]" />
                        Main Guide
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">Oct 21, 2025</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-500 ring-1 ring-inset ring-yellow-500/20">
                        <span className="size-1.5 rounded-full bg-yellow-500"></span>
                        PENDING
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="link"
                        className="text-primary hover:text-white transition-colors font-semibold text-sm inline-flex items-center gap-1 p-0 h-auto"
                      >
                        Xem chi tiết <ArrowRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>

                  {/* Row 5 */}
                  <tr className="hover:bg-surface-dark/40 transition-colors group">
                    <td className="px-6 py-4 font-mono text-text-secondary">
                      #APP-2025-005
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJlSAbidKR-FftVojiG25tUDS6IffGckLIUlzGC0oyrKDJl2Aqv3iX38S4jfhGB1_kzCDOg9YuGBDkimGAzstdTCgHL8hX3jlwVfDCtNTlONirqSuplY36x9-fCfizNEyMjSnlzSxrmwtuI9RFN2NCe19i9n3kH4Ry5Ngf0zCvjbTdUqZJ6B7ZPbzRX9XUZ6Fcf_nyKH9UqzSGIT5mgPPFybL2xMzIfWphNcdL-f8oq6pVYJwdr_Xq35qt_6pcsz1ArZi7m1JO5w"
                            alt="Wooden boat on the Mekong Delta"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-white">Mekong Delta Explorer</div>
                          <div className="text-xs text-text-secondary">Full Day</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 text-xs font-bold">
                          H
                        </div>
                        <span className="font-medium">Hoang Thi E</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded bg-purple-500/10 px-2 py-1 text-xs font-medium text-purple-400 border border-purple-500/20">
                        <Headphones className="h-[14px] w-[14px]" />
                        Sub Guide
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">Oct 20, 2025</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-500 ring-1 ring-inset ring-yellow-500/20">
                        <span className="size-1.5 rounded-full bg-yellow-500"></span>
                        PENDING
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="link"
                        className="text-primary hover:text-white transition-colors font-semibold text-sm inline-flex items-center gap-1 p-0 h-auto"
                      >
                        Xem chi tiết <ArrowRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2">
              <div className="text-sm text-text-secondary">
                Showing <span className="font-medium text-white">1</span> to{" "}
                <span className="font-medium text-white">5</span> of{" "}
                <span className="font-medium text-white">65</span> results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex items-center justify-center rounded-lg border border-border-dark bg-background-dark px-3 py-2 text-sm font-medium text-white hover:bg-surface-dark disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button className="flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-blue-600">
                  1
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center justify-center rounded-lg border border-border-dark bg-background-dark px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-dark hover:text-white"
                >
                  2
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center justify-center rounded-lg border border-border-dark bg-background-dark px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-dark hover:text-white"
                >
                  3
                </Button>
                <span className="flex items-center justify-center px-2 text-text-secondary">...</span>
                <Button
                  variant="outline"
                  className="flex items-center justify-center rounded-lg border border-border-dark bg-background-dark px-3 py-2 text-sm font-medium text-white hover:bg-surface-dark"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



