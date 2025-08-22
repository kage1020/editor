"use client"

import { forwardRef, useCallback } from "react"
import {
  Button,
  type ButtonProps,
  IconButton,
} from "@/components/tiptap-ui-primitive/button"
import { type UseUndoRedoConfig, useUndoRedo } from "./use-undo-redo"

interface UndoRedoButtonProps
  extends Omit<ButtonProps, "type">,
    UseUndoRedoConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
}

/**
 * Button component for triggering undo/redo actions in a Tiptap editor.
 *
 * For custom button implementations, use the `useHistory` hook instead.
 */
export const UndoRedoButton = forwardRef<
  HTMLButtonElement,
  UndoRedoButtonProps
>(({ action, text, onExecuted, onClick, children, ...buttonProps }, ref) => {
  const { handleAction, label, canExecute, Icon, shortcutKeys } = useUndoRedo({
    action,
    onExecuted,
  })

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)
      if (event.defaultPrevented) return
      handleAction()
    },
    [handleAction, onClick],
  )

  return (
    <Button
      type="button"
      disabled={!canExecute}
      variant="ghost"
      role="button"
      tabIndex={-1}
      aria-label={label}
      tooltip={label}
      shortcutKeys={shortcutKeys}
      onClick={handleClick}
      {...buttonProps}
      ref={ref}
    >
      {children ?? (
        <>
          <IconButton>
            <Icon />
          </IconButton>
          {text && <span className="tiptap-button-text">{text}</span>}
        </>
      )}
    </Button>
  )
})

UndoRedoButton.displayName = "UndoRedoButton"
