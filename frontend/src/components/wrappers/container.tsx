import * as React from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const containerSizes = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full",
} as const;

export const Container = ({
  children,
  className,
  size = "lg",
}: ContainerProps) => {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        containerSizes[size],
        className
      )}
    >
      {children}
    </div>
  );
}; 