import { memo } from "react"

export const CheckIcon = memo(
  ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
    return (
      <svg
        width="24"
        height="24"
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    )
  },
)

CheckIcon.displayName = "CheckIcon"
