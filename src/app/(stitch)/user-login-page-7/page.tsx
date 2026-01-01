import Image from "next/image";
import Link from "next/link";
import {
  TravelExplore,
  Verified,
  Mail,
  Lock,
  Eye,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function UserLoginPage7() {
  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white antialiased min-h-screen flex flex-col">
      <div className="flex min-h-screen w-full flex-1">
        <div
          className="relative hidden w-0 flex-1 lg:block"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDyRM1Yd14tHq64zriXcwD6hSKH6-rKoCFUODJsvah7KdN-NCG1lj2t6ernNRmEHwQo3rcyFjtMOUjoOB-0qCpLPsal9MTJHM5MCLamuA6e8px1ToPWb-VF6lSKXTMrdIO8CzWkD9B_ZUHeYusrmTu2PwmgyiwHnqoVYJ2_b18lQhmGG4H3dSh1s7rXER24zM4cCoJQJReU3ID8Wu51UVRCCvrjMFZdmAbnqFsehgNfl2acUX7Oqh7rwtkTgjKeMRFV7K2isM_YcA')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-background-dark/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-10 z-10">
            <blockquote className="border-l-4 border-primary pl-4 mb-6">
              <p className="text-xl font-medium text-white italic">
                &quot;Connecting Vietnam&apos;s finest experiences with the world. Verified,
                compliant, and seamless.&quot;
              </p>
            </blockquote>
            <div className="flex items-center space-x-2 text-sm text-slate-300">
              <Verified className="h-5 w-5 text-primary" />
              <span>Fully compliant with Vietnam Tourism Law 2025</span>
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-background-light dark:bg-background-dark w-full lg:w-[45%] xl:w-[40%] border-l dark:border-[#1c2127] border-slate-200">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="text-center lg:text-left mb-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 text-primary mb-6">
                <TravelExplore className="h-7 w-7" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Log in to your account
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Access the tour operator portal compliant with Vietnam Tourism Law 2025.
              </p>
            </div>
            <div className="mt-8">
              <div className="space-y-6">
                <div>
                  <Label
                    className="block text-sm font-medium leading-6 text-slate-900 dark:text-white"
                    htmlFor="email"
                  >
                    Email address
                  </Label>
                  <div className="mt-2">
                    <Input
                      autoComplete="email"
                      className="block w-full rounded-lg border-0 py-3 bg-white dark:bg-[#1c2127] text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-[#3b4754] placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      id="email"
                      name="email"
                      placeholder="name@company.com"
                      required
                      type="email"
                    />
                  </div>
                </div>
                <div>
                  <Label
                    className="block text-sm font-medium leading-6 text-slate-900 dark:text-white"
                    htmlFor="password"
                  >
                    Password
                  </Label>
                  <div className="mt-2 relative rounded-lg shadow-sm">
                    <Input
                      autoComplete="current-password"
                      className="block w-full rounded-lg border-0 py-3 pr-10 bg-white dark:bg-[#1c2127] text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-[#3b4754] placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      required
                      type="password"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                      <Eye className="h-5 w-5" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Checkbox
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary bg-white dark:bg-[#1c2127] dark:border-[#3b4754]"
                      id="remember-me"
                      name="remember-me"
                    />
                    <Label
                      className="ml-2 block text-sm text-slate-900 dark:text-slate-300"
                      htmlFor="remember-me"
                    >
                      Remember me
                    </Label>
                  </div>
                  <div className="text-sm">
                    <Link className="font-medium text-primary hover:text-primary/80" href="#">
                      Forgot password?
                    </Link>
                  </div>
                </div>
                <div>
                  <Button
                    className="flex w-full justify-center rounded-lg bg-primary px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                    type="submit"
                  >
                    Sign in
                  </Button>
                </div>
              </div>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300 dark:border-[#3b4754]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-background-light dark:bg-background-dark px-2 text-slate-500">
                      Or continue with
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex w-full items-center justify-center gap-3 rounded-lg bg-white dark:bg-[#1c2127] px-3 py-3 text-sm font-semibold text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-[#3b4754] hover:bg-slate-50 dark:hover:bg-[#252b33] transition-colors"
                  >
                    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M12.0003 20.45c4.6475 0 8.5283-3.1754 9.8703-7.5583H12.0003V9.5833h11.2319c.1054.7675.1634 1.5583.1634 2.375 0 6.625-5.375 12-12 12-6.625 0-12-5.375-12-12s5.375-12 12-12c3.125 0 5.975 1.125 8.1834 3l-2.7334 2.7334c-1.425-1.2-3.325-1.95-5.45-1.95-4.65 0-8.45 3.775-8.45 8.2166s3.8 8.2167 8.45 8.2167z"
                        fill="currentColor"
                      ></path>
                    </svg>
                    <span className="text-sm font-medium">Google</span>
                  </Button>
                </div>
              </div>
            </div>
            <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?
              <Link
                className="font-semibold leading-6 text-primary hover:text-primary/80"
                href="#"
              >
                {" "}
                Sign up here
              </Link>
            </p>
            <div className="mt-8 flex justify-center lg:hidden">
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <Verified className="h-4 w-4 text-primary" />
                <span>Compliant with Vietnam Tourism Law 2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

