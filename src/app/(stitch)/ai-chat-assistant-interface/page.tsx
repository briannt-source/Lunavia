import Link from "next/link";
import Image from "next/image";
import {
  TravelExplore,
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  Settings,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  UserCheck,
  Gavel,
  Edit,
  UserSearch,
  Paperclip,
  ArrowUp,
  X,
  MessageSquarePlus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AiChatAssistantInterfacePage() {
  return (
    <div className="flex h-screen w-full">
      {/* Left Sidebar (Main App Navigation) */}
      <div className="hidden md:flex w-20 flex-col items-center border-r border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark py-6 flex-shrink-0">
        <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
          <TravelExplore className="h-6 w-6" />
        </div>
        <nav className="flex flex-col gap-6 w-full items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-lg text-gray-400 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <LayoutDashboard className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-lg text-gray-400 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Users className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-lg text-gray-400 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <FileText className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-lg bg-primary/10 text-primary"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </nav>
        <div className="mt-auto flex flex-col gap-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-lg text-gray-400 hover:text-primary"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <div className="relative w-8 h-8">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiW7T9f-kT9PplJ_SY6v6kurJ6f7tE3dq8dyvnUXzymKXUUI02Jc5RPFDOFDdQruoVL6qowu3ewoxNUx_B19mJbVhgASEvoDk_h4mmvTh3j4AtfiwD4CXhROTcc_9TDFYK5k9daOrvNvP28aFjijjWB_xOVk-dRWuNY9S0CoPnh9QkNk5uQ7AcPH4hEPQi8TBpW7v1SiAErH1Qp0I3SJWbD_GJNBV0LG3YQksx-RzyxbzZhBLrm87UyGnzt0f3PkD7jjBc8djXjg"
              alt="user profile avatar"
              fill
              className="rounded-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Middle Content (Context - Mock Dashboard) */}
      <div className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark overflow-hidden relative">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Contracts Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-body">
              Manage guide agreements compliant with Law 2025
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Filter className="h-5 w-5" />
              Filter
            </Button>
            <Button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30">
              <Plus className="h-5 w-5" />
              New Contract
            </Button>
          </div>
        </header>

        {/* Mock Data Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="p-6 rounded-xl bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-green-500 bg-green-500/10 p-2 rounded-lg">
                  <UserCheck className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  COMPLIANT
                </span>
              </div>
              <h3 className="text-lg font-bold mb-1">Active Contracts</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">24</p>
            </div>

            <div className="p-6 rounded-xl bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-orange-500 bg-orange-500/10 p-2 rounded-lg">
                  <Clock className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  REVIEW NEEDED
                </span>
              </div>
              <h3 className="text-lg font-bold mb-1">Pending Review</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">3</p>
            </div>

            <div className="p-6 rounded-xl bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-primary bg-primary/10 p-2 rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <h3 className="text-lg font-bold mb-1">Available Guides</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">128</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-lg">Recent Agreements</h3>
              <Button variant="link" className="text-sm text-primary font-medium hover:underline">
                View All
              </Button>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {/* Table Row 1 */}
              <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="relative h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBj6EsRkNmcntC3JwaE36mOBTORcKsAdDV46E8zrAuV02BHT95dZIRCnUlgxBIn3PoZXqPw18dxohxwHItBbQpFGFLGcl_fePsjbFiRPhlQ-Qj8KtEOrKi2VEGWt5ozrRMPUDv7pC_sIFu1MKSno2NUxpqVDkhu-iVEEcQ1dWADky-GH5LiED2LGdDzJ6Hn4Bfdov4IJS6Rt4o27bG-mVOiKGoTaOoUxc-lT72IG3dfg5OwJM6aJSbM0tIZCFKu-g-TlN83HCjFCA"
                      alt="portrait of tour guide Nguyen Van A"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Nguyen Van A</p>
                    <p className="text-xs text-gray-500">Da Nang City Tour • 3 Days</p>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/20 dark:text-green-400">
                  Signed
                </span>
              </div>

              {/* Table Row 2 */}
              <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="relative h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBuBmrh_cCDNv1miEn6zifZ7NeZAXf0x7Qg7acY4W8oj90HLGRz8fSxrMqMHDwoOZjcEKtfgaeG0ErGQNDllxBP9uROFge1uJKyX2SoLzYG7ROvN6SNbFXcoj8mBuJfPl4jRIxE2Sui_05S5FwnR486gy4vT57EpiSDKo-LkCwzoS3HVXX4pw-1Qjo9UZWtyLD1p-qVGLbhF36qUWoUCGi0fNeCOYWQH40geIi-yKxyuZhcsL7eM1B5b7wDyo8j4yC2kWtETBpZQ"
                      alt="portrait of tour guide Tran Thi B"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Tran Thi B</p>
                    <p className="text-xs text-gray-500">Hoi An Ancient Town • 1 Day</p>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20 dark:bg-yellow-900/20 dark:text-yellow-400">
                  Drafting
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay Mask for smaller screens when chat is open (optional for UX) */}
        <div className="absolute inset-0 bg-black/20 z-10 hidden xl:hidden" id="chat-overlay"></div>
      </div>

      {/* Right Sidebar: AI Chat Assistant */}
      <div className="w-[400px] flex flex-col h-full bg-surface-light dark:bg-[#151a23] border-l border-gray-200 dark:border-gray-800 shadow-xl z-20 flex-shrink-0 relative transition-all">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-[#151a23]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="relative w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKbQ7ix9LYinpmX035oDv6kR6ShiHsshZkc8jvZFUypyvCfXe_6G5KyI17udthF3-VVKItYO7HToc-pdFPCvrIDHCAWZWY6K1G7HQC_IVvTvpBoVLBwz-agc6pFA-oONgxwvbFx0quU98c5JX2UgzYiM5d_uE42Y352GkT2Y0O0liIrL2akckF09E4j0ceaFvFjcqFvkfOZBr-dGS3dJIlgexm1SzWUUZPNiVgAse__RE3C1V2mMnXyKoglh1ocBuM4AViWd6Gqg"
                  alt="AI Assistant Robot Avatar"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-[#151a23]"></span>
            </div>
            <div>
              <h3 className="text-[#111318] dark:text-white text-base font-bold leading-tight tracking-[-0.015em]">
                AI Copilot
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Vietnam Tourism Law 2025</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Clear History"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="New Chat"
            >
              <MessageSquarePlus className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors xl:hidden"
              title="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Chat Content Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6 scroll-smooth bg-surface-light dark:bg-[#151a23]">
          {/* Date Separator */}
          <div className="flex justify-center">
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">
              Today
            </span>
          </div>

          {/* AI Welcome Message */}
          <div className="flex items-start gap-3">
            <div className="relative w-8 h-8 rounded-full shrink-0 mt-1 border border-gray-100 dark:border-gray-700 overflow-hidden">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrBivEYjkLdmedW_NCSLysYey6aB5isMuOdoT7AWZSYRZ8_BeWAXIPklF33aKaova6U2TjtndQX5XsGr5lupJvp2CjLVu9sUs_oexmFAho1duIGl3tPHiRpzE7jtr5ZuZUYbmyeCNDGbv_iwMgQuxuc0TWenOKaUaCmW8w5in_tXtgogOPFcpQVDZaGBx72eKhjO1cle-Wac73J0oozLpRC2JBQiWf1zKHrEBlQAc_TbFxUCqAQzSuoDAFfaXU9Fcr3YTTHn_qog"
                alt="AI Assistant Avatar Small"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-2 max-w-[85%]">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">AI Copilot</span>
                <span className="text-[10px] text-gray-400">09:41 AM</span>
              </div>
              <div className="text-sm font-normal leading-relaxed p-3.5 bg-[#f0f1f5] dark:bg-[#1e2430] text-[#111318] dark:text-gray-100 rounded-lg rounded-tl-none border border-transparent dark:border-gray-800">
                Hello! I&apos;m your legal assistant for the Vietnam Tourism Law 2025. I can help
                you verify contracts, check guide credentials, or draft compliant clauses. How can
                I assist you today?
              </div>
            </div>
          </div>

          {/* Suggestion Chips */}
          <div className="pl-11 flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1e2430] border border-gray-200 dark:border-gray-700 rounded-full hover:border-primary hover:text-primary dark:hover:border-primary transition-all group"
            >
              <Gavel className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-primary">
                Check Compliance
              </span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1e2430] border border-gray-200 dark:border-gray-700 rounded-full hover:border-primary hover:text-primary dark:hover:border-primary transition-all group"
            >
              <Edit className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-primary">
                Draft Contract
              </span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1e2430] border border-gray-200 dark:border-gray-700 rounded-full hover:border-primary hover:text-primary dark:hover:border-primary transition-all group"
            >
              <UserSearch className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-primary">
                Find Guide
              </span>
            </Button>
          </div>

          {/* User Message */}
          <div className="flex items-end gap-3 justify-end">
            <div className="flex flex-col gap-2 items-end max-w-[85%]">
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] text-gray-400">09:43 AM</span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Me</span>
              </div>
              <div className="text-sm font-normal leading-relaxed p-3.5 bg-primary text-white rounded-lg rounded-tr-none shadow-sm shadow-primary/20">
                I need a contract for a tour guide in Da Nang. Can you outline the mandatory
                clauses?
              </div>
            </div>
            <div className="relative w-8 h-8 rounded-full shrink-0 mb-1 overflow-hidden">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5OLx3hixeZvN44dxMkTAg8NMYYugQ1bcB6lDsLgQY-FMNC8dAoXBebofuLAJnqoGmtQbgY5DMdrZ-QZvme5lnHlPg4ZvvHQlGz7b8BIhInTdfetfu1YLrmMnNfueS0p2VVVrPe1J-eqCCC3HA-E-IDsPF4ENEcr9v3dP5_tQW2CSYfVwaCkPJNgTglMILiiDAUSYbqOnj_mfUBO2yzN0FcdUVIHiNtrO_-a-eiHtIUwU7dw0k16mAWiyR2fMOx81MYCF5PvdbPQ"
                alt="User Avatar Small"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* AI Response */}
          <div className="flex items-start gap-3">
            <div className="relative w-8 h-8 rounded-full shrink-0 mt-1 border border-gray-100 dark:border-gray-700 overflow-hidden">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgwCcMxKIxABbRn2gzT18bKyEo-PVwEh5sjjAYZRj3ly5EKTGa5PWtLRyJNi1sUSOPpcYz02vXpM2QPBIpKVLFEoZ8K5NACmXEkPsL3Jo3a0gBNnftSpggJwiLoQjQGqZ8yu3bUfI88F1hIvSBPNVrwlAfY3aNN07GCBLVPm2rOzSvzP_o7IqadBcn9_pUCohdLGeHzQJK2u25dHI3Kgsj2HAVvkQf4xmJYgS76Xx2qfC2PZK5yx6SxjqRuqpGwojabuBvdGnvzA"
                alt="AI Assistant Avatar Small"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-2 max-w-[90%]">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">AI Copilot</span>
                <span className="text-[10px] text-gray-400">09:43 AM</span>
              </div>
              <div className="text-sm font-normal leading-relaxed p-4 bg-[#f0f1f5] dark:bg-[#1e2430] text-[#111318] dark:text-gray-100 rounded-lg rounded-tl-none border border-transparent dark:border-gray-800 font-body">
                <p className="mb-3">
                  Certainly. Under the{" "}
                  <strong className="text-primary font-semibold">2025 Tourism Law</strong>, a
                  standard guide contract for Da Nang must include these 4 core components:
                </p>
                <ul className="list-none space-y-2 mb-4">
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-[18px] w-[18px] text-green-600 mt-0.5 shrink-0" />
                    <span>
                      <strong className="font-medium">Insurance:</strong> Mandatory liability
                      coverage for the duration of the tour.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-[18px] w-[18px] text-green-600 mt-0.5 shrink-0" />
                    <span>
                      <strong className="font-medium">Scope of Service:</strong> Specific
                      itinerary points within Da Nang city limits.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-[18px] w-[18px] text-green-600 mt-0.5 shrink-0" />
                    <span>
                      <strong className="font-medium">Payment Terms:</strong> Clear breakdown of
                      fees, tips policy, and cancellation rules.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-[18px] w-[18px] text-green-600 mt-0.5 shrink-0" />
                    <span>
                      <strong className="font-medium">Dispute Resolution:</strong> Reference to Da
                      Nang Tourism Arbitration Center.
                    </span>
                  </li>
                </ul>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Would you like me to generate a full draft based on a specific template?
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    className="text-xs font-medium px-3 py-1.5 bg-white dark:bg-black/20 rounded border border-gray-200 dark:border-gray-700 text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Generate Draft
                  </Button>
                  <Button
                    variant="outline"
                    className="text-xs font-medium px-3 py-1.5 bg-white dark:bg-black/20 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    See Citations
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-surface-light dark:bg-[#151a23] border-t border-gray-200 dark:border-gray-800">
          <div className="relative flex flex-col gap-2">
            {/* Input Wrapper */}
            <div className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0d1117] focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all shadow-sm">
              <Textarea
                className="block w-full rounded-xl border-0 bg-transparent py-3 pl-3 pr-12 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 resize-none font-body"
                placeholder="Ask about laws, contracts, or guides..."
                rows={2}
              />
              {/* Attach Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-2 left-2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200/50 dark:hover:bg-white/5 transition-colors"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              {/* Send Button */}
              <Button
                size="icon"
                className="absolute bottom-2 right-2 p-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowUp className="h-5 w-5 leading-none block" />
              </Button>
            </div>
            {/* Disclaimer */}
            <p className="text-[10px] text-center text-gray-400 dark:text-gray-500">
              AI responses are for assistance and do not constitute official legal advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

