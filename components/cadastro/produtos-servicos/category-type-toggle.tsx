"use client";

import { useEffect, useRef, useState } from "react";

import { RequiredLabel } from "@/components/ui/required-label";
import { cn } from "@/lib/shared/utils";

type CategoriaTipo = "PRODUTO" | "SERVICO" | "AMBOS";

type CategoryTypeToggleProps = {
	name: string;
	defaultValue?: CategoriaTipo;
	className?: string;
};

const options: Array<{ value: CategoriaTipo; label: string }> = [
	{ value: "PRODUTO", label: "Produto" },
	{ value: "SERVICO", label: "Serviço" },
	{ value: "AMBOS", label: "Ambos" },
];

export function CategoryTypeToggle({
	name,
	defaultValue = "AMBOS",
	className,
}: CategoryTypeToggleProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [value, setValue] = useState<CategoriaTipo>(defaultValue);

	useEffect(() => {
		function handleDraftRestored() {
			const nextValue = inputRef.current?.value;

			if (nextValue === "PRODUTO" || nextValue === "SERVICO" || nextValue === "AMBOS") {
				setValue(nextValue);
			}
		}

		window.addEventListener("form-draft-restored", handleDraftRestored);

		return () => {
			window.removeEventListener("form-draft-restored", handleDraftRestored);
		};
	}, []);

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<RequiredLabel className="text-sm text-neutral-800">Tipo:</RequiredLabel>
			<input ref={inputRef} type="hidden" name={name} value={value} readOnly />
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
