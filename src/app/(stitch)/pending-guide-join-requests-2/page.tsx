import Link from "next/link";
import Image from "next/image";
import {
  Grid3x3,
  MapPin,
  Users,
  UserPlus,
  Wallet,
  Settings,
  LogOut,
  Menu,
  Bell,
  HelpCircle,
  History,
  CreditCard,
  Lock,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PendingGuideJoinRequests2Page() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display">
      <div className="flex h-screen w-full overflow-hidden">
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
                className="flex items-center gap-3 px-3 py-2 text-[#9dabb9] hover:text-white hover:bg-[#283039] rounded-lg transition-colors"
              >
                <UserPlus className="h-6 w-6" />
                <p className="text-sm font-medium leading-normal">Join Requests</p>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/20 text-primary"
              >
                <Wallet className="h-6 w-6 fill-primary" />
                <p className="text-sm font-medium leading-normal">Payments</p>
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

        <main className="flex flex-1 flex-col overflow-y-auto bg-[#111418] relative">
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

          <div className="flex flex-col gap-8 p-6 md:p-10 max-w-[1400px] mx-auto w-full">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-[#283039] pb-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-white text-3xl font-bold leading-tight tracking-tight">
                  Thanh toán Hướng dẫn viên
                </h1>
                <p className="text-[#9dabb9] text-base font-normal leading-normal">
                  Manage direct payments to guides for completed tours securely.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex items-center justify-center rounded-lg border border-[#283039] bg-transparent px-4 py-2.5 text-sm font-medium text-[#9dabb9] hover:text-white hover:bg-[#283039] transition-colors"
                >
                  <History className="h-5 w-5 mr-2" />
                  History
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 flex flex-col gap-6">
                <Card className="rounded-xl bg-[#1e2329] p-6 border border-[#283039] shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Payment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-[#9dabb9]">Chọn tour (Select Tour)</Label>
                        <div className="relative">
                          <Select defaultValue="HN-HL-001">
                            <SelectTrigger className="w-full rounded-lg bg-[#111418] border border-[#283039] text-white py-3 pl-4 pr-10 focus:ring-1 focus:ring-primary focus:border-primary appearance-none cursor-pointer">
                              <SelectValue placeholder="-- Chọn tour đã hoàn thành --" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="HN-HL-001">
                                Hanoi - Halong Bay (3D2N) #T2025001
                              </SelectItem>
                              <SelectItem value="HCM-MK-002">HCMC - Mekong Delta (1D) #T2025002</SelectItem>
                              <SelectItem value="DN-HA-003">Da Nang - Hoi An (2D1N) #T2025003</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-[#9dabb9]">
                          Chọn guide (Select Guide)
                        </Label>
                        <div className="relative">
                          <Select defaultValue="192845992">
                            <SelectTrigger className="w-full rounded-lg bg-[#111418] border border-[#283039] text-white py-3 pl-4 pr-10 focus:ring-1 focus:ring-primary focus:border-primary appearance-none cursor-pointer">
                              <SelectValue placeholder="-- Chọn hướng dẫn viên --" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="192845992">Nguyen Van Minh (ID: 192-845-992)</SelectItem>
                              <SelectItem value="221554102">Tran Thi Mai (ID: 221-554-102)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center p-4 bg-[#111418] rounded-lg border border-[#283039]">
                      <div className="relative h-12 w-12 rounded-full border border-[#283039] mr-4 overflow-hidden">
                        <Image
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAABnI8PxjrK_lEv1LlDVcCdglipx1UsRciYbVN9Tq2daDifMRe2eDyTOluruAumvp43iuWNa3w4_ss7PHmR2dgd0uUDzh8ze0DntiRxo627RGph4nQBLbLhwO5ysAHQ4vIziY3SQbjqwPiXyFjt5tbPOPZVQaMnK9Tkk_3oW8i8KD6BnLwa913cdvUj39YzuMxBhmNKYqZlrEEQiby378GVaUUMNyqgTUMJYvPY65W8L9zHMCDLuiqwwx0uOBLvFBRV35q9JvbPQ"
                          alt="Guide portrait"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-white">Nguyen Van Minh</h3>
                        <p className="text-xs text-[#9dabb9]">International Guide License • Valid</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#9dabb9]">Wallet ID</p>
                        <p className="text-sm font-mono text-white">VN-8829-1102</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6 mt-6">
                      <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-[#9dabb9]">Nhập số tiền (VND)</Label>
                        <div className="relative">
                          <Input
                            className="w-full rounded-lg bg-[#111418] border border-[#283039] text-white text-xl font-bold py-3 pl-4 pr-16 focus:ring-1 focus:ring-primary focus:border-primary placeholder:font-normal placeholder:text-[#3a4450]"
                            placeholder="0"
                            type="text"
                            defaultValue="2.500.000"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9dabb9] font-medium">
                            VND
                          </span>
                        </div>
                        <p className="text-xs text-[#9dabb9]">
                          Available balance to pay:{" "}
                          <span className="text-green-500 font-medium">500.000.000 VND</span>
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-[#9dabb9]">
                          Nội dung thanh toán (Description)
                        </Label>
                        <Textarea
                          className="w-full rounded-lg bg-[#111418] border border-[#283039] text-white py-3 px-4 focus:ring-1 focus:ring-primary focus:border-primary min-h-[100px]"
                          placeholder="e.g., Payment for Tour T2025001 - Guide services"
                        />
                      </div>
                    </div>
                    <div className="h-px bg-[#283039] w-full my-6"></div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#9dabb9]">
                        <Lock className="h-[18px] w-[18px]" />
                        <span className="text-xs">Transaction is encrypted and secure.</span>
                      </div>
                      <div className="flex gap-4">
                        <Button
                          variant="outline"
                          className="px-6 py-2.5 rounded-lg text-sm font-medium text-[#9dabb9] hover:text-white hover:bg-[#283039] transition-colors"
                        >
                          Cancel
                        </Button>
                        <Button className="px-8 py-2.5 rounded-lg bg-primary text-sm font-bold text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
                          Thanh toán
                          <ArrowRight className="h-[18px] w-[18px]" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-6">
                <Card className="rounded-xl bg-[#1e2329] p-6 border border-[#283039] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Wallet className="h-36 w-36 text-white" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm text-[#9dabb9] font-medium mb-1">Guide&apos;s Current Balance</p>
                    <h3 className="text-3xl font-bold text-white mb-4">
                      15.250.000 <span className="text-lg font-normal text-[#9dabb9]">VND</span>
                    </h3>
                    <div className="flex gap-2 mb-6">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-500/10 text-green-500 text-xs font-medium">
                        <TrendingUp className="h-[14px] w-[14px]" />
                        +2.5M this month
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#283039] text-[#9dabb9] text-xs font-medium">
                        Active
                      </span>
                    </div>
                    <div className="h-px bg-[#283039] w-full mb-4"></div>
                    <h4 className="text-sm font-bold text-white mb-3">Recent Transactions</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[#111418] border border-[#283039]">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-white">Tour #T2024098</span>
                          <span className="text-[10px] text-[#9dabb9]">12 Oct 2024</span>
                        </div>
                        <span className="text-sm font-bold text-green-500">+ 3.000.000</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[#111418] border border-[#283039]">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-white">Tour #T2024085</span>
                          <span className="text-[10px] text-[#9dabb9]">05 Oct 2024</span>
                        </div>
                        <span className="text-sm font-bold text-green-500">+ 2.800.000</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[#111418] border border-[#283039]">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-white">Bonus Q3</span>
                          <span className="text-[10px] text-[#9dabb9]">01 Oct 2024</span>
                        </div>
                        <span className="text-sm font-bold text-green-500">+ 500.000</span>
                      </div>
                    </div>
                    <Button
                      variant="link"
                      className="w-full mt-4 text-xs text-primary hover:text-primary/80 font-medium"
                    >
                      View All History
                    </Button>
                  </div>
                </Card>

                <Card className="rounded-xl bg-[#1e2329] p-6 border border-[#283039]">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-white mb-4">Payment Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex gap-3 text-xs text-[#9dabb9]">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        <span>
                          Payments are processed instantly to the guide&apos;s digital wallet.
                        </span>
                      </li>
                      <li className="flex gap-3 text-xs text-[#9dabb9]">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        <span>
                          Transaction fees are covered by the platform for amounts over 5M VND.
                        </span>
                      </li>
                      <li className="flex gap-3 text-xs text-[#9dabb9]">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        <span>
                          Verify the Guide ID before confirming payment to avoid disputes.
                        </span>
                      </li>
                    </ul>
                    <div className="mt-4 pt-4 border-t border-[#283039]">
                      <Link
                        href="#"
                        className="flex items-center gap-2 text-xs font-medium text-white hover:text-primary transition-colors"
                      >
                        <HelpCircle className="h-4 w-4" />
                        Need help with payments?
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

