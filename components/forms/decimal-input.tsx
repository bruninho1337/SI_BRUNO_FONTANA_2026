"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";

function formatDecimalInput(value: string) {
	const onlyAllowed = value.replace(/[^\d,.]/g, "");
	const [integerPart = "", ...decimalParts] = onlyAllowed.split(/[,.]/);
	const decimalSeparator = onlyAllowed.match(/[,.]/)?.[0] ?? "";
	const decimalPart = decimalParts.join("").slice(0, 2);

	return decimalSeparator ? `${integerPart}${decimalSeparator}${decimalPart}` : integerPart;
}

export const DecimalInput = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
	({ onInput, ...props }, ref) => {
		return (
			<Input
				ref={ref}
				inputMode="decimal"
				pattern="\d+([,.]\d{1,2})?"
				onInput={(event) => {
					event.currentTarget.value = formatDecimalInput(event.currentTarget.value);
					onInput?.(event);
				}}
				{...props}
			/>
		);
	}
);

DecimalInput.displayName = "DecimalInput";
