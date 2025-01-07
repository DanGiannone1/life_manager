import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { DateRange } from "react-day-picker";

interface DatePickerProps {
  selected?: DateRange | undefined;
  onSelect?: (date: DateRange | undefined) => void;
  placeholder?: string;
  showClearButton?: boolean;
  onClear?: () => void;
}

export function DatePicker({
  selected,
  onSelect,
  placeholder = "Pick a date range",
  showClearButton = false,
  onClear,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const formatSelectedDate = () => {
    if (!selected?.from) return placeholder;
    if (selected.to) {
      return `${format(selected.from, "PPP")} - ${format(selected.to, "PPP")}`;
    }
    return format(selected.from, "PPP");
  };

  const handleSelect = React.useCallback(
    (range: DateRange | undefined) => {
      onSelect?.(range);
      if (range?.to) {
        setIsOpen(false);
      }
    },
    [onSelect]
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatSelectedDate()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={selected}
          onSelect={handleSelect}
          initialFocus
        />
        {showClearButton && selected && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                onClear?.();
                setIsOpen(false);
              }}
            >
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
} 