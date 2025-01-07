import * as React from "react";
import { Toggle as ShadcnToggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

export interface ToggleProps {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({
    pressed,
    onPressedChange,
    children,
    className,
    disabled,
    variant = "default",
    size = "default",
    ...props
  }, ref) => {
    return (
      <ShadcnToggle
        ref={ref}
        pressed={pressed}
        onPressedChange={onPressedChange}
        disabled={disabled}
        variant={variant}
        size={size}
        className={cn(
          "transition-all duration-200 ease-in-out",
          "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
          "hover:bg-muted/80",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </ShadcnToggle>
    );
  }
);

Toggle.displayName = "Toggle"; 