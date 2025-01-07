import * as React from "react";
import {
  Toast as ShadcnToast,
  ToastProps as ShadcnToastProps,
  ToastProvider,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 7000,
} as const;

export interface ToastProps extends Omit<ShadcnToastProps, "duration"> {
  duration?: keyof typeof TOAST_DURATION;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, duration = "MEDIUM", ...props }, ref) => {
    return (
      <ShadcnToast
        ref={ref}
        className={cn(
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[swipe=end]:animate-out data-[state=closed]:fade-out-80",
          "slide-in-from-right-full data-[state=closed]:slide-out-to-right-full",
          "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
          "transition-all duration-300 ease-in-out",
          className
        )}
        duration={TOAST_DURATION[duration]}
        {...props}
      />
    );
  }
);

Toast.displayName = "Toast";

export { ToastProvider, ToastViewport, useToast }; 