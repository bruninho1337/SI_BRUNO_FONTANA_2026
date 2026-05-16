"use client";

import { useState } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ActiveToggleProps = {
	name: string;
	label?: string;
	defaultValue?: "S" | "N";
	className?: string;
};

export function ActiveToggle({
	name,
	label = "Ativo",
	defaultValue = "S",
	className,
}: ActiveToggleProps) {
	const [value, setValue] = useState<"S" | "N">(defaultValue);

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<Label className="text-sm text-neutral-800">{label}:</Label>
			<input type="hidden" name={name} value={value} readOnly />
			<div className="flex gap-3">
				<button
					type="button"
					onClick={() => setValue("S")}
					className={cn(
						"rounded-xl border px-4 py-2 text-sm font-medium transition",
						value === "S"
							? "border-neutral-900 bg-neutral-900 text-white"
							: "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
					)}
				>
					Sim
				</button>
				<button
					type="button"
					onClick={() => setValue("N")}
					className={cn(
						"rounded-xl border px-4 py-2 text-sm font-medium transition",
						value === "N"
							? "border-neutral-900 bg-neutral-900 text-white"
							: "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
					)}
				>
					Não
				</button>
			</div>
		</div>
	);
}
