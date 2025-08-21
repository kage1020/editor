"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <div className="fixed top-4 md:top-20 left-16 md:left-4">
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          "h-12 w-12 flex rounded-full transition-all duration-300 ease-in-out border hover:bg-transparent border-transparent hover:border-neutral-400 dark:hover:bg-transparent",
          resolvedTheme === "light" && "hover:text-purple-600",
          resolvedTheme === "dark" && "hover:text-green-500",
        )}
        onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
      >
        {resolvedTheme === "light" && <Sun className="size-6" />}
        {resolvedTheme !== "light" && <Moon className="size-6" />}
      </Button>
    </div>
  )
}
