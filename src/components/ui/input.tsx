import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-ink bg-card text-ink placeholder:text-ink-soft selection:bg-primary selection:text-primary-foreground flex min-h-11 w-full min-w-0 rounded-[10px] border-[2.5px] px-3.5 py-2 text-sm font-semibold shadow-[2px_2px_0px_#111111] transition-[box-shadow,transform,background-color,border-color] duration-150",
        "file:border-ink file:bg-subtle file:text-ink file:mr-3 file:inline-flex file:h-7 file:rounded-md file:border-2 file:px-2.5 file:text-xs file:font-bold",
        "placeholder:font-medium",
        "focus-visible:outline-ink focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:shadow-[0_0_0_5px_var(--lime)]",
        "aria-invalid:border-destructive aria-invalid:bg-coral/15",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55",
        className
      )}
      {...props}
    />
  );
}

export { Input };
