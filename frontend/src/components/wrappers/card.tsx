import * as React from "react";
import {
  Card as ShadcnCard,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
}

export const Card = ({
  children,
  title,
  description,
  footer,
  className,
  contentClassName,
  headerClassName,
  footerClassName,
}: CardProps) => {
  return (
    <ShadcnCard
      className={cn(
        "transition-shadow hover:shadow-lg",
        "border border-border/40",
        className
      )}
    >
      {(title || description) && (
        <CardHeader className={cn("space-y-1.5 p-6", headerClassName)}>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn("p-6 pt-0", contentClassName)}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className={cn("p-6 pt-0", footerClassName)}>
          {footer}
        </CardFooter>
      )}
    </ShadcnCard>
  );
};

export { CardContent, CardDescription, CardFooter, CardHeader, CardTitle }; 