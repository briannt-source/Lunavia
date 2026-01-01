import { AlertCircle, Bell, Check, CheckCircle2, ChevronDown, Download, Filter, HelpCircle, Laptop, MapPin, MessageCircle, Phone, Search, Settings, Share2, LogOut, AlertTriangle, Clock } from "lucide-react"

export interface EmergencyManagementPageProps {}

export default function EmergencyManagementPage(_props: EmergencyManagementPageProps) {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[280px] bg-surface-dark flex flex-col border-r border-surface-highlight flex-shrink-0 z-20">
        <div className="p-4 flex flex-col h-full justify-between">
          <div className="flex flex-col gap-4">
            {/* Branding */}
            <div className="flex gap-3 items-center px-2">
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBDp9Ns1M0QtfKGEMr5Mi5uBlumrhN3uH3Y4ueDOOhrzD2tcKoD71JvKnN1dEzD1iXjW6wHH1yt01vSxur4q_WVnQSGXGX7MAMvYOnkc4y-bT1yrcTLlCMkFfqWF_ihcX1IwG3lEw7iuufEBKlIz1F0X29FlCdAcXw8zd9Xakg5KacNC3ozvRgFU0crwLuPGVvLKL3-lA76MMa-1dWIuujOElce2ZQ6sy6VtF2m4cf-LwnitSK04EdwBfeziLQT-NPbKhC1gR0pPQ")' }} />
              <div className="flex flex-col">
                <h1 className="text-white text-base font-bold leading-normal">TourOp Admin</h1>
                <p className="text-[#9dabb9] text-xs font-normal leading-normal">Management Portal</p>
              </div>
            </div>
            {/* Nav Links */}
            <nav className="flex flex-col gap-2 mt-4">
              <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#9dabb9] hover:bg-surface-highlight hover:text-white transition-colors" href="#">
                <Laptop className="w-5 h-5" />
                <span className="text-sm font-medium">Dashboard</span>
              </a>
              <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#9dabb9] hover:bg-surface-highlight hover:text-white transition-colors" href="#">
                <MapPin className="w-5 h-5" />
                <span className="text-sm font-medium">Tours</span>
              </a>
              <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#9dabb9] hover:bg-surface-highlight hover:text-white transition-colors" href="#">
                <Phone className="w-5 h-5" />
                <span className="text-sm font-medium">Guides</span>
              </a>
              {/* Active State */}
              <a className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/20 text-primary border border-primary/20" href="#">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-bold">Emergencies</span>
              </a>
              <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#9dabb9] hover:bg-surface-highlight hover:text-white transition-colors" href="#">
                <Settings className="w-5 h-5" />
                <span className="text-sm font-medium">Settings</span>
              </a>
            </nav>
          </div>
          {/* Bottom Actions */}
          <div className="px-3">
            <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-[#9dabb9] hover:text-white hover:bg-surface-highlight transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-surface-dark border-b border-surface-highlight flex-shrink-0">
          <div className="flex items-center gap-4 text-white">
            <h2 className="text-lg font-bold leading-tight tracking-tight">Emergency Response Center</h2>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-500 border border-red-500/20">Live Monitoring</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:flex h-10 w-64 bg-surface-highlight rounded-lg items-center px-3 gap-2">
              <Search className="w-5 h-5 text-[#9dabb9]" />
              <input className="bg-transparent border-none text-white text-sm focus:ring-0 w-full p-0 placeholder-[#9dabb9]" placeholder="Search incidents..." type="text" />
            </div>
            {/* Actions */}
            <div className="flex gap-2">
              <button className="size-10 flex items-center justify-center rounded-lg bg-surface-highlight text-white hover:bg-[#3e4a56] relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-surface-highlight"></span>
              </button>
              <button className="size-10 flex items-center justify-center rounded-lg bg-surface-highlight text-white hover:bg-[#3e4a56]">
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
            {/* Avatar */}
            <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 border border-surface-highlight cursor-pointer" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCaNB9TIP5251Dh6y67TEhcBXXBIKDtVeBTtdblQl-s-vFBKbVCAmlh2CsLuLsK6iSEnMWfMiYr8MSTAKBCB-An_7aCgy5DjkTN0IgH4GJks9l0gYGl1iQbs2A97GjeF2ccFB22zWtTZtseKsbO01P5wkzPOn3Hu-hwfDnoFTQCRPsZWAt0XKS5OaMLKkWDPa31Z3l_DJ0XJuLLDYm9Q_dAlkFlkmXaGn2fwpCp2avKnW7z_AAgIbPpaiIEvtbHH_TnaRPsA_rTTg")' }} />
          </div>
        </header>

        {/* Breadcrumbs & Heading */}
        <div className="px-6 py-4 flex flex-col gap-2 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <a className="text-[#9dabb9] hover:text-white transition-colors" href="#">Dashboard</a>
            <span className="text-[#9dabb9]">/</span>
            <span className="text-white font-medium">Emergency Management</span>
          </div>
        </div>

        {/* Master-Detail Layout */}
        <main className="flex-1 flex px-6 pb-6 gap-6 min-h-0">
          {/* LEFT PANEL: Triage List */}
          <div className="w-[400px] flex flex-col bg-surface-dark rounded-xl border border-surface-highlight flex-shrink-0 overflow-hidden shadow-lg">
            {/* Filters */}
            <div className="p-4 border-b border-surface-highlight flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-bold text-lg">Active Reports</h3>
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="flex gap-2">
                <select className="flex-1 h-9 bg-surface-highlight border-none rounded-lg text-white text-sm focus:ring-1 focus:ring-primary px-3">
                  <option>All Statuses</option>
                  <option>New</option>
                  <option>Acknowledged</option>
                  <option>Resolved</option>
                </select>
                <button className="h-9 w-9 flex items-center justify-center bg-surface-highlight rounded-lg text-[#9dabb9] hover:text-white hover:bg-[#3e4a56]">
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* List Items */}
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
              {/* Item 1: Active/Selected */}
              <div className="p-3 rounded-lg bg-surface-highlight border border-primary/50 cursor-pointer relative group transition-all hover:bg-[#323c46]">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg"></div>
                <div className="pl-2 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="bg-red-500/20 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/20 uppercase tracking-wide">New</span>
                    <span className="text-[#9dabb9] text-xs">10m ago</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm leading-tight">Accident - Fall Injury</h4>
                    <p className="text-[#9dabb9] text-xs mt-0.5 line-clamp-1">Tour: Amazing Ha Long Bay Cruise</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="size-5 rounded-full bg-gray-600 bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDnW_FXCATRCiy8kS1Pfox3GZHOslLW30rjq4IYzbFfov4IruUVkHIDkwqO04xruoU1e5zlj-qM4x5TNAZYWlDWUJhS1Enl9L4ZlzVTgYsSWEJyDBNFIWpH3KwuICiXTZcF3HevOQTvOYpBbPMM2p7PzdL1CHtMVAyAHGBPJkklrYvzqiiY7gKEbcsFLBpgMIs-0jFzd_hib_hCkW-FkrJR7hsWlytGoo5oB-4SKgIJFENp9x-2IDfMb2uvBWMP6ZIg8_hcSXtFog")' }} />
                    <span className="text-xs text-white">Nguyen Van A</span>
                  </div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="p-3 rounded-lg border border-transparent hover:bg-surface-highlight cursor-pointer transition-all">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="bg-yellow-600/20 text-yellow-500 text-[10px] font-bold px-2 py-0.5 rounded border border-yellow-600/20 uppercase tracking-wide">Acknowledged</span>
                    <span className="text-[#9dabb9] text-xs">45m ago</span>
                  </div>
                  <div>
                    <h4 className="text-[#cbd5e1] font-medium text-sm leading-tight">Medical - Food Poisoning</h4>
                    <p className="text-[#9dabb9] text-xs mt-0.5 line-clamp-1">Tour: Sapa Trekking Adventure</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="size-5 rounded-full bg-gray-600 bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDnJNgPJlFSZtlA4AmZj5A706x4Qv9U6eOwdQi_9wN1j1F0K4UIOKdhk6_m2dJNtmnfdjDrYbghGavBhgNK0HBdZpC_cXR_npEA8Ht-K56Vsx6Hrpq9uFxgeWVnoAx-vZaey-6zeKWZlYoFH9TR1yvxCNRatUswpNzSxxhWn4EGd6jbstWb_bTKnw6mmUH2U5Bhg7RBZzcYbnFEgKo0ti7ItXti1nVPkSnRa37uFt5SgrzqtwLndNgRZmoHugftYeZ-eUHtoxFDig")' }} />
                    <span className="text-xs text-[#9dabb9]">Le Thi B</span>
                  </div>
                </div>
              </div>

              {/* Item 3 */}
              <div className="p-3 rounded-lg border border-transparent hover:bg-surface-highlight cursor-pointer transition-all opacity-70">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="bg-green-600/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded border border-green-600/20 uppercase tracking-wide">Resolved</span>
                    <span className="text-[#9dabb9] text-xs">2h ago</span>
                  </div>
                  <div>
                    <h4 className="text-[#cbd5e1] font-medium text-sm leading-tight">Lost Property - Passport</h4>
                    <p className="text-[#9dabb9] text-xs mt-0.5 line-clamp-1">Tour: Hoi An Ancient Town Walk</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="size-5 rounded-full bg-gray-600 bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAAiRSrwRwZDlC7iyYYnOY50t2SiMwRwz2E7vWg7dlgEuTYqSTigWL5LELGIhKeoHGkcBh35nGp-onrNAbJfMjvPrnxQew999BtBNIBMNxBik2bEY0OfR5eIyqa9m3EKZQAt0Ut0REvgEiANA2Qf2h6h4e8mUyFi-kBgMBxXc79OmvkoRC7UVaW8Shi69dy4QnBh8pYk1f0iEJ1f2uhKOKZJCfdNBU6Mg_3-dgfTfp0lddSdfnyvdpf3KfKyuZsXJe6cjxYOz3IfA")' }} />
                    <span className="text-xs text-[#9dabb9]">Tran Van C</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Detail View */}
          <div className="flex-1 flex flex-col bg-surface-dark rounded-xl border border-surface-highlight overflow-hidden shadow-lg relative">
            {/* Detail Header */}
            <div className="px-6 py-4 border-b border-surface-highlight bg-[#151a21] flex justify-between items-start gap-4 flex-shrink-0">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-white tracking-tight">SOS-2025-8842</h2>
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">CRITICAL</span>
                </div>
                <p className="text-[#9dabb9] text-sm flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Reported Oct 24, 2025 at 14:30 (GMT+7)
                </p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-surface-highlight hover:bg-[#3e4a56] text-white text-sm font-bold rounded-lg border border-transparent transition-colors">
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-surface-highlight hover:bg-[#3e4a56] text-white text-sm font-bold rounded-lg border border-transparent transition-colors">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Scrollable Detail Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Alert Banner */}
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-4 items-start">
                <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-red-500 font-bold text-base mb-1">Incoming Emergency Report</h4>
                  <p className="text-white/80 text-sm">This report has been flagged as "Accident". Immediate action is required. Please verify guide safety and coordinate local medical response.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Col 1: Main Info & Incident */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  {/* Incident Description */}
                  <section>
                    <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                      <span>📝</span>
                      Incident Details
                    </h3>
                    <div className="bg-surface-highlight p-5 rounded-lg border border-[#3e4a56]">
                      <div className="mb-4">
                        <label className="text-[#9dabb9] text-xs font-bold uppercase tracking-wider mb-1 block">Description from Guide</label>
                        <p className="text-white text-base leading-relaxed">
                          "Guest slipped on wet rocks near the Sung Sot Cave entrance. Suspected ankle fracture or severe sprain. Guest cannot walk. Currently applying ice pack and elevating leg. Need boat transport to mainland hospital immediately."
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[#9dabb9] text-xs font-bold uppercase tracking-wider mb-1 block">Category</label>
                          <p className="text-white font-medium">Physical Injury / Accident</p>
                        </div>
                        <div>
                          <label className="text-[#9dabb9] text-xs font-bold uppercase tracking-wider mb-1 block">Affected Guests</label>
                          <p className="text-white font-medium">1 (Mr. John Smith)</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Media / Evidence */}
                  <section>
                    <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                      <span>📸</span>
                      Attached Media
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="aspect-square bg-surface-highlight rounded-lg border border-[#3e4a56] overflow-hidden relative group cursor-pointer">
                        <div className="w-full h-full bg-cover bg-center transition-transform group-hover:scale-105" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC7G_Ti1zLz2K0XkkOh3_9hx-QwXvIEOUB31voqtUNjtxwg6VTrGkvJK5NGVFpUk1gFYudueMgvlFYw0MzfPzzMnbhXoejthjjNh3qsTLgXss03G4zBp2K4zxrxc3srSnHub3o7-QASmnUzUJLTJnfQdXTcx57rUQaNvBh87pr7S6PX-rQmLq35U8iz31Qk9noj3cG01ebzpbnln-Bn0RSmZ4DuV1ghErp61N3ugRV46k_nVm_h4E43PAH_PvEmMG40aqF6HXKqIg")' }} />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span>👁️</span>
                        </div>
                      </div>
                      <div className="aspect-square bg-surface-highlight rounded-lg border border-[#3e4a56] overflow-hidden relative group cursor-pointer">
                        <div className="w-full h-full bg-cover bg-center transition-transform group-hover:scale-105" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCJp76Kf-6qbaPmKKZWIVoQy2meB_n02CZxjSlgOESvrY4U2ANJAjF04T-lSj-vhdr0w79wuVoCKfPux732Z2ulkvXhQk0jir1kt8gLS9s06MfgJJHrr6tt37re4S5gm1V77oyz0_aeFD7CL8bp2zLQ0tRvdCA7ybvPpdekL8sDh7BgMbitALoBv2T-u7V1uEf6h3wMDLTJ49IDmpUFT8c-LYmXUcQTuHqkmXBYJLUVcwDeEvodSec3SYwU5vH94n9mgMvowL31kA")' }} />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span>👁️</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Tour Context */}
                  <section>
                    <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                      <span>🏖️</span>
                      Tour Context
                    </h3>
                    <div className="bg-surface-highlight p-4 rounded-lg border border-[#3e4a56] flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-bold text-base">Amazing Ha Long Bay Cruise (2D1N)</h4>
                        <p className="text-[#9dabb9] text-sm">Tour ID: HLB-2025-001 • Group Size: 15 Pax</p>
                      </div>
                      <button className="text-primary text-sm font-bold hover:underline">View Itinerary</button>
                    </div>
                  </section>
                </div>

                {/* Col 2: Sidebar Info (Guide, Loc, Actions) */}
                <div className="flex flex-col gap-6">
                  {/* Guide Card */}
                  <div className="bg-surface-highlight rounded-xl border border-[#3e4a56] p-5">
                    <h3 className="text-[#9dabb9] text-xs font-bold uppercase tracking-wider mb-4">Reporting Guide</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="size-12 rounded-full bg-gray-600 bg-cover bg-center border-2 border-[#3e4a56]" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCGmEtWTSqHl0xto_q4OBFZBY10QTzQtMgj_BFjI1e_oDbnhzQPsPjrkafGR2l0OgfjfCeMzG9jbvEUaBUrm1S9pIqJ2k3rIZf6MMOD_9Vorqn_ETmywSVczlCSAJ19f8G75QCRs5k-WEWbWVq_OE6kLTVhgCTdAuVgRk8zdYQhqTgH-LFvTOcSv5GN0z1EYSLVswiTmlRojbiz0ILDy_T5AprqqCMyG9AKzPyt2cMSzJXn2SirTGkVNmfa8jgdBXsytacQQ2jUqw")' }} />
                      <div>
                        <p className="text-white font-bold text-lg">Nguyen Van A</p>
                        <p className="text-[#9dabb9] text-sm">License: G-88219</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <a className="flex items-center justify-center gap-2 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors" href="tel:+84901234567">
                        <Phone className="w-5 h-5" />
                        Call (+84) 90 123 4567
                      </a>
                      <button className="flex items-center justify-center gap-2 w-full py-2 bg-[#0068FF] hover:bg-[#0054cc] text-white rounded-lg font-medium transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        Chat via Zalo
                      </button>
                    </div>
                  </div>

                  {/* Location Map */}
                  <div className="bg-surface-highlight rounded-xl border border-[#3e4a56] overflow-hidden flex flex-col">
                    <div className="h-48 w-full bg-gray-700 relative" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDiZ7AMB_w6GR-nXVfrX4W73ocQ1PlyiJjwuUx_HdrweE9v0lBDe9Uxzu-C9PehXhrCJ2Ca2QV8GIoZyV7ZmokDIsNqUCp2LpoWEuRvsmNtcJ7-f9jeh3yQAQhye0XAyYqJ4I3cGVZ5i2HddOsE-qAj7cM4dzKu7IbjhCks3q7RDSBr8xhLSE9KyoCPymfasXOpqPyUHleC4unP8ZrFgiSF-RsvBRvjq3eG1cvrB72-YChYaWu-4axlqdxltXTBhS2oTQKuyK6usg")' }}>
                      <div className="w-full h-full bg-cover bg-center opacity-70" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDiZ7AMB_w6GR-nXVfrX4W73ocQ1PlyiJjwuUx_HdrweE9v0lBDe9Uxzu-C9PehXhrCJ2Ca2QV8GIoZyV7ZmokDIsNqUCp2LpoWEuRvsmNtcJ7-f9jeh3yQAQhye0XAyYqJ4I3cGVZ5i2HddOsE-qAj7cM4dzKu7IbjhCks3q7RDSBr8xhLSE9KyoCPymfasXOpqPyUHleC4unP8ZrFgiSF-RsvBRvjq3eG1cvrB72-YChYaWu-4axlqdxltXTBhS2oTQKuyK6usg")' }} />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <span className="text-4xl drop-shadow-md">📍</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white font-bold text-sm">Current Location</span>
                        <span className="text-primary text-xs font-bold cursor-pointer">Open Maps</span>
                      </div>
                      <p className="text-[#9dabb9] text-xs font-mono">20.9101° N, 107.1839° E</p>
                      <p className="text-[#9dabb9] text-xs mt-1">Sung Sot Cave Area, Ha Long Bay</p>
                    </div>
                  </div>

                  {/* Timeline / Log */}
                  <div className="bg-surface-highlight rounded-xl border border-[#3e4a56] p-5 flex-1">
                    <h3 className="text-[#9dabb9] text-xs font-bold uppercase tracking-wider mb-4">Activity Log</h3>
                    <div className="relative pl-4 border-l-2 border-[#3e4a56] space-y-6">
                      <div className="relative">
                        <div className="absolute -left-[21px] top-0 size-3 bg-red-500 rounded-full border-2 border-surface-highlight"></div>
                        <p className="text-white text-sm font-medium">SOS Report Received</p>
                        <p className="text-[#9dabb9] text-xs">14:30 - System</p>
                      </div>
                      <div className="relative opacity-50">
                        <div className="absolute -left-[21px] top-0 size-3 bg-[#3e4a56] rounded-full border-2 border-surface-highlight"></div>
                        <p className="text-white text-sm font-medium">Operator Acknowledged</p>
                        <p className="text-[#9dabb9] text-xs">Pending...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Footer Actions */}
            <div className="p-4 bg-surface-dark border-t border-surface-highlight flex justify-between items-center flex-shrink-0 z-10">
              <div className="text-[#9dabb9] text-sm hidden md:block">
                Action required within <span className="text-red-500 font-bold">15 minutes</span>.
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none h-11 px-6 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20">
                  <CheckCircle2 className="w-5 h-5" />
                  Acknowledge Report
                </button>
                <button className="flex-1 md:flex-none h-11 px-6 rounded-lg bg-surface-highlight hover:bg-green-600 hover:text-white text-[#9dabb9] border border-[#3e4a56] font-bold text-sm transition-colors flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  Đã xử lý (Resolve)
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
