"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Loader2, LogIn, LogOut, User, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { FaGithub, FaGoogle } from "react-icons/fa"
import { authClient } from "@/auth/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function AuthButton() {
  const { data: session, isPending } = authClient.useSession()
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const handleSignIn = (provider: "google" | "github") => {
    authClient.signIn.social({ provider })
  }

  const handleSignOut = () => {
    authClient.signOut()
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-[15] bg-background rounded-full">
      <motion.div
        ref={containerRef}
        className={cn(
          "h-12 border transition-colors duration-100 overflow-hidden hover:bg-accent group",
          open
            ? "rounded-lg border-border px-3 hover:bg-background"
            : "rounded-full border-transparent px-2 cursor-pointer",
        )}
        initial={{ width: 48 }}
        animate={{ width: open ? (session ? 280 : 128) : 48 }}
        transition={{ duration: 0.12, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between h-full">
          <div className="shrink-0 flex items-center justify-center space-x-4">
            <AnimatePresence mode="wait">
              {isPending && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                >
                  <Loader2 className="size-5 animate-spin text-foreground" />
                </motion.div>
              )}
              {!session && !isPending && !open && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      key="login"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      onClick={() => setOpen(true)}
                    >
                      <LogIn className="text-foreground size-5" />
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>Login</TooltipContent>
                </Tooltip>
              )}
              {session && !isPending && (
                <>
                  <motion.div
                    key="user"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    onClick={() => setOpen(true)}
                  >
                    <Avatar>
                      <AvatarImage
                        src={session.user.image ?? undefined}
                        alt={session.user.name}
                      />
                      <AvatarFallback>
                        <User className="text-foreground size-5" />
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                  {open && (
                    <motion.span
                      className="max-w-32 text-ellipsis overflow-hidden whitespace-nowrap text-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.12 }}
                    >
                      {session.user.name}
                    </motion.span>
                  )}
                </>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="flex items-center"
              >
                {!session && (
                  <div className="flex items-center space-x-4">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          className="cursor-pointer rounded-md"
                          onClick={() => handleSignIn("google")}
                        >
                          <FaGoogle className="size-5 text-foreground" />
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent>Google</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          className="cursor-pointer rounded-md"
                          onClick={() => handleSignIn("github")}
                        >
                          <FaGithub className="size-5 text-foreground" />
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent>GitHub</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          className="cursor-pointer rounded-md"
                          onClick={() => setOpen(false)}
                        >
                          <X className="size-5 text-foreground" />
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent>Close</TooltipContent>
                    </Tooltip>
                  </div>
                )}
                {session && (
                  <div className="flex items-center space-x-4">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          className="cursor-pointer rounded-md"
                          onClick={handleSignOut}
                        >
                          <LogOut className="size-5 text-foreground" />
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent>Logout</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          className="cursor-pointer rounded-md"
                          onClick={() => setOpen(false)}
                        >
                          <X className="size-5 text-foreground" />
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent>Close</TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
