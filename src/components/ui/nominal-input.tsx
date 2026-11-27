"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn, formatNominalInput, parseNominalInput } from "@/lib/utils";

export interface NominalInputProps extends Omit<
  React.ComponentProps<typeof Input>,
  "type" | "value" | "onChange"
> {
  value: string | number | null | undefined;
  onValueChange: (numericValue: number | null, formattedValue: string) => void;
  showPrefix?: boolean;
}

function findCaretPositionAfterDigits(formatted: string, digitCount: number): number {
  if (digitCount <= 0) {
    return 0;
  }

  let seen = 0;
  for (let i = 0; i < formatted.length; i += 1) {
    if (/\d/.test(formatted[i])) {
      seen += 1;
      if (seen === digitCount) {
        return i + 1;
      }
    }
  }

  return formatted.length;
}

export const NominalInput = React.forwardRef<HTMLInputElement, NominalInputProps>(
  function NominalInput(
    { value, onValueChange, showPrefix = false, className, ...props },
    forwardedRef
  ) {
    const internalRef = React.useRef<HTMLInputElement | null>(null);

    const setCombinedRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        internalRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef]
    );

    const displayValue = React.useMemo(() => formatNominalInput(value), [value]);

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      const inputEl = event.target;
      const rawValue = inputEl.value;
      const selectionStart = inputEl.selectionStart ?? rawValue.length;
      const digitsBeforeCaret = rawValue.slice(0, selectionStart).replace(/[^\d]/g, "").length;
      const hadLeadingZeroTrimmed = /^0+\d/.test(rawValue.replace(/[^\d]/g, ""));

      const formatted = formatNominalInput(rawValue);
      const numeric = parseNominalInput(formatted);
      onValueChange(numeric, formatted);

      const adjustedDigitCount = hadLeadingZeroTrimmed
        ? Math.max(1, digitsBeforeCaret - 1)
        : digitsBeforeCaret;
      const nextCaret = findCaretPositionAfterDigits(formatted, adjustedDigitCount);

      requestAnimationFrame(() => {
        const el = internalRef.current;
        if (el && document.activeElement === el) {
          el.setSelectionRange(nextCaret, nextCaret);
        }
      });
    }

    const inputElement = (
      <Input
        ref={setCombinedRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={displayValue}
        onChange={handleChange}
        className={cn("font-mono font-extrabold tabular-nums", showPrefix && "pl-11", className)}
        {...props}
      />
    );

    if (!showPrefix) {
      return inputElement;
    }

    return (
      <div className="relative flex items-center">
        <span className="text-ink-muted pointer-events-none absolute left-3.5 font-mono text-sm font-extrabold">
          Rp
        </span>
        {inputElement}
      </div>
    );
  }
);
