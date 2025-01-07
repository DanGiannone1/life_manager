import * as React from "react";
import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type ButtonProps as ShadcnButtonProps } from "@/components/ui/button";

export type ButtonProps = ShadcnButtonProps;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <ShadcnButton
        className={cn(className)}
        variant={variant}
        size={size}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button"; 