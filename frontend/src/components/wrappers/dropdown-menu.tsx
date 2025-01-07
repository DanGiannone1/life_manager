import * as React from "react";
import {
  DropdownMenu as ShadcnDropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface DropdownMenuItemType {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: (DropdownMenuItemType | "separator")[];
  label?: string;
  className?: string;
  contentClassName?: string;
  itemClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const DropdownMenu = ({
  trigger,
  items,
  label,
  className,
  contentClassName,
  itemClassName,
  open,
  onOpenChange,
}: DropdownMenuProps) => {
  return (
    <ShadcnDropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild className={className}>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(
          "animate-in fade-in-0 zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=top]:slide-in-from-bottom-2",
          "data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2",
          contentClassName
        )}
      >
        {label && <DropdownMenuLabel>{label}</DropdownMenuLabel>}
        {items.map((item, index) => {
          if (item === "separator") {
            return <DropdownMenuSeparator key={index} />;
          }

          return (
            <DropdownMenuItem
              key={item.label}
              onClick={item.onClick}
              disabled={item.disabled}
              className={cn(
                "cursor-pointer transition-colors",
                item.className,
                itemClassName
              )}
            >
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </ShadcnDropdownMenu>
  );
};

export {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
}; 