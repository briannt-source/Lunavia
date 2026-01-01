import { Add, Analytics, AnalyticsOutlined, AutoAwesome, Campaign, CheckCircle, Close, Dashboard, Download, FilterList, Gavel, Map, MoreVert, Settings, TrendingUp, VerifiedUser, Warning } from "lucide-react"
import StatCard from "../../../../components/ui/stat-card"
import IconWrapper from "../../../../components/ui/icon-wrapper"
import Table from "../../../../components/ui/table"

export interface AiAnalyticsDashboardProps {}

export default function AiAnalyticsDashboard(_props: AiAnalyticsDashboardProps) {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-main-light dark:text-text-main-dark overflow-hidden h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark flex flex-col h-full transition-colors duration-200">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 shadow-sm shrink-0" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDvowIpHQYKVh6A3pJN3QDbTwP6Goi9Q5SYE-YhM7eX0FRSMef2fMJGLnzzObXQ9mUSfQ__EwUQ0NOzC5JuZbwzAnABjCtKf8hfFgGDevCJSfKQcksmU8R6hzzQynYCLpDhpURPH77ooDYAKtAKDXKWAnzbatavRt8R0pVLvSizUZ_EC1hl21CojrY1u6YKkZzcnIoTVQWZhjznKnuuDYzaGlTQxQr6a7jEamg9ZJljDEPHZHbOxjzI8WTYE2O3ctJLK6WO5lar6A")' }} />
          <div className="flex flex-col overflow-hidden">
            <h1 className="text-text-main-light dark:text-text-main-dark text-base font-bold truncate">VietTour Connect</h1>
            <p className="text-text-sec-light dark:text-text-sec-dark text-xs truncate">Tour Operator Console</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-2">
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-sec-light dark:text-text-sec-dark hover:bg-background-light dark:hover:bg-background-dark hover:text-primary transition-colors" href="#">
            <Dashboard className="w-5 h-5" />
            <span className="text-sm font-medium">Dashboard</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary dark:text-blue-400" href="#">
            <Analytics className="w-5 h-5 text-primary dark:text-blue-400" />
            <span className="text-sm font-medium">AI Analytics</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-sec-light dark:text-text-sec-dark hover:bg-background-light dark:hover:bg-background-dark hover:text-primary transition-colors" href="#">
            <Map className="w-5 h-5" />
            <span className="text-sm font-medium">Active Tours</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-sec-light dark:text-text-sec-dark hover:bg-background-light dark:hover:bg-background-dark hover:text-primary transition-colors" href="#">
            👥
            <span className="text-sm font-medium">Guides</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-sec-light dark:text-text-sec-dark hover:bg-background-light dark:hover:bg-background-dark hover:text-primary transition-colors" href="#">
            <Gavel className="w-5 h-5" />
            <span className="text-sm font-medium">Compliance (Law '25)</span>
          </a>
          <div className="my-2 border-t border-border-light dark:border-border-dark"></div>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-sec-light dark:text-text-sec-dark hover:bg-background-light dark:hover:bg-background-dark hover:text-primary transition-colors" href="#">
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </a>
        </nav>
        <div className="p-4 border-t border-border-light dark:border-border-dark">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary dark:text-blue-400 text-sm font-bold">
              JD
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-medium text-text-main-light dark:text-text-main-dark">John Doe</p>
              <p className="text-xs text-text-sec-light dark:text-text-sec-dark">Admin Access</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark px-8 py-5 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">AI Performance Analytics</h1>
            <p className="text-text-sec-light dark:text-text-sec-dark text-sm">Real-time insights and regulatory compliance tracking for Law 2025.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors">
              <Download className="w-5 h-5" />
              <span className="text-sm font-medium">Export Report</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30">
              <Add className="w-5 h-5" />
              <span className="text-sm font-medium">New Analysis</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-8">
            <div className="relative group">
              <button className="flex h-9 items-center gap-2 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark px-3 text-sm font-medium shadow-sm hover:border-primary transition-colors">
                <span>Last 30 Days</span>
                <span>▼</span>
              </button>
            </div>
            <div className="relative group">
              <button className="flex h-9 items-center gap-2 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark px-3 text-sm font-medium shadow-sm hover:border-primary transition-colors">
                <span>All Tour Types</span>
                <span>▼</span>
              </button>
            </div>
            <div className="relative group">
              <button className="flex h-9 items-center gap-2 rounded-lg bg-primary text-white border border-primary px-3 text-sm font-medium shadow-sm shadow-primary/20">
                <span>Region: Da Nang</span>
                <Close className="w-4 h-4" />
              </button>
            </div>
            <div className="relative group ml-auto">
              <button className="flex h-9 items-center gap-2 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark px-3 text-sm font-medium shadow-sm hover:border-primary transition-colors">
                <FilterList className="w-4 h-4 text-text-sec-light dark:text-text-sec-dark" />
                <span>More Filters</span>
              </button>
            </div>
          </div>

          {/* KPI Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Stat 1 */}
            <StatCard
              label={"Total Revenue"}
              value={"3.2B VND"}
              subtitle={<p className="text-xs text-text-sec-light dark:text-text-sec-dark mt-1">vs 2.8B last month</p>}
              trend={<span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><TrendingUp className="w-3 h-3" /> 12%</span>}
            />

            {/* Stat 2 */}
            <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <p className="text-text-sec-light dark:text-text-sec-dark text-sm font-medium">Compliance Score</p>
                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Warning className="w-3 h-3" /> Action Needed
                </span>
              </div>
              <p className="text-2xl font-bold text-text-main-light dark:text-text-main-dark tracking-tight">88/100</p>
              <p className="text-xs text-text-sec-light dark:text-text-sec-dark mt-1">Law 2025 Readiness</p>
            </div>

            {/* Stat 3 */}
            <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <p className="text-text-sec-light dark:text-text-sec-dark text-sm font-medium">Avg. Satisfaction</p>
                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> 0.2%
                </span>
              </div>
              <p className="text-2xl font-bold text-text-main-light dark:text-text-main-dark tracking-tight">4.8/5.0</p>
              <p className="text-xs text-text-sec-light dark:text-text-sec-dark mt-1">Based on 142 reviews</p>
            </div>

            {/* Stat 4 */}
            <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <p className="text-text-sec-light dark:text-text-sec-dark text-sm font-medium">Active Tours</p>
                <span className="bg-gray-100 dark:bg-gray-800 text-text-sec-light dark:text-text-sec-dark text-xs px-2 py-0.5 rounded-full font-medium">
                  +2 new
                </span>
              </div>
              <p className="text-2xl font-bold text-text-main-light dark:text-text-main-dark tracking-tight">24</p>
              <p className="text-xs text-text-sec-light dark:text-text-sec-dark mt-1">Across 3 regions</p>
            </div>
          </div>

          {/* AI Insight Section */}
          <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <AutoAwesome className="w-32 h-32 text-primary" />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                <AutoAwesome className="w-6 h-6 text-primary dark:text-blue-400" />
                <h2 className="text-lg font-bold text-primary dark:text-blue-400">AI-Driven Strategic Insight</h2>
              </div>
              <h3 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark mb-2 max-w-3xl">Optimize Pricing for Ha Long Bay: Demand Shift Detected</h3>
              <p className="text-text-sec-light dark:text-text-sec-dark mb-6 max-w-2xl leading-relaxed">
                Our analysis indicates a <strong>15% drop</strong> in Tuesday bookings for Ha Long Bay tours compared to the seasonal average. However, weekend demand is exceeding capacity.
                AI suggests a dynamic pricing adjustment: <strong className="text-green-600 dark:text-green-400">-10% for Tuesdays</strong> to boost occupancy and <strong className="text-blue-600 dark:text-blue-400">+5% for weekends</strong>.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-medium shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all">
                  Apply Dynamic Pricing
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-main-light dark:text-text-main-dark font-medium hover:bg-background-light dark:hover:bg-background-dark transition-all">
                  View Detailed Report
                </button>
              </div>
            </div>
          </div>

          {/* Content Grid: Charts & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Chart Section: Revenue & Trends */}
            <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Revenue by Region</h3>
                <div className="flex gap-2">
                  <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary">Actual</span>
                  <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">Projected</span>
                </div>
              </div>
              {/* CSS Chart Simulation */}
              <div className="h-64 w-full flex items-end justify-between gap-4 px-2">
                {/* Bar 1 */}
                <div className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                  <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-md relative h-32 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-all duration-300">
                    <div className="absolute bottom-0 w-full bg-primary rounded-t-md h-[70%]"></div>
                  </div>
                  <span className="text-xs font-medium text-text-sec-light dark:text-text-sec-dark">Hanoi</span>
                </div>
                {/* Bar 2 */}
                <div className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                  <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-md relative h-48 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-all duration-300">
                    <div className="absolute bottom-0 w-full bg-primary rounded-t-md h-[85%]"></div>
                  </div>
                  <span className="text-xs font-medium text-text-sec-light dark:text-text-sec-dark">Da Nang</span>
                </div>
                {/* Bar 3 */}
                <div className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                  <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-md relative h-40 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-all duration-300">
                    <div className="absolute bottom-0 w-full bg-primary rounded-t-md h-[60%]"></div>
                  </div>
                  <span className="text-xs font-medium text-text-sec-light dark:text-text-sec-dark">HCMC</span>
                </div>
                {/* Bar 4 */}
                <div className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                  <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-md relative h-56 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-all duration-300">
                    <div className="absolute bottom-0 w-full bg-primary rounded-t-md h-[90%]"></div>
                  </div>
                  <span className="text-xs font-medium text-text-sec-light dark:text-text-sec-dark">Ha Long</span>
                </div>
                {/* Bar 5 */}
                <div className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                  <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-md relative h-24 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-all duration-300">
                    <div className="absolute bottom-0 w-full bg-primary rounded-t-md h-[45%]"></div>
                  </div>
                  <span className="text-xs font-medium text-text-sec-light dark:text-text-sec-dark">Sapa</span>
                </div>
              </div>
            </div>

            {/* Compliance / Recommendations List */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Action Items</h3>
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-1 rounded">3 Critical</span>
                </div>
                <div className="flex flex-col gap-3">
                  {/* Item 1 */}
                  <div className="p-3 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10 flex gap-3 items-start">
                    <Gavel className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-text-main-light dark:text-text-main-dark">Renew Guide Licenses</p>
                      <p className="text-xs text-text-sec-light dark:text-text-sec-dark mt-1">3 guides have certifications expiring in {'<'}30 days. Law 2025 compliance risk.</p>
                      <button className="mt-2 text-xs font-medium text-red-700 dark:text-red-400 hover:underline">View Guides</button>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="p-3 rounded-lg border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-900/10 flex gap-3 items-start">
                    <IconWrapper className="text-xl shrink-0 mt-0.5">✍️</IconWrapper>
                    <div>
                      <p className="text-sm font-bold text-text-main-light dark:text-text-main-dark">Digital Contract Gap</p>
                      <p className="text-xs text-text-sec-light dark:text-text-sec-dark mt-1">2 upcoming tours lack finalized digital contracts.</p>
                      <button className="mt-2 text-xs font-medium text-orange-700 dark:text-orange-400 hover:underline">Sign Now</button>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="p-3 rounded-lg border border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors flex gap-3 items-start cursor-pointer">
                    <Campaign className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-text-main-light dark:text-text-main-dark">Marketing Opportunity</p>
                      <p className="text-xs text-text-sec-light dark:text-text-sec-dark mt-1">Sapa tours are trending. Create a promo campaign?</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Data Table */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center">
              <h3 className="text-lg font-bold">Top Performing Tours</h3>
              <button className="text-primary text-sm font-medium hover:underline">View All</button>
            </div>
            <Table className="overflow-x-auto">
              <thead className="text-xs text-text-sec-light dark:text-text-sec-dark uppercase bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark">
                <tr>
                  <th className="px-6 py-3 font-medium">Tour Name</th>
                  <th className="px-6 py-3 font-medium">Region</th>
                  <th className="px-6 py-3 font-medium">Bookings</th>
                  <th className="px-6 py-3 font-medium">Rating</th>
                  <th className="px-6 py-3 font-medium">Revenue</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                <tr className="hover:bg-background-light dark:hover:bg-background-dark/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-text-main-light dark:text-text-main-dark">Ha Long Bay Luxury Cruise</td>
                  <td className="px-6 py-4 text-text-sec-light dark:text-text-sec-dark">Quang Ninh</td>
                  <td className="px-6 py-4 text-text-main-light dark:text-text-main-dark">1,240</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-yellow-400">
                      ⭐
                      <span className="text-text-main-light dark:text-text-main-dark ml-1 text-sm">4.9</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-main-light dark:text-text-main-dark">1.2B VND</td>
                  <td className="px-6 py-4"><span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-1 rounded-full font-medium">Active</span></td>
                </tr>
                <tr className="hover:bg-background-light dark:hover:bg-background-dark/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-text-main-light dark:text-text-main-dark">Da Nang City & Golden Bridge</td>
                  <td className="px-6 py-4 text-text-sec-light dark:text-text-sec-dark">Da Nang</td>
                  <td className="px-6 py-4 text-text-main-light dark:text-text-main-dark">980</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-yellow-400">
                      ⭐
                      <span className="text-text-main-light dark:text-text-main-dark ml-1 text-sm">4.7</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-main-light dark:text-text-main-dark">850M VND</td>
                  <td className="px-6 py-4"><span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-1 rounded-full font-medium">Active</span></td>
                </tr>
                <tr className="hover:bg-background-light dark:hover:bg-background-dark/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-text-main-light dark:text-text-main-dark">Hanoi Street Food Walk</td>
                  <td className="px-6 py-4 text-text-sec-light dark:text-text-sec-dark">Hanoi</td>
                  <td className="px-6 py-4 text-text-main-light dark:text-text-main-dark">850</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-yellow-400">
                      ⭐
                      <span className="text-text-main-light dark:text-text-main-dark ml-1 text-sm">4.8</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-main-light dark:text-text-main-dark">420M VND</td>
                  <td className="px-6 py-4"><span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs px-2 py-1 rounded-full font-medium">Review</span></td>
                </tr>
              </tbody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  )
}
