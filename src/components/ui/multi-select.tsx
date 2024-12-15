"use client"

import * as React from "react"
import { X, Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"

export interface Option {
  id: string;
  name: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  onCreateOption?: (value: string) => Promise<void>;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  onCreateOption,
  placeholder = "选择标签...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const [pendingChanges, setPendingChanges] = React.useState<string[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false)
  const [pendingCreate, setPendingCreate] = React.useState<string>("")

  React.useEffect(() => {
    setPendingChanges(selected)
  }, [selected])

  const handleConfirmChanges = () => {
    onChange(pendingChanges)
    setOpen(false)
    setShowConfirmDialog(false)
  }

  const handleCancelChanges = () => {
    setPendingChanges(selected)
    setShowConfirmDialog(false)
  }

  const handleCreateTag = async () => {
    if (onCreateOption && pendingCreate) {
      await onCreateOption(pendingCreate)
      setPendingCreate("")
    }
  }

  const selectedOptions = options.filter((option) =>
    selected.includes(option.id)
  )

  const filteredOptions = options.filter((option) =>
    option?.name?.toLowerCase().includes(inputValue?.toLowerCase() || '') || false
  )

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between hover:bg-transparent",
              className
            )}
          >
            <div className="flex gap-1 flex-wrap">
              {selectedOptions.length === 0 ? (
                <span key="placeholder">{placeholder}</span>
              ) : (
                selectedOptions.map((option) => (
                  <Badge
                    key={option.id}
                    variant="secondary"
                    className="mr-1"
                  >
                    {option.name}
                    <span
                      role="button"
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          e.stopPropagation()
                          onChange(selected.filter((value) => value !== option.id))
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onChange(selected.filter((value) => value !== option.id))
                      }}
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </Badge>
                ))
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              placeholder="搜索标签..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandEmpty className="py-2 px-4 text-sm">
              {onCreateOption && inputValue && (
                <button
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setPendingCreate(inputValue)
                    setShowConfirmDialog(true)
                  }}
                >
                  <Plus className="h-4 w-4" />
                  创建 "{inputValue}"
                </button>
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => {
                const isSelected = pendingChanges.includes(option.id)
                return (
                  <CommandItem
                    key={option.id}
                    onSelect={() => {
                      const newChanges = isSelected
                        ? pendingChanges.filter((id) => id !== option.id)
                        : [...pendingChanges, option.id]
                      setPendingChanges(newChanges)
                      setShowConfirmDialog(true)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.name}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingCreate ? "确认创建标签" : "确认更改标签"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingCreate
                ? `是否创建新标签 "${pendingCreate}"？`
                : "确认要更改所选标签吗？"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelChanges}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={pendingCreate ? handleCreateTag : handleConfirmChanges}
            >
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 