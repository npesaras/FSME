import * as React from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "./utils";
import { buttonVariants } from "./button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      classNames={{
        root: cn("p-3", className),
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        month_caption: "relative flex justify-center items-center w-full pt-1",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "absolute left-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "absolute right-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-8 rounded-md text-[0.8rem] font-normal text-muted-foreground",
        week: "mt-2 flex w-full",
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          props.mode === "range"
            ? "[&:has(>button[aria-selected='true'])]:bg-accent/50 first:[&:has(>button[aria-selected='true'])]:rounded-l-md last:[&:has(>button[aria-selected='true'])]:rounded-r-md"
            : "",
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 rounded-full p-0 font-normal aria-selected:opacity-100",
        ),
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:shadow-sm [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground [&>button]:focus:bg-primary [&>button]:focus:text-primary-foreground",
        today:
          "[&>button]:bg-accent [&>button]:text-accent-foreground",
        outside:
          "text-muted-foreground opacity-50 [&>button]:text-muted-foreground",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        range_start:
          "day-range-start [&>button]:bg-primary [&>button]:text-primary-foreground",
        range_end:
          "day-range-end [&>button]:bg-primary [&>button]:text-primary-foreground",
        range_middle:
          "[&>button]:bg-accent [&>button]:text-accent-foreground",
        chevron: "size-4",
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...props }) => (
          orientation === "left" ? (
            <ChevronLeft className={cn("size-4", className)} {...props} />
          ) : orientation === "right" ? (
            <ChevronRight className={cn("size-4", className)} {...props} />
          ) : (
            <ChevronDown className={cn("size-4", className)} {...props} />
          )
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };
