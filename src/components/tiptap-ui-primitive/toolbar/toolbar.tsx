"use client"

import { forwardRef, useCallback, useEffect, useRef, useState } from "react"
import { Separator } from "@/components/tiptap-ui-primitive/separator"
import { cn } from "@/lib/utils"

type BaseProps = React.HTMLAttributes<HTMLDivElement>

interface ToolbarProps extends BaseProps {
  variant?: "floating" | "fixed"
}

const mergeRefs = <T,>(
  refs: Array<React.Ref<T> | null | undefined>,
): React.RefCallback<T> => {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value)
      } else if (ref && typeof ref === "object" && "current" in ref) {
        ;(ref as { current: T | null }).current = value
      }
    })
  }
}

const useObserveVisibility = (
  ref: React.RefObject<HTMLElement | null>,
  callback: () => void,
): void => {
  useEffect(() => {
    const element = ref.current
    if (!element) return

    let isMounted = true

    if (isMounted) {
      requestAnimationFrame(callback)
    }

    const observer = new MutationObserver(() => {
      if (isMounted) {
        requestAnimationFrame(callback)
      }
    })

    observer.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
    })

    return () => {
      isMounted = false
      observer.disconnect()
    }
  }, [ref, callback])
}

const useToolbarKeyboardNav = (
  toolbarRef: React.RefObject<HTMLDivElement | null>,
): void => {
  useEffect(() => {
    const toolbar = toolbarRef.current
    if (!toolbar) return

    const getFocusableElements = () =>
      Array.from(
        toolbar.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [role="button"]:not([disabled]), [tabindex="0"]:not([disabled])',
        ),
      )

    const navigateToIndex = (
      e: KeyboardEvent,
      targetIndex: number,
      elements: HTMLElement[],
    ) => {
      e.preventDefault()
      let nextIndex = targetIndex

      if (nextIndex >= elements.length) {
        nextIndex = 0
      } else if (nextIndex < 0) {
        nextIndex = elements.length - 1
      }

      elements[nextIndex]?.focus()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const focusableElements = getFocusableElements()
      if (!focusableElements.length) return

      const currentElement = document.activeElement as HTMLElement
      const currentIndex = focusableElements.indexOf(currentElement)

      if (!toolbar.contains(currentElement)) return

      const keyActions: Record<string, () => void> = {
        ArrowRight: () =>
          navigateToIndex(e, currentIndex + 1, focusableElements),
        ArrowDown: () =>
          navigateToIndex(e, currentIndex + 1, focusableElements),
        ArrowLeft: () =>
          navigateToIndex(e, currentIndex - 1, focusableElements),
        ArrowUp: () => navigateToIndex(e, currentIndex - 1, focusableElements),
        Home: () => navigateToIndex(e, 0, focusableElements),
        End: () =>
          navigateToIndex(e, focusableElements.length - 1, focusableElements),
      }

      const action = keyActions[e.key]
      if (action) {
        action()
      }
    }

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (toolbar.contains(target)) {
        target.setAttribute("data-focus-visible", "true")
      }
    }

    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (toolbar.contains(target)) {
        target.removeAttribute("data-focus-visible")
      }
    }

    toolbar.addEventListener("keydown", handleKeyDown)
    toolbar.addEventListener("focus", handleFocus, true)
    toolbar.addEventListener("blur", handleBlur, true)

    const focusableElements = getFocusableElements()
    focusableElements.forEach((element) => {
      element.addEventListener("focus", handleFocus)
      element.addEventListener("blur", handleBlur)
    })

    return () => {
      toolbar.removeEventListener("keydown", handleKeyDown)
      toolbar.removeEventListener("focus", handleFocus, true)
      toolbar.removeEventListener("blur", handleBlur, true)

      const focusableElements = getFocusableElements()
      focusableElements.forEach((element) => {
        element.removeEventListener("focus", handleFocus)
        element.removeEventListener("blur", handleBlur)
      })
    }
  }, [toolbarRef])
}

const useToolbarVisibility = (
  ref: React.RefObject<HTMLDivElement | null>,
): boolean => {
  const [isVisible, setIsVisible] = useState<boolean>(true)
  const isMountedRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const checkVisibility = useCallback(() => {
    if (!isMountedRef.current) return

    const toolbar = ref.current
    if (!toolbar) return

    // Check if any group has visible children
    const hasVisibleChildren = Array.from(toolbar.children).some((child) => {
      if (!(child instanceof HTMLElement)) return false
      if (child.getAttribute("role") === "group") {
        return child.children.length > 0
      }
      return false
    })

    setIsVisible(hasVisibleChildren)
  }, [ref])

  useObserveVisibility(ref, checkVisibility)
  return isVisible
}

