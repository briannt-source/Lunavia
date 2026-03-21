import Link from "next/link";
import { Compass, Facebook, Linkedin, ArrowRight } from "lucide-react";
import SocialIcons from "../../ui/social-icons";

/**
 * Welcome Footer Component
 * Reusable footer for landing/welcome pages
 * 
 * Location: src/components/stitch/welcome/welcome-footer.tsx
 */
export function WelcomeFooter() {
  return (
    <footer
      aria-labelledby="footer-heading"
      className="bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-border-dark"
    >
      <h2 className="sr-only" id="footer-heading">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-white">
                <Compass className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">LUNAVIA</span>
            </div>
            <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
              Connecting Vietnam&apos;s tourism professionals with trust, efficiency, and
              compliance.
            </p>
            <SocialIcons>
              <Link
                href="#"
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-6 w-6" />
              </Link>
            </SocialIcons>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                  Platform
                </h3>
                <ul className="mt-6 space-y-4" role="list">
                  <li>
                    <Link
                      href="#"
                      className="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      For Tour Operators
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      For Tour Guides
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      Search Guides
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                  Support
                </h3>
                <ul className="mt-6 space-y-4" role="list">
                  <li>
                    <Link
                      href="/knowledge-base"
                      className="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      Verification Process
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      Legal & Compliance
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                  Legal
                </h3>
                <ul className="mt-6 space-y-4" role="list">
                  <li>
                    <Link
                      href="#"
                      className="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      Data Protection
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-gray-900/10 dark:border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
            © 2024 LUNAVIA Platform. All rights reserved. Compliant with Vietnam Tourism Law.
          </p>
        </div>
      </div>
    </footer>
  );
}



