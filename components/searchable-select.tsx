"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
};

export function SearchableSelect({
	name,
	label,
	searchLabel,
	searchPlaceholder,
	selectPlaceholder,
	options,
	required = false,
}: SearchableSelectProps) {
	const [search, setSearch] = useState("");

	const filteredOptions = useMemo(() => {
		const term = search.trim().toLowerCase();

		if (!term) {
			return options;
		}

		return options.filter((option) =>
			option.label.toLowerCase().includes(term)
		);
	}, [options, search]);

	return (
		<div className="space-y-2">
			<Label className="text-sm text-neutral-800">{label}:</Label>
			<Label className="text-xs text-neutral-500">{searchLabel}</Label>
			<Input
				value={search}
				onChange={(event) => setSearch(event.target.value)}
				placeholder={searchPlaceholder}
				className="h-11 rounded-xl border-neutral-300 bg-white px-4 text-neutral-900"
			/>
			<select
				id={name}
				name={name}
				required={required}
				className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 outline-none focus-visible:ring-1 focus-visible:ring-ring"
			>
				<option value="">{selectPlaceholder}</option>
				{filteredOptions.map((option) => (
					<option key={option.id} value={option.id}>
						{option.label}
					</option>
				))}
			</select>
			<p className="text-xs text-neutral-500">
				{filteredOptions.length} resultado(s) encontrado(s)
			</p>
		</div>
	);
}
