"use client";

import * as React from "react";

import { uppercaseTextField, uppercaseTextValue } from "@/lib/forms/uppercase-text";
import { cn } from "@/lib/shared/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, value, defaultValue, onChange, ...props }, ref) => {
    const uppercase =
      (!type || type === "text" || type === "search") &&
      props.inputMode !== "numeric" && props.inputMode !== "decimal" &&
      !props.readOnly && !props.disabled;

    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
        value={uppercase ? uppercaseTextValue(value) : value}
        defaultValue={uppercase ? uppercaseTextValue(defaultValue) : defaultValue}
        onChange={(event) => {
          if (uppercase) uppercaseTextField(event.currentTarget);
          onChange?.(event);
        }}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
