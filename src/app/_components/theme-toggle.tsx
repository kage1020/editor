"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <div className="fixed top-4 md:top-20 left-16 md:left-4 z-[15] rounded-full bg-background">
      <Button
        size="icon"
        variant="ghost"
        aria-label={
          resolvedTheme === "light"
            ? "Switch to dark theme"
            : "Switch to light theme"
        }
        className="size-12 rounded-full [&_svg]:size-5"
        onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
      >
        {resolvedTheme === "light" && <Sun />}
        {resolvedTheme !== "light" && <Moon />}
      </Button>
    </div>
  )
}
