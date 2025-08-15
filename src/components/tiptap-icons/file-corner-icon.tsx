import { memo } from "react"

export const FileCornerIcon = memo(
  ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
      width="10"
      height="10"
      className={className}
      viewBox="0 0 10 10"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M0 0.75H0.343146C1.40401 0.75 2.42143 1.17143 3.17157 1.92157L8.82843 7.57843C9.57857 8.32857 10 9.34599 10 10.4069V10.75H4C1.79086 10.75 0 8.95914 0 6.75V0.75Z"
        fill="currentColor"
      />
    </svg>
  ),
)

FileCornerIcon.displayName = "FileCornerIcon"
