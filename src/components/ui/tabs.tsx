"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-3", className)}
      {...props}
    />
  );
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "border-ink bg-subtle shadow-brutal-sm inline-flex w-fit max-w-full flex-wrap items-center gap-1.5 rounded-2xl border-[2.5px] p-1.5",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "text-ink-muted hover:text-ink inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border-2 border-transparent px-3.5 py-1.5 text-sm font-bold whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-150",
        "data-[state=active]:border-ink data-[state=active]:bg-primary data-[state=active]:text-ink data-[state=active]:shadow-[2px_2px_0px_#111111]",
        "focus-visible:outline-ink focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:shadow-[0_0_0_5px_var(--lime)]",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "flex-1 rounded-2xl focus-visible:outline-ink focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:shadow-[0_0_0_5px_var(--lime)]",
        className
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
