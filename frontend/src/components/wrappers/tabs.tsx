import * as React from "react";
import {
  Tabs as ShadcnTabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface Tab {
  value: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  listClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

export const Tabs = ({
  tabs,
  defaultValue,
  value,
  onValueChange,
  className,
  listClassName,
  triggerClassName,
  contentClassName,
}: TabsProps) => {
  return (
    <ShadcnTabs
      defaultValue={defaultValue || tabs[0]?.value}
      value={value}
      onValueChange={onValueChange}
      className={cn("w-full", className)}
    >
      <TabsList className={cn("w-full justify-start", listClassName)}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={cn(
              "transition-all duration-200",
              "data-[state=active]:shadow-sm",
              triggerClassName
            )}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className={cn("mt-6", contentClassName)}
        >
          {tab.content}
        </TabsContent>
      ))}
    </ShadcnTabs>
  );
};

export { TabsContent, TabsList, TabsTrigger }; 