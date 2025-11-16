"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ChevronDown } from "lucide-react"

type EmailsFilterProps = {
  uniqueEmails: string[]
  selectedEmails: string[]
  onEmailChange: (email: string, checked: boolean) => void
  onSelectAll: () => void
}

export function EmailsFilter({
  uniqueEmails,
  selectedEmails,
  onEmailChange,
  onSelectAll,
}: EmailsFilterProps) {
  if (uniqueEmails.length === 0) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 min-w-[180px] justify-between rounded-full border-white/20 bg-white/5 text-white/90 hover:bg-white/10"
        >
          <span className="truncate">
            {selectedEmails.length === 0
              ? "All Emails"
              : selectedEmails.length === 1
                ? selectedEmails[0]
                : `${selectedEmails.length} selected`}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 rounded-2xl border border-white/10 bg-[#05060a]/95 text-gray-100 shadow-[0_25px_60px_rgba(3,7,18,0.85)]">
        <div className="space-y-3">
          <label className="text-sm font-medium block">Emails</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer hover:bg-white/5 rounded-md p-2 -m-2">
              <Checkbox
                checked={selectedEmails.length === 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onSelectAll()
                  }
                }}
                className="border-gray-600 data-[state=checked]:bg-gray-600 data-[state=checked]:border-gray-600"
              />
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <span className="text-sm">All</span>
              </div>
            </label>
            {uniqueEmails.map((email) => {
              const isChecked = selectedEmails.includes(email)
              return (
                <label
                  key={email}
                  className="flex items-center gap-2 cursor-pointer hover:bg-white/5 rounded-md p-2 -m-2"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      onEmailChange(email, checked)
                    }}
                    className={isChecked ? "" : "border-gray-600"}
                  />
                  <span className="text-sm">{email}</span>
                </label>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}


