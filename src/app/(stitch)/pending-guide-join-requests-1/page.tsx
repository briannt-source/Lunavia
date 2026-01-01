import Link from "next/link";
import Image from "next/image";
import {
  Grid3x3,
  MapPin,
  Users,
  UserPlus,
  Settings,
  LogOut,
  Menu,
  Bell,
  HelpCircle,
  Download,
  Search,
  Filter,
  CheckCircle2,
  X,
  Verified,
  AlertTriangle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function PendingGuideJoinRequests1Page() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display">
      <div className="flex h-screen w-full overflow-hidden">
        {/* Side Navigation */}
        <aside className="flex w-72 flex-col justify-between border-r border-[#283039] bg-[#111418] p-4 hidden lg:flex">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 px-2">
              <div className="relative size-10 rounded-full overflow-hidden">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkh_iZmeeKvlnD_KIg8O2yZc308ZL2k2wSfLAWOreWl8B58_9wNPnP0qyfdUz_-wDg796wwuEGJtNrsmOcW40B9LQy_fkJJAJeMjHFjSkEnv8s9GaLMGEhUkPHskvKligXNHTORPaGEdsefWS8QdXpboIm9HyV3jN_MVj1tXCREEXLhLHDfzeUuhtkEjxF8WO5Yz4fPna8E5u5qOXN5F5DpfFjx2HGEhjXcgyNnKOIP5MgXf1MV7DimfwHr8XCwYJStsca5_7wrQ"
                  alt="VNTravel B2B logo abstract blue shape"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-white text-base font-bold leading-normal">VNTravel B2B</h1>
                <p className="text-[#9dabb9] text-xs font-normal leading-normal">Tour Operator Portal</p>
              </div>
            </div>
            <div className="h-px bg-[#283039] w-full my-2"></div>
            <nav className="flex flex-col gap-2">
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 text-[#9dabb9] hover:text-white hover:bg-[#283039] rounded-lg transition-colors"
              >
                <Grid3x3 className="h-6 w-6" />
                <p className="text-sm font-medium leading-normal">Dashboard</p>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 text-[#9dabb9] hover:text-white hover:bg-[#283039] rounded-lg transition-colors"
              >
                <MapPin className="h-6 w-6" />
                <p className="text-sm font-medium leading-normal">My Tours</p>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 text-[#9dabb9] hover:text-white hover:bg-[#283039] rounded-lg transition-colors"
              >
                <Users className="h-6 w-6" />
                <p className="text-sm font-medium leading-normal">Guides Roster</p>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/20 text-primary"
              >
                <UserPlus className="h-6 w-6 fill-primary" />
                <p className="text-sm font-medium leading-normal">Join Requests</p>
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  4
                </span>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 text-[#9dabb9] hover:text-white hover:bg-[#283039] rounded-lg transition-colors"
              >
                <Settings className="h-6 w-6" />
                <p className="text-sm font-medium leading-normal">Settings</p>
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              className="flex items-center gap-3 px-3 py-2 text-[#9dabb9] hover:text-white cursor-pointer"
            >
              <LogOut className="h-6 w-6" />
              <p className="text-sm font-medium leading-normal">Sign Out</p>
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex flex-1 flex-col overflow-y-auto bg-[#111418] relative">
          {/* Top Navigation */}
          <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-[#283039] bg-[#111418]/95 px-6 backdrop-blur">
            <div className="flex items-center gap-4 text-white lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5 cursor-pointer" />
              </Button>
            </div>
            <div className="flex flex-1 items-center justify-end gap-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[#9dabb9] hover:bg-[#283039] transition-colors"
                >
                  <Bell className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[#9dabb9] hover:bg-[#283039] transition-colors"
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </div>
              <div className="h-8 w-px bg-[#283039]"></div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end hidden sm:flex">
                  <p className="text-sm font-medium text-white">Sarah Jenkins</p>
                  <p className="text-xs text-[#9dabb9]">Admin</p>
                </div>
                <div className="relative w-9 h-9 rounded-full cursor-pointer ring-2 ring-[#283039] overflow-hidden">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_BCQQN3ISgLN-xoiGXJ6h_aiLI-YPiHrh8yHrft7JtAFTeqAKDdgkPvAk7UhuGfj9cTidq82bCgKXcYY4PhtzXa55Yvp5DcMg5-Oh_6IHJPLZparpxzEvS_b4Hg_xiLK9q7ZJ-uw8UXsTpHeblsgDlLUg2UK8oRV1LQWe-pKM4ADzpD2Wo9STU5IQ2KOUJGWT9FtRiTwMjBxLHPR9Q8O47IL6mfijZ2CCg8kQRNxBTP7CG_LJl8C5PxbDP68iFlYjX89hSQZp-Q"
                    alt="User profile picture woman smiling"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </header>

          <div className="flex flex-col gap-6 p-6 md:p-10 max-w-[1400px] mx-auto w-full">
            {/* Page Heading */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-2">
                <h1 className="text-white text-3xl font-bold leading-tight tracking-tight">Yêu cầu tham gia</h1>
                <p className="text-[#9dabb9] text-base font-normal leading-normal">
                  Review and manage incoming join requests from Tour Guides (Compliance: VN Tourism Law
                  2025).
                </p>
              </div>
              <div className="flex gap-3">
                <Button className="flex items-center justify-center rounded-lg bg-[#283039] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#323b46] transition-colors">
                  <Download className="h-5 w-5 mr-2" />
                  Export List
                </Button>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 items-center bg-[#1a1f26] p-4 rounded-xl border border-[#283039]">
              <div className="md:col-span-5 lg:col-span-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9dabb9]" />
                <Input
                  className="w-full rounded-lg bg-[#283039] border-none py-2.5 pl-10 pr-4 text-white placeholder:text-[#9dabb9] focus:ring-1 focus:ring-primary text-sm"
                  placeholder="Search by guide name, license number..."
                  type="text"
                />
              </div>
              <div className="md:col-span-7 lg:col-span-6 flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                <Button className="whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
                  All Requests
                </Button>
                <Button
                  variant="outline"
                  className="whitespace-nowrap rounded-lg bg-[#283039] px-4 py-2 text-sm font-medium text-[#9dabb9] hover:text-white hover:bg-[#323b46] transition-colors"
                >
                  International License
                </Button>
                <Button
                  variant="outline"
                  className="whitespace-nowrap rounded-lg bg-[#283039] px-4 py-2 text-sm font-medium text-[#9dabb9] hover:text-white hover:bg-[#323b46] transition-colors"
                >
                  Domestic License
                </Button>
                <Button
                  variant="outline"
                  className="whitespace-nowrap rounded-lg bg-[#283039] px-4 py-2 text-sm font-medium text-[#9dabb9] hover:text-white hover:bg-[#323b46] transition-colors"
                >
                  <span className="flex items-center gap-1">
                    Filter <Filter className="h-4 w-4" />
                  </span>
                </Button>
              </div>
            </div>

            {/* Bulk Actions Toolbar (Conditional) */}
            <div className="hidden flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <Checkbox className="h-4 w-4 rounded border-[#9dabb9] bg-[#283039] text-primary focus:ring-0 focus:ring-offset-0" />
                <span className="text-sm font-medium text-primary">2 Selected</span>
              </div>
              <div className="flex gap-3">
                <Button variant="link" className="text-sm font-medium text-white hover:text-red-400">
                  Reject Selected
                </Button>
                <Button variant="link" className="text-sm font-medium text-primary hover:text-primary/80">
                  Accept Selected
                </Button>
              </div>
            </div>

            {/* Request Grid */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {/* Card 1 */}
              <div className="flex flex-col justify-between rounded-xl bg-[#1e2329] p-5 border border-[#283039] hover:border-[#3a4450] transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-4">
                    <div className="relative">
                      <div className="relative h-16 w-16 rounded-full border-2 border-[#283039] overflow-hidden">
                        <Image
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAABnI8PxjrK_lEv1LlDVcCdglipx1UsRciYbVN9Tq2daDifMRe2eDyTOluruAumvp43iuWNa3w4_ss7PHmR2dgd0uUDzh8ze0DntiRxo627RGph4nQBLbLhwO5ysAHQ4vIziY3SQbjqwPiXyFjt5tbPOPZVQaMnK9Tkk_3oW8i8KD6BnLwa913cdvUj39YzuMxBhmNKYqZlrEEQiby378GVaUUMNyqgTUMJYvPY65W8L9zHMCDLuiqwwx0uOBLvFBRV35q9JvbPQ"
                          alt="Portrait of tour guide smiling man"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#1e2329] border border-[#283039]">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Nguyen Van Minh</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Verified className="h-4 w-4 text-green-500" />
                        <p className="text-xs text-[#9dabb9]">Intl. License Valid</p>
                      </div>
                      <p className="text-xs text-[#9dabb9] mt-0.5">ID: 192-845-992</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-semibold text-yellow-500">
                    Pending
                  </span>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9dabb9]">Experience</span>
                    <span className="text-white font-medium">8 Years</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9dabb9]">Languages</span>
                    <div className="flex gap-1">
                      <span className="px-2 py-0.5 rounded bg-[#283039] text-xs text-white">English</span>
                      <span className="px-2 py-0.5 rounded bg-[#283039] text-xs text-white">French</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9dabb9]">Submitted</span>
                    <span className="text-white">2 hours ago</span>
                  </div>
                </div>
                <div className="flex gap-3 mt-auto pt-4 border-t border-[#283039]">
                  <Button className="flex-1 rounded-lg bg-[#283039] px-4 py-2 text-sm font-bold text-[#9dabb9] hover:bg-red-900/20 hover:text-red-500 transition-colors">
                    Reject
                  </Button>
                  <Button className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                    Accept
                  </Button>
                </div>
                <Button
                  variant="link"
                  className="w-full text-center mt-3 text-xs font-medium text-primary hover:underline"
                >
                  View Full Profile
                </Button>
              </div>

              {/* Card 2 */}
              <div className="flex flex-col justify-between rounded-xl bg-[#1e2329] p-5 border border-[#283039] hover:border-[#3a4450] transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-4">
                    <div className="relative">
                      <div className="relative h-16 w-16 rounded-full border-2 border-[#283039] overflow-hidden">
                        <Image
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpXNg_xxA42yVxBJR81QkmErd898qBqXY-B_ZWGhQvjsK0OckjOGP7unm6ZaMHvKjTczmsqT-yt4kvntJuq0HFozZOGT1yvr7annr_ApTsNMsJixGBd4E6FRzARuNVYinVKL8uVibd3qbrWA9kkZ61kAzorgCnAzi2Zx1gZ5-2Wg9eoV40EypIwKBhTJ2vS779jsg8S2PVjuSFN2scNjZLezSQZ2mVv04GOhkzpoYUnQyqHyszyVXSWF2y40MyPTFxkffuwW42SQ"
                          alt="Portrait of tour guide woman outdoors"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#1e2329] border border-[#283039]">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Tran Thi Mai</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Verified className="h-4 w-4 text-green-500" />
                        <p className="text-xs text-[#9dabb9]">Domestic License Valid</p>
                      </div>
                      <p className="text-xs text-[#9dabb9] mt-0.5">ID: 221-554-102</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-semibold text-yellow-500">
                    Pending
                  </span>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9dabb9]">Experience</span>
                    <span className="text-white font-medium">3 Years</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9dabb9]">Languages</span>
                    <div className="flex gap-1">
                      <span className="px-2 py-0.5 rounded bg-[#283039] text-xs text-white">Vietnamese</span>
                      <span className="px-2 py-0.5 rounded bg-[#283039] text-xs text-white">English</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9dabb9]">Submitted</span>
                    <span className="text-white">5 hours ago</span>
                  </div>
                </div>
                <div className="flex gap-3 mt-auto pt-4 border-t border-[#283039]">
                  <Button className="flex-1 rounded-lg bg-[#283039] px-4 py-2 text-sm font-bold text-[#9dabb9] hover:bg-red-900/20 hover:text-red-500 transition-colors">
                    Reject
                  </Button>
                  <Button className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                    Accept
                  </Button>
                </div>
                <Button
                  variant="link"
                  className="w-full text-center mt-3 text-xs font-medium text-primary hover:underline"
                >
                  View Full Profile
                </Button>
              </div>

              {/* Card 3 */}
              <div className="flex flex-col justify-between rounded-xl bg-[#1e2329] p-5 border border-[#283039] hover:border-[#3a4450] transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-4">
                    <div className="relative">
                      <div className="relative h-16 w-16 rounded-full border-2 border-[#283039] overflow-hidden">
                        <Image
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6w8rEK8mFzkP1koBh7ctqtqhgZ6LKh5mwflKsygJGKvJ8Jj2Ep89Kptt9wAX2p4iTT4kDpjfXwSAfBPzfawcO8i9P4_7kGboy8EKcMVIyknpj_1H30sckH65KrzDYdR22XqgwoHtEQiRigQ4TbRJHvOKoHKBOJos72454FgdHVtoojZ0_S7kcrHKv9WUXt9GIobet4WP93jFo64DAlqawctOOD82NTV3rQ8T6Usd0kmOoI3hkwgXW-c4yS1UuPw3JcVn1IfPZ2w"
                          alt="Portrait of tour guide man glasses"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Le Quoc Hung</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <p className="text-xs text-[#9dabb9]">License Expiring Soon</p>
                      </div>
                      <p className="text-xs text-[#9dabb9] mt-0.5">ID: 882-123-441</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-semibold text-yellow-500">
                    Pending
                  </span>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9dabb9]">Experience</span>
                    <span className="text-white font-medium">12 Years</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9dabb9]">Languages</span>
                    <div className="flex gap-1">
                      <span className="px-2 py-0.5 rounded bg-[#283039] text-xs text-white">Mandarin</span>
                      <span className="px-2 py-0.5 rounded bg-[#283039] text-xs text-white">English</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9dabb9]">Submitted</span>
                    <span className="text-white">1 day ago</span>
                  </div>
                </div>
                <div className="flex gap-3 mt-auto pt-4 border-t border-[#283039]">
                  <Button className="flex-1 rounded-lg bg-[#283039] px-4 py-2 text-sm font-bold text-[#9dabb9] hover:bg-red-900/20 hover:text-red-500 transition-colors">
                    Reject
                  </Button>
                  <Button className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                    Accept
                  </Button>
                </div>
                <Button
                  variant="link"
                  className="w-full text-center mt-3 text-xs font-medium text-primary hover:underline"
                >
                  View Full Profile
                </Button>
              </div>

              {/* Card 4 */}
              <div className="flex flex-col justify-between rounded-xl bg-[#1e2329] p-5 border border-[#283039] hover:border-[#3a4450] transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-4">
                    <div className="relative">
                      <div className="relative h-16 w-16 rounded-full border-2 border-[#283039] overflow-hidden">
                        <Image
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLBFjo373y545r3lnTGuPKwp7Rr11ZZF1HTgVOB134kL62FU6NJi6v8eifUenTuOOenVxkQrzT-CK_Xatxhfkhz180HeDAvn8AgBlfos1XkTrtacjflbT5gAgJC6x2HoyN87EX2Omy-_ly0zCOxyyB06BsiEfC-ECa8LcnG0MrPPy-UBTALugCorfOH_s73aBJHGydAJtWaurJ_CmVq9s1SiLkWpHZQmXLHoRasgIKxjsv0ajfNkn-qMrnoUTgiwQgHHQsf2deqQ"
                          alt="Portrait of tour guide woman happy"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#1e2329] border border-[#283039]">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Pham Thu Ha</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Verified className="h-4 w-4 text-green-500" />
                        <p className="text-xs text-[#9dabb9]">Intl. License Valid</p>
                      </div>
                      <p className="text-xs text-[#9dabb9] mt-0.5">ID: 772-998-112</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-semibold text-yellow-500">
                    Pending
                  </span>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9dabb9]">Experience</span>
                    <span className="text-white font-medium">4 Years</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9dabb9]">Languages</span>
                    <div className="flex gap-1">
                      <span className="px-2 py-0.5 rounded bg-[#283039] text-xs text-white">Korean</span>
                      <span className="px-2 py-0.5 rounded bg-[#283039] text-xs text-white">English</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9dabb9]">Submitted</span>
                    <span className="text-white">1 day ago</span>
                  </div>
                </div>
                <div className="flex gap-3 mt-auto pt-4 border-t border-[#283039]">
                  <Button className="flex-1 rounded-lg bg-[#283039] px-4 py-2 text-sm font-bold text-[#9dabb9] hover:bg-red-900/20 hover:text-red-500 transition-colors">
                    Reject
                  </Button>
                  <Button className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                    Accept
                  </Button>
                </div>
                <Button
                  variant="link"
                  className="w-full text-center mt-3 text-xs font-medium text-primary hover:underline"
                >
                  View Full Profile
                </Button>
              </div>
            </div>

            {/* Footer / Pagination */}
            <div className="flex items-center justify-between border-t border-[#283039] pt-4 mt-auto">
              <p className="text-sm text-[#9dabb9]">Showing 4 of 12 requests</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#283039] text-white disabled:opacity-50"
                  disabled
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                  1
                </Button>
                <Button
                  variant="outline"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#283039] text-white hover:bg-[#323b46]"
                >
                  2
                </Button>
                <Button
                  variant="outline"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#283039] text-white hover:bg-[#323b46]"
                >
                  3
                </Button>
                <Button
                  variant="outline"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#283039] text-white hover:bg-[#323b46]"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

