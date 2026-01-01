import * as React from "react"

export interface FormFieldProps {
  label?: React.ReactNode
  helper?: React.ReactNode
  error?: React.ReactNode
  children: React.ReactNode
  className?: string
  labelClassName?: string
}

export default function FormField({ label, helper, error, children, className, labelClassName }: FormFieldProps) {
  return (
    <label className={`flex flex-col ${className ?? ""}`}>
      {label ? <p className={labelClassName ?? "text-[#111418] dark:text-gray-200 text-base font-medium leading-normal pb-2"}>{label}</p> : null}
      {children}
      {helper ? <p className="text-sm text-[#617589] mt-2">{helper}</p> : null}
      {error ? <p className="text-sm text-red-600 mt-2">{error}</p> : null}
    </label>
  )
}
