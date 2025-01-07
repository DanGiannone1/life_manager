"use client";

import { ReactNode } from "react";
import { Layout } from "./layout";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
  containerWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export function AppLayout({
  children,
  className,
  containerWidth = "lg",
}: AppLayoutProps) {
  return (
    <Layout>
      <div
        className={cn(
          "mx-auto w-full",
          {
            "max-w-screen-sm": containerWidth === "sm",
            "max-w-screen-md": containerWidth === "md",
            "max-w-screen-lg": containerWidth === "lg",
            "max-w-screen-xl": containerWidth === "xl",
            "max-w-screen-2xl": containerWidth === "2xl",
            "max-w-none": containerWidth === "full",
          },
          className
        )}
      >
        {children}
      </div>
    </Layout>
  );
} 