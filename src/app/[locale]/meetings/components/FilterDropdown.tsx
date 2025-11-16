"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

type FilterDropdownProps = {
  label: string
  options: string[]
  selectedValues: string[]
  onValueChange: (value: string) => void
  formatValue?: (value: string) => string
  placeholder?: string
}

export default function FilterDropdown({
  label,
  options,
  selectedValues,
  onValueChange,
  formatValue,
  placeholder,
}: FilterDropdownProps) {
  const displayValue =
    selectedValues.length === 0
      ? placeholder || `All ${label}`
      : selectedValues.length === 1
        ? formatValue
          ? formatValue(selectedValues[0])
          : selectedValues[0]
        : `${selectedValues.length} selected`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 justify-between min-w-[160px] border-white/20 bg-transparent text-white hover:bg-white/10 backdrop-blur-xl"
        >
          <span className="truncate">{displayValue}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => {
          const isChecked = selectedValues.includes(option)
          return (
            <DropdownMenuCheckboxItem
              key={option}
              checked={isChecked}
              onCheckedChange={() => onValueChange(option)}
            >
              {formatValue ? formatValue(option) : option}
            </DropdownMenuCheckboxItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

