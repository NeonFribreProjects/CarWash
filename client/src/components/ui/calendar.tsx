"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-4 bg-white rounded-lg shadow-sm border", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center mb-4",
          caption_label: "text-lg font-semibold text-gray-900",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-8 w-8 bg-white hover:bg-gray-50 border-gray-200 p-0 transition-all duration-200 hover:scale-105"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex mb-2",
          head_cell: "text-gray-500 rounded-md w-10 font-medium text-sm uppercase tracking-wide",
          row: "flex w-full mt-1",
          cell: cn(
            "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
            "h-10 w-10 rounded-md transition-all duration-200 hover:bg-gray-50"
          ),
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-10 w-10 p-0 font-normal text-gray-700 hover:bg-blue-50 hover:text-blue-600",
            "transition-all duration-200 rounded-md"
          ),
          day_selected: cn(
            "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700",
            "shadow-md transform scale-105 font-semibold"
          ),
          day_today: "bg-blue-50 text-blue-600 font-semibold border border-blue-200",
          day_outside: "text-gray-300 opacity-50",
          day_disabled: "text-gray-300 opacity-30 cursor-not-allowed",
          day_range_middle: "aria-selected:bg-blue-50 aria-selected:text-blue-600",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
          IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        }}
        {...props}
      />
    </motion.div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar } 