import * as React from "react"
import FormField from "../form/form-field"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function FilterBar() {
  return (
    <FormField className="h-12 w-full">
      <div className="flex w-full flex-1 items-stretch rounded-lg h-full border border-[#e5e7eb] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary overflow-hidden dark:border-gray-600">
        <div className="text-[#617589] flex bg-white items-center justify-center pl-4 dark:bg-[#232F3E] dark:text-gray-400">
          <Search className="w-5 h-5" />
        </div>
        <input className="flex w-full min-w-0 flex-1 resize-none overflow-hidden text-[#111418] focus:outline-0 bg-white placeholder:text-[#9ca3af] px-4 text-base font-normal leading-normal dark:bg-[#232F3E] dark:text-white" placeholder="Search by tour name, tour code..." />
        <Button asChild>
          <button className="bg-primary hover:bg-blue-600 text-white px-6 font-medium transition-colors">Tìm kiếm</button>
        </Button>
      </div>
    </FormField>
  )
}
