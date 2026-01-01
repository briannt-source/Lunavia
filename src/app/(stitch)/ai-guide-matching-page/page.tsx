import Link from "next/link";
import Image from "next/image";
import {
  Globe,
  Search,
  Bell,
  LayoutDashboard,
  MapPin,
  Users,
  FileText,
  Sparkles,
  Calendar,
  Languages,
  Edit,
  Star,
  UserCheck,
  Send,
  ChevronDown,
  Sparkles as AutoAwesome,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AiGuideMatchingPage() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e5e7eb] dark:border-b-gray-800 bg-white dark:bg-[#1a2230] px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="size-8 text-primary">
              <Globe className="w-full h-full" />
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] dark:text-white">
              GuideConnect Pro
            </h2>
          </div>
          {/* Search Bar */}
          <label className="hidden md:flex flex-col min-w-40 !h-10 max-w-64">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-[#606e8a] dark:text-gray-400 flex border-none bg-[#f0f1f5] dark:bg-gray-800 items-center justify-center pl-4 rounded-l-lg border-r-0">
                <Search className="h-5 w-5" />
              </div>
              <Input
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111318] dark:text-white focus:outline-0 focus:ring-0 border-none bg-[#f0f1f5] dark:bg-gray-800 focus:border-none h-full placeholder:text-[#606e8a] dark:placeholder:text-gray-500 px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal"
                placeholder="Search"
                defaultValue=""
              />
            </div>
          </label>
        </div>
        <div className="flex flex-1 justify-end gap-8">
          <div className="hidden lg:flex items-center gap-9">
            <Link
              href="#"
              className="text-[#606e8a] dark:text-gray-300 hover:text-primary dark:hover:text-primary text-sm font-medium leading-normal transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="#"
              className="text-[#606e8a] dark:text-gray-300 hover:text-primary dark:hover:text-primary text-sm font-medium leading-normal transition-colors"
            >
              Tours
            </Link>
            <Link
              href="#"
              className="text-[#606e8a] dark:text-gray-300 hover:text-primary dark:hover:text-primary text-sm font-medium leading-normal transition-colors"
            >
              Guides
            </Link>
            <Link
              href="#"
              className="text-[#111318] dark:text-white text-sm font-bold leading-normal relative"
            >
              AI Matching
              <span className="absolute -bottom-[21px] left-0 w-full h-[2px] bg-primary"></span>
            </Link>
            <Link
              href="#"
              className="text-[#606e8a] dark:text-gray-300 hover:text-primary dark:hover:text-primary text-sm font-medium leading-normal transition-colors"
            >
              Reports
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="flex items-center justify-center size-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-[#606e8a] dark:text-gray-300"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <div className="relative w-10 h-10 rounded-full ring-2 ring-white dark:ring-gray-800 shadow-sm overflow-hidden">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGcC4HbpYAYPgyJNhogigUHxhejnP58p1xSGXMfC_cIkZ0wKRrmLhpSEjjGtxU_CsY_DzXF8CLDTNHfYM4u3T667Mnj-zNi50otLExgJz7SO1zf2RBURkgwcsRFJ8WfaANGUTVaK5B1s0dNQiKwDsXdGpG6KQSyMT0AAEXtMoNMDwpNxmM9NhJzl3ULZNiZ8__hhZ3xFzyTJH-OphlVnnmsemUbgBzHC6v1vClQ3v_o4uo_di0QGfpdzUqVxpLiZaOmN2o0XIxDw"
                alt="User profile avatar showing a smiling person"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 px-4 md:px-10">
          <div className="flex flex-col max-w-[1200px] flex-1">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap gap-2 py-4">
              <Link
                href="#"
                className="text-[#606e8a] dark:text-gray-400 text-sm font-medium leading-normal hover:underline"
              >
                Dashboard
              </Link>
              <span className="text-[#606e8a] dark:text-gray-400 text-sm font-medium leading-normal">/</span>
              <span className="text-[#111318] dark:text-white text-sm font-medium leading-normal">
                AI Matching Tool
              </span>
            </div>

            {/* Page Heading & Actions */}
            <div className="flex flex-wrap justify-between items-end gap-6 pb-6 border-b border-dashed border-[#dbdfe6] dark:border-gray-700">
              <div className="flex min-w-72 flex-col gap-2">
                <h1 className="text-[#111318] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">
                  AI Guide Matching
                </h1>
                <p className="text-[#606e8a] dark:text-gray-400 text-base font-normal leading-normal max-w-2xl">
                  Find the perfect guide for your tours using our AI-powered recommendation engine
                  compliant with Vietnam Tourism Law 2025.
                </p>
              </div>
              {/* Tour Selection Control */}
              <div className="flex w-full md:w-auto flex-col min-w-[320px]">
                <label className="text-[#111318] dark:text-gray-200 text-sm font-bold leading-normal pb-2">
                  Select Tour to Match
                </label>
                <div className="relative">
                  <Select defaultValue="tour1">
                    <SelectTrigger className="flex w-full cursor-pointer appearance-none rounded-lg text-[#111318] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary border border-[#dbdfe6] dark:border-gray-600 bg-white dark:bg-[#1a2230] h-12 pl-4 pr-10 text-sm font-medium shadow-sm transition-all">
                      <SelectValue placeholder="Search and select a tour..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tour1" disabled>
                        Search and select a tour...
                      </SelectItem>
                      <SelectItem value="tour1">
                        #HN-882: Cultural Heritage Tour - Hanoi & Ninh Binh (Oct 12-15)
                      </SelectItem>
                      <SelectItem value="tour2">#HL-901: Ha Long Bay Luxury Cruise (Oct 20-22)</SelectItem>
                      <SelectItem value="tour3">#SG-334: Saigon Street Food Discovery (Nov 01)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#606e8a]">
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col lg:flex-row gap-8 mt-8">
              {/* Left Column: Selected Tour Summary (Context) */}
              <aside className="w-full lg:w-1/3 flex flex-col gap-6">
                <div className="bg-white dark:bg-[#1a2230] rounded-xl border border-[#dbdfe6] dark:border-gray-700 p-6 shadow-sm sticky top-24">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#111318] dark:text-white">
                        Tour Requirements
                      </h3>
                      <p className="text-xs text-[#606e8a] dark:text-gray-400">#HN-882 Summary</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-3 items-start">
                      <Calendar className="text-[#606e8a] h-5 w-5 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-[#111318] dark:text-white">
                          Oct 12 - Oct 15, 2024
                        </p>
                        <p className="text-xs text-[#606e8a] dark:text-gray-400">4 Days, 3 Nights</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <Languages className="text-[#606e8a] h-5 w-5 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-[#111318] dark:text-white">
                          French (Primary)
                        </p>
                        <p className="text-xs text-[#606e8a] dark:text-gray-400">English (Secondary)</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <Users className="text-[#606e8a] h-5 w-5 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-[#111318] dark:text-white">
                          Group Size: 12 Pax
                        </p>
                        <p className="text-xs text-[#606e8a] dark:text-gray-400">
                          Requires International Guide Card
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <MapPin className="text-[#606e8a] h-5 w-5 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-[#111318] dark:text-white">Route</p>
                        <p className="text-xs text-[#606e8a] dark:text-gray-400">
                          Hanoi Old Quarter → Trang An → Bai Dinh
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-[#dbdfe6] dark:border-gray-700">
                    <Button
                      variant="link"
                      className="w-full flex items-center justify-center gap-2 text-primary font-medium text-sm hover:underline"
                    >
                      <Edit className="h-[18px] w-[18px]" />
                      Modify Requirements
                    </Button>
                  </div>
                </div>
              </aside>

              {/* Right Column: AI Recommendations List */}
              <main className="w-full lg:w-2/3 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#111318] dark:text-white flex items-center gap-2">
                    <AutoAwesome className="h-5 w-5 text-primary" />
                    AI Suggested Guides (5 Found)
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#606e8a] dark:text-gray-400">Sort by:</span>
                    <Select defaultValue="best-match">
                      <SelectTrigger className="bg-transparent border-none text-sm font-bold text-[#111318] dark:text-white cursor-pointer focus:ring-0 p-0 pr-6">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="best-match">Best Match</SelectItem>
                        <SelectItem value="experience">Experience</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Guide Card 1 (Top Match) */}
                <div className="bg-white dark:bg-[#1a2230] rounded-xl border border-primary/30 dark:border-primary/40 shadow-md overflow-hidden relative group transition-transform hover:-translate-y-1">
                  <div className="absolute top-0 left-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-br-lg uppercase tracking-wider z-10">
                    Top Match
                  </div>
                  <div className="p-5 flex flex-col sm:flex-row gap-5">
                    {/* Profile Section */}
                    <div className="flex flex-col items-center sm:items-start min-w-[140px] gap-3">
                      <div className="relative">
                        <div className="relative size-20 rounded-full bg-cover bg-center border-2 border-white dark:border-gray-700 shadow-sm overflow-hidden">
                          <Image
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuABIyPodg9S7KA7lDAoVohALiCKfBnSlNOfcWKpIG81GSZLo4YKdE0HYnA921fN5ss7Z76TdW-riT50gZp4jmAUVdz0y855N33pnYcHChEgJmhzRelo5Tf8CB1jtouLiw6U8UkpZWhpe_dWYcH__PsigRQ2BpwZ_1pJZU_mmnC4nupuD1-VYLANFQVmaos-ZJbV7Aa25MiUnjvzY7aa2V8bAyuFsRR_6sUgxImtqwoEo2x2OU6wtRC5dsUb0U0yhGpLPOI9LLvDCA"
                            alt="Portrait of guide Nguyen Van Nam"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1 border-2 border-white dark:border-gray-800">
                          <UserCheck className="h-[14px] w-[14px] block" />
                        </div>
                      </div>
                      <div className="text-center sm:text-left">
                        <h4 className="text-base font-bold text-[#111318] dark:text-white">
                          Nguyen Van Nam
                        </h4>
                        <div className="flex items-center justify-center sm:justify-start gap-1 text-yellow-500 text-xs font-bold mt-1">
                          <Star className="h-4 w-4 fill-yellow-500" />
                          4.9 (124 Reviews)
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold px-2 py-1 rounded border border-green-200 dark:border-green-800">
                        <UserCheck className="h-3 w-3" />
                        License Valid 2026
                      </div>
                    </div>
                    {/* Content Section */}
                    <div className="flex-1 border-l border-none sm:border-solid sm:border-gray-100 dark:sm:border-gray-700 sm:pl-5">
                      {/* Match Score Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-[#606e8a] dark:text-gray-400">Law 2025 Compliant</div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-lg font-black text-primary leading-none">98%</p>
                            <p className="text-[10px] font-bold text-primary/70 uppercase">Match Score</p>
                          </div>
                          <div className="size-10 rounded-full border-[3px] border-primary border-t-transparent flex items-center justify-center rotate-45"></div>
                        </div>
                      </div>
                      {/* AI Reasoning */}
                      <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-3 mb-4">
                        <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wide">
                          Why this match?
                        </p>
                        <p className="text-sm text-[#111318] dark:text-gray-200 leading-relaxed">
                          <span className="font-medium">Excellent French fluency (C2)</span> matches tour
                          requirement. Has guided <span className="font-medium">25+ tours</span> on the
                          Hanoi-Ninh Binh route with 5-star feedback on historical knowledge. Currently
                          available for Oct 12-15 dates.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs font-medium text-[#606e8a] dark:text-gray-300">
                          French Native Level
                        </span>
                        <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs font-medium text-[#606e8a] dark:text-gray-300">
                          History Expert
                        </span>
                        <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs font-medium text-[#606e8a] dark:text-gray-300">
                          First Aid Certified
                        </span>
                      </div>
                      <div className="flex gap-3 mt-auto">
                        <Button
                          variant="outline"
                          className="flex-1 bg-white dark:bg-gray-800 text-[#111318] dark:text-white border border-[#dbdfe6] dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 h-9 rounded-lg text-sm font-medium transition-colors"
                        >
                          View Profile
                        </Button>
                        <Button className="flex-1 bg-primary hover:bg-primary/90 text-white h-9 rounded-lg text-sm font-medium shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2">
                          <Send className="h-[18px] w-[18px]" />
                          Send Invitation
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guide Card 2 */}
                <div className="bg-white dark:bg-[#1a2230] rounded-xl border border-[#dbdfe6] dark:border-gray-700 shadow-sm overflow-hidden transition-transform hover:-translate-y-1">
                  <div className="p-5 flex flex-col sm:flex-row gap-5">
                    {/* Profile Section */}
                    <div className="flex flex-col items-center sm:items-start min-w-[140px] gap-3">
                      <div className="relative">
                        <div className="relative size-20 rounded-full bg-cover bg-center border-2 border-white dark:border-gray-700 shadow-sm grayscale-[20%] overflow-hidden">
                          <Image
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHPFnMp1i_DEnTywG4DxjGukUQ6S7k2EUsqVZrrKDr2UP6pJH85ycabRQdMFWlxeK2hWO8Cj_ip7jIYlgHh2aHz694OMetJtOxj3Zt-YE62Pgiho9aD-JQVQ7I2NOiqGhP7wfhvnNRqx5ML-vfG1iMuOKjZXLFdTwi_COZYRf7lfpWRLy5gQaEOOX68lNtDetNxbXm89bO1Lq3u86r5a-h85FNMz4qOcuqsiqBg81CvywQXUljxbZUO4lWW8XqlQCB_KID24rlYQ"
                            alt="Portrait of guide Tran Thi Mai"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="text-center sm:text-left">
                        <h4 className="text-base font-bold text-[#111318] dark:text-white">Tran Thi Mai</h4>
                        <div className="flex items-center justify-center sm:justify-start gap-1 text-yellow-500 text-xs font-bold mt-1">
                          <Star className="h-4 w-4 fill-yellow-500" />
                          4.7 (89 Reviews)
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold px-2 py-1 rounded border border-green-200 dark:border-green-800">
                        <UserCheck className="h-3 w-3" />
                        License Valid 2025
                      </div>
                    </div>
                    {/* Content Section */}
                    <div className="flex-1 border-l border-none sm:border-solid sm:border-gray-100 dark:sm:border-gray-700 sm:pl-5">
                      {/* Match Score Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-[#606e8a] dark:text-gray-400">Law 2025 Compliant</div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-lg font-black text-[#111318] dark:text-white leading-none">
                              92%
                            </p>
                            <p className="text-[10px] font-bold text-[#606e8a] uppercase">Match Score</p>
                          </div>
                          {/* Simple circle for lower score */}
                          <div className="relative size-10 flex items-center justify-center">
                            <svg
                              className="size-full -rotate-90"
                              viewBox="0 0 36 36"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                className="text-gray-200 dark:text-gray-700"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                              ></path>
                              <path
                                className="text-blue-500"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeDasharray="92, 100"
                                strokeWidth="3"
                              ></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                      {/* AI Reasoning */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
                        <p className="text-xs font-bold text-[#606e8a] mb-1 uppercase tracking-wide">
                          Why this match?
                        </p>
                        <p className="text-sm text-[#111318] dark:text-gray-200 leading-relaxed">
                          Strong match for culture tours. <span className="font-medium">Fluent in French</span>{" "}
                          and has previously worked with this Tour Operator. Note: License renewal pending
                          next year but valid for current tour dates.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs font-medium text-[#606e8a] dark:text-gray-300">
                          French Advanced
                        </span>
                        <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs font-medium text-[#606e8a] dark:text-gray-300">
                          Culinary Expert
                        </span>
                      </div>
                      <div className="flex gap-3 mt-auto">
                        <Button
                          variant="outline"
                          className="flex-1 bg-white dark:bg-gray-800 text-[#111318] dark:text-white border border-[#dbdfe6] dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 h-9 rounded-lg text-sm font-medium transition-colors"
                        >
                          View Profile
                        </Button>
                        <Button className="flex-1 bg-primary hover:bg-primary/90 text-white h-9 rounded-lg text-sm font-medium shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2">
                          <Send className="h-[18px] w-[18px]" />
                          Send Invitation
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guide Card 3 */}
                <div className="bg-white dark:bg-[#1a2230] rounded-xl border border-[#dbdfe6] dark:border-gray-700 shadow-sm overflow-hidden transition-transform hover:-translate-y-1 opacity-90">
                  <div className="p-5 flex flex-col sm:flex-row gap-5">
                    {/* Profile Section */}
                    <div className="flex flex-col items-center sm:items-start min-w-[140px] gap-3">
                      <div className="relative">
                        <div className="relative size-20 rounded-full bg-cover bg-center border-2 border-white dark:border-gray-700 shadow-sm grayscale-[100%] overflow-hidden">
                          <Image
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJwwADPiZNbohLEraSgUkPt8XzpdvV5GghNgzvi5TAhgRnpBLBeePCLCx4E-_9wBcSPSorkpycdasdEvkJg8r-OMku3mLFL2x2mEiJmmpxSlmf-VfiFGJERaCfE5qctu3cRiFF5iRRLWT0LLrboI5dtL_LUFKkOuBHPnBe-80CpM30GV3jVGY4x6R43gfnpX9eAB-5rYG9MvU1HTGtk3BF2zoSu83IIW97j3ky641II-RR8HzVAk5uud_gVPgkSO19A8xVrxegNA"
                            alt="Portrait of guide Le Van Hung"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="text-center sm:text-left">
                        <h4 className="text-base font-bold text-[#111318] dark:text-white">Le Van Hung</h4>
                        <div className="flex items-center justify-center sm:justify-start gap-1 text-yellow-500 text-xs font-bold mt-1">
                          <Star className="h-4 w-4 fill-yellow-500" />
                          4.5 (45 Reviews)
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold px-2 py-1 rounded border border-green-200 dark:border-green-800">
                        <UserCheck className="h-3 w-3" />
                        License Valid 2026
                      </div>
                    </div>
                    {/* Content Section */}
                    <div className="flex-1 border-l border-none sm:border-solid sm:border-gray-100 dark:sm:border-gray-700 sm:pl-5">
                      {/* Match Score Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-[#606e8a] dark:text-gray-400">Law 2025 Compliant</div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-lg font-black text-[#606e8a] dark:text-gray-400 leading-none">
                              85%
                            </p>
                            <p className="text-[10px] font-bold text-[#606e8a] uppercase">Match Score</p>
                          </div>
                          <div className="relative size-10 flex items-center justify-center">
                            <svg
                              className="size-full -rotate-90"
                              viewBox="0 0 36 36"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                className="text-gray-200 dark:text-gray-700"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                              ></path>
                              <path
                                className="text-gray-400"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeDasharray="85, 100"
                                strokeWidth="3"
                              ></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                      {/* AI Reasoning */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
                        <p className="text-xs font-bold text-[#606e8a] mb-1 uppercase tracking-wide">
                          Why this match?
                        </p>
                        <p className="text-sm text-[#111318] dark:text-gray-200 leading-relaxed">
                          Good alternative. Strong knowledge of Trang An geography. French level is
                          conversational (B2). High enthusiasm but fewer years of experience.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs font-medium text-[#606e8a] dark:text-gray-300">
                          French Conversational
                        </span>
                        <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs font-medium text-[#606e8a] dark:text-gray-300">
                          Adventure Tour Specialist
                        </span>
                      </div>
                      <div className="flex gap-3 mt-auto">
                        <Button
                          variant="outline"
                          className="flex-1 bg-white dark:bg-gray-800 text-[#111318] dark:text-white border border-[#dbdfe6] dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 h-9 rounded-lg text-sm font-medium transition-colors"
                        >
                          View Profile
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 bg-white dark:bg-gray-800 text-primary hover:bg-primary hover:text-white border border-primary h-9 rounded-lg text-sm font-medium shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                          <Send className="h-[18px] w-[18px]" />
                          Send Invitation
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center py-4">
                  <Button
                    variant="link"
                    className="text-[#606e8a] dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    Show more recommendations
                    <ChevronDown className="h-5 w-5" />
                  </Button>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



