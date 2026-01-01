"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Compass } from "lucide-react"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-border-dark bg-white/95 dark:bg-background-dark/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-background-dark/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-white">
            <Compass className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">LUNAVIA</span>
        </div>
        <nav className="hidden md:flex gap-8">
          <Link href="#" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors">About</Link>
          <Link href="#" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors">Compliance</Link>
          <Link href="#" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors">Contact</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95" asChild>
            <Link href="/auth/signin">Login</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
