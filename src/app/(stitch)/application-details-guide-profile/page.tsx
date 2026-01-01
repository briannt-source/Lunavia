import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  ArrowLeft,
  MapPin,
  Wallet,
  Clock,
  MessageSquare,
  FileText,
  User,
  Gavel,
  History,
  Quote,
  Shield,
  CheckCircle2,
  ThumbsUp,
  Star,
  X,
  Check,
  CreditCard,
  Translate,
  Award,
  GraduationCap,
  Verified,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ApplicationDetailsGuideProfilePage() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111418] dark:text-white font-display antialiased min-h-screen flex flex-col">
      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-6">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap gap-2 items-center mb-6 text-sm">
          <Link
            href="#"
            className="text-[#9dabb9] hover:text-white transition-colors font-medium"
          >
            Dashboard
          </Link>
          <ChevronRight className="text-[#9dabb9] h-4 w-4" />
          <Link
            href="#"
            className="text-[#9dabb9] hover:text-white transition-colors font-medium"
          >
            My Tours
          </Link>
          <ChevronRight className="text-[#9dabb9] h-4 w-4" />
          <Link
            href="#"
            className="text-[#9dabb9] hover:text-white transition-colors font-medium"
          >
            Ha Long Bay 2D1N
          </Link>
          <ChevronRight className="text-[#9dabb9] h-4 w-4" />
          <span className="text-white font-semibold">Application #AP-8832</span>
        </div>

        {/* Page Heading */}
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-white text-3xl md:text-4xl font-black tracking-tight">
              Application Review
            </h1>
            <p className="text-[#9dabb9] text-base">
              Review applicant details for compliance with Tourism Law 2025.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex items-center justify-center h-10 px-4 bg-[#283039] hover:bg-[#343e49] text-white text-sm font-bold rounded-lg transition-colors border border-transparent"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to List
            </Button>
          </div>
        </div>

        {/* Split Layout Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Tour Context (Sticky on Large Screens) */}
          <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-6">
            {/* Tour Snapshot Card */}
            <div className="bg-surface-dark rounded-xl overflow-hidden border border-border-dark shadow-sm">
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkGCrHHwvavUDSx_dQvJnOPtjn7WV45_YaN0mSloIhpWexR8FMr1_07DHb8UVYDU5SiTDVSOz1IHjB3wVLmKm2-ZoTXyH9w9vQJ9Vp30RJlqY3l8xhiP1PAnj44R54Tw2lXrIZtCcKwmN9qB8jVneChceoQdFjy9Pq5wzKrg2cN6A0_oRP5_XES7o_nx006gyLlcNFALUO5qEX00XTayQAYq2A3P2RU_aw2i0nYQv-575FI9dXLS_O4MSVg8ItuZ4YYziaO78dXQ"
                  alt="Scenic view of limestone karsts in Ha Long Bay Vietnam"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-block px-2 py-1 mb-2 text-xs font-bold text-white bg-primary rounded uppercase tracking-wider">
                    Tour Context
                  </span>
                  <h2 className="text-white text-xl font-bold leading-tight">
                    Ha Long Bay - 2 Days 1 Night
                  </h2>
                </div>
              </div>
              <div className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center py-2 border-b border-border-dark">
                  <span className="text-[#9dabb9] text-sm font-medium">Start Date</span>
                  <span className="text-white text-sm font-semibold">Oct 12, 2025</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border-dark">
                  <span className="text-[#9dabb9] text-sm font-medium">Duration</span>
                  <span className="text-white text-sm font-semibold">2 Days, 1 Night</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border-dark">
                  <span className="text-[#9dabb9] text-sm font-medium">Group Size</span>
                  <span className="text-white text-sm font-semibold">12 Pax (International)</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#9dabb9] text-sm font-medium">Offered Fee</span>
                  <span className="text-emerald-400 text-base font-bold">2,500,000 VND</span>
                </div>
                <Button className="w-full mt-2 py-2.5 px-4 bg-[#283039] hover:bg-[#343e49] text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                  <MapPin className="h-[18px] w-[18px]" />
                  View Full Itinerary
                </Button>
              </div>
            </div>

            {/* Application Status Card */}
            <div className="bg-surface-dark rounded-xl p-5 border border-border-dark shadow-sm">
              <h3 className="text-white text-base font-bold mb-4">Application Details</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <Wallet className="text-[#9dabb9] h-5 w-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[#9dabb9] uppercase font-bold tracking-wider">
                      Proposed Fee
                    </p>
                    <p className="text-white font-medium">2,500,000 VND (Matches Offer)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="text-[#9dabb9] h-5 w-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[#9dabb9] uppercase font-bold tracking-wider">
                      Applied On
                    </p>
                    <p className="text-white font-medium">Oct 01, 2025 • 09:42 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Guide Profile & Decision */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Profile Header */}
            <div className="bg-surface-dark rounded-xl p-6 border border-border-dark shadow-sm">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="relative group">
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-[#283039]">
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB45zM6guJPnZlHSPKPmAALOP-rXp241HrYBUk2Bsg-Tc5UJwLt32Ax8OxOm9WzglrTLs_KjOr9NjMDoZrbdePaZVXvU2yM5XaorHzD4jk6xUj5fBpACNIYFHez0LREtedWUu1OKJqKZ1lfCk0rdZ2ADtXA1_3IHZDQsaYWUt8huh3S8o-qPIXJ5g0Rds4ewbHIEwGFfrx2fQE3MPgTgiI5L3HD_auGSmQQ48rcNbevXZqBVGzzpVzhQgESFMt0fqKFETIy1E4Seg"
                      alt="Portrait of Nguyen Van A tour guide"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div
                    className="absolute bottom-1 right-1 bg-green-500 rounded-full p-1 border-4 border-surface-dark"
                    title="Online Now"
                  >
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-white text-2xl font-bold truncate">Nguyen Van A</h2>
                    <Verified className="text-primary h-5 w-5" title="KYC Verified" />
                    <span className="bg-blue-500/10 text-blue-400 text-xs font-bold px-2 py-0.5 rounded border border-blue-500/20">
                      Freelance
                    </span>
                  </div>
                  <p className="text-[#9dabb9] mb-3">
                    Professional English Speaking Guide • Hanoi Based
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1 bg-[#283039] px-2 py-1 rounded text-xs font-medium text-white">
                      <Star className="text-yellow-400 h-4 w-4 fill-yellow-400" />
                      <span>4.9 (42 Reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 bg-[#283039] px-2 py-1 rounded text-xs font-medium text-white">
                      <Award className="text-green-400 h-4 w-4" />
                      <span>Top Rated Badge</span>
                    </div>
                    <div className="flex items-center gap-1 bg-[#283039] px-2 py-1 rounded text-xs font-medium text-white">
                      <GraduationCap className="text-purple-400 h-4 w-4" />
                      <span>5 Years Exp.</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <Button className="flex-1 md:flex-none h-10 px-4 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                    <MessageSquare className="h-[18px] w-[18px]" />
                    Message
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 md:flex-none h-10 px-4 bg-[#283039] hover:bg-[#343e49] text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="h-[18px] w-[18px]" />
                    CV
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs & Content */}
            <div className="bg-surface-dark rounded-xl border border-border-dark overflow-hidden flex-1 flex flex-col">
              <Tabs defaultValue="overview" className="flex-1 flex flex-col">
                {/* Tab Navigation */}
                <TabsList className="flex border-b border-border-dark px-6 overflow-x-auto bg-transparent h-auto p-0">
                  <TabsTrigger
                    value="overview"
                    className="flex items-center gap-2 border-b-[3px] border-primary text-white pb-3 pt-4 px-2 mr-6 font-bold text-sm whitespace-nowrap data-[state=active]:border-primary data-[state=active]:text-white"
                  >
                    <User className="h-5 w-5" />
                    Overview & App
                  </TabsTrigger>
                  <TabsTrigger
                    value="legal"
                    className="flex items-center gap-2 border-b-[3px] border-transparent text-[#9dabb9] hover:text-white pb-3 pt-4 px-2 mr-6 font-bold text-sm whitespace-nowrap transition-colors data-[state=active]:border-primary data-[state=active]:text-white"
                  >
                    <Gavel className="h-5 w-5" />
                    Legal & Compliance
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="flex items-center gap-2 border-b-[3px] border-transparent text-[#9dabb9] hover:text-white pb-3 pt-4 px-2 mr-6 font-bold text-sm whitespace-nowrap transition-colors data-[state=active]:border-primary data-[state=active]:text-white"
                  >
                    <History className="h-5 w-5" />
                    History & Reviews
                  </TabsTrigger>
                </TabsList>

                {/* Tab Content Area */}
                <TabsContent value="overview" className="p-6 md:p-8 flex flex-col gap-8 m-0">
                  {/* Cover Letter Section */}
                  <div>
                    <h3 className="text-white text-lg font-bold mb-3 flex items-center gap-2">
                      <Quote className="h-5 w-5 text-primary" />
                      Cover Letter
                    </h3>
                    <div className="bg-[#111418] p-4 rounded-lg border border-border-dark text-[#d0d6dc] text-sm leading-relaxed">
                      <p className="mb-2">Dear Operator,</p>
                      <p className="mb-2">
                        I am writing to express my strong interest in the Ha Long Bay 2D1N tour
                        scheduled for Oct 12th. With over 5 years of experience guiding
                        international groups (specifically English and French speakers) through Ha
                        Long Bay and Lan Ha Bay, I am confident in my ability to deliver an
                        exceptional experience for your clients.
                      </p>
                      <p className="mb-2">
                        I have successfully led over 50 similar tours and am very familiar with the
                        logistics, safety protocols, and hidden gems of the bay. I am fully fully
                        vaccinated and hold a valid International Tour Guide License renewed under
                        the 2024 regulations.
                      </p>
                      <p>Looking forward to the possibility of collaborating.</p>
                    </div>
                  </div>

                  {/* Compliance Highlights (Crucial for decision) */}
                  <div>
                    <h3 className="text-white text-lg font-bold mb-3 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Compliance & Credentials
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#111418] p-4 rounded-lg border border-border-dark flex items-start gap-4">
                        <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400">
                          <CreditCard className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-[#9dabb9] text-xs font-bold uppercase mb-1">
                            Guide License (International)
                          </p>
                          <p className="text-white font-medium text-lg tracking-wide">
                            101-928-334
                          </p>
                          <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                            <CheckCircle2 className="h-[14px] w-[14px] fill-green-400" />
                            Valid until Dec 2028
                          </p>
                        </div>
                      </div>
                      <div className="bg-[#111418] p-4 rounded-lg border border-border-dark flex items-start gap-4">
                        <div className="bg-purple-500/10 p-2 rounded-lg text-purple-400">
                          <Translate className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-[#9dabb9] text-xs font-bold uppercase mb-1">Languages</p>
                          <div className="flex gap-2 flex-wrap">
                            <span className="text-white text-sm bg-[#283039] px-2 py-0.5 rounded">
                              English (Fluent)
                            </span>
                            <span className="text-white text-sm bg-[#283039] px-2 py-0.5 rounded">
                              French (Conv.)
                            </span>
                            <span className="text-white text-sm bg-[#283039] px-2 py-0.5 rounded">
                              Vietnamese (Native)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity / Trust Signals */}
                  <div>
                    <h3 className="text-white text-lg font-bold mb-3 flex items-center gap-2">
                      <ThumbsUp className="h-5 w-5 text-primary" />
                      Recent Feedback
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-[#111418] p-4 rounded-lg border border-border-dark">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="relative h-6 w-6 rounded-full overflow-hidden">
                              <Image
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoRbUqnHMFDV28MTZpAmFSWxZgIbCUu4mej7sSeQXR6AsWWkhgFIrbT4Wca7XVnXeZvUPZcELGYBn6ZpumPofKw_Zgf6v9vKFZDHdAy9k8nPaqxEp9aeNCdwXjOgLM9cAC4u9Pb0cZLOOgnKXct2sVArk0XkUtiVUhOafxBUR6vGAA8s5cpnbR8y_EIBz-U9oPmbwKE-zQdOT5TvxOyQskyOa1AlG5HriSacow5G660hF9lLUMANowMg2HY-TIFcQuT56s35DTiQ"
                                alt="Avatar of reviewer"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <span className="text-white text-sm font-semibold">
                              Amazing Vietnam Travel
                            </span>
                          </div>
                          <span className="text-[#9dabb9] text-xs">2 weeks ago</span>
                        </div>
                        <div className="flex text-yellow-400 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400" />
                          ))}
                        </div>
                        <p className="text-[#d0d6dc] text-sm">
                          &quot;Nguyen was fantastic with our VIP group. Very knowledgeable and
                          punctual. Highly recommended.&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="legal" className="p-6 md:p-8 m-0">
                  <p className="text-[#9dabb9]">Legal & Compliance content...</p>
                </TabsContent>

                <TabsContent value="history" className="p-6 md:p-8 m-0">
                  <p className="text-[#9dabb9]">History & Reviews content...</p>
                </TabsContent>
              </Tabs>

              {/* Sticky Action Footer (Inside Container) */}
              <div className="bg-[#151a21] border-t border-border-dark p-6 md:p-8 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label
                    className="text-sm font-medium text-[#9dabb9]"
                    htmlFor="reject-reason"
                  >
                    Reason for Rejection (Optional if Accepting)
                  </label>
                  <Input
                    className="w-full bg-[#111418] border border-border-dark rounded-lg px-4 py-3 text-white placeholder-[#586472] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    id="reject-reason"
                    placeholder="e.g. Schedule conflict, fee mismatch..."
                    type="text"
                  />
                </div>
                <div className="flex flex-col-reverse md:flex-row gap-4 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 md:max-w-[200px] h-12 rounded-lg border border-red-500/30 text-red-400 font-bold hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="h-5 w-5" />
                    Reject Application
                  </Button>
                  <Button className="flex-1 h-12 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2">
                    <Check className="h-5 w-5" />
                    Accept Application (Chấp nhận)
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

