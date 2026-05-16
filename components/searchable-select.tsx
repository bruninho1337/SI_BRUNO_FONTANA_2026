"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/ui/required-label";
import { cn } from "@/lib/utils";

type Option = {
	id: string;
	label: string;
};

type SearchableSelectProps = {
	name: string;
	label: string;
	searchLabel: string;
	searchPlaceholder: string;
	selectPlaceholder: string;
	options: Option[];
	required?: boolean;
	defaultValue?: string;
	className?: string;
};

export function SearchableSelect({
	name,
	label,
	searchLabel,
	searchPlaceholder,
	selectPlaceholder,
	options,
	required = false,
	defaultValue = "",
	className,
}: SearchableSelectProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [selectedId, setSelectedId] = useState(defaultValue);

	const filteredOptions = useMemo(() => {
		const term = search.trim().toLowerCase();

		if (!term) {
			return options;
		}

		return options.filter((option) =>
			option.label.toLowerCase().includes(term)
		);
	}, [options, search]);

	const selectedOption = useMemo(
		() => options.find((option) => option.id === selectedId),
		[options, selectedId]
	);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (!containerRef.current) {
				return;
			}

			if (!containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div ref={containerRef} className={cn("space-y-2", className)}>
			{required ? (
				<RequiredLabel htmlFor={`${name}-trigger`} className="text-sm text-neutral-800">
					{label}:
				</RequiredLabel>
			) : (
				<Label htmlFor={`${name}-trigger`} className="text-sm text-neutral-800">
					{label}:
				</Label>
			)}
			<input name={name} value={selectedId} required={required} type="hidden" readOnly />
			<button
				id={`${name}-trigger`}
				type="button"
				onClick={() => setIsOpen((current) => !current)}
				className="flex h-11 w-full items-center justify-between rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 outline-none transition focus-visible:ring-1 focus-visible:ring-ring"
			>
				<span className={selectedOption ? "text-neutral-900" : "text-neutral-500"}>
					{selectedOption?.label ?? selectPlaceholder}
				</span>
				<span className="text-neutral-500">{isOpen ? "▲" : "▼"}</span>
			</button>

			{isOpen ? (
				<div className="rounded-2xl border border-neutral-300 bg-white p-3 shadow-lg">
					<Label htmlFor={`${name}-search`} className="text-xs text-neutral-500">
						{searchLabel}
					</Label>
					<Input
						id={`${name}-search`}
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder={searchPlaceholder}
						className="mt-2 h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900"
					/>

					<div className="mt-3 max-h-56 overflow-y-auto">
						{filteredOptions.length > 0 ? (
							<div className="flex flex-col gap-2">
								{filteredOptions.map((option) => {
									const isSelected = option.id === selectedId;

									return (
										<button
											key={option.id}
											type="button"
											onClick={() => {
												setSelectedId(option.id);
												setSearch("");
												setIsOpen(false);
											}}
											className={`rounded-xl px-3 py-2 text-left text-sm transition ${
												isSelected
													? "bg-neutral-900 text-white"
													: "text-neutral-700 hover:bg-neutral-100"
											}`}
										>
											{option.label}
										</button>
									);
								})}
							</div>
						) : (
							<p className="px-2 py-3 text-sm text-neutral-500">
								Nenhum resultado encontrado.
							</p>
						)}
					</div>
				</div>
			) : null}
		</div>
	);
}
