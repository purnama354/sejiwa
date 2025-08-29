import * as React from "react"
import { Controller, FormProvider, useFormContext } from "react-hook-form"
import { cn } from "@/lib/utils"

// Preserve react-hook-form generics by re-exporting FormProvider
export const Form = FormProvider

import type { ControllerProps, FieldValues, Path } from "react-hook-form"
export function FormField<TFieldValues extends FieldValues>(
  props: Omit<ControllerProps<TFieldValues>, "control"> & {
    name: Path<TFieldValues>
  }
) {
  const methods = useFormContext<TFieldValues>()
  return <Controller control={methods.control} {...props} />
}

export function FormItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />
}

export function FormLabel(props: React.ComponentProps<"label">) {
  return <label className="text-sm font-medium" {...props} />
}

export function FormControl({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />
}

export function FormMessage({ children }: { children?: React.ReactNode }) {
  if (!children) return null
  return <p className="text-sm text-destructive">{children}</p>
}
