"use client"

import type { NodeViewProps } from "@tiptap/react"
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react"
import { Check, ChevronsUpDown } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const supportedLanguages = [
  { value: "", label: "Plain text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "jsx", label: "JSX" },
  { value: "tsx", label: "TSX" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "json", label: "JSON" },
  { value: "python", label: "Python" },
  { value: "bash", label: "Bash" },
  { value: "sql", label: "SQL" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "scala", label: "Scala" },
  { value: "dockerfile", label: "Dockerfile" },
  { value: "xml", label: "XML" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
]

export interface CodeBlockShikiNodeProps extends NodeViewProps {}

export const CodeBlockShikiNode: React.FC<CodeBlockShikiNodeProps> = ({
  node,
  updateAttributes,
}) => {
  const [language, setLanguage] = useState(node.attrs.language || "")
  const [open, setOpen] = useState(false)
  const { theme } = useTheme()

  const handleLanguageChange = (language: string) => {
    setLanguage(language)
    updateAttributes({
      language,
      theme: theme === "light" ? "light-plus" : "dark-plus",
    })
    setOpen(false)
  }

  useEffect(() => {
    updateAttributes({
      theme: theme === "light" ? "light-plus" : "dark-plus",
      language,
    })
  }, [updateAttributes, theme, language])

  return (
    <NodeViewWrapper className="bg-muted/20 text-foreground border border-border my-6 p-1 text-base rounded-[0.375rem]">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between bg-muted/20"
          >
            {supportedLanguages.find((lang) => lang.value === language)
              ?.label || "Select language"}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search Language" className="h-9" />
            <CommandList>
              <CommandEmpty>No language found.</CommandEmpty>
              <CommandGroup>
                {supportedLanguages.map((lang) => (
                  <CommandItem
                    key={lang.value}
                    value={lang.value}
                    onSelect={handleLanguageChange}
                  >
                    {lang.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        language === lang.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <pre>
        <code className="bg-transparent border-none rounded-none text-inherit">
          <NodeViewContent className="block w-full p-4 font-mono outline-none" />
        </code>
      </pre>
    </NodeViewWrapper>
  )
}
