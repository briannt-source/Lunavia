import Image from "next/image";
import Link from "next/link";
import {
  TravelExplore,
  Verified,
  Mail,
  Badge,
  Lock,
  Eye,
  LockKeyhole,
  Gavel,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function UserRegistrationPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#283039] bg-[#111418]/90 backdrop-blur-md px-4 py-3 lg:px-10">
        <div className="flex items-center gap-4 text-white">
          <div className="size-8 text-primary flex items-center justify-center">
            <TravelExplore className="h-8 w-8" />
          </div>
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            Vietnam Tourism Connect
          </h2>
        </div>
        <div className="hidden md:flex flex-1 justify-end gap-8">
          <div className="flex items-center gap-9">
            <Link
              className="text-[#9dabb9] hover:text-white text-sm font-medium leading-normal transition-colors"
              href="#"
            >
              Support
            </Link>
            <Link
              className="text-[#9dabb9] hover:text-white text-sm font-medium leading-normal transition-colors"
              href="#"
            >
              Legal
            </Link>
          </div>
          <Link
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 border border-[#283039] hover:bg-[#283039] text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors"
            href="#"
          >
            <span className="truncate">Login</span>
          </Link>
        </div>
        <div className="md:hidden text-white">
          <Menu className="h-6 w-6 cursor-pointer" />
        </div>
      </header>
      <main className="flex-1 flex flex-col lg:flex-row">
        <div
          className="relative hidden lg:flex w-full lg:w-5/12 xl:w-1/2 flex-col justify-between p-12 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(rgba(17, 20, 24, 0.3), rgba(17, 20, 24, 0.8)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuBWarKyDiR71_MAZ0HwlAVFQDPQ4Xs-qmaz1YVqoevT9L9byIx0by3d6mEd7a6oV7SE67cHexOp_IJOgnb0vhbQuVVOwFL414gBPYEzVsplAIV3kyhYVS-LVBKDLHOZFX9tcxIG31xCyseDO3dvdT8W6w2IE2K4IjB3MzzBS0TB34dvoVRKEFkDMksZmFL9c_XTsyLh4ge7pzxSfhUs_rLf09Nqpa3-92fwRiXvV77omts7YAeDLfA1n6djiKKAEfqdKK3kmBzVVg')",
          }}
        >
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm border border-white/20">
              <Verified className="h-4 w-4" />
              <span>Official 2025 Compliance</span>
            </div>
          </div>
          <div className="relative z-10 max-w-lg">
            <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight text-white lg:text-5xl">
              Professional Tourism Network
            </h1>
            <p className="text-lg text-gray-200">
              Join the compliant platform for Vietnam&apos;s tourism sector. Connect seamlessly with
              verified operators and guides under the new Tourism Law framework.
            </p>
            <div className="mt-8 flex gap-4">
              <div className="flex -space-x-3">
                <Image
                  alt="User Avatar"
                  className="h-10 w-10 rounded-full border-2 border-[#111418] object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1iblSmI2SdDML8v759D12X2-RE4vJ7YcZwM2GpZwUm42Cc-61JTdqgDz2cnTS_ZMaNF-smVlhNp4nfTV3mj7xC4ZC2U34albxIsLr43XFzap_-BsKjLme7whlYCVtZW30Y69oLiOn1kJs62RlAQ9iezRdlvkiThE4WvrL9z0jpEbSVi9jyNsWjRKgYbIgcF3Onay-934a6vFC33y8YgmMR6nE6gaTlVOaNlzBMah-GUu-hFZUC4YcSbj76eJzSTw9Q-f1qxdJdA"
                  width={40}
                  height={40}
                />
                <Image
                  alt="User Avatar"
                  className="h-10 w-10 rounded-full border-2 border-[#111418] object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAELtIQZgirg0nArDpb-vR8pM6aE8pBU5HU-L9RaBhL8zoi_o9aLTzYk_s1-YB7z6nYfMuAu6Z6BaWIVohSaMIcZ05eorxsvBKhHN8VTgSFcxn4QS2V9V9iv3n--GR1joIEBSHVqfcuHgwbX65wk21Fz-to30Q4msJHuhNjBiCNSF4HSknz0Vwm-VW8lxoAqTR0cXNqZ1bUZmuKWTWS9gMpu7hnTa2kCejZGvLUJafRbKsoPvt8GSyqjr8utG2cN7MUxPrLflKamw"
                  width={40}
                  height={40}
                />
                <Image
                  alt="User Avatar"
                  className="h-10 w-10 rounded-full border-2 border-[#111418] object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_UhmMQr6ClddIdmPLsq1rQf-ZzgA0N5WwfJ11S4-fU597tQg6hWqeDfbR8hSI4gPA-JnM37eVVI8PvV4OwBTol7CFXDXvdHsXk5AZ2aPxaobvpWEdukcUCzJjYVQCOZxRZ_5RyMaxX1u8m1Gf5ujRL3TWrPdhtWw4FfqEACwqbq-Q9DYXtjD2AswREGU_p9TeY5rKkJuIxJULGgjLY59Y0cVj9WfNs9C-u83hykSTgiKGrH5IdQGcwDp_eyk9Y_UcKi6reqTPAQ"
                  width={40}
                  height={40}
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-sm font-bold text-white">2,000+ Professionals</span>
                <span className="text-xs text-gray-300">Registered this month</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full lg:w-7/12 xl:w-1/2 items-center justify-center bg-background-dark p-6 lg:p-12">
          <div className="w-full max-w-[560px] flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-white text-3xl font-bold leading-tight tracking-[-0.015em]">
                Create your Account
              </h2>
              <p className="text-[#9dabb9] text-base">
                Enter your details to register as a compliant professional.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium leading-normal">
                I am registering as a
              </label>
              <div className="flex h-12 w-full items-center justify-center rounded-lg bg-[#283039] p-1">
                <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-2 has-[:checked]:bg-primary has-[:checked]:text-white text-[#9dabb9] text-sm font-bold leading-normal transition-all">
                  <span className="truncate">Tour Operator / Agency</span>
                  <input
                    checked
                    className="invisible w-0 absolute"
                    name="role_selector"
                    type="radio"
                    value="Tour Operator / Agency"
                  />
                </label>
                <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-2 has-[:checked]:bg-primary has-[:checked]:text-white text-[#9dabb9] text-sm font-bold leading-normal transition-all">
                  <span className="truncate">Tour Guide</span>
                  <input
                    className="invisible w-0 absolute"
                    name="role_selector"
                    type="radio"
                    value="Tour Guide"
                  />
                </label>
              </div>
            </div>
            <form className="flex flex-col gap-5 mt-2" onSubmit={(e) => e.preventDefault()}>
              <label className="flex flex-col flex-1">
                <p className="text-white text-sm font-medium leading-normal pb-2">
                  Email Address
                </p>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#9dabb9]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <Input
                    className="w-full rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border-dark bg-surface-dark focus:border-primary h-12 pl-11 pr-4 text-base font-normal placeholder:text-[#586474]"
                    placeholder="name@company.com"
                    type="email"
                  />
                </div>
              </label>
              <label className="flex flex-col flex-1">
                <p className="text-white text-sm font-medium leading-normal pb-2">Display Name</p>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#9dabb9]">
                    <Badge className="h-5 w-5" />
                  </div>
                  <Input
                    className="w-full rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border-dark bg-surface-dark focus:border-primary h-12 pl-11 pr-4 text-base font-normal placeholder:text-[#586474]"
                    placeholder="Full Name or Agency Name"
                    type="text"
                  />
                </div>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="flex flex-col flex-1">
                  <p className="text-white text-sm font-medium leading-normal pb-2">Password</p>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#9dabb9]">
                      <Lock className="h-5 w-5" />
                    </div>
                    <Input
                      className="w-full rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border-dark bg-surface-dark focus:border-primary h-12 pl-11 pr-11 text-base font-normal placeholder:text-[#586474]"
                      placeholder="Min 8 characters"
                      type="password"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-[#9dabb9] hover:text-white">
                      <Eye className="h-5 w-5" />
                    </div>
                  </div>
                </label>
                <label className="flex flex-col flex-1">
                  <p className="text-white text-sm font-medium leading-normal pb-2">
                    Confirm Password
                  </p>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#9dabb9]">
                      <LockKeyhole className="h-5 w-5" />
                    </div>
                    <Input
                      className="w-full rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border-dark bg-surface-dark focus:border-primary h-12 pl-11 pr-11 text-base font-normal placeholder:text-[#586474]"
                      placeholder="Re-enter password"
                      type="password"
                    />
                  </div>
                </label>
              </div>
              <label className="flex items-start gap-3 mt-1 cursor-pointer group">
                <Checkbox className="h-5 w-5 cursor-pointer rounded border border-border-dark bg-surface-dark checked:border-primary checked:bg-primary transition-all" />
                <span className="text-[#9dabb9] text-sm leading-tight group-hover:text-gray-300 transition-colors">
                  I agree to the{" "}
                  <Link className="text-primary hover:underline" href="#">
                    Terms of Service
                  </Link>
                  ,{" "}
                  <Link className="text-primary hover:underline" href="#">
                    Privacy Policy
                  </Link>
                  , and Compliance Regulations.
                </span>
              </label>
              <Button
                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary hover:bg-blue-600 text-white text-base font-bold leading-normal tracking-[0.015em] transition-colors mt-2 shadow-[0_0_15px_rgba(19,127,236,0.3)] hover:shadow-[0_0_20px_rgba(19,127,236,0.5)]"
                type="submit"
              >
                Register Account
              </Button>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-[#9dabb9] text-sm">Already have an account?</span>
                <Link
                  className="text-white text-sm font-bold hover:text-primary transition-colors"
                  href="#"
                >
                  Login here
                </Link>
              </div>
            </form>
            <div className="mt-8 border-t border-[#283039] pt-6 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-[#586474]">
                <Gavel className="h-4.5 w-4.5" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Fully Compliant Platform
                </span>
              </div>
              <p className="text-[#586474] text-xs text-center max-w-sm">
                Data is encrypted and stored securely in accordance with Vietnam&apos;s Cyber
                Security Law and Tourism Law 2025.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

