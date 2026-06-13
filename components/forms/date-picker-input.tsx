"use client";

import { useRef } from "react";
import { Calendar } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/ui/required-label";

type DatePickerInputProps = {
	id: string;
	name: string;
	label: string;
	defaultValue?: string;
	required?: boolean;
	className?: string;
	inputClassName?: string;
};

export function DatePickerInput({
	id,
	name,
	label,
	defaultValue,
	required = false,
	className = "flex flex-col gap-2",
	inputClassName = "h-11 rounded-xl border border-neutral-300 bg-white px-4 text-neutral-900",
}: DatePickerInputProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const LabelComponent = required ? RequiredLabel : Label;

	function openDatePicker() {
		const input = inputRef.current;

		if (!input) {
			return;
		}

		input.showPicker?.();
		input.focus();
	}

	return (
		<div className={className}>
			<LabelComponent htmlFor={id} className="text-sm text-neutral-800">
				{label}:
			</LabelComponent>
			<div className="flex gap-2">
				<Input
					ref={inputRef}
					id={id}
					name={name}
					type="date"
					required={required}
					defaultValue={defaultValue}
					className={inputClassName}
				/>
				<button
					type="button"
					aria-label={`Selecionar ${label.toLowerCase()}`}
					title="Selecionar data"
					onClick={openDatePicker}
					className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-300 bg-white text-neutral-700 shadow-sm transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
				>
					<Calendar className="h-4 w-4" aria-hidden="true" />
				</button>
			</div>
		</div>
	);
}
