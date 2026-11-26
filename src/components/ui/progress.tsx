"use client";

import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

type ProgressTone = "default" | "warning" | "danger" | "cyan" | "lavender" | "yellow";

const toneClasses: Record<ProgressTone, string> = {
  default: "bg-primary",
  warning: "bg-peach",
  danger: "bg-coral",
  cyan: "bg-cyan",
  lavender: "bg-lavender",
  yellow: "bg-yellow",
};

function Progress({
  className,
  indicatorClassName,
  tone = "default",
  striped = true,
  value = 0,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  indicatorClassName?: string;
  tone?: ProgressTone;
  striped?: boolean;
}) {
  const clamped = Math.min(100, Math.max(0, value ?? 0));

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={clamped}
      className={cn(
        "border-ink bg-card relative h-4 w-full overflow-hidden rounded-full border-[2.5px] shadow-[2px_2px_0px_#111111]",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 transition-transform duration-500 ease-out",
          toneClasses[tone],
          clamped > 0 && clamped < 100 && "border-ink border-r-[2.5px]",
          striped && "poko-progress-stripes",
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - clamped}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
