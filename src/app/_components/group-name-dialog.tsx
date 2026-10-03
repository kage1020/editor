"use client"

import { type FormEvent, useId, useState, useTransition } from "react"
import type { GroupActionResult } from "@/actions/group"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { GROUP_NAME_MAX_LENGTH } from "@/lib/document-groups"

interface GroupNameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  submitLabel: string
  defaultName?: string
  onSubmit: (name: string) => Promise<GroupActionResult>
}

export function GroupNameDialog({
  open,
  onOpenChange,
  ...formProps
}: GroupNameDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        {/* Mounted only while open, so each opening starts from a clean form. */}
        <GroupNameForm {...formProps} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function GroupNameForm({
  title,
  submitLabel,
  defaultName = "",
  onSubmit,
  onDone,
}: Omit<GroupNameDialogProps, "open" | "onOpenChange"> & {
  onDone: () => void
}) {
  const inputId = useId()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = String(new FormData(event.currentTarget).get("name") ?? "")

    startTransition(async () => {
      const result = await onSubmit(name)
      if (result.success) {
        onDone()
      } else {
        setError(describeFailure(result))
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-2">
        <label htmlFor={inputId} className="sr-only">
          Group name
        </label>
        <Input
          id={inputId}
          name="name"
          defaultValue={defaultName}
          placeholder="Group name"
          maxLength={GROUP_NAME_MAX_LENGTH}
          required
          autoFocus
          autoComplete="off"
          aria-invalid={error !== null}
          disabled={isPending}
        />
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  )
}

function describeFailure(
  result: Extract<GroupActionResult, { success: false }>,
): string {
  if (result.error === "Unauthorized") return "ログインが必要です"
  return result.details?.[0]?.message ?? result.error
}
