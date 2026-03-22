import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Award,
  Scale,
  Shield,
  Users,
  ArrowRight,
} from "lucide-react";
import Header from "../layout/header";
import Footer from "../layout/footer";
import { FeatureCard } from "./welcome/feature-card";
import { RoleCard } from "./welcome/role-card";

/**
 * Lunavia Welcome Page Component
 * Main landing page for LUNAVIA platform
 * 
 * Converted from Google Stitch HTML following STITCH_CONVENTIONS.md
 * 
 * Location: src/components/stitch/lunavia-welcome-page.tsx
 * 
 * Reusable Components:
 * - WelcomeHeader: src/components/stitch/welcome/welcome-header.tsx
 * - WelcomeFooter: src/components/stitch/welcome/welcome-footer.tsx
 * - FeatureCard: src/components/stitch/welcome/feature-card.tsx
 * - RoleCard: src/components/stitch/welcome/role-card.tsx
 */
export default function LunaviaWelcomePage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-white antialiased overflow-x-hidden">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background-dark py-20 lg:py-32">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-background-dark/40 z-10"></div>
            <Image
              alt="Scenic landscape of Vietnam Halong Bay with boats"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRIRkcjxBkoMVft3a-xRrKBrAJ4QKDzMlgNNgUESsbAGgVqPEjIL50AoqRnOuG9gcRwaxOwdgbipIXcE9evh0caUOhMjOiKHACvWk1uswaQdWtLLU1l8KKy4MUdzs4u0VXLGTmDS7U2j47g1x6uikEgj7_5qn5j8pb2HLUsnSOdu7Fy9I4o6xPY1kWPNdrH-jFs_FcLuU6SlONnR61nLwXJ3qCk8-jiFDnhl596P7DWgiPHcO-QWT0VTkQBDkQiyvFc2nhvENKTA"
              fill
              className="object-cover opacity-60"
              priority
            />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <div className="mb-6 inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary ring-1 ring-inset ring-primary/30">
                Tourism Law 2025 Ready
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl mb-6">
                The Future of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-primary">
                  Professional Tourism
                </span>
              </h1>
              <p className="mt-4 text-lg leading-8 text-gray-300 sm:text-xl">
                Seamlessly connecting Licensed Tour Operators with Verified Tour Guides. Built to
                ensure 100% compliance with the new Vietnam Tourism Law 2025 regulations.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-lunavia-primary hover:scale-105 active:scale-95"
                  asChild
                >
                  <Link href="/auth/register?role=TOUR_AGENCY">
                    <Building2 className="h-5 w-5" />
                    Register as Agency
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-white/10 px-6 py-3.5 text-base font-bold text-white backdrop-blur-sm ring-1 ring-white/20 transition-all hover:bg-white/20 hover:scale-105 active:scale-95 border-white/20"
                  asChild
                >
                  <Link href="/auth/register?role=TOUR_GUIDE">
                    <Award className="h-5 w-5" />
                    Register as Guide
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Value Prop Grid */}
        <section className="bg-background-light dark:bg-background-dark py-16 sm:py-24 border-y border-gray-200 dark:border-border-dark">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={Scale}
                title="100% Legal Compliance"
                description="Automatically generate contracts that adhere to Tourism Law 2025. We verify every profile to ensure you never face regulatory risks."
              />
              <FeatureCard
                icon={Shield}
                title="Verified Professionals"
                description="Digital ID verification for every guide and agency. Trust is built-in with real-time license validation against the national database."
              />
              <FeatureCard
                icon={Users}
                title="Instant Matching"
                description="Find the perfect guide for your specific tour needs in seconds. Filter by language, specialty, region, and availability."
              />
            </div>
          </div>
        </section>

        {/* Role Selection Section */}
        <section className="bg-white dark:bg-surface-dark py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Choose Your Path
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Join the ecosystem tailored to your professional needs.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
              <RoleCard
                icon={Building2}
                iconBgColor="bg-lunavia-muted/50 dark:bg-blue-900/30"
                iconTextColor="text-lunavia-primary dark:text-blue-400"
                badgeText="For Business"
                badgeColor="bg-lunavia-muted/50 text-lunavia-primary-hover dark:bg-blue-900/50 dark:text-blue-300"
                title="Tour Operators"
                description="Streamline your operations with a reliable pool of vetted guides."
                features={[
                  "Access thousands of verified guide profiles",
                  "Automated compliant contracts",
                  "Simplified payment & scheduling",
                ]}
                buttonText="Register as Agency"
                buttonHref="/auth/register?role=TOUR_AGENCY"
              />
              <RoleCard
                icon={Users}
                iconBgColor="bg-emerald-100 dark:bg-emerald-900/30"
                iconTextColor="text-emerald-600 dark:text-emerald-400"
                badgeText="For Professionals"
                badgeColor="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                title="Tour Guides"
                description="Build your career, manage your reputation, and find reliable work."
                features={[
                  "Digital profile synced with license data",
                  "Direct booking requests from top agencies",
                  "Transparent reviews & ratings",
                ]}
                buttonText="Register as Guide"
                buttonHref="/auth/register?role=TOUR_GUIDE"
                checkIconColor="text-emerald-500"
              />
            </div>
          </div>
        </section>

        {/* CTA / Compliance Banner */}
        <section className="relative isolate overflow-hidden bg-gray-900 py-16 sm:py-24 lg:py-32">
          <div
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBO8YKydU54Pgl1cmldq474OZ4VDjcXQCnBWIl3zz3zrlcPrdt6KITInkCOn57H2klYwL-aEx4IE-NW4eQ0tnawtvZU1Q_NaVS8qW753MfguujleqN_xVFvidn_pS3qKXWXVAXimTGyhdjK_3HIwa733rCqG0jLcOKPqG2HTjKeU32oDqynqhVDsGPrUaqqfOn2Dw4ql1b0F0ltKcql6WvDzKMYzx7WDuoIr0FwsUT1fBoxWR3nftwgQWt2TzuL2l1q5zsGiOepOg')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-900/80"></div>
          </div>
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Fully Compliant with <br />
                Vietnam Tourism Law 2025
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
                Don&apos;t let regulatory changes disrupt your business. LUNAVIA ensures all digital
                contracts and profile verifications meet the latest government standards
                automatically.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button
                  className="rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-lunavia-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                  asChild
                >
                  <Link href="#">Learn about Compliance</Link>
                </Button>
                <Link
                  href="#"
                  className="text-sm font-semibold leading-6 text-white hover:text-primary transition-colors flex items-center gap-1"
                >
                  Contact Support <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
