"use client";

import * as React from "react";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="bottom-right"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="text-lime size-4 shrink-0 stroke-[2.5]" />,
        info: <InfoIcon className="text-cyan size-4 shrink-0 stroke-[2.5]" />,
        warning: <TriangleAlertIcon className="text-yellow size-4 shrink-0 stroke-[2.5]" />,
        error: <OctagonXIcon className="text-coral size-4 shrink-0 stroke-[2.5]" />,
        loading: <Loader2Icon className="text-lime size-4 shrink-0 animate-spin stroke-[2.5]" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group toast flex w-full max-w-[360px] items-start gap-3 rounded-[12px] border-[2.5px] border-ink bg-ink px-4 py-3.5 text-white shadow-brutal-lime font-sans",
          title: "text-sm font-bold leading-snug text-white",
          description: "mt-0.5 text-xs font-medium leading-relaxed text-zinc-200",
          actionButton:
            "ml-auto shrink-0 cursor-pointer rounded-lg border-2 border-ink bg-primary px-3 py-1.5 text-xs font-bold text-ink transition-transform hover:-translate-y-0.5 focus-visible:outline-white focus-visible:outline-2",
          cancelButton:
            "shrink-0 cursor-pointer rounded-lg border-2 border-white/40 bg-transparent px-3 py-1.5 text-xs font-bold text-white hover:bg-white/15",
          closeButton:
            "border-ink bg-card text-ink hover:bg-coral absolute -top-2 -right-2 inline-flex size-6 cursor-pointer items-center justify-center rounded-full border-2",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
