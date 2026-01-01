import Link from "next/link";
import Image from "next/image";
import {
  TravelExplore,
  Bell,
  Search,
  MapPin,
  Calendar,
  Wallet,
  FileText,
  Shield,
  CheckCircle2,
  Users,
  Clock,
  UtensilsCrossed,
  Bus,
  HeartHandshake,
  ArrowRight,
  X,
  Send,
  Info,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TourDetailsApplyGuideViewPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111418] dark:text-white min-h-screen flex flex-col font-display">
      {/* Top Navigation */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e5e7eb] dark:border-b-border-dark px-10 py-3 bg-white dark:bg-[#111418]">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 text-[#111418] dark:text-white">
            <div className="size-8 text-primary">
              <TravelExplore className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">TourConnect</h2>
          </div>
          <div className="hidden md:flex items-center gap-9">
            <Link
              href="#"
              className="text-[#637588] dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="#"
              className="text-[#111418] dark:text-white text-sm font-bold leading-normal text-primary"
            >
              Find Tours
            </Link>
            <Link
              href="#"
              className="text-[#637588] dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors"
            >
              My Applications
            </Link>
            <Link
              href="#"
              className="text-[#637588] dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors"
            >
              Wallet
            </Link>
          </div>
        </div>
        <div className="flex flex-1 justify-end gap-8 items-center">
          <label className="hidden lg:flex flex-col min-w-40 !h-10 max-w-64">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-[#637588] dark:text-[#9dabb9] flex border-none bg-[#f0f2f5] dark:bg-border-dark items-center justify-center pl-4 rounded-l-lg border-r-0">
                <Search className="h-6 w-6" />
              </div>
              <Input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] dark:bg-border-dark focus:border-none h-full placeholder:text-[#637588] dark:placeholder:text-[#9dabb9] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                placeholder="Search tours..."
                defaultValue=""
              />
            </div>
          </label>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-[#637588] dark:text-white hover:text-primary">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 size-2 bg-red-500 rounded-full"></span>
            </Button>
            <div className="relative w-10 h-10 rounded-full border border-[#e5e7eb] dark:border-border-dark overflow-hidden">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxwHppWvu2E_SwoBW3UH7UNlaS1gQQL-ll4FzRxTmYZc0jsTvhGq5rOzLOSszrn7eLexTKoolKjz-hCDrBimlIfu-Lreip4_y8Vtny13Faf6JZPA13QSb-STEa9HkEz-j6L9ap7bq8rP6QorLzUJHLTKLfgqndYuL-er2tIQtXMZ2SHB9O8dB_T_7HYDfNueJ9kI5ao6l-KizhteodX4youO3lQOT_LgAcB-PA4lTNPdh4kQG8oD17dvVjnrW6KfFUsb8eI37uRg"
                alt="User profile picture showing a smiling tour guide"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex justify-center py-6 px-4 md:px-10 lg:px-20">
        <div className="w-full max-w-7xl flex flex-col gap-6">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap gap-2 px-0">
            <Link
              href="#"
              className="text-[#637588] dark:text-[#9dabb9] text-sm font-medium leading-normal hover:underline"
            >
              Home
            </Link>
            <span className="text-[#637588] dark:text-[#9dabb9] text-sm font-medium leading-normal">/</span>
            <Link
              href="#"
              className="text-[#637588] dark:text-[#9dabb9] text-sm font-medium leading-normal hover:underline"
            >
              Find Tours
            </Link>
            <span className="text-[#637588] dark:text-[#9dabb9] text-sm font-medium leading-normal">/</span>
            <span className="text-[#111418] dark:text-white text-sm font-medium leading-normal">Tour Details</span>
          </div>

          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-end border-b border-[#e5e7eb] dark:border-border-dark pb-6">
            <div className="flex flex-col gap-3 max-w-3xl">
              <div className="flex flex-wrap gap-3 items-center">
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wider border border-green-500/20">
                  Recruiting
                </span>
                <p className="text-[#637588] dark:text-[#9dabb9] text-sm font-medium">Tour ID: #VN-2025-882</p>
              </div>
              <h1 className="text-[#111418] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">
                Hanoi City Tour - Old Quarter & Food Experience
              </h1>
              <div className="flex items-center gap-2 text-[#637588] dark:text-[#9dabb9] text-sm">
                <Building2 className="h-[18px] w-[18px]" />
                <span>
                  Posted by: <strong className="text-[#111418] dark:text-white">Hanoi Travel Co.</strong>
                </span>
                <span className="hidden sm:inline mx-1 text-xs">•</span>
                <span className="hidden sm:inline">License: 79-002/2023/TCDL-GP LHQT</span>
              </div>
            </div>
            {/* Mobile Only Actions (Visible on small screens) */}
            <div className="md:hidden w-full mt-4">
              <Button className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
                <span>Apply Now</span>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
            {/* Main Content (Left Column) */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              {/* Itinerary Snapshot */}
              <Card className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-[#e5e7eb] dark:border-border-dark shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[#111418] dark:text-white text-xl font-bold mb-6 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Itinerary Snapshot
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2 p-4 rounded-lg bg-[#f6f7f8] dark:bg-[#111418] border border-[#e5e7eb] dark:border-border-dark">
                      <div className="text-[#637588] dark:text-[#9dabb9] flex items-center gap-2 text-sm font-medium uppercase tracking-wider">
                        <MapPin className="h-[18px] w-[18px]" />
                        Location
                      </div>
                      <p className="text-[#111418] dark:text-white font-bold text-lg">Hanoi, Vietnam</p>
                    </div>
                    <div className="flex flex-col gap-2 p-4 rounded-lg bg-[#f6f7f8] dark:bg-[#111418] border border-[#e5e7eb] dark:border-border-dark">
                      <div className="text-[#637588] dark:text-[#9dabb9] flex items-center gap-2 text-sm font-medium uppercase tracking-wider">
                        <Calendar className="h-[18px] w-[18px]" />
                        Start
                      </div>
                      <p className="text-[#111418] dark:text-white font-bold text-lg">12/05/2025</p>
                      <p className="text-[#637588] dark:text-[#9dabb9] text-sm">08:00 AM</p>
                    </div>
                    <div className="flex flex-col gap-2 p-4 rounded-lg bg-[#f6f7f8] dark:bg-[#111418] border border-[#e5e7eb] dark:border-border-dark">
                      <div className="text-[#637588] dark:text-[#9dabb9] flex items-center gap-2 text-sm font-medium uppercase tracking-wider">
                        <Clock className="h-[18px] w-[18px]" />
                        End
                      </div>
                      <p className="text-[#111418] dark:text-white font-bold text-lg">14/05/2025</p>
                      <p className="text-[#637588] dark:text-[#9dabb9] text-sm">05:00 PM</p>
                    </div>
                  </div>
                  {/* Map Placeholder */}
                  <div className="mt-4 w-full h-48 rounded-lg relative overflow-hidden">
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpIPPoCfkgJj_uGn756W-lkbVAMOPbTzK5eLV-A8zVVKqZkCNVwA1rTX02Hjk9_mjrEVYKW7lXaQJpv8ZZqGSZmHHiNVtnkc4i-EjK0Rgvmdsz3ZCL7prqd3we1DQfdNmOCJ9kbsXEY0GXi9KYbdkW2jTKl1XyNzk8XmP2zS8CszUiwVMhj53PkFHXOb0VB1m6lsHxvl4e2gyX8KH-qtbhcfjec0zCC6TGSRwpQiHo0t2IGXviDT27JMq-tkxHwdIxDyVBM2Q_Zw"
                      alt="Map view of Hanoi Old Quarter"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group cursor-pointer hover:bg-black/50 transition-colors">
                      <Button className="bg-white/90 dark:bg-black/80 text-[#111418] dark:text-white px-4 py-2 rounded-full font-medium flex items-center gap-2 shadow-lg backdrop-blur-sm">
                        <MapPin className="h-5 w-5" />
                        View Route Map
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Roles & Compensation */}
              <Card className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-[#e5e7eb] dark:border-border-dark shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[#111418] dark:text-white text-xl font-bold mb-6 flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    Roles & Compensation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Main Guide Card */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/20 hover:border-primary/40 transition-colors">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[#111418] dark:text-white font-bold text-lg">Main Guide</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-primary text-white">
                          High Priority
                        </span>
                      </div>
                      <p className="text-[#637588] dark:text-[#9dabb9] text-sm max-w-md">
                        Lead the group, manage logistics, and provide commentary in English & Vietnamese.
                      </p>
                    </div>
                    <div className="mt-3 md:mt-0 text-right w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-end">
                      <span className="text-primary font-black text-xl md:text-2xl">5,000,000 VND</span>
                      <span className="text-[#637588] dark:text-[#9dabb9] text-xs">Total for 3 days</span>
                    </div>
                  </div>
                  {/* Sub Guide Card */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-lg bg-[#f6f7f8] dark:bg-[#111418] border border-[#e5e7eb] dark:border-border-dark hover:border-[#637588] transition-colors">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-[#111418] dark:text-white font-bold text-lg">Sub Guide</h3>
                      <p className="text-[#637588] dark:text-[#9dabb9] text-sm max-w-md">
                        Assist with logistics, headcount, and guest support.
                      </p>
                    </div>
                    <div className="mt-3 md:mt-0 text-right w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-end">
                      <span className="text-[#111418] dark:text-white font-bold text-xl md:text-2xl">
                        3,000,000 VND
                      </span>
                      <span className="text-[#637588] dark:text-[#9dabb9] text-xs">Total for 3 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tour Description */}
              <Card className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-[#e5e7eb] dark:border-border-dark shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[#111418] dark:text-white text-xl font-bold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none text-[#637588] dark:text-[#9dabb9] leading-relaxed">
                    <p className="mb-4">
                      Join us for an immersive 3-day exploration of Hanoi&apos;s historic heart. As a guide for this
                      tour, you will be leading a group of approximately 15 guests from France. The itinerary focuses
                      on the hidden alleys of the Old Quarter, street food culture, and historical landmarks including
                      the Temple of Literature and Ho Chi Minh Mausoleum.
                    </p>
                    <p className="mb-4">
                      <strong className="text-[#111418] dark:text-white">Responsibilities:</strong>
                      <br />
                      • Meet guests at the hotel lobby at 8:00 AM daily.
                      <br />
                      • Coordinate with the driver and restaurant partners.
                      <br />
                      • Provide engaging historical context and manage the group&apos;s pace.
                      <br />• Handle unexpected situations professionally.
                    </p>
                    <p>
                      <strong className="text-[#111418] dark:text-white">Note:</strong> This tour involves significant
                      walking. Please ensure you are physically prepared.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements & Legal */}
              <Card className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-[#e5e7eb] dark:border-border-dark shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[#111418] dark:text-white text-xl font-bold mb-6 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Requirements & Inclusions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-[#111418] dark:text-white font-bold mb-3 text-sm uppercase tracking-wider">
                        Must Have
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                          <span className="text-[#637588] dark:text-[#9dabb9] text-sm">
                            Valid International Tour Guide Card
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                          <span className="text-[#637588] dark:text-[#9dabb9] text-sm">Fluent in French & English</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                          <span className="text-[#637588] dark:text-[#9dabb9] text-sm">
                            Min. 2 years experience with EU market
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-[#111418] dark:text-white font-bold mb-3 text-sm uppercase tracking-wider">
                        Included for Guide
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <UtensilsCrossed className="h-5 w-5 text-primary mt-0.5" />
                          <span className="text-[#637588] dark:text-[#9dabb9] text-sm">Lunch & Dinner with guests</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Bus className="h-5 w-5 text-primary mt-0.5" />
                          <span className="text-[#637588] dark:text-[#9dabb9] text-sm">
                            Transportation during tour
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <HeartHandshake className="h-5 w-5 text-primary mt-0.5" />
                          <span className="text-[#637588] dark:text-[#9dabb9] text-sm">Trip Insurance Coverage</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sticky Sidebar (Right Column) */}
            <div className="hidden lg:block lg:col-span-4 relative">
              <div className="sticky top-6 flex flex-col gap-4">
                {/* Application Summary Card */}
                <Card className="bg-white dark:bg-surface-dark rounded-xl border border-[#e5e7eb] dark:border-border-dark shadow-lg overflow-hidden">
                  <CardContent className="p-6 flex flex-col gap-6">
                    <div>
                      <p className="text-[#637588] dark:text-[#9dabb9] text-sm font-medium mb-1">
                        Estimated Earnings
                      </p>
                      <p className="text-[#111418] dark:text-white text-3xl font-black text-primary">
                        3M - 5M <span className="text-base font-medium text-[#637588] dark:text-[#9dabb9]">VND</span>
                      </p>
                    </div>
                    <div className="h-px w-full bg-[#e5e7eb] dark:bg-border-dark"></div>
                    <div className="flex flex-col gap-3">
                      <p className="text-[#111418] dark:text-white font-bold text-sm">Eligibility Check</p>
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-[#637588] dark:text-[#9dabb9]">KYC Verified (Identity/Card)</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-[#637588] dark:text-[#9dabb9]">Wallet Balance {'>'} 500k</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-[#637588] dark:text-[#9dabb9]">Schedule Clear (No Conflicts)</span>
                      </div>
                    </div>
                    <Button className="w-full bg-primary hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-2">
                      <span>Ứng tuyển ngay</span>
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                    <p className="text-center text-xs text-[#637588] dark:text-[#9dabb9]">
                      Application closes in <span className="text-[#111418] dark:text-white font-bold">2 days</span>
                    </p>
                  </CardContent>
                  <div className="bg-[#f6f7f8] dark:bg-[#111418] p-4 text-xs text-[#637588] dark:text-[#9dabb9] text-center border-t border-[#e5e7eb] dark:border-border-dark">
                    Compliant with Vietnam Tourism Law 2025
                  </div>
                </Card>

                {/* Need Help Card */}
                <Card className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-[#e5e7eb] dark:border-border-dark shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-[#111418] dark:text-white font-bold mb-2">Have questions?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#637588] dark:text-[#9dabb9] text-sm mb-4">
                      Contact the Tour Operator directly for clarifications regarding the itinerary.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full py-2 px-4 border border-[#e5e7eb] dark:border-border-dark rounded-lg text-[#111418] dark:text-white font-medium hover:bg-[#f6f7f8] dark:hover:bg-[#2c343e] transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="h-[18px] w-[18px]" />
                      Chat with Operator
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Application Modal */}
      <Dialog>
        <DialogContent className="relative bg-white dark:bg-[#1c2127] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
          <DialogHeader className="p-6 border-b border-[#e5e7eb] dark:border-border-dark flex justify-between items-center bg-[#f6f7f8] dark:bg-[#1c2127]">
            <DialogTitle className="text-xl font-bold text-[#111418] dark:text-white">Apply for Tour</DialogTitle>
          </DialogHeader>
          <DialogContent className="p-6 overflow-y-auto flex-1">
            <form className="flex flex-col gap-6">
              {/* Role Selection */}
              <div className="flex flex-col gap-3">
                <Label className="text-[#111418] dark:text-white font-bold text-sm">Select Role</Label>
                <RadioGroup defaultValue="main" className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <RadioGroupItem value="main" id="role-main" className="peer sr-only" />
                    <Label
                      htmlFor="role-main"
                      className="cursor-pointer relative block p-4 rounded-lg border-2 border-[#e5e7eb] dark:border-border-dark bg-white dark:bg-[#111418] peer-checked:border-primary peer-checked:bg-primary/5 transition-all h-full flex flex-col gap-1"
                    >
                      <span className="font-bold text-[#111418] dark:text-white">Main Guide</span>
                      <span className="text-xs text-[#637588] dark:text-[#9dabb9]">5,000,000 VND</span>
                    </Label>
                    <div className="absolute top-2 right-2 text-primary opacity-0 peer-checked:opacity-100 transition-opacity">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="relative">
                    <RadioGroupItem value="sub" id="role-sub" className="peer sr-only" />
                    <Label
                      htmlFor="role-sub"
                      className="cursor-pointer relative block p-4 rounded-lg border-2 border-[#e5e7eb] dark:border-border-dark bg-white dark:bg-[#111418] peer-checked:border-primary peer-checked:bg-primary/5 transition-all h-full flex flex-col gap-1"
                    >
                      <span className="font-bold text-[#111418] dark:text-white">Sub Guide</span>
                      <span className="text-xs text-[#637588] dark:text-[#9dabb9]">3,000,000 VND</span>
                    </Label>
                    <div className="absolute top-2 right-2 text-primary opacity-0 peer-checked:opacity-100 transition-opacity">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </div>
                </RadioGroup>
              </div>
              {/* Cover Letter */}
              <div className="flex flex-col gap-3">
                <Label className="text-[#111418] dark:text-white font-bold text-sm flex justify-between">
                  Cover Letter
                  <span className="text-xs font-normal text-[#637588] dark:text-[#9dabb9]">Optional</span>
                </Label>
                <Textarea
                  className="w-full rounded-lg bg-[#f6f7f8] dark:bg-[#111418] border border-[#e5e7eb] dark:border-border-dark text-[#111418] dark:text-white p-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary resize-none placeholder:text-[#637588] dark:placeholder:text-[#9dabb9]"
                  placeholder="Briefly introduce yourself and why you fit this tour..."
                  rows={4}
                />
              </div>
              {/* Deposit Warning */}
              <Alert className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <Info className="h-5 w-5 text-yellow-500 shrink-0" />
                <AlertDescription className="text-xs text-yellow-700 dark:text-yellow-500 leading-relaxed">
                  A refundable deposit of <strong className="text-yellow-800 dark:text-yellow-400">500,000 VND</strong>{" "}
                  will be held from your wallet upon acceptance.
                </AlertDescription>
              </Alert>
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-primary/20"
                >
                  Submit Application
                </Button>
              </div>
            </form>
          </DialogContent>
        </DialogContent>
      </Dialog>
    </div>
  );
}

