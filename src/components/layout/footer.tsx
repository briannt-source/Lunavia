import Link from "next/link"
import LinkList from "../ui/link-list"
import SocialIcons from "../ui/social-icons"
import { Compass } from "lucide-react"

export default function Footer() {
  return (
    <footer aria-labelledby="footer-heading" className="bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-border-dark">
      <h2 className="sr-only" id="footer-heading">Footer</h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-white">
                <Compass className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">LUNAVIA</span>
            </div>
            <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">Connecting Vietnam&apos;s tourism professionals with trust, efficiency, and compliance.</p>
            <SocialIcons>
              <Link href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" aria-label="Facebook">
                <svg className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" aria-label="LinkedIn">
                <svg className="h-6 w-6" />
              </Link>
            </SocialIcons>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <LinkList title={"Platform"}>
                  <Link href="#" className="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">For Tour Operators</Link>
                  <Link href="#" className="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">For Tour Guides</Link>
                  <Link href="#" className="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Search Guides</Link>
                  <Link href="#" className="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Pricing</Link>
                </LinkList>
              </div>
              <div className="mt-10 md:mt-0">
                <LinkList title={"Support"}>
                  <Link href="/knowledge-base" className="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Help Center</Link>
                  <Link href="#" className="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Verification Process</Link>
                  <Link href="#" className="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Legal & Compliance</Link>
                  <Link href="#" className="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Contact Us</Link>
                </LinkList>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <LinkList title={"Legal"}>
                  <Link href="#" className="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Privacy Policy</Link>
                  <Link href="#" className="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Terms of Service</Link>
                  <Link href="#" className="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Data Protection</Link>
                </LinkList>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-gray-900/10 dark:border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">© 2024 LUNAVIA Platform. All rights reserved. Compliant with Vietnam Tourism Law.</p>
        </div>
      </div>
    </footer>
  )
}
