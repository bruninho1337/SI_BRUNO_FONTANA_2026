"use client";

import * as React from "react";

import { uppercaseTextField, uppercaseTextValue } from "@/lib/forms/uppercase-text";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
	({ value, defaultValue, onChange, ...props }, ref) => {
		const uppercase = !props.readOnly && !props.disabled;

		return (
			<textarea
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
	}
);
Textarea.displayName = "Textarea";

export { Textarea };
