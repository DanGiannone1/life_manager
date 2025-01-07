import * as React from "react";
import {
  Dialog as ShadcnDialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface DialogProps {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Dialog = ({
  children,
  trigger,
  title,
  description,
  footer,
  className,
  contentClassName,
  open,
  onOpenChange,
}: DialogProps) => {
  return (
    <ShadcnDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(
          "duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
          "data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-left-1/2",
          "data-[state=open]:slide-in-from-top-[48%] data-[state=closed]:slide-out-to-top-[48%]",
          contentClassName
        )}
      >
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}
        {children}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </ShadcnDialog>
  );
};

export {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
}; 