import { cn } from "@/lib/utils"

type PaginationProps = {
  currentPage: number
  totalPages: number
  className?: string
}

export default function Pagination({ currentPage, totalPages, className }: PaginationProps) {
  return (
    <div className={cn("flex justify-center mt-4 mb-8", className)}>
      <nav aria-label="Pagination" className="flex items-center gap-1">
        <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-transparent text-[#617589] hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">←</button>

        <button className={cn("flex h-10 w-10 items-center justify-center rounded-lg", currentPage === 1 ? "bg-primary text-white font-medium shadow-sm" : "border border-transparent text-[#617589] hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700")}>1</button>
        <button className={cn("flex h-10 w-10 items-center justify-center rounded-lg", currentPage === 2 ? "bg-primary text-white font-medium shadow-sm" : "border border-transparent text-[#617589] hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700")}>2</button>
        <button className={cn("flex h-10 w-10 items-center justify-center rounded-lg", currentPage === 3 ? "bg-primary text-white font-medium shadow-sm" : "border border-transparent text-[#617589] hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700")}>3</button>

        <span className="flex h-10 w-10 items-center justify-center text-[#617589] dark:text-gray-400">...</span>

        <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-transparent text-[#617589] hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">{totalPages}</button>
        <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-transparent text-[#617589] hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">→</button>
      </nav>
    </div>
  )
}
