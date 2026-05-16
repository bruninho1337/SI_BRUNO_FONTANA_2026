"use client";

import { useState } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type CategoriaTipo = "PRODUTO" | "SERVICO" | "AMBOS";

type CategoryTypeToggleProps = {
	name: string;
	defaultValue?: CategoriaTipo;
	className?: string;
};

const options: Array<{ value: CategoriaTipo; label: string }> = [
	{ value: "PRODUTO", label: "Produto" },
	{ value: "SERVICO", label: "Servico" },
	{ value: "AMBOS", label: "Ambos" },
];

export function CategoryTypeToggle({
	name,
	defaultValue = "AMBOS",
	className,
}: CategoryTypeToggleProps) {
	const [value, setValue] = useState<CategoriaTipo>(defaultValue);

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<Label className="text-sm text-neutral-800">Tipo:</Label>
			<input type="hidden" name={name} value={value} readOnly />
			<div className="flex flex-wrap gap-3">
				{options.map((option) => (
					<button
						key={option.value}
						type="button"
						onClick={() => setValue(option.value)}
						className={cn(
							"rounded-xl border px-4 py-2 text-sm font-medium transition",
							value === option.value
								? "border-neutral-900 bg-neutral-900 text-white"
								: "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
						)}
					>
						{option.label}
					</button>
				))}
			</div>
		</div>
	);
}
