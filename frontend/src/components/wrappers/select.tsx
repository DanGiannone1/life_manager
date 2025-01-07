import * as React from "react";
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type SelectProps as ShadcnSelectProps,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({
    options,
    value,
    onChange,
    placeholder = "Select an option",
    className,
    error,
    helperText,
    disabled,
    ...props
  }, ref) => {
    return (
      <div className="relative">
        <ShadcnSelect 
          defaultValue={value} 
          onValueChange={onChange} 
          disabled={disabled}
        >
          <SelectTrigger
            ref={ref}
            className={cn(
              error && "border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </ShadcnSelect>
        {helperText && (
          <p
            className={cn(
              "mt-1 text-sm",
              error ? "text-red-500" : "text-gray-500"
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select"; 