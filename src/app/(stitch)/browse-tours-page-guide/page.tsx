import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Bell,
  Search,
  Calendar,
  Clock,
  Wallet,
  Verified,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LocationOn,
} from "lucide-react";

export default function BrowseToursPageGuide() {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f2f4] bg-white px-10 py-3 shadow-sm dark:bg-[#1A2633] dark:border-b-gray-700">
        <div className="flex items-center gap-4 text-[#111418] dark:text-white">
          <div className="size-8 text-primary">
            <MapPin className="w-10 h-10" />
          </div>
          <h2 className="text-[#111418] text-xl font-bold leading-tight tracking-[-0.015em] dark:text-white">
            GuideConnect
          </h2>
        </div>
        <div className="flex flex-1 justify-end gap-8">
          <nav className="hidden md:flex items-center gap-9">
            <Link
              className="text-[#617589] hover:text-primary text-sm font-medium leading-normal transition-colors dark:text-gray-400"
              href="#"
            >
              Dashboard
            </Link>
            <Link
              className="text-primary text-sm font-bold leading-normal"
              href="#"
            >
              Tìm kiếm tour
            </Link>
            <Link
              className="text-[#617589] hover:text-primary text-sm font-medium leading-normal transition-colors dark:text-gray-400"
              href="#"
            >
              Đơn ứng tuyển
            </Link>
            <Link
              className="text-[#617589] hover:text-primary text-sm font-medium leading-normal transition-colors dark:text-gray-400"
              href="#"
            >
              Hồ sơ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <button className="relative text-[#617589] hover:text-[#111418] dark:text-gray-400">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-white shadow-sm cursor-pointer"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC1Xs_RQs5P7I3TMmICDTzOqvOWwzyrn8fAnFw5D7LXJi4iLfyA7v--IGGNiKL1jsB5j1jgA4ys-DKpdkfAWYbQcptB9BfY-w0KqsrbZcS9auMi8i3TTDrzCRji9hsdTjJqLNmJF6t5QlJJteBG3ESdEuXHJeDa2rbgaun2HCKE0camzhixWHBzFs5KnlGfjVBGFiTNK8SYJasiA2AvgQXe9pG0pVmf8tY2GpfgTEwt83xeeIKQ6axeTcW8P9HO59uRZsIUKw-VZg")',
              }}
            />
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 px-4 py-8 md:px-10 lg:px-20 xl:px-40">
        <div className="mx-auto max-w-[1200px] flex flex-col gap-8">
          {/* Page Heading & Intro */}
          <div className="flex flex-col gap-2">
            <h1 className="text-[#111418] text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] dark:text-white">
              Cơ hội việc làm
            </h1>
            <p className="text-[#617589] text-base font-normal leading-normal dark:text-gray-400">
              Khám phá và ứng tuyển vào các tour phù hợp với chuyên môn và lịch
              trình của bạn.
            </p>
          </div>
          {/* Search & Filters */}
          <div className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm dark:bg-[#1A2633]">
            {/* Search Bar */}
            <label className="flex flex-col h-12 w-full">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-full border border-[#e5e7eb] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary overflow-hidden dark:border-gray-600">
                <div className="text-[#617589] flex bg-white items-center justify-center pl-4 dark:bg-[#232F3E] dark:text-gray-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  className="flex w-full min-w-0 flex-1 resize-none overflow-hidden text-[#111418] focus:outline-0 bg-white placeholder:text-[#9ca3af] px-4 text-base font-normal leading-normal dark:bg-[#232F3E] dark:text-white"
                  placeholder="Tìm theo tên tour, mã tour..."
                  value=""
                />
                <Button className="bg-primary hover:bg-blue-600 text-white px-6 font-medium transition-colors">
                  Tìm kiếm
                </Button>
              </div>
            </label>
            {/* Filter Chips */}
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-sm font-medium text-[#617589] mr-1 dark:text-gray-400">
                Lọc theo:
              </span>
              <button className="group flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg border border-[#e5e7eb] bg-white hover:bg-gray-50 px-4 transition-all dark:bg-[#232F3E] dark:border-gray-600 dark:hover:bg-gray-700">
                <LocationOn className="w-5 h-5 text-[#617589] dark:text-gray-400" />
                <p className="text-[#111418] text-sm font-medium leading-normal dark:text-gray-200">
                  Thành phố
                </p>
                <ChevronDown className="w-5 h-5 text-[#617589] dark:text-gray-400" />
              </button>
              <button className="group flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg border border-[#e5e7eb] bg-white hover:bg-gray-50 px-4 transition-all dark:bg-[#232F3E] dark:border-gray-600 dark:hover:bg-gray-700">
                <Calendar className="w-5 h-5 text-[#617589] dark:text-gray-400" />
                <p className="text-[#111418] text-sm font-medium leading-normal dark:text-gray-200">
                  Ngày khởi hành
                </p>
                <ChevronDown className="w-5 h-5 text-[#617589] dark:text-gray-400" />
              </button>
              <button className="group flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg border border-[#e5e7eb] bg-white hover:bg-gray-50 px-4 transition-all dark:bg-[#232F3E] dark:border-gray-600 dark:hover:bg-gray-700">
                <Wallet className="w-5 h-5 text-[#617589] dark:text-gray-400" />
                <p className="text-[#111418] text-sm font-medium leading-normal dark:text-gray-200">
                  Mức thù lao
                </p>
                <ChevronDown className="w-5 h-5 text-[#617589] dark:text-gray-400" />
              </button>
              <div className="h-6 w-px bg-gray-200 mx-2 dark:bg-gray-700"></div>
              <button className="text-sm font-medium text-primary hover:underline">
                Xóa bộ lọc
              </button>
            </div>
          </div>
          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-[#111418] font-medium dark:text-white">
              Tìm thấy <span className="font-bold">124</span> tour phù hợp
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#617589] dark:text-gray-400">
                Sắp xếp:
              </span>
              <select className="bg-transparent text-sm font-medium text-[#111418] focus:outline-none cursor-pointer dark:text-white">
                <option>Mới nhất</option>
                <option>Lương cao nhất</option>
                <option>Ngày gần nhất</option>
              </select>
            </div>
          </div>
          {/* Tours Grid */}
          <div className="grid grid-cols-1 gap-5">
            {/* Card 1: Urgent */}
            <div className="group relative flex flex-col items-stretch justify-start rounded-xl border border-transparent hover:border-primary/20 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-[#1A2633] dark:hover:border-primary/40 sm:flex-row sm:items-start">
              <div className="absolute top-4 left-4 z-10 rounded bg-red-50 px-2 py-1 text-xs font-bold text-red-600 border border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                GẤP / URGENT
              </div>
              <div
                className="w-full sm:w-48 md:w-64 h-48 sm:h-auto shrink-0 bg-center bg-no-repeat bg-cover rounded-lg overflow-hidden"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCozHXDoHHeUXthNVw2v-GQLD6h2-TkTxvMj23CHkIs4FhIAMaceyNcwviErAbrsZxVrzxDaaC5bolTQMRkVhr49snMCwgoAFXZAK54SpYzfZihWpcmn8C-g2j0up_sMvnQCxZ7qYkX59v0xEnri_XyAoq_kyEidU3_PPzsGLP5liURjmxIkXqwCrbXbymj7y-jb1LR3Jb1ULiSNBp9jARibW1t8oLBFgT3lHS54UuUUj2g-WAzT8Xat6ryqTORdhhr_FuoBExnAQ")',
                }}
              >
                <div className="h-full w-full bg-gradient-to-t from-black/50 to-transparent sm:hidden"></div>
              </div>
              <div className="flex w-full grow flex-col justify-between gap-3 p-2 sm:px-6 sm:py-2">
                {/* Header Info */}
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[#617589] text-xs font-bold uppercase tracking-wider dark:text-gray-400">
                          Tour Code: #VN25-HLB01
                        </p>
                      </div>
                      <h3 className="text-[#111418] text-xl font-bold leading-tight group-hover:text-primary transition-colors cursor-pointer dark:text-white">
                        Hanoi - Ha Long Bay Luxury Cruise (3D2N)
                      </h3>
                    </div>
                    <button className="text-gray-400 hover:text-primary transition-colors">
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="size-5 rounded-full bg-gray-200 overflow-hidden">
                      <Image
                        alt="Logo"
                        className="h-full w-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkvOOKNHX-wNDWzXDwFqCbLLgFdmhG9d-OEvw1ZYyv7YTaU8_5y6Ai8TqSjxavhB1yGz2Pr7KgZxkGpVVw8mVS4W78cFJkHdojCP5MPhYfHXr7IdGHywbDFvzYgBJyuLXOUHW06NmZsJemPNZtO00-EWBnpMCj9wqiVKxNJb2Uj0FlnJTSTAGSDW8gG2D39yZkJznHMHTE-7ZABBWH5PA2o8Rn797wjVaPzhxieRcbn5M8EkX2IbTrJQkACK4rGytKuMJ5V7ovmQ"
                        width={20}
                        height={20}
                      />
                    </div>
                    <p className="text-[#111418] text-sm font-medium dark:text-gray-300">
                      VietTravel Corp
                    </p>
                    <Verified className="w-4 h-4 text-blue-500" title="Verified Operator" />
                  </div>
                </div>
                {/* Logistics */}
                <div className="flex flex-wrap gap-4 text-sm text-[#617589] dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-[18px] h-[18px]" />
                    <span>12/10/2025</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-[18px] h-[18px]" />
                    <span>3 Days 2 Nights</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <LocationOn className="w-[18px] h-[18px]" />
                    <span>Hanoi {'&'} Ha Long</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-[18px] h-[18px]" />
                    <span>English</span>
                  </div>
                </div>
                <div className="h-px w-full bg-gray-100 dark:bg-gray-700"></div>
                {/* Pricing & Action */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-8 rounded bg-blue-50/50 px-3 py-1.5 dark:bg-blue-900/10">
                      <span className="text-sm font-medium text-[#111418] dark:text-gray-200">
                        Main Guide
                      </span>
                      <span className="text-base font-bold text-primary">
                        3.000.000₫
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-8 rounded px-3 py-1.5 border border-dashed border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-[#617589] dark:text-gray-400">
                        Sub Guide
                      </span>
                      <span className="text-base font-semibold text-[#617589] dark:text-gray-400">
                        1.500.000₫
                      </span>
                    </div>
                  </div>
                  <Button className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-blue-600 text-white text-sm font-medium leading-normal transition-all shadow-sm hover:shadow active:scale-95">
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            </div>
            {/* Card 2: Standard */}
            <div className="group relative flex flex-col items-stretch justify-start rounded-xl border border-transparent hover:border-primary/20 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-[#1A2633] dark:hover:border-primary/40 sm:flex-row sm:items-start">
              <div
                className="w-full sm:w-48 md:w-64 h-48 sm:h-auto shrink-0 bg-center bg-no-repeat bg-cover rounded-lg overflow-hidden"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBogH4HH8WRbrOCMABjA3-w1a2Vkh27wWG8i95G8jf_mmrqJ-ssdWgxLFX5S1qFtbXELBiZHKoo154f1AEgDxEMMS6LyZ5yDRCY0rbZzBEragVFcx0MS9_U2Na3U2h8GXyvAwNQHlFlxjOgijdUtILzU4sQqjw4Tm_k8mn9ufIvsIP5nDEpoiIcs0s-zFttjfRR1rpQ4IiDxAmiipKQBNCBXwfqE5-zEpW_VhnuAniegG6rlqXq6-PlLtvaEfE3RA3nlUIvdvTBqw")',
                }}
              />
              <div className="flex w-full grow flex-col justify-between gap-3 p-2 sm:px-6 sm:py-2">
                {/* Header Info */}
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[#617589] text-xs font-bold uppercase tracking-wider dark:text-gray-400">
                          Tour Code: #VN25-SGN04
                        </p>
                      </div>
                      <h3 className="text-[#111418] text-xl font-bold leading-tight group-hover:text-primary transition-colors cursor-pointer dark:text-white">
                        Saigon Street Food Evening Tour
                      </h3>
                    </div>
                    <button className="text-gray-400 hover:text-primary transition-colors">
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="size-5 rounded-full bg-gray-200 overflow-hidden">
                      <Image
                        alt="Logo"
                        className="h-full w-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTiaWKA-6t8HxWOBFBgtAr2t_YhTm-h3E83xQKJj11W4mSUSck2WNMYD_IbPKbEf-VUcSpPasrYFauFuQVk0aaM2cbGigpB4ttorRMWXtBMFmlGoUBeBAdxtqbd7PkJWKM7EGfgK2EWRNla_E2aLnrvrmTfCFyx3KaPnNzoK2UCA0C3Ac17AV4_lYbYcty0oUm7yNSPxYKjMNMJIlc6wGFpdLSSjcpHwK9RPliRVspKwKuA0U6Pj-okhGK-TdI_C-LSrSoa_gUuQ"
                        width={20}
                        height={20}
                      />
                    </div>
                    <p className="text-[#111418] text-sm font-medium dark:text-gray-300">
                      Saigon Adventure
                    </p>
                  </div>
                </div>
                {/* Logistics */}
                <div className="flex flex-wrap gap-4 text-sm text-[#617589] dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-[18px] h-[18px]" />
                    <span>15/10/2025</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-[18px] h-[18px]" />
                    <span>4 Hours (18:00 - 22:00)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <LocationOn className="w-[18px] h-[18px]" />
                    <span>Ho Chi Minh City</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-[18px] h-[18px]" />
                    <span>French</span>
                  </div>
                </div>
                <div className="h-px w-full bg-gray-100 dark:bg-gray-700"></div>
                {/* Pricing & Action */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-8 rounded bg-blue-50/50 px-3 py-1.5 dark:bg-blue-900/10">
                      <span className="text-sm font-medium text-[#111418] dark:text-gray-200">
                        Main Guide
                      </span>
                      <span className="text-base font-bold text-primary">
                        800.000₫
                      </span>
                    </div>
                  </div>
                  <Button className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-blue-600 text-white text-sm font-medium leading-normal transition-all shadow-sm hover:shadow active:scale-95">
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            </div>
            {/* Card 3: Standard */}
            <div className="group relative flex flex-col items-stretch justify-start rounded-xl border border-transparent hover:border-primary/20 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-[#1A2633] dark:hover:border-primary/40 sm:flex-row sm:items-start">
              <div
                className="w-full sm:w-48 md:w-64 h-48 sm:h-auto shrink-0 bg-center bg-no-repeat bg-cover rounded-lg overflow-hidden"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC8i3wNUHJGYy8LyAdq2EVcnzCI022VzsgHL9x97tDlV0NmnM2IjikOE5WDZlNioRll7-14J-IOJJLIdKmi1A_ATi0DuNbZm1YyccrDFOjLKDZOXwzCNnMygICZ22iM3k02zbVOL9lZN2SWMOTzzAWdhP8rehi7S8uVYxAGCEJosPfIH4NATkjDjnFatrrJhKt14s2IGH16dyJiAADr04o1OWVwM9FXcwEozKQBnRSDgr_hTKt0SfhlSNnx31DpXUpzmlDufxR9vw")',
                }}
              />
              <div className="flex w-full grow flex-col justify-between gap-3 p-2 sm:px-6 sm:py-2">
                {/* Header Info */}
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[#617589] text-xs font-bold uppercase tracking-wider dark:text-gray-400">
                          Tour Code: #VN25-DN088
                        </p>
                      </div>
                      <h3 className="text-[#111418] text-xl font-bold leading-tight group-hover:text-primary transition-colors cursor-pointer dark:text-white">
                        Golden Bridge {'&'} Ba Na Hills Full Day
                      </h3>
                    </div>
                    <button className="text-gray-400 hover:text-primary transition-colors">
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="size-5 rounded-full bg-gray-200 overflow-hidden">
                      <Image
                        alt="Logo"
                        className="h-full w-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeGpuTWMk9mB0Az_5DjgWL-3gheOnm1EsbCsXMh_fgFcgARvCGFgAekHxxzObyeycW_z47be1H24feHTT3P9hlYVh85vJX3bDGaBDRz--Mc4x7U53-q4qQ3heKzHwVZxu-QIdfed4-l9R4Dg-0J6kGrp230egHZ0T4wEv2Nl_LFNsem4iLUqtYjQLUvdS6YtKRtDv_LdlnxVx7rlVI47sNgGaJSGolyx77AMs9IEQVqrvYSKHZ8nACif3swJFPrSiWeWF7L-Jpgw"
                        width={20}
                        height={20}
                      />
                    </div>
                    <p className="text-[#111418] text-sm font-medium dark:text-gray-300">
                      Da Nang Tourist
                    </p>
                    <Verified className="w-4 h-4 text-blue-500" title="Verified Operator" />
                  </div>
                </div>
                {/* Logistics */}
                <div className="flex flex-wrap gap-4 text-sm text-[#617589] dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-[18px] h-[18px]" />
                    <span>20/10/2025</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-[18px] h-[18px]" />
                    <span>1 Day</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <LocationOn className="w-[18px] h-[18px]" />
                    <span>Da Nang</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-[18px] h-[18px]" />
                    <span>Korean</span>
                  </div>
                </div>
                <div className="h-px w-full bg-gray-100 dark:bg-gray-700"></div>
                {/* Pricing & Action */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-8 rounded bg-blue-50/50 px-3 py-1.5 dark:bg-blue-900/10">
                      <span className="text-sm font-medium text-[#111418] dark:text-gray-200">
                        Main Guide
                      </span>
                      <span className="text-base font-bold text-primary">
                        1.200.000₫
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-8 rounded px-3 py-1.5 border border-dashed border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-[#617589] dark:text-gray-400">
                        Sub Guide
                      </span>
                      <span className="text-base font-semibold text-[#617589] dark:text-gray-400">
                        700.000₫
                      </span>
                    </div>
                  </div>
                  <Button className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-blue-600 text-white text-sm font-medium leading-normal transition-all shadow-sm hover:shadow active:scale-95">
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            </div>
            {/* Card 4: Sapa Trekking */}
            <div className="group relative flex flex-col items-stretch justify-start rounded-xl border border-transparent hover:border-primary/20 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-[#1A2633] dark:hover:border-primary/40 sm:flex-row sm:items-start">
              <div
                className="w-full sm:w-48 md:w-64 h-48 sm:h-auto shrink-0 bg-center bg-no-repeat bg-cover rounded-lg overflow-hidden"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCgwlyDlROpi8Riv7ViZb4p4MN6SCtH8lhTsskURtkhVmbhw5R2dgiM3fbuEWVewdYWqKZTTljmySqCkDVoz7sJTqo3amgi2JsgPdBGj2aYTGOWkIyUP03bEkBi1waNS_iURZbOXHp0DkLfFAV04CZQDp1k3L99nYrsnPMVxUkaxTsQroGeVMaxS-5272QAxUSG73Ekj1346ELA1o6Tdk4SmNuOPtI2bVUVYqYUGz1VcwX5Sbr5G9rli_8LZOzbfOuYOKnXMnnjLA")',
                }}
              />
              <div className="flex w-full grow flex-col justify-between gap-3 p-2 sm:px-6 sm:py-2">
                {/* Header Info */}
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[#617589] text-xs font-bold uppercase tracking-wider dark:text-gray-400">
                          Tour Code: #VN25-SP012
                        </p>
                      </div>
                      <h3 className="text-[#111418] text-xl font-bold leading-tight group-hover:text-primary transition-colors cursor-pointer dark:text-white">
                        Sapa Trekking Adventure (Homestay)
                      </h3>
                    </div>
                    <button className="text-gray-400 hover:text-primary transition-colors">
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="size-5 rounded-full bg-gray-200 overflow-hidden">
                      <Image
                        alt="Logo"
                        className="h-full w-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBz2mnK8oVhR7HBOEnv1W5Xno_4CF2ivPkAjFawfypx5DhDnh9IovVWuCuKwAmBpQO7I90_PFL1GLAeYy7nJ4ZqwzEI6HevX0DmAPv5aF1OxLFsbebYOXKxbjjUExBFx4T4Sq2upDe8cfcxbsWIw2Vt7JXyjsCs5EPpQ99VyG4xj-IrunXtlefC3SiJcC43VQrEviyQ1NA_f6NStghCpQ9pUFRn6MU_WdenNkw7Pki3S1L-IF7kSDAcVYcI8qpxa9HP_sNgZpHPZw"
                        width={20}
                        height={20}
                      />
                    </div>
                    <p className="text-[#111418] text-sm font-medium dark:text-gray-300">
                      Highland Tours
                    </p>
                  </div>
                </div>
                {/* Logistics */}
                <div className="flex flex-wrap gap-4 text-sm text-[#617589] dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-[18px] h-[18px]" />
                    <span>25/10/2025</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-[18px] h-[18px]" />
                    <span>2 Days 1 Night</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <LocationOn className="w-[18px] h-[18px]" />
                    <span>Lao Cai, Sapa</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-[18px] h-[18px]" />
                    <span>English</span>
                  </div>
                </div>
                <div className="h-px w-full bg-gray-100 dark:bg-gray-700"></div>
                {/* Pricing & Action */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-8 rounded bg-blue-50/50 px-3 py-1.5 dark:bg-blue-900/10">
                      <span className="text-sm font-medium text-[#111418] dark:text-gray-200">
                        Main Guide
                      </span>
                      <span className="text-base font-bold text-primary">
                        2.500.000₫
                      </span>
                    </div>
                  </div>
                  <Button className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-blue-600 text-white text-sm font-medium leading-normal transition-all shadow-sm hover:shadow active:scale-95">
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            </div>
          </div>
          {/* Pagination */}
          <div className="flex justify-center mt-4 mb-8">
            <nav aria-label="Pagination" className="flex items-center gap-1">
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-transparent text-[#617589] hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white font-medium shadow-sm">
                1
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-transparent text-[#617589] hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
                2
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-transparent text-[#617589] hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
                3
              </button>
              <span className="flex h-10 w-10 items-center justify-center text-[#617589] dark:text-gray-400">
                ...
              </span>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-transparent text-[#617589] hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
                12
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-transparent text-[#617589] hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
                <ChevronRight className="w-5 h-5" />
              </button>
            </nav>
          </div>
        </div>
      </main>
    </div>
  );
}

