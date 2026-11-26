import * as React from "react";

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("border-ink/25 bg-subtle animate-pulse rounded-xl border-2", className)}
      {...props}
    />
  );
}

export { Skeleton };
