"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

const tiptapInputVariants = cva(
  "tiptap-input block w-full h-8 text-sm font-normal leading-[1.5] py-1.5 px-2 rounded-md bg-transparent appearance-none outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600",
  {
    variants: {
      variant: {
        default: "",
        clamp:
          "min-w-48 pr-0 text-ellipsis whitespace-nowrap focus:overflow-visible focus:[text-overflow:clip]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

interface InputProps
  extends React.ComponentProps<"input">,
    VariantProps<typeof tiptapInputVariants> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(tiptapInputVariants({ variant }), className)}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export const InputGroup = forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "tiptap-input-group",
        "relative flex flex-wrap items-stretch",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
})
InputGroup.displayName = "InputGroup"
