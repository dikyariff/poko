import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap",
    "rounded-[10px] border-[2.5px] border-ink font-sans text-sm font-bold",
    "transition-[transform,box-shadow,background-color,color,border-color] duration-150 ease-out",
    "select-none touch-manipulation",
    "focus-visible:outline-[3px] focus-visible:outline-ink focus-visible:outline-offset-2 focus-visible:shadow-[0_0_0_5px_var(--lime)]",
    "disabled:pointer-events-none disabled:opacity-55",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        secondary:
          "bg-secondary text-secondary-foreground shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-secondary-hover hover:shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        outline:
          "bg-card text-ink shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-subtle hover:shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        ghost:
          "border-transparent bg-transparent text-ink shadow-none hover:border-ink hover:bg-subtle hover:shadow-brutal-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
        destructive:
          "bg-destructive text-destructive-foreground shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-destructive/90 hover:shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        link: "min-h-0 border-transparent bg-transparent px-1 text-ink underline-offset-4 shadow-none hover:underline",
      },
      size: {
        default: "min-h-11 px-4 py-2.5",
        sm: "min-h-9 rounded-[9px] px-3 py-1.5 text-xs",
        lg: "min-h-12 rounded-[12px] px-6 py-3 text-base",
        icon: "size-11 p-0",
        "icon-sm": "size-9 rounded-[9px] p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  type = "button",
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      type={asChild ? undefined : type}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