const useGroupVisibility = (
  ref: React.RefObject<HTMLDivElement | null>,
): boolean => {
  const [isVisible, setIsVisible] = useState<boolean>(true)
  const isMountedRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const checkVisibility = useCallback(() => {
    if (!isMountedRef.current) return

    const group = ref.current
    if (!group) return

    const hasVisibleChildren = Array.from(group.children).some((child) => {
      if (!(child instanceof HTMLElement)) return false
      return true
    })

    setIsVisible(hasVisibleChildren)
  }, [ref])

  useObserveVisibility(ref, checkVisibility)
  return isVisible
}

const useSeparatorVisibility = (
  ref: React.RefObject<HTMLDivElement | null>,
): boolean => {
  const [isVisible, setIsVisible] = useState<boolean>(true)
  const isMountedRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const checkVisibility = useCallback(() => {
    if (!isMountedRef.current) return

    const separator = ref.current
    if (!separator) return

    const prevSibling = separator.previousElementSibling as HTMLElement
    const nextSibling = separator.nextElementSibling as HTMLElement

    if (!prevSibling || !nextSibling) {
      setIsVisible(false)
      return
    }

    const areBothGroups =
      prevSibling.getAttribute("role") === "group" &&
      nextSibling.getAttribute("role") === "group"

    const haveBothChildren =
      prevSibling.children.length > 0 && nextSibling.children.length > 0

    setIsVisible(areBothGroups && haveBothChildren)
  }, [ref])

  useObserveVisibility(ref, checkVisibility)
  return isVisible
}

export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  ({ children, className, variant = "fixed", ...props }, ref) => {
    const toolbarRef = useRef<HTMLDivElement>(null)
    const isVisible = useToolbarVisibility(toolbarRef)

    useToolbarKeyboardNav(toolbarRef)

    if (!isVisible) return null

    return (
      <div
        ref={mergeRefs([toolbarRef, ref])}
        role="toolbar"
        aria-label="toolbar"
        data-variant={variant}
        className={cn(
          "tiptap-toolbar",
          "flex items-center gap-1",
          variant === "fixed" && "sticky top-0 z-10 w-full min-h-[var(--tt-toolbar-height)] bg-[var(--tt-toolbar-bg-color)] border-b border-solid border-[var(--tt-toolbar-border-color)] px-2 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden max-[480px]:fixed max-[480px]:top-auto max-[480px]:bottom-0 max-[480px]:h-[calc(var(--tt-toolbar-height)+var(--tt-safe-area-bottom))] max-[480px]:border-t max-[480px]:border-b-0 max-[480px]:pb-[var(--tt-safe-area-bottom)] max-[480px]:flex-nowrap max-[480px]:justify-start",
          variant === "floating" && "p-[0.188rem] rounded-[calc(0.125rem+var(--tt-radius-lg)+1px)] border border-solid border-[var(--tt-toolbar-border-color)] bg-[var(--tt-toolbar-bg-color)] shadow-[var(--tt-shadow-elevated-md)] outline-none overflow-hidden data-[plain=true]:p-0 data-[plain=true]:rounded-none data-[plain=true]:border-none data-[plain=true]:shadow-none data-[plain=true]:bg-transparent max-[480px]:w-full max-[480px]:rounded-none max-[480px]:border-none max-[480px]:shadow-none",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)

Toolbar.displayName = "Toolbar"

export const ToolbarGroup = forwardRef<HTMLDivElement, BaseProps>(
  ({ children, className, ...props }, ref) => {
    const groupRef = useRef<HTMLDivElement>(null)
    const isVisible = useGroupVisibility(groupRef)

    if (!isVisible) return null

    return (
      <div
        ref={mergeRefs([groupRef, ref])}
        role="group"
        className={cn(
          "tiptap-toolbar-group",
          "flex items-center gap-0.5 empty:hidden [&:empty+.tiptap-separator]:hidden [.tiptap-separator+&:empty]:hidden",
          "[.tiptap-toolbar[data-variant=fixed]_&]:max-[480px]:flex-[0_0_auto]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)

ToolbarGroup.displayName = "ToolbarGroup"

export const ToolbarSeparator = forwardRef<
  HTMLDivElement,
  BaseProps & {
    fixed?: boolean
  }
>(({ fixed = false, ...props }, ref) => {
  const separatorRef = useRef<HTMLDivElement>(null)
  const isVisible = useSeparatorVisibility(separatorRef)

  if (!isVisible && !fixed) return null

  return (
    <Separator
      ref={mergeRefs([separatorRef, ref])}
      orientation="vertical"
      decorative
      {...props}
    />
  )
})

ToolbarSeparator.displayName = "ToolbarSeparator"
